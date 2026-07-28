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

  // --- Quote-basis credit, server-recomputed from raw items (client figures are
  // TAMPERED on purpose - the server must ignore them):
  //   fcs si.2.2.30.l x1 -> 15,060/mo discountable
  //   fbs 100 GB        -> 12,000/mo discountable
  //   bandwidth x1      ->  6,000/mo NOT discountable
  // total 33,060/mo; discountable 27,060/mo -> credit = 27,060*12*10% = 32,472
  const q = await req('POST', '/quotes', chinedu.token, {
    title: 'QA Quote - Zenith Migration', customerName: 'QA Zenith Bank',
    monthlyTotal: 99999999, // tampered - must be ignored
    items: [
      { serviceId: 'fcs', name: 'FCS Compute Instance', kind: 'instance', flavorId: 'si.2.2.30.l', qty: 1 },
      { serviceId: 'fbs', name: 'FBS Block Storage', kind: 'perUnit', qty: 100, unitPrice: 999999 }, // tampered unitPrice - ignored
      { serviceId: 'bandwidth', name: 'Internet Bandwidth', kind: 'perUnit', qty: 1 },
    ],
    lines: [ // tampered discountables - must be recomputed server-side
      { label: 'FCS Compute Instance', config: '2 vCPU, 2GB RAM, 30GB Volume (Linux Server)', discountable: 999999, monthly: 1 },
      { label: 'FBS Block Storage', config: '100 GB', discountable: 999999, monthly: 1 },
      { label: 'Internet Bandwidth', config: '1 environment', discountable: 999999, monthly: 1 },
    ],
  });
  check('P01', 'quote created', q.status === 201);
  const qStored = await req('GET', `/quotes/${q.data.id}`, chinedu.token);
  const storedLines = JSON.parse(qStored.data?.lines || '[]');
  check('P01b', `tamper defeated: monthly_total recomputed to 33,060 (got ${qStored.data?.monthly_total})`, qStored.data?.monthly_total === 33060);
  check('P01c', `tamper defeated: stored discountables are 15060/12000/0 (got ${storedLines.map((l) => l.discountable).join('/')})`,
    storedLines.length === 3 && storedLines[0].discountable === 15060 && storedLines[1].discountable === 12000 && storedLines[2].discountable === 0);
  check('P01d', 'display strings preserved from client', storedLines[0].config.includes('2 vCPU'));

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
  check('P06', `quote-basis credit = 32,472 from server-priced lines (got ${r1?.credit}, basis ${r1?.basis})`, r1?.basis === 'quote' && r1?.credit === 32472);
  check('P07', `estimate-basis credit = 350,000 (got ${r2?.credit}, basis ${r2?.basis})`, r2?.basis === 'estimate' && r2?.credit === 350000);
  check('P08', `accrued = 382,472 (got ${earn.data.accrued})`, earn.data.accrued === 382472);
  check('P09', `influenced revenue = 15.5M (got ${earn.data.influencedRevenue})`, earn.data.influencedRevenue === 15500000);

  // --- mark paid moves totals
  await req('PATCH', `/partner/earnings/${d1.data.id}/paid`, admin.token, { paid: true });
  const earn2 = await req('GET', '/partner/earnings', chinedu.token);
  check('P10', `paid=32,472 pending=350k (got paid ${earn2.data.paid}, pending ${earn2.data.pending})`,
    earn2.data.paid === 32472 && earn2.data.pending === 350000);

  // --- Push revenue over the ₦500M Silver band with a large won deal (15.5M + 600M = 615.5M)
  const dBig = await req('POST', '/deals', chinedu.token, { customerName: 'QA MegaCorp', opportunityName: 'QA Enterprise Cloud', estValue: 600000000 });
  await req('PATCH', `/deals/${dBig.data.id}/approve`, admin.token);
  await req('PATCH', `/deals/${dBig.data.id}/close`, chinedu.token, { outcome: 'won' });

  // --- Tier gate: revenue now in the Silver band, but certs insufficient -> STAY Registered
  const sc = await req('GET', '/partner/scorecard', chinedu.token);
  const m = sc.data.metrics;
  check('P11', `revenue crosses ₦500M (got ${m.revenue})`, m.revenue === 615500000);
  check('P12', `certification GATE holds: stays Registered despite Silver-band revenue (got ${sc.data.tier})`, sc.data.tier === 'Registered');
  const revDim = sc.data.dimensions.find(d => d.key === 'revenue');
  const salesDim = sc.data.dimensions.find(d => d.key === 'sales');
  check('P13', 'revenue met but sales certs missing for Silver', revDim?.met === true && salesDim?.met === false);
  check('P13b', `Registered tier discount is 10% (got ${sc.data.discount})`, sc.data.discount === 10);

  // --- Quote discount follows tier + is clamped server-side (client claim ignored)
  const qReg = await req('POST', '/quotes', chinedu.token, { title: 'QA Reg Quote', items: [{ serviceId: 'fcs', kind: 'instance', flavorId: 'si.2.2.30.l', qty: 1 }], discountPct: 20 });
  const qRegRow = await req('GET', `/quotes/${qReg.data.id}`, chinedu.token);
  check('P13c', `Registered quote discount forced to tier 10% despite client claiming 20 (got ${qRegRow.data.discount_pct})`, qRegRow.data.discount_pct === 10);

  // --- Tier promotion once certs granted (fixture: complete paths directly in DB)
  const db = new Database(DB);
  // Silver needs: Sales 2, Presales 1, Technical 1 certified (role-matched)
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
  check('P14', `tier promotes to Silver once revenue + certs met (got ${sc2.data.tier})`, sc2.data.tier === 'Silver');
  const orgTier = db.prepare("SELECT tier FROM organizations WHERE id='org-001'").get().tier;
  check('P15', `tier persisted to organizations table (got ${orgTier})`, orgTier === 'Silver');
  check('P16', `scorecard targets Gold and shows 15% discount (got tier discount ${sc2.data.discount}, next ${sc2.data.nextTier})`, sc2.data.nextTier === 'Gold' && sc2.data.discount === 15);
  const qSil = await req('POST', '/quotes', chinedu.token, { title: 'QA Silver Quote', items: [{ serviceId: 'fcs', kind: 'instance', flavorId: 'si.2.2.30.l', qty: 1 }], discountPct: 20 });
  const qSilRow = await req('GET', `/quotes/${qSil.data.id}`, chinedu.token);
  check('P16b', `Silver quote applies tier 15% discount (client sent 20, got ${qSilRow.data.discount_pct})`, qSilRow.data.discount_pct === 15);

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

  // --- Replies to resolved tickets reopen them
  await req('PATCH', `/support/${t2.data.id}/status`, amaka.token, { status: 'resolved' });
  const partnerReply = await req('POST', `/support/${t2.data.id}/reply`, amaka.token, { body: 'Actually, this came back.' });
  const afterPartner = await req('GET', `/support/${t2.data.id}`, amaka.token);
  check('P19', `partner reply reopens resolved ticket (reopened=${partnerReply.data?.reopened}, status=${afterPartner.data?.status})`,
    partnerReply.data?.reopened === true && afterPartner.data?.status === 'open' && afterPartner.data?.resolved_at == null);
  await req('PATCH', `/support/${t2.data.id}/status`, admin.token, { status: 'resolved' });
  const staffReply = await req('POST', `/support/${t2.data.id}/reply`, admin.token, { body: 'Following up with a permanent fix.' });
  const afterStaff2 = await req('GET', `/support/${t2.data.id}`, amaka.token);
  check('P20', `staff reply reopens resolved ticket to pending (status=${afterStaff2.data?.status})`,
    staffReply.status === 201 && afterStaff2.data?.status === 'pending' && afterStaff2.data?.resolved_at == null);

  db.close();
  console.log(`\n===== PHASE 2 RESULT: ${pass} passed, ${fail} failed =====`);
  if (failures.length) { console.log('FAILURES:'); failures.forEach(f => console.log('  - ' + f)); }
};
main().catch(e => { console.error('SUITE ERROR', e); process.exit(1); });
