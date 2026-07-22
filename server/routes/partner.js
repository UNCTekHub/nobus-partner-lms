import { Router } from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { computeScorecard, syncOrgTier, TIERS } from '../services/tierEngine.js';

const router = Router();

const NCS_CREDIT_PCT = 0.10; // 10% NCS credit on compute + storage, per the Partner Agreement

// Resolve the org context: partners are pinned to their own org; super admins
// may inspect any org via ?orgId=
function resolveOrg(req) {
  if (req.user.role === 'super_admin') return req.query.orgId || req.user.org_id || null;
  return req.user.org_id || null;
}

// GET /api/partner/scorecard - tier progress across the three dimensions
router.get('/scorecard', authenticate, (req, res) => {
  const orgId = resolveOrg(req);
  if (!orgId) return res.status(400).json({ error: 'No organization context' });
  // Recompute and persist the objective tier so the badge stays current
  syncOrgTier(orgId);
  const card = computeScorecard(orgId);
  const org = db.prepare('SELECT tier FROM organizations WHERE id = ?').get(orgId);
  res.json({ ...card, tier: org?.tier || card.currentTier, tiers: TIERS.map((t) => t.name) });
});

// Estimate the NCS credit for a won deal. Precise when a quote is attached
// (uses the compute + storage / discountable portion); otherwise a flat 10% of
// the deal value, clearly flagged as an estimate.
function dealCredit(deal) {
  if (deal.quote_id) {
    const q = db.prepare('SELECT lines FROM quotes WHERE id = ?').get(deal.quote_id);
    if (q) {
      let lines = [];
      try { lines = JSON.parse(q.lines || '[]'); } catch { /* ignore */ }
      const discountableMonthly = lines.reduce((s, l) => s + (l.discountable || 0), 0);
      if (discountableMonthly > 0) {
        return { amount: Math.round(discountableMonthly * 12 * NCS_CREDIT_PCT), basis: 'quote' };
      }
    }
  }
  return { amount: Math.round((deal.est_value || 0) * NCS_CREDIT_PCT), basis: 'estimate' };
}

// GET /api/partner/earnings - accrued NCS credit, influenced revenue, payouts.
// Super admins with no org context get a global payouts view across all partners.
router.get('/earnings', authenticate, (req, res) => {
  const orgId = resolveOrg(req);
  const global = !orgId && req.user.role === 'super_admin';
  if (!orgId && !global) return res.status(400).json({ error: 'No organization context' });

  const wonDeals = global
    ? db.prepare(`
        SELECT d.id, d.opportunity_name, d.customer_name, d.est_value, d.quote_id, d.credit_paid, d.updated_at, o.name AS org_name
        FROM deals d JOIN organizations o ON d.org_id = o.id
        WHERE d.status = 'won' ORDER BY d.updated_at DESC LIMIT 500`).all()
    : db.prepare(`
        SELECT id, opportunity_name, customer_name, est_value, quote_id, credit_paid, updated_at
        FROM deals WHERE org_id = ? AND status = 'won' ORDER BY updated_at DESC`).all(orgId);

  let accrued = 0, paid = 0;
  const rows = wonDeals.map((d) => {
    const c = dealCredit(d);
    accrued += c.amount;
    if (d.credit_paid) paid += c.amount;
    return {
      id: d.id, opportunity: d.opportunity_name, customer: d.customer_name, orgName: d.org_name,
      dealValue: d.est_value, credit: c.amount, basis: c.basis, paid: !!d.credit_paid,
      closedAt: d.updated_at,
    };
  });

  const revWhere = global ? "status = 'won'" : "org_id = ? AND status = 'won'";
  const influencedRevenue = db.prepare(`SELECT COALESCE(SUM(est_value),0) AS v FROM deals WHERE ${revWhere} AND updated_at >= datetime('now','-12 months')`).get(...(global ? [] : [orgId])).v;
  const activeCustomers = db.prepare(`SELECT COUNT(DISTINCT customer_name) AS c FROM deals WHERE ${global ? "status IN ('approved','won')" : "org_id = ? AND status IN ('approved','won')"}`).get(...(global ? [] : [orgId])).c;

  res.json({
    accrued, paid, pending: accrued - paid,
    influencedRevenue, activeCustomers, creditPct: NCS_CREDIT_PCT * 100, global,
    deals: rows,
  });
});

// PATCH /api/partner/earnings/:dealId/paid - super admin marks a credit paid out
router.patch('/earnings/:dealId/paid', authenticate, (req, res) => {
  if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Not permitted' });
  const { paid } = req.body;
  const deal = db.prepare("SELECT id FROM deals WHERE id = ? AND status = 'won'").get(req.params.dealId);
  if (!deal) return res.status(404).json({ error: 'Won deal not found' });
  db.prepare('UPDATE deals SET credit_paid = ? WHERE id = ?').run(paid ? 1 : 0, req.params.dealId);
  res.json({ message: 'Credit status updated' });
});

// GET /api/partner/analytics - partner-scoped analytics
router.get('/analytics', authenticate, (req, res) => {
  const orgId = resolveOrg(req);
  if (!orgId) return res.status(400).json({ error: 'No organization context' });

  const statusCounts = {};
  for (const row of db.prepare('SELECT status, COUNT(*) AS c FROM deals WHERE org_id = ? GROUP BY status').all(orgId)) {
    statusCounts[row.status] = row.c;
  }
  const won = statusCounts.won || 0;
  const lost = statusCounts.lost || 0;
  const winRate = won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0;

  // Team enablement: share of active users certified in at least one track
  const activeUsers = db.prepare("SELECT COUNT(*) AS c FROM users WHERE org_id = ? AND status = 'active'").get(orgId).c;
  const certifiedUsers = db.prepare(`
    SELECT COUNT(DISTINCT u.id) AS c FROM users u
    WHERE u.org_id = ? AND u.status = 'active'
    AND EXISTS (SELECT 1 FROM completed_paths cp WHERE cp.user_id = u.id)
  `).get(orgId).c;
  const enablementPct = activeUsers > 0 ? Math.round((certifiedUsers / activeUsers) * 100) : 0;

  // Deal registration trend, last 6 months (count + value)
  const trend = db.prepare(`
    SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS deals, COALESCE(SUM(est_value),0) AS value
    FROM deals WHERE org_id = ? AND created_at >= datetime('now', '-6 months')
    GROUP BY month ORDER BY month
  `).all(orgId);

  // Open pipeline value (pending + approved not yet closed)
  const openPipeline = db.prepare(`
    SELECT COALESCE(SUM(est_value),0) AS v FROM deals WHERE org_id = ? AND status IN ('pending','approved')
  `).get(orgId).v;

  const influencedRevenue = db.prepare(`
    SELECT COALESCE(SUM(est_value),0) AS v FROM deals
    WHERE org_id = ? AND status = 'won' AND updated_at >= datetime('now','-12 months')
  `).get(orgId).v;

  res.json({
    statusCounts, winRate, enablementPct, activeUsers, certifiedUsers,
    trend, openPipeline, influencedRevenue,
  });
});

export default router;
