const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const TOKEN_KEY = 'nobus-pc-token';
const LEGACY_TOKEN_KEY = 'nobus-lms-token';

export function getToken() {
  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) return stored;
    // Migrate sessions created under the old key so nobody is logged out
    const legacy = localStorage.getItem(LEGACY_TOKEN_KEY);
    if (legacy) {
      localStorage.setItem(TOKEN_KEY, legacy);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
      return legacy;
    }
    return null;
  } catch {
    return null;
  }
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  if (!options.isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  // Handle file downloads
  if (options.responseType === 'blob') {
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Download failed');
    }
    return res.blob();
  }

  const data = await res.json();

  if (res.status === 401 && !endpoint.includes('/auth/login')) {
    setToken(null);
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please sign in again.');
  }

  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getMe: () => request('/auth/me'),
  registerOrg: (form) => request('/auth/register-org', { method: 'POST', body: JSON.stringify(form) }),
  changePassword: (currentPassword, newPassword) =>
    request('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, newPassword) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) }),

  // Organizations
  getOrganizations: () => request('/organizations'),
  getMyOrg: () => request('/organizations/mine'),
  getPendingOrgs: () => request('/organizations/pending'),
  approveOrg: (id) => request(`/organizations/approve/${id}`, { method: 'POST' }),
  rejectOrg: (id) => request(`/organizations/reject/${id}`, { method: 'POST' }),

  // Users
  getOrgUsers: () => request('/users/org'),
  getAllUsers: (params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/users/all${qs}`);
  },
  inviteUser: (data) => request('/users/invite', { method: 'POST', body: JSON.stringify(data) }),
  updateUserStatus: (id, status) => request(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Delegated tenant administration (org admin + team manager)
  getTeamMeta: () => request('/team/meta'),
  getTeamMembers: () => request('/team/members'),
  assignTraining: (userId, pathId, dueDate, note) => request('/team/assign', { method: 'POST', body: JSON.stringify({ userId, pathId, dueDate, note }) }),
  cancelAssignment: (id) => request(`/team/assign/${id}/cancel`, { method: 'PATCH' }),
  nudgeMember: (userId, pathId) => request('/team/nudge', { method: 'POST', body: JSON.stringify({ userId, pathId }) }),
  changeMemberRole: (id, role, roleCategory) => request(`/team/members/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role, roleCategory }) }),
  resetMemberPassword: (id) => request(`/team/members/${id}/reset-password`, { method: 'POST' }),
  setMemberStatus: (id, status) => request(`/team/members/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getTeamAudit: () => request('/team/audit'),
  getProfile: () => request('/users/profile'),
  updateProfile: (data) => request('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Progress
  getProgress: () => request('/progress'),
  completeLesson: (lessonId) => request(`/progress/lesson/${lessonId}`, { method: 'POST' }),
  saveQuiz: (quizId, answers) => request('/progress/quiz', { method: 'POST', body: JSON.stringify({ quizId, answers }) }),
  resetProgress: () => request('/progress/reset', { method: 'POST' }),
  getRecommendations: () => request('/progress/recommendations'),

  // Certificates
  getCertificates: () => request('/certificates'),
  downloadCertificate: (pathId) => request(`/certificates/${pathId}`, { responseType: 'blob' }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'POST' }),
  getNotificationPreferences: () => request('/notifications/preferences'),
  setNotificationPreference: (category, enabled) => request('/notifications/preferences', { method: 'PUT', body: JSON.stringify({ category, enabled }) }),

  // Discussions
  getForumMeta: () => request('/discussions/meta'),
  acceptGuidelines: () => request('/discussions/accept', { method: 'POST' }),
  getDiscussions: (params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/discussions${qs}`);
  },
  getDiscussion: (id) => request(`/discussions/${id}`),
  createDiscussion: (data) => request('/discussions', { method: 'POST', body: JSON.stringify(data) }),
  postReply: (discussionId, body) => request(`/discussions/${discussionId}/reply`, { method: 'POST', body: JSON.stringify({ body }) }),
  markAnswer: (discussionId, replyId) => request(`/discussions/${discussionId}/reply/${replyId}/answer`, { method: 'PATCH' }),
  pinDiscussion: (id, pinned) => request(`/discussions/${id}/pin`, { method: 'PATCH', body: JSON.stringify({ pinned }) }),
  closeDiscussion: (id, closed) => request(`/discussions/${id}/close`, { method: 'PATCH', body: JSON.stringify({ closed }) }),
  deleteDiscussion: (id) => request(`/discussions/${id}`, { method: 'DELETE' }),

  // Gamification
  getMyStats: () => request('/gamification/my-stats'),
  getLeaderboard: (scope, orgId) => {
    const params = { scope: scope || 'global' };
    if (orgId) params.orgId = orgId;
    return request('/gamification/leaderboard?' + new URLSearchParams(params).toString());
  },
  getOrgLeaderboard: () => request('/gamification/org-leaderboard'),

  // Admin
  adminUpdateUser: (id, data) => request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  adminResetPassword: (id) => request(`/admin/users/${id}/reset-password`, { method: 'POST' }),
  adminDeleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  adminGetOrg: (id) => request(`/admin/organizations/${id}`),
  adminUpdateOrg: (id, data) => request(`/admin/organizations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  adminSearch: (q, type) => request(`/admin/search?q=${encodeURIComponent(q)}${type ? '&type=' + type : ''}`),
  adminGetAuditLog: (page, action) => {
    const params = { page: page || 1 };
    if (action) params.action = action;
    return request('/admin/audit?' + new URLSearchParams(params).toString());
  },
  adminGetDashboardReport: () => request('/admin/reports/dashboard'),
  // CSV exports are fetched as authenticated blobs (Authorization header) so the
  // session token is never placed in a URL/query string.
  adminExport: (type) => {
    const path = type === 'orgs' ? 'organizations' : type; // users | organizations | progress
    return request(`/admin/reports/${path}`, { responseType: 'blob' });
  },
  adminBulkImport: (file, orgId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('orgId', orgId);
    return request('/admin/users/bulk-import', { method: 'POST', body: formData, isFormData: true });
  },
  adminGetQuizPolicies: () => request('/admin/quiz-policies'),
  adminSetQuizPolicy: (quizId, data) => request(`/admin/quiz-policies/${quizId}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminGetSsoConfig: (orgId) => request(`/admin/sso/${orgId}`),
  adminSetSsoConfig: (orgId, data) => request(`/admin/sso/${orgId}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Deal registration
  getDeals: (status) => request(`/deals${status ? '?status=' + status : ''}`),
  registerDeal: (data) => request('/deals', { method: 'POST', body: JSON.stringify(data) }),
  approveDeal: (id) => request(`/deals/${id}/approve`, { method: 'PATCH' }),
  rejectDeal: (id, reason) => request(`/deals/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  closeDeal: (id, outcome) => request(`/deals/${id}/close`, { method: 'PATCH', body: JSON.stringify({ outcome }) }),
  reaffirmDeal: (id, note) => request(`/deals/${id}/reaffirm`, { method: 'PATCH', body: JSON.stringify({ note }) }),

  // Sales navigator / pipeline
  getLeads: () => request('/pipeline'),
  getForecast: () => request('/pipeline/forecast'),
  createLead: (data) => request('/pipeline', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id, data) => request(`/pipeline/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteLead: (id) => request(`/pipeline/${id}`, { method: 'DELETE' }),
  getLeadActivities: (id) => request(`/pipeline/${id}/activities`),
  addLeadActivity: (id, note) => request(`/pipeline/${id}/activities`, { method: 'POST', body: JSON.stringify({ note }) }),

  // Marketing materials
  getMarketingAssets: (params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/resources/marketing${qs}`);
  },
  downloadMarketingAsset: (id) => request(`/resources/marketing/${id}/download`, { method: 'POST' }),
  addMarketingAsset: (data) => request('/resources/marketing', { method: 'POST', body: JSON.stringify(data) }),
  updateMarketingAsset: (id, data) => request(`/resources/marketing/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Content hub
  getContentItems: (params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/resources/content${qs}`);
  },
  getContentItem: (id) => request(`/resources/content/${id}`),
  addContentItem: (data) => request('/resources/content', { method: 'POST', body: JSON.stringify(data) }),
  updateContentItem: (id, data) => request(`/resources/content/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Demo labs
  getLabs: () => request('/labs'),
  getLab: (id) => request(`/labs/${id}`),
  getLabAvailability: (id, date) => request(`/labs/${id}/availability?date=${date}`),
  bookLab: (id, data) => request(`/labs/${id}/book`, { method: 'POST', body: JSON.stringify(data) }),
  getLabBookings: () => request('/labs/bookings'),
  cancelLabBooking: (id) => request(`/labs/bookings/${id}/cancel`, { method: 'PATCH' }),
  completeLabBooking: (id) => request(`/labs/bookings/${id}/complete`, { method: 'PATCH' }),
  createLab: (data) => request('/labs', { method: 'POST', body: JSON.stringify(data) }),
  updateLab: (id, data) => request(`/labs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Quotes
  getQuotes: () => request('/quotes'),
  getQuote: (id) => request(`/quotes/${id}`),
  createQuote: (data) => request('/quotes', { method: 'POST', body: JSON.stringify(data) }),
  updateQuote: (id, data) => request(`/quotes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteQuote: (id) => request(`/quotes/${id}`, { method: 'DELETE' }),
  exportQuote: (id, format) => request(`/quotes/${id}/export?format=${format}`, { responseType: 'blob' }),

  // Partner growth: tier scorecard, earnings, analytics
  getScorecard: () => request('/partner/scorecard'),
  getEarnings: () => request('/partner/earnings'),
  markCreditPaid: (dealId, paid) => request(`/partner/earnings/${dealId}/paid`, { method: 'PATCH', body: JSON.stringify({ paid }) }),
  getPartnerAnalytics: () => request('/partner/analytics'),

  // MDF (Market Development Funds)
  getMdf: () => request('/mdf'),
  getMdfMeta: () => request('/mdf/meta'),
  createMdf: (data) => request('/mdf', { method: 'POST', body: JSON.stringify(data) }),
  approveMdf: (id, amountApproved, decisionNotes) => request(`/mdf/${id}/approve`, { method: 'PATCH', body: JSON.stringify({ amountApproved, decisionNotes }) }),
  rejectMdf: (id, reason) => request(`/mdf/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  submitMdfProof: (id, proofUrl, proofNotes) => request(`/mdf/${id}/proof`, { method: 'PATCH', body: JSON.stringify({ proofUrl, proofNotes }) }),
  reimburseMdf: (id) => request(`/mdf/${id}/reimburse`, { method: 'PATCH' }),

  // Support / case management
  getTickets: (status) => request(`/support${status ? '?status=' + status : ''}`),
  getTicket: (id) => request(`/support/${id}`),
  getSupportMeta: () => request('/support/meta'),
  createTicket: (data) => request('/support', { method: 'POST', body: JSON.stringify(data) }),
  replyTicket: (id, body) => request(`/support/${id}/reply`, { method: 'POST', body: JSON.stringify({ body }) }),
  setTicketStatus: (id, status) => request(`/support/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  setPartnerManager: (orgId, name, email) => request(`/support/manager/${orgId}`, { method: 'PATCH', body: JSON.stringify({ name, email }) }),

  // Public API key management
  generateApiKey: (data) => request('/public/keys', { method: 'POST', body: JSON.stringify(data) }),
  getApiKeys: (orgId) => request(`/public/keys${orgId ? '?orgId=' + orgId : ''}`),
  revokeApiKey: (id) => request(`/public/keys/${id}`, { method: 'DELETE' }),
  getApiDocs: () => request('/public/docs'),
};
