import db from '../db.js';

export function createNotification({ userId, type, title, message, link }) {
  db.prepare(`
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, type, title, message, link || null);
}

// Notify all super admins
export function notifySuperAdmins({ type, title, message, link }) {
  const admins = db.prepare("SELECT id FROM users WHERE role = 'super_admin' AND status = 'active'").all();
  for (const admin of admins) {
    createNotification({ userId: admin.id, type, title, message, link });
  }
}

// Notify all users in an org
export function notifyOrg({ orgId, type, title, message, link }) {
  const users = db.prepare("SELECT id FROM users WHERE org_id = ? AND status = 'active'").all(orgId);
  for (const user of users) {
    createNotification({ userId: user.id, type, title, message, link });
  }
}

export function awardPoints(userId, action, points, description) {
  db.prepare(`
    INSERT INTO user_points (user_id, action, points, description)
    VALUES (?, ?, ?, ?)
  `).run(userId, action, points, description);
}
