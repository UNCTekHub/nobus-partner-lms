import { Link } from 'react-router-dom';
import {
  User, Mail, Building2, BookOpen, Award, Calendar,
  Flame, CheckCircle, Shield, TrendingUp, BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';

export default function UserProfile() {
  const { currentUser, organization, isSuperAdmin } = useAuth();
  const { getCourseProgress } = useProgress();

  if (!currentUser) return null;

  const salesProg = getCourseProgress('sales-enablement');
  const presalesProg = getCourseProgress('presales-enablement');
  const techProg = getCourseProgress('technical-enablement');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Profile Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 bg-nobus-100 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-nobus-700">
              {currentUser.name.split(' ').map((n) => n[0]).join('')}
            </span>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{currentUser.name}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {currentUser.email}</span>
              {organization && (
                <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {organization.name}</span>
              )}
              {currentUser.role_category && (
                <span className={`badge ${
                  currentUser.role_category === 'Sales' ? 'bg-blue-50 text-blue-700' :
                  currentUser.role_category === 'Presales' ? 'bg-purple-50 text-purple-700' :
                  'bg-accent-50 text-accent-700'
                }`}>
                  {currentUser.role_category} Track
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {currentUser.joined_date?.split('T')[0]}</span>
              {currentUser.learning_streak > 0 && (
                <span className="flex items-center gap-1 text-orange-500 font-medium">
                  <Flame className="w-3 h-3" /> {currentUser.learning_streak}-day streak
                </span>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-500 capitalize">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              isSuperAdmin ? 'bg-red-50 text-red-700 border border-red-200' :
              currentUser.role === 'org_admin' ? 'bg-nobus-50 text-nobus-700 border border-nobus-200' :
              'bg-gray-100 text-gray-700 border border-gray-200'
            }`}>
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Learning Progress */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-nobus-600" /> Learning Progress
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Sales Enablement', prog: salesProg, color: 'bg-blue-500' },
              { label: 'Presales Enablement', prog: presalesProg, color: 'bg-purple-500' },
              { label: 'Technical Enablement', prog: techProg, color: 'bg-accent-500' },
            ].map((track) => {
              const pct = track.prog.totalLessons > 0
                ? Math.round((track.prog.completedLessons / track.prog.totalLessons) * 100)
                : 0;
              return (
                <div key={track.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{track.label}</span>
                    <span className="text-gray-500">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className={`h-2 ${track.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{track.prog.completedLessons}/{track.prog.totalLessons} lessons</span>
                    <span>{track.prog.passedQuizzes}/{track.prog.totalQuizzes} quizzes passed</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges & Certifications */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Badges & Certifications
          </h2>
          {currentUser.badges?.length > 0 ? (
            <div className="space-y-3">
              {currentUser.badges.map((badge) => (
                <div key={badge} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Award className="w-6 h-6 text-amber-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{badge}</div>
                    <div className="text-xs text-gray-500">Nobus Cloud Certification</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Award className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No badges earned yet.</p>
              <p className="text-xs mt-1">Complete a learning path to earn your first badge.</p>
            </div>
          )}

          {currentUser.completedPaths?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Completed Paths</h3>
              <div className="space-y-2">
                {currentUser.completedPaths.map((path) => (
                  <div key={path} className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg p-2 border border-green-200">
                    <CheckCircle className="w-4 h-4" />
                    {path.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
