import { Router } from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { createNotification, awardPoints } from '../services/notifications.js';

const router = Router();

// GET /api/progress — get all progress for current user
router.get('/', authenticate, (req, res) => {
  const lessons = db.prepare('SELECT lesson_id FROM lesson_progress WHERE user_id = ?').all(req.user.id);
  const quizzes = db.prepare(`
    SELECT quiz_id, score, total, passed, completed_at
    FROM quiz_results WHERE user_id = ?
    ORDER BY completed_at DESC
  `).all(req.user.id);

  // For quizzes, keep only the latest attempt per quiz_id
  const quizMap = {};
  for (const q of quizzes) {
    if (!quizMap[q.quiz_id]) {
      quizMap[q.quiz_id] = { score: q.score, total: q.total, passed: !!q.passed, date: q.completed_at };
    }
  }

  // Get attempt counts per quiz for retake policy
  const attemptCounts = {};
  const attempts = db.prepare(`
    SELECT quiz_id, COUNT(*) as attempts, MAX(completed_at) as last_attempt
    FROM quiz_results WHERE user_id = ? GROUP BY quiz_id
  `).all(req.user.id);
  for (const a of attempts) {
    attemptCounts[a.quiz_id] = { attempts: a.attempts, lastAttempt: a.last_attempt };
  }

  // Get quiz policies
  const policies = db.prepare('SELECT * FROM quiz_policies').all();
  const policyMap = {};
  for (const p of policies) {
    policyMap[p.quiz_id] = { maxAttempts: p.max_attempts, cooldownHours: p.cooldown_hours };
  }

  const lessonMap = {};
  for (const l of lessons) {
    lessonMap[l.lesson_id] = true;
  }

  res.json({ lessons: lessonMap, quizzes: quizMap, attemptCounts, quizPolicies: policyMap });
});

// POST /api/progress/lesson/:lessonId — mark lesson complete
router.post('/lesson/:lessonId', authenticate, (req, res) => {
  const { lessonId } = req.params;

  const existing = db.prepare('SELECT 1 FROM lesson_progress WHERE user_id = ? AND lesson_id = ?')
    .get(req.user.id, lessonId);

  db.prepare(`
    INSERT OR IGNORE INTO lesson_progress (user_id, lesson_id) VALUES (?, ?)
  `).run(req.user.id, lessonId);

  // Award points only for first completion
  if (!existing) {
    awardPoints(req.user.id, 'lesson_completed', 10, `Completed lesson: ${lessonId}`);
  }

  updateActivity(req.user.id);

  res.json({ message: 'Lesson marked complete', lessonId });
});

// POST /api/progress/quiz — save quiz result
router.post('/quiz', authenticate, (req, res) => {
  const { quizId, score, total } = req.body;
  if (!quizId || score === undefined || !total) {
    return res.status(400).json({ error: 'quizId, score, and total are required' });
  }

  // Check quiz retake policy
  const policy = db.prepare('SELECT * FROM quiz_policies WHERE quiz_id = ?').get(quizId);
  if (policy) {
    const attemptCount = db.prepare('SELECT COUNT(*) as c FROM quiz_results WHERE user_id = ? AND quiz_id = ?')
      .get(req.user.id, quizId).c;

    if (attemptCount >= policy.max_attempts) {
      return res.status(429).json({
        error: `Maximum ${policy.max_attempts} attempts reached for this quiz. Contact your administrator.`,
      });
    }

    // Check cooldown
    const lastAttempt = db.prepare('SELECT MAX(completed_at) as last FROM quiz_results WHERE user_id = ? AND quiz_id = ?')
      .get(req.user.id, quizId).last;

    if (lastAttempt && policy.cooldown_hours > 0) {
      const cooldownEnd = new Date(new Date(lastAttempt).getTime() + policy.cooldown_hours * 60 * 60 * 1000);
      if (new Date() < cooldownEnd) {
        const hoursLeft = Math.ceil((cooldownEnd - new Date()) / (60 * 60 * 1000));
        return res.status(429).json({
          error: `Please wait ${hoursLeft} hour(s) before retaking this quiz.`,
        });
      }
    }
  }

  const passed = (score / total) >= 0.75 ? 1 : 0;

  db.prepare(`
    INSERT INTO quiz_results (user_id, quiz_id, score, total, passed) VALUES (?, ?, ?, ?, ?)
  `).run(req.user.id, quizId, score, total, passed);

  // Award points
  if (passed) {
    awardPoints(req.user.id, 'quiz_passed', 25, `Passed quiz: ${quizId}`);
    if (score === total) {
      awardPoints(req.user.id, 'quiz_perfect', 50, `Perfect score on: ${quizId}`);
    }
  }

  updateActivity(req.user.id);

  // Check if all quizzes in a course path are passed
  checkPathCompletion(req.user.id);

  res.json({ message: 'Quiz result saved', quizId, score, total, passed: !!passed });
});

// POST /api/progress/reset — reset all progress (dev/testing)
router.post('/reset', authenticate, (req, res) => {
  db.prepare('DELETE FROM lesson_progress WHERE user_id = ?').run(req.user.id);
  db.prepare('DELETE FROM quiz_results WHERE user_id = ?').run(req.user.id);
  db.prepare('DELETE FROM completed_paths WHERE user_id = ?').run(req.user.id);
  db.prepare('DELETE FROM badges WHERE user_id = ?').run(req.user.id);

  res.json({ message: 'Progress reset' });
});

