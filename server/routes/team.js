import { Router } from 'express';
import crypto from 'crypto';
import db from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { createNotification } from '../services/notifications.js';
import { logAudit, getIP } from '../services/audit.js';
import { sendPasswordResetEmail } from '../services/email.js';
import { PATHS, PATH_IDS, pathById, userPathStatus } from '../paths.js';
import { canManageMember, memberScopeClause, ASSIGNABLE_TENANT_ROLES } from '../services/orgScope.js';
import { runTrainingReminders } from '../services/trainingReminders.js';

const router = Router();

const ROLE_CATEGORIES = ['Sales', 'Presales', 'Technical'];
const NUDGE_COOLDOWN_HOURS = 12; // one nudge per member (per path) per this window

const canManage = (u) => u.role === 'org_admin' || u.role === 'team_manager';

function countActiveOrgAdmins(orgId) {
  return db.prepare("SELECT COUNT(*) AS c FROM users WHERE org_id = ? AND role = 'org_admin' AND status = 'active'").get(orgId).c;
}

// Load a target member and confirm the actor may manage them; sends the response
// and returns null on failure.
function loadManaged(req, res, allowSelf = true) {
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!target) { res.status(404).json({ error: 'Member not found' }); return null; }
  if (target.role === 'super_admin') { res.status(403).json({ error: 'Not permitted' }); return null; }
  if (!allowSelf && target.id === req.user.id) { res.status(400).json({ error: 'Cannot perform this action on your own account' }); return null; }
  if (!canManageMember(req.user, target)) { res.status(403).json({ error: 'This member is outside your scope' }); return null; }
  return target;
}

// GET /api/team/meta - who am I, and the options the UI needs
router.get('/meta', authenticate, (req, res) => {
  if (!canManage(req.user)) return res.status(403).json({ error: 'Not a team manager or org admin' });
  res.json({
    role: req.user.role,
    roleCategory: req.user.role_category,
    isOrgAdmin: req.user.role === 'org_admin',
    paths: PATHS,
    roleCategories: ROLE_CATEGORIES,
    assignableRoles: ASSIGNABLE_TENANT_ROLES,
  });
});

// GET /api/team/members - scope-aware roster with per-path training status
router.get('/members', authenticate, (req, res) => {
  if (!canManage(req.user)) return res.status(403).json({ error: 'Not permitted' });
  const { where, params } = memberScopeClause(req.user);
  const members = db.prepare(`
    SELECT id, name, email, role, role_category, status, last_active, learning_streak
    FROM users WHERE ${where} ORDER BY name
  `).all(...params);

  const assignStmt = db.prepare('SELECT * FROM training_assignments WHERE user_id = ? AND cancelled_at IS NULL');
  const lastNudgeStmt = db.prepare('SELECT MAX(created_at) AS t FROM training_nudges WHERE to_user = ?');
  const today = new Date().toISOString().slice(0, 10);

  const rows = members.map((m) => {
    const assignments = assignStmt.all(m.id);
    const byPath = Object.fromEntries(assignments.map((a) => [a.path_id, a]));
    const training = PATHS.map((p) => {
      const status = userPathStatus(db, m.id, p.id);
      const a = byPath[p.id];
      return {
        pathId: p.id, name: p.name, category: p.category, status,
        assignment: a ? {
          id: a.id, dueDate: a.due_date, note: a.note,
          overdue: !!a.due_date && status !== 'completed' && a.due_date < today,
        } : null,
      };
    });
    return {
      id: m.id, name: m.name, email: m.email, role: m.role, roleCategory: m.role_category,
      status: m.status, lastActive: m.last_active, streak: m.learning_streak,
      certifiedCount: training.filter((t) => t.status === 'completed').length,
      lastNudgedAt: lastNudgeStmt.get(m.id).t,
      training,
    };
  });
  res.json(rows);
});

