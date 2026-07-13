import { useState, useEffect, useCallback } from 'react';
import { Compass, Plus, X, Trash2, MessageSquarePlus, Loader2, TrendingUp, Wallet, Target } from 'lucide-react';
import { api } from '../lib/api';

const STAGES = [
  { id: 'lead', label: 'Lead', color: 'bg-gray-100 text-gray-700' },
  { id: 'qualified', label: 'Qualified', color: 'bg-blue-50 text-blue-700' },
  { id: 'proposal', label: 'Proposal', color: 'bg-amber-50 text-amber-700' },
  { id: 'won', label: 'Won', color: 'bg-green-50 text-green-700' },
  { id: 'lost', label: 'Lost', color: 'bg-red-50 text-red-700' },
];

const SERVICE_OPTIONS = ['FCS', 'Dedicated Hosting', 'Autoscaling', 'FBS', 'FOS', 'Cloud Backup', 'Networking', 'VPN', 'Fast Transit', 'Sophos XG', 'FortiGate', 'Acronis', 'Kubernetes', 'Kafka', 'MSSQL', 'MySQL', 'PostgreSQL', 'MongoDB'];

const naira = (n) => '₦' + Number(n || 0).toLocaleString('en-NG');

const EMPTY_FORM = { company: '', contactName: '', contactEmail: '', contactPhone: '', industry: '', estValue: '', services: [], nextAction: '' };

export default function SalesNavigator() {
  const [leads, setLeads] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState(null);
  const [activities, setActivities] = useState([]);
  const [newNote, setNewNote] = useState('');

  const load = useCallback(async () => {
    try {
      const [leadsData, forecastData] = await Promise.all([api.getLeads(), api.getForecast()]);
      setLeads(leadsData);
      setForecast(forecastData);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (lead) => {
    setDetail(lead);
    setNewNote('');
    try {
      setActivities(await api.getLeadActivities(lead.id));
    } catch {
      setActivities([]);
    }
  };

  const moveStage = async (lead, stage) => {
    await api.updateLead(lead.id, { stage });
    if (detail?.id === lead.id) setDetail({ ...detail, stage });
    load();
  };

  const submitLead = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createLead({ ...form, estValue: Number(form.estValue) || 0 });
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeLead = async (lead) => {
    if (!window.confirm(`Delete lead "${lead.company}"?`)) return;
    await api.deleteLead(lead.id);
    setDetail(null);
    load();
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    await api.addLeadActivity(detail.id, newNote.trim());
    setNewNote('');
    setActivities(await api.getLeadActivities(detail.id));
  };

  const toggleService = (svc) => {
    setForm((f) => ({
      ...f,
      services: f.services.includes(svc) ? f.services.filter((s) => s !== svc) : [...f.services, svc],
    }));
  };

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
            <Compass className="w-7 h-7 text-nobus-500" /> Sales Navigator
          </h1>
          <p className="text-gray-600">Build and track your Nobus opportunity pipeline from lead to close.</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {forecast && (
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <Wallet className="w-4 h-4 text-nobus-500" /> Open Pipeline
            </div>
            <div className="text-2xl font-bold text-gray-900">{naira(forecast.openPipeline)}</div>
            <div className="text-xs text-gray-500 mt-1">Lead + Qualified + Proposal value</div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <Target className="w-4 h-4 text-nobus-500" /> Weighted Forecast
            </div>
            <div className="text-2xl font-bold text-gray-900">{naira(Math.round(forecast.weightedForecast))}</div>
            <div className="text-xs text-gray-500 mt-1">Stage-probability adjusted revenue</div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4 text-nobus-500" /> Won Revenue
            </div>
            <div className="text-2xl font-bold text-green-600">{naira(forecast.byStage.won.total)}</div>
            <div className="text-xs text-gray-500 mt-1">{forecast.byStage.won.count} deal{forecast.byStage.won.count === 1 ? '' : 's'} closed won</div>
          </div>
        </div>
      )}

      {/* Kanban board */}
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-5 gap-4 min-w-[900px]">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.id);
            const total = stageLeads.reduce((s, l) => s + (l.est_value || 0), 0);
            return (
              <div key={stage.id} className="bg-gray-100/70 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1 px-1">
                  <span className={`badge ${stage.color}`}>{stage.label}</span>
                  <span className="text-xs text-gray-500 font-medium">{stageLeads.length}</span>
                </div>
                <div className="text-[11px] text-gray-500 px-1 mb-3">{naira(total)}</div>
                <div className="space-y-2">
                  {stageLeads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => openDetail(lead)}
                      className="w-full text-left bg-white rounded-lg border border-gray-200 p-3 hover:border-nobus-300 hover:shadow-sm transition-all"
                    >
                      <div className="text-sm font-semibold text-gray-900 truncate">{lead.company}</div>
                      {lead.contact_name && <div className="text-xs text-gray-500 truncate">{lead.contact_name}</div>}
                      <div className="text-xs font-medium text-nobus-600 mt-1">{naira(lead.est_value)}</div>
                      {lead.next_action && (
                        <div className="text-[11px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-2 truncate">
                          → {lead.next_action}
                        </div>
                      )}
                    </button>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="text-xs text-gray-400 text-center py-6 border border-dashed border-gray-300 rounded-lg">Empty</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add lead modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">New Lead</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submitLead} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                <input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact name</label>
                  <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact email</label>
                  <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated value (₦)</label>
                <input type="number" min="0" value={form.estValue} onChange={(e) => setForm({ ...form, estValue: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nobus services of interest</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Next action</label>
                <input value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
                  placeholder="e.g. Schedule discovery call"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? 'Saving…' : 'Create Lead'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lead detail modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{detail.company}</h2>
                <div className="text-sm text-gray-500">
                  {detail.contact_name}{detail.contact_email ? ` · ${detail.contact_email}` : ''}
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Value</div>
                <div className="font-semibold text-gray-900">{naira(detail.est_value)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Stage</div>
                <select value={detail.stage} onChange={(e) => moveStage(detail, e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400">
                  {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>

            {(() => {
              let svcs = [];
              try { svcs = JSON.parse(detail.services || '[]'); } catch { /* ignore */ }
              return svcs.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Services</div>
                  <div className="flex flex-wrap gap-1.5">
                    {svcs.map((s) => <span key={s} className="badge-blue">{s}</span>)}
                  </div>
                </div>
              );
            })()}

            {detail.next_action && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <strong>Next action:</strong> {detail.next_action}
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Activity notes</div>
              <div className="flex gap-2 mb-3">
                <input value={newNote} onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addNote()}
                  placeholder="Log a call, meeting, or update…"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400" />
                <button onClick={addNote} className="btn-primary !px-3" title="Add note">
                  <MessageSquarePlus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activities.map((a) => (
                  <div key={a.id} className="p-2.5 bg-gray-50 rounded-lg text-sm">
                    <div className="text-gray-700">{a.note}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{a.author_name} · {new Date(a.created_at + 'Z').toLocaleString()}</div>
                  </div>
                ))}
                {activities.length === 0 && <div className="text-sm text-gray-400 text-center py-3">No activity yet</div>}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4 flex justify-end">
              <button onClick={() => removeLead(detail)}
                className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium">
                <Trash2 className="w-4 h-4" /> Delete lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
