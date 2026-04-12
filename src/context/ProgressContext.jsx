import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import salesCourse from '../data/salesCourse';
import technicalCourse from '../data/technicalCourse';
import presalesCourse from '../data/presalesCourse';

const ProgressContext = createContext();

const allCourses = {
  'sales-enablement': salesCourse,
  'technical-enablement': technicalCourse,
  'presales-enablement': presalesCourse,
};

export function ProgressProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [progress, setProgress] = useState({ lessons: {}, quizzes: {} });
  const [loaded, setLoaded] = useState(false);

  // Load progress from server when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      api.getProgress()
        .then((data) => {
          setProgress(data);
          setLoaded(true);
        })
        .catch(() => setLoaded(true));
    } else {
      setProgress({ lessons: {}, quizzes: {} });
      setLoaded(false);
    }
  }, [isAuthenticated]);

  const markLessonComplete = useCallback(async (lessonId) => {
    // Optimistic update
    setProgress((prev) => ({
      ...prev,
      lessons: { ...prev.lessons, [lessonId]: true },
    }));

    try {
      await api.completeLesson(lessonId);
    } catch {
      // Revert on failure
      setProgress((prev) => {
        const copy = { ...prev.lessons };
        delete copy[lessonId];
        return { ...prev, lessons: copy };
      });
    }
  }, []);

  const saveQuizScore = useCallback(async (quizId, score, total) => {
    const passed = score / total >= 0.75;
    // Optimistic update
    setProgress((prev) => ({
      ...prev,
      quizzes: {
        ...prev.quizzes,
        [quizId]: { score, total, passed, date: new Date().toISOString() },
      },
    }));

    try {
      await api.saveQuiz(quizId, score, total);
    } catch {
      // Keep the optimistic state — quiz was attempted
    }
  }, []);

  const isLessonComplete = useCallback((lessonId) => {
    return !!progress.lessons?.[lessonId];
  }, [progress]);

  const getQuizResult = useCallback((quizId) => {
    return progress.quizzes?.[quizId] || null;
  }, [progress]);

  const getCourseProgress = useCallback((courseId) => {
    const course = allCourses[courseId];
    if (!course) return { totalLessons: 0, completedLessons: 0, totalQuizzes: 0, passedQuizzes: 0 };

    let totalLessons = 0;
    let completedLessons = 0;
    let totalQuizzes = 0;
    let passedQuizzes = 0;

    course.modules.forEach((mod) => {
      mod.lessons.forEach((lesson) => {
        totalLessons++;
        if (progress.lessons?.[lesson.id]) completedLessons++;
      });
      if (mod.quiz) {
        totalQuizzes++;
        const result = progress.quizzes?.[mod.quiz.id];
        if (result?.passed) passedQuizzes++;
      }
    });

    return { totalLessons, completedLessons, totalQuizzes, passedQuizzes };
  }, [progress]);

  const getModuleProgress = useCallback((moduleId, course) => {
    const mod = course.modules.find((m) => m.id === moduleId);
    if (!mod) return { total: 0, completed: 0 };
    const total = mod.lessons.length;
    const completed = mod.lessons.filter((l) => progress.lessons?.[l.id]).length;
    return { total, completed };
  }, [progress]);

  const resetProgress = useCallback(async () => {
    setProgress({ lessons: {}, quizzes: {} });
    try {
      await api.resetProgress();
    } catch {
      // ignore
    }
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        loaded,
        markLessonComplete,
        saveQuizScore,
        isLessonComplete,
        getQuizResult,
        getCourseProgress,
        getModuleProgress,
        resetProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
