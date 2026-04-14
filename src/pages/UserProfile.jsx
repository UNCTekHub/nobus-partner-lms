import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Mail, Building2, BookOpen, Award, Calendar,
  Flame, CheckCircle, Shield, TrendingUp, BarChart3,
  Edit3, Save, X, Phone, Briefcase, Globe, Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { api } from '../lib/api';

export default function UserProfile() {
  const { currentUser, organization, isSuperAdmin } = useAuth();
  const { getCourseProgress } = useProgress();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    jobTitle: '',
    bio: '',
    timezone: '',
    language: 'en',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (currentUser) {
      setProfile({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        jobTitle: currentUser.jobTitle || currentUser.job_title || '',
        bio: currentUser.bio || '',
        timezone: currentUser.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: currentUser.language || 'en',
      });
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const salesProg = getCourseProgress('sales-enablement');
  const presalesProg = getCourseProgress('presales-enablement');
  const techProg = getCourseProgress('technical-enablement');

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.updateProfile(profile);
      setMessage('Profile updated successfully');
      setEditing(false);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.changePassword(passwords.currentPassword, passwords.newPassword);
      setMessage('Password changed successfully');
      setChangingPassword(false);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const initials = currentUser.name
    ? currentUser.name.split(' ').map((n) => n[0]).join('')
    : 'P';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Status messages */}
      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Profile Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 bg-nobus-100 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-nobus-700">{initials}</span>
          </div>
          <div className="text-center sm:text-left flex-1">
            {editing ? (
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="text-2xl font-bold text-gray-900 border-b-2 border-nobus-500 outline-none bg-transparent w-full"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900">{currentUser.name}</h1>
            )}
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
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              isSuperAdmin ? 'bg-red-50 text-red-700 border border-red-200' :
              currentUser.role === 'org_admin' ? 'bg-nobus-50 text-nobus-700 border border-nobus-200' :
              'bg-gray-100 text-gray-700 border border-gray-200'
            }`}>
              {currentUser.role.replace('_', ' ')}
            </span>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="text-nobus-600 text-sm hover:underline flex items-center gap-1">
                <Edit3 className="w-3 h-3" /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSaveProfile} disabled={saving}
                  className="btn-primary text-xs px-3 py-1 flex items-center gap-1">
                  <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditing(false)}
                  className="text-gray-500 text-xs hover:text-gray-700 flex items-center gap-1">
                  <X className="w-3 h-3" /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Extended profile fields (edit mode) */}
        {editing && (
          <div className="mt-6 grid sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                <Phone className="w-3 h-3 inline mr-1" />Phone
              </label>
              <input type="tel" value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+234 ..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-nobus-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                <Briefcase className="w-3 h-3 inline mr-1" />Job Title
              </label>
              <input type="text" value={profile.jobTitle}
                onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                placeholder="e.g. Solutions Architect"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-nobus-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                <Globe className="w-3 h-3 inline mr-1" />Timezone
              </label>
              <select value={profile.timezone}
                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-nobus-500">
                <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                <Globe className="w-3 h-3 inline mr-1" />Language
              </label>
              <select value={profile.language}
                onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-nobus-500">
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ha">Hausa</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
              <textarea value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={3} placeholder="Tell us about yourself..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-nobus-500" />
            </div>
          </div>
        )}
      </div>

      {/* Change Password Section */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-500" /> Security
          </h2>
          {!changingPassword && (
            <button onClick={() => setChangingPassword(true)}
              className="text-nobus-600 text-sm hover:underline">
              Change Password
            </button>
          )}
        </div>
        {changingPassword && (
          <div className="space-y-3 max-w-md">
            <input type="password" placeholder="Current password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-nobus-500" />
            <input type="password" placeholder="New password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-nobus-500" />
            <input type="password" placeholder="Confirm new password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-nobus-500" />
            <div className="flex gap-2">
              <button onClick={handleChangePassword} disabled={saving}
                className="btn-primary text-sm px-4 py-2">
                {saving ? 'Changing...' : 'Update Password'}
              </button>
              <button onClick={() => { setChangingPassword(false); setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                className="text-gray-500 text-sm hover:text-gray-700 px-4 py-2">
                Cancel
              </button>
            </div>
          </div>
        )}
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
