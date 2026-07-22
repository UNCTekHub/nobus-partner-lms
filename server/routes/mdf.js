import { Router } from 'express';
import db from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { createNotification, notifySuperAdmins } from '../services/notifications.js';
import { logAudit, getIP } from '../services/audit.js';

const router = Router();

const ACTIVITY_TYPES = ['Event / Webinar', 'Digital Campaign', 'Content / Collateral', 'Demand Generation', 'Enablement / Training', 'Other'];

// GET /api/mdf - own org's requests (super admin: all)
router.get('/', authenticate, (req, res) => {
  const base = `
    SELECT m.*, o.name AS org_name, u.name AS created_by_name
    FROM mdf_requests m JOIN organizations o ON m.org_id = o.id JOIN users u ON m.created_by = u.id
  `;
  if (req.user.role === 'super_admin') {
    return res.json(db.prepare(base + ' ORDER BY m.created_at DESC LIMIT 500').all());
  }
  if (!req.user.org_id) return res.json([]);
  res.json(db.prepare(base + ' WHERE m.org_id = ? ORDER BY m.created_at DESC').all(req.user.org_id));
});

// GET /api/mdf/meta - activity types + summary balances for the org
router.get('/meta', authenticate, (req, res) => {
  const orgId = req.user.role === 'super_admin' ? (req.query.orgId || req.user.org_id) : req.user.org_id;
  let approved = 0, reimbursed = 0, pending = 0;
  if (orgId) {
    const rows = db.prepare('SELECT status, COALESCE(SUM(amount_approved),0) AS a, COALESCE(SUM(amount_requested),0) AS r FROM mdf_requests WHERE org_id = ? GROUP BY status').all(orgId);
    for (const row of rows) {
      if (row.status === 'reimbursed') reimbursed += row.a;
      else if (['approved', 'proof_submitted'].includes(row.status)) approved += row.a;
      else if (row.status === 'submitted') pending += row.r;
    }
  }
  res.json({ activityTypes: ACTIVITY_TYPES, approvedOutstanding: approved, reimbursed, pendingReview: pending });
});

// POST /api/mdf - submit an MDF request
router.post('/', authenticate, (req, res) => {
  if (!req.user.org_id) return res.status(403).json({ error: 'Only partner users can request MDF' });
  const { title, activityType, description, amountRequested, plannedDate } = req.body;
  if (!title || !amountRequested) return res.status(400).json({ error: 'Title and requested amount are required' });

  const result = db.prepare(`
    INSERT INTO mdf_requests (org_id, created_by, title, activity_type, description, amount_requested, planned_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted')
  `).run(req.user.org_id, req.user.id, title, activityType || 'Other', description || null,
    Math.max(0, Math.round(Number(amountRequested) || 0)), plannedDate || null);

  notifySuperAdmins({ type: 'mdf', title: 'New MDF request', message: `${req.user.name} requested MDF: ${title}`, link: '/ncs-console' });
  logAudit({ userId: req.user.id, action: 'mdf_requested', entityType: 'mdf', entityId: String(result.lastInsertRowid), details: title, ipAddress: getIP(req) });
  res.status(201).json({ id: result.lastInsertRowid, message: 'MDF request submitted for review' });
});

function loadOwned(req, res) {
  const m = db.prepare('SELECT * FROM mdf_requests WHERE id = ?').get(req.params.id);
  if (!m) { res.status(404).json({ error: 'MDF request not found' }); return null; }
  if (req.user.role !== 'super_admin' && m.org_id !== req.user.org_id) { res.status(403).json({ error: 'Not your MDF request' }); return null; }
  return m;
}

