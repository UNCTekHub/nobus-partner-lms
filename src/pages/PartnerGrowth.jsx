import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, Award, Wallet, Gift, Loader2, CheckCircle, Clock, XCircle, Plus, X,
  ArrowUpRight, BadgeCheck, Coins, Target, BarChart3, Users, Percent,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { tierColor } from '../data/tiers';

const naira = (n) => '₦' + Math.round(Number(n) || 0).toLocaleString('en-NG');
const compact = (n) => {
  const v = Number(n) || 0;
  if (v >= 1e9) return '₦' + (v / 1e9).toFixed(1) + 'B';
  if (v >= 1e6) return '₦' + (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e3) return '₦' + (v / 1e3).toFixed(0) + 'k';
  return '₦' + v;
};

const MDF_STATUS = {
  submitted: { label: 'Pending Review', cls: 'badge-amber', icon: Clock },
  approved: { label: 'Approved', cls: 'badge-green', icon: CheckCircle },
  rejected: { label: 'Rejected', cls: 'badge bg-red-50 text-red-700', icon: XCircle },
  proof_submitted: { label: 'Proof Submitted', cls: 'badge-blue', icon: Clock },
  reimbursed: { label: 'Reimbursed', cls: 'badge-green', icon: Coins },
};

export default function PartnerGrowth({ embedded = false }) {
  const { isSuperAdmin } = useAuth();
  const [tab, setTab] = useState(isSuperAdmin ? 'mdf' : 'tier');

  // Tier progress is org-scoped and meaningless for Nobus staff, who have no
  // partner org; in the ops console we surface only Earnings (payouts) and MDF.
  const tabs = [
    ...(isSuperAdmin ? [] : [{ id: 'tier', label: 'Tier Progress', icon: Award }]),
    { id: 'earnings', label: isSuperAdmin ? 'Payouts' : 'Earnings', icon: Wallet },
    ...(isSuperAdmin ? [] : [{ id: 'analytics', label: 'Analytics', icon: BarChart3 }]),
    { id: 'mdf', label: 'Market Development Funds', icon: Gift },
  ];

  return (
    <div className={embedded ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'}>
      {!embedded && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-nobus-500" /> Partner Growth &amp; Rewards
          </h1>
          <p className="text-gray-600">Track your tier progress, the NCS credit you have earned, and your market development funds.</p>
        </div>
      )}

      <div data-tour="tour-growth" className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-nobus-500 text-nobus-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'tier' && <TierScorecard />}
      {tab === 'earnings' && <Earnings isSuperAdmin={isSuperAdmin} />}
      {tab === 'analytics' && <Analytics />}
      {tab === 'mdf' && <Mdf isSuperAdmin={isSuperAdmin} />}
    </div>
  );
}

