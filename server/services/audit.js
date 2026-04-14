import db from '../db.js';

// Log an action to the audit trail
export function logAudit({ userId, action, entityType, entityId, details, ipAddress }) {
  db.prepare(`
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId || null, action, entityType || null, entityId || null, details || null, ipAddress || null);
}

// Helper to extract IP from request
export function getIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
}
