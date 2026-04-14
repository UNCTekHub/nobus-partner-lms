import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { parse } from 'csv-parse/sync';
import multer from 'multer';
import db from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { logAudit, getIP } from '../services/audit.js';
import { createNotification, notifySuperAdmins } from '../services/notifications.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

// ==================== USER MANAGEMENT ====================

// PATCH /api/admin/users/:id — edit user (role, role_category, status, name, email)
router.patch('/users/:id', authenticate, requireRole('super_admin'), (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { name, email, role, roleCategory, status, orgId } = req.body;
  const updates = [];
  const params = [];

  if (name) { updates.push('name = ?'); params.push(name); }
  if (email) {
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ?').get(email, user.id);
    if (existing) return res.status(409).json({ error: 'Email already in use' });
    updates.push('email = ?'); params.push(email);
  }
  if (role) { updates.push('role = ?'); params.push(role); }
  if (roleCategory !== undefined) { updates.push('role_category = ?'); params.push(roleCategory); }
  if (status) { updates.push('status = ?'); params.push(status); }
  if (orgId !== undefined) { updates.push('org_id = ?'); params.push(orgId || null); }

  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

  params.push(req.params.id);
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  logAudit({ userId: req.user.id, action: 'user_updated', entityType: 'user', entityId: req.params.id, details: JSON.stringify(req.body), ipAddress: getIP(req) });
  res.json({ message: 'User updated' });
});

// POST /api/admin/users/:id/reset-password — reset user password
router.post('/users/:id/reset-password', authenticate, requireRole('super_admin'), (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const tempPassword = crypto.randomBytes(4).toString('hex');
  const passwordHash = bcrypt.hashSync(tempPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, user.id);

  createNotification({ userId: user.id, type: 'security', title: 'Password Reset', message: 'Your password has been reset by an administrator. Please login with your new temporary password and change it immediately.', link: '/profile' });
  logAudit({ userId: req.user.id, action: 'password_reset', entityType: 'user', entityId: user.id, ipAddress: getIP(req) });

  res.json({ message: 'Password reset', tempPassword });
});

// DELETE /api/admin/users/:id — delete user
router.delete('/users/:id', authenticate, requireRole('super_admin'), (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.role === 'super_admin') return res.status(400).json({ error: 'Cannot delete a super admin' });

  // Clean up related data
  db.prepare('DELETE FROM lesson_progress WHERE user_id = ?').run(user.id);
  db.prepare('DELETE FROM quiz_results WHERE user_id = ?').run(user.id);
  db.prepare('DELETE FROM badges WHERE user_id = ?').run(user.id);
  db.prepare('DELETE FROM completed_paths WHERE user_id = ?').run(user.id);
  db.prepare('DELETE FROM notifications WHERE user_id = ?').run(user.id);
  db.prepare('DELETE FROM user_points WHERE user_id = ?').run(user.id);
  db.prepare('DELETE FROM user_profiles WHERE user_id = ?').run(user.id);
  db.prepare('DELETE FROM users WHERE id = ?').run(user.id);

  logAudit({ userId: req.user.id, action: 'user_deleted', entityType: 'user', entityId: user.id, details: `Deleted user: ${user.email}`, ipAddress: getIP(req) });
  res.json({ message: 'User deleted' });
});

// ==================== ORGANIZATION DRILL-DOWN ====================

// GET /api/admin/organizations/:id — get organization detail with full team data
router.get('/organizations/:id', authenticate, requireRole('super_admin'), (req, res) => {
  const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(req.params.id);
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const users = db.prepare(`
    SELECT id, name, email, role, role_category, status, joined_date, last_active, learning_streak
    FROM users WHERE org_id = ? ORDER BY name
  `).all(org.id);

  // Enrich users with badges and completed paths
  const enrichedUsers = users.map(u => {
    const badges = db.prepare('SELECT badge_name FROM badges WHERE user_id = ?').all(u.id).map(b => b.badge_name);
    const completedPaths = db.prepare('SELECT path_id FROM completed_paths WHERE user_id = ?').all(u.id).map(p => p.path_id);
    const totalPoints = db.prepare('SELECT COALESCE(SUM(points), 0) as total FROM user_points WHERE user_id = ?').get(u.id).total;
    return { ...u, badges, completedPaths, totalPoints };
  });

  // Trained counts per category
  const trainedCounts = { Sales: 0, Presales: 0, Technical: 0 };
  for (const u of enrichedUsers) {
    if (u.completedPaths.length > 0 && u.role_category && u.role_category in trainedCounts) {
      trainedCounts[u.role_category]++;
    }
  }

  // Quiz performance
  const quizStats = db.prepare(`
    SELECT COUNT(*) as total_attempts,
      SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as total_passed,
      ROUND(AVG(CAST(score AS REAL) / total * 100), 1) as avg_score
    FROM quiz_results WHERE user_id IN (SELECT id FROM users WHERE org_id = ?)
  `).get(org.id);

  res.json({
    ...org,
    specializations: JSON.parse(org.specializations || '[]'),
    users: enrichedUsers,
    totalUsers: users.length,
    trainedCounts,
    quizStats,
  });
});

