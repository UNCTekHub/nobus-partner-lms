import { Router } from 'express';
import db from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { awardPoints } from '../services/notifications.js';
import { logAudit, getIP } from '../services/audit.js';

const router = Router();

// Topic rooms, mapped to the services Nobus delivers plus a few essentials.
// 'announcements' is staff-only for posting.
const ROOMS = [
  { id: 'announcements', label: '📣 Announcements', staffOnly: true },
  { id: 'general', label: '💬 General & Introductions' },
  { id: 'compute', label: '🖥 Compute' },
  { id: 'storage', label: '💾 Storage & Backup' },
  { id: 'networking', label: '🌐 Networking' },
  { id: 'security', label: '🛡 Security' },
  { id: 'databases', label: '🗄 Databases' },
  { id: 'containers', label: '📦 Containers' },
  { id: 'sales', label: '💰 Sales & Deals' },
  { id: 'training', label: '🎓 Training & Certification' },
];
const ROOM_IDS = ROOMS.map((r) => r.id);

// House rules partners agree to before participating. Kept here so the API is
// the single source of truth for the text shown and accepted.
const GUIDELINES = [
  'Be professional and respectful. No harassment, discrimination, or personal attacks - toward partners or Nobus staff.',
  'Post in the right room. Keep threads on-topic so knowledge stays easy to find.',
  'Protect confidential information. Never share customer PII, credentials, contract terms, or anything under NDA; sanitise logs and screenshots.',
  "Respect channel integrity. Don't solicit, poach, or discuss the specifics of another partner's registered deals or customers.",
  'Share in good faith. Give accurate, helpful guidance; no misinformation about Nobus services, pricing, or security.',
  'No spam or off-topic promotion. No unrelated advertising, referral links, or recruitment.',
  'Keep it lawful. Follow the Partner Agreement and all applicable laws.',
  "Security first. Don't post working exploits or live-system access; report vulnerabilities privately to Nobus support.",
  'Moderation is final. Nobus staff may pin, close, edit, or remove content and suspend access for violations; pinned posts are authoritative.',
  'Your content, your responsibility. You keep ownership of what you post and grant Nobus and fellow partners a licence to read and reference it in the community.',
];

// GET /api/discussions/meta - rooms, guidelines, and this user's acceptance state
router.get('/meta', authenticate, (req, res) => {
  res.json({ rooms: ROOMS, guidelines: GUIDELINES, accepted: !!req.user.community_accepted_at });
});

// POST /api/discussions/accept - record agreement to the community guidelines
router.post('/accept', authenticate, (req, res) => {
  db.prepare("UPDATE users SET community_accepted_at = datetime('now') WHERE id = ? AND community_accepted_at IS NULL").run(req.user.id);
  res.json({ message: 'Community guidelines accepted' });
});

// GET /api/discussions - list discussions (optional filter by room/course/module)
router.get('/', authenticate, (req, res) => {
  const { course_id, module_id, room } = req.query;
  let sql = `
    SELECT d.*, u.name as author_name, u.role as author_role,
      (SELECT COUNT(*) FROM discussion_replies WHERE discussion_id = d.id) as reply_count
    FROM discussions d JOIN users u ON d.user_id = u.id
  `;
  const params = [];
  const conditions = [];
  if (course_id) { conditions.push('d.course_id = ?'); params.push(course_id); }
  if (module_id) { conditions.push('d.module_id = ?'); params.push(module_id); }
  if (room && ROOM_IDS.includes(room)) { conditions.push('d.room = ?'); params.push(room); }
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
  if (!req.user.community_accepted_at) return res.status(403).json({ error: 'Please accept the community guidelines first' });
  const { title, body, courseId, moduleId } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });
  const room = ROOM_IDS.includes(req.body.room) ? req.body.room : 'general';
  const roomDef = ROOMS.find((r) => r.id === room);
  if (roomDef.staffOnly && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only Nobus staff can post in Announcements' });
  }

  const result = db.prepare(`
    INSERT INTO discussions (user_id, course_id, module_id, title, body, room)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.user.id, courseId || null, moduleId || null, title, body, room);

  awardPoints(req.user.id, 'discussion_created', 5, `Started discussion: ${title}`);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Discussion created' });
});

// POST /api/discussions/:id/reply - add a reply
router.post('/:id/reply', authenticate, (req, res) => {
  if (!req.user.community_accepted_at) return res.status(403).json({ error: 'Please accept the community guidelines first' });
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
