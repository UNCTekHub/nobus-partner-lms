import { Router } from 'express';
import db from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { createNotification, notifySuperAdmins, awardPoints } from '../services/notifications.js';
import { logAudit, getIP } from '../services/audit.js';

const router = Router();

// Active Protection model: a registered deal stays protected for as long as the
// partner keeps the account engaged (delivering value). There is no fixed expiry.
// If a partner goes silent past this dormancy window, the deal is flagged
// "Review Needed" (a soft, at-risk state) so it can be re-engaged or released.
const DORMANCY_DAYS = 120;

function normalizeCustomer(name) {
  return (name || '').toLowerCase().replace(/\s+/g, ' ').replace(/(ltd|limited|plc|inc|llc)\.?$/i, '').trim();
}

// Derive the live protection state of an approved deal from its last engagement.
// Falls back to review/approval timestamps for deals created before this model.
function withProtection(deal) {
  if (!deal || deal.status !== 'approved') return deal;
  const baseline = deal.last_activity_at || deal.reviewed_at || deal.updated_at || deal.created_at;
  const ageMs = Date.now() - new Date((baseline || '') + 'Z').getTime();
  const daysInactive = Number.isFinite(ageMs) ? Math.max(0, Math.floor(ageMs / 86400000)) : 0;
  return {
    ...deal,
    protection_state: daysInactive >= DORMANCY_DAYS ? 'review' : 'active',
    days_inactive: daysInactive,
    dormancy_days: DORMANCY_DAYS,
    last_activity: baseline,
  };
}

// GET /api/deals - own org's deals (super admin sees all)
router.get('/', authenticate, (req, res) => {
  const base = `
    SELECT d.*, o.name as org_name, u.name as submitted_by_name,
      q.title as quote_title, q.monthly_total as quote_monthly_total
    FROM deals d JOIN organizations o ON d.org_id = o.id JOIN users u ON d.submitted_by = u.id
    LEFT JOIN quotes q ON d.quote_id = q.id
  `;
  if (req.user.role === 'super_admin') {
    const { status } = req.query;
    let sql = base;
    const params = [];
    if (status) { sql += ' WHERE d.status = ?'; params.push(status); }
    sql += ' ORDER BY d.created_at DESC LIMIT 500';
    return res.json(db.prepare(sql).all(...params).map(withProtection));
  }
  if (!req.user.org_id) return res.json([]);
  res.json(db.prepare(base + ' WHERE d.org_id = ? ORDER BY d.created_at DESC').all(req.user.org_id).map(withProtection));
});

// POST /api/deals - register a deal
router.post('/', authenticate, (req, res) => {
  if (!req.user.org_id) return res.status(403).json({ error: 'Only partner users can register deals' });
  const { customerName, customerEmail, customerIndustry, opportunityName, description, services, estValue, expectedCloseDate, quoteId } = req.body;
  if (!customerName || !opportunityName) {
    return res.status(400).json({ error: 'Customer name and opportunity name are required' });
  }

  // A quote can only be attached to a deal by its own organization
  if (quoteId) {
    const quote = db.prepare('SELECT org_id FROM quotes WHERE id = ?').get(quoteId);
    if (!quote || quote.org_id !== req.user.org_id) {
      return res.status(400).json({ error: 'Invalid quote' });
    }
  }

  // Duplicate detection: same customer already protected by an active registration
  const normalized = normalizeCustomer(customerName);
  const candidates = db.prepare(`
    SELECT d.id, d.org_id, d.customer_name, o.name as org_name FROM deals d
    JOIN organizations o ON d.org_id = o.id
    WHERE d.status IN ('pending', 'approved')
  `).all();
  const duplicate = candidates.find((c) => normalizeCustomer(c.customer_name) === normalized);

  const result = db.prepare(`
    INSERT INTO deals (org_id, submitted_by, customer_name, customer_email, customer_industry,
      opportunity_name, description, services, est_value, expected_close_date, status, duplicate_of, quote_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `).run(
    req.user.org_id, req.user.id, customerName, customerEmail || null, customerIndustry || null,
    opportunityName, description || null, JSON.stringify(services || []),
    estValue || 0, expectedCloseDate || null, duplicate ? duplicate.id : null, quoteId || null
  );

  notifySuperAdmins({
    type: 'deal',
    title: 'New deal registration',
    message: `${req.user.name} registered "${opportunityName}" for customer ${customerName}${duplicate ? ' (possible duplicate)' : ''}`,
    link: '/deals',
  });
  awardPoints(req.user.id, 'deal_registered', 10, `Registered deal: ${opportunityName}`);
  logAudit({ userId: req.user.id, action: 'deal_registered', entityType: 'deal', entityId: String(result.lastInsertRowid), details: opportunityName, ipAddress: getIP(req) });

  res.status(201).json({
    id: result.lastInsertRowid,
    duplicateWarning: duplicate ? `Possible conflict: ${duplicate.customer_name} is already registered by ${duplicate.org_id === req.user.org_id ? 'your organization' : 'another partner'}` : null,
    message: 'Deal submitted for review',
  });
});

