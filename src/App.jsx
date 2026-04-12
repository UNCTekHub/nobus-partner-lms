import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, ROLES } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import CoursePage from './pages/CoursePage';
import ModulePage from './pages/ModulePage';
import LessonPage from './pages/LessonPage';
import QuizPage from './pages/QuizPage';
import Certification from './pages/Certification';
import Login from './pages/Login';
import OrgRegistration from './pages/OrgRegistration';
import OrgAdminDashboard from './pages/OrgAdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import UserProfile from './pages/UserProfile';
import { Loader2 } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-nobus-900 via-nobus-800 to-nobus-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-nobus-400 mx-auto mb-4" />
        <p className="text-nobus-300 text-sm">Loading...</p>
      </div>
    </div>
  );
}

function AuthGate({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <OrgRegistration />} />

      {/* Protected routes inside Layout */}
      <Route
        path="/*"
        element={
          <AuthGate>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/course/:courseId" element={<CoursePage />} />
                <Route path="/course/:courseId/module/:moduleId" element={<ModulePage />} />
                <Route path="/course/:courseId/module/:moduleId/lesson/:lessonId" element={<LessonPage />} />
                <Route path="/course/:courseId/module/:moduleId/quiz" element={<QuizPage />} />
                <Route path="/certification" element={<Certification />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route
                  path="/org-admin"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.ORG_ADMIN]}>
                      <OrgAdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                      <SuperAdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </AuthGate>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ProgressProvider>
    </AuthProvider>
  );
}