// GET /api/progress/recommendations — learning path recommendations
router.get('/recommendations', authenticate, (req, res) => {
  const completedPaths = db.prepare('SELECT path_id FROM completed_paths WHERE user_id = ?')
    .all(req.user.id).map(p => p.path_id);

  const roleCategory = req.user.role_category;

  const allPaths = [
    { id: 'sales-enablement', name: 'Sales Enablement Bootcamp', category: 'Sales', duration: '2 Days', priority: 1 },
    { id: 'presales-enablement', name: 'Presales & Solution Selling', category: 'Presales', duration: '2 Days', priority: 2 },
    { id: 'technical-enablement', name: 'Technical Enablement Bootcamp', category: 'Technical', duration: '5 Days', priority: 3 },
  ];

  const recommendations = [];

  // 1. Recommend paths matching role category that aren't completed
  const primaryPath = allPaths.find(p => p.category === roleCategory && !completedPaths.includes(p.id));
  if (primaryPath) {
    recommendations.push({ ...primaryPath, reason: `Recommended for your ${roleCategory} role`, priority: 1 });
  }

  // 2. Recommend in-progress paths (started but not completed)
  for (const path of allPaths) {
    if (completedPaths.includes(path.id)) continue;
    if (recommendations.find(r => r.id === path.id)) continue;

    const lessonCount = db.prepare(`
      SELECT COUNT(*) as c FROM lesson_progress WHERE user_id = ? AND lesson_id LIKE ?
    `).get(req.user.id, `${path.id.split('-')[0]}%`).c;

    if (lessonCount > 0) {
      recommendations.push({ ...path, reason: 'Continue where you left off', priority: 2, lessonsCompleted: lessonCount });
    }
  }

  // 3. Recommend remaining uncompleted paths
  for (const path of allPaths) {
    if (completedPaths.includes(path.id)) continue;
    if (recommendations.find(r => r.id === path.id)) continue;
    recommendations.push({ ...path, reason: 'Expand your skills', priority: 3 });
  }

  // 4. If all completed, congratulate
  if (completedPaths.length >= allPaths.length) {
    return res.json({ recommendations: [], allCompleted: true, message: 'Congratulations! You have completed all learning paths.' });
  }

  res.json({ recommendations: recommendations.sort((a, b) => a.priority - b.priority), allCompleted: false });
});

// Helper: update last_active and learning streak
function updateActivity(userId) {
  const user = db.prepare('SELECT last_active, learning_streak FROM users WHERE id = ?').get(userId);
  if (!user) return;

  const today = new Date().toISOString().split('T')[0];
  const lastDate = user.last_active ? user.last_active.split('T')[0] : null;

  let newStreak = user.learning_streak || 0;
  if (lastDate) {
    const diff = (new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      newStreak += 1;
    } else if (diff > 1) {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  db.prepare("UPDATE users SET last_active = datetime('now'), learning_streak = ? WHERE id = ?").run(newStreak, userId);

  // Streak milestones
  if (newStreak === 7) {
    awardPoints(userId, 'streak_7', 30, '7-day learning streak!');
    createNotification({ userId, type: 'achievement', title: 'Streak Milestone!', message: 'You have a 7-day learning streak! Keep it up!', link: '/profile' });
  } else if (newStreak === 30) {
    awardPoints(userId, 'streak_30', 100, '30-day learning streak!');
    createNotification({ userId, type: 'achievement', title: 'Amazing Streak!', message: '30 days of continuous learning! You are a champion!', link: '/profile' });
  }
}

// Helper: check if user completed all quizzes in a course path
function checkPathCompletion(userId) {
  const pathQuizzes = {
    'sales-enablement': ['quiz-sales-m1', 'quiz-sales-m2', 'quiz-sales-m3', 'quiz-sales-m4'],
    'presales-enablement': ['quiz-pre-m1', 'quiz-pre-m2', 'quiz-pre-m3', 'quiz-pre-m4'],
    'technical-enablement': ['quiz-tech-m1', 'quiz-tech-m2', 'quiz-tech-m3', 'quiz-tech-m4', 'quiz-tech-m5'],
  };

  const pathBadges = {
    'sales-enablement': 'Sales Certified',
    'presales-enablement': 'Presales Certified',
    'technical-enablement': 'NCS Associate',
  };

  const courseNames = {
    'sales-enablement': 'Sales Enablement Bootcamp',
    'presales-enablement': 'Presales & Solution Selling',
    'technical-enablement': 'Technical Enablement Bootcamp',
  };

  for (const [pathId, quizIds] of Object.entries(pathQuizzes)) {
    const existing = db.prepare('SELECT 1 FROM completed_paths WHERE user_id = ? AND path_id = ?').get(userId, pathId);
    if (existing) continue;

    let allPassed = true;
    for (const qid of quizIds) {
      const result = db.prepare(`
        SELECT passed FROM quiz_results WHERE user_id = ? AND quiz_id = ? AND passed = 1 LIMIT 1
      `).get(userId, qid);
      if (!result) { allPassed = false; break; }
    }

    if (allPassed) {
      db.prepare('INSERT OR IGNORE INTO completed_paths (user_id, path_id) VALUES (?, ?)').run(userId, pathId);
      const badge = pathBadges[pathId];
      if (badge) {
        db.prepare('INSERT OR IGNORE INTO badges (user_id, badge_name) VALUES (?, ?)').run(userId, badge);
      }

      // Award points and notify
      awardPoints(userId, 'path_completed', 100, `Completed: ${courseNames[pathId]}`);
      createNotification({
        userId, type: 'achievement',
        title: 'Path Completed!',
        message: `Congratulations! You completed ${courseNames[pathId]} and earned the ${badge} certification!`,
        link: '/certification',
      });
    }
  }
}

export default router;