// ================= Tier scorecard =================
function TierScorecard() {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getScorecard().then(setCard).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <Spinner />;
  if (!card) return <Empty text="No tier data yet." />;

  const fmtVal = (d) => d.kind === 'currency' ? compact(d.current) : d.current;
  const fmtReq = (d) => d.kind === 'currency' ? compact(d.required) : d.required;

  return (
    <div className="space-y-6">
      {/* Current tier + ladder */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Current tier</div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: tierColor(card.tier) }} />
              <span className="text-2xl font-extrabold" style={{ color: tierColor(card.tier) }}>{card.tier}</span>
            </div>
            {card.discount != null && (
              <div className="text-sm text-gray-600 mt-1">
                <span className="font-semibold text-nobus-600">{card.discount}%</span> partner discount on your quotes
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {card.tiers.map((name, i) => (
              <div key={name} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: name === card.tier ? tierColor(name) : '#E5E7EB' }} />
                  <span className="text-[10px] mt-1 font-medium" style={{ color: name === card.tier ? tierColor(name) : '#9CA3AF' }}>{name}</span>
                </div>
                {i < card.tiers.length - 1 && <div className="w-6 h-0.5 bg-gray-200 mb-4" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {card.atTop ? (
        <div className="card p-8 text-center">
          <BadgeCheck className="w-10 h-10 text-nobus-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900">You are at the top tier</h3>
          <p className="text-gray-500 mt-1">Gold unlocks your <span className="font-semibold text-nobus-600">{card.discount}%</span> partner discount. Maintain your certifications and revenue to retain Gold status.</p>
        </div>
      ) : (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">
              Progress to <span style={{ color: tierColor(card.nextTier) }}>{card.nextTier}</span>
              {card.nextDiscount != null && <span className="text-sm font-normal text-gray-500"> · unlocks {card.nextDiscount}% discount</span>}
            </h3>
            <span className="text-sm text-gray-500">{card.dimensions.filter((d) => d.met).length}/{card.dimensions.length} requirements met</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {card.dimensions.map((d) => {
              const pct = d.required > 0 ? Math.min(100, Math.round((d.current / d.required) * 100)) : 100;
              return (
                <div key={d.key} className={`rounded-xl border p-4 ${d.met ? 'border-green-200 bg-green-50/40' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      {d.met ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Target className="w-4 h-4 text-gray-300" />}
                      {d.label}
                    </span>
                    <span className={`text-sm font-semibold ${d.met ? 'text-green-600' : 'text-gray-900'}`}>
                      {fmtVal(d)} <span className="text-gray-400 font-normal">/ {fmtReq(d)}</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: d.met ? '#22C55E' : tierColor(card.nextTier) }} />
                  </div>
                </div>
              );
            })}
          </div>

          {card.missing.length > 0 && (
            <div className="mt-5 p-4 bg-nobus-50 border border-nobus-100 rounded-xl">
              <div className="text-sm font-semibold text-nobus-800 mb-2 flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4" /> To reach {card.nextTier}, close these gaps:
              </div>
              <ul className="text-sm text-nobus-700 space-y-1">
                {card.missing.map((d) => (
                  <li key={d.key}>
                    - {d.label}: need {d.kind === 'currency' ? compact(d.required - d.current) : (d.required - d.current)} more
                  </li>
                ))}
              </ul>
              {card.requiresRecency && !card.engagementOk && (
                <div className="text-sm text-amber-700 mt-2">- Register or advance a deal in the last 12 months to stay eligible.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ================= Earnings =================
function Earnings({ isSuperAdmin }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api.getEarnings().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  if (!data) return <Empty text="No earnings yet." />;

  const togglePaid = async (dealId, paid) => { await api.markCreditPaid(dealId, paid); load(); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={Coins} label={`Accrued NCS credit (${data.creditPct}%)`} value={naira(data.accrued)} sub="on won deals" />
        <Stat icon={Wallet} label="Pending payout" value={naira(data.pending)} sub="awaiting reimbursement" accent />
        <Stat icon={CheckCircle} label="Paid out" value={naira(data.paid)} sub="reimbursed to you" />
        <Stat icon={TrendingUp} label="Influenced revenue" value={naira(data.influencedRevenue)} sub="won, last 12 months" />
      </div>

      <div className="card p-4 text-xs text-gray-500">
        The NCS credit is 10% of the compute and storage consumed on deals you close, per the Partner Agreement.
        Amounts marked <strong>estimate</strong> use the deal value; deals with an attached quote use the quote's compute + storage total. Final credit reconciles against actual consumption.
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead><tr className="bg-gray-50 border-b">
            <Th>Opportunity</Th>{data.global && <Th>Partner</Th>}<Th>Customer</Th><Th>Deal value</Th><Th>NCS credit</Th><Th>Status</Th>{isSuperAdmin && <Th>Action</Th>}
          </tr></thead>
          <tbody className="divide-y">
            {data.deals.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{d.opportunity}</td>
                {data.global && <td className="px-4 py-3 text-sm text-gray-600">{d.orgName}</td>}
                <td className="px-4 py-3 text-sm text-gray-600">{d.customer}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{naira(d.dealValue)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-nobus-600">
                  {naira(d.credit)}
                  <span className={`ml-1.5 text-[10px] uppercase ${d.basis === 'quote' ? 'text-green-600' : 'text-gray-400'}`}>{d.basis === 'quote' ? 'quote' : 'est'}</span>
                </td>
                <td className="px-4 py-3">{d.paid ? <span className="badge-green">Paid</span> : <span className="badge-amber">Pending</span>}</td>
                {isSuperAdmin && (
                  <td className="px-4 py-3">
                    <button onClick={() => togglePaid(d.id, !d.paid)} className="text-xs font-medium text-nobus-600 hover:underline">
                      {d.paid ? 'Mark unpaid' : 'Mark paid'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {data.deals.length === 0 && <tr><td colSpan={(isSuperAdmin ? 6 : 5) + (data.global ? 1 : 0)} className="px-4 py-10 text-center text-gray-400">No won deals yet. Close a registered deal to start earning NCS credit.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ================= Analytics =================
const STAGE_META = [
  { key: 'pending', label: 'Pending review', cls: 'bg-amber-400' },
  { key: 'approved', label: 'Protected', cls: 'bg-nobus-500' },
  { key: 'won', label: 'Won', cls: 'bg-green-500' },
  { key: 'lost', label: 'Lost', cls: 'bg-gray-300' },
  { key: 'rejected', label: 'Rejected', cls: 'bg-red-300' },
  { key: 'expired', label: 'Expired', cls: 'bg-gray-200' },
];

function monthLabel(ym) {
  const [y, m] = (ym || '').split('-').map(Number);
  if (!y || !m) return ym;
  return new Date(y, m - 1, 1).toLocaleString('en', { month: 'short' });
}

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getPartnerAnalytics().then(setData).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <Spinner />;
  if (!data) return <Empty text="No analytics yet. Register deals to build your pipeline picture." />;

  const totalDeals = Object.values(data.statusCounts).reduce((s, c) => s + c, 0);
  const decided = (data.statusCounts.won || 0) + (data.statusCounts.lost || 0);
  const maxTrend = Math.max(...data.trend.map((t) => t.value), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={Percent} label="Win rate" value={`${data.winRate}%`} sub={decided ? `${data.statusCounts.won || 0} won of ${decided} decided` : 'no closed deals yet'} accent />
        <Stat icon={Wallet} label="Open pipeline" value={compact(data.openPipeline)} sub="pending + protected deals" />
        <Stat icon={TrendingUp} label="Influenced revenue" value={compact(data.influencedRevenue)} sub="won, last 12 months" />
        <Stat icon={Users} label="Team enablement" value={`${data.enablementPct}%`} sub={`${data.certifiedUsers}/${data.activeUsers} staff certified`} />
      </div>

      {/* Registration trend, last 6 months */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-1">Deal Registration Trend</h3>
        <p className="text-xs text-gray-400 mb-5">Deals registered and their value, last 6 months</p>
        {data.trend.length === 0 ? (
          <div className="text-sm text-gray-400 py-8 text-center">No deals registered in the last 6 months.</div>
        ) : (
          <div className="flex items-end gap-3 h-44">
            {data.trend.map((t) => (
              <div key={t.month} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
                <div className="text-[11px] font-semibold text-nobus-600 mb-1">{compact(t.value)}</div>
                <div className="w-full max-w-[56px] bg-nobus-500/90 rounded-t-md transition-all"
                  style={{ height: `${Math.max((t.value / maxTrend) * 100, 4)}%` }} />
                <div className="text-[11px] text-gray-500 mt-1.5 font-medium">{monthLabel(t.month)}</div>
                <div className="text-[10px] text-gray-400">{t.deals} deal{t.deals === 1 ? '' : 's'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pipeline status breakdown */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-4">Pipeline by Status</h3>
        {totalDeals === 0 ? (
          <div className="text-sm text-gray-400 py-4 text-center">No registered deals yet.</div>
        ) : (
          <>
            <div className="flex w-full h-3 rounded-full overflow-hidden mb-4">
              {STAGE_META.filter((s) => data.statusCounts[s.key]).map((s) => (
                <div key={s.key} className={s.cls} style={{ width: `${(data.statusCounts[s.key] / totalDeals) * 100}%` }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {STAGE_META.filter((s) => data.statusCounts[s.key]).map((s) => (
                <div key={s.key} className="flex items-center gap-1.5 text-sm text-gray-600">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.cls}`} />
                  {s.label} <strong className="text-gray-900">{data.statusCounts[s.key]}</strong>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card p-4 text-xs text-gray-500">
        Win rate counts only decided deals (won vs lost). Team enablement is the share of your active
        staff certified in at least one track - it also gates your partner tier.
      </div>
    </div>
  );
}

// ================= MDF =================
const EMPTY_MDF = { title: '', activityType: '', description: '', amountRequested: '', plannedDate: '' };

function Mdf({ isSuperAdmin }) {
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_MDF);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    Promise.all([api.getMdf(), api.getMdfMeta()]).then(([l, m]) => { setList(l); setMeta(m); }).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.createMdf({ ...form, amountRequested: Number(form.amountRequested) || 0 });
      setShowForm(false); setForm(EMPTY_MDF); load();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const review = async (m, action) => {
    if (action === 'approve') {
      const amt = window.prompt('Approved amount (₦):', String(m.amount_requested));
      if (amt === null) return;
      await api.approveMdf(m.id, Number(amt) || m.amount_requested);
    } else if (action === 'reject') {
      const reason = window.prompt('Reason (optional):') || '';
      await api.rejectMdf(m.id, reason);
    } else if (action === 'reimburse') {
      await api.reimburseMdf(m.id);
    }
    load();
  };

  const submitProof = async (m) => {
    const proofUrl = window.prompt('Proof of execution - link to report/receipts (optional):') || '';
    const proofNotes = window.prompt('Proof notes (what was delivered):') || '';
    if (!proofUrl && !proofNotes) return;
    await api.submitMdfProof(m.id, proofUrl, proofNotes);
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {meta && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat icon={Clock} label="Pending review" value={naira(meta.pendingReview)} sub="requested" />
          <Stat icon={CheckCircle} label="Approved outstanding" value={naira(meta.approvedOutstanding)} sub="awaiting proof/reimbursement" accent />
          <Stat icon={Coins} label="Reimbursed" value={naira(meta.reimbursed)} sub="paid to date" />
        </div>
      )}

      {!isSuperAdmin && (
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Request MDF
        </button>
      )}

      <div className="space-y-3">
        {list.map((m) => {
          const meta2 = MDF_STATUS[m.status] || MDF_STATUS.submitted;
          const Icon = meta2.icon;
          return (
            <div key={m.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{m.title}</h3>
                    <span className={meta2.cls}><Icon className="w-3 h-3 mr-1" />{meta2.label}</span>
                    <span className="badge bg-gray-100 text-gray-600">{m.activity_type}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {isSuperAdmin && <span className="text-gray-400">{m.org_name} - </span>}
                    Requested {naira(m.amount_requested)}
                    {m.amount_approved != null && <span> · Approved <strong className="text-gray-700">{naira(m.amount_approved)}</strong></span>}
                    {m.planned_date && <span> · Planned {m.planned_date}</span>}
                  </div>
                  {m.description && <p className="text-sm text-gray-500 mt-1.5 max-w-3xl">{m.description}</p>}
                  {m.proof_notes && <div className="text-xs text-gray-500 mt-1.5">Proof: {m.proof_notes}{m.proof_url ? ` (${m.proof_url})` : ''}</div>}
                  {m.decision_notes && <div className="text-xs text-gray-500 mt-1">Note: {m.decision_notes}</div>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    {isSuperAdmin && m.status === 'submitted' && (
                      <>
                        <button onClick={() => review(m, 'approve')} className="text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg">Approve</button>
                        <button onClick={() => review(m, 'reject')} className="text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg">Reject</button>
                      </>
                    )}
                    {isSuperAdmin && m.status === 'proof_submitted' && (
                      <button onClick={() => review(m, 'reimburse')} className="text-sm font-medium text-nobus-700 bg-nobus-50 hover:bg-nobus-100 px-3 py-1.5 rounded-lg">Mark reimbursed</button>
                    )}
                    {!isSuperAdmin && m.status === 'approved' && (
                      <button onClick={() => submitProof(m)} className="text-sm font-medium text-nobus-700 bg-nobus-50 hover:bg-nobus-100 px-3 py-1.5 rounded-lg">Submit proof of execution</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {list.length === 0 && <Empty text={isSuperAdmin ? 'No MDF requests yet.' : 'No MDF requests yet. Request funds for a co-marketing activity.'} />}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <form onSubmit={submit} className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Request Market Development Funds</h2>
              <button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
            <Field label="Activity title *"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Activity type">
                <select value={form.activityType} onChange={(e) => setForm({ ...form, activityType: e.target.value })} className={inputCls}>
                  <option value="">Select...</option>
                  {(meta?.activityTypes || []).map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Amount requested (₦) *"><input required type="number" min="0" value={form.amountRequested} onChange={(e) => setForm({ ...form, amountRequested: e.target.value })} className={inputCls} /></Field>
            </div>
            <Field label="Planned date"><input type="date" value={form.plannedDate} onChange={(e) => setForm({ ...form, plannedDate: e.target.value })} className={inputCls} /></Field>
            <Field label="Description / objectives"><textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} /></Field>
            <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Submitting...' : 'Submit request'}</button>
          </form>
        </div>
      )}
    </div>
  );
}

// ================= shared bits =================
const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nobus-400';
function Field({ label, children }) { return (<div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>{children}</div>); }
function Th({ children }) { return <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3 whitespace-nowrap">{children}</th>; }
function Spinner() { return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-nobus-500" /></div>; }
function Empty({ text }) { return <div className="card p-12 text-center text-gray-500">{text}</div>; }
function Stat({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className={`card p-4 ${accent ? 'ring-1 ring-nobus-200' : ''}`}>
      <Icon className="w-5 h-5 text-nobus-500 mb-1.5" />
      <div className="text-xl font-bold text-gray-900 truncate">{value}</div>
      <div className="text-xs font-medium text-gray-600">{label}</div>
      <div className="text-[11px] text-gray-400">{sub}</div>
    </div>
  );
}
