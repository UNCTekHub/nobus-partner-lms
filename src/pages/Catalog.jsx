import { Link } from 'react-router-dom';
import { TrendingUp, Server, Clock, Users, ArrowRight, CheckCircle, Lightbulb } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import ProgressBar from '../components/ProgressBar';
import salesCourse from '../data/salesCourse';
import technicalCourse from '../data/technicalCourse';
import presalesCourse from '../data/presalesCourse';

const courses = [
  { data: salesCourse, icon: TrendingUp, gradient: 'from-nobus-500 to-nobus-700', accent: 'nobus' },
  { data: presalesCourse, icon: Lightbulb, gradient: 'from-purple-500 to-purple-700', accent: 'nobus' },
  { data: technicalCourse, icon: Server, gradient: 'from-accent-500 to-accent-700', accent: 'accent' },
];

export default function Catalog() {
  const { getCourseProgress } = useProgress();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Catalog</h1>
        <p className="text-gray-600">Three comprehensive learning paths to enable partner sales, presales, and technical teams.</p>
      </div>

      <div className="space-y-8">
        {courses.map(({ data, icon: Icon, gradient, accent }) => {
          const prog = getCourseProgress(data.id);
          return (
            <div key={data.id} className="card overflow-hidden">
              <div className={`bg-gradient-to-r ${gradient} p-6 md:p-8 text-white`}>
                <div className="flex items-start justify-between">
                  <div>
                    <Icon className="w-10 h-10 mb-3 opacity-80" />
                    <h2 className="text-2xl font-bold mb-2">{data.title}</h2>
                    <p className="opacity-80 max-w-2xl">{data.description}</p>
                  </div>
                  <Link
                    to={`/course/${data.id}`}
                    className="hidden md:inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Start Learning <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex flex-wrap gap-4 mt-4 text-sm opacity-80">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {data.duration}</span>
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {data.audience}</span>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-sm text-gray-500">
                      {prog.completedLessons}/{prog.totalLessons} lessons
                    </span>
                  </div>
                  <ProgressBar value={prog.completedLessons} max={prog.totalLessons} color={accent} showLabel={false} size="md" />
                </div>

                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Learning Objectives
                </h3>
                <ul className="grid sm:grid-cols-2 gap-2 mb-6">
                  {data.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                      {obj}
                    </li>
                  ))}
                </ul>

                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Modules ({data.modules.length})
                </h3>
                <div className="space-y-2">
                  {data.modules.map((mod, i) => (
                    <Link
                      key={mod.id}
                      to={`/course/${data.id}/module/${mod.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          accent === 'nobus' ? 'bg-nobus-50 text-nobus-600' : 'bg-accent-50 text-accent-600'
                        }`}>
                          {i + 1}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{mod.title}</div>
                          <div className="text-xs text-gray-500">
                            {mod.lessons.length} lessons{mod.quiz ? ' + quiz' : ''}
                            {mod.day ? ` · Day ${mod.day}` : ''}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </Link>
                  ))}
                </div>

                <div className="mt-4 md:hidden">
                  <Link to={`/course/${data.id}`} className="btn-primary w-full text-center block">
                    Start Learning
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
