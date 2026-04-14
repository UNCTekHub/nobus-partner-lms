import { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Building2, Loader2, Users } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard() {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState('global');
  const [leaderboard, setLeaderboard] = useState([]);
  const [orgBoard, setOrgBoard] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [tab]);

  async function loadData() {
    setLoading(true);
    try {
      const [stats] = await Promise.all([api.getMyStats()]);
      setMyStats(stats);
      if (tab === 'organizations') {
        setOrgBoard(await api.getOrgLeaderboard());
      } else {
        setLeaderboard(await api.getLeaderboard(tab === 'team' ? 'org' : 'global'));
      }
    } catch {} finally { setLoading(false); }
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">{rank}</span>;
  };

  const tabs = [
    { id: 'global', label: 'Global' },
    { id: 'team', label: 'My Team' },
    { id: 'organizations', label: 'Organizations' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-500 text-sm mt-1">See who's leading the learning journey</p>
        </div>
      </div>

      {myStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 text-center">
            <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-900">{myStats.totalPoints}</div>
            <div className="text-xs text-gray-500">Total Points</div>
          </div>
          <div className="card p-4 text-center">
            <Trophy className="w-5 h-5 text-nobus-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-900">Level {myStats.level}</div>
            <div className="text-xs text-gray-500">{myStats.nextLevelPoints - myStats.totalPoints} pts to next</div>
          </div>
          <div className="card p-4 text-center">
            <Medal className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-900">#{myStats.rank}</div>
            <div className="text-xs text-gray-500">Global Rank</div>
          </div>
          <div className="card p-4 text-center">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2 mt-2">
              <div className="bg-nobus-500 h-2 rounded-full" style={{ width: `${myStats.levelProgress}%` }}></div>
            </div>
            <div className="text-xs text-gray-500">{myStats.levelProgress}% to Level {myStats.level + 1}</div>
          </div>
        </div>
      )}

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-nobus-500 text-nobus-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-nobus-500" /></div>
      ) : tab === 'organizations' ? (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Rank</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Organization</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Tier</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Members</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Completions</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orgBoard.map((org) => (
                <tr key={org.id} className={`hover:bg-gray-50 ${org.id === currentUser?.org_id ? 'bg-nobus-50' : ''}`}>
                  <td className="px-6 py-4">{getRankIcon(org.rank)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{org.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{org.tier}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{org.member_count}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{org.total_completions}</td>
                  <td className="px-6 py-4 font-bold text-nobus-600">{org.total_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Rank</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Learner</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Paths</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Badges</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leaderboard.map((entry) => (
                <tr key={entry.id} className={`hover:bg-gray-50 ${entry.id === currentUser?.id ? 'bg-nobus-50' : ''}`}>
                  <td className="px-6 py-4">{getRankIcon(entry.rank)}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{entry.name}</div>
                    {entry.org_name && <div className="text-xs text-gray-500">{entry.org_name}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{entry.role_category || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{entry.paths_completed}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{entry.badge_count}</td>
                  <td className="px-6 py-4 font-bold text-nobus-600">{entry.total_points}</td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">No data yet. Start learning to earn points!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
