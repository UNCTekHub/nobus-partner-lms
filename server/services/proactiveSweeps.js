import { createNotification, notifySuperAdmins } from './notifications.js';

// Proactive notifications for events that aren't triggered by a user action.
// Each is fired once per event (guarded by a *_at column) and is idempotent.

const DORMANCY_LIMIT_DAYS = 120; // protection lapses after this much inactivity
const DORMANCY_WARN_DAYS = 100;  // warn 20 days ahead
const SLA_HOURS = { Urgent: 4, High: 8, Normal: 24, Low: 48 };

// Approved deals with no activity for ~100 days: warn the owner once, before the
// 120-day dormancy lapses their protection. Cleared again when they log activity.
export function runDormancyWarnings(db) {
  const rows = db.prepare(`
    SELECT id, opportunity_name, submitted_by FROM deals
    WHERE status = 'approved' AND dormancy_warned_at IS NULL
    AND COALESCE(last_activity_at, updated_at) <= datetime('now', '-${DORMANCY_WARN_DAYS} days')
  `).all();
  for (const d of rows) {
    createNotification({
      userId: d.submitted_by, type: 'deal', title: 'Deal protection at risk',
      message: `Your protected deal "${d.opportunity_name}" has had no activity for about ${DORMANCY_WARN_DAYS} days. Log an update soon - protection lapses after ${DORMANCY_LIMIT_DAYS} days of dormancy.`,
      link: '/deals',
    });
    db.prepare("UPDATE deals SET dormancy_warned_at = datetime('now') WHERE id = ?").run(d.id);
  }
  return rows.length;
}

// Open tickets past their first-response SLA with no staff reply: alert Nobus ops once.
export function runSlaAlerts(db, now = new Date()) {
  const rows = db.prepare("SELECT id, subject, priority, created_at FROM support_tickets WHERE status = 'open' AND first_response_at IS NULL AND sla_alerted_at IS NULL").all();
  let n = 0;
  for (const t of rows) {
    const target = SLA_HOURS[t.priority] ?? 24;
    const ageH = (now - new Date(t.created_at + 'Z')) / 3600000;
    if (ageH >= target) {
      notifySuperAdmins({
        type: 'support', title: `SLA breach: ${t.priority} ticket`,
        message: `"${t.subject}" has passed its ${target}h first-response target with no reply yet.`,
        link: '/ncs-console',
      });
      db.prepare("UPDATE support_tickets SET sla_alerted_at = datetime('now') WHERE id = ?").run(t.id);
      n++;
    }
  }
  return n;
}

// Booked lab sessions happening today/tomorrow: remind the booker once.
export function runLabReminders(db) {
  const rows = db.prepare(`
    SELECT b.id, b.user_id, b.scheduled_date, b.time_slot, l.title AS lab_title
    FROM lab_bookings b JOIN demo_labs l ON b.lab_id = l.id
    WHERE b.status = 'booked' AND b.reminded_at IS NULL
    AND date(b.scheduled_date) >= date('now') AND date(b.scheduled_date) <= date('now', '+1 day')
  `).all();
  for (const b of rows) {
    createNotification({
      userId: b.user_id, type: 'lab', title: 'Upcoming lab session',
      message: `Reminder: "${b.lab_title}" is scheduled for ${b.scheduled_date} (${b.time_slot}).`,
      link: '/demo-labs',
    });
    db.prepare("UPDATE lab_bookings SET reminded_at = datetime('now') WHERE id = ?").run(b.id);
  }
  return rows.length;
}

export function runProactiveSweeps(db) {
  return {
    dormancy: runDormancyWarnings(db),
    sla: runSlaAlerts(db),
    labs: runLabReminders(db),
  };
}
