import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, GraduationCap, Award, Menu, X, LogOut, User, Building2, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isSuperAdmin, isOrgAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/catalog', label: 'Courses', icon: BookOpen },
    { to: '/certification', label: 'Certification', icon: Award },
  ];

  if (isOrgAdmin) {
    navLinks.push({ to: '/org-admin', label: 'My Organization', icon: Building2 });
  }
  if (isSuperAdmin) {
    navLinks.push({ to: '/admin', label: 'Admin Console', icon: Shield });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((n) => n[0]).join('')
    : 'P';

  return (
    <nav className="bg-nobus-950 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-nobus-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold leading-tight">Nobus Cloud</div>
              <div className="text-[10px] text-nobus-300 uppercase tracking-wider leading-tight">Partner Learning Platform</div>
            </div>
            <div className="sm:hidden">
              <div className="text-base font-bold">Nobus LMS</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-nobus-500 text-white'
                      : 'text-nobus-200 hover:bg-nobus-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* User area */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-nobus-800 transition-colors"
            >
              <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center text-sm font-bold">
                {initials}
              </div>
              <div className="text-sm">
                <div className="text-nobus-200 font-medium leading-tight">{currentUser?.name || 'Partner'}</div>
                <div className="text-nobus-400 text-[10px] leading-tight capitalize">
                  {currentUser?.role?.replace('_', ' ') || ''}
                </div>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-nobus-300 hover:bg-nobus-800 hover:text-white transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-nobus-800"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-nobus-800 bg-nobus-900">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    active
                      ? 'bg-nobus-500 text-white'
                      : 'text-nobus-200 hover:bg-nobus-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              );
            })}
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-nobus-200 hover:bg-nobus-800"
            >
              <User className="w-5 h-5" />
              My Profile
            </Link>
            <button
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-nobus-800"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
