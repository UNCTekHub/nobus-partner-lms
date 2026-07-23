// Nobus PartnerCentral - QA E2E suite for growth modules (tiers/earnings/MDF/support)
const BASE = process.env.QA_BASE || 'http://localhost:3101/api';
let pass = 0, fail = 0; const failures = [];

function check(id, desc, cond, extra = '') {
  if (cond) { pass++; console.log(`PASS ${id} ${desc}`); }
  else { fail++; failures.push(`${id} ${desc} ${extra}`); console.log(`FAIL ${id} ${desc} ${extra}`); }
}

async function req(method, path, token, body) {
  const r = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null; try { data = await r.json(); } catch {}
  return { status: r.status, data };
}

async function login(email, password) {
  const r = await req('POST', '/auth/login', null, { email, password });
  return { status: r.status, token: r.data?.token, user: r.data?.user, org: r.data?.organization };
}

// Tier thresholds mirrored from server/services/tierEngine.js for independent verification
const TIERS = [
  { name: 'Registered', certs: { Sales: 0, Presales: 0, Technical: 0 }, wonDeals: 0, revenue: 0, activeCustomers: 0, requiresRecency: false },
  { name: 'Silver', certs: { Sales: 2, Presales: 1, Technical: 1 }, wonDeals: 1, revenue: 2_000_000, activeCustomers: 1, requiresRecency: true },
  { name: 'Gold', certs: { Sales: 5, Presales: 3, Technical: 3 }, wonDeals: 3, revenue: 15_000_000, activeCustomers: 2, requiresRecency: true },
  { name: 'Platinum', certs: { Sales: 10, Presales: 5, Technical: 6 }, wonDeals: 6, revenue: 50_000_000, activeCustomers: 6, requiresRecency: true },
  { name: 'Elite', certs: { Sales: 15, Presales: 8, Technical: 10 }, wonDeals: 10, revenue: 150_000_000, activeCustomers: 10, requiresRecency: true },
];
function expectedTier(m) {
  let earned = 'Registered';
  for (const t of TIERS) {
    const certsOk = ['Sales', 'Presales', 'Technical'].every(r => m.certified[r] >= t.certs[r]);
    const rec = !t.requiresRecency || m.hasRecentActivity;
    if (certsOk && m.wonDeals >= t.wonDeals && m.revenue >= t.revenue && m.activeCustomers >= t.activeCustomers && rec) earned = t.name;
  }
  return earned;
}

