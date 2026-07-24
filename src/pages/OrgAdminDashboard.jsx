import { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, Award, Mail, CheckCircle, XCircle,
  Loader2, GraduationCap, Bell, Clock, X, KeyRound, UserCog, ScrollText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { getTierDef, getNextTier } from '../data/tiers';
import ProgressBar from '../components/ProgressBar';

const CAT_CLS = {
  Sales: 'bg-blue-50 text-blue-700', Presales: 'bg-purple-50 text-purple-700', Technical: 'bg-accent-50 text-accent-700',
};
const STATUS_CHIP = {
  completed: { label: 'Certified', cls: 'bg-green-100 text-green-700' },
  in_progress: { label: 'In progress', cls: 'bg-amber-100 text-amber-700' },
  not_started: { label: 'Not started', cls: 'bg-gray-100 text-gray-500' },
};
const ROLE_LABEL = { org_admin: 'Org Admin', team_manager: 'Team Manager', user: 'Member' };

export default function OrgAdminDashboard() {
  const { isOrgAdmin } = useAuth();
  const [tab, setTab] = useState('team');
  const [org, setOrg] = useState(null);
  const [meta, setMeta] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null); // { type: 'ok'|'err', text }
  const [assignFor, setAssignFor] = useState(null); // member being assigned
  const [showInvite, setShowInvite] = useState(false);

  const flash = (type, text) => { setBanner({ type, text }); setTimeout(() => setBanner(null), 6000); };

  const loadMembers = useCallback(async () => {
    try { setMembers(await api.getTeamMembers()); } catch (e) { flash('err', e.message); }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [orgData, metaData, mem] = await Promise.all([
          api.getMyOrg().catch(() => null), api.getTeamMeta(), api.getTeamMembers(),
        ]);
        setOrg(orgData); setMeta(metaData); setMembers(mem);
      } catch { /* auth redirect handles it */ } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-nobus-500" /></div>;

  const tabs = [
    { id: 'team', label: 'Team & Training', icon: GraduationCap },
    ...(isOrgAdmin ? [{ id: 'overview', label: 'Tier & Benefits', icon: Award }, { id: 'activity', label: 'Activity Log', icon: ScrollText }] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{org?.name || 'My Team'}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isOrgAdmin ? `Partner ID: ${org?.partner_id} · Managing your whole organization`
              : `Team Manager · ${meta?.roleCategory} function`}
          </p>
        </div>
        {isOrgAdmin && (
          <button onClick={() => setShowInvite(true)} className="btn-primary flex items-center gap-2 text-sm">
            <UserPlus className="w-4 h-4" /> Invite User
          </button>
        )}
      </div>

      {banner && (
        <div className={`mb-5 p-3 rounded-lg text-sm flex items-center gap-2 ${banner.type === 'ok' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {banner.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}{banner.text}
        </div>
      )}

      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${tab === t.id ? 'border-nobus-500 text-nobus-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'team' && (
        <TeamTraining members={members} isOrgAdmin={isOrgAdmin}
          reload={loadMembers} flash={flash} onAssign={setAssignFor} />
      )}
      {tab === 'overview' && org && <TierPanel org={org} members={members} />}
      {tab === 'activity' && <ActivityLog flash={flash} />}

      {assignFor && (
        <AssignModal member={assignFor} paths={meta?.paths || []} onClose={() => setAssignFor(null)}
          onDone={(msg) => { setAssignFor(null); flash('ok', msg); loadMembers(); }} flash={flash} />
      )}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onDone={(msg) => { flash('ok', msg); loadMembers(); }} />}
    </div>
  );
}

// ---------------- Team & Training ----------------
function TeamTraining({ members, isOrgAdmin, reload, flash, onAssign }) {
  const act = async (fn, okMsg) => {
    try { const r = await fn(); flash('ok', okMsg || r?.message || 'Done'); reload(); }
    catch (e) { flash('err', e.message); }
  };

  const nudge = async (m, pathId) => {
    try { await api.nudgeMember(m.id, pathId); flash('ok', `Nudged ${m.name}.`); reload(); }
    catch (e) { flash('err', e.message); }
  };

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[820px]">
        <thead>
          <tr className="bg-gray-50 border-b">
            <Th>Member</Th><Th>Function</Th><Th>Training status</Th><Th>Certs</Th>
            {isOrgAdmin && <Th>Role</Th>}<Th>Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {members.map((m) => (
            <tr key={m.id} className={`hover:bg-gray-50 ${m.status !== 'active' ? 'opacity-50' : ''}`}>
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-gray-900">{m.name}</div>
                <div className="text-xs text-gray-500">{m.email}</div>
                {m.lastNudgedAt && <div className="text-[11px] text-gray-400 mt-0.5">Last nudged {new Date(m.lastNudgedAt + 'Z').toLocaleDateString()}</div>}
              </td>
              <td className="px-4 py-3"><span className={`badge ${CAT_CLS[m.roleCategory] || 'bg-gray-100 text-gray-500'}`}>{m.roleCategory || '-'}</span></td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1.5">
                  {m.training.map((t) => {
                    const chip = STATUS_CHIP[t.status];
                    return (
                      <div key={t.pathId} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500 w-20 shrink-0">{t.category}</span>
                        <span className={`badge ${chip.cls}`}>{chip.label}</span>
                        {t.assignment && (
                          <span className={`inline-flex items-center gap-1 ${t.assignment.overdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                            <Clock className="w-3 h-3" />
                            {t.assignment.dueDate ? `due ${t.assignment.dueDate}` : 'assigned'}{t.assignment.overdue ? ' · overdue' : ''}
                          </span>
                        )}
                        {t.assignment && t.status !== 'completed' && (
                          <button onClick={() => nudge(m, t.pathId)} title="Nudge about this path"
                            className="text-nobus-500 hover:text-nobus-700"><Bell className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-nobus-600">{m.certifiedCount}/3</td>
              {isOrgAdmin && (
                <td className="px-4 py-3">
                  <select value={m.role} disabled={m.role === 'super_admin'}
                    onChange={(e) => act(() => api.changeMemberRole(m.id, e.target.value, m.roleCategory), `${m.name}'s role updated.`)}
                    className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-nobus-400">
                    {['org_admin', 'team_manager', 'user'].map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                  </select>
                </td>
              )}
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button title="Assign training" onClick={() => onAssign(m)}
                    className="p-1.5 rounded text-gray-400 hover:bg-nobus-50 hover:text-nobus-600"><GraduationCap className="w-4 h-4" /></button>
                  <button title="Nudge" onClick={() => nudge(m, null)}
                    className="p-1.5 rounded text-gray-400 hover:bg-nobus-50 hover:text-nobus-600"><Bell className="w-4 h-4" /></button>
                  {isOrgAdmin && (
                    <>
                      <button title="Email password reset" onClick={() => { if (confirm(`Send a password reset link to ${m.email}? Their current sessions will be signed out.`)) act(() => api.resetMemberPassword(m.id)); }}
                        className="p-1.5 rounded text-gray-400 hover:bg-amber-50 hover:text-amber-600"><KeyRound className="w-4 h-4" /></button>
                      <button title={m.status === 'active' ? 'Deactivate' : 'Activate'}
                        onClick={() => act(() => api.setMemberStatus(m.id, m.status === 'active' ? 'inactive' : 'active'))}
                        className={`p-1.5 rounded hover:bg-gray-100 ${m.status === 'active' ? 'text-gray-400 hover:text-red-500' : 'text-green-500'}`}>
                        <UserCog className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {members.length === 0 && <tr><td colSpan={isOrgAdmin ? 6 : 5} className="px-4 py-10 text-center text-gray-400">No team members in your scope yet.</td></tr>}
        </tbody>
      </table>
      <div className="px-4 py-2 text-[11px] text-gray-400 border-t">
        Assigning off-function training (e.g. a Technical course to a Sales rep) is allowed, but only role-matched certifications count toward your partner tier.
      </div>
    </div>
  );
}

function AssignModal({ member, paths, onClose, onDone, flash }) {
  const [pathId, setPathId] = useState(paths[0]?.id || '');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await api.assignTraining(member.id, pathId, dueDate || undefined, note || undefined); onDone(`Assigned "${paths.find((p) => p.id === pathId)?.name}" to ${member.name}.`); }
    catch (err) { flash('err', err.message); setSaving(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} className="bg-white rounded-xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h3 className="font-bold text-gray-900">Assign Training to {member.name}</h3><button type="button" onClick={onClose}><X className="w-5 h-5" /></button></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Learning path</label>
          <select value={pathId} onChange={(e) => setPathId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {paths.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}
          </select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Due date (optional)</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
          <textarea rows="2" value={note} onChange={(e) => setNote(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Why this matters / context for the member" /></div>
        <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Assigning...' : 'Assign & notify'}</button>
      </form>
    </div>
  );
}

// ---------------- Tier panel (org admin) ----------------
function TierPanel({ org }) {
  const tierDef = getTierDef(org.tier);
  const nextTier = getNextTier(org.tier);
  const trainedCounts = org.trainedCounts || { Sales: 0, Presales: 0, Technical: 0 };
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 card p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-amber-500" /> Tier Status</h2>
        <div className="text-center mb-6"><div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold border ${tierDef.bgClass}`}>{org.tier}</div></div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Certified staff vs next tier</h3>
        <div className="space-y-3 mb-6">
          {['Sales', 'Presales', 'Technical'].map((role) => {
            const current = trainedCounts[role] || 0;
            const required = nextTier ? nextTier.requirements[role] : current;
            return (
              <div key={role}>
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-700">{role}</span><span className="font-medium">{current}{nextTier ? ` / ${required}` : ''}</span></div>
                <ProgressBar value={current} max={Math.max(required, 1)} color="nobus" showLabel={false} size="sm" />
              </div>
            );
          })}
        </div>
        {nextTier && <div className="bg-gray-50 rounded-lg p-4 text-sm"><p className="font-medium text-gray-700 mb-1">Next: {nextTier.name}</p><p className="text-gray-500 text-xs">{nextTier.requirements.description}</p></div>}
      </div>
      <div className="lg:col-span-2 card p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Current benefits</h3>
        <ul className="space-y-1.5">
          {tierDef.benefits.map((b, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />{b}</li>)}
        </ul>
      </div>
    </div>
  );
}

// ---------------- Activity log (org admin) ----------------
const ACTION_LABEL = {
  training_assigned: 'assigned training', training_nudge: 'nudged a member',
  member_role_changed: 'changed a role', member_password_reset: 'reset a password',
  member_status_changed: 'changed a member status', login: 'signed in',
  deal_registered: 'registered a deal', quote_created: 'built a quote',
};
function ActivityLog({ flash }) {
  const [rows, setRows] = useState(null);
  useEffect(() => { api.getTeamAudit().then(setRows).catch((e) => { flash('err', e.message); setRows([]); }); }, [flash]);
  if (!rows) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-nobus-500" /></div>;
  if (rows.length === 0) return <div className="card p-12 text-center text-gray-500">No recorded activity yet.</div>;
  return (
    <div className="card divide-y">
      {rows.map((r) => (
        <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-700">
            <span className="font-medium">{r.actor_name}</span> {ACTION_LABEL[r.action] || r.action}
            {r.details && <span className="text-gray-400"> · {r.details}</span>}
          </div>
          <span className="text-xs text-gray-400 shrink-0">{new Date(r.created_at + 'Z').toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------- Invite (org admin) ----------------
function InviteModal({ onClose, onDone }) {
  const [form, setForm] = useState({ name: '', email: '', roleCategory: 'Sales' });
  const [msg, setMsg] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const r = await api.inviteUser(form);
      setMsg(`${r.user.name} added. Temporary password: ${r.tempPassword}`);
      setForm({ name: '', email: '', roleCategory: 'Sales' });
      onDone(`${r.user.name} invited.`);
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-gray-900">Invite Team Member</h2><button onClick={onClose}><X className="w-5 h-5" /></button></div>
        {msg && <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-4"><CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />{msg}</div>}
        {err && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4"><XCircle className="w-4 h-4 shrink-0" />{err}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nobus-500 outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nobus-500 outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Learning Track</label>
            <select value={form.roleCategory} onChange={(e) => setForm((p) => ({ ...p, roleCategory: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nobus-500 outline-none">
              <option>Sales</option><option>Presales</option><option>Technical</option>
            </select></div>
          <div className="flex gap-3"><button type="button" onClick={onClose} className="btn-secondary flex-1">Close</button>
            <button type="submit" disabled={busy} className="btn-primary flex-1 flex items-center justify-center gap-2"><Mail className="w-4 h-4" />{busy ? 'Adding...' : 'Add User'}</button></div>
        </form>
      </div>
    </div>
  );
}

function Th({ children }) { return <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3 whitespace-nowrap">{children}</th>; }
