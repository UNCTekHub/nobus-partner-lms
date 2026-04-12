import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setToken } from '../lib/api';

const AuthContext = createContext();

const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORG_ADMIN: 'org_admin',
  USER: 'user',
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for existing token and restore session
  useEffect(() => {
    const token = localStorage.getItem('nobus-lms-token');
    if (token) {
      api.getMe()
        .then(({ user, organization: org }) => {
          setCurrentUser(user);
          setOrganization(org);
        })
        .catch(() => {
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const data = await api.login(email, password);
      setToken(data.token);
      setCurrentUser(data.user);
      setOrganization(data.organization);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
    setOrganization(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.getMe();
      setCurrentUser(data.user);
      setOrganization(data.organization);
    } catch {
      // ignore
    }
  }, []);

  const isSuperAdmin = currentUser?.role === ROLES.SUPER_ADMIN;
  const isOrgAdmin = currentUser?.role === ROLES.ORG_ADMIN;
  const isUser = currentUser?.role === ROLES.USER;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        organization,
        login,
        logout,
        refreshUser,
        isSuperAdmin,
        isOrgAdmin,
        isUser,
        isAuthenticated: !!currentUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { ROLES };
