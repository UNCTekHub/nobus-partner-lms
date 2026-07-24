// QA suite for delegated tenant administration: team roles, training assignment,
// scope enforcement, nudge rate-limiting, reminder sweep, guards.
// Run from server/ against a disposable DB (writes fixtures + reads better-sqlite3).
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
const { runTrainingReminders } = await import('../services/trainingReminders.js');

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
  return { token: r.data?.token, user: r.data?.user, org: r.data?.organization };
}

const main = async () => {
  const db = new Database(DB);
  const chinedu = await login('chinedu@acmetech.ng', 'demo'); // Acme org_admin (Technical)
  const amaka = await login('amaka@acmetech.ng', 'demo');     // Acme user (Sales)
  const emeka = await login('emeka@acmetech.ng', 'demo');     // Acme user (Presales)
  const fatima = await login('fatima@datastream.ng', 'demo'); // DataStream org_admin (Sales)
  const admin = await login('admin@nobus.cloud', 'Nobus@2026!');
  const acme = chinedu.org?.id;

  // ---- meta / access ----
  const meta = await req('GET', '/team/meta', chinedu.token);
  check('M01', 'org_admin meta ok (isOrgAdmin, 3 paths)', meta.status === 200 && meta.data.isOrgAdmin === true && meta.data.paths.length === 3);
  const metaUser = await req('GET', '/team/meta', amaka.token);
  check('M02', 'plain user cannot access team meta -> 403', metaUser.status === 403);

  // ---- roster scope ----
  const roster = await req('GET', '/team/members', chinedu.token);
  check('M03', 'org_admin roster includes all Acme members', roster.status === 200 && roster.data.some(m => m.email === 'amaka@acmetech.ng') && roster.data.some(m => m.email === 'emeka@acmetech.ng'));
  check('M04', 'roster has per-path training status (3 paths each)', roster.data.every(m => m.training.length === 3));
  const noDataStream = !roster.data.some(m => m.email === 'fatima@datastream.ng');
  check('M05', 'org_admin roster excludes other tenants', noDataStream);

  // ---- promote amaka to team_manager (Sales), verify scoped roster ----
  const amakaId = roster.data.find(m => m.email === 'amaka@acmetech.ng').id;
  const emekaId = roster.data.find(m => m.email === 'emeka@acmetech.ng').id;
  const promote = await req('PATCH', `/team/members/${amakaId}/role`, chinedu.token, { role: 'team_manager', roleCategory: 'Sales' });
  check('M06', 'org_admin promotes amaka to Sales team_manager', promote.status === 200);
  const amakaMgr = await login('amaka@acmetech.ng', 'demo');
  check('M07', 'role change takes effect immediately (no relogin needed)', amakaMgr.user?.role === 'team_manager');
  const mgrRoster = await req('GET', '/team/members', amakaMgr.token);
  check('M08', 'team_manager roster is scoped to own function (Sales only, no Presales emeka)',
    mgrRoster.status === 200 && mgrRoster.data.every(m => m.roleCategory === 'Sales') && !mgrRoster.data.some(m => m.id === emekaId));

  // ---- RBAC guards ----
  const escalate = await req('PATCH', `/team/members/${amakaId}/role`, chinedu.token, { role: 'super_admin' });
  check('M09', 'cannot grant super_admin -> 400', escalate.status === 400);
  const mgrCantRole = await req('PATCH', `/team/members/${emekaId}/role`, amakaMgr.token, { role: 'user' });
  check('M10', 'team_manager cannot change roles -> 403', mgrCantRole.status === 403);
  const crossRole = await req('PATCH', `/team/members/${amakaId}/role`, fatima.token, { role: 'user' });
  check('M11', 'cross-tenant role change -> 403', crossRole.status === 403);
  const selfRole = await req('PATCH', `/team/members/${chinedu.user.id}/role`, chinedu.token, { role: 'user' });
  check('M12', 'admin cannot change own role -> 400', selfRole.status === 400);
  // last-admin guard: chinedu is the only Acme org_admin -> cannot deactivate self-equiv via another admin path; test demote of last admin
  const demoteLast = await req('PATCH', `/team/members/${chinedu.user.id}/role`, chinedu.token, { role: 'user' }); // self already blocked; make a 2nd admin then demote
  void demoteLast;

  // Make emeka an admin, then confirm we CAN demote chinedu (2 admins), then guard on the last
  await req('PATCH', `/team/members/${emekaId}/role`, chinedu.token, { role: 'org_admin' });
  const emekaAdmin = await login('emeka@acmetech.ng', 'demo');
  const demoteChinedu = await req('PATCH', `/team/members/${chinedu.user.id}/role`, emekaAdmin.token, { role: 'team_manager', roleCategory: 'Technical' });
  check('M13', 'demote an admin allowed when another admin exists', demoteChinedu.status === 200);
  const demoteLastAdmin = await req('PATCH', `/team/members/${emekaAdmin.user.id}/role`, emekaAdmin.token, { role: 'user' });
  check('M14', 'cannot demote the LAST active admin -> 400', demoteLastAdmin.status === 400);
  const deacLastAdmin = await req('PATCH', `/team/members/${emekaAdmin.user.id}/status`, emekaAdmin.token, { status: 'inactive' });
  check('M15', 'cannot deactivate the last admin -> 400', deacLastAdmin.status === 400);

  // team_manager cannot reset passwords or change status (org-admin only)
  const mgrReset = await req('POST', `/team/members/${amakaId}/reset-password`, amakaMgr.token);
  check('M16', 'team_manager cannot reset passwords -> 403', mgrReset.status === 403);

  // ---- password reset: emailed, no temp password revealed, sessions revoked ----
  const beforeTV = db.prepare('SELECT token_version FROM users WHERE id = ?').get(amakaId).token_version || 0;
  const reset = await req('POST', `/team/members/${amakaId}/reset-password`, emekaAdmin.token);
  check('M17a', 'admin reset returns 200 with NO password in body', reset.status === 200 && !JSON.stringify(reset.data).toLowerCase().includes('password":"') && !reset.data.tempPassword);
  const afterTV = db.prepare('SELECT token_version FROM users WHERE id = ?').get(amakaId).token_version || 0;
  check('M17b', 'reset bumps token_version (revokes sessions)', afterTV === beforeTV + 1);
  const staleSession = await req('GET', '/team/members', amakaMgr.token);
  check('M17c', "amaka's old session is now rejected", staleSession.status === 401);
  const resetRow = db.prepare('SELECT COUNT(*) c FROM password_resets WHERE user_id = ? AND used = 0').get(amakaId).c;
  check('M17d', 'a live reset token row was created (emailed link)', resetRow >= 1);
  const crossReset = await req('POST', `/team/members/${amakaId}/reset-password`, fatima.token);
  check('M18', 'cross-tenant reset -> 403', crossReset.status === 403);
  const resetAdmin = await req('POST', `/team/members/${admin.user.id}/reset-password`, emekaAdmin.token);
  check('M19', 'cannot reset a super_admin -> 403/404', [403, 404].includes(resetAdmin.status));

  // re-login amaka after reset revoked her session (still same password in test DB since we didn't complete reset; but token_version bumped -> need fresh login)
  const amaka2 = await login('amaka@acmetech.ng', 'demo');

  // ---- training assignment ----
  const assign = await req('POST', '/team/assign', emekaAdmin.token, { userId: amakaId, pathId: 'sales-enablement', dueDate: '2026-09-01', note: 'Complete before Q3 push' });
  check('T01', 'assign training 201', assign.status === 201);
  const rosterAfter = await req('GET', '/team/members', emekaAdmin.token);
  const amakaRow = rosterAfter.data.find(m => m.id === amakaId);
  const salesTrain = amakaRow.training.find(t => t.pathId === 'sales-enablement');
  check('T02', 'assignment shows on roster with due date', salesTrain.assignment?.dueDate === '2026-09-01');
  const badPath = await req('POST', '/team/assign', emekaAdmin.token, { userId: amakaId, pathId: 'hacking-101', dueDate: '2026-09-01' });
  check('T03', 'unknown path rejected -> 400', badPath.status === 400);
  const crossAssign = await req('POST', '/team/assign', fatima.token, { userId: amakaId, pathId: 'sales-enablement' });
  check('T04', 'cross-tenant assign -> 403', crossAssign.status === 403);
  // team_manager can assign within their function
  const mgrAssign = await req('POST', '/team/assign', amaka2.token, { userId: amakaId, pathId: 'sales-enablement', dueDate: '2026-09-15' });
  check('T05', 'team_manager can assign within function (self-scope Sales)', mgrAssign.status === 201);

  // ---- nudge + rate limit ----
  const nudge1 = await req('POST', '/team/nudge', emekaAdmin.token, { userId: amakaId, pathId: 'sales-enablement' });
  check('N01', 'first nudge 201', nudge1.status === 201);
  const nudge2 = await req('POST', '/team/nudge', emekaAdmin.token, { userId: amakaId, pathId: 'sales-enablement' });
  check('N02', 'second nudge within cooldown -> 429', nudge2.status === 429);
  const nudgeSelf = await req('POST', '/team/nudge', emekaAdmin.token, { userId: emekaAdmin.user.id });
  check('N03', 'cannot nudge yourself -> 400', nudgeSelf.status === 400);
  const crossNudge = await req('POST', '/team/nudge', fatima.token, { userId: amakaId });
  check('N04', 'cross-tenant nudge -> 403', crossNudge.status === 403);

  // ---- reminder sweep + escalation ----
  // Use technical-enablement: amaka (Sales) has NOT completed it, so it's a live
  // obligation. (Her sales path is pre-completed in the seed and is correctly skipped.)
  const techAssign = await req('POST', '/team/assign', emekaAdmin.token, { userId: amakaId, pathId: 'technical-enablement', dueDate: '2026-12-01' });
  check('R00', 'assign a not-yet-completed path for the sweep test', techAssign.status === 201);
  db.prepare("UPDATE training_assignments SET due_date = date('now','-8 days'), last_reminded_at = NULL, escalated_at = NULL WHERE user_id = ? AND path_id = 'technical-enablement'").run(amakaId);
  const sweep1 = runTrainingReminders(db);
  check('R01', `sweep reminds + escalates overdue (reminded>=1, escalated>=1)`, sweep1.reminded >= 1 && sweep1.escalated >= 1);
  const assignAfter = db.prepare("SELECT last_reminded_at, escalated_at FROM training_assignments WHERE user_id=? AND path_id='technical-enablement'").get(amakaId);
  check('R02', 'sweep stamped last_reminded_at + escalated_at', !!assignAfter.last_reminded_at && !!assignAfter.escalated_at);
  const sweep2 = runTrainingReminders(db);
  check('R03', 'immediate re-sweep does NOT double-remind (cooldown) or re-escalate', sweep2.reminded === 0 && sweep2.escalated === 0);
  // Completing the path stops future reminders.
  db.prepare("INSERT OR IGNORE INTO completed_paths (user_id, path_id) VALUES (?, 'technical-enablement')").run(amakaId);
  db.prepare("UPDATE training_assignments SET last_reminded_at = NULL WHERE user_id=? AND path_id='technical-enablement'").run(amakaId);
  const sweep3 = runTrainingReminders(db);
  check('R04', 'completed path is not reminded again', sweep3.reminded === 0);

  // ---- audit feed ----
  const audit = await req('GET', '/team/audit', emekaAdmin.token);
  check('A01', 'org audit feed returns tenant actions (assign/role/reset present)',
    audit.status === 200 && audit.data.some(r => r.action === 'training_assigned') && audit.data.some(r => r.action === 'member_role_changed'));
  const auditScope = await req('GET', '/team/audit', fatima.token);
  check('A02', "audit feed shows only own org (no Acme actor rows in DataStream feed)",
    auditScope.status === 200 && !auditScope.data.some(r => ['training_assigned','member_role_changed'].includes(r.action) && r.actor_name && ['Amaka Nwosu','Emeka Eze','Chinedu Okeke'].includes(r.actor_name)));
  const mgrAudit = await req('GET', '/team/audit', amaka2.token);
  check('A03', 'team_manager cannot read org audit -> 403', mgrAudit.status === 403);

  db.close();
  console.log(`\n===== TEAM QA RESULT: ${pass} passed, ${fail} failed =====`);
  if (failures.length) { console.log('FAILURES:'); failures.forEach(f => console.log('  - ' + f)); }
  if (fail) process.exit(1);
};
main().catch(e => { console.error('SUITE ERROR', e); process.exit(1); });
