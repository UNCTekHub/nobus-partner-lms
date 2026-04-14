import { Router } from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications — get user's notifications
router.get('/', authenticate, (req, res) => {
  const notifications = db.prepare(`
    SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
  `).all(req.user.id);
  const unreadCount = db.prepare(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0'
  ).get(req.user.id).count;
  res.json({ notifications, unreadCount });
});

// PATCH /api/notifications/:id/read — mark as read
router.patch('/:id/read', authenticate, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id);
  res.json({ message: 'Marked as read' });
});

// POST /api/notifications/read-all — mark all as read
router.post('/read-all', authenticate, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0')
    .run(req.user.id);
  res.json({ message: 'All marked as read' });
});

export default router;
