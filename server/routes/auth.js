import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../db.js';
import { generateToken, authenticate } from '../middleware/auth.js';
import { logAudit, getIP } from '../services/audit.js';
import { notifySuperAdmins, awardPoints } from '../services/notifications.js';
import { sendPartnerApprovalEmail } from '../services/email.js';

const router = Router();

// Brute-force protection: check login attempts
function checkLoginAttempts(email, ip) {
  const recentFails = db.prepare(`
    SELECT COUNT(*) as count FROM login_attempts
    WHERE email = ? AND success = 0 AND attempted_at > datetime('now', '-15 minutes')
  `).get(email).count;
  return recentFails < 10; // Allow 10 attempts per 15 minutes
}

function recordLoginAttempt(email, ip, success) {
  db.prepare('INSERT INTO login_attempts (email, ip_address, success) VALUES (?, ?, ?)')
    .run(email, ip, success ? 1 : 0);
  // Cleanup old attempts (older than 24 hours)
  db.prepare("DELETE FROM login_attempts WHERE attempted_at < datetime('now', '-1 day')").run();
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const ip = getIP(req);

  // Check rate limit
  if (!checkLoginAttempts(email, ip)) {
    return res.status(429).json({ error: 'Too many login attempts. Please try again in 15 minutes.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email);
  if (!user) {
    recordLoginAttempt(email, ip, false);
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (user.status !== 'active') {
    recordLoginAttempt(email, ip, false);
    return res.status(403).json({ error: 'Account is inactive' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    recordLoginAttempt(email, ip, false);
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  recordLoginAttempt(email, ip, true);

  // Update last_active
  db.prepare("UPDATE users SET last_active = datetime('now') WHERE id = ?").run(user.id);

  const token = generateToken(user.id);

  // Award first login points (check if user has any points)
  const hasPoints = db.prepare('SELECT COUNT(*) as c FROM user_points WHERE user_id = ?').get(user.id).c;
  if (hasPoints === 0) {
    awardPoints(user.id, 'first_login', 5, 'Welcome to the platform!');
  }

  // Get org info if applicable
  let organization = null;
  if (user.org_id) {
    organization = db.prepare('SELECT * FROM organizations WHERE id = ?').get(user.org_id);
    if (organization) {
      organization.specializations = JSON.parse(organization.specializations || '[]');
    }
  }

  const badges = db.prepare('SELECT badge_name FROM badges WHERE user_id = ?').all(user.id).map(b => b.badge_name);
  const completedPaths = db.prepare('SELECT path_id FROM completed_paths WHERE user_id = ?').all(user.id).map(p => p.path_id);

  // Get profile
  const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(user.id);

  const { password_hash, ...safeUser } = user;

  logAudit({ userId: user.id, action: 'login', ipAddress: ip });

  res.json({
    token,
    user: { ...safeUser, badges, completedPaths, profile },
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
  const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(user.id);

  const { password_hash, ...safeUser } = user;

  res.json({
    user: { ...safeUser, badges, completedPaths, profile },
    organization,
  });
});

// POST /api/auth/register-org — submit a partner application
router.post('/register-org', (req, res) => {
  const { companyName, rcNumber, contactName, contactEmail, phone, country, state, estimatedStaff } = req.body;

  if (!companyName || !rcNumber || !contactName || !contactEmail) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const existing = db.prepare("SELECT id FROM pending_organizations WHERE rc_number = ? AND status = 'pending'").get(rcNumber);
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

  // Notify super admins
  notifySuperAdmins({
    type: 'approval',
    title: 'New Partner Application',
    message: `${companyName} has applied to become a Nobus Cloud Partner.`,
    link: '/admin',
  });

  logAudit({ userId: null, action: 'org_application', entityType: 'pending_org', entityId: id, details: companyName });

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

  logAudit({ userId: req.user.id, action: 'password_changed', ipAddress: getIP(req) });

  res.json({ message: 'Password changed successfully' });
});

// POST /api/auth/forgot-password — request password reset
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = db.prepare('SELECT id, name, email FROM users WHERE LOWER(email) = LOWER(?)').get(email);

  // Always return success (don't reveal if email exists)
  if (!user) {
    return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  }

  // Generate reset token (valid for 1 hour)
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  // Invalidate existing tokens
  db.prepare('UPDATE password_resets SET used = 1 WHERE user_id = ?').run(user.id);

  db.prepare('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)')
    .run(user.id, token, expiresAt);

  // Build reset link
  const resetUrl = `${process.env.PLATFORM_URL || 'http://localhost:3001'}/reset-password?token=${token}`;
  console.log(`[Password Reset] Token for ${email}: ${resetUrl}`);

  logAudit({ userId: user.id, action: 'password_reset_requested' });

  res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
});

// POST /api/auth/reset-password — reset password with token
router.post('/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const reset = db.prepare(`
    SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > datetime('now')
  `).get(token);

  if (!reset) return res.status(400).json({ error: 'Invalid or expired reset token' });

  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, reset.user_id);
  db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(reset.id);

  logAudit({ userId: reset.user_id, action: 'password_reset_completed' });

  res.json({ message: 'Password has been reset. You can now login with your new password.' });
});

export default router;
