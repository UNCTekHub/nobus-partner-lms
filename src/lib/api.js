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
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  const data = await res.json();

  if (res.status === 401 && !endpoint.includes('/auth/login')) {
    // Token expired or invalid — clear and redirect (but not during login)
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

  // Organizations
  getOrganizations: () => request('/organizations'),
  getMyOrg: () => request('/organizations/mine'),
  getPendingOrgs: () => request('/organizations/pending'),
  approveOrg: (id) => request(`/organizations/approve/${id}`, { method: 'POST' }),
  rejectOrg: (id) => request(`/organizations/reject/${id}`, { method: 'POST' }),

  // Users
  getOrgUsers: () => request('/users/org'),
  getAllUsers: () => request('/users/all'),
  inviteUser: (data) => request('/users/invite', { method: 'POST', body: JSON.stringify(data) }),
  updateUserStatus: (id, status) => request(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getProfile: () => request('/users/profile'),

  // Progress
  getProgress: () => request('/progress'),
  completeLesson: (lessonId) => request(`/progress/lesson/${lessonId}`, { method: 'POST' }),
  saveQuiz: (quizId, score, total) => request('/progress/quiz', { method: 'POST', body: JSON.stringify({ quizId, score, total }) }),
  resetProgress: () => request('/progress/reset', { method: 'POST' }),
};
