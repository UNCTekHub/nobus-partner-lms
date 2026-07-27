import { Router } from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { awardPoints } from '../services/notifications.js';

const router = Router();

const STAGES = ['lead', 'qualified', 'proposal', 'won', 'lost'];
// Weighted forecast: probability a deal in each stage converts to revenue
const STAGE_WEIGHTS = { lead: 0.1, qualified: 0.3, proposal: 0.6, won: 1, lost: 0 };

function requireOrg(req, res) {
  if (!req.user.org_id && req.user.role !== 'super_admin') {
    res.status(403).json({ error: 'Only partner users can use the sales navigator' });
    return false;
  }
  return true;
}

// GET /api/pipeline - all leads for my org (super admin: pass ?orgId= or gets all)
router.get('/', authenticate, (req, res) => {
  const base = `
    SELECT l.*, u.name as owner_name,
      (SELECT COUNT(*) FROM lead_activities WHERE lead_id = l.id) as activity_count
    FROM leads l JOIN users u ON l.created_by = u.id
  `;
  if (req.user.role === 'super_admin') {
    const { orgId } = req.query;
    if (orgId) return res.json(db.prepare(base + ' WHERE l.org_id = ? ORDER BY l.updated_at DESC').all(orgId));
    return res.json(db.prepare(base + ' ORDER BY l.updated_at DESC LIMIT 500').all());
  }
  if (!req.user.org_id) return res.json([]);
  res.json(db.prepare(base + ' WHERE l.org_id = ? ORDER BY l.updated_at DESC').all(req.user.org_id));
});

// GET /api/pipeline/forecast - local-currency revenue forecast summary for my org
router.get('/forecast', authenticate, (req, res) => {
  const orgId = req.user.role === 'super_admin' ? req.query.orgId : req.user.org_id;
  let sql = 'SELECT stage, COUNT(*) as count, COALESCE(SUM(est_value), 0) as total FROM leads';
  const params = [];
  if (orgId) { sql += ' WHERE org_id = ?'; params.push(orgId); }
  sql += ' GROUP BY stage';
  const rows = db.prepare(sql).all(...params);

  const byStage = {};
  for (const s of STAGES) byStage[s] = { count: 0, total: 0 };
  for (const r of rows) if (byStage[r.stage]) byStage[r.stage] = { count: r.count, total: r.total };

  const weightedForecast = STAGES.reduce((sum, s) => sum + byStage[s].total * STAGE_WEIGHTS[s], 0);
  res.json({ byStage, weightedForecast, openPipeline: byStage.lead.total + byStage.qualified.total + byStage.proposal.total });
});

// POST /api/pipeline - create a lead
router.post('/', authenticate, (req, res) => {
  if (!requireOrg(req, res)) return;
  const { company, contactName, contactEmail, contactPhone, industry, estValue, services, nextAction } = req.body;
  if (!company) return res.status(400).json({ error: 'Company name is required' });

  const result = db.prepare(`
    INSERT INTO leads (org_id, created_by, company, contact_name, contact_email, contact_phone, industry, est_value, services, next_action)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.org_id, req.user.id, company, contactName || null, contactEmail || null,
    contactPhone || null, industry || null, estValue || 0, JSON.stringify(services || []), nextAction || null
  );
  awardPoints(req.user.id, 'lead_created', 5, `Added lead: ${company}`);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Lead created' });
});

// PATCH /api/pipeline/:id - update lead fields / move stage
router.patch('/:id', authenticate, (req, res) => {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  if (req.user.role !== 'super_admin' && lead.org_id !== req.user.org_id) {
    return res.status(403).json({ error: 'Not your lead' });
  }

  const { stage, company, contactName, contactEmail, contactPhone, industry, estValue, services, nextAction } = req.body;
  if (stage && !STAGES.includes(stage)) return res.status(400).json({ error: 'Invalid stage' });

  db.prepare(`
    UPDATE leads SET
      stage = COALESCE(?, stage),
      company = COALESCE(?, company),
      contact_name = COALESCE(?, contact_name),
      contact_email = COALESCE(?, contact_email),
      contact_phone = COALESCE(?, contact_phone),
      industry = COALESCE(?, industry),
      est_value = COALESCE(?, est_value),
      services = COALESCE(?, services),
      next_action = COALESCE(?, next_action),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    stage ?? null, company ?? null, contactName ?? null, contactEmail ?? null, contactPhone ?? null,
    industry ?? null, estValue ?? null, services ? JSON.stringify(services) : null, nextAction ?? null,
    req.params.id
  );

  if (stage === 'won' && lead.stage !== 'won') {
    awardPoints(req.user.id, 'lead_won', 25, `Won opportunity: ${lead.company}`);
  }
  res.json({ message: 'Lead updated' });
});

// DELETE /api/pipeline/:id - remove a lead
router.delete('/:id', authenticate, (req, res) => {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  if (req.user.role !== 'super_admin' && lead.org_id !== req.user.org_id) {
    return res.status(403).json({ error: 'Not your lead' });
  }
  db.prepare('DELETE FROM lead_activities WHERE lead_id = ?').run(req.params.id);
  db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
  res.json({ message: 'Lead deleted' });
});

// GET /api/pipeline/:id/activities - activity timeline
router.get('/:id/activities', authenticate, (req, res) => {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  if (req.user.role !== 'super_admin' && lead.org_id !== req.user.org_id) {
    return res.status(403).json({ error: 'Not your lead' });
  }
  const activities = db.prepare(`
    SELECT a.*, u.name as author_name FROM lead_activities a
    JOIN users u ON a.user_id = u.id WHERE a.lead_id = ? ORDER BY a.created_at DESC
  `).all(req.params.id);
  res.json(activities);
});

// POST /api/pipeline/:id/activities - add an activity note
router.post('/:id/activities', authenticate, (req, res) => {
  const { note } = req.body;
  if (!note) return res.status(400).json({ error: 'Note is required' });
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  if (req.user.role !== 'super_admin' && lead.org_id !== req.user.org_id) {
    return res.status(403).json({ error: 'Not your lead' });
  }
  const result = db.prepare('INSERT INTO lead_activities (lead_id, user_id, note) VALUES (?, ?, ?)')
    .run(req.params.id, req.user.id, note);
  db.prepare("UPDATE leads SET updated_at = datetime('now') WHERE id = ?").run(req.params.id);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Activity added' });
});

export default router;
