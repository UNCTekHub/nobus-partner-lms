// Phase 2: earnings with real wins (quote + estimate basis), tier gate enforcement, SLA breach fixture
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
const BASE = process.env.QA_BASE || 'http://localhost:3101/api';
const DB = process.env.DB_PATH;
let pass = 0, fail = 0; const failures = [];
function check(id, desc, cond, extra = '') {
  if (cond) { pass++; console.log(`PASS ${id} ${desc}`); }
  else { fail++; failures.push(`${id} ${desc} ${extra}`); console.log(`FAIL ${id} ${desc} ${extra}`); }
}
async function req(method, path, token, body) {
  const r = await fetch(BASE + path, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null; try { data = await r.json(); } catch {}
  return { status: r.status, data };
}
async function login(email, password) {
  const r = await req('POST', '/auth/login', null, { email, password });
  return { token: r.data?.token, org: r.data?.organization };
}

const main = async () => {
  const admin = await login('admin@nobus.cloud', 'Nobus@2026!');
  const chinedu = await login('chinedu@acmetech.ng', 'demo');
  const fatima = await login('fatima@datastream.ng', 'demo');

  // --- Quote-basis credit: discountable 150k/mo -> credit = 150000*12*0.10 = 180,000
  const q = await req('POST', '/quotes', chinedu.token, {
    title: 'QA Quote - Zenith Migration', customerName: 'QA Zenith Bank',
    items: [], monthlyTotal: 200000,
    lines: [
      { name: 'FCS instance', discountable: 100000, monthly: 120000 },
      { name: 'FBS storage', discountable: 50000, monthly: 60000 },
      { name: 'Bandwidth', discountable: 0, monthly: 20000 },
    ],
  });
  check('P01', 'quote created', q.status === 201);

  const d1 = await req('POST', '/deals', chinedu.token, {
    customerName: 'QA Zenith Bank', opportunityName: 'QA Zenith Cloud Migration',
    estValue: 12000000, quoteId: q.data.id, services: ['fcs'],
  });
  check('P02', 'deal 1 registered with quote attached', d1.status === 201);
  const ap1 = await req('PATCH', `/deals/${d1.data.id}/approve`, admin.token);
  check('P03', 'deal 1 approved', ap1.status === 200);

  // Adversarial: other org tries to close Acme's deal
  const crossClose = await req('PATCH', `/deals/${d1.data.id}/close`, fatima.token, { outcome: 'won' });
  check('P04', 'cross-tenant deal close -> 403', crossClose.status === 403);

  const w1 = await req('PATCH', `/deals/${d1.data.id}/close`, chinedu.token, { outcome: 'won' });
  check('P05', 'deal 1 closed won by owner', w1.status === 200);

  // --- Estimate-basis: deal without quote, 3.5M -> credit 350,000
  const d2 = await req('POST', '/deals', chinedu.token, {
    customerName: 'QA Dangote Foods', opportunityName: 'QA ERP Hosting', estValue: 3500000,
  });
  await req('PATCH', `/deals/${d2.data.id}/approve`, admin.token);
  await req('PATCH', `/deals/${d2.data.id}/close`, chinedu.token, { outcome: 'won' });

  const earn = await req('GET', '/partner/earnings', chinedu.token);
  const r1 = earn.data.deals.find(d => d.id === d1.data.id);
  const r2 = earn.data.deals.find(d => d.id === d2.data.id);
  check('P06', `quote-basis credit = 180,000 (got ${r1?.credit}, basis ${r1?.basis})`, r1?.basis === 'quote' && r1?.credit === 180000);
  check('P07', `estimate-basis credit = 350,000 (got ${r2?.credit}, basis ${r2?.basis})`, r2?.basis === 'estimate' && r2?.credit === 350000);
  check('P08', `accrued = 530,000 (got ${earn.data.accrued})`, earn.data.accrued === 530000);
  check('P09', `influenced revenue = 15.5M (got ${earn.data.influencedRevenue})`, earn.data.influencedRevenue === 15500000);

  // --- mark paid moves totals
  await req('PATCH', `/partner/earnings/${d1.data.id}/paid`, admin.token, { paid: true });
  const earn2 = await req('GET', '/partner/earnings', chinedu.token);
  check('P10', `paid=180k pending=350k (got paid ${earn2.data.paid}, pending ${earn2.data.pending})`,
    earn2.data.paid === 180000 && earn2.data.pending === 350000);

  // --- Tier gate: performance now Silver-level+, but zero certs -> must STAY Registered
  const sc = await req('GET', '/partner/scorecard', chinedu.token);
  const m = sc.data.metrics;
  check('P11', `metrics updated (won=${m.wonDeals}, rev=${m.revenue}, cust=${m.activeCustomers}, recent=${m.hasRecentActivity})`,
    m.wonDeals === 2 && m.revenue === 15500000 && m.activeCustomers >= 2 && m.hasRecentActivity === true);
  check('P12', `certification GATE holds: tier stays Registered despite Gold-level revenue (got ${sc.data.tier})`, sc.data.tier === 'Registered');
  const revDim = sc.data.dimensions.find(d => d.key === 'revenue');
  const salesDim = sc.data.dimensions.find(d => d.key === 'sales');
  check('P13', 'scorecard shows revenue met but sales certs missing for Silver', revDim?.met === true && salesDim?.met === false);

  // --- Tier promotion once certs granted (fixture: complete paths directly in DB)
  const db = new Database(DB);
  // Silver needs: Sales 2, Presales 1, Technical 1 certified (role-matched)
  // Acme actives: chinedu (Technical), amaka (Sales), emeka (Presales) -> add one more Sales user
  db.prepare(`INSERT OR IGNORE INTO users (id, org_id, name, email, password_hash, role, role_category, status)
    VALUES ('qa-user-sales2','org-001','QA Sales Two','qa.sales2@acmetech.ng','x','user','Sales','active')`).run();
  const grants = [
    ['user-001', 'technical-enablement'], // chinedu Technical
    ['user-002', 'sales-enablement'],     // amaka Sales
    ['user-003', 'presales-enablement'],  // emeka Presales
    ['qa-user-sales2', 'sales-enablement'],
  ];
  for (const [u, p] of grants) db.prepare('INSERT OR IGNORE INTO completed_paths (user_id, path_id) VALUES (?,?)').run(u, p);

  const sc2 = await req('GET', '/partner/scorecard', chinedu.token);
  check('P14', `tier promotes to Silver once certs + performance met (got ${sc2.data.tier})`, sc2.data.tier === 'Silver');
  const orgTier = db.prepare("SELECT tier FROM organizations WHERE id='org-001'").get().tier;
  check('P15', `tier persisted to organizations table (got ${orgTier})`, orgTier === 'Silver');
  check('P16', 'scorecard now targets Gold', sc2.data.nextTier === 'Gold');

  // --- SLA breach fixture: backdate the Urgent QA ticket by 5 hours
  const t = db.prepare("SELECT id FROM support_tickets WHERE subject LIKE 'QA: VPC peering%' ORDER BY id DESC").get();
  db.prepare("UPDATE support_tickets SET created_at = datetime('now','-5 hours'), first_response_at = NULL, status='open' WHERE id = ?").run(t.id);
  const amaka = await login('amaka@acmetech.ng', 'demo');
  const tl = await req('GET', '/support', amaka.token);
  const row = tl.data.find(x => x.id === t.id);
  check('P17', `Urgent ticket 5h old flags SLA breach (breached=${row?.sla?.breached}, hoursOpen=${row?.sla?.hoursOpen})`,
    row?.sla?.breached === true && row?.sla?.responded === false);

  // Normal-priority ticket 5h old must NOT breach (target 24h)
  const t2 = await req('POST', '/support', amaka.token, { subject: 'QA normal age test', body: 'x', priority: 'Normal' });
  db.prepare("UPDATE support_tickets SET created_at = datetime('now','-5 hours') WHERE id = ?").run(t2.data.id);
  const tl2 = await req('GET', '/support', amaka.token);
  const row2 = tl2.data.find(x => x.id === t2.data.id);
  check('P18', 'Normal ticket 5h old NOT breached (24h target)', row2?.sla?.breached === false && row2?.sla?.targetHours === 24);

  db.close();
  console.log(`\n===== PHASE 2 RESULT: ${pass} passed, ${fail} failed =====`);
  if (failures.length) { console.log('FAILURES:'); failures.forEach(f => console.log('  - ' + f)); }
};
main().catch(e => { console.error('SUITE ERROR', e); process.exit(1); });