// POST /api/team/assign - assign a learning path to a member (idempotent per path)
router.post('/assign', authenticate, (req, res) => {
  if (!canManage(req.user)) return res.status(403).json({ error: 'Not permitted' });
  const { userId, pathId, dueDate, note } = req.body;
  if (!PATH_IDS.includes(pathId)) return res.status(400).json({ error: 'Unknown learning path' });
  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return res.status(400).json({ error: 'Due date must be YYYY-MM-DD' });

  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!target) return res.status(404).json({ error: 'Member not found' });
  if (!canManageMember(req.user, target)) return res.status(403).json({ error: 'This member is outside your scope' });

  // Reactivate a cancelled assignment for the same path, else insert a new one.
  const existing = db.prepare('SELECT * FROM training_assignments WHERE user_id = ? AND path_id = ?').get(userId, pathId);
  if (existing) {
    db.prepare(`UPDATE training_assignments SET cancelled_at = NULL, due_date = ?, note = ?, assigned_by = ?,
      last_reminded_at = NULL, escalated_at = NULL, updated_at = datetime('now') WHERE id = ?`)
      .run(dueDate || null, note || null, req.user.id, existing.id);
  } else {
    db.prepare(`INSERT INTO training_assignments (org_id, user_id, path_id, assigned_by, due_date, note)
      VALUES (?, ?, ?, ?, ?, ?)`).run(target.org_id, userId, pathId, req.user.id, dueDate || null, note || null);
  }

  const pathName = pathById(pathId).name;
  createNotification({
    userId, type: 'training', title: 'New training assigned',
    message: `${req.user.name} assigned you "${pathName}"${dueDate ? `, due ${dueDate}` : ''}.`,
    link: '/certification',
  });
  logAudit({ userId: req.user.id, action: 'training_assigned', entityType: 'user', entityId: userId, details: pathId, ipAddress: getIP(req) });
  res.status(201).json({ message: 'Training assigned' });
});

// PATCH /api/team/assign/:id/cancel
router.patch('/assign/:id/cancel', authenticate, (req, res) => {
  if (!canManage(req.user)) return res.status(403).json({ error: 'Not permitted' });
  const a = db.prepare('SELECT * FROM training_assignments WHERE id = ?').get(req.params.id);
  if (!a || a.cancelled_at) return res.status(404).json({ error: 'Assignment not found' });
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(a.user_id);
  if (!canManageMember(req.user, target)) return res.status(403).json({ error: 'Outside your scope' });
  db.prepare("UPDATE training_assignments SET cancelled_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").run(a.id);
  res.json({ message: 'Assignment cancelled' });
});

// POST /api/team/nudge - remind a member about training (rate-limited, scoped)
router.post('/nudge', authenticate, (req, res) => {
  if (!canManage(req.user)) return res.status(403).json({ error: 'Not permitted' });
  const { userId, pathId } = req.body;
  if (pathId && !PATH_IDS.includes(pathId)) return res.status(400).json({ error: 'Unknown learning path' });
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!target) return res.status(404).json({ error: 'Member not found' });
  if (target.id === req.user.id) return res.status(400).json({ error: 'You cannot nudge yourself' });
  if (!canManageMember(req.user, target)) return res.status(403).json({ error: 'This member is outside your scope' });

  // Rate limit: one nudge per member (per path, if given) within the cooldown.
  const recent = db.prepare(`
    SELECT COUNT(*) AS c FROM training_nudges
    WHERE to_user = ? AND (path_id IS ? OR ? IS NULL)
    AND created_at > datetime('now', ?)
  `).get(userId, pathId || null, pathId || null, `-${NUDGE_COOLDOWN_HOURS} hours`).c;
  if (recent > 0) return res.status(429).json({ error: `Already nudged recently. Please wait before nudging again.` });

  const pathName = pathId ? pathById(pathId).name : null;
  db.prepare('INSERT INTO training_nudges (org_id, from_user, to_user, path_id) VALUES (?, ?, ?, ?)')
    .run(target.org_id, req.user.id, userId, pathId || null);
  createNotification({
    userId, type: 'training', title: 'A reminder from your manager',
    message: `${req.user.name} is nudging you${pathName ? ` to complete "${pathName}"` : ' about your training'}.`,
    link: '/certification',
  });
  logAudit({ userId: req.user.id, action: 'training_nudge', entityType: 'user', entityId: userId, details: pathId || 'general', ipAddress: getIP(req) });
  res.status(201).json({ message: 'Nudge sent' });
});

// ---- Org-admin-only: roles, resets, status, audit ----

