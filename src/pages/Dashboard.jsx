import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Server, BookOpen, Award, ArrowRight, Lightbulb, ShieldCheck, Compass,
  Calculator, Megaphone, FlaskConical, Wallet, Target, Star, Gift, Clock, ChevronRight,
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import { api } from '../lib/api';
import salesCourse from '../data/salesCourse';
import technicalCourse from '../data/technicalCourse';
import presalesCourse from '../data/presalesCourse';

const naira = (n) => '₦' + Math.round(Number(n) || 0).toLocaleString('en-NG');

const TRACKS = [
  { course: salesCourse, icon: TrendingUp },
  { course: presalesCourse, icon: Lightbulb },
  { course: technicalCourse, icon: Server },
];

const QUICK_ACTIONS = [
  { to: '/deals', label: 'Register a Deal', desc: 'active protection', icon: ShieldCheck },
  { to: '/quotes', label: 'Build a Quote', desc: 'Naira pricing engine', icon: Calculator },
  { to: '/sales-navigator', label: 'Track Pipeline', desc: 'Kanban & forecast', icon: Compass },
  { to: '/demo-labs', label: 'Book a Demo Lab', desc: 'Hands-on sandbox', icon: FlaskConical },
  { to: '/marketing', label: 'Get Collateral', desc: 'Campaign-ready assets', icon: Megaphone },
];

const STAGE_LABELS = { lead: 'Lead', qualified: 'Qualified', proposal: 'Proposal', won: 'Won', lost: 'Lost' };
const DEAL_BADGES = {
  pending: 'badge-amber',
  approved: 'badge-green',
  rejected: 'badge bg-red-50 text-red-700',
  expired: 'badge bg-gray-100 text-gray-600',
  won: 'badge-green',
  lost: 'badge bg-gray-100 text-gray-600',
};

