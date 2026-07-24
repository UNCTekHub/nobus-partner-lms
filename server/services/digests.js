import { sendDigestEmail } from './email.js';
import { EMAIL_CATEGORIES } from './notifications.js';

// Batched summary emails, so low-urgency signal doesn't drip one message at a
// time. Digests are email-only (not in-app) and honour the 'digest' preference.
const DIGEST_CAT = 'digest';
const digestDefault = EMAIL_CATEGORIES.find((c) => c.key === DIGEST_CAT)?.default ?? true;

function digestEnabled(db, userId) {
  const row = db.prepare('SELECT email_enabled FROM notification_preferences WHERE user_id = ? AND category = ?').get(userId, DIGEST_CAT);
  return row ? !!row.email_enabled : digestDefault;
}

// Daily operations summary to Nobus staff: what came in over the last 24h.
export function runOpsDigest(db) {
  const admins = db.prepare("SELECT id, name, email FROM users WHERE role = 'super_admin' AND status = 'active' AND email IS NOT NULL").all();
  if (admins.length === 0) return 0;
  const since = "datetime('now', '-1 day')";
  const deals = db.prepare(`SELECT COUNT(*) c FROM deals WHERE created_at >= ${since}`).get().c;
  const mdf = db.prepare(`SELECT COUNT(*) c FROM mdf_requests WHERE created_at >= ${since}`).get().c;
  const tickets = db.prepare(`SELECT COUNT(*) c FROM support_tickets WHERE created_at >= ${since}`).get().c;
  const openTickets = db.prepare("SELECT COUNT(*) c FROM support_tickets WHERE status = 'open'").get().c;
  if (deals + mdf + tickets === 0) return 0; // nothing to report

  const lines = [
    `New deal registrations: ${deals}`,
    `New MDF requests: ${mdf}`,
    `New support tickets: ${tickets}`,
    `Currently open tickets: ${openTickets}`,
  ];
  let sent = 0;
  for (const a of admins) {
    if (!digestEnabled(db, a.id)) continue;
    sendDigestEmail({ to: a.email, name: a.name, subject: 'Nobus PartnerCentral - daily operations summary', intro: 'Here is what came in over the last 24 hours:', lines, link: '/ncs-console', ctaText: 'Open the console' })
      .catch((err) => console.error('[Digest] ops digest failed:', err.message));
    sent++;
  }
  return sent;
}

// Weekly training summary to org admins + team managers: who is behind.
export function runManagerDigest(db) {
  const managers = db.prepare("SELECT id, name, email, org_id, role, role_category FROM users WHERE role IN ('org_admin','team_manager') AND status = 'active' AND email IS NOT NULL").all();
  let sent = 0;
  for (const m of managers) {
    if (!digestEnabled(db, m.id)) continue;
    // Scope: org admin -> whole org; team manager -> their function.
    const scope = m.role === 'org_admin'
      ? { where: 'u.org_id = ?', params: [m.org_id] }
      : { where: 'u.org_id = ? AND u.role_category = ?', params: [m.org_id, m.role_category] };
    const overdue = db.prepare(`
      SELECT COUNT(*) c FROM training_assignments a JOIN users u ON a.user_id = u.id
      WHERE ${scope.where} AND a.cancelled_at IS NULL AND a.due_date IS NOT NULL
      AND a.due_date < date('now')
      AND NOT EXISTS (SELECT 1 FROM completed_paths cp WHERE cp.user_id = a.user_id AND cp.path_id = a.path_id)
    `).get(...scope.params).c;
    const pending = db.prepare(`
      SELECT COUNT(*) c FROM training_assignments a JOIN users u ON a.user_id = u.id
      WHERE ${scope.where} AND a.cancelled_at IS NULL
      AND NOT EXISTS (SELECT 1 FROM completed_paths cp WHERE cp.user_id = a.user_id AND cp.path_id = a.path_id)
    `).get(...scope.params).c;
    if (pending === 0) continue; // nothing outstanding for this manager

    sendDigestEmail({
      to: m.email, name: m.name, subject: 'Your team training summary',
      intro: 'Here is where your team stands on assigned training this week:',
      lines: [`Assignments still outstanding: ${pending}`, `Of those, overdue: ${overdue}`],
      link: '/org-admin', ctaText: 'Review your team',
    }).catch((err) => console.error('[Digest] manager digest failed:', err.message));
    sent++;
  }
  return sent;
}
