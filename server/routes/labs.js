import { Router } from 'express';
import db from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { createNotification, notifySuperAdmins } from '../services/notifications.js';

const router = Router();

const TIME_SLOTS = ['09:00 - 11:00', '11:00 - 13:00', '14:00 - 16:00', '16:00 - 18:00'];

// GET /api/labs - lab catalogue
router.get('/', authenticate, (req, res) => {
  const labs = db.prepare('SELECT * FROM demo_labs WHERE active = 1 ORDER BY service_area, title').all();
  res.json(labs);
});

// GET /api/labs/bookings - my bookings (super admin sees all)
router.get('/bookings', authenticate, (req, res) => {
  const base = `
    SELECT b.*, l.title as lab_title, l.service_area, l.duration_minutes, u.name as user_name, o.name as org_name
    FROM lab_bookings b
    JOIN demo_labs l ON b.lab_id = l.id
    JOIN users u ON b.user_id = u.id
    LEFT JOIN organizations o ON b.org_id = o.id
  `;
  if (req.user.role === 'super_admin') {
    return res.json(db.prepare(base + ' ORDER BY b.scheduled_date DESC LIMIT 300').all());
  }
  res.json(db.prepare(base + ' WHERE b.user_id = ? ORDER BY b.scheduled_date DESC').all(req.user.id));
});

// GET /api/labs/:id - lab detail with guide
router.get('/:id', authenticate, (req, res) => {
  const lab = db.prepare('SELECT * FROM demo_labs WHERE id = ? AND active = 1').get(req.params.id);
  if (!lab) return res.status(404).json({ error: 'Lab not found' });
  res.json(lab);
});

// GET /api/labs/:id/availability?date=YYYY-MM-DD - free slots for a day
router.get('/:id/availability', authenticate, (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date is required' });
  const taken = db.prepare(`
    SELECT time_slot FROM lab_bookings WHERE lab_id = ? AND scheduled_date = ? AND status = 'booked'
  `).all(req.params.id, date).map((r) => r.time_slot);
  res.json({ slots: TIME_SLOTS.map((slot) => ({ slot, available: !taken.includes(slot) })) });
});

// POST /api/labs/:id/book - book a session
router.post('/:id/book', authenticate, (req, res) => {
  const { date, timeSlot, notes } = req.body;
  if (!date || !timeSlot) return res.status(400).json({ error: 'Date and time slot are required' });
  if (!TIME_SLOTS.includes(timeSlot)) return res.status(400).json({ error: 'Invalid time slot' });

  const lab = db.prepare('SELECT * FROM demo_labs WHERE id = ? AND active = 1').get(req.params.id);
  if (!lab) return res.status(404).json({ error: 'Lab not found' });

  const clash = db.prepare(`
    SELECT id FROM lab_bookings WHERE lab_id = ? AND scheduled_date = ? AND time_slot = ? AND status = 'booked'
  `).get(req.params.id, date, timeSlot);
  if (clash) return res.status(409).json({ error: 'That slot is already booked. Pick another.' });

  const result = db.prepare(`
    INSERT INTO lab_bookings (lab_id, user_id, org_id, scheduled_date, time_slot, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.params.id, req.user.id, req.user.org_id || null, date, timeSlot, notes || null);

  notifySuperAdmins({
    type: 'lab',
    title: 'Demo lab booked',
    message: `${req.user.name} booked "${lab.title}" on ${date} (${timeSlot})`,
    link: '/demo-labs',
  });
  res.status(201).json({ id: result.lastInsertRowid, message: 'Lab session booked' });
});

// PATCH /api/labs/bookings/:id/cancel - cancel own booking
router.patch('/bookings/:id/cancel', authenticate, (req, res) => {
  const booking = db.prepare('SELECT * FROM lab_bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (req.user.role !== 'super_admin' && booking.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Not your booking' });
  }
  db.prepare("UPDATE lab_bookings SET status = 'cancelled' WHERE id = ?").run(req.params.id);
  res.json({ message: 'Booking cancelled' });
});

// PATCH /api/labs/bookings/:id/complete - mark session done (super admin)
router.patch('/bookings/:id/complete', authenticate, requireRole('super_admin'), (req, res) => {
  const booking = db.prepare('SELECT * FROM lab_bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  db.prepare("UPDATE lab_bookings SET status = 'completed' WHERE id = ?").run(req.params.id);
  createNotification({
    userId: booking.user_id, type: 'lab',
    title: 'Lab session completed',
    message: 'Your demo lab session was marked completed. Nice work!',
    link: '/demo-labs',
  });
  res.json({ message: 'Booking completed' });
});

// POST /api/labs - create a lab (super admin)
router.post('/', authenticate, requireRole('super_admin'), (req, res) => {
  const { title, description, serviceArea, difficulty, durationMinutes, guide } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const result = db.prepare(`
    INSERT INTO demo_labs (title, description, service_area, difficulty, duration_minutes, guide)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(title, description || null, serviceArea || null, difficulty || 'Beginner', durationMinutes || 60, guide || null);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Lab created' });
});

// PATCH /api/labs/:id - edit / deactivate a lab (super admin)
router.patch('/:id', authenticate, requireRole('super_admin'), (req, res) => {
  const lab = db.prepare('SELECT id FROM demo_labs WHERE id = ?').get(req.params.id);
  if (!lab) return res.status(404).json({ error: 'Lab not found' });
  const { title, description, serviceArea, difficulty, durationMinutes, guide, active } = req.body;
  db.prepare(`
    UPDATE demo_labs SET
      title = COALESCE(?, title), description = COALESCE(?, description),
      service_area = COALESCE(?, service_area), difficulty = COALESCE(?, difficulty),
      duration_minutes = COALESCE(?, duration_minutes), guide = COALESCE(?, guide),
      active = COALESCE(?, active), updated_at = datetime('now')
    WHERE id = ?
  `).run(
    title ?? null, description ?? null, serviceArea ?? null, difficulty ?? null,
    durationMinutes ?? null, guide ?? null, active ?? null, req.params.id
  );
  res.json({ message: 'Lab updated' });
});

export default router;
