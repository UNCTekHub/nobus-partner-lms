import { Router } from 'express';
import db from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { createNotification, notifySuperAdmins } from '../services/notifications.js';

const router = Router();

const CATEGORIES = ['General', 'Deal Support', 'Technical', 'Billing / MDF', 'Enablement', 'Account'];
const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'];
// First-response SLA target in hours by priority
const SLA_HOURS = { Urgent: 4, High: 8, Normal: 24, Low: 48 };

function slaFor(ticket) {
  const target = SLA_HOURS[ticket.priority] || 24;
  if (ticket.first_response_at) return { targetHours: target, responded: true, breached: false };
  const ageH = (Date.now() - new Date((ticket.created_at || '') + 'Z').getTime()) / 3600000;
  return { targetHours: target, responded: false, breached: ageH > target, hoursOpen: Math.max(0, Math.round(ageH)) };
}

// GET /api/support/meta - categories, priorities, and the org's partner manager
router.get('/meta', authenticate, (req, res) => {
  let manager = null;
  if (req.user.org_id) {
    const org = db.prepare('SELECT partner_manager_name, partner_manager_email FROM organizations WHERE id = ?').get(req.user.org_id);
    if (org && (org.partner_manager_name || org.partner_manager_email)) {
      manager = { name: org.partner_manager_name, email: org.partner_manager_email };
    }
  }
  res.json({ categories: CATEGORIES, priorities: PRIORITIES, partnerManager: manager });
});

// GET /api/support - list tickets (own org / super admin all)
router.get('/', authenticate, (req, res) => {
  const base = `
    SELECT t.*, u.name AS created_by_name, o.name AS org_name,
      (SELECT COUNT(*) FROM ticket_replies WHERE ticket_id = t.id) AS reply_count
    FROM support_tickets t JOIN users u ON t.created_by = u.id
    LEFT JOIN organizations o ON t.org_id = o.id
  `;
  let rows;
  if (req.user.role === 'super_admin') {
    const { status } = req.query;
    rows = status
      ? db.prepare(base + ' WHERE t.status = ? ORDER BY t.updated_at DESC LIMIT 500').all(status)
      : db.prepare(base + ' ORDER BY t.updated_at DESC LIMIT 500').all();
  } else if (req.user.org_id) {
    rows = db.prepare(base + ' WHERE t.org_id = ? ORDER BY t.updated_at DESC').all(req.user.org_id);
  } else {
    rows = db.prepare(base + ' WHERE t.created_by = ? ORDER BY t.updated_at DESC').all(req.user.id);
  }
  res.json(rows.map((t) => ({ ...t, sla: slaFor(t) })));
});

// GET /api/support/:id - ticket detail with replies
router.get('/:id', authenticate, (req, res) => {
  const t = db.prepare(`
    SELECT t.*, u.name AS created_by_name, o.name AS org_name
    FROM support_tickets t JOIN users u ON t.created_by = u.id
    LEFT JOIN organizations o ON t.org_id = o.id WHERE t.id = ?
  `).get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Ticket not found' });
  if (req.user.role !== 'super_admin' && t.org_id !== req.user.org_id && t.created_by !== req.user.id) {
    return res.status(403).json({ error: 'Not your ticket' });
  }
  const replies = db.prepare(`
    SELECT r.*, u.name AS author_name FROM ticket_replies r JOIN users u ON r.user_id = u.id
    WHERE r.ticket_id = ? ORDER BY r.created_at ASC
  `).all(req.params.id);
  res.json({ ...t, sla: slaFor(t), replies });
});

// POST /api/support - open a ticket
router.post('/', authenticate, (req, res) => {
  const { subject, category, priority, body } = req.body;
  if (!subject || !body) return res.status(400).json({ error: 'Subject and description are required' });
  const cat = CATEGORIES.includes(category) ? category : 'General';
  const pri = PRIORITIES.includes(priority) ? priority : 'Normal';
  const result = db.prepare(`
    INSERT INTO support_tickets (org_id, created_by, subject, category, priority, body)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.user.org_id || null, req.user.id, subject, cat, pri, body);
  notifySuperAdmins({ type: 'support', title: `New ${pri} ticket`, message: `${req.user.name}: ${subject}`, link: '/ncs-console' });
  res.status(201).json({ id: result.lastInsertRowid, message: 'Support ticket opened' });
});

// POST /api/support/:id/reply
router.post('/:id/reply', authenticate, (req, res) => {
  const { body } = req.body;
  if (!body) return res.status(400).json({ error: 'Reply body is required' });
  const t = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Ticket not found' });
  const isStaff = req.user.role === 'super_admin';
  if (!isStaff && t.org_id !== req.user.org_id && t.created_by !== req.user.id) {
    return res.status(403).json({ error: 'Not your ticket' });
  }
  db.prepare('INSERT INTO ticket_replies (ticket_id, user_id, body, is_staff) VALUES (?, ?, ?, ?)')
    .run(req.params.id, req.user.id, body, isStaff ? 1 : 0);

  const patch = { updated_at: true };
  // Record first staff response for SLA; reopen/track status
  if (isStaff && !t.first_response_at) {
    db.prepare("UPDATE support_tickets SET first_response_at = datetime('now'), status = 'pending', updated_at = datetime('now') WHERE id = ?").run(req.params.id);
    createNotification({ userId: t.created_by, type: 'support', title: 'Support replied', message: `Nobus support replied to "${t.subject}"`, link: '/support' });
  } else {
    db.prepare("UPDATE support_tickets SET updated_at = datetime('now') WHERE id = ?").run(req.params.id);
    if (isStaff) createNotification({ userId: t.created_by, type: 'support', title: 'Support replied', message: `Nobus support replied to "${t.subject}"`, link: '/support' });
  }
  void patch;
  res.status(201).json({ message: 'Reply posted' });
});

// PATCH /api/support/:id/status - open | pending | resolved
router.patch('/:id/status', authenticate, (req, res) => {
  const { status } = req.body;
  if (!['open', 'pending', 'resolved'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const t = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Ticket not found' });
  if (req.user.role !== 'super_admin' && t.org_id !== req.user.org_id && t.created_by !== req.user.id) {
    return res.status(403).json({ error: 'Not your ticket' });
  }
  const resolvedAt = status === 'resolved' ? "datetime('now')" : 'NULL';
  db.prepare(`UPDATE support_tickets SET status = ?, resolved_at = ${resolvedAt}, updated_at = datetime('now') WHERE id = ?`).run(status, req.params.id);
  res.json({ message: `Ticket ${status}` });
});

// PATCH /api/support/manager/:orgId - super admin sets the org's partner manager
router.patch('/manager/:orgId', authenticate, requireRole('super_admin'), (req, res) => {
  const { name, email } = req.body;
  const org = db.prepare('SELECT id FROM organizations WHERE id = ?').get(req.params.orgId);
  if (!org) return res.status(404).json({ error: 'Organization not found' });
  db.prepare("UPDATE organizations SET partner_manager_name = ?, partner_manager_email = ?, updated_at = datetime('now') WHERE id = ?")
    .run(name || null, email || null, req.params.orgId);
  res.json({ message: 'Partner manager updated' });
});

export default router;
