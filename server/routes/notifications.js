import { Router } from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { EMAIL_CATEGORIES } from '../services/notifications.js';
import { emailConfigured } from '../services/email.js';

const router = Router();

// GET /api/notifications/preferences - email categories + this user's settings
router.get('/preferences', authenticate, (req, res) => {
  const rows = db.prepare('SELECT category, email_enabled FROM notification_preferences WHERE user_id = ?').all(req.user.id);
  const set = Object.fromEntries(rows.map((r) => [r.category, !!r.email_enabled]));
  res.json({
    emailConfigured: emailConfigured(),
    categories: EMAIL_CATEGORIES.map((c) => ({ ...c, enabled: c.key in set ? set[c.key] : c.default })),
  });
});

// PUT /api/notifications/preferences - update one category's email setting
router.put('/preferences', authenticate, (req, res) => {
  const { category, enabled } = req.body;
  if (!EMAIL_CATEGORIES.some((c) => c.key === category)) return res.status(400).json({ error: 'Unknown category' });
  db.prepare(`
    INSERT INTO notification_preferences (user_id, category, email_enabled, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, category) DO UPDATE SET email_enabled = excluded.email_enabled, updated_at = datetime('now')
  `).run(req.user.id, category, enabled ? 1 : 0);
  res.json({ message: 'Preference updated' });
});

// GET /api/notifications - get user's notifications
router.get('/', authenticate, (req, res) => {
  const notifications = db.prepare(`
    SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
  `).all(req.user.id);
  const unreadCount = db.prepare(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0'
  ).get(req.user.id).count;
  res.json({ notifications, unreadCount });
});

// PATCH /api/notifications/:id/read - mark as read
router.patch('/:id/read', authenticate, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id);
  res.json({ message: 'Marked as read' });
});

// POST /api/notifications/read-all - mark all as read
router.post('/read-all', authenticate, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0')
    .run(req.user.id);
  res.json({ message: 'All marked as read' });
});

export default router;
