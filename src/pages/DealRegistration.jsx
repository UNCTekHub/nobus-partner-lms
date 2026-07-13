import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Plus, X, Loader2, Clock, CheckCircle, XCircle, AlertTriangle, Trophy, Ban, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const SERVICE_OPTIONS = ['FCS', 'Dedicated Hosting', 'FBS', 'FOS', 'Cloud Backup', 'Networking', 'VPN', 'Fast Transit', 'Sophos XG', 'FortiGate', 'Acronis', 'Kubernetes', 'Kafka', 'Databases'];

const STATUS_META = {
  pending: { label: 'Pending Review', icon: Clock, cls: 'badge-amber' },
  approved: { label: 'Approved · Protected', icon: ShieldCheck, cls: 'badge-green' },
  rejected: { label: 'Rejected', icon: XCircle, cls: 'badge bg-red-50 text-red-700' },
  expired: { label: 'Protection Expired', icon: AlertTriangle, cls: 'badge bg-gray-100 text-gray-600' },
  won: { label: 'Won', icon: Trophy, cls: 'badge-green' },
  lost: { label: 'Lost', icon: Ban, cls: 'badge bg-gray-100 text-gray-600' },
};

const naira = (n) => '₦' + Number(n || 0).toLocaleString('en-NG');

const EMPTY_FORM = { customerName: '', customerEmail: '', customerIndustry: '', opportunityName: '', description: '', services: [], estValue: '', expectedCloseDate: '', quoteId: '' };

