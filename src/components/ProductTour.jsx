import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Compass, ShieldCheck, Calculator, GraduationCap, TrendingUp,
  LifeBuoy, Megaphone, Sparkles, ArrowRight, ArrowLeft, X, Volume2, VolumeX, Rocket,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STORAGE_PREFIX = 'nobus-tour-v1-';

// A guided walkthrough of the partner portal. Step 0 welcomes, the last step
// wraps up; the middle steps introduce each tool with an optional "go there" link.
const STEPS = [
  {
    icon: Sparkles, hero: true, title: 'Welcome to PartnerCentral',
    body: 'Take a quick 60-second tour of the tools that help you learn, sell and grow with Nobus Cloud. You can replay it anytime from the "?" in the top bar.',
    narration: 'Welcome to Nobus PartnerCentral. Take a quick tour of the tools that help you learn, sell, and grow with Nobus Cloud.',
  },
  {
    icon: LayoutDashboard, title: 'Your Dashboard', to: '/',
    body: 'Your command center - open pipeline, weighted forecast, protected deals, tier progress and quick actions, all at a glance.',
    narration: 'This is your dashboard - your command center, showing your pipeline, forecast, protected deals and tier progress at a glance.',
  },
  {
    icon: Compass, title: 'Sales Navigator', to: '/sales-navigator',
    body: 'Manage your pipeline on a Kanban board, log activities against each lead, and see a weighted revenue forecast.',
    narration: 'Sales Navigator lets you manage your pipeline on a Kanban board and see a weighted revenue forecast.',
  },
  {
    icon: ShieldCheck, title: 'Deal Registration', to: '/deals',
    body: 'Register opportunities for channel protection that lasts as long as you stay engaged with the account - no fixed expiry.',
    narration: 'Deal Registration protects your opportunities from channel conflict for as long as you stay engaged with the account.',
  },
  {
    icon: Calculator, title: 'Quote Builder', to: '/quotes',
    body: 'Build customer-ready quotes from the live Nobus catalog. Your partner-tier discount is applied automatically, and you can export to PDF or Excel.',
    narration: 'The Quote Builder creates customer-ready quotes from the live catalog, with your partner-tier discount applied automatically.',
  },
  {
    icon: GraduationCap, title: 'Training & Certification', to: '/catalog',
    body: 'Enable your Sales, Presales and Technical teams with role-based courses and certifications - the credentials that help you climb partner tiers.',
    narration: 'The Training Academy enables your team with role-based courses and certifications that help you climb partner tiers.',
  },
  {
    icon: TrendingUp, title: 'Growth & Rewards', to: '/growth',
    body: 'Track your tier progress and discount, the NCS credit you earn on every closed deal, and your market development funds.',
    narration: 'Growth and Rewards tracks your tier progress, the credit you earn on closed deals, and your market development funds.',
  },
  {
    icon: LifeBuoy, title: 'Support & Community', to: '/support',
    body: 'Raise support cases with response SLAs and a named partner manager, and swap knowledge with other partners in the Community Forum.',
    narration: 'Get help through Support with response SLAs, and share knowledge with other partners in the Community Forum.',
  },
  {
    icon: Megaphone, title: 'Resources & Demo Labs', to: '/marketing',
    body: 'Grab brochures, battle cards and whitepapers, and book guided demo labs to run in your customer meetings.',
    narration: 'Under Resources you will find marketing materials, content, and guided demo labs for your customer meetings.',
  },
  {
    icon: Rocket, hero: true, title: "You're all set",
    body: 'That\'s the tour. Dive in whenever you\'re ready - and replay this anytime from the "?" button in the top bar.',
    narration: "You're all set. Dive in whenever you're ready, and replay this tour anytime from the question-mark button in the top bar.",
  },
];

export default function ProductTour() {
  const { currentUser, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [narrate, setNarrate] = useState(true);
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const key = currentUser ? STORAGE_PREFIX + currentUser.id : null;

  const speak = useCallback((text) => {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0; u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  }, [canSpeak]);

  const stop = useCallback(() => { if (canSpeak) window.speechSynthesis.cancel(); }, [canSpeak]);

  const start = useCallback(() => { setStep(0); setOpen(true); }, []);

  const finish = useCallback(() => {
    setOpen(false); stop();
    if (key) { try { localStorage.setItem(key, '1'); } catch { /* ignore */ } }
  }, [key, stop]);

  // Auto-open once for partners who haven't seen it; allow manual re-open via event.
  useEffect(() => {
    if (!currentUser || isSuperAdmin || !key) return;
    let seen = false;
    try { seen = !!localStorage.getItem(key); } catch { /* ignore */ }
    if (!seen) { const t = setTimeout(start, 700); return () => clearTimeout(t); }
  }, [currentUser, isSuperAdmin, key, start]);

  useEffect(() => {
    const handler = () => start();
    window.addEventListener('open-tour', handler);
    return () => window.removeEventListener('open-tour', handler);
  }, [start]);

  // Narrate the current step; stop when closed or on unmount.
  useEffect(() => {
    if (open && narrate) speak(STEPS[step].narration);
    else stop();
    return stop;
  }, [open, step, narrate, speak, stop]);

  if (!open) return null;
  const s = STEPS[step];
  const Icon = s.icon;
  const isLast = step === STEPS.length - 1;

  const goToTool = () => { finish(); if (s.to) navigate(s.to); };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-nobus-950/70 backdrop-blur-sm print:hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header band */}
        <div className="bg-nobus-950 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-nobus-500/20 flex items-center justify-center">
              <Icon className="w-6 h-6 text-nobus-300" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-nobus-400 font-semibold">
                {s.hero ? 'Guided Tour' : `Step ${step} of ${STEPS.length - 2}`}
              </div>
              <div className="text-white font-bold text-lg leading-tight">{s.title}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {canSpeak && (
              <button onClick={() => setNarrate((v) => !v)} title={narrate ? 'Mute narration' : 'Unmute narration'}
                className="p-2 rounded-lg text-nobus-300 hover:bg-white/10">
                {narrate ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            )}
            <button onClick={finish} title="Close tour" className="p-2 rounded-lg text-nobus-300 hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-gray-600 leading-relaxed">{s.body}</p>
          {s.to && !s.hero && (
            <button onClick={goToTool} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-nobus-600 hover:text-nobus-700">
              Go to {s.title} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Footer / controls */}
        <div className="px-6 pb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-5 bg-nobus-500' : 'w-1.5 bg-gray-200'}`} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button onClick={() => setStep((v) => Math.max(0, v - 1))}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            {isLast ? (
              <button onClick={finish} className="btn-primary text-sm">Start exploring</button>
            ) : (
              <button onClick={() => setStep((v) => v + 1)} className="btn-primary text-sm inline-flex items-center gap-1.5">
                {step === 0 ? 'Start tour' : 'Next'} <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {step === 0 && (
          <button onClick={finish} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 pb-4 -mt-2">
            Skip the tour
          </button>
        )}
      </div>
    </div>
  );
}
