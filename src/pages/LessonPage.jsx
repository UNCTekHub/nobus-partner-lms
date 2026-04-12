import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, BookOpen } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import MarkdownRenderer from '../components/MarkdownRenderer';
import salesCourse from '../data/salesCourse';
import technicalCourse from '../data/technicalCourse';
import presalesCourse from '../data/presalesCourse';

const courseMap = {
  'sales-enablement': salesCourse,
  'technical-enablement': technicalCourse,
  'presales-enablement': presalesCourse,
};

export default function LessonPage() {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { markLessonComplete, isLessonComplete } = useProgress();

  const course = courseMap[courseId] || salesCourse;
  const mod = course.modules.find((m) => m.id === moduleId);
  const lessonIndex = mod?.lessons.findIndex((l) => l.id === lessonId);
  const lesson = mod?.lessons[lessonIndex];

  if (!mod || !lesson) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Lesson not found.</p>
        <Link to={`/course/${courseId}`} className="text-nobus-600 hover:underline mt-4 inline-block">
          Back to course
        </Link>
      </div>
    );
  }

  const done = isLessonComplete(lessonId);
  const prevLesson = lessonIndex > 0 ? mod.lessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < mod.lessons.length - 1 ? mod.lessons[lessonIndex + 1] : null;

  const handleComplete = () => {
    markLessonComplete(lessonId);
    if (nextLesson) {
      navigate(`/course/${courseId}/module/${moduleId}/lesson/${nextLesson.id}`);
    } else if (mod.quiz) {
      navigate(`/course/${courseId}/module/${moduleId}/quiz`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link to={`/course/${courseId}`} className="hover:text-nobus-600 transition-colors">
          {course.title}
        </Link>
        <span>/</span>
        <Link to={`/course/${courseId}/module/${moduleId}`} className="hover:text-nobus-600 transition-colors">
          {mod.title}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{lesson.title}</span>
      </div>

      {/* Lesson header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-nobus-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Lesson {lessonIndex + 1} of {mod.lessons.length}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
        </div>
        {done && (
          <span className="badge-green flex items-center gap-1 flex-shrink-0">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        )}
      </div>

      {/* Content */}
      <div className="card p-6 md:p-8 mb-8">
        <MarkdownRenderer content={lesson.content} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {prevLesson ? (
          <Link
            to={`/course/${courseId}/module/${moduleId}/lesson/${prevLesson.id}`}
            className="btn-secondary inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </Link>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          {!done && (
            <button onClick={handleComplete} className="btn-primary inline-flex items-center gap-2">
              Mark Complete
              {nextLesson ? <ArrowRight className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            </button>
          )}
          {done && nextLesson && (
            <Link
              to={`/course/${courseId}/module/${moduleId}/lesson/${nextLesson.id}`}
              className="btn-primary inline-flex items-center gap-2"
            >
              Next Lesson <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          {done && !nextLesson && mod.quiz && (
            <Link
              to={`/course/${courseId}/module/${moduleId}/quiz`}
              className="btn-accent inline-flex items-center gap-2"
            >
              Take Quiz <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Lesson sidebar/nav */}
      <div className="mt-10 card p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Lessons in this module
        </h3>
        <div className="space-y-1">
          {mod.lessons.map((l, i) => (
            <Link
              key={l.id}
              to={`/course/${courseId}/module/${moduleId}/lesson/${l.id}`}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors ${
                l.id === lessonId
                  ? 'bg-nobus-50 text-nobus-700 font-medium'
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              {isLessonComplete(l.id) ? (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
              )}
              {l.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
