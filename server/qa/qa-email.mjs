// QA suite for the notification/email pipeline. The server AND this script run
// with EMAIL_TEST_FILE set: every intended send is appended there, so we can
// assert emails fire (policy + preferences) without real SMTP. Also exercises
// the proactive sweeps and digests directly.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
const fs = require('fs');
const { runProactiveSweeps } = await import('../services/proactiveSweeps.js');
const { runOpsDigest, runManagerDigest } = await import('../services/digests.js');

const BASE = process.env.QA_BASE || 'http://localhost:3101/api';
const DB = process.env.DB_PATH;
const OUTBOX = process.env.EMAIL_TEST_FILE;
let pass = 0, fail = 0; const failures = [];
function check(id, desc, cond, extra = '') {
  if (cond) { pass++; console.log(`PASS ${id} ${desc}`); }
  else { fail++; failures.push(`${id} ${desc} ${extra}`); console.log(`FAIL ${id} ${desc} ${extra}`); }
}
async function req(method, path, token, body) {
  const r = await fetch(BASE + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  let data = null; try { data = await r.json(); } catch {}
  return { status: r.status, data };
}
async function login(email, password) { const r = await req('POST', '/auth/login', null, { email, password }); return { token: r.data?.token, user: r.data?.user, org: r.data?.organization }; }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function outbox() { try { return fs.readFileSync(OUTBOX, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; } }
// wait until an email matching (to, subjectSubstr) appears
async function waitEmail(to, subjectSub, ms = 4000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (outbox().some((e) => e.to === to && e.subject.includes(subjectSub))) return true;
    await sleep(150);
  }
  return false;
}

const main = async () => {
  if (!OUTBOX) { console.log('EMAIL_TEST_FILE not set'); process.exit(1); }
  fs.writeFileSync(OUTBOX, '');
  const db = new Database(DB);
  // Normalize the two actors to known roles so this suite is independent of any
  // role changes a prior suite (e.g. qa-team) may have made on the shared DB.
  db.prepare("UPDATE users SET role='org_admin', role_category='Technical' WHERE id='user-001'").run(); // chinedu
  db.prepare("UPDATE users SET role='user', role_category='Sales' WHERE id='user-002'").run();          // amaka
  db.prepare("DELETE FROM notification_preferences WHERE category = 'digest'").run(); // reset digest opt-outs to default

  const admin = await login('admin@nobus.cloud', 'Nobus@2026!');
  const chinedu = await login('chinedu@acmetech.ng', 'demo'); // Acme org_admin
  const amaka = await login('amaka@acmetech.ng', 'demo');     // Acme user (Sales)
  const amakaId = amaka.user.id, chineduEmail = 'chinedu@acmetech.ng', amakaEmail = 'amaka@acmetech.ng';

  // ---- preferences endpoint ----
  const prefs = await req('GET', '/notifications/preferences', amaka.token);
  check('E01', 'preferences lists optional categories (training/achievements/content/digest)',
    prefs.status === 200 && ['training', 'achievements', 'content', 'digest'].every((k) => prefs.data.categories.some((c) => c.key === k)));
  check('E02', 'emailConfigured is false in test (no real SMTP)', prefs.data.emailConfigured === false);

  // ---- always-on: training assignment emails the member (default on) ----
  await req('POST', '/team/assign', chinedu.token, { userId: amakaId, pathId: 'presales-enablement', dueDate: '2026-10-01' });
  check('E10', 'training assignment emails the member', await waitEmail(amakaEmail, 'New training assigned'));

  // ---- preference gating: disable training, assign again -> NO new email ----
  await req('PUT', '/notifications/preferences', amaka.token, { category: 'training', enabled: false });
  const before = outbox().length;
  await req('POST', '/team/assign', chinedu.token, { userId: amakaId, pathId: 'technical-enablement' });
  await sleep(1500);
  const newAmakaTraining = outbox().slice(before).filter((e) => e.to === amakaEmail && e.subject.includes('training'));
  check('E11', 'disabling the training preference suppresses that email', newAmakaTraining.length === 0);
  // re-enable for cleanliness
  await req('PUT', '/notifications/preferences', amaka.token, { category: 'training', enabled: true });

  // ---- always-on: deal approval emails the submitter ----
  const deal = await req('POST', '/deals', chinedu.token, { customerName: 'QA Mail Bank', opportunityName: 'QA Mail Deal', estValue: 5000000 });
  await req('PATCH', `/deals/${deal.data.id}/approve`, admin.token);
  check('E12', 'deal approval emails the submitter (always-on)', await waitEmail(chineduEmail, 'Deal approved') || await waitEmail(chineduEmail, 'approved'));

  // ---- always-on: MDF approval emails the requester ----
  const mdf = await req('POST', '/mdf', chinedu.token, { title: 'QA Mail MDF', amountRequested: 100000 });
  await req('PATCH', `/mdf/${mdf.data.id}/approve`, admin.token, { amountApproved: 100000 });
  check('E13', 'MDF approval emails the requester', await waitEmail(chineduEmail, 'MDF') );

  // ---- always-on: support staff reply emails the ticket creator ----
  const tk = await req('POST', '/support', amaka.token, { subject: 'QA Mail Ticket', body: 'help', priority: 'High' });
  await req('POST', `/support/${tk.data.id}/reply`, admin.token, { body: 'On it.' });
  check('E14', 'staff reply emails the partner', await waitEmail(amakaEmail, 'Support replied') || await waitEmail(amakaEmail, 'replied'));

  // ---- proactive sweeps (run directly; they email via the pipeline) ----
  fs.writeFileSync(OUTBOX, '');
  // dormancy: approved deal, no activity 101 days
  const d2 = await req('POST', '/deals', chinedu.token, { customerName: 'QA Dormant Co', opportunityName: 'QA Dormant Deal', estValue: 2000000 });
  await req('PATCH', `/deals/${d2.data.id}/approve`, admin.token);
  db.prepare("UPDATE deals SET last_activity_at = datetime('now','-101 days'), dormancy_warned_at = NULL WHERE id = ?").run(d2.data.id);
  // SLA: open Urgent ticket aged 5h
  const tk2 = await req('POST', '/support', amaka.token, { subject: 'QA SLA Ticket', body: 'urgent', priority: 'Urgent' });
  db.prepare("UPDATE support_tickets SET created_at = datetime('now','-5 hours'), first_response_at = NULL, sla_alerted_at = NULL, status='open' WHERE id = ?").run(tk2.data.id);
  // lab booking tomorrow
  const lab = db.prepare('SELECT id FROM demo_labs LIMIT 1').get();
  db.prepare("INSERT INTO lab_bookings (lab_id, user_id, org_id, scheduled_date, time_slot, status) VALUES (?,?,?,date('now','+1 day'),'10:00','booked')")
    .run(lab.id, amakaId, chinedu.org.id);

  const sweep = runProactiveSweeps(db);
  check('E20', `dormancy sweep warns (got ${sweep.dormancy})`, sweep.dormancy >= 1);
  check('E21', `SLA sweep alerts (got ${sweep.sla})`, sweep.sla >= 1);
  check('E22', `lab reminder sweep (got ${sweep.labs})`, sweep.labs >= 1);
  await sleep(500);
  check('E23', 'dormancy email sent to deal owner', outbox().some((e) => e.to === chineduEmail && e.subject.includes('protection at risk')));
  check('E24', 'SLA breach email sent to Nobus admin', outbox().some((e) => e.to === 'admin@nobus.cloud' && e.subject.includes('SLA breach')));
  check('E25', 'lab reminder email sent to booker', outbox().some((e) => e.to === amakaEmail && e.subject.includes('lab session')));

  const sweep2 = runProactiveSweeps(db);
  check('E26', 'sweeps are idempotent (no re-fire second run)', sweep2.dormancy === 0 && sweep2.sla === 0 && sweep2.labs === 0);

  // ---- digests ----
  fs.writeFileSync(OUTBOX, '');
  const ops = runOpsDigest(db); // recent deals/mdf/tickets exist from above
  await sleep(300);
  check('E30', `ops digest emails admin (sent ${ops})`, ops >= 1 && outbox().some((e) => e.to === 'admin@nobus.cloud' && e.subject.includes('operations summary')));
  // manager digest: amaka has an outstanding assignment (presales) -> chinedu (org admin) gets a summary
  const mgr = runManagerDigest(db);
  await sleep(300);
  check('E31', `manager digest emails a manager (sent ${mgr})`, mgr >= 1 && outbox().some((e) => e.subject.includes('team training summary')));
  // digest preference off -> suppressed
  db.prepare("INSERT INTO notification_preferences (user_id, category, email_enabled) VALUES (?, 'digest', 0) ON CONFLICT(user_id,category) DO UPDATE SET email_enabled=0").run('user-nobus-admin');
  fs.writeFileSync(OUTBOX, '');
  runOpsDigest(db);
  await sleep(300);
  check('E32', 'digest preference off suppresses ops digest to that admin', !outbox().some((e) => e.to === 'admin@nobus.cloud'));

  db.close();
  console.log(`\n===== EMAIL QA RESULT: ${pass} passed, ${fail} failed =====`);
  if (failures.length) { console.log('FAILURES:'); failures.forEach((f) => console.log('  - ' + f)); }
  if (fail) process.exit(1);
};
main().catch((e) => { console.error('SUITE ERROR', e); process.exit(1); });
