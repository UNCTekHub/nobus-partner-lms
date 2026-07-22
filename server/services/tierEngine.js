import db from '../db.js';

// Nobus partner tiers are earned across THREE dimensions, calibrated for the
// African cloud channel (Naira figures reflect the market: a single bank deal is
// often ₦50M+/year). Certifications are the entry GATE; performance (revenue and
// closed business) dominates from Gold up; engagement keeps a tier from going
// stale. All thresholds are illustrative defaults - tune to your program.
export const TIERS = [
  {
    name: 'Registered', order: 0,
    certs: { Sales: 0, Presales: 0, Technical: 0 },
    wonDeals: 0, revenue: 0, activeCustomers: 0, requiresRecency: false,
  },
  {
    name: 'Silver', order: 1,
    certs: { Sales: 2, Presales: 1, Technical: 1 },
    wonDeals: 1, revenue: 2_000_000, activeCustomers: 1, requiresRecency: true,
  },
  {
    name: 'Gold', order: 2,
    certs: { Sales: 5, Presales: 3, Technical: 3 },
    wonDeals: 3, revenue: 15_000_000, activeCustomers: 2, requiresRecency: true,
  },
  {
    name: 'Platinum', order: 3,
    certs: { Sales: 10, Presales: 5, Technical: 6 },
    wonDeals: 6, revenue: 50_000_000, activeCustomers: 6, requiresRecency: true,
  },
  {
    name: 'Elite', order: 4,
    certs: { Sales: 15, Presales: 8, Technical: 10 },
    wonDeals: 10, revenue: 150_000_000, activeCustomers: 10, requiresRecency: true,
  },
];

const PATH_FOR_ROLE = {
  Sales: 'sales-enablement',
  Presales: 'presales-enablement',
  Technical: 'technical-enablement',
};

// Count staff in an org who are certified for their OWN role (completed the
// matching learning path), by role category.
function certifiedByRole(orgId) {
  const counts = { Sales: 0, Presales: 0, Technical: 0 };
  for (const [role, pathId] of Object.entries(PATH_FOR_ROLE)) {
    counts[role] = db.prepare(`
      SELECT COUNT(*) AS c FROM users u
      WHERE u.org_id = ? AND u.role_category = ? AND u.status = 'active'
      AND EXISTS (SELECT 1 FROM completed_paths cp WHERE cp.user_id = u.id AND cp.path_id = ?)
    `).get(orgId, role, pathId).c;
  }
  return counts;
}

// Gather the raw performance/engagement metrics for an org.
export function orgMetrics(orgId) {
  const certified = certifiedByRole(orgId);

  const wonDeals = db.prepare("SELECT COUNT(*) AS c FROM deals WHERE org_id = ? AND status = 'won'").get(orgId).c;

  // Influenced revenue: value of deals won in the trailing 12 months (proxy for
  // consumption until billing-system integration provides actuals).
  const revenue = db.prepare(`
    SELECT COALESCE(SUM(est_value), 0) AS v FROM deals
    WHERE org_id = ? AND status = 'won' AND updated_at >= datetime('now', '-12 months')
  `).get(orgId).v;

  const activeCustomers = db.prepare(`
    SELECT COUNT(DISTINCT customer_name) AS c FROM deals
    WHERE org_id = ? AND status IN ('approved', 'won')
  `).get(orgId).c;

  // Engagement: at least one deal registered in the last 12 months.
  const recentDeal = db.prepare(`
    SELECT COUNT(*) AS c FROM deals WHERE org_id = ? AND created_at >= datetime('now', '-12 months')
  `).get(orgId).c;

  return { certified, wonDeals, revenue, activeCustomers, hasRecentActivity: recentDeal > 0 };
}

function meetsTier(m, tier) {
  const certsOk = ['Sales', 'Presales', 'Technical'].every((r) => m.certified[r] >= tier.certs[r]);
  const recencyOk = !tier.requiresRecency || m.hasRecentActivity;
  return certsOk
    && m.wonDeals >= tier.wonDeals
    && m.revenue >= tier.revenue
    && m.activeCustomers >= tier.activeCustomers
    && recencyOk;
}

// Highest tier whose every requirement is satisfied.
export function determineTier(metrics) {
  let earned = TIERS[0];
  for (const tier of TIERS) {
    if (meetsTier(metrics, tier)) earned = tier;
  }
  return earned;
}

// Build the partner-facing scorecard: current tier, next tier, and per-dimension
// progress with the specific missing actions.
export function computeScorecard(orgId) {
  const m = orgMetrics(orgId);
  const current = determineTier(m);
  const next = TIERS.find((t) => t.order === current.order + 1) || null;

  const dimsFor = (tier) => {
    if (!tier) return [];
    return [
      { key: 'sales', label: 'Certified Sales', current: m.certified.Sales, required: tier.certs.Sales, kind: 'count' },
      { key: 'presales', label: 'Certified Presales', current: m.certified.Presales, required: tier.certs.Presales, kind: 'count' },
      { key: 'technical', label: 'Certified Technical', current: m.certified.Technical, required: tier.certs.Technical, kind: 'count' },
      { key: 'wonDeals', label: 'Won deals', current: m.wonDeals, required: tier.wonDeals, kind: 'count' },
      { key: 'revenue', label: 'Influenced revenue (12 mo)', current: m.revenue, required: tier.revenue, kind: 'currency' },
      { key: 'activeCustomers', label: 'Active customers', current: m.activeCustomers, required: tier.activeCustomers, kind: 'count' },
    ].map((d) => ({ ...d, met: d.current >= d.required }));
  };

  const nextDims = dimsFor(next);
  const missing = nextDims.filter((d) => !d.met);

  return {
    metrics: m,
    currentTier: current.name,
    nextTier: next ? next.name : null,
    engagementOk: m.hasRecentActivity,
    requiresRecency: next ? next.requiresRecency : false,
    dimensions: nextDims,
    missing,
    atTop: !next,
  };
}

// Recompute and persist an org's tier from the objective model. Returns the tier.
export function syncOrgTier(orgId) {
  const m = orgMetrics(orgId);
  const tier = determineTier(m).name;
  db.prepare("UPDATE organizations SET tier = ?, updated_at = datetime('now') WHERE id = ?").run(tier, orgId);
  return tier;
}
