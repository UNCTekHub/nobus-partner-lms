import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Circle, FileQuestion } from 'lucide-react';
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

export default function ModulePage() {
  const { courseId, moduleId } = useParams();
  const { isLessonComplete, getQuizResult, getModuleProgress } = useProgress();

  const course = courseMap[courseId] || salesCourse;
  const accent = courseId === 'technical-enablement' ? 'accent' : 'nobus';
  const modIndex = course.modules.findIndex((m) => m.id === moduleId);
  const mod = course.modules[modIndex];
  const prevMod = modIndex > 0 ? course.modules[modIndex - 1] : null;
  const nextMod = modIndex < course.modules.length - 1 ? course.modules[modIndex + 1] : null;

  if (!mod) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Module not found.</p>
        <Link to={`/course/${courseId}`} className="text-nobus-600 hover:underline mt-4 inline-block">Back to course</Link>
      </div>
    );
  }

  const modProg = getModuleProgress(moduleId, course);
  const quizResult = mod.quiz ? getQuizResult(mod.quiz.id) : null;

  // Find first incomplete lesson
  const firstIncomplete = mod.lessons.find((l) => !isLessonComplete(l.id));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to={`/course/${courseId}`} className="text-sm text-nobus-600 hover:underline mb-4 inline-flex items-center gap-1">
        <ArrowLeft className="w-3 h-3" /> {course.title}
      </Link>

      <div className="mb-6">
        <span className={`badge ${accent === 'nobus' ? 'badge-blue' : 'bg-accent-50 text-accent-700'} mb-2`}>
          Module {modIndex + 1} of {course.modules.length}
        </span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{mod.title}</h1>
        {mod.time && <p className="text-sm text-gray-500">{mod.time}{mod.day ? ` · Day ${mod.day}` : ''}</p>}
      </div>

      <div className="mb-6">
        <ProgressBar value={modProg.completed} max={modProg.total} color={accent} size="md" />
      </div>

      {/* Start / Continue button */}
      {firstIncomplete && (
        <Link
          to={`/course/${courseId}/module/${moduleId}/lesson/${firstIncomplete.id}`}
          className="btn-primary inline-flex items-center gap-2 mb-8"
        >
          {modProg.completed > 0 ? 'Continue Learning' : 'Start Module'} <ArrowRight className="w-4 h-4" />
        </Link>
      )}

      {/* Lessons list */}
      <div className="card overflow-hidden mb-6">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Lessons ({mod.lessons.length})</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {mod.lessons.map((lesson, i) => {
            const done = isLessonComplete(lesson.id);
            return (
              <Link
                key={lesson.id}
                to={`/course/${courseId}/module/${moduleId}/lesson/${lesson.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group"
              >
                {done ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${done ? 'text-gray-500' : 'text-gray-900'}`}>
                    {lesson.title}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
              </Link>
            );
          })}
        </div>

        {mod.quiz && (
          <Link
            to={`/course/${courseId}/module/${moduleId}/quiz`}
            className="flex items-center gap-4 p-4 bg-gray-50 border-t border-gray-200 hover:bg-gray-100 transition-colors group"
          >
            <FileQuestion className={`w-5 h-5 flex-shrink-0 ${quizResult?.passed ? 'text-green-500' : 'text-amber-500'}`} />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{mod.quiz.title}</div>
              <div className="text-xs text-gray-500">{mod.quiz.questions.length} questions · 75% to pass</div>
            </div>
            {quizResult ? (
              <span className={`badge ${quizResult.passed ? 'badge-green' : 'badge-amber'}`}>
                {quizResult.score}/{quizResult.total}
              </span>
            ) : (
              <span className="text-xs text-gray-400">Not attempted</span>
            )}
          </Link>
        )}
      </div>

      {/* Module navigation */}
      <div className="flex items-center justify-between">
        {prevMod ? (
          <Link to={`/course/${courseId}/module/${prevMod.id}`} className="btn-secondary text-sm inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Previous Module
          </Link>
        ) : <div />}
        {nextMod ? (
          <Link to={`/course/${courseId}/module/${nextMod.id}`} className="btn-secondary text-sm inline-flex items-center gap-1">
            Next Module <ArrowRight className="w-4 h-4" />
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
