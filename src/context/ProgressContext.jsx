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

  // Submit answers to the server, which grades authoritatively and returns the result
  const submitQuiz = useCallback(async (quizId, answers) => {
    const res = await api.saveQuiz(quizId, answers);
    setProgress((prev) => ({
      ...prev,
      quizzes: {
        ...prev.quizzes,
        [quizId]: { score: res.score, total: res.total, passed: res.passed, date: new Date().toISOString() },
      },
    }));
    return res; // { score, total, passed, correctAnswers }
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

  // A session/module is complete when every lesson is done AND its quiz (if any) is passed.
  const isModuleComplete = useCallback((mod) => {
    if (!mod) return false;
    const lessonsDone = mod.lessons.every((l) => !!progress.lessons?.[l.id]);
    const quizDone = !mod.quiz || !!progress.quizzes?.[mod.quiz.id]?.passed;
    return lessonsDone && quizDone;
  }, [progress]);

  // Progressive unlock: a module opens only once the PREVIOUS module is complete.
  // The first module is always open. (Completing a module implies the whole
  // chain before it, so checking the immediate predecessor is sufficient.)
  const isModuleUnlocked = useCallback((course, moduleId) => {
    if (!course) return false;
    const idx = course.modules.findIndex((m) => m.id === moduleId);
    if (idx <= 0) return true;
    return isModuleComplete(course.modules[idx - 1]);
  }, [isModuleComplete]);

  // A module's quiz opens once all its lessons are complete (and the module is open).
  const isQuizUnlocked = useCallback((course, moduleId) => {
    const mod = course?.modules.find((m) => m.id === moduleId);
    if (!mod?.quiz) return false;
    if (!isModuleUnlocked(course, moduleId)) return false;
    return mod.lessons.every((l) => !!progress.lessons?.[l.id]);
  }, [progress, isModuleUnlocked]);

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
        submitQuiz,
        isLessonComplete,
        getQuizResult,
        getCourseProgress,
        getModuleProgress,
        isModuleComplete,
        isModuleUnlocked,
        isQuizUnlocked,
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
