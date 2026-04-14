import { Router } from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Points values
const POINTS = {
  lesson_completed: 10,
  quiz_passed: 25,
  quiz_perfect: 50,
  path_completed: 100,
  streak_7: 30,
  streak_30: 100,
  discussion_created: 5,
  reply_posted: 2,
  first_login: 5,
};

// GET /api/gamification/my-stats — get current user's points and rank
router.get('/my-stats', authenticate, (req, res) => {
  const totalPoints = db.prepare('SELECT COALESCE(SUM(points), 0) as total FROM user_points WHERE user_id = ?')
    .get(req.user.id).total;

  const recentPoints = db.prepare(`
    SELECT action, points, description, created_at FROM user_points
    WHERE user_id = ? ORDER BY created_at DESC LIMIT 20
  `).all(req.user.id);

  // Global rank
  const rank = db.prepare(`
    SELECT COUNT(*) + 1 as rank FROM (
      SELECT user_id, SUM(points) as total FROM user_points GROUP BY user_id
      HAVING total > (SELECT COALESCE(SUM(points), 0) FROM user_points WHERE user_id = ?)
    )
  `).get(req.user.id).rank;

  // Level calculation (every 200 points = 1 level)
  const level = Math.floor(totalPoints / 200) + 1;
  const nextLevelPoints = level * 200;
  const levelProgress = ((totalPoints % 200) / 200) * 100;

  res.json({ totalPoints, level, nextLevelPoints, levelProgress: Math.round(levelProgress), rank, recentPoints });
});

// GET /api/gamification/leaderboard — global leaderboard
router.get('/leaderboard', authenticate, (req, res) => {
  const { scope = 'global', orgId } = req.query;

  let leaderboard;
  if (scope === 'org' && (orgId || req.user.org_id)) {
    const targetOrg = orgId || req.user.org_id;
    leaderboard = db.prepare(`
      SELECT u.id, u.name, u.role_category, COALESCE(SUM(up.points), 0) as total_points,
        (SELECT COUNT(*) FROM completed_paths WHERE user_id = u.id) as paths_completed,
        (SELECT COUNT(*) FROM badges WHERE user_id = u.id) as badge_count
      FROM users u LEFT JOIN user_points up ON u.id = up.user_id
      WHERE u.org_id = ? AND u.status = 'active'
      GROUP BY u.id ORDER BY total_points DESC LIMIT 50
    `).all(targetOrg);
  } else {
    leaderboard = db.prepare(`
      SELECT u.id, u.name, u.role_category, o.name as org_name,
        COALESCE(SUM(up.points), 0) as total_points,
        (SELECT COUNT(*) FROM completed_paths WHERE user_id = u.id) as paths_completed,
        (SELECT COUNT(*) FROM badges WHERE user_id = u.id) as badge_count
      FROM users u LEFT JOIN user_points up ON u.id = up.user_id
      LEFT JOIN organizations o ON u.org_id = o.id
      WHERE u.status = 'active' AND u.role != 'super_admin'
      GROUP BY u.id ORDER BY total_points DESC LIMIT 50
    `).all();
  }

  // Add rank numbers
  const ranked = leaderboard.map((entry, i) => ({ ...entry, rank: i + 1 }));
  res.json(ranked);
});

// GET /api/gamification/org-leaderboard — org vs org leaderboard
router.get('/org-leaderboard', authenticate, (req, res) => {
  const orgBoard = db.prepare(`
    SELECT o.id, o.name, o.tier,
      COALESCE(SUM(up.points), 0) as total_points,
      (SELECT COUNT(*) FROM users WHERE org_id = o.id AND status = 'active') as member_count,
      (SELECT COUNT(*) FROM completed_paths cp JOIN users u ON cp.user_id = u.id WHERE u.org_id = o.id) as total_completions
    FROM organizations o
    LEFT JOIN users u ON u.org_id = o.id
    LEFT JOIN user_points up ON up.user_id = u.id
    GROUP BY o.id ORDER BY total_points DESC LIMIT 20
  `).all();

  res.json(orgBoard.map((entry, i) => ({ ...entry, rank: i + 1 })));
});

export { POINTS };
export default router;
