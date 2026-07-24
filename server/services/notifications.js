import db from '../db.js';
import { sendNotificationEmail } from './email.js';

// ---- Email policy ----------------------------------------------------------
// Every in-app notification can also become an email. The notification `type`
// decides the policy:
//   'always' -> transactional/security/money/appointments: sent regardless of prefs
//   'pref'   -> optional: sent only if the user hasn't disabled that category
//   (unmapped types stay in-app only and never email)
const EMAIL_POLICY = {
  account: { email: 'always' },
  security: { email: 'always' },
  welcome: { email: 'always' },
  approval: { email: 'always' },
  deal: { email: 'always' },
  mdf: { email: 'always' },
  support: { email: 'always' },
  lab: { email: 'always' },
  tier: { email: 'always' },
  training: { email: 'pref', category: 'training', def: 1 },
  achievement: { email: 'pref', category: 'achievements', def: 0 },
  content: { email: 'pref', category: 'content', def: 0 },
  digest: { email: 'pref', category: 'digest', def: 1 },
};

// User-facing preference categories (the opt-out-able ones). Always-on
// transactional emails are intentionally not listed - they cannot be disabled.
export const EMAIL_CATEGORIES = [
  { key: 'training', label: 'Training assignments, reminders & nudges', default: true },
  { key: 'achievements', label: 'Certifications & achievements', default: false },
  { key: 'content', label: 'New marketing content & collateral', default: false },
  { key: 'digest', label: 'Periodic summary digests', default: true },
];

function emailAllowed(userId, policy) {
  if (policy.email === 'always') return true;
  if (policy.email !== 'pref') return false;
  const row = db.prepare('SELECT email_enabled FROM notification_preferences WHERE user_id = ? AND category = ?').get(userId, policy.category);
  return row ? !!row.email_enabled : !!policy.def;
}

// Fire-and-forget email for a notification, gated by policy + preferences.
function maybeEmail({ userId, type, title, message, link }) {
  const policy = EMAIL_POLICY[type];
  if (!policy || !emailAllowed(userId, policy)) return;
  const u = db.prepare('SELECT name, email FROM users WHERE id = ?').get(userId);
  if (!u?.email) return;
  sendNotificationEmail({ to: u.email, name: u.name, subject: title, message, link })
    .catch((err) => console.error('[Email] notification email failed:', err.message));
}

export function createNotification({ userId, type, title, message, link }) {
  db.prepare('INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)')
    .run(userId, type, title, message, link || null);
  maybeEmail({ userId, type, title, message, link });
}

// Notify all super admins
export function notifySuperAdmins({ type, title, message, link }) {
  const admins = db.prepare("SELECT id FROM users WHERE role = 'super_admin' AND status = 'active'").all();
  for (const admin of admins) createNotification({ userId: admin.id, type, title, message, link });
}

// Notify all users in an org
export function notifyOrg({ orgId, type, title, message, link }) {
  const users = db.prepare("SELECT id FROM users WHERE org_id = ? AND status = 'active'").all(orgId);
  for (const user of users) createNotification({ userId: user.id, type, title, message, link });
}

export function awardPoints(userId, action, points, description) {
  db.prepare('INSERT INTO user_points (user_id, action, points, description) VALUES (?, ?, ?, ?)')
    .run(userId, action, points, description);
}