// PATCH /api/mdf/:id/approve - super admin approves (optionally a partial amount)
router.patch('/:id/approve', authenticate, requireRole('super_admin'), (req, res) => {
  const m = db.prepare('SELECT * FROM mdf_requests WHERE id = ?').get(req.params.id);
  if (!m) return res.status(404).json({ error: 'MDF request not found' });
  if (m.status !== 'submitted') return res.status(400).json({ error: 'Only submitted requests can be approved' });
  const amount = req.body.amountApproved != null ? Math.round(Number(req.body.amountApproved)) : m.amount_requested;
  db.prepare(`UPDATE mdf_requests SET status='approved', amount_approved=?, decision_notes=?, reviewed_by=?, reviewed_at=datetime('now'), updated_at=datetime('now') WHERE id=?`)
    .run(amount, req.body.decisionNotes || null, req.user.id, req.params.id);
  createNotification({ userId: m.created_by, type: 'mdf', title: 'MDF approved', message: `Your MDF request "${m.title}" was approved for ₦${amount.toLocaleString('en-NG')}. Submit proof of execution once complete.`, link: '/growth' });
  logAudit({ userId: req.user.id, action: 'mdf_approved', entityType: 'mdf', entityId: String(m.id), details: String(amount), ipAddress: getIP(req) });
  res.json({ message: 'MDF request approved' });
});

// PATCH /api/mdf/:id/reject
router.patch('/:id/reject', authenticate, requireRole('super_admin'), (req, res) => {
  const m = db.prepare('SELECT * FROM mdf_requests WHERE id = ?').get(req.params.id);
  if (!m) return res.status(404).json({ error: 'MDF request not found' });
  if (m.status !== 'submitted') return res.status(400).json({ error: 'Only submitted requests can be rejected' });
  db.prepare(`UPDATE mdf_requests SET status='rejected', decision_notes=?, reviewed_by=?, reviewed_at=datetime('now'), updated_at=datetime('now') WHERE id=?`)
    .run(req.body.reason || null, req.user.id, req.params.id);
  createNotification({ userId: m.created_by, type: 'mdf', title: 'MDF rejected', message: `Your MDF request "${m.title}" was not approved${req.body.reason ? ': ' + req.body.reason : '.'}`, link: '/growth' });
  res.json({ message: 'MDF request rejected' });
});

// PATCH /api/mdf/:id/proof - partner submits proof of execution
router.patch('/:id/proof', authenticate, (req, res) => {
  const m = loadOwned(req, res);
  if (!m) return;
  if (m.status !== 'approved') return res.status(400).json({ error: 'Proof can only be submitted for approved requests' });
  const { proofUrl, proofNotes } = req.body;
  if (!proofUrl && !proofNotes) return res.status(400).json({ error: 'Provide a proof link or notes' });
  db.prepare(`UPDATE mdf_requests SET status='proof_submitted', proof_url=?, proof_notes=?, updated_at=datetime('now') WHERE id=?`)
    .run(proofUrl || null, proofNotes || null, req.params.id);
  notifySuperAdmins({ type: 'mdf', title: 'MDF proof submitted', message: `Proof of execution submitted for "${m.title}"`, link: '/ncs-console' });
  res.json({ message: 'Proof of execution submitted' });
});

// PATCH /api/mdf/:id/reimburse - super admin marks reimbursed
router.patch('/:id/reimburse', authenticate, requireRole('super_admin'), (req, res) => {
  const m = db.prepare('SELECT * FROM mdf_requests WHERE id = ?').get(req.params.id);
  if (!m) return res.status(404).json({ error: 'MDF request not found' });
  if (m.status !== 'proof_submitted') return res.status(400).json({ error: 'Only requests with submitted proof can be reimbursed' });
  db.prepare(`UPDATE mdf_requests SET status='reimbursed', reimbursed_at=datetime('now'), updated_at=datetime('now') WHERE id=?`).run(req.params.id);
  createNotification({ userId: m.created_by, type: 'mdf', title: 'MDF reimbursed', message: `Your MDF for "${m.title}" (₦${(m.amount_approved || 0).toLocaleString('en-NG')}) has been reimbursed.`, link: '/growth' });
  logAudit({ userId: req.user.id, action: 'mdf_reimbursed', entityType: 'mdf', entityId: String(m.id), ipAddress: getIP(req) });
  res.json({ message: 'MDF marked reimbursed' });
});

export default router;
