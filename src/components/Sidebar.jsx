import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Award, Trophy, MessageSquare, Compass, ShieldCheck, Calculator, Megaphone, Library, FlaskConical, Building2, X, TrendingUp, LifeBuoy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tierColor } from '../data/tiers';

// Grouped navigation - the information architecture of the partner portal.
export const NAV_GROUPS = [
  {
    title: null,
    links: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Enablement',
    links: [
      { to: '/catalog', label: 'Training Academy', icon: BookOpen },
      { to: '/certification', label: 'Certifications', icon: Award },
      { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
      { to: '/discussions', label: 'Community Forum', icon: MessageSquare },
    ],
  },
  {
    title: 'Sales',
    links: [
      { to: '/sales-navigator', label: 'Sales Navigator', icon: Compass },
      { to: '/deals', label: 'Deal Registration', icon: ShieldCheck },
      { to: '/quotes', label: 'Quote Builder', icon: Calculator },
    ],
  },
  {
    title: 'Growth & Support',
    links: [
      { to: '/growth', label: 'Growth & Rewards', icon: TrendingUp },
      { to: '/support', label: 'Support', icon: LifeBuoy },
    ],
  },
  {
    title: 'Resources',
    links: [
      { to: '/marketing', label: 'Marketing Materials', icon: Megaphone },
      { to: '/content-hub', label: 'Content Hub', icon: Library },
      { to: '/demo-labs', label: 'Demo Labs', icon: FlaskConical },
    ],
  },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const location = useLocation();
  const { organization, isOrgAdmin } = useAuth();

  const groups = [...NAV_GROUPS];
  if (isOrgAdmin) {
    groups.push({
      title: 'Organization',
      links: [{ to: '/org-admin', label: 'My Organization', icon: Building2 }],
    });
  }

  const nav = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4 border-b border-nobus-800/60">
        <Link to="/" className="block" onClick={onClose}>
          <img src="/nobus-logo.png" alt="Nobus Cloud Services" className="h-9 w-auto" />
          <div className="text-sm text-white tracking-[0.14em] mt-1.5 font-extrabold uppercase">
            PartnerCentral
          </div>
        </Link>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {groups.map((group, gi) => (
          <div key={group.title || gi}>
            {group.title && (
              <div className="px-3 mb-1.5 text-[10px] font-bold text-nobus-400 uppercase tracking-[0.15em]">
                {group.title}
              </div>
            )}
            <div className="space-y-0.5">
              {group.links.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link key={to} to={to} onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-nobus-500 text-white shadow-sm'
                        : 'text-nobus-200 hover:bg-nobus-800/70 hover:text-white'
                    }`}>
                    <Icon className={`w-[18px] h-[18px] ${active ? '' : 'text-nobus-400'}`} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Partner tier footer */}
      {organization && (
        <div className="px-5 py-4 border-t border-nobus-800/60">
          <div className="text-xs text-nobus-400 uppercase tracking-wider mb-0.5">Partner Tier</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tierColor(organization.tier || 'Registered') }} />
            <span className="text-sm font-bold" style={{ color: tierColor(organization.tier || 'Registered') }}>{organization.tier || 'Registered'}</span>
          </div>
          <div className="text-xs text-nobus-300 truncate mt-0.5">{organization.name}</div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-nobus-950 min-h-screen sticky top-0 max-h-screen print:hidden">
        {nav}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-nobus-950 shadow-2xl flex flex-col">
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-nobus-300 hover:bg-nobus-800">
              <X className="w-5 h-5" />
            </button>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
