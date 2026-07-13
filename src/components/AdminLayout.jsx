import { Navigate, useNavigate } from 'react-router-dom';
import { Shield, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

// Dedicated layout for the Nobus operations console. Reached only via the
// unlisted /ncs-console route; anyone without the super_admin role is
// silently bounced to the partner dashboard as if the route didn't exist.
export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const { currentUser, logout, isSuperAdmin } = useAuth();

  if (!isSuperAdmin) return <Navigate to="/" replace />;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gray-900 text-white border-b-4 border-accent-500 sticky top-0 z-40">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">NCS Operations Console</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider leading-tight">Nobus internal · restricted</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Partner Portal
            </button>
            <NotificationBell />
            <div className="text-sm text-gray-300 hidden md:block">{currentUser?.name}</div>
            <button onClick={handleLogout}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
