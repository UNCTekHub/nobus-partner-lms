import { useParams, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Circle, Lock, BookOpen, FileQuestion } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import ProgressBar from '../components/ProgressBar';
import salesCourse from '../data/salesCourse';
import technicalCourse from '../data/technicalCourse';
import presalesCourse from '../data/presalesCourse';

const courseMap = {
  'sales-enablement': salesCourse,
  'technical-enablement': technicalCourse,
  'presales-enablement': presalesCourse,
};

export default function CoursePage() {
  const { courseId } = useParams();
  const course = courseMap[courseId] || salesCourse;
  const accent = courseId === 'technical-enablement' ? 'accent' : 'nobus';
  const { getCourseProgress, isLessonComplete, getQuizResult, getModuleProgress } = useProgress();
  const prog = getCourseProgress(courseId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link to="/catalog" className="text-sm text-nobus-600 hover:underline mb-2 inline-block">&larr; All Courses</Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-4">{course.description}</p>
        <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
          <span>{course.duration}</span>
          <span>{course.modules.length} modules</span>
          <span>{prog.totalLessons} lessons</span>
        </div>
        <ProgressBar value={prog.completedLessons} max={prog.totalLessons} color={accent} size="lg" />
      </div>

      <div className="space-y-4">
        {course.modules.map((mod, i) => {
          const modProg = getModuleProgress(mod.id, course);
          const quizResult = mod.quiz ? getQuizResult(mod.quiz.id) : null;
          const allLessonsDone = modProg.completed === modProg.total;

          return (
            <div key={mod.id} className="card overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      allLessonsDone
                        ? 'bg-green-100 text-green-700'
                        : accent === 'nobus'
                          ? 'bg-nobus-50 text-nobus-600'
                          : 'bg-accent-50 text-accent-600'
                    }`}>
                      {allLessonsDone ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{mod.title}</h3>
                      {mod.time && (
                        <span className="text-xs text-gray-500">{mod.time}{mod.day ? ` · Day ${mod.day}` : ''}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{modProg.completed}/{modProg.total}</span>
                </div>

                <ProgressBar
                  value={modProg.completed}
                  max={modProg.total}
                  size="sm"
                  showLabel={false}
                  color={allLessonsDone ? 'green' : accent}
                />

                <div className="mt-4 space-y-1">
                  {mod.lessons.map((lesson) => {
                    const done = isLessonComplete(lesson.id);
                    return (
                      <Link
                        key={lesson.id}
                        to={`/course/${courseId}/module/${mod.id}/lesson/${lesson.id}`}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        {done ? (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={`text-sm flex-1 ${done ? 'text-gray-500' : 'text-gray-700'}`}>
                          {lesson.title}
                        </span>
                        <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </Link>
                    );
                  })}

                  {mod.quiz && (
                    <Link
                      to={`/course/${courseId}/module/${mod.id}/quiz`}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group mt-2 border-t border-gray-100 pt-3"
                    >
                      <FileQuestion className={`w-4 h-4 flex-shrink-0 ${
                        quizResult?.passed ? 'text-green-500' : 'text-amber-500'
                      }`} />
                      <span className="text-sm flex-1 font-medium text-gray-700">
                        {mod.quiz.title}
                      </span>
                      {quizResult ? (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          quizResult.passed ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {quizResult.score}/{quizResult.total} {quizResult.passed ? 'Passed' : 'Retry'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Not attempted</span>
                      )}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
