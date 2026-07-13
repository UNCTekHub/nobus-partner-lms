import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, ExternalLink, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { currentUser, logout, isSuperAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((n) => n[0]).join('')
    : 'P';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 print:hidden">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:block text-sm text-gray-400">
            Nobus Cloud Services · Partner Portal
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isSuperAdmin && (
            <Link to="/ncs-console"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors">
              <Shield className="w-3.5 h-3.5" /> Ops Console
            </Link>
          )}
          <a href="https://dashboard.nobus.io" target="_blank" rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> Cloud Console
          </a>
          <NotificationBell />
          <Link to="/profile"
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-8 h-8 bg-nobus-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {initials}
            </div>
            <div className="hidden md:block text-sm text-left">
              <div className="text-gray-800 font-medium leading-tight">{currentUser?.name || 'Partner'}</div>
              <div className="text-gray-400 text-[10px] leading-tight capitalize">
                {currentUser?.role_category || currentUser?.role?.replace('_', ' ') || ''}
              </div>
            </div>
          </Link>
          <button onClick={handleLogout}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
