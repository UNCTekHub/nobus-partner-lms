import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Pause, ArrowRight, ArrowLeft, X, Sparkles, Rocket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STORAGE_PREFIX = 'nobus-tour-v2-';

// A self-driving 5-minute, text-only walkthrough: it navigates to each section,
// spotlights the key feature, and auto-advances on a reading-time timer.
const STEPS = [
  {
    id: 'welcome', hero: true, route: '/', title: 'A 5-minute tour of PartnerCentral',
    body: 'Sit back - this quick walkthrough drives itself through the key features of the platform. You can pause, skip, or replay it anytime from the "?" in the top bar.',
  },
  {
    id: 'tour-dashboard', route: '/', title: 'Your Dashboard',
    body: 'This is your command center: open pipeline, weighted forecast, protected deals and your tier progress - all at a glance, with quick actions to jump straight into a task.',
  },
  {
    id: 'tour-sales', route: '/sales-navigator', title: 'Sales Navigator',
    body: 'Track every opportunity on a Kanban pipeline, log activities against each lead, and watch your weighted revenue forecast update as deals move forward.',
  },
  {
    id: 'tour-deals', route: '/deals', title: 'Register a Deal',
    body: 'Register an opportunity here to lock in channel protection. Your deal stays shielded from conflict for as long as you keep the account active - there is no fixed expiry.',
  },
  {
    id: 'tour-quotes', route: '/quotes', title: 'Build a Quote',
    body: 'Click New Quote to build a customer-ready quotation from the live Nobus catalog. Your partner-tier discount is applied automatically, and you can export a branded PDF or Excel order form.',
  },
  {
    id: 'tour-training', route: '/catalog', title: 'Training Academy',
    body: 'Enable your Sales, Presales and Technical teams with role-based courses and certifications - the credentials that also help unlock higher partner tiers.',
  },
  {
    id: 'tour-growth', route: '/growth', title: 'Growth & Rewards',
    body: 'Track your tier and discount, the NCS credit you earn on every closed deal, your market development funds, and partner analytics - all in one place.',
  },
  {
    id: 'tour-support', route: '/support', title: 'Support',
    body: 'Raise a case with the Nobus partner team, backed by response-time SLAs and a named partner manager who is here to help you win.',
  },
  {
    id: 'tour-forum', route: '/discussions', title: 'Community Forum',
    body: 'Swap knowledge with partners across the whole network in topic rooms for Compute, Storage, Networking, Security, Sales and more.',
  },
  {
    id: 'tour-marketing', route: '/marketing', title: 'Marketing Materials',
    body: 'Grab ready-to-use brochures, battle cards, whitepapers and campaign kits to take into your customer conversations.',
  },
  {
    id: 'tour-labs', route: '/demo-labs', title: 'Demo Labs',
    body: 'Book guided sandbox scenarios on the real Nobus platform to run hands-on demos in your presales meetings.',
  },
  {
    id: 'finish', hero: true, title: "You're ready to go", route: '/',
    body: 'That is the tour. Everything you just saw lives in the left-hand menu. Replay this walkthrough anytime from the "?" button in the top bar - now go build.',
  },
];

// Comfortable reading time for a step before it auto-advances (~3 words/sec).
function readingMs(text) {
  const words = (text || '').split(/\s+/).length;
  return Math.min(24000, Math.max(8000, Math.round((words / 3) * 1000) + 2200));
}

