import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, ROLES } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { I18nProvider } from './lib/i18n.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import CoursePage from './pages/CoursePage';
import ModulePage from './pages/ModulePage';
import LessonPage from './pages/LessonPage';
import QuizPage from './pages/QuizPage';
import Certification from './pages/Certification';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OrgRegistration from './pages/OrgRegistration';
import OrgAdminDashboard from './pages/OrgAdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import UserProfile from './pages/UserProfile';
import Discussions from './pages/Discussions';
import Leaderboard from './pages/Leaderboard';
import Landing from './pages/Landing';
import TermsPage from './pages/TermsPage';
import SalesNavigator from './pages/SalesNavigator';
import DealRegistration from './pages/DealRegistration';
import QuoteBuilder from './pages/QuoteBuilder';
import MarketingHub from './pages/MarketingHub';
import DemoLabs from './pages/DemoLabs';
import ContentHub from './pages/ContentHub';
import PartnerGrowth from './pages/PartnerGrowth';
import Support from './pages/Support';
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
  const { isAuthenticated, isSuperAdmin, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  // Nobus staff land on the operations console; partners land on the dashboard
  const home = isSuperAdmin ? '/ncs-console' : '/';

  return (
    <Routes>
      {/* Public routes */}
      {!isAuthenticated && <Route path="/" element={<Landing />} />}
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={home} replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={home} replace /> : <OrgRegistration />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to={home} replace /> : <ForgotPassword />} />
      <Route path="/reset-password" element={isAuthenticated ? <Navigate to={home} replace /> : <ResetPassword />} />

      {/* Nobus operations console - unlisted, super_admin only, own layout */}
      <Route
        path="/ncs-console"
        element={
          <AuthGate>
            <AdminLayout>
              <SuperAdminDashboard />
            </AdminLayout>
          </AuthGate>
        }
      />

      {/* Partner portal inside the main layout */}
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
                <Route path="/sales-navigator" element={<SalesNavigator />} />
                <Route path="/deals" element={<DealRegistration />} />
                <Route path="/quotes" element={<QuoteBuilder />} />
                <Route path="/growth" element={<PartnerGrowth />} />
                <Route path="/support" element={<Support />} />
                <Route path="/marketing" element={<MarketingHub />} />
                <Route path="/demo-labs" element={<DemoLabs />} />
                <Route path="/content-hub" element={<ContentHub />} />
                <Route path="/discussions" element={<Discussions />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route
                  path="/org-admin"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.ORG_ADMIN, ROLES.TEAM_MANAGER]}>
                      <OrgAdminDashboard />
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
    <I18nProvider>
      <AuthProvider>
        <ProgressProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ProgressProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
