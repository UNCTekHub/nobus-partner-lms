import { useState, useEffect } from 'react';
import {
  Building2, Users, Award, CheckCircle, XCircle, Clock,
  ChevronRight, Loader2,
} from 'lucide-react';
import { api } from '../lib/api';
import { getTierDef, TIER_DEFINITIONS } from '../data/tiers';

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [organizations, setOrganizations] = useState([]);
  const [pendingOrgs, setPendingOrgs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [orgs, pending, users] = await Promise.all([
        api.getOrganizations(),
        api.getPendingOrgs(),
        api.getAllUsers(),
      ]);
      setOrganizations(orgs);
      setPendingOrgs(pending);
      setAllUsers(users);
    } catch {
      // handled by auth
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (orgId) => {
    try {
      const result = await api.approveOrg(orgId);
      alert(`Approved! Admin account: ${result.adminAccount.email} / ${result.adminAccount.tempPassword}`);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (orgId) => {
    try {
      await api.rejectOrg(orgId);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-nobus-500" />
      </div>
    );
  }

  const activeOrgs = organizations.filter((o) => o.status === 'active').length;
  const pendingCount = pendingOrgs.filter((o) => o.status === 'pending').length;

  const tierDistribution = TIER_DEFINITIONS.map((tier) => ({
    name: tier.name,
    count: organizations.filter((o) => o.tier === tier.name).length,
    bgClass: tier.bgClass,
  }));

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'organizations', label: 'Organizations' },
    { id: 'approvals', label: `Approvals (${pendingCount})` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nobus Admin Console</h1>
        <p className="text-gray-500 text-sm mt-1">Manage partner organizations and platform operations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-nobus-500 text-nobus-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active Partners', value: activeOrgs, icon: Building2, color: 'text-nobus-600' },
              { label: 'Pending Approvals', value: pendingCount, icon: Clock, color: 'text-amber-600' },
              { label: 'Total Users', value: allUsers.length, icon: Users, color: 'text-blue-600' },
              { label: 'Tier Levels', value: TIER_DEFINITIONS.length, icon: Award, color: 'text-purple-600' },
            ].map((s) => (
              <div key={s.label} className="card p-5">
                <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="card p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Partner Tier Distribution</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {tierDistribution.map((t) => (
                <div key={t.name} className={`rounded-lg border p-4 text-center ${t.bgClass}`}>
                  <div className="text-2xl font-bold">{t.count}</div>
                  <div className="text-xs font-medium">{t.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Partner Organizations</h2>
            <div className="space-y-3">
              {organizations.map((org) => {
                const tierDef = getTierDef(org.tier);
                return (
                  <div key={org.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-nobus-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-nobus-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{org.name}</div>
                        <div className="text-xs text-gray-500">{org.totalUsers} users &middot; {org.state}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${tierDef.bgClass}`}>
                        {org.tier}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Organizations Tab */}
      {activeTab === 'organizations' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Organization</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Partner ID</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Tier</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Users</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Enrolled</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {organizations.map((org) => {
                  const tierDef = getTierDef(org.tier);
                  return (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{org.name}</div>
                        <div className="text-xs text-gray-500">{org.state}, {org.country}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{org.partner_id}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${tierDef.bgClass}`}>
                          {org.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{org.totalUsers}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{org.enrollment_date}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {pendingOrgs.length === 0 ? (
            <div className="card p-10 text-center text-gray-500">No pending applications.</div>
          ) : (
            pendingOrgs.map((org) => (
              <div key={org.id} className="card p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{org.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        org.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        org.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {org.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                      <p><span className="text-gray-400">RC:</span> {org.rc_number}</p>
                      <p><span className="text-gray-400">Contact:</span> {org.contact_name}</p>
                      <p><span className="text-gray-400">Email:</span> {org.contact_email}</p>
                      <p><span className="text-gray-400">Phone:</span> {org.phone}</p>
                      <p><span className="text-gray-400">State:</span> {org.state}</p>
                      <p><span className="text-gray-400">Est. Staff:</span> {org.estimated_staff}</p>
                      <p><span className="text-gray-400">Submitted:</span> {org.submitted_date}</p>
                    </div>
                  </div>
                  {org.status === 'pending' && (
                    <div className="flex gap-2 md:flex-col">
                      <button
                        onClick={() => handleApprove(org.id)}
                        className="btn-primary flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(org.id)}
                        className="btn-secondary !border-red-300 !text-red-600 hover:!bg-red-50 flex items-center gap-2 text-sm"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
