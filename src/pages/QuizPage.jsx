import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Trophy, ArrowRight } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import salesCourse from '../data/salesCourse';
import technicalCourse from '../data/technicalCourse';
import presalesCourse from '../data/presalesCourse';

const courseMap = {
  'sales-enablement': salesCourse,
  'technical-enablement': technicalCourse,
  'presales-enablement': presalesCourse,
};

export default function QuizPage() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { saveQuizScore, getQuizResult } = useProgress();

  const course = courseMap[courseId] || salesCourse;
  const mod = course.modules.find((m) => m.id === moduleId);
  const quiz = mod?.quiz;

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const existingResult = getQuizResult(quiz?.id);

  if (!mod || !quiz) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Quiz not found.</p>
        <Link to={`/course/${courseId}`} className="text-nobus-600 hover:underline mt-4 inline-block">
          Back to course
        </Link>
      </div>
    );
  }

  const handleSelect = (qIndex, optIndex) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmit = () => {
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    setScore(correct);
    setSubmitted(true);
    saveQuizScore(quiz.id, correct, quiz.questions.length);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const allAnswered = Object.keys(answers).length === quiz.questions.length;
  const passed = submitted && score / quiz.questions.length >= 0.75;

  // Find next module
  const modIndex = course.modules.findIndex((m) => m.id === moduleId);
  const nextMod = modIndex < course.modules.length - 1 ? course.modules[modIndex + 1] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link to={`/course/${courseId}`} className="hover:text-nobus-600">{course.title}</Link>
        <span>/</span>
        <Link to={`/course/${courseId}/module/${moduleId}`} className="hover:text-nobus-600">{mod.title}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Quiz</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
      <p className="text-gray-500 text-sm mb-8">
        {quiz.questions.length} questions &middot; 75% to pass
        {existingResult && !submitted && (
          <span className={`ml-3 ${existingResult.passed ? 'text-green-600' : 'text-amber-600'}`}>
            Previous: {existingResult.score}/{existingResult.total} ({existingResult.passed ? 'Passed' : 'Not passed'})
          </span>
        )}
      </p>

      {/* Results banner */}
      {submitted && (
        <div className={`rounded-xl p-6 mb-8 ${passed ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            {passed ? (
              <Trophy className="w-8 h-8 text-green-600" />
            ) : (
              <RotateCcw className="w-8 h-8 text-amber-600" />
            )}
            <div>
              <h3 className={`text-lg font-bold ${passed ? 'text-green-800' : 'text-amber-800'}`}>
                {passed ? 'Congratulations! You passed!' : 'Not quite — review and try again'}
              </h3>
              <p className={`text-sm ${passed ? 'text-green-600' : 'text-amber-600'}`}>
                Score: {score}/{quiz.questions.length} ({Math.round((score / quiz.questions.length) * 100)}%)
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            {!passed && (
              <button onClick={handleRetry} className="btn-secondary text-sm">
                <RotateCcw className="w-4 h-4 inline mr-1" /> Retry Quiz
              </button>
            )}
            {passed && nextMod && (
              <Link
                to={`/course/${courseId}/module/${nextMod.id}`}
                className="btn-primary inline-flex items-center gap-2 text-sm"
              >
                Next Module <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link to={`/course/${courseId}`} className="btn-secondary text-sm">
              Back to Course
            </Link>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((q, qi) => {
          const selected = answers[qi];
          const isCorrect = submitted && selected === q.correct;
          const isWrong = submitted && selected !== undefined && selected !== q.correct;

          return (
            <div
              key={qi}
              className={`card p-5 ${
                submitted
                  ? isCorrect
                    ? 'ring-2 ring-green-300'
                    : isWrong
                      ? 'ring-2 ring-red-300'
                      : ''
                  : ''
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="w-7 h-7 rounded-full bg-nobus-50 text-nobus-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {qi + 1}
                </span>
                <h3 className="font-medium text-gray-900">{q.q}</h3>
              </div>

              <div className="space-y-2 ml-10">
                {q.options.map((opt, oi) => {
                  const isSelected = selected === oi;
                  const isCorrectOpt = submitted && oi === q.correct;
                  const isWrongOpt = submitted && isSelected && oi !== q.correct;

                  return (
                    <button
                      key={oi}
                      onClick={() => handleSelect(qi, oi)}
                      disabled={submitted}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 text-sm transition-all flex items-center gap-3 ${
                        isCorrectOpt
                          ? 'border-green-400 bg-green-50 text-green-800'
                          : isWrongOpt
                            ? 'border-red-400 bg-red-50 text-red-800'
                            : isSelected
                              ? 'border-nobus-400 bg-nobus-50 text-nobus-800'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                      } ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isCorrectOpt
                          ? 'border-green-500 bg-green-500'
                          : isWrongOpt
                            ? 'border-red-500 bg-red-500'
                            : isSelected
                              ? 'border-nobus-500 bg-nobus-500'
                              : 'border-gray-300'
                      }`}>
                        {isCorrectOpt && <CheckCircle className="w-3 h-3 text-white" />}
                        {isWrongOpt && <XCircle className="w-3 h-3 text-white" />}
                        {isSelected && !submitted && <div className="w-2 h-2 bg-white rounded-full" />}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      {!submitted && (
        <div className="mt-8 flex items-center justify-between">
          <Link to={`/course/${courseId}/module/${moduleId}`} className="btn-secondary inline-flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Module
          </Link>
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className={`btn-primary ${!allAnswered ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Submit Quiz
          </button>
        </div>
      )}
    </div>
  );
}
