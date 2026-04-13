import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { sendPartnerApprovalEmail, sendPartnerRejectionEmail } from '../services/email.js';

const router = Router();

// GET /api/organizations — super admin: list all orgs
router.get('/', authenticate, requireRole('super_admin'), (req, res) => {
  const orgs = db.prepare('SELECT * FROM organizations ORDER BY created_at DESC').all();
  const result = orgs.map((org) => {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE org_id = ?').get(org.id).count;
    const trainedCounts = getTrainedCounts(org.id);
    return {
      ...org,
      specializations: JSON.parse(org.specializations || '[]'),
      totalUsers: userCount,
      trainedCounts,
    };
  });
  res.json(result);
});

// GET /api/organizations/mine — org admin: get own org
router.get('/mine', authenticate, requireRole('org_admin'), (req, res) => {
  if (!req.user.org_id) return res.status(404).json({ error: 'No organization found' });

  const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(req.user.org_id);
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE org_id = ?').get(org.id).count;
  const trainedCounts = getTrainedCounts(org.id);

  res.json({
    ...org,
    specializations: JSON.parse(org.specializations || '[]'),
    totalUsers: userCount,
    trainedCounts,
  });
});

// GET /api/organizations/pending — super admin: list pending applications
router.get('/pending', authenticate, requireRole('super_admin'), (req, res) => {
  const pending = db.prepare('SELECT * FROM pending_organizations ORDER BY submitted_date DESC').all();
  res.json(pending);
});

// POST /api/organizations/approve/:id — super admin: approve an application
router.post('/approve/:id', authenticate, requireRole('super_admin'), (req, res) => {
  const pending = db.prepare('SELECT * FROM pending_organizations WHERE id = ?').get(req.params.id);
  if (!pending) return res.status(404).json({ error: 'Application not found' });
  if (pending.status !== 'pending') return res.status(400).json({ error: 'Application already processed' });

  const orgId = `org-${crypto.randomUUID().slice(0, 8)}`;
  const partnerId = `NBS-NG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString().split('T')[0];

  // Create the organization
  db.prepare(`
    INSERT INTO organizations (id, name, partner_id, rc_number, country, state, phone, tier, status, enrollment_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Registered', 'active', ?)
  `).run(orgId, pending.name, partnerId, pending.rc_number, pending.country, pending.state, pending.phone, now);

  // Create org admin account from the contact
  const userId = `user-${crypto.randomUUID().slice(0, 8)}`;
  const tempPassword = crypto.randomBytes(4).toString('hex');
  const passwordHash = bcrypt.hashSync(tempPassword, 10);

  db.prepare(`
    INSERT INTO users (id, org_id, name, email, password_hash, role, role_category, status)
    VALUES (?, ?, ?, ?, ?, 'org_admin', 'Sales', 'active')
  `).run(userId, orgId, pending.contact_name, pending.contact_email, passwordHash);

  // Update pending status
  db.prepare(`
    UPDATE pending_organizations SET status = 'approved', reviewed_by = ?, reviewed_at = datetime('now') WHERE id = ?
  `).run(req.user.id, pending.id);

  // Send onboarding email (non-blocking — don't fail approval if email fails)
  sendPartnerApprovalEmail({
    contactName: pending.contact_name,
    contactEmail: pending.contact_email,
    companyName: pending.name,
    partnerId,
    tempPassword,
  }).catch(err => console.error('[Approve] Email error:', err.message));

  res.json({
    message: 'Organization approved',
    organization: { id: orgId, partnerId, name: pending.name },
    adminAccount: { email: pending.contact_email, tempPassword },
  });
});

// POST /api/organizations/reject/:id
router.post('/reject/:id', authenticate, requireRole('super_admin'), (req, res) => {
  const pending = db.prepare('SELECT * FROM pending_organizations WHERE id = ?').get(req.params.id);
  if (!pending) return res.status(404).json({ error: 'Application not found' });
  if (pending.status !== 'pending') return res.status(400).json({ error: 'Application already processed' });

  db.prepare(`
    UPDATE pending_organizations SET status = 'rejected', reviewed_by = ?, reviewed_at = datetime('now') WHERE id = ?
  `).run(req.user.id, pending.id);

  // Send rejection email (non-blocking)
  sendPartnerRejectionEmail({
    contactName: pending.contact_name,
    contactEmail: pending.contact_email,
    companyName: pending.name,
  }).catch(err => console.error('[Reject] Email error:', err.message));

  res.json({ message: 'Application rejected' });
});

// Helper: count trained users per role category for an org
function getTrainedCounts(orgId) {
  const rows = db.prepare(`
    SELECT u.role_category, COUNT(DISTINCT u.id) as count
    FROM users u
    WHERE u.org_id = ? AND u.status = 'active' AND u.role_category IS NOT NULL
    AND EXISTS (SELECT 1 FROM completed_paths cp WHERE cp.user_id = u.id)
    GROUP BY u.role_category
  `).all(orgId);

  const counts = { Sales: 0, Presales: 0, Technical: 0 };
  for (const row of rows) {
    if (row.role_category in counts) counts[row.role_category] = row.count;
  }
  return counts;
}

export default router;