// PATCH /api/admin/organizations/:id — update org details (tier, status, etc)
router.patch('/organizations/:id', authenticate, requireRole('super_admin'), (req, res) => {
  const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(req.params.id);
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const { tier, status, name } = req.body;
  const updates = [];
  const params = [];
  if (tier) { updates.push('tier = ?'); params.push(tier); }
  if (status) { updates.push('status = ?'); params.push(status); }
  if (name) { updates.push('name = ?'); params.push(name); }
  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

  updates.push("updated_at = datetime('now')");
  params.push(req.params.id);
  db.prepare(`UPDATE organizations SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  logAudit({ userId: req.user.id, action: 'org_updated', entityType: 'organization', entityId: req.params.id, details: JSON.stringify(req.body), ipAddress: getIP(req) });
  res.json({ message: 'Organization updated' });
});

// ==================== SEARCH & FILTER ====================

// GET /api/admin/search — search across orgs and users
router.get('/search', authenticate, requireRole('super_admin'), (req, res) => {
  const { q, type } = req.query;
  if (!q || q.length < 2) return res.json({ organizations: [], users: [] });

  const pattern = `%${q}%`;
  let organizations = [];
  let users = [];

  if (!type || type === 'organizations') {
    organizations = db.prepare(`
      SELECT id, name, partner_id, tier, status, state FROM organizations
      WHERE name LIKE ? OR partner_id LIKE ? OR rc_number LIKE ?
      LIMIT 20
    `).all(pattern, pattern, pattern);
  }

  if (!type || type === 'users') {
    users = db.prepare(`
      SELECT u.id, u.name, u.email, u.role, u.status, o.name as org_name
      FROM users u LEFT JOIN organizations o ON u.org_id = o.id
      WHERE u.name LIKE ? OR u.email LIKE ?
      LIMIT 20
    `).all(pattern, pattern);
  }

  res.json({ organizations, users });
});

// ==================== AUDIT LOG ====================

// GET /api/admin/audit — get audit trail
router.get('/audit', authenticate, requireRole('super_admin'), (req, res) => {
  const { page = 1, limit = 50, action, entity_type } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let sql = `
    SELECT a.*, u.name as user_name, u.email as user_email
    FROM audit_log a LEFT JOIN users u ON a.user_id = u.id
  `;
  const params = [];
  const conditions = [];
  if (action) { conditions.push('a.action = ?'); params.push(action); }
  if (entity_type) { conditions.push('a.entity_type = ?'); params.push(entity_type); }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const logs = db.prepare(sql).all(...params);
  const total = db.prepare('SELECT COUNT(*) as count FROM audit_log').get().count;

  res.json({ logs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
});

// ==================== REPORTING & EXPORT ====================

// GET /api/admin/reports/users — CSV export of all users
router.get('/reports/users', authenticate, requireRole('super_admin'), (req, res) => {
  const users = db.prepare(`
    SELECT u.name, u.email, u.role, u.role_category, u.status, u.joined_date, u.last_active, u.learning_streak,
           o.name as organization, o.partner_id, o.tier
    FROM users u LEFT JOIN organizations o ON u.org_id = o.id ORDER BY u.name
  `).all();

  const headers = 'Name,Email,Role,Category,Status,Joined,Last Active,Streak,Organization,Partner ID,Tier\n';
  const rows = users.map(u =>
    `"${u.name}","${u.email}","${u.role}","${u.role_category || ''}","${u.status}","${u.joined_date || ''}","${u.last_active || ''}",${u.learning_streak},"${u.organization || 'N/A'}","${u.partner_id || ''}","${u.tier || ''}"`
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=nobus-lms-users.csv');
  res.send(headers + rows);
});

// GET /api/admin/reports/organizations — CSV export of orgs
router.get('/reports/organizations', authenticate, requireRole('super_admin'), (req, res) => {
  const orgs = db.prepare(`
    SELECT o.*, (SELECT COUNT(*) FROM users WHERE org_id = o.id) as user_count
    FROM organizations o ORDER BY o.name
  `).all();

  const headers = 'Name,Partner ID,RC Number,Tier,Status,State,Enrolled,Users\n';
  const rows = orgs.map(o =>
    `"${o.name}","${o.partner_id}","${o.rc_number}","${o.tier}","${o.status}","${o.state || ''}","${o.enrollment_date || ''}",${o.user_count}`
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=nobus-lms-organizations.csv');
  res.send(headers + rows);
});

// GET /api/admin/reports/progress — CSV export of learning progress
router.get('/reports/progress', authenticate, requireRole('super_admin'), (req, res) => {
  const data = db.prepare(`
    SELECT u.name, u.email, o.name as org_name,
      (SELECT COUNT(*) FROM lesson_progress WHERE user_id = u.id) as lessons_completed,
      (SELECT COUNT(*) FROM quiz_results WHERE user_id = u.id AND passed = 1) as quizzes_passed,
      (SELECT COUNT(*) FROM completed_paths WHERE user_id = u.id) as paths_completed,
      (SELECT GROUP_CONCAT(path_id) FROM completed_paths WHERE user_id = u.id) as completed_paths,
      (SELECT GROUP_CONCAT(badge_name) FROM badges WHERE user_id = u.id) as badges
    FROM users u LEFT JOIN organizations o ON u.org_id = o.id
    WHERE u.role != 'super_admin' ORDER BY u.name
  `).all();

  const headers = 'Name,Email,Organization,Lessons Completed,Quizzes Passed,Paths Completed,Completed Paths,Badges\n';
  const rows = data.map(d =>
    `"${d.name}","${d.email}","${d.org_name || 'N/A'}",${d.lessons_completed},${d.quizzes_passed},${d.paths_completed},"${d.completed_paths || ''}","${d.badges || ''}"`
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=nobus-lms-progress.csv');
  res.send(headers + rows);
});

// GET /api/admin/reports/dashboard — analytics data for dashboard
router.get('/reports/dashboard', authenticate, requireRole('super_admin'), (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const activeUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'active'").get().count;
  const totalOrgs = db.prepare('SELECT COUNT(*) as count FROM organizations').get().count;
  const pendingApps = db.prepare("SELECT COUNT(*) as count FROM pending_organizations WHERE status = 'pending'").get().count;
  const totalLessonsCompleted = db.prepare('SELECT COUNT(*) as count FROM lesson_progress').get().count;
  const totalQuizzesPassed = db.prepare('SELECT COUNT(*) as count FROM quiz_results WHERE passed = 1').get().count;
  const totalCertificates = db.prepare('SELECT COUNT(*) as count FROM completed_paths').get().count;

  // Monthly signups (last 6 months)
  const monthlySignups = db.prepare(`
    SELECT strftime('%Y-%m', joined_date) as month, COUNT(*) as count
    FROM users WHERE joined_date >= date('now', '-6 months')
    GROUP BY strftime('%Y-%m', joined_date) ORDER BY month
  `).all();

  // Top organizations by completion
  const topOrgs = db.prepare(`
    SELECT o.name, o.tier,
      (SELECT COUNT(*) FROM completed_paths cp JOIN users u ON cp.user_id = u.id WHERE u.org_id = o.id) as completions,
      (SELECT COUNT(*) FROM users WHERE org_id = o.id) as user_count
    FROM organizations o ORDER BY completions DESC LIMIT 10
  `).all();

  res.json({
    totalUsers, activeUsers, totalOrgs, pendingApps,
    totalLessonsCompleted, totalQuizzesPassed, totalCertificates,
    monthlySignups, topOrgs,
  });
});

// ==================== BULK USER IMPORT ====================

// POST /api/admin/users/bulk-import — CSV upload
router.post('/users/bulk-import', authenticate, requireRole('super_admin', 'org_admin'), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'CSV file is required' });

  try {
    const records = parse(req.file.buffer.toString(), { columns: true, skip_empty_lines: true, trim: true });
    const results = { created: 0, skipped: 0, errors: [] };
    const orgId = req.body.orgId || req.user.org_id;

    if (!orgId) return res.status(400).json({ error: 'Organization ID is required' });

    for (const row of records) {
      const name = row.name || row.Name || row.full_name;
      const email = row.email || row.Email;
      const roleCategory = row.role_category || row.roleCategory || row.Role || 'Sales';

      if (!name || !email) {
        results.errors.push(`Missing name or email in row: ${JSON.stringify(row)}`);
        results.skipped++;
        continue;
      }

      const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email);
      if (existing) {
        results.errors.push(`User ${email} already exists`);
        results.skipped++;
        continue;
      }

      const userId = `user-${crypto.randomUUID().slice(0, 8)}`;
      const tempPassword = crypto.randomBytes(4).toString('hex');
      const passwordHash = bcrypt.hashSync(tempPassword, 10);

      db.prepare(`
        INSERT INTO users (id, org_id, name, email, password_hash, role, role_category, status)
        VALUES (?, ?, ?, ?, ?, 'user', ?, 'active')
      `).run(userId, orgId, name, email, passwordHash, roleCategory);

      results.created++;
    }

    logAudit({ userId: req.user.id, action: 'bulk_import', entityType: 'users', details: `Imported ${results.created} users`, ipAddress: getIP(req) });
    res.json(results);
  } catch (err) {
    res.status(400).json({ error: 'Failed to parse CSV: ' + err.message });
  }
});

// ==================== QUIZ RETAKE POLICY ====================

// GET /api/admin/quiz-policies — list all policies
router.get('/quiz-policies', authenticate, requireRole('super_admin'), (req, res) => {
  const policies = db.prepare('SELECT * FROM quiz_policies ORDER BY quiz_id').all();
  res.json(policies);
});

// PUT /api/admin/quiz-policies/:quizId — set policy for a quiz
router.put('/quiz-policies/:quizId', authenticate, requireRole('super_admin'), (req, res) => {
  const { maxAttempts, cooldownHours } = req.body;
  db.prepare(`
    INSERT INTO quiz_policies (quiz_id, max_attempts, cooldown_hours, updated_by)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(quiz_id) DO UPDATE SET max_attempts = ?, cooldown_hours = ?, updated_by = ?, updated_at = datetime('now')
  `).run(req.params.quizId, maxAttempts || 3, cooldownHours || 24, req.user.id, maxAttempts || 3, cooldownHours || 24, req.user.id);

  res.json({ message: 'Quiz policy updated' });
});

// ==================== CONTENT VERSIONING ====================

// GET /api/admin/content-history — get content change history
router.get('/content-history', authenticate, requireRole('super_admin'), (req, res) => {
  const history = db.prepare(`
    SELECT cv.*, u.name as changed_by_name
    FROM content_versions cv JOIN users u ON cv.changed_by = u.id
    ORDER BY cv.created_at DESC LIMIT 100
  `).all();
  res.json(history);
});

// ==================== SSO CONFIG ====================

// GET /api/admin/sso/:orgId — get SSO config for an org
router.get('/sso/:orgId', authenticate, requireRole('super_admin'), (req, res) => {
  const config = db.prepare('SELECT * FROM sso_configs WHERE org_id = ?').get(req.params.orgId);
  res.json(config || { enabled: false });
});

// PUT /api/admin/sso/:orgId — update SSO config
router.put('/sso/:orgId', authenticate, requireRole('super_admin'), (req, res) => {
  const { provider, entityId, ssoUrl, certificate, enabled } = req.body;
  db.prepare(`
    INSERT INTO sso_configs (org_id, provider, entity_id, sso_url, certificate, enabled)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(org_id) DO UPDATE SET provider = ?, entity_id = ?, sso_url = ?, certificate = ?, enabled = ?, updated_at = datetime('now')
  `).run(req.params.orgId, provider, entityId, ssoUrl, certificate, enabled ? 1 : 0,
         provider, entityId, ssoUrl, certificate, enabled ? 1 : 0);

  logAudit({ userId: req.user.id, action: 'sso_configured', entityType: 'organization', entityId: req.params.orgId, ipAddress: getIP(req) });
  res.json({ message: 'SSO configuration saved' });
});

export default router;
