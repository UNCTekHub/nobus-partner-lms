import { Router } from 'express';
import db from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { awardPoints } from '../services/notifications.js';
import { logAudit, getIP } from '../services/audit.js';

const router = Router();

// GET /api/discussions - list discussions (optional filter by course/module)
router.get('/', authenticate, (req, res) => {
  const { course_id, module_id } = req.query;
  let sql = `
    SELECT d.*, u.name as author_name, u.role as author_role,
      (SELECT COUNT(*) FROM discussion_replies WHERE discussion_id = d.id) as reply_count
    FROM discussions d JOIN users u ON d.user_id = u.id
  `;
  const params = [];
  const conditions = [];
  if (course_id) { conditions.push('d.course_id = ?'); params.push(course_id); }
  if (module_id) { conditions.push('d.module_id = ?'); params.push(module_id); }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY d.pinned DESC, d.created_at DESC LIMIT 100';

  res.json(db.prepare(sql).all(...params));
});

// GET /api/discussions/:id - get a discussion with replies
router.get('/:id', authenticate, (req, res) => {
  const discussion = db.prepare(`
    SELECT d.*, u.name as author_name, u.role as author_role
    FROM discussions d JOIN users u ON d.user_id = u.id WHERE d.id = ?
  `).get(req.params.id);
  if (!discussion) return res.status(404).json({ error: 'Discussion not found' });

  const replies = db.prepare(`
    SELECT r.*, u.name as author_name, u.role as author_role
    FROM discussion_replies r JOIN users u ON r.user_id = u.id
    WHERE r.discussion_id = ? ORDER BY r.created_at ASC
  `).all(req.params.id);

  res.json({ ...discussion, replies });
});

// POST /api/discussions - create a new discussion
router.post('/', authenticate, (req, res) => {
  const { title, body, courseId, moduleId } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });

  const result = db.prepare(`
    INSERT INTO discussions (user_id, course_id, module_id, title, body)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.user.id, courseId || null, moduleId || null, title, body);

  awardPoints(req.user.id, 'discussion_created', 5, `Started discussion: ${title}`);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Discussion created' });
});

// POST /api/discussions/:id/reply - add a reply
router.post('/:id/reply', authenticate, (req, res) => {
  const { body } = req.body;
  if (!body) return res.status(400).json({ error: 'Reply body is required' });

  const discussion = db.prepare('SELECT id, closed FROM discussions WHERE id = ?').get(req.params.id);
  if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
  // A closed thread is read-only for members; only Nobus staff may still post.
  if (discussion.closed && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'This discussion is closed to new replies' });
  }

  const result = db.prepare(`
    INSERT INTO discussion_replies (discussion_id, user_id, body)
    VALUES (?, ?, ?)
  `).run(req.params.id, req.user.id, body);

  awardPoints(req.user.id, 'reply_posted', 2, 'Posted a forum reply');
  res.status(201).json({ id: result.lastInsertRowid, message: 'Reply posted' });
});

// PATCH /api/discussions/:id/reply/:replyId/answer - mark reply as answer (discussion author or admin)
router.patch('/:id/reply/:replyId/answer', authenticate, (req, res) => {
  const discussion = db.prepare('SELECT user_id FROM discussions WHERE id = ?').get(req.params.id);
  if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
  if (discussion.user_id !== req.user.id && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only the discussion author or admin can mark answers' });
  }

  db.prepare('UPDATE discussion_replies SET is_answer = 0 WHERE discussion_id = ?').run(req.params.id);
  db.prepare('UPDATE discussion_replies SET is_answer = 1 WHERE id = ? AND discussion_id = ?')
    .run(req.params.replyId, req.params.id);

  res.json({ message: 'Reply marked as answer' });
});

// ---- Moderation (Nobus staff only): the forum is a shared cross-org space ----

// PATCH /api/discussions/:id/pin - pin/unpin a discussion to the top
router.patch('/:id/pin', authenticate, requireRole('super_admin'), (req, res) => {
  const d = db.prepare('SELECT id FROM discussions WHERE id = ?').get(req.params.id);
  if (!d) return res.status(404).json({ error: 'Discussion not found' });
  const pinned = req.body.pinned ? 1 : 0;
  db.prepare("UPDATE discussions SET pinned = ?, updated_at = datetime('now') WHERE id = ?").run(pinned, req.params.id);
  logAudit({ userId: req.user.id, action: pinned ? 'discussion_pinned' : 'discussion_unpinned', entityType: 'discussion', entityId: String(req.params.id), ipAddress: getIP(req) });
  res.json({ message: pinned ? 'Discussion pinned' : 'Discussion unpinned', pinned });
});

// PATCH /api/discussions/:id/close - close/reopen a discussion for replies
router.patch('/:id/close', authenticate, requireRole('super_admin'), (req, res) => {
  const d = db.prepare('SELECT id FROM discussions WHERE id = ?').get(req.params.id);
  if (!d) return res.status(404).json({ error: 'Discussion not found' });
  const closed = req.body.closed ? 1 : 0;
  db.prepare("UPDATE discussions SET closed = ?, updated_at = datetime('now') WHERE id = ?").run(closed, req.params.id);
  logAudit({ userId: req.user.id, action: closed ? 'discussion_closed' : 'discussion_reopened', entityType: 'discussion', entityId: String(req.params.id), ipAddress: getIP(req) });
  res.json({ message: closed ? 'Discussion closed' : 'Discussion reopened', closed });
});

// DELETE /api/discussions/:id - remove a discussion and its replies (spam/abuse)
router.delete('/:id', authenticate, requireRole('super_admin'), (req, res) => {
  const d = db.prepare('SELECT id, title FROM discussions WHERE id = ?').get(req.params.id);
  if (!d) return res.status(404).json({ error: 'Discussion not found' });
  db.prepare('DELETE FROM discussion_replies WHERE discussion_id = ?').run(req.params.id);
  db.prepare('DELETE FROM discussions WHERE id = ?').run(req.params.id);
  logAudit({ userId: req.user.id, action: 'discussion_deleted', entityType: 'discussion', entityId: String(req.params.id), details: d.title, ipAddress: getIP(req) });
  res.json({ message: 'Discussion deleted' });
});

export default router;
