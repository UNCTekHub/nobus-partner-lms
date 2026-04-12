import { useState, useEffect } from 'react';
import {
  Users, UserPlus, Award, TrendingUp, Shield,
  Mail, CheckCircle, XCircle, BarChart3, Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { determineTier, getTierDef, getNextTier } from '../data/tiers';
import ProgressBar from '../components/ProgressBar';

export default function OrgAdminDashboard() {
  const { currentUser } = useAuth();
  const [org, setOrg] = useState(null);
  const [orgUsers, setOrgUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', roleCategory: 'Sales' });
  const [inviteMsg, setInviteMsg] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [orgData, usersData] = await Promise.all([api.getMyOrg(), api.getOrgUsers()]);
      setOrg(orgData);
      setOrgUsers(usersData);
    } catch {
      // handled by auth redirect
    } finally {
      setLoading(false);
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteMsg('');
    setInviting(true);
    try {
      const result = await api.inviteUser(inviteForm);
      setInviteMsg(`${result.user.name} added. Temporary password: ${result.tempPassword}`);
      setInviteForm({ name: '', email: '', roleCategory: 'Sales' });
      loadData(); // refresh user list
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-nobus-500" />
      </div>
    );
  }

  if (!org) return <div className="p-10 text-center text-gray-500">Organization not found.</div>;

  const tierDef = getTierDef(org.tier);
  const nextTier = getNextTier(org.tier);
  const trainedCounts = org.trainedCounts || { Sales: 0, Presales: 0, Technical: 0 };

  const roleStats = {
    Sales: orgUsers.filter((u) => u.role_category === 'Sales').length,
    Presales: orgUsers.filter((u) => u.role_category === 'Presales').length,
    Technical: orgUsers.filter((u) => u.role_category === 'Technical').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
          <p className="text-gray-500 text-sm mt-1">Partner ID: {org.partner_id} &middot; RC: {org.rc_number}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${tierDef.bgClass}`}>
            {org.tier} Partner
          </span>
          <button onClick={() => { setShowInvite(true); setInviteMsg(''); setInviteError(''); }} className="btn-primary flex items-center gap-2 text-sm">
            <UserPlus className="w-4 h-4" /> Invite User
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: orgUsers.length, icon: Users, color: 'text-nobus-600' },
          { label: 'Sales Staff', value: roleStats.Sales, icon: TrendingUp, color: 'text-blue-600' },
          { label: 'Presales Staff', value: roleStats.Presales, icon: BarChart3, color: 'text-purple-600' },
          { label: 'Technical Staff', value: roleStats.Technical, icon: Shield, color: 'text-accent-600' },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tier Progress */}
        <div className="lg:col-span-1 card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Tier Status
          </h2>
          <div className="text-center mb-6">
            <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold border ${tierDef.bgClass}`}>
              {org.tier}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Trained Staff vs Requirements</h3>
            {['Sales', 'Presales', 'Technical'].map((role) => {
              const current = trainedCounts[role] || 0;
              const required = nextTier ? nextTier.requirements[role] : current;
              return (
                <div key={role}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{role}</span>
                    <span className="font-medium">{current}{nextTier ? ` / ${required}` : ''}</span>
                  </div>
                  <ProgressBar value={current} max={Math.max(required, 1)} color="nobus" showLabel={false} size="sm" />
                </div>
              );
            })}
          </div>

          {nextTier && (
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <p className="font-medium text-gray-700 mb-1">Next: {nextTier.name}</p>
              <p className="text-gray-500 text-xs">{nextTier.requirements.description}</p>
            </div>
          )}

          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Current Benefits</h3>
          <ul className="space-y-1">
            {tierDef.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* User List */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-nobus-600" /> Team Members
            </h2>
            <span className="text-sm text-gray-500">{orgUsers.length} users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Name</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Role</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Track</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orgUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-nobus-100 rounded-full flex items-center justify-center text-xs font-bold text-nobus-700">
                          {u.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-xs font-medium text-gray-600 capitalize">
                        {u.role === 'org_admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`badge ${
                        u.role_category === 'Sales' ? 'bg-blue-50 text-blue-700' :
                        u.role_category === 'Presales' ? 'bg-purple-50 text-purple-700' :
                        'bg-accent-50 text-accent-700'
                      }`}>
                        {u.role_category || '—'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        u.status === 'active' ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {u.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-gray-500">{u.last_active?.split('T')[0] || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Invite Team Member</h2>

            {inviteMsg && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-4">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {inviteMsg}
              </div>
            )}
            {inviteError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                {inviteError}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm((p) => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nobus-500 focus:border-nobus-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nobus-500 focus:border-nobus-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Learning Track</label>
                <select
                  value={inviteForm.roleCategory}
                  onChange={(e) => setInviteForm((p) => ({ ...p, roleCategory: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nobus-500 focus:border-nobus-500 outline-none"
                >
                  <option value="Sales">Sales</option>
                  <option value="Presales">Presales</option>
                  <option value="Technical">Technical</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowInvite(false)} className="btn-secondary flex-1">Close</button>
                <button type="submit" disabled={inviting} className={`btn-primary flex-1 flex items-center justify-center gap-2 ${inviting ? 'opacity-60' : ''}`}>
                  <Mail className="w-4 h-4" /> {inviting ? 'Sending...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
