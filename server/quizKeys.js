// Authoritative quiz answer keys. These live ONLY on the server so quiz
// grading cannot be forged from the client and answers are never shipped
// in the frontend bundle. Values are the correct option index per question.
// NOTE: kept at the server root (not under data/, which is gitignored).
export const QUIZ_KEYS = {
  'quiz-sales-m1': [1, 2, 2, 2, 1, 2, 2, 3],
  'quiz-sales-m2': [1, 1, 2, 1],
  'quiz-sales-m3': [3, 1, 2, 2],
  'quiz-sales-m4': [1, 1, 1, 1],
  'quiz-sales-m5': [2, 1, 1, 2],
  'quiz-sales-m6': [1, 1, 1, 2],
  'quiz-pre-m1': [1, 1, 2, 2, 1, 1],
  'quiz-pre-m2': [1, 2],
  'quiz-pre-m3': [2, 2],
  'quiz-pre-m4': [1, 2, 1],
  'quiz-tech-m1': [1, 1, 1],
  'quiz-tech-m2': [1, 0],
  'quiz-tech-m3': [1, 2, 2],
  'quiz-tech-m4': [1, 2],
  'quiz-tech-m5': [1, 2],
  'quiz-tech-m6': [1, 1],
  'quiz-tech-m7': [3, 3],
  'quiz-tech-m8': [1, 1],
  'quiz-tech-m9': [2, 2],
  'quiz-tech-m10': [2, 1],
  'quiz-tech-m11': [2, 3],
  'quiz-tech-m12': [2, 1],
};

// All quiz IDs that make up each certification path. A path is only marked
// complete (and its certificate issued) when every one of these is passed.
export const PATH_QUIZZES = {
  'sales-enablement': ['quiz-sales-m1', 'quiz-sales-m2', 'quiz-sales-m3', 'quiz-sales-m4', 'quiz-sales-m5', 'quiz-sales-m6'],
  'presales-enablement': ['quiz-pre-m1', 'quiz-pre-m2', 'quiz-pre-m3', 'quiz-pre-m4'],
  'technical-enablement': [
    'quiz-tech-m1', 'quiz-tech-m2', 'quiz-tech-m3', 'quiz-tech-m4', 'quiz-tech-m5', 'quiz-tech-m6',
    'quiz-tech-m7', 'quiz-tech-m8', 'quiz-tech-m9', 'quiz-tech-m10', 'quiz-tech-m11', 'quiz-tech-m12',
  ],
};

export const PASS_THRESHOLD = 0.75;