export default function Dashboard() {
  const { getCourseProgress } = useProgress();
  const { currentUser, organization } = useAuth();
  const [forecast, setForecast] = useState(null);
  const [deals, setDeals] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getForecast().then(setForecast).catch(() => {});
    api.getDeals().then(setDeals).catch(() => {});
    api.getQuotes().then(setQuotes).catch(() => {});
    api.getLabBookings().then(setBookings).catch(() => {});
    api.getMyStats().then(setStats).catch(() => {});
  }, []);

  const progress = TRACKS.map(({ course }) => getCourseProgress(course.id));
  const totalLessons = progress.reduce((s, p) => s + p.totalLessons, 0);
  const totalCompleted = progress.reduce((s, p) => s + p.completedLessons, 0);
  const trainingPct = totalLessons ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  const protectedDeals = deals.filter((d) => d.status === 'approved');
  const pendingDeals = deals.filter((d) => d.status === 'pending');
  const upcomingLabs = bookings.filter((b) => b.status === 'booked');
  const firstName = currentUser?.name?.split(' ')[0] || 'Partner';

  const kpis = [
    { label: 'Open Pipeline', value: forecast ? naira(forecast.openPipeline) : '-', sub: 'Lead → Proposal', icon: Wallet, to: '/sales-navigator' },
    { label: 'Weighted Forecast', value: forecast ? naira(Math.round(forecast.weightedForecast)) : '-', sub: 'probability adjusted', icon: Target, to: '/sales-navigator' },
    { label: 'Protected Deals', value: protectedDeals.length, sub: pendingDeals.length ? `${pendingDeals.length} pending review` : 'registered & approved', icon: ShieldCheck, to: '/deals' },
    { label: 'Active Quotes', value: quotes.length, sub: quotes.length ? naira(quotes.reduce((s, q) => s + (q.monthly_total || 0), 0)) + '/mo quoted' : 'build your first', icon: Calculator, to: '/quotes' },
    { label: 'Team Enablement', value: `${trainingPct}%`, sub: `${totalCompleted}/${totalLessons} lessons`, icon: BookOpen, to: '/catalog' },
  ];

  return (
    <div>
      {/* Hero band */}
      <div className="bg-nobus-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-nobus-300 text-sm mb-1">
                {organization?.name || 'Nobus Cloud Partner'}
                {organization?.partner_id ? ` · ${organization.partner_id}` : ''}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                Welcome back, {firstName}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {stats && (
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold justify-end">
                    <Star className="w-4 h-4" /> {stats.totalPoints} pts
                  </div>
                  <div className="text-xs text-nobus-300">Level {stats.level} · #{stats.rank} in your team</div>
                </div>
              )}
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-[10px] uppercase tracking-wider text-nobus-300">Tier</div>
                <div className="font-bold">{organization?.tier || 'Registered'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8 -mt-14">
          {kpis.map((kpi) => (
            <Link key={kpi.label} to={kpi.to} className="card p-4 hover:border-nobus-300 border border-transparent">
              <div className="flex items-center justify-between mb-1.5">
                <kpi.icon className="w-5 h-5 text-nobus-500" />
              </div>
              <div className="text-xl font-bold text-gray-900 truncate">{kpi.value}</div>
              <div className="text-xs font-medium text-gray-600">{kpi.label}</div>
              <div className="text-[11px] text-gray-400 truncate">{kpi.sub}</div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.to} to={a.to}
              className="group flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-nobus-400 hover:shadow-sm transition-all">
              <div className="w-9 h-9 bg-nobus-50 rounded-lg flex items-center justify-center group-hover:bg-nobus-500 transition-colors shrink-0">
                <a.icon className="w-5 h-5 text-nobus-500 group-hover:text-white transition-colors" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{a.label}</div>
                <div className="text-[11px] text-gray-400 truncate">{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Pipeline snapshot */}
          <div className="card p-5 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Pipeline Snapshot</h2>
              <Link to="/sales-navigator" className="text-xs font-medium text-nobus-600 hover:underline flex items-center">
                Open <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {forecast ? (
              <div className="space-y-3">
                {Object.entries(STAGE_LABELS).map(([stage, label]) => {
                  const s = forecast.byStage[stage];
                  const max = Math.max(...Object.values(forecast.byStage).map((x) => x.total), 1);
                  return (
                    <div key={stage}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-gray-600">{label} ({s.count})</span>
                        <span className="text-gray-400">{naira(s.total)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${stage === 'won' ? 'bg-green-500' : stage === 'lost' ? 'bg-gray-300' : 'bg-nobus-500'}`}
                          style={{ width: `${Math.max((s.total / max) * 100, s.count ? 4 : 0)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-400 py-6 text-center">Add leads in the Sales Navigator to see your pipeline.</div>
            )}
          </div>

          {/* Recent deals */}
          <div className="card p-5 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Deal Registrations</h2>
              <Link to="/deals" className="text-xs font-medium text-nobus-600 hover:underline flex items-center">
                All deals <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {deals.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{d.opportunity_name}</div>
                    <div className="text-xs text-gray-400 truncate">{d.customer_name} · {naira(d.est_value)}</div>
                  </div>
                  <span className={DEAL_BADGES[d.status] || 'badge-blue'}>{d.status}</span>
                </div>
              ))}
              {deals.length === 0 && (
                <div className="text-sm text-gray-400 py-6 text-center">
                  No registered deals yet. <Link to="/deals" className="text-nobus-600 hover:underline">Protect your first opportunity</Link>.
                </div>
              )}
            </div>
          </div>

          {/* Right rail: labs + program benefit */}
          <div className="space-y-6 lg:col-span-1">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-900">Upcoming Lab Sessions</h2>
                <Link to="/demo-labs" className="text-xs font-medium text-nobus-600 hover:underline flex items-center">
                  Book <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {upcomingLabs.length > 0 ? (
                <div className="space-y-2">
                  {upcomingLabs.slice(0, 3).map((b) => (
                    <div key={b.id} className="flex items-center gap-2.5 text-sm">
                      <Clock className="w-4 h-4 text-nobus-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-gray-800 truncate">{b.lab_title}</div>
                        <div className="text-xs text-gray-400">{b.scheduled_date} · {b.time_slot}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No sessions booked. Run a guided demo for your next customer meeting.</p>
              )}
            </div>

            <div className="card p-5 bg-nobus-950 !border-nobus-900 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-accent-300" />
                <h2 className="font-bold">Partner Benefit</h2>
              </div>
              <p className="text-sm text-nobus-200 leading-relaxed mb-3">
                Enjoy <strong className="text-white">exclusive partner pricing</strong> on compute and storage for every
                registered deal you close, per the Partner Agreement - plus your own managed-services fees on top.
              </p>
              <Link to="/deals" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-300 hover:text-accent-200">
                Register a deal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Enablement tracks */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Team Enablement</h2>
          <Link to="/certification" className="text-sm font-medium text-nobus-600 hover:underline flex items-center gap-1">
            <Award className="w-4 h-4" /> Certification path
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TRACKS.map(({ course, icon: Icon }, i) => {
            const prog = progress[i];
            return (
              <Link key={course.id} to={`/course/${course.id}`} className="card p-5 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-nobus-50 rounded-lg flex items-center justify-center group-hover:bg-nobus-500 transition-colors">
                    <Icon className="w-5 h-5 text-nobus-500 group-hover:text-white transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate">{course.title}</div>
                    <div className="text-xs text-gray-400">{course.duration}</div>
                  </div>
                </div>
                <ProgressBar value={prog.completedLessons} max={prog.totalLessons} color="nobus" />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500">
                    {prog.completedLessons}/{prog.totalLessons} lessons · {prog.passedQuizzes}/{prog.totalQuizzes} quizzes
                  </span>
                  <span className="text-nobus-600 text-xs font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Continue <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
