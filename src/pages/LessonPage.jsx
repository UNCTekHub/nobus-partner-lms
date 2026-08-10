import { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, BookOpen, ClipboardList, ChevronDown, List, X } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import MarkdownRenderer from '../components/MarkdownRenderer';
import ProgressBar from '../components/ProgressBar';
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
  const { markLessonComplete, isLessonComplete, getCourseProgress, getQuizResult } = useProgress();
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [expanded, setExpanded] = useState({});

  const course = courseMap[courseId] || salesCourse;
  const mod = course.modules.find((m) => m.id === moduleId);
  const lesson = mod?.lessons.find((l) => l.id === lessonId);

  // Flat course-wide lesson list so Previous/Next crosses module boundaries
  const flat = useMemo(
    () => course.modules.flatMap((m) => m.lessons.map((l) => ({ moduleId: m.id, lesson: l }))),
    [course]
  );
  const flatIndex = flat.findIndex((f) => f.lesson.id === lessonId);
  const prev = flatIndex > 0 ? flat[flatIndex - 1] : null;
  const next = flatIndex >= 0 && flatIndex < flat.length - 1 ? flat[flatIndex + 1] : null;
  const isLastInModule = mod && lesson && mod.lessons[mod.lessons.length - 1].id === lessonId;

  // Auto-expand the current module in the outline
  useEffect(() => {
    if (moduleId) setExpanded((e) => ({ ...e, [moduleId]: true }));
    window.scrollTo({ top: 0 });
  }, [moduleId, lessonId]);

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
  const prog = getCourseProgress(course.id);

  const handleComplete = () => {
    markLessonComplete(lessonId);
    if (isLastInModule && mod.quiz) {
      navigate(`/course/${courseId}/module/${moduleId}/quiz`);
    } else if (next) {
      navigate(`/course/${courseId}/module/${next.moduleId}/lesson/${next.lesson.id}`);
    }
  };

  const outline = (
    <div className="space-y-1">
      <Link to={`/course/${courseId}`} onClick={() => setOutlineOpen(false)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-800 hover:text-nobus-600">
        <ArrowLeft className="w-3.5 h-3.5" /> {course.title}
      </Link>
      <div className="px-3 pb-3">
        <ProgressBar value={prog.completedLessons} max={prog.totalLessons} color="nobus" showLabel={false} size="sm" />
        <div className="text-[11px] text-gray-400 mt-1">{prog.completedLessons}/{prog.totalLessons} lessons complete</div>
      </div>
      {course.modules.map((m, mi) => {
        const moduleDone = m.lessons.every((l) => isLessonComplete(l.id));
        const isOpen = expanded[m.id] ?? m.id === moduleId;
        return (
          <div key={m.id}>
            <button onClick={() => setExpanded((e) => ({ ...e, [m.id]: !isOpen }))}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm font-medium transition-colors ${
                m.id === moduleId ? 'bg-nobus-50 text-nobus-700' : 'text-gray-700 hover:bg-gray-50'
              }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                moduleDone ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {moduleDone ? <CheckCircle className="w-3.5 h-3.5" /> : mi + 1}
              </span>
              <span className="flex-1 truncate">{m.title.replace(/^(Session|Module) \d+: /, '')}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div className="ml-4 border-l border-gray-200 pl-2 py-1 space-y-0.5">
                {m.lessons.map((l) => (
                  <Link key={l.id} to={`/course/${courseId}/module/${m.id}/lesson/${l.id}`}
                    onClick={() => setOutlineOpen(false)}
                    className={`flex items-center gap-2 py-1.5 px-2 rounded-md text-[13px] transition-colors ${
                      l.id === lessonId ? 'bg-nobus-500 text-white font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    {isLessonComplete(l.id) ? (
                      <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${l.id === lessonId ? 'text-white' : 'text-green-500'}`} />
                    ) : (
                      <span className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${l.id === lessonId ? 'border-white/70' : 'border-gray-300'}`} />
                    )}
                    <span className="truncate">{l.title}</span>
                  </Link>
                ))}
                {m.quiz && (
                  <Link to={`/course/${courseId}/module/${m.id}/quiz`} onClick={() => setOutlineOpen(false)}
                    className="flex items-center gap-2 py-1.5 px-2 rounded-md text-[13px] text-gray-600 hover:bg-gray-50">
                    {getQuizResult(m.quiz.id)?.passed ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    ) : (
                      <ClipboardList className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    Module quiz
                  </Link>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto lg:flex lg:gap-8 px-4 sm:px-6 lg:px-8 py-8">
      {/* Course outline: desktop sticky rail */}
      <aside className="hidden lg:block w-80 shrink-0">
        <div className="sticky top-20 card p-4 max-h-[calc(100vh-7rem)] overflow-y-auto">
          {outline}
        </div>
      </aside>

      {/* Mobile outline drawer */}
      {outlineOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOutlineOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl p-4 overflow-y-auto">
            <button onClick={() => setOutlineOpen(false)} className="absolute top-3 right-3 p-1.5 rounded hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
            {outline}
          </div>
        </div>
      )}

      {/* Lesson content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-5">
          <button onClick={() => setOutlineOpen(true)}
            className="lg:hidden flex items-center gap-1.5 text-sm font-medium text-nobus-600">
            <List className="w-4 h-4" /> Course outline
          </button>
          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400 min-w-0">
            <span className="truncate">{mod.title}</span>
          </div>
          <span className="text-xs text-gray-400 shrink-0">
            Lesson {flatIndex + 1} of {flat.length}
          </span>
        </div>

        <div className="card overflow-hidden mb-6">
          <div className="bg-nobus-950 text-white px-6 md:px-10 py-6">
            <div className="flex items-center gap-2 text-nobus-300 text-xs uppercase tracking-wider font-semibold mb-1.5">
              <BookOpen className="w-4 h-4" /> {course.title}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-xl md:text-2xl font-bold">{lesson.title}</h1>
              {done && (
                <span className="badge-green flex items-center gap-1 shrink-0">
                  <CheckCircle className="w-3 h-3" /> Completed
                </span>
              )}
            </div>
          </div>
          <div className="p-6 md:p-10">
            <MarkdownRenderer content={lesson.content} />
          </div>
        </div>

        {/* Navigation bar */}
        <div className="card p-4 flex items-center justify-between gap-3 sticky bottom-4 shadow-lg">
          {prev ? (
            <Link to={`/course/${courseId}/module/${prev.moduleId}/lesson/${prev.lesson.id}`}
              className="btn-secondary !py-2 inline-flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Previous</span>
            </Link>
          ) : <div />}

          <div className="flex items-center gap-2">
            {!done ? (
              <button onClick={handleComplete} className="btn-primary !py-2 inline-flex items-center gap-2 text-sm">
                Mark Complete &amp; Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : isLastInModule && mod.quiz ? (
              <Link to={`/course/${courseId}/module/${moduleId}/quiz`}
                className="btn-primary !py-2 inline-flex items-center gap-2 text-sm">
                <ClipboardList className="w-4 h-4" /> Take Module Quiz
              </Link>
            ) : next ? (
              <Link to={`/course/${courseId}/module/${next.moduleId}/lesson/${next.lesson.id}`}
                className="btn-primary !py-2 inline-flex items-center gap-2 text-sm">
                Next Lesson <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link to={`/course/${courseId}`} className="btn-primary !py-2 inline-flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4" /> Course Complete
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