export default function ProductTour() {
  const { currentUser, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [rect, setRect] = useState(null);
  const timerRef = useRef(null);
  const key = currentUser ? STORAGE_PREFIX + currentUser.id : null;

  const clearTimer = useCallback(() => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } }, []);
  const start = useCallback(() => { setStep(0); setPlaying(true); setOpen(true); }, []);
  const finish = useCallback(() => {
    setOpen(false); clearTimer();
    if (key) { try { localStorage.setItem(key, '1'); } catch { /* ignore */ } }
  }, [key, clearTimer]);
  const go = useCallback((i) => { if (i >= STEPS.length) finish(); else setStep(Math.max(0, i)); }, [finish]);

  // Auto-open once for partners; manual replay via the 'open-tour' event.
  useEffect(() => {
    if (!currentUser || isSuperAdmin || !key) return;
    let seen = false; try { seen = !!localStorage.getItem(key); } catch { /* ignore */ }
    if (!seen) { const t = setTimeout(start, 800); return () => clearTimeout(t); }
  }, [currentUser, isSuperAdmin, key, start]);
  useEffect(() => {
    const h = () => start();
    window.addEventListener('open-tour', h);
    return () => window.removeEventListener('open-tour', h);
  }, [start]);

  // Drive each step: navigate, find + spotlight the anchor, then auto-advance.
  useEffect(() => {
    if (!open) return;
    const s = STEPS[step];
    let cancelled = false;
    clearTimer();
    setRect(null);

    if (s.route && location.pathname !== s.route) navigate(s.route);

    const selector = s.hero ? null : `[data-tour="${s.id}"]`;
    const deadline = Date.now() + 3500;

    const settle = () => {
      if (cancelled) return;
      if (selector) {
        const el = document.querySelector(selector);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => { if (!cancelled && el.isConnected) setRect(el.getBoundingClientRect()); }, 380);
        } else if (Date.now() < deadline) { setTimeout(settle, 150); return; }
      }
      if (playing && step < STEPS.length - 1) {
        timerRef.current = setTimeout(() => { if (!cancelled) go(step + 1); }, readingMs(s.body));
      }
    };
    const t = setTimeout(settle, s.route && location.pathname !== s.route ? 260 : 60);
    return () => { cancelled = true; clearTimeout(t); clearTimer(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, playing]);

  // Keep the spotlight aligned on resize.
  useEffect(() => {
    if (!open) return;
    const onResize = () => {
      const s = STEPS[step];
      if (s.hero) return;
      const el = document.querySelector(`[data-tour="${s.id}"]`);
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open, step]);

  if (!open) return null;
  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const pad = 8;
  const holeStyle = rect ? {
    top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2,
  } : null;

  // Tooltip placement: under the highlight if there's room, else centered.
  let tipStyle = { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
  if (rect) {
    const below = rect.bottom + 16;
    const tipW = 380;
    const cx = Math.min(Math.max(rect.left + rect.width / 2, tipW / 2 + 12), window.innerWidth - tipW / 2 - 12);
    if (below + 210 < window.innerHeight) tipStyle = { left: cx, top: below, transform: 'translateX(-50%)' };
    else if (rect.top - 16 > 230) tipStyle = { left: cx, top: rect.top - 16, transform: 'translate(-50%, -100%)' };
  }

  const HeaderIcon = s.id === 'finish' ? Rocket : Sparkles;

  return (
    <div className="fixed inset-0 z-[95] print:hidden" aria-live="polite">
      {/* Dim + spotlight hole */}
      {holeStyle ? (
        <div className="absolute rounded-xl pointer-events-none transition-all duration-300"
          style={{ ...holeStyle, boxShadow: '0 0 0 9999px rgba(10,18,41,0.74)', outline: '3px solid #2e6bff', outlineOffset: '2px', borderRadius: 12 }} />
      ) : (
        <div className="absolute inset-0" style={{ background: 'rgba(10,18,41,0.74)' }} />
      )}

      {/* Tooltip / control card */}
      <div className="absolute w-[380px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl overflow-hidden" style={tipStyle}>
        <div className="bg-nobus-950 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-nobus-500/20 flex items-center justify-center shrink-0">
              <HeaderIcon className="w-5 h-5 text-nobus-300" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-nobus-400 font-semibold">
                {s.hero ? '5-minute platform tour' : `Step ${step} of ${STEPS.length - 2} · key features`}
              </div>
              <div className="text-white font-bold leading-tight truncate">{s.title}</div>
            </div>
          </div>
          <button onClick={finish} title="End tour" className="p-1.5 rounded-lg text-nobus-300 hover:bg-white/10 shrink-0"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
        </div>

        <div className="px-5 pb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-4 bg-nobus-500' : 'w-1.5 bg-gray-200'}`} />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPlaying((p) => !p)} title={playing ? 'Pause auto-advance' : 'Auto-advance'}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100">
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button onClick={() => go(step - 1)} disabled={step === 0} title="Back"
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30"><ArrowLeft className="w-4 h-4" /></button>
            {isLast ? (
              <button onClick={finish} className="btn-primary text-sm !py-1.5">Finish</button>
            ) : (
              <button onClick={() => go(step + 1)} className="btn-primary text-sm !py-1.5 inline-flex items-center gap-1">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {s.id === 'welcome' && (
          <div className="text-center px-5 pb-3 -mt-1">
            <button onClick={finish} className="text-xs text-gray-400 hover:text-gray-600">Skip tour</button>
          </div>
        )}
      </div>
    </div>
  );
}
