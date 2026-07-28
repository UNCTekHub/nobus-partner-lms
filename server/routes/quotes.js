import { Router } from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { awardPoints } from '../services/notifications.js';
import { streamQuotePdf, streamQuoteXlsx } from '../services/quoteExport.js';
import { buildQuoteLines, quoteTotal } from '../pricing.js';
import { orgDiscountPct } from '../services/tierEngine.js';

const router = Router();

function canAccess(req, quote) {
  return req.user.role === 'super_admin' || quote.org_id === req.user.org_id;
}

// GET /api/quotes - my org's quotes (super admin: all)
router.get('/', authenticate, (req, res) => {
  const base = `
    SELECT q.*, u.name as author_name, o.name as org_name
    FROM quotes q JOIN users u ON q.created_by = u.id JOIN organizations o ON q.org_id = o.id
  `;
  if (req.user.role === 'super_admin') {
    return res.json(db.prepare(base + ' ORDER BY q.updated_at DESC LIMIT 300').all());
  }
  if (!req.user.org_id) return res.json([]);
  res.json(db.prepare(base + ' WHERE q.org_id = ? ORDER BY q.updated_at DESC').all(req.user.org_id));
});

// GET /api/quotes/:id/export?format=pdf|xlsx - download the quotation document
router.get('/:id/export', authenticate, async (req, res) => {
  const quote = db.prepare(`
    SELECT q.*, o.name as org_name FROM quotes q
    JOIN organizations o ON q.org_id = o.id WHERE q.id = ?
  `).get(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Quote not found' });
  if (!canAccess(req, quote)) return res.status(403).json({ error: 'Not your quote' });

  const format = (req.query.format || 'pdf').toLowerCase();
  if (format === 'xlsx') return streamQuoteXlsx(quote, res);
  return streamQuotePdf(quote, res);
});

// GET /api/quotes/:id
router.get('/:id', authenticate, (req, res) => {
  const quote = db.prepare(`
    SELECT q.*, u.name as author_name, o.name as org_name
    FROM quotes q JOIN users u ON q.created_by = u.id JOIN organizations o ON q.org_id = o.id
    WHERE q.id = ?
  `).get(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Quote not found' });
  if (!canAccess(req, quote)) return res.status(403).json({ error: 'Not your quote' });
  res.json(quote);
});

// POST /api/quotes - create
router.post('/', authenticate, (req, res) => {
  if (!req.user.org_id) return res.status(403).json({ error: 'Only partner users can create quotes' });
  const { title, customerName, items, notes, status, discountPct, lines } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  // Never trust client-sent figures: lines and the monthly total are recomputed
  // from the raw item configs against the server's pricing catalog. Client lines
  // are used only for their display strings.
  const safeItems = Array.isArray(items) ? items : [];
  const safeLines = buildQuoteLines(safeItems, Array.isArray(lines) ? lines : []);
  const total = quoteTotal(safeItems);
  // The partner discount is authoritative to the org's tier: if the quote opts
  // into partner pricing, apply the org's tier rate (10/15/20), never a client claim.
  const discount = Number(discountPct) > 0 ? orgDiscountPct(req.user.org_id) : 0;

  const result = db.prepare(`
    INSERT INTO quotes (org_id, created_by, title, customer_name, items, monthly_total, notes, status, discount_pct, lines)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.org_id, req.user.id, title, customerName || null,
    JSON.stringify(safeItems), total, notes || null, status || 'draft',
    discount, JSON.stringify(safeLines)
  );
  awardPoints(req.user.id, 'quote_created', 5, `Built quote: ${title}`);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Quote saved' });
});

// PUT /api/quotes/:id - update
router.put('/:id', authenticate, (req, res) => {
  const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Quote not found' });
  if (!canAccess(req, quote)) return res.status(403).json({ error: 'Not your quote' });

  const { title, customerName, items, notes, status, discountPct, lines } = req.body;
  // When items change, lines and the total are recomputed server-side (see POST).
  const safeItems = Array.isArray(items) ? items : null;
  const safeLines = safeItems ? buildQuoteLines(safeItems, Array.isArray(lines) ? lines : []) : null;
  // Discount follows the quote's own org tier when partner pricing is opted into.
  const discount = discountPct != null ? (Number(discountPct) > 0 ? orgDiscountPct(quote.org_id) : 0) : null;
  db.prepare(`
    UPDATE quotes SET
      title = COALESCE(?, title), customer_name = COALESCE(?, customer_name),
      items = COALESCE(?, items), monthly_total = COALESCE(?, monthly_total),
      notes = COALESCE(?, notes), status = COALESCE(?, status),
      discount_pct = COALESCE(?, discount_pct), lines = COALESCE(?, lines),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    title ?? null, customerName ?? null, safeItems ? JSON.stringify(safeItems) : null,
    safeItems ? quoteTotal(safeItems) : null, notes ?? null, status ?? null,
    discount, safeLines ? JSON.stringify(safeLines) : null,
    req.params.id
  );
  res.json({ message: 'Quote updated' });
});

// DELETE /api/quotes/:id
router.delete('/:id', authenticate, (req, res) => {
  const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Quote not found' });
  if (!canAccess(req, quote)) return res.status(403).json({ error: 'Not your quote' });
  db.prepare('UPDATE deals SET quote_id = NULL WHERE quote_id = ?').run(req.params.id);
  db.prepare('DELETE FROM quotes WHERE id = ?').run(req.params.id);
  res.json({ message: 'Quote deleted' });
});

export default router;
