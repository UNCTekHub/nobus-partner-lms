import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { createNotification, awardPoints } from '../services/notifications.js';

const router = Router();

// GET /api/users/org — org admin: list users in my org
router.get('/org', authenticate, requireRole('org_admin'), (req, res) => {
  if (!req.user.org_id) return res.json([]);

  const users = db.prepare(`
    SELECT id, org_id, name, email, role, role_category, status, joined_date, last_active, learning_streak
    FROM users WHERE org_id = ? ORDER BY name
  `).all(req.user.org_id);

  const result = users.map((u) => {
    const badges = db.prepare('SELECT badge_name FROM badges WHERE user_id = ?').all(u.id).map(b => b.badge_name);
    const completedPaths = db.prepare('SELECT path_id FROM completed_paths WHERE user_id = ?').all(u.id).map(p => p.path_id);
    const totalPoints = db.prepare('SELECT COALESCE(SUM(points), 0) as total FROM user_points WHERE user_id = ?').get(u.id).total;
    return { ...u, badges, completedPaths, totalPoints };
  });

  res.json(result);
});

// GET /api/users/all — super admin: list all users
router.get('/all', authenticate, requireRole('super_admin'), (req, res) => {
  const { search, role, status, orgId } = req.query;
  let sql = `
    SELECT u.id, u.org_id, u.name, u.email, u.role, u.role_category, u.status, u.joined_date, u.last_active, u.learning_streak,
           o.name as org_name
    FROM users u LEFT JOIN organizations o ON u.org_id = o.id
  `;
  const conditions = [];
  const params = [];

  if (search) { conditions.push('(u.name LIKE ? OR u.email LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
  if (role) { conditions.push('u.role = ?'); params.push(role); }
  if (status) { conditions.push('u.status = ?'); params.push(status); }
  if (orgId) { conditions.push('u.org_id = ?'); params.push(orgId); }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY u.name';

  const users = db.prepare(sql).all(...params);
  res.json(users);
});

// POST /api/users/invite — org admin: invite a user
router.post('/invite', authenticate, requireRole('org_admin'), (req, res) => {
  const { name, email, roleCategory } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

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

  // Notify the new user
  createNotification({
    userId, type: 'welcome',
    title: 'Welcome to Nobus Cloud LMS!',
    message: 'Your account has been created. Start exploring your learning paths!',
    link: '/catalog',
  });

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
  const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(user.id);
  const totalPoints = db.prepare('SELECT COALESCE(SUM(points), 0) as total FROM user_points WHERE user_id = ?').get(user.id).total;

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
    profile,
    totalPoints,
  });
});

// PUT /api/users/profile — update own profile
router.put('/profile', authenticate, (req, res) => {
  const { name, phone, jobTitle, bio, timezone, language } = req.body;

  // Update name on users table
  if (name) {
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, req.user.id);
  }

  // Upsert profile
  db.prepare(`
    INSERT INTO user_profiles (user_id, phone, job_title, bio, timezone, language, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      phone = COALESCE(?, phone),
      job_title = COALESCE(?, job_title),
      bio = COALESCE(?, bio),
      timezone = COALESCE(?, timezone),
      language = COALESCE(?, language),
      updated_at = datetime('now')
  `).run(
    req.user.id, phone || null, jobTitle || null, bio || null, timezone || 'Africa/Lagos', language || 'en',
    phone, jobTitle, bio, timezone, language
  );

  res.json({ message: 'Profile updated' });
});

export default router;
