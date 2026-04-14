import { useState, useEffect } from 'react';
import {
  Building2, Users, Award, CheckCircle, XCircle, Clock,
  ChevronRight, Loader2, Search, Download, Upload, ChevronLeft,
  Shield, FileText, Trash2, Edit3, KeyRound, BarChart3, Settings,
} from 'lucide-react';
import { api } from '../lib/api';
import { getTierDef, TIER_DEFINITIONS } from '../data/tiers';

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [organizations, setOrganizations] = useState([]);
  const [pendingOrgs, setPendingOrgs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [auditLog, setAuditLog] = useState({ logs: [], total: 0, page: 1 });
  const [dashboardReport, setDashboardReport] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkOrgId, setBulkOrgId] = useState('');
  const [bulkResult, setBulkResult] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [orgs, pending, users] = await Promise.all([
        api.getOrganizations(), api.getPendingOrgs(), api.getAllUsers(),
      ]);
      setOrganizations(orgs); setPendingOrgs(pending); setAllUsers(users);
    } catch {} finally { setLoading(false); }
  }

  const handleApprove = async (orgId) => {
    try {
      const result = await api.approveOrg(orgId);
      alert(`Approved! Admin account:\n${result.adminAccount.email}\nTemp password: ${result.adminAccount.tempPassword}`);
      loadData();
    } catch (err) { alert(err.message); }
  };

  const handleReject = async (orgId) => {
    if (!confirm('Reject this application?')) return;
    try { await api.rejectOrg(orgId); loadData(); } catch (err) { alert(err.message); }
  };

  async function handleSearch() {
    if (searchQuery.length < 2) return;
    try { setSearchResults(await api.adminSearch(searchQuery)); } catch {}
  }

  async function loadOrgDetail(orgId) {
    try {
      const data = await api.adminGetOrg(orgId);
      setSelectedOrg(data);
      setActiveTab('orgDetail');
    } catch (err) { alert(err.message); }
  }

  async function loadAuditLog(page = 1) {
    try { setAuditLog(await api.adminGetAuditLog(page)); } catch {}
  }

  async function loadDashboardReport() {
    try { setDashboardReport(await api.adminGetDashboardReport()); } catch {}
  }

  async function handleUpdateUser() {
    if (!editingUser) return;
    try {
      await api.adminUpdateUser(editingUser.id, {
        name: editingUser.name, email: editingUser.email,
        role: editingUser.role, roleCategory: editingUser.role_category,
        status: editingUser.status,
      });
      alert('User updated'); setEditingUser(null); loadData();
    } catch (err) { alert(err.message); }
  }

  async function handleResetPassword(userId) {
    try {
      const result = await api.adminResetPassword(userId);
      alert(`Password reset!\nNew temp password: ${result.tempPassword}`);
    } catch (err) { alert(err.message); }
  }

  async function handleDeleteUser(userId) {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try { await api.adminDeleteUser(userId); loadData(); } catch (err) { alert(err.message); }
  }

  async function handleBulkImport() {
    if (!bulkFile || !bulkOrgId) { alert('Select a file and organization'); return; }
    try {
      const result = await api.adminBulkImport(bulkFile, bulkOrgId);
      setBulkResult(result);
      loadData();
    } catch (err) { alert(err.message); }
  }

  function downloadExport(type) {
    const token = localStorage.getItem('nobus-lms-token');
    const url = type === 'users' ? api.adminExportUsers() : type === 'orgs' ? api.adminExportOrgs() : api.adminExportProgress();
    window.open(url + `?token=${token}`, '_blank');
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-nobus-500" /></div>;

  const activeOrgs = organizations.filter(o => o.status === 'active').length;
  const pendingCount = pendingOrgs.filter(o => o.status === 'pending').length;
  const tierDistribution = TIER_DEFINITIONS.map(tier => ({
    name: tier.name, count: organizations.filter(o => o.tier === tier.name).length, bgClass: tier.bgClass,
  }));

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'organizations', label: 'Organizations' },
    { id: 'approvals', label: `Approvals (${pendingCount})` },
    { id: 'users', label: 'Users' },
    { id: 'reports', label: 'Reports' },
    { id: 'audit', label: 'Audit Log' },
    { id: 'tools', label: 'Tools' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nobus Admin Console</h1>
          <p className="text-gray-500 text-sm mt-1">Manage partner organizations and platform operations</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search orgs, users..." className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-nobus-500 outline-none w-64" />
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="card p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-sm">Search Results</h3>
            <button onClick={() => setSearchResults(null)} className="text-xs text-gray-500 hover:text-gray-700">Clear</button>
          </div>
          {searchResults.organizations?.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Organizations</h4>
              {searchResults.organizations.map(org => (
                <button key={org.id} onClick={() => loadOrgDetail(org.id)}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm flex justify-between items-center">
                  <span className="font-medium">{org.name}</span>
                  <span className="text-xs text-gray-500">{org.tier}</span>
                </button>
              ))}
            </div>
          )}
          {searchResults.users?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Users</h4>
              {searchResults.users.map(u => (
                <div key={u.id} className="p-2 hover:bg-gray-50 rounded text-sm flex justify-between items-center">
                  <div><span className="font-medium">{u.name}</span> <span className="text-gray-500">({u.email})</span></div>
                  <span className="text-xs text-gray-500">{u.org_name || 'No org'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-gray-200 overflow-x-auto">
        {(selectedOrg ? [{ id: 'orgDetail', label: `← ${selectedOrg.name}` }] : tabs).map(tab => (
          <button key={tab.id} onClick={() => {
            if (tab.id === 'orgDetail' && selectedOrg) { setSelectedOrg(null); setActiveTab('organizations'); return; }
            setActiveTab(tab.id);
            if (tab.id === 'audit') loadAuditLog();
            if (tab.id === 'reports') loadDashboardReport();
          }}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'border-nobus-500 text-nobus-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active Partners', value: activeOrgs, icon: Building2, color: 'text-nobus-600' },
              { label: 'Pending Approvals', value: pendingCount, icon: Clock, color: 'text-amber-600' },
              { label: 'Total Users', value: allUsers.length, icon: Users, color: 'text-blue-600' },
              { label: 'Tier Levels', value: TIER_DEFINITIONS.length, icon: Award, color: 'text-purple-600' },
            ].map(s => (
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
              {tierDistribution.map(t => (
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
              {organizations.map(org => {
                const tierDef = getTierDef(org.tier);
                return (
                  <button key={org.id} onClick={() => loadOrgDetail(org.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
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
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${tierDef.bgClass}`}>{org.tier}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Organization Detail Drill-down */}
      {activeTab === 'orgDetail' && selectedOrg && (
        <div>
          <button onClick={() => { setSelectedOrg(null); setActiveTab('organizations'); }}
            className="flex items-center gap-1 text-nobus-600 hover:underline text-sm mb-4">
            <ChevronLeft className="w-4 h-4" /> Back to Organizations
          </button>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card p-4"><div className="text-xs text-gray-500">Partner ID</div><div className="font-bold">{selectedOrg.partner_id}</div></div>
            <div className="card p-4"><div className="text-xs text-gray-500">Tier</div><div className="font-bold">{selectedOrg.tier}</div></div>
            <div className="card p-4"><div className="text-xs text-gray-500">Total Users</div><div className="font-bold">{selectedOrg.totalUsers}</div></div>
            <div className="card p-4"><div className="text-xs text-gray-500">Avg Quiz Score</div><div className="font-bold">{selectedOrg.quizStats?.avg_score || 0}%</div></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {['Sales', 'Presales', 'Technical'].map(cat => (
              <div key={cat} className="card p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">{cat} Trained</div>
                <div className="text-2xl font-bold text-nobus-600">{selectedOrg.trainedCounts?.[cat] || 0}</div>
              </div>
            ))}
          </div>
          <div className="card overflow-hidden">
            <div className="px-6 py-3 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="font-semibold text-sm">Team Members</h3>
            </div>
            <table className="w-full">
              <thead><tr className="border-b bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-2">Name</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-2">Role</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-2">Paths</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-2">Points</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-2">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-2">Actions</th>
              </tr></thead>
              <tbody className="divide-y">
                {selectedOrg.users?.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3"><div className="text-sm font-medium">{u.name}</div><div className="text-xs text-gray-500">{u.email}</div></td>
                    <td className="px-6 py-3 text-sm">{u.role_category || '—'}</td>
                    <td className="px-6 py-3 text-sm">{u.completedPaths?.length || 0}</td>
                    <td className="px-6 py-3 text-sm font-medium text-nobus-600">{u.totalPoints || 0}</td>
                    <td className="px-6 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span></td>
                    <td className="px-6 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEditingUser({ ...u })} className="p-1 text-gray-400 hover:text-blue-600"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleResetPassword(u.id)} className="p-1 text-gray-400 hover:text-amber-600"><KeyRound className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Organizations Tab */}
      {activeTab === 'organizations' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Organization</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Partner ID</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Tier</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Users</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Enrolled</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Actions</th>
            </tr></thead>
            <tbody className="divide-y">
              {organizations.map(org => {
                const tierDef = getTierDef(org.tier);
                return (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4"><div className="text-sm font-medium">{org.name}</div><div className="text-xs text-gray-500">{org.state}</div></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{org.partner_id}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold border ${tierDef.bgClass}`}>{org.tier}</span></td>
                    <td className="px-6 py-4 text-sm">{org.totalUsers}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{org.enrollment_date}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => loadOrgDetail(org.id)} className="text-xs text-nobus-600 hover:underline">View Details →</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {pendingOrgs.length === 0 ? (
            <div className="card p-10 text-center text-gray-500">No pending applications.</div>
          ) : pendingOrgs.map(org => (
            <div key={org.id} className="card p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{org.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      org.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      org.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>{org.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                    <p><span className="text-gray-400">RC:</span> {org.rc_number}</p>
                    <p><span className="text-gray-400">Contact:</span> {org.contact_name}</p>
                    <p><span className="text-gray-400">Email:</span> {org.contact_email}</p>
                    <p><span className="text-gray-400">Phone:</span> {org.phone}</p>
                    <p><span className="text-gray-400">State:</span> {org.state}</p>
                    <p><span className="text-gray-400">Staff:</span> {org.estimated_staff}</p>
                  </div>
                </div>
                {org.status === 'pending' && (
                  <div className="flex gap-2 md:flex-col">
                    <button onClick={() => handleApprove(org.id)} className="btn-primary flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => handleReject(org.id)}
                      className="btn-secondary !border-red-300 !text-red-600 hover:!bg-red-50 flex items-center gap-2 text-sm">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Name</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Organization</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Role</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Actions</th>
            </tr></thead>
            <tbody className="divide-y">
              {allUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3"><div className="text-sm font-medium">{u.name}</div><div className="text-xs text-gray-500">{u.email}</div></td>
                  <td className="px-6 py-3 text-sm text-gray-600">{u.org_name || '—'}</td>
                  <td className="px-6 py-3 text-sm capitalize">{u.role?.replace('_', ' ')}</td>
                  <td className="px-6 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span></td>
                  <td className="px-6 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setEditingUser({ ...u })} className="p-1 text-gray-400 hover:text-blue-600" title="Edit"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleResetPassword(u.id)} className="p-1 text-gray-400 hover:text-amber-600" title="Reset Password"><KeyRound className="w-4 h-4" /></button>
                      {u.role !== 'super_admin' && <button onClick={() => handleDeleteUser(u.id)} className="p-1 text-gray-400 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div>
          {dashboardReport && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Lessons Completed', value: dashboardReport.totalLessonsCompleted },
                { label: 'Quizzes Passed', value: dashboardReport.totalQuizzesPassed },
                { label: 'Certificates Issued', value: dashboardReport.totalCertificates },
                { label: 'Active Users', value: dashboardReport.activeUsers },
              ].map(s => (
                <div key={s.label} className="card p-5">
                  <div className="text-2xl font-bold text-nobus-600">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          )}
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4">Export Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Users Report', desc: 'All users with roles, orgs, progress', type: 'users' },
                { label: 'Organizations Report', desc: 'All partner organizations with metrics', type: 'orgs' },
                { label: 'Learning Progress', desc: 'Detailed progress across all learners', type: 'progress' },
              ].map(r => (
                <div key={r.type} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-gray-400" /><span className="font-medium text-sm">{r.label}</span></div>
                  <p className="text-xs text-gray-500 mb-3">{r.desc}</p>
                  <button onClick={() => downloadExport(r.type)} className="btn-secondary text-xs flex items-center gap-1"><Download className="w-3 h-3" /> Download CSV</button>
                </div>
              ))}
            </div>
          </div>
          {dashboardReport?.topOrgs && (
            <div className="card p-6 mt-6">
              <h2 className="text-lg font-bold mb-4">Top Organizations by Completion</h2>
              <div className="space-y-2">
                {dashboardReport.topOrgs.map((org, i) => (
                  <div key={org.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 w-6">#{i + 1}</span>
                      <div><div className="text-sm font-medium">{org.name}</div><div className="text-xs text-gray-500">{org.user_count} users</div></div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-nobus-600">{org.completions} completions</div>
                      <div className="text-xs text-gray-500">{org.tier}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Time</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">User</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Action</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Details</th>
            </tr></thead>
            <tbody className="divide-y">
              {auditLog.logs?.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-6 py-3 text-sm">{log.user_name || 'System'}</td>
                  <td className="px-6 py-3"><span className="text-xs px-2 py-0.5 bg-gray-100 rounded font-mono">{log.action}</span></td>
                  <td className="px-6 py-3 text-xs text-gray-500 max-w-xs truncate">{log.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {auditLog.totalPages > 1 && (
            <div className="px-6 py-3 border-t flex justify-between items-center">
              <span className="text-xs text-gray-500">Page {auditLog.page} of {auditLog.totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => loadAuditLog(auditLog.page - 1)} disabled={auditLog.page <= 1} className="btn-secondary text-xs">Prev</button>
                <button onClick={() => loadAuditLog(auditLog.page + 1)} disabled={auditLog.page >= auditLog.totalPages} className="btn-secondary text-xs">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Upload className="w-5 h-5" /> Bulk User Import</h2>
            <p className="text-sm text-gray-500 mb-4">Upload a CSV file with columns: name, email, role_category (Sales/Presales/Technical)</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <select value={bulkOrgId} onChange={e => setBulkOrgId(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm">
                <option value="">Select Organization</option>
                {organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              <input type="file" accept=".csv" onChange={e => setBulkFile(e.target.files[0])} className="text-sm" />
              <button onClick={handleBulkImport} className="btn-primary text-sm">Import</button>
            </div>
            {bulkResult && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                <p className="text-green-600 font-medium">Created: {bulkResult.created}</p>
                <p className="text-amber-600">Skipped: {bulkResult.skipped}</p>
                {bulkResult.errors?.length > 0 && (
                  <div className="mt-2 text-xs text-red-600">{bulkResult.errors.slice(0, 5).map((e, i) => <p key={i}>{e}</p>)}</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Edit User</h2>
            <div className="space-y-3">
              <div><label className="text-xs text-gray-500">Name</label><input value={editingUser.name || ''}
                onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
              <div><label className="text-xs text-gray-500">Email</label><input value={editingUser.email || ''}
                onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
              <div><label className="text-xs text-gray-500">Role</label>
                <select value={editingUser.role || 'user'}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                  <option value="user">User</option>
                  <option value="org_admin">Org Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select></div>
              <div><label className="text-xs text-gray-500">Role Category</label>
                <select value={editingUser.role_category || ''}
                  onChange={e => setEditingUser({ ...editingUser, role_category: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                  <option value="">None</option>
                  <option value="Sales">Sales</option>
                  <option value="Presales">Presales</option>
                  <option value="Technical">Technical</option>
                </select></div>
              <div><label className="text-xs text-gray-500">Status</label>
                <select value={editingUser.status || 'active'}
                  onChange={e => setEditingUser({ ...editingUser, status: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select></div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={handleUpdateUser} className="btn-primary flex-1">Save</button>
              <button onClick={() => setEditingUser(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