// PATCH /api/deals/:id/approve - super admin approval
router.patch('/:id/approve', authenticate, requireRole('super_admin'), (req, res) => {
  const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  if (deal.status !== 'pending') return res.status(400).json({ error: 'Only pending deals can be approved' });

  db.prepare(`
    UPDATE deals SET status = 'approved', reviewed_by = ?, reviewed_at = datetime('now'),
      protection_expires = NULL, last_activity_at = datetime('now'),
      last_activity_note = 'Deal approved', updated_at = datetime('now')
    WHERE id = ?
  `).run(req.user.id, req.params.id);

  createNotification({
    userId: deal.submitted_by, type: 'deal',
    title: 'Deal approved and protected',
    message: `Your deal "${deal.opportunity_name}" is approved. It stays protected for as long as you keep the account active.`,
    link: '/deals',
  });
  logAudit({ userId: req.user.id, action: 'deal_approved', entityType: 'deal', entityId: String(deal.id), details: deal.opportunity_name, ipAddress: getIP(req) });
  res.json({ message: 'Deal approved' });
});

// PATCH /api/deals/:id/reaffirm - partner logs a value update to keep protection active
router.patch('/:id/reaffirm', authenticate, (req, res) => {
  const { note } = req.body;
  const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  if (req.user.role !== 'super_admin' && deal.org_id !== req.user.org_id) {
    return res.status(403).json({ error: 'Not your deal' });
  }
  if (deal.status !== 'approved') return res.status(400).json({ error: 'Only protected deals can be reaffirmed' });

  db.prepare(`
    UPDATE deals SET last_activity_at = datetime('now'),
      last_activity_note = ?, updated_at = datetime('now') WHERE id = ?
  `).run((note || 'Engagement reaffirmed').slice(0, 300), req.params.id);

  awardPoints(req.user.id, 'deal_reaffirmed', 3, `Reaffirmed protection: ${deal.opportunity_name}`);
  logAudit({ userId: req.user.id, action: 'deal_reaffirmed', entityType: 'deal', entityId: String(deal.id), details: note || '', ipAddress: getIP(req) });
  res.json({ message: 'Protection reaffirmed. Your account engagement keeps this deal protected.' });
});

// PATCH /api/deals/:id/reject - super admin rejection
router.patch('/:id/reject', authenticate, requireRole('super_admin'), (req, res) => {
  const { reason } = req.body;
  const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  if (deal.status !== 'pending') return res.status(400).json({ error: 'Only pending deals can be rejected' });

  db.prepare(`
    UPDATE deals SET status = 'rejected', rejection_reason = ?, reviewed_by = ?,
      reviewed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?
  `).run(reason || null, req.user.id, req.params.id);

  createNotification({
    userId: deal.submitted_by, type: 'deal',
    title: 'Deal rejected',
    message: `Your deal "${deal.opportunity_name}" was rejected${reason ? ': ' + reason : '.'}`,
    link: '/deals',
  });
  logAudit({ userId: req.user.id, action: 'deal_rejected', entityType: 'deal', entityId: String(deal.id), details: reason || '', ipAddress: getIP(req) });
  res.json({ message: 'Deal rejected' });
});

// PATCH /api/deals/:id/close - partner marks an approved deal won or lost
router.patch('/:id/close', authenticate, (req, res) => {
  const { outcome } = req.body; // 'won' | 'lost'
  if (!['won', 'lost'].includes(outcome)) return res.status(400).json({ error: 'Outcome must be won or lost' });
  const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  if (req.user.role !== 'super_admin' && deal.org_id !== req.user.org_id) {
    return res.status(403).json({ error: 'Not your deal' });
  }
  if (deal.status !== 'approved') return res.status(400).json({ error: 'Only approved deals can be closed' });

  db.prepare(`UPDATE deals SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(outcome, req.params.id);
  if (outcome === 'won') awardPoints(deal.submitted_by, 'deal_won', 50, `Won deal: ${deal.opportunity_name}`);
  logAudit({ userId: req.user.id, action: `deal_${outcome}`, entityType: 'deal', entityId: String(deal.id), details: deal.opportunity_name, ipAddress: getIP(req) });
  res.json({ message: `Deal marked ${outcome}` });
});

export default router;
