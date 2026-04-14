const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getToken() {
  try {
    const stored = localStorage.getItem('nobus-lms-token');
    return stored || null;
  } catch {
    return null;
  }
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('nobus-lms-token', token);
  } else {
    localStorage.removeItem('nobus-lms-token');
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
  getProfile: () => request('/users/profile'),
  updateProfile: (data) => request('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Progress
  getProgress: () => request('/progress'),
  completeLesson: (lessonId) => request(`/progress/lesson/${lessonId}`, { method: 'POST' }),
  saveQuiz: (quizId, score, total) => request('/progress/quiz', { method: 'POST', body: JSON.stringify({ quizId, score, total }) }),
  resetProgress: () => request('/progress/reset', { method: 'POST' }),
  getRecommendations: () => request('/progress/recommendations'),

  // Certificates
  getCertificates: () => request('/certificates'),
  downloadCertificate: (pathId) => request(`/certificates/${pathId}`, { responseType: 'blob' }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'POST' }),

  // Discussions
  getDiscussions: (params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/discussions${qs}`);
  },
  getDiscussion: (id) => request(`/discussions/${id}`),
  createDiscussion: (data) => request('/discussions', { method: 'POST', body: JSON.stringify(data) }),
  postReply: (discussionId, body) => request(`/discussions/${discussionId}/reply`, { method: 'POST', body: JSON.stringify({ body }) }),
  markAnswer: (discussionId, replyId) => request(`/discussions/${discussionId}/reply/${replyId}/answer`, { method: 'PATCH' }),

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
  adminExportUsers: () => `${API_BASE}/admin/reports/users`,
  adminExportOrgs: () => `${API_BASE}/admin/reports/organizations`,
  adminExportProgress: () => `${API_BASE}/admin/reports/progress`,
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

  // Public API key management
  generateApiKey: (data) => request('/public/keys', { method: 'POST', body: JSON.stringify(data) }),
  getApiKeys: (orgId) => request(`/public/keys${orgId ? '?orgId=' + orgId : ''}`),
  revokeApiKey: (id) => request(`/public/keys/${id}`, { method: 'DELETE' }),
  getApiDocs: () => request('/public/docs'),
};
