import { useState, useEffect, useCallback } from 'react';
import { FlaskConical, Clock, Calendar, X, Loader2, ArrowLeft, CheckCircle, Ban, Server, HardDrive, Shield, Container, Database, Workflow } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import MarkdownRenderer from '../components/MarkdownRenderer';

const AREA_ICONS = {
  Compute: Server,
  'Storage & Backup': HardDrive,
  'Networking & Security': Shield,
  Containers: Container,
  Databases: Database,
  Automation: Workflow,
};

const DIFF_COLORS = {
  Beginner: 'badge-green',
  Intermediate: 'badge-amber',
  Advanced: 'badge bg-red-50 text-red-700',
};

export default function DemoLabs() {
  const { isSuperAdmin } = useAuth();
  const [labs, setLabs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [booking, setBooking] = useState(null); // lab being booked
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [slot, setSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      const [labData, bookingData] = await Promise.all([api.getLabs(), api.getLabBookings()]);
      setLabs(labData);
      setBookings(bookingData);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!booking || !date) { setSlots([]); return; }
    api.getLabAvailability(booking.id, date)
      .then((res) => setSlots(res.slots))
      .catch(() => setSlots([]));
    setSlot('');
  }, [booking, date]);

  const submitBooking = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.bookLab(booking.id, { date, timeSlot: slot, notes });
      setNotice(`Booked "${booking.title}" for ${date}, ${slot}.`);
      setBooking(null);
      setDate(''); setSlot(''); setNotes('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (b) => {
    if (!window.confirm('Cancel this lab booking?')) return;
    await api.cancelLabBooking(b.id);
    load();
  };

  const complete = async (b) => {
    await api.completeLabBooking(b.id);
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-nobus-500" />
      </div>
    );
  }

  // ---------- Lab detail (guide) view ----------
  if (selected) {
    const Icon = AREA_ICONS[selected.service_area] || FlaskConical;
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-sm font-medium text-nobus-600 hover:text-nobus-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Demo Labs
        </button>
        <div className="card p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge-blue flex items-center gap-1"><Icon className="w-3 h-3" /> {selected.service_area}</span>
            <span className={DIFF_COLORS[selected.difficulty] || 'badge-blue'}>{selected.difficulty}</span>
            <span className="badge bg-gray-100 text-gray-600 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {selected.duration_minutes} min
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{selected.title}</h1>
          <p className="text-gray-600 mb-6 pb-6 border-b border-gray-100">{selected.description}</p>
          {selected.guide && <MarkdownRenderer content={selected.guide} />}
          <button className="btn-primary mt-6 flex items-center gap-2" onClick={() => { setBooking(selected); setSelected(null); }}>
            <Calendar className="w-4 h-4" /> Book This Lab
          </button>
        </div>
      </div>
    );
  }

  const myActive = bookings.filter((b) => b.status === 'booked');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 data-tour="tour-labs" className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FlaskConical className="w-7 h-7 text-nobus-500" /> Demo Labs
        </h1>
        <p className="text-gray-600">
          Guided sandbox scenarios on the Nobus platform for presales demos and hands-on practice. Book a slot and follow the lab guide.
        </p>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
      {notice && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center justify-between">
          <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {notice}</span>
          <button onClick={() => setNotice('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* My bookings */}
      {bookings.length > 0 && (
        <div className="card p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {isSuperAdmin ? 'All Bookings' : 'My Bookings'} ({myActive.length} upcoming)
          </h2>
          <div className="space-y-2">
            {bookings.slice(0, 8).map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-gray-50">
                <div>
                  <div className="text-sm font-medium text-gray-900">{b.lab_title}</div>
                  <div className="text-xs text-gray-500">
                    {b.scheduled_date} · {b.time_slot}
                    {isSuperAdmin && ` · ${b.user_name}${b.org_name ? ` (${b.org_name})` : ''}`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={
                    b.status === 'booked' ? 'badge-blue' : b.status === 'completed' ? 'badge-green' : 'badge bg-gray-100 text-gray-500'
                  }>{b.status}</span>
                  {b.status === 'booked' && (
                    <>
                      {isSuperAdmin && (
                        <button onClick={() => complete(b)} title="Mark completed"
                          className="p-1.5 rounded text-green-600 hover:bg-green-50"><CheckCircle className="w-4 h-4" /></button>
                      )}
                      <button onClick={() => cancel(b)} title="Cancel booking"
                        className="p-1.5 rounded text-red-500 hover:bg-red-50"><Ban className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lab catalogue */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {labs.map((lab) => {
          const Icon = AREA_ICONS[lab.service_area] || FlaskConical;
          return (
            <div key={lab.id} className="card p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-nobus-50 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-nobus-500" />
                </div>
                <span className={DIFF_COLORS[lab.difficulty] || 'badge-blue'}>{lab.difficulty}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{lab.title}</h3>
              <p className="text-sm text-gray-500 mb-3 flex-1">{lab.description}</p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {lab.duration_minutes} min · {lab.service_area}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setSelected(lab)} className="btn-secondary flex-1 !py-2 text-sm text-center">
                  View Guide
                </button>
                <button onClick={() => setBooking(lab)} className="btn-primary flex-1 !py-2 text-sm flex items-center justify-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Book
                </button>
              </div>
            </div>
          );
        })}
        {labs.length === 0 && (
          <div className="col-span-full card p-12 text-center text-gray-500">
            <FlaskConical className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            No labs published yet.
          </div>
        )}
      </div>

      {/* Booking modal */}
      {booking && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setBooking(null)}>
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-gray-900">Book Lab Session</h2>
              <button onClick={() => setBooking(null)} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">{booking.title} · {booking.duration_minutes} min</p>
            <form onSubmit={submitBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input required type="date" value={date} min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
              </div>
              {date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Time slot *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {slots.map(({ slot: s, available }) => (
                      <button type="button" key={s} disabled={!available} onClick={() => setSlot(s)}
                        className={`text-sm px-3 py-2 rounded-lg border font-medium transition-colors ${
                          slot === s
                            ? 'bg-nobus-500 text-white border-nobus-500'
                            : available
                              ? 'bg-white text-gray-700 border-gray-300 hover:border-nobus-300'
                              : 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed line-through'
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (customer, scenario, goals)</label>
                <textarea rows="2" value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
              </div>
              <button type="submit" disabled={saving || !date || !slot} className="btn-primary w-full disabled:opacity-50">
                {saving ? 'Booking…' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