export default function DealRegistration() {
  const { isSuperAdmin } = useAuth();
  const [deals, setDeals] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    try {
      const [dealData, quoteData] = await Promise.all([api.getDeals(), api.getQuotes().catch(() => [])]);
      setDeals(dealData);
      setQuotes(quoteData);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice('');
    try {
      const res = await api.registerDeal({ ...form, estValue: Number(form.estValue) || 0, quoteId: form.quoteId ? Number(form.quoteId) : null });
      setShowForm(false);
      setForm(EMPTY_FORM);
      setNotice(res.duplicateWarning ? `Deal submitted — ${res.duplicateWarning}` : 'Deal submitted for review.');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const review = async (deal, action) => {
    if (action === 'approve') {
      await api.approveDeal(deal.id);
    } else {
      const reason = window.prompt('Rejection reason (optional):') || '';
      await api.rejectDeal(deal.id, reason);
    }
    load();
  };

  const close = async (deal, outcome) => {
    await api.closeDeal(deal.id, outcome);
    load();
  };

  const toggleService = (svc) => {
    setForm((f) => ({
      ...f,
      services: f.services.includes(svc) ? f.services.filter((s) => s !== svc) : [...f.services, svc],
    }));
  };

  const filtered = filter === 'all' ? deals : deals.filter((d) => d.status === filter);
  const counts = deals.reduce((acc, d) => ({ ...acc, [d.status]: (acc[d.status] || 0) + 1 }), {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-nobus-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-nobus-500" /> Deal Registration
          </h1>
          <p className="text-gray-600">
            Register opportunities for 90-day channel protection. Approved deals are shielded from partner conflict.
          </p>
        </div>
        {!isSuperAdmin && (
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Register Deal
          </button>
        )}
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
      {notice && (
        <div className="mb-6 p-4 bg-nobus-50 border border-nobus-200 rounded-lg text-nobus-800 text-sm flex items-center justify-between">
          {notice}
          <button onClick={() => setNotice('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'approved', 'won', 'lost', 'rejected', 'expired'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
              filter === s ? 'bg-nobus-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-nobus-300'
            }`}>
            {s === 'all' ? `All (${deals.length})` : `${s} (${counts[s] || 0})`}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((deal) => {
          const meta = STATUS_META[deal.status] || STATUS_META.pending;
          const Icon = meta.icon;
          let services = [];
          try { services = JSON.parse(deal.services || '[]'); } catch { /* ignore */ }
          return (
            <div key={deal.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{deal.opportunity_name}</h3>
                    <span className={meta.cls}><Icon className="w-3 h-3 mr-1" />{meta.label}</span>
                    {deal.duplicate_of && <span className="badge bg-red-50 text-red-700"><AlertTriangle className="w-3 h-3 mr-1" />Possible duplicate</span>}
                  </div>
                  <div className="text-sm text-gray-600">
                    {deal.customer_name}{deal.customer_industry ? ` · ${deal.customer_industry}` : ''}
                    {isSuperAdmin && <span className="text-gray-400"> — by {deal.org_name}</span>}
                  </div>
                  {deal.description && <p className="text-sm text-gray-500 mt-1.5 max-w-3xl">{deal.description}</p>}
                  {services.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {services.map((s) => <span key={s} className="badge-blue">{s}</span>)}
                    </div>
                  )}
                  {deal.quote_id && (
                    <div className="mt-2 text-sm text-gray-600 flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-nobus-500" />
                      Quote NCS-Q-{String(deal.quote_id).padStart(5, '0')}
                      {deal.quote_title ? ` — ${deal.quote_title}` : ''}
                      {deal.quote_monthly_total ? ` (${naira(deal.quote_monthly_total)}/mo)` : ''}
                    </div>
                  )}
                  {deal.status === 'rejected' && deal.rejection_reason && (
                    <div className="mt-2 text-sm text-red-600">Reason: {deal.rejection_reason}</div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-nobus-600">{naira(deal.est_value)}</div>
                  {deal.expected_close_date && <div className="text-xs text-gray-500">Close: {deal.expected_close_date}</div>}
                  {deal.status === 'approved' && deal.protection_expires && (
                    <div className="text-xs text-green-600 mt-1">Protected until {deal.protection_expires.slice(0, 10)}</div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-400">
                  Registered {new Date(deal.created_at + 'Z').toLocaleDateString()} by {deal.submitted_by_name}
                </div>
                <div className="flex gap-2">
                  {isSuperAdmin && deal.status === 'pending' && (
                    <>
                      <button onClick={() => review(deal, 'approve')}
                        className="flex items-center gap-1 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button onClick={() => review(deal, 'reject')}
                        className="flex items-center gap-1 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </>
                  )}
                  {!isSuperAdmin && deal.status === 'approved' && (
                    <>
                      <button onClick={() => close(deal, 'won')}
                        className="flex items-center gap-1 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
                        <Trophy className="w-4 h-4" /> Mark Won
                      </button>
                      <button onClick={() => close(deal, 'lost')}
                        className="flex items-center gap-1 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
                        <Ban className="w-4 h-4" /> Mark Lost
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="card p-12 text-center text-gray-500">
            <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            No deals here yet. {!isSuperAdmin && 'Register your first opportunity to protect it.'}
          </div>
        )}
      </div>

      {/* Register deal modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Register a Deal</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity name *</label>
                <input required value={form.opportunityName} onChange={(e) => setForm({ ...form, opportunityName: e.target.value })}
                  placeholder="e.g. Core banking migration to Nobus"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer name *</label>
                  <input required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer email</label>
                  <input type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input value={form.customerIndustry} onChange={(e) => setForm({ ...form, customerIndustry: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated value (₦)</label>
                  <input type="number" min="0" value={form.estValue} onChange={(e) => setForm({ ...form, estValue: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected close date</label>
                <input type="date" value={form.expectedCloseDate} onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attach a quote (optional)</label>
                <select value={form.quoteId}
                  onChange={(e) => {
                    const q = quotes.find((x) => x.id === Number(e.target.value));
                    setForm({ ...form, quoteId: e.target.value, estValue: q ? String(q.monthly_total * 12) : form.estValue });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400">
                  <option value="">No quote attached</option>
                  {quotes.map((q) => (
                    <option key={q.id} value={q.id}>
                      NCS-Q-{String(q.id).padStart(5, '0')} — {q.title} (₦{Number(q.monthly_total).toLocaleString('en-NG')}/mo)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Selecting a quote sets the estimated value to its annual total. Build quotes in the{' '}
                  <Link to="/quotes" className="text-nobus-600 hover:underline">Quote Builder</Link>.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nobus services in scope</label>
                <div className="flex flex-wrap gap-1.5">
                  {SERVICE_OPTIONS.map((svc) => (
                    <button type="button" key={svc} onClick={() => toggleService(svc)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        form.services.includes(svc)
                          ? 'bg-nobus-500 text-white border-nobus-500'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-nobus-300'
                      }`}>
                      {svc}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity description</label>
                <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? 'Submitting…' : 'Submit for Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