// PATCH /api/team/members/:id/role - change a member's tenant role
router.patch('/members/:id/role', authenticate, requireRole('org_admin'), (req, res) => {
  const target = loadManaged(req, res, false); // no self
  if (!target) return;
  const { role, roleCategory } = req.body;
  if (!ASSIGNABLE_TENANT_ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role for a partner tenant' });

  // Team managers must belong to a function.
  const newCategory = roleCategory && ROLE_CATEGORIES.includes(roleCategory) ? roleCategory : target.role_category;
  if (role === 'team_manager' && !newCategory) {
    return res.status(400).json({ error: 'A team manager needs a function (Sales / Presales / Technical)' });
  }
  // Never strand a tenant with zero admins.
  if (target.role === 'org_admin' && role !== 'org_admin' && countActiveOrgAdmins(target.org_id) <= 1) {
    return res.status(400).json({ error: 'Your organization must keep at least one active admin' });
  }

  db.prepare('UPDATE users SET role = ?, role_category = ? WHERE id = ?').run(role, newCategory || null, target.id);
  const label = role === 'org_admin' ? 'Org Admin' : role === 'team_manager' ? 'Team Manager' : 'Member';
  createNotification({ userId: target.id, type: 'account', title: 'Your access level changed', message: `You are now a ${label} for ${req.user.name ? 'your organization' : 'your team'}.`, link: '/' });
  logAudit({ userId: req.user.id, action: 'member_role_changed', entityType: 'user', entityId: target.id, details: `${target.role} -> ${role}`, ipAddress: getIP(req) });
  res.json({ message: `Role updated to ${label}` });
});

// POST /api/team/members/:id/reset-password - trigger an emailed reset (no
// password is ever revealed to the admin), revoking the member's sessions.
router.post('/members/:id/reset-password', authenticate, requireRole('org_admin'), (req, res) => {
  const target = loadManaged(req, res, true);
  if (!target) return;

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  db.prepare('UPDATE password_resets SET used = 1 WHERE user_id = ?').run(target.id);
  db.prepare('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)').run(target.id, token, expiresAt);
  // Revoke the member's existing sessions immediately.
  db.prepare("UPDATE users SET token_version = COALESCE(token_version, 0) + 1 WHERE id = ?").run(target.id);

  const resetUrl = `${process.env.PLATFORM_URL || 'http://localhost:3001'}/reset-password?token=${token}`;
  sendPasswordResetEmail({ contactName: target.name, contactEmail: target.email, resetUrl })
    .catch((err) => console.error('[Team Reset] Email error:', err.message));
  createNotification({ userId: target.id, type: 'account', title: 'Password reset requested', message: `${req.user.name} started a password reset for your account. Check your email for the link.`, link: '/' });
  logAudit({ userId: req.user.id, action: 'member_password_reset', entityType: 'user', entityId: target.id, ipAddress: getIP(req) });
  res.json({ message: `A password reset link has been emailed to ${target.email}. Their current sessions have been signed out.` });
});

// PATCH /api/team/members/:id/status - activate / deactivate (last-admin guarded)
router.patch('/members/:id/status', authenticate, requireRole('org_admin'), (req, res) => {
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) return res.status(400).json({ error: 'Status must be active or inactive' });
  const target = loadManaged(req, res, false); // no self
  if (!target) return;
  if (status === 'inactive' && target.role === 'org_admin' && countActiveOrgAdmins(target.org_id) <= 1) {
    return res.status(400).json({ error: 'Your organization must keep at least one active admin' });
  }
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, target.id);
  createNotification({ userId: target.id, type: 'account', title: `Account ${status === 'active' ? 'reactivated' : 'deactivated'}`, message: `Your account was ${status === 'active' ? 'reactivated' : 'deactivated'} by ${req.user.name}.`, link: '/' });
  logAudit({ userId: req.user.id, action: 'member_status_changed', entityType: 'user', entityId: target.id, details: status, ipAddress: getIP(req) });
  res.json({ message: `Member ${status === 'active' ? 'activated' : 'deactivated'}` });
});

// GET /api/team/audit - tenant activity feed (actions by this org's members)
router.get('/audit', authenticate, requireRole('org_admin'), (req, res) => {
  const rows = db.prepare(`
    SELECT a.id, a.action, a.entity_type, a.entity_id, a.details, a.created_at, u.name AS actor_name
    FROM audit_log a JOIN users u ON a.user_id = u.id
    WHERE u.org_id = ? ORDER BY a.created_at DESC LIMIT 100
  `).all(req.user.org_id);
  res.json(rows);
});

// POST /api/team/run-reminders - manual trigger for the reminder sweep (org admin).
// The same routine runs automatically on a timer; this lets an admin force it.
router.post('/run-reminders', authenticate, requireRole('org_admin'), (req, res) => {
  const result = runTrainingReminders(db);
  res.json({ message: 'Reminder sweep complete', ...result });
});

export default router;
