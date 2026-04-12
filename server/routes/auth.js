import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../db.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  if (user.status !== 'active') return res.status(403).json({ error: 'Account is inactive' });

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

  // Update last_active
  db.prepare('UPDATE users SET last_active = datetime("now") WHERE id = ?').run(user.id);

  const token = generateToken(user.id);

  // Get org info if applicable
  let organization = null;
  if (user.org_id) {
    organization = db.prepare('SELECT * FROM organizations WHERE id = ?').get(user.org_id);
    if (organization) {
      organization.specializations = JSON.parse(organization.specializations || '[]');
    }
  }

  // Get badges and completed paths
  const badges = db.prepare('SELECT badge_name FROM badges WHERE user_id = ?').all(user.id).map(b => b.badge_name);
  const completedPaths = db.prepare('SELECT path_id FROM completed_paths WHERE user_id = ?').all(user.id).map(p => p.path_id);

  const { password_hash, ...safeUser } = user;

  res.json({
    token,
    user: { ...safeUser, badges, completedPaths },
    organization,
  });
});

// GET /api/auth/me — get current user from token
router.get('/me', authenticate, (req, res) => {
  const user = req.user;

  let organization = null;
  if (user.org_id) {
    organization = db.prepare('SELECT * FROM organizations WHERE id = ?').get(user.org_id);
    if (organization) {
      organization.specializations = JSON.parse(organization.specializations || '[]');
    }
  }

  const badges = db.prepare('SELECT badge_name FROM badges WHERE user_id = ?').all(user.id).map(b => b.badge_name);
  const completedPaths = db.prepare('SELECT path_id FROM completed_paths WHERE user_id = ?').all(user.id).map(p => p.path_id);

  const { password_hash, ...safeUser } = user;

  res.json({
    user: { ...safeUser, badges, completedPaths },
    organization,
  });
});

// POST /api/auth/register-org — submit a partner application
router.post('/register-org', (req, res) => {
  const { companyName, rcNumber, contactName, contactEmail, phone, country, state, estimatedStaff } = req.body;

  if (!companyName || !rcNumber || !contactName || !contactEmail) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  // Check for duplicate RC number
  const existing = db.prepare('SELECT id FROM pending_organizations WHERE rc_number = ? AND status = "pending"').get(rcNumber);
  if (existing) {
    return res.status(409).json({ error: 'An application with this RC number is already pending' });
  }

  const existingOrg = db.prepare('SELECT id FROM organizations WHERE rc_number = ?').get(rcNumber);
  if (existingOrg) {
    return res.status(409).json({ error: 'An organization with this RC number is already registered' });
  }

  const id = `org-pending-${crypto.randomUUID().slice(0, 8)}`;

  db.prepare(`
    INSERT INTO pending_organizations (id, name, rc_number, contact_name, contact_email, phone, country, state, estimated_staff)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, companyName, rcNumber, contactName, contactEmail, phone || null, country || 'Nigeria', state || null, estimatedStaff || 1);

  res.status(201).json({ message: 'Application submitted successfully', id });
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const valid = bcrypt.compareSync(currentPassword, req.user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.id);

  res.json({ message: 'Password changed successfully' });
});

export default router;
