import { Router } from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

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

  const lessonMap = {};
  for (const l of lessons) {
    lessonMap[l.lesson_id] = true;
  }

  res.json({ lessons: lessonMap, quizzes: quizMap });
});

// POST /api/progress/lesson/:lessonId — mark lesson complete
router.post('/lesson/:lessonId', authenticate, (req, res) => {
  const { lessonId } = req.params;

  db.prepare(`
    INSERT OR IGNORE INTO lesson_progress (user_id, lesson_id) VALUES (?, ?)
  `).run(req.user.id, lessonId);

  // Update last_active and streak
  updateActivity(req.user.id);

  res.json({ message: 'Lesson marked complete', lessonId });
});

// POST /api/progress/quiz — save quiz result
router.post('/quiz', authenticate, (req, res) => {
  const { quizId, score, total } = req.body;
  if (!quizId || score === undefined || !total) {
    return res.status(400).json({ error: 'quizId, score, and total are required' });
  }

  const passed = (score / total) >= 0.75 ? 1 : 0;

  db.prepare(`
    INSERT INTO quiz_results (user_id, quiz_id, score, total, passed) VALUES (?, ?, ?, ?, ?)
  `).run(req.user.id, quizId, score, total, passed);

  updateActivity(req.user.id);

  // Check if all quizzes in a course path are passed — auto-award path completion
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
    // diff === 0 means same day, keep streak
  } else {
    newStreak = 1;
  }

  db.prepare('UPDATE users SET last_active = datetime("now"), learning_streak = ? WHERE id = ?').run(newStreak, userId);
}

// Helper: check if user completed all quizzes in a course path
function checkPathCompletion(userId) {
  // Define which quiz IDs belong to each path
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

  for (const [pathId, quizIds] of Object.entries(pathQuizzes)) {
    // Check if already completed
    const existing = db.prepare('SELECT 1 FROM completed_paths WHERE user_id = ? AND path_id = ?').get(userId, pathId);
    if (existing) continue;

    // Check if all quizzes passed
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
    }
  }
}

export default router;
