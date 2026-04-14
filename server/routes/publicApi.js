import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Middleware: authenticate via API key (x-api-key header)
function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'API key required. Pass via x-api-key header.' });

  // Find key by checking hash
  const keys = db.prepare("SELECT * FROM api_keys WHERE active = 1").all();
  const matched = keys.find(k => bcrypt.compareSync(apiKey, k.key_hash));
  if (!matched) return res.status(401).json({ error: 'Invalid API key' });

  // Check expiry
  if (matched.expires_at && new Date(matched.expires_at) < new Date()) {
    return res.status(401).json({ error: 'API key has expired' });
  }

  // Update last_used
  db.prepare("UPDATE api_keys SET last_used = datetime('now') WHERE id = ?").run(matched.id);

  req.apiOrg = db.prepare('SELECT * FROM organizations WHERE id = ?').get(matched.org_id);
  req.apiKeyPermissions = JSON.parse(matched.permissions || '["read"]');
  next();
}

// ==================== API KEY MANAGEMENT (for authenticated web users) ====================

// POST /api/public/keys — generate API key (org admin or super admin)
router.post('/keys', authenticate, requireRole('super_admin', 'org_admin'), (req, res) => {
  const { name, orgId } = req.body;
  const targetOrgId = orgId || req.user.org_id;
  if (!targetOrgId) return res.status(400).json({ error: 'Organization ID required' });

  const rawKey = `nbs_${crypto.randomBytes(24).toString('hex')}`;
  const keyHash = bcrypt.hashSync(rawKey, 10);

  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year

  db.prepare(`
    INSERT INTO api_keys (org_id, key_hash, name, permissions, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(targetOrgId, keyHash, name || 'Default Key', '["read"]', expiresAt);

  // Only show the raw key ONCE
  res.status(201).json({
    message: 'API key created. Save this key — it will not be shown again.',
    apiKey: rawKey,
    expiresAt,
  });
});

// GET /api/public/keys — list API keys (without the actual keys)
router.get('/keys', authenticate, requireRole('super_admin', 'org_admin'), (req, res) => {
  const orgId = req.query.orgId || req.user.org_id;
  const keys = db.prepare(`
    SELECT id, org_id, name, permissions, last_used, expires_at, active, created_at
    FROM api_keys WHERE org_id = ? ORDER BY created_at DESC
  `).all(orgId);
  res.json(keys);
});

// DELETE /api/public/keys/:id — revoke an API key
router.delete('/keys/:id', authenticate, requireRole('super_admin', 'org_admin'), (req, res) => {
  db.prepare('UPDATE api_keys SET active = 0 WHERE id = ?').run(req.params.id);
  res.json({ message: 'API key revoked' });
});

// ==================== PUBLIC API ENDPOINTS (API key auth) ====================

// GET /api/public/v1/organization — get org info
router.get('/v1/organization', authenticateApiKey, (req, res) => {
  const org = req.apiOrg;
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE org_id = ?').get(org.id).count;
  res.json({
    id: org.id, name: org.name, partnerId: org.partner_id,
    tier: org.tier, status: org.status, userCount,
  });
});

// GET /api/public/v1/users — list org users
router.get('/v1/users', authenticateApiKey, (req, res) => {
  const users = db.prepare(`
    SELECT id, name, email, role, role_category, status, joined_date, last_active, learning_streak
    FROM users WHERE org_id = ? ORDER BY name
  `).all(req.apiOrg.id);

  const enriched = users.map(u => {
    const completedPaths = db.prepare('SELECT path_id FROM completed_paths WHERE user_id = ?').all(u.id).map(p => p.path_id);
    const badges = db.prepare('SELECT badge_name FROM badges WHERE user_id = ?').all(u.id).map(b => b.badge_name);
    return { ...u, completedPaths, badges };
  });

  res.json(enriched);
});

// GET /api/public/v1/progress — get org-wide learning progress
router.get('/v1/progress', authenticateApiKey, (req, res) => {
  const orgId = req.apiOrg.id;
  const stats = {
    totalUsers: db.prepare('SELECT COUNT(*) as c FROM users WHERE org_id = ?').get(orgId).c,
    activeUsers: db.prepare("SELECT COUNT(*) as c FROM users WHERE org_id = ? AND status = 'active'").get(orgId).c,
    lessonsCompleted: db.prepare('SELECT COUNT(*) as c FROM lesson_progress lp JOIN users u ON lp.user_id = u.id WHERE u.org_id = ?').get(orgId).c,
    quizzesPassed: db.prepare('SELECT COUNT(*) as c FROM quiz_results qr JOIN users u ON qr.user_id = u.id WHERE u.org_id = ? AND qr.passed = 1').get(orgId).c,
    pathsCompleted: db.prepare('SELECT COUNT(*) as c FROM completed_paths cp JOIN users u ON cp.user_id = u.id WHERE u.org_id = ?').get(orgId).c,
    certifications: db.prepare('SELECT COUNT(*) as c FROM badges b JOIN users u ON b.user_id = u.id WHERE u.org_id = ?').get(orgId).c,
  };

  res.json(stats);
});

// GET /api/public/v1/certificates — list certificates for org
router.get('/v1/certificates', authenticateApiKey, (req, res) => {
  const certs = db.prepare(`
    SELECT u.name, u.email, cp.path_id, cp.completed_at, b.badge_name
    FROM completed_paths cp
    JOIN users u ON cp.user_id = u.id
    LEFT JOIN badges b ON b.user_id = u.id
    WHERE u.org_id = ?
    ORDER BY cp.completed_at DESC
  `).all(req.apiOrg.id);

  res.json(certs);
});

// GET /api/public/docs — API documentation
router.get('/docs', (req, res) => {
  res.json({
    name: 'Nobus Cloud Partner LMS API',
    version: '1.0',
    baseUrl: '/api/public/v1',
    authentication: 'API Key via x-api-key header',
    endpoints: [
      { method: 'GET', path: '/v1/organization', description: 'Get organization details' },
      { method: 'GET', path: '/v1/users', description: 'List organization users with progress' },
      { method: 'GET', path: '/v1/progress', description: 'Get aggregate learning progress stats' },
      { method: 'GET', path: '/v1/certificates', description: 'List all earned certificates' },
    ],
    keyManagement: [
      { method: 'POST', path: '/keys', description: 'Generate new API key (requires auth)' },
      { method: 'GET', path: '/keys', description: 'List API keys (requires auth)' },
      { method: 'DELETE', path: '/keys/:id', description: 'Revoke API key (requires auth)' },
    ],
  });
});

export default router;
