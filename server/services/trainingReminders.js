import { userPathStatus, pathById } from '../paths.js';
import { createNotification } from './notifications.js';

// Automated training reminders + escalation. Idempotent per run: a per-assignment
// cooldown (last_reminded_at) prevents spam, and escalated_at fires the org-admin
// escalation only once. Safe to run on a timer and to call directly from tests.

const DUE_SOON_DAYS = 2;          // remind the assignee this many days before due
const REMIND_COOLDOWN_HOURS = 24; // never re-remind the same assignment within this window
const ESCALATE_OVERDUE_DAYS = 7;  // escalate to org admins once past this many days overdue

export function runTrainingReminders(db, now = new Date()) {
  const rows = db.prepare('SELECT * FROM training_assignments WHERE cancelled_at IS NULL AND due_date IS NOT NULL').all();
  let reminded = 0, escalated = 0;

  for (const a of rows) {
    if (userPathStatus(db, a.user_id, a.path_id) === 'completed') continue;

    const due = new Date(a.due_date + 'T23:59:59Z');
    const daysLeft = (due - now) / 86400000;
    const overdue = daysLeft < 0;
    const dueSoon = daysLeft >= 0 && daysLeft <= DUE_SOON_DAYS;
    const pathName = pathById(a.path_id)?.name || a.path_id;

    const lastRem = a.last_reminded_at ? new Date(a.last_reminded_at + 'Z') : null;
    const remindable = !lastRem || (now - lastRem) / 3600000 >= REMIND_COOLDOWN_HOURS;

    if ((overdue || dueSoon) && remindable) {
      createNotification({
        userId: a.user_id, type: 'training',
        title: overdue ? 'Training overdue' : 'Training due soon',
        message: `"${pathName}" is ${overdue ? 'overdue' : `due ${a.due_date}`}. Please complete it to stay on track.`,
        link: '/certification',
      });
      db.prepare("UPDATE training_assignments SET last_reminded_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").run(a.id);
      reminded++;
    }

    if (overdue && -daysLeft >= ESCALATE_OVERDUE_DAYS && !a.escalated_at) {
      const admins = db.prepare("SELECT id FROM users WHERE org_id = ? AND role = 'org_admin' AND status = 'active'").all(a.org_id);
      const member = db.prepare('SELECT name FROM users WHERE id = ?').get(a.user_id);
      for (const adm of admins) {
        createNotification({
          userId: adm.id, type: 'training',
          title: 'Training badly overdue',
          message: `${member?.name || 'A team member'} is over ${ESCALATE_OVERDUE_DAYS} days overdue on "${pathName}".`,
          link: '/org-admin',
        });
      }
      db.prepare("UPDATE training_assignments SET escalated_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").run(a.id);
      escalated++;
    }
  }
  return { scanned: rows.length, reminded, escalated };
}
