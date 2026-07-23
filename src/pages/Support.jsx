import { useState, useEffect, useCallback } from 'react';
import { LifeBuoy, Plus, X, Loader2, Send, ArrowLeft, Mail, User, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const PRIORITY_CLS = {
  Urgent: 'badge bg-red-50 text-red-700',
  High: 'badge bg-amber-50 text-amber-700',
  Normal: 'badge-blue',
  Low: 'badge bg-gray-100 text-gray-600',
};
const STATUS_CLS = {
  open: 'badge-amber', pending: 'badge-blue', resolved: 'badge-green',
};

const EMPTY = { subject: '', category: 'General', priority: 'Normal', body: '' };

export default function Support({ embedded = false }) {
  const { isSuperAdmin } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [meta, setMeta] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(() => {
    Promise.all([api.getTickets(), api.getSupportMeta()])
      .then(([t, m]) => { setTickets(t); setMeta(m); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const open = async (id) => { try { setSelected(await api.getTicket(id)); } catch (e) { setError(e.message); } };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const res = await api.createTicket(form);
      setShowForm(false); setForm(EMPTY); load(); open(res.id);
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    await api.replyTicket(selected.id, reply.trim());
    setReply('');
    open(selected.id); load();
  };

  const setStatus = async (status) => { await api.setTicketStatus(selected.id, status); open(selected.id); load(); };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-nobus-500" /></div>;

  // ---------- Detail ----------
  if (selected) {
    return (
      <div className={embedded ? 'max-w-4xl' : 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10'}>
        <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-sm font-medium text-nobus-600 hover:text-nobus-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to tickets
        </button>
        <div className="card p-6 mb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{selected.subject}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap text-sm">
                <span className={PRIORITY_CLS[selected.priority]}>{selected.priority}</span>
                <span className={STATUS_CLS[selected.status]}>{selected.status}</span>
                <span className="badge bg-gray-100 text-gray-600">{selected.category}</span>
                {selected.sla && !selected.sla.responded && (
                  <span className={`badge ${selected.sla.breached ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                    {selected.sla.breached ? 'SLA breached' : `First response target ${selected.sla.targetHours}h`}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {selected.created_by_name}{isSuperAdmin && selected.org_name ? ` · ${selected.org_name}` : ''} · {new Date(selected.created_at + 'Z').toLocaleString()}
              </div>
            </div>
            <div className="flex gap-2">
              {selected.status !== 'resolved'
                ? <button onClick={() => setStatus('resolved')} className="text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg">Mark resolved</button>
                : <button onClick={() => setStatus('open')} className="text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg">Reopen</button>}
            </div>
          </div>
          <p className="text-gray-700 mt-4 whitespace-pre-wrap">{selected.body}</p>
        </div>

        <div className="space-y-3 mb-4">
          {selected.replies?.map((r) => (
            <div key={r.id} className={`card p-4 ${r.is_staff ? 'border-nobus-200 bg-nobus-50/40' : ''}`}>
              {r.is_staff && <div className="text-xs font-bold text-nobus-600 mb-1">Nobus Support</div>}
              <p className="text-gray-700 whitespace-pre-wrap">{r.body}</p>
              <div className="text-[11px] text-gray-400 mt-2">{r.author_name} · {new Date(r.created_at + 'Z').toLocaleString()}</div>
            </div>
          ))}
        </div>

        {selected.status !== 'resolved' && (
          <div className="flex gap-2">
            <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendReply()}
              placeholder="Write a reply..." className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
            <button onClick={sendReply} className="btn-primary !px-4"><Send className="w-4 h-4" /></button>
          </div>
        )}
      </div>
    );
  }

  // ---------- List ----------
  const shown = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter);
  return (
    <div className={embedded ? '' : 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10'}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        {!embedded && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <LifeBuoy className="w-7 h-7 text-nobus-500" /> Partner Support
            </h1>
            <p className="text-gray-600">Raise a case with the Nobus partner team and track it to resolution.</p>
          </div>
        )}
        {!isSuperAdmin && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> New Ticket</button>
        )}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {meta?.partnerManager && (
        <div className="card p-4 mb-6 flex flex-wrap items-center gap-4 bg-nobus-50/50 border-nobus-100">
          <div className="w-10 h-10 rounded-full bg-nobus-500 text-white flex items-center justify-center"><User className="w-5 h-5" /></div>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Your Nobus partner manager</div>
            <div className="font-semibold text-gray-900">{meta.partnerManager.name || 'Assigned'}</div>
          </div>
          {meta.partnerManager.email && (
            <a href={`mailto:${meta.partnerManager.email}`} className="ml-auto btn-secondary !py-2 text-sm flex items-center gap-1.5">
              <Mail className="w-4 h-4" /> {meta.partnerManager.email}
            </a>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        {['all', 'open', 'pending', 'resolved'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium capitalize ${filter === s ? 'bg-nobus-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-nobus-300'}`}>
            {s === 'all' ? `All (${tickets.length})` : `${s} (${tickets.filter((t) => t.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {shown.map((t) => (
          <button key={t.id} onClick={() => open(t.id)} className="w-full text-left card p-4 hover:border-nobus-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{t.subject}</span>
                  <span className={PRIORITY_CLS[t.priority]}>{t.priority}</span>
                  <span className={STATUS_CLS[t.status]}>{t.status}</span>
                  {t.sla && !t.sla.responded && t.sla.breached && (
                    <span className="badge bg-red-50 text-red-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />SLA</span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {t.created_by_name}{isSuperAdmin && t.org_name ? ` · ${t.org_name}` : ''} · {t.category} · {t.reply_count} repl{t.reply_count === 1 ? 'y' : 'ies'}
                </div>
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                {t.status === 'resolved' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4" />}
                {new Date(t.updated_at + 'Z').toLocaleDateString()}
              </div>
            </div>
          </button>
        ))}
        {shown.length === 0 && <div className="card p-12 text-center text-gray-500">No tickets here.</div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <form onSubmit={submit} className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">New Support Ticket</h2>
              <button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400">
                  {(meta?.categories || ['General']).map((c) => <option key={c}>{c}</option>)}
                </select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400">
                  {(meta?.priorities || ['Normal']).map((p) => <option key={p}>{p}</option>)}
                </select></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Describe your issue *</label>
              <textarea required rows="5" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" /></div>
            <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Submitting...' : 'Open Ticket'}</button>
          </form>
        </div>
      )}
    </div>
  );
}