const main = async () => {
  // ===== AUTH =====
  const admin = await login('admin@nobus.cloud', 'Nobus@2026!');
  check('T01', 'admin login', admin.status === 200 && !!admin.token);
  const chinedu = await login('chinedu@acmetech.ng', 'demo');
  check('T02', 'chinedu (org_admin Acme) login', chinedu.status === 200 && !!chinedu.token);
  const amaka = await login('amaka@acmetech.ng', 'demo');
  check('T03', 'amaka (user Acme) login', amaka.status === 200 && !!amaka.token);
  const fatima = await login('fatima@datastream.ng', 'demo');
  check('T04', 'fatima (org_admin DataStream) login', fatima.status === 200 && !!fatima.token);
  const bad = await login('chinedu@acmetech.ng', 'wrongpass');
  check('T05', 'wrong password rejected 401', bad.status === 401);
  if (!admin.token || !chinedu.token || !fatima.token) { console.log('ABORT: logins failed'); return; }
  const acmeOrg = chinedu.org?.id;

  // ===== SCORECARD =====
  const sc = await req('GET', '/partner/scorecard', chinedu.token);
  check('T10', 'chinedu scorecard 200 + shape', sc.status === 200 && Array.isArray(sc.data?.tiers) && sc.data.tiers.length === 5 && Array.isArray(sc.data?.dimensions));
  if (sc.status === 200) {
    check('T11', 'dimension met flags consistent', sc.data.dimensions.every(d => d.met === (d.current >= d.required)));
    const exp = expectedTier(sc.data.metrics);
    check('T12', `tier computation matches model (got ${sc.data.tier}, expected ${exp})`, sc.data.tier === exp);
  }
  const scAdminNoOrg = await req('GET', '/partner/scorecard', admin.token);
  check('T13', 'admin scorecard without orgId -> 400', scAdminNoOrg.status === 400);
  const scAdminOrg = await req('GET', `/partner/scorecard?orgId=${acmeOrg}`, admin.token);
  check('T14', 'admin scorecard ?orgId= works', scAdminOrg.status === 200 && scAdminOrg.data.tier === sc.data?.tier);

  // ===== EARNINGS =====
  const earn = await req('GET', '/partner/earnings', chinedu.token);
  check('T20a', 'chinedu earnings 200', earn.status === 200);
  if (earn.status === 200) {
    const sum = earn.data.deals.reduce((s, d) => s + d.credit, 0);
    check('T20b', `accrued == sum of row credits (${earn.data.accrued} vs ${sum})`, earn.data.accrued === sum);
    check('T20c', 'pending == accrued - paid', earn.data.pending === earn.data.accrued - earn.data.paid);
    check('T20d', 'estimate rows credit == round(10% of deal value)',
      earn.data.deals.filter(d => d.basis === 'estimate').every(d => d.credit === Math.round(d.dealValue * 0.10)));
    check('T20e', 'no cross-org rows leak (no orgName on partner view)', earn.data.global !== true);
  }
  const wonDealId = earn.data?.deals?.[0]?.id;
  if (wonDealId) {
    const mp403 = await req('PATCH', `/partner/earnings/${wonDealId}/paid`, amaka.token, { paid: true });
    check('T21', 'non-admin mark-paid -> 403', mp403.status === 403);
    const mp = await req('PATCH', `/partner/earnings/${wonDealId}/paid`, admin.token, { paid: true });
    check('T22a', 'admin mark-paid 200', mp.status === 200);
    const earn2 = await req('GET', '/partner/earnings', chinedu.token);
    const row = earn2.data?.deals?.find(d => d.id === wonDealId);
    check('T22b', 'paid flag visible to partner + totals shift', row?.paid === true && earn2.data.paid >= row.credit);
    await req('PATCH', `/partner/earnings/${wonDealId}/paid`, admin.token, { paid: false }); // restore
  } else {
    console.log('SKIP T21/T22 - no won deals in seed for Acme');
  }
  const mp404 = await req('PATCH', '/partner/earnings/999999/paid', admin.token, { paid: true });
  check('T24', 'mark-paid on nonexistent/non-won deal -> 404', mp404.status === 404);
  const gEarn = await req('GET', '/partner/earnings', admin.token);
  check('T23', 'admin global earnings (global=true, rows carry orgName)',
    gEarn.status === 200 && gEarn.data.global === true && (gEarn.data.deals.length === 0 || gEarn.data.deals.every(d => !!d.orgName)));

  // ===== ANALYTICS =====
  const an = await req('GET', '/partner/analytics', chinedu.token);
  check('T30a', 'analytics 200', an.status === 200);
  if (an.status === 200) {
    const w = an.data.statusCounts.won || 0, l = an.data.statusCounts.lost || 0;
    const expWin = w + l > 0 ? Math.round((w / (w + l)) * 100) : 0;
    check('T30b', `winRate math (${an.data.winRate} vs ${expWin})`, an.data.winRate === expWin);
    check('T30c', 'enablementPct in 0..100', an.data.enablementPct >= 0 && an.data.enablementPct <= 100);
  }

  // ===== MDF STATE MACHINE =====
  const mdf1 = await req('POST', '/mdf', chinedu.token, { title: 'QA Lagos Cloud Roadshow', activityType: 'Event / Webinar', description: 'QA test request', amountRequested: 500000, plannedDate: '2026-08-15' });
  check('T40', 'chinedu creates MDF 201', mdf1.status === 201 && !!mdf1.data.id);
  const id1 = mdf1.data?.id;
  const mdfNoOrg = await req('POST', '/mdf', admin.token, { title: 'X', amountRequested: 1000 });
  check('T41', 'super-admin (no org) cannot create MDF -> 403', mdfNoOrg.status === 403);
  const app403a = await req('PATCH', `/mdf/${id1}/approve`, fatima.token, { amountApproved: 500000 });
  check('T42', 'other-org org_admin approve -> 403', app403a.status === 403);
  const app403b = await req('PATCH', `/mdf/${id1}/approve`, chinedu.token, { amountApproved: 500000 });
  check('T43', 'requester self-approve -> 403', app403b.status === 403);
  const reimbEarly = await req('PATCH', `/mdf/${id1}/reimburse`, admin.token);
  check('T44', 'reimburse while submitted -> 400 (invalid jump)', reimbEarly.status === 400);
  const proofEarly = await req('PATCH', `/mdf/${id1}/proof`, chinedu.token, { proofNotes: 'too early' });
  check('T45', 'proof while submitted -> 400', proofEarly.status === 400);
  const app = await req('PATCH', `/mdf/${id1}/approve`, admin.token, { amountApproved: 300000, decisionNotes: 'Partial approval - QA' });
  check('T46a', 'admin approves partial 300k', app.status === 200);
  const list1 = await req('GET', '/mdf', chinedu.token);
  const m1 = list1.data?.find(x => x.id === id1);
  check('T46b', 'status approved + amount_approved=300000', m1?.status === 'approved' && m1?.amount_approved === 300000);
  const appAgain = await req('PATCH', `/mdf/${id1}/approve`, admin.token, {});
  check('T47', 'double approve -> 400', appAgain.status === 400);
  const proofCross = await req('PATCH', `/mdf/${id1}/proof`, fatima.token, { proofNotes: 'not mine' });
  check('T48', 'cross-tenant proof submit -> 403', proofCross.status === 403);
  const proof = await req('PATCH', `/mdf/${id1}/proof`, chinedu.token, { proofUrl: 'https://example.com/report.pdf', proofNotes: 'Event executed, 42 leads' });
  check('T49', 'owner submits proof 200', proof.status === 200);
  const proofAgain = await req('PATCH', `/mdf/${id1}/proof`, chinedu.token, { proofNotes: 'dup' });
  check('T50', 'proof twice -> 400', proofAgain.status === 400);
  const reimb = await req('PATCH', `/mdf/${id1}/reimburse`, admin.token);
  check('T51', 'admin reimburses 200', reimb.status === 200);
  const reimbAgain = await req('PATCH', `/mdf/${id1}/reimburse`, admin.token);
  check('T52', 'double reimburse -> 400', reimbAgain.status === 400);

  const mdf2 = await req('POST', '/mdf', chinedu.token, { title: 'QA Reject-me Campaign', activityType: 'Digital Campaign', amountRequested: 200000 });
  const id2 = mdf2.data?.id;
  const rej = await req('PATCH', `/mdf/${id2}/reject`, admin.token, { reason: 'Budget exhausted - QA' });
  check('T53a', 'admin rejects 200', rej.status === 200);
  const appRejected = await req('PATCH', `/mdf/${id2}/approve`, admin.token, {});
  check('T53b', 'approve after reject -> 400', appRejected.status === 400);

  const meta = await req('GET', '/mdf/meta', chinedu.token);
  check('T54', `meta reimbursed includes 300k (got ${meta.data?.reimbursed})`, meta.status === 200 && meta.data.reimbursed >= 300000);

  const mdfNeg = await req('POST', '/mdf', chinedu.token, { title: 'QA negative amount', amountRequested: -5000 });
  const negRow = mdfNeg.status === 201 ? (await req('GET', '/mdf', chinedu.token)).data.find(x => x.id === mdfNeg.data.id) : null;
  check('T55', `negative amount handled (status=${mdfNeg.status}, stored=${negRow?.amount_requested})`,
    mdfNeg.status === 400 || (negRow && negRow.amount_requested === 0), '(note: 201 with 0 stored is tolerated but flagged)');

  const fatimaList = await req('GET', '/mdf', fatima.token);
  check('T56', 'DataStream list contains no Acme MDF rows', fatimaList.status === 200 && !fatimaList.data.some(x => x.org_id === acmeOrg));

  // ===== SUPPORT LIFECYCLE =====
  const tk = await req('POST', '/support', amaka.token, { subject: 'QA: VPC peering failing', category: 'Technical', priority: 'Urgent', body: 'Peering between two FCS VPCs drops after 60s. <script>alert(1)</script>' });
  check('T60', 'amaka opens Urgent ticket 201', tk.status === 201 && !!tk.data.id);
  const tid = tk.data?.id;
  const tlist = await req('GET', '/support', amaka.token);
  const trow = tlist.data?.find(t => t.id === tid);
  check('T61', 'SLA: Urgent target 4h, unresponded, not breached', trow?.sla?.targetHours === 4 && trow.sla.responded === false && trow.sla.breached === false);
  const cross = await req('GET', `/support/${tid}`, fatima.token);
  check('T62', 'cross-tenant ticket read -> 403', cross.status === 403);
  const fList = await req('GET', '/support', fatima.token);
  check('T63', 'DataStream ticket list excludes Acme ticket', fList.status === 200 && !fList.data.some(t => t.id === tid));
  const sameOrg = await req('GET', `/support/${tid}`, chinedu.token);
  check('T64', 'same-org colleague can read ticket', sameOrg.status === 200);
  await req('POST', `/support/${tid}/reply`, amaka.token, { body: 'Adding logs: MTU 1500.' });
  const afterPartnerReply = await req('GET', `/support/${tid}`, amaka.token);
  check('T65', 'partner reply does NOT set first_response/status', afterPartnerReply.data?.first_response_at == null && afterPartnerReply.data?.status === 'open');
  const staffReply = await req('POST', `/support/${tid}/reply`, admin.token, { body: 'QA: known issue, patch rolling out.' });
  check('T66a', 'staff reply 201', staffReply.status === 201);
  const afterStaff = await req('GET', `/support/${tid}`, amaka.token);
  check('T66b', 'first staff reply sets first_response_at + pending + sla.responded',
    !!afterStaff.data?.first_response_at && afterStaff.data.status === 'pending' && afterStaff.data.sla.responded === true);
  check('T66c', 'reply flagged is_staff', afterStaff.data?.replies?.some(r => r.is_staff === 1));
  const resolve = await req('PATCH', `/support/${tid}/status`, amaka.token, { status: 'resolved' });
  const resolved = await req('GET', `/support/${tid}`, amaka.token);
  check('T67', 'resolve 200 + resolved_at stamped', resolve.status === 200 && !!resolved.data?.resolved_at);
  const reopen = await req('PATCH', `/support/${tid}/status`, amaka.token, { status: 'open' });
  const reopened = await req('GET', `/support/${tid}`, amaka.token);
  check('T68', 'reopen 200 + resolved_at cleared', reopen.status === 200 && reopened.data?.resolved_at == null);
  const badStatus = await req('PATCH', `/support/${tid}/status`, admin.token, { status: 'closed' });
  check('T69', "invalid status 'closed' -> 400", badStatus.status === 400);
  const crossStatus = await req('PATCH', `/support/${tid}/status`, fatima.token, { status: 'resolved' });
  check('T70', 'cross-tenant status change -> 403', crossStatus.status === 403);
  const setMgr = await req('PATCH', `/support/manager/${acmeOrg}`, admin.token, { name: 'Ada Obi', email: 'ada.obi@nobus.io' });
  const metaAfter = await req('GET', '/support/meta', chinedu.token);
  check('T71', 'admin sets partner manager; partner sees it in meta',
    setMgr.status === 200 && metaAfter.data?.partnerManager?.name === 'Ada Obi' && metaAfter.data.partnerManager.email === 'ada.obi@nobus.io');
  const mgr403 = await req('PATCH', `/support/manager/${acmeOrg}`, fatima.token, { name: 'Evil', email: 'e@e.com' });
  check('T72', 'org_admin cannot set partner manager -> 403', mgr403.status === 403);
  const noBody = await req('POST', '/support', amaka.token, { subject: 'no body' });
  check('T73', 'ticket without body -> 400', noBody.status === 400);
  const bogusCat = await req('POST', '/support', amaka.token, { subject: 'QA bogus cat', category: 'HAXX', priority: 'MEGA', body: 'x' });
  const bogusRow = (await req('GET', '/support', amaka.token)).data?.find(t => t.id === bogusCat.data?.id);
  check('T74', 'bogus category/priority coerced to General/Normal', bogusRow?.category === 'General' && bogusRow?.priority === 'Normal');

  console.log(`\n===== RESULT: ${pass} passed, ${fail} failed =====`);
  if (failures.length) { console.log('FAILURES:'); failures.forEach(f => console.log('  - ' + f)); }
};
main().catch(e => { console.error('SUITE ERROR', e); process.exit(1); });
