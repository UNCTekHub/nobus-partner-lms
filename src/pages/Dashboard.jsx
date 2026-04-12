import { Link } from 'react-router-dom';
import { TrendingUp, Server, BookOpen, Award, ArrowRight, Target, Zap, Lightbulb } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import salesCourse from '../data/salesCourse';
import technicalCourse from '../data/technicalCourse';
import presalesCourse from '../data/presalesCourse';

const tracks = [
  {
    course: salesCourse,
    icon: TrendingUp,
    gradient: 'from-nobus-500 to-nobus-700',
    accent: 'nobus',
  },
  {
    course: presalesCourse,
    icon: Lightbulb,
    gradient: 'from-purple-500 to-purple-700',
    accent: 'nobus',
  },
  {
    course: technicalCourse,
    icon: Server,
    gradient: 'from-accent-500 to-accent-700',
    accent: 'accent',
  },
];

export default function Dashboard() {
  const { getCourseProgress } = useProgress();
  const { currentUser } = useAuth();

  const salesProgress = getCourseProgress('sales-enablement');
  const presalesProgress = getCourseProgress('presales-enablement');
  const techProgress = getCourseProgress('technical-enablement');

  const totalLessons = salesProgress.totalLessons + presalesProgress.totalLessons + techProgress.totalLessons;
  const totalCompleted = salesProgress.completedLessons + presalesProgress.completedLessons + techProgress.completedLessons;
  const totalQuizzes = salesProgress.totalQuizzes + presalesProgress.totalQuizzes + techProgress.totalQuizzes;
  const totalPassed = salesProgress.passedQuizzes + presalesProgress.passedQuizzes + techProgress.passedQuizzes;

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-nobus-900 via-nobus-800 to-nobus-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-3xl">
            <div className="badge bg-nobus-700 text-nobus-200 mb-4">Partner Enablement</div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
              {currentUser ? `Welcome back, ${currentUser.name.split(' ')[0]}` : 'Nobus Cloud Partner'}<br />
              <span className="text-nobus-300 text-2xl md:text-3xl font-bold">Learning Platform</span>
            </h1>
            <p className="text-nobus-200 text-lg mb-8 leading-relaxed">
              Master the skills to sell and deliver Nobus Cloud solutions.
              Complete the learning paths to become a certified Nobus partner.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/catalog" className="btn-primary inline-flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Browse Courses
              </Link>
              <Link to="/certification" className="btn-secondary !border-nobus-500 !text-nobus-200 hover:!bg-nobus-800 inline-flex items-center gap-2">
                <Award className="w-4 h-4" /> Certification Path
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Lessons Completed', value: `${totalCompleted}/${totalLessons}`, icon: BookOpen, color: 'text-nobus-600' },
            { label: 'Quizzes Passed', value: `${totalPassed}/${totalQuizzes}`, icon: Target, color: 'text-accent-600' },
            { label: 'Learning Paths', value: '3', icon: Zap, color: 'text-amber-600' },
            { label: 'Certification Levels', value: '3', icon: Award, color: 'text-green-600' },
          ].map((stat) => (
            <div key={stat.label} className="card p-5">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Learning Paths */}
        <h2 className="text-xl font-bold text-gray-900 mb-5">Learning Paths</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {tracks.map(({ course, icon: Icon, gradient, accent }) => {
            const prog = getCourseProgress(course.id);
            return (
              <Link
                key={course.id}
                to={`/course/${course.id}`}
                className="card overflow-hidden group"
              >
                <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>
                  <Icon className="w-8 h-8 mb-3 opacity-80" />
                  <h3 className="text-lg font-bold mb-1">{course.title}</h3>
                  <p className="text-sm opacity-80">{course.duration}</p>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  <ProgressBar value={prog.completedLessons} max={prog.totalLessons} color={accent} />
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-500">
                      {prog.completedLessons}/{prog.totalLessons} lessons &middot; {prog.passedQuizzes}/{prog.totalQuizzes} quizzes
                    </span>
                    <span className="text-nobus-600 text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Continue <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Why Nobus */}
        <div className="card p-8 bg-gradient-to-br from-gray-50 to-white">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Why Nobus Cloud?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Data Sovereignty', desc: 'Data stays in Nigeria. NDPR compliant by design.', icon: '🇳🇬' },
              { title: 'Naira Pricing', desc: 'No FX risk. Budget certainty with local currency billing.', icon: '₦' },
              { title: 'Local Support', desc: 'Same timezone, same language. We can visit your office.', icon: '🤝' },
              { title: '15-30% Cheaper', desc: 'No egress fees. Transparent pricing. Real savings.', icon: '📉' },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
