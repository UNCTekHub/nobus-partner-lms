import { Router } from 'express';
import db from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { logAudit, getIP } from '../services/audit.js';

const router = Router();

// ===================== Marketing materials =====================

// GET /api/resources/marketing — filterable list
router.get('/marketing', authenticate, (req, res) => {
  const { category, q } = req.query;
  let sql = 'SELECT * FROM marketing_assets WHERE active = 1';
  const params = [];
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (q) { sql += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)'; params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  sql += ' ORDER BY created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

// POST /api/resources/marketing/:id/download — count a download, return the URL
router.post('/marketing/:id/download', authenticate, (req, res) => {
  const asset = db.prepare('SELECT * FROM marketing_assets WHERE id = ? AND active = 1').get(req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  db.prepare('UPDATE marketing_assets SET downloads = downloads + 1 WHERE id = ?').run(req.params.id);
  res.json({ url: asset.file_url });
});

// POST /api/resources/marketing — add asset (super admin)
router.post('/marketing', authenticate, requireRole('super_admin'), (req, res) => {
  const { title, description, category, fileUrl, fileType, tags } = req.body;
  if (!title || !category || !fileUrl) return res.status(400).json({ error: 'Title, category and file URL are required' });
  const result = db.prepare(`
    INSERT INTO marketing_assets (title, description, category, file_url, file_type, tags, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(title, description || null, category, fileUrl, fileType || null, JSON.stringify(tags || []), req.user.id);
  logAudit({ userId: req.user.id, action: 'marketing_asset_created', entityType: 'marketing_asset', entityId: String(result.lastInsertRowid), details: title, ipAddress: getIP(req) });
  res.status(201).json({ id: result.lastInsertRowid, message: 'Asset added' });
});

// PATCH /api/resources/marketing/:id — edit / deactivate (super admin)
router.patch('/marketing/:id', authenticate, requireRole('super_admin'), (req, res) => {
  const asset = db.prepare('SELECT id FROM marketing_assets WHERE id = ?').get(req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  const { title, description, category, fileUrl, fileType, tags, active } = req.body;
  db.prepare(`
    UPDATE marketing_assets SET
      title = COALESCE(?, title), description = COALESCE(?, description),
      category = COALESCE(?, category), file_url = COALESCE(?, file_url),
      file_type = COALESCE(?, file_type), tags = COALESCE(?, tags),
      active = COALESCE(?, active), updated_at = datetime('now')
    WHERE id = ?
  `).run(
    title ?? null, description ?? null, category ?? null, fileUrl ?? null, fileType ?? null,
    tags ? JSON.stringify(tags) : null, active ?? null, req.params.id
  );
  res.json({ message: 'Asset updated' });
});

// ===================== Content hub =====================

// GET /api/resources/content — filterable list (without body, for the grid)
router.get('/content', authenticate, (req, res) => {
  const { type, q } = req.query;
  let sql = `SELECT id, title, type, summary, file_url, tags, views, created_at FROM content_items WHERE active = 1`;
  const params = [];
  if (type) { sql += ' AND type = ?'; params.push(type); }
  if (q) { sql += ' AND (title LIKE ? OR summary LIKE ? OR tags LIKE ?)'; params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  sql += ' ORDER BY created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

// GET /api/resources/content/:id — full item, increments views
router.get('/content/:id', authenticate, (req, res) => {
  const item = db.prepare('SELECT * FROM content_items WHERE id = ? AND active = 1').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Content not found' });
  db.prepare('UPDATE content_items SET views = views + 1 WHERE id = ?').run(req.params.id);
  res.json({ ...item, views: item.views + 1 });
});

// POST /api/resources/content — add content (super admin)
router.post('/content', authenticate, requireRole('super_admin'), (req, res) => {
  const { title, type, summary, body, fileUrl, tags } = req.body;
  if (!title || !type) return res.status(400).json({ error: 'Title and type are required' });
  const result = db.prepare(`
    INSERT INTO content_items (title, type, summary, body, file_url, tags, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(title, type, summary || null, body || null, fileUrl || null, JSON.stringify(tags || []), req.user.id);
  logAudit({ userId: req.user.id, action: 'content_created', entityType: 'content_item', entityId: String(result.lastInsertRowid), details: title, ipAddress: getIP(req) });
  res.status(201).json({ id: result.lastInsertRowid, message: 'Content published' });
});

// PATCH /api/resources/content/:id — edit / deactivate (super admin)
router.patch('/content/:id', authenticate, requireRole('super_admin'), (req, res) => {
  const item = db.prepare('SELECT id FROM content_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Content not found' });
  const { title, type, summary, body, fileUrl, tags, active } = req.body;
  db.prepare(`
    UPDATE content_items SET
      title = COALESCE(?, title), type = COALESCE(?, type), summary = COALESCE(?, summary),
      body = COALESCE(?, body), file_url = COALESCE(?, file_url), tags = COALESCE(?, tags),
      active = COALESCE(?, active), updated_at = datetime('now')
    WHERE id = ?
  `).run(
    title ?? null, type ?? null, summary ?? null, body ?? null, fileUrl ?? null,
    tags ? JSON.stringify(tags) : null, active ?? null, req.params.id
  );
  res.json({ message: 'Content updated' });
});

export default router;
