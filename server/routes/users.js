import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/users/org — org admin: list users in my org
router.get('/org', authenticate, requireRole('org_admin'), (req, res) => {
  if (!req.user.org_id) return res.json([]);

  const users = db.prepare(`
    SELECT id, org_id, name, email, role, role_category, status, joined_date, last_active, learning_streak
    FROM users WHERE org_id = ? ORDER BY name
  `).all(req.user.org_id);

  // Attach badges and completed paths to each user
  const result = users.map((u) => {
    const badges = db.prepare('SELECT badge_name FROM badges WHERE user_id = ?').all(u.id).map(b => b.badge_name);
    const completedPaths = db.prepare('SELECT path_id FROM completed_paths WHERE user_id = ?').all(u.id).map(p => p.path_id);
    return { ...u, badges, completedPaths };
  });

  res.json(result);
});

// GET /api/users/all — super admin: list all users
router.get('/all', authenticate, requireRole('super_admin'), (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.org_id, u.name, u.email, u.role, u.role_category, u.status, u.joined_date, u.last_active, u.learning_streak,
           o.name as org_name
    FROM users u LEFT JOIN organizations o ON u.org_id = o.id
    ORDER BY u.name
  `).all();
  res.json(users);
});

// POST /api/users/invite — org admin: invite a user
router.post('/invite', authenticate, requireRole('org_admin'), (req, res) => {
  const { name, email, roleCategory } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Check if email already exists
  const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email);
  if (existing) {
    return res.status(409).json({ error: 'A user with this email already exists' });
  }

  const userId = `user-${crypto.randomUUID().slice(0, 8)}`;
  const tempPassword = crypto.randomBytes(4).toString('hex');
  const passwordHash = bcrypt.hashSync(tempPassword, 10);

  db.prepare(`
    INSERT INTO users (id, org_id, name, email, password_hash, role, role_category, status)
    VALUES (?, ?, ?, ?, ?, 'user', ?, 'active')
  `).run(userId, req.user.org_id, name, email, passwordHash, roleCategory || 'Sales');

  // In production, send an email with tempPassword here
  res.status(201).json({
    message: `User ${name} created successfully`,
    user: { id: userId, name, email, roleCategory: roleCategory || 'Sales' },
    tempPassword,
  });
});

// PATCH /api/users/:id/status — org admin: activate/deactivate user
router.patch('/:id/status', authenticate, requireRole('org_admin'), (req, res) => {
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ error: 'Status must be "active" or "inactive"' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ? AND org_id = ?').get(req.params.id, req.user.org_id);
  if (!user) return res.status(404).json({ error: 'User not found in your organization' });
  if (user.id === req.user.id) return res.status(400).json({ error: 'Cannot change your own status' });

  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ message: `User ${status === 'active' ? 'activated' : 'deactivated'}` });
});

// GET /api/users/profile — get own profile with full details
router.get('/profile', authenticate, (req, res) => {
  const user = req.user;
  const badges = db.prepare('SELECT badge_name, earned_at FROM badges WHERE user_id = ?').all(user.id);
  const completedPaths = db.prepare('SELECT path_id, completed_at FROM completed_paths WHERE user_id = ?').all(user.id);

  let organization = null;
  if (user.org_id) {
    organization = db.prepare('SELECT id, name, partner_id, tier, status FROM organizations WHERE id = ?').get(user.org_id);
  }

  const { password_hash, ...safeUser } = user;

  res.json({
    ...safeUser,
    badges: badges.map(b => b.badge_name),
    completedPaths: completedPaths.map(p => p.path_id),
    organization,
  });
});

export default router;
