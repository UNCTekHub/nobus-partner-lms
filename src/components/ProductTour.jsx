import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Pause, ArrowRight, ArrowLeft, X, Volume2, VolumeX, RotateCcw, Sparkles, Rocket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STORAGE_PREFIX = 'nobus-tour-v2-';
const AUDIO_BASE = '/tour/audio'; // drop pristine step MP3s here (e.g. /tour/audio/tour-quotes.mp3)

// A self-driving 5-minute walkthrough: it navigates to each section, spotlights
// the key feature and narrates it, auto-advancing when narration ends.
const STEPS = [
  {
    id: 'welcome', hero: true, route: '/', title: 'A 5-minute tour of PartnerCentral',
    body: 'Sit back - this quick walkthrough drives itself through the key features of the platform. You can pause, skip, or replay it anytime from the "?" in the top bar.',
    narration: 'Welcome to Nobus PartnerCentral. Sit back and relax - this five minute walkthrough will drive itself through the key features of the platform. You can pause or skip at any time.',
  },
  {
    id: 'tour-dashboard', route: '/', title: 'Your Dashboard', place: 'bottom',
    body: 'This is your command center: open pipeline, weighted forecast, protected deals and your tier progress - all at a glance, with quick actions to jump straight into a task.',
    narration: 'This is your dashboard - your command center. At a glance you can see your open pipeline, your weighted forecast, your protected deals, and your partner tier progress.',
  },
  {
    id: 'tour-sales', route: '/sales-navigator', title: 'Sales Navigator', place: 'bottom',
    body: 'Track every opportunity on a Kanban pipeline, log activities against each lead, and watch your weighted revenue forecast update as deals move forward.',
    narration: 'The Sales Navigator lets you track every opportunity on a Kanban pipeline, log your activities, and see a weighted revenue forecast as your deals progress.',
  },
  {
    id: 'tour-deals', route: '/deals', title: 'Register a Deal', place: 'bottom',
    body: 'Register an opportunity here to lock in channel protection. Your deal stays shielded from conflict for as long as you keep the account active - there is no fixed expiry.',
    narration: 'Here you register your deals. Registering an opportunity locks in channel protection, keeping your deal shielded from conflict for as long as you stay engaged with the account.',
  },
  {
    id: 'tour-quotes', route: '/quotes', title: 'Build a Quote', place: 'bottom',
    body: 'Click New Quote to build a customer-ready quotation from the live Nobus catalog. Your partner-tier discount is applied automatically, and you can export a branded PDF or Excel order form.',
    narration: 'The Quote Builder creates customer-ready quotations from the live catalog. Just click New Quote, add your services, and your partner-tier discount is applied automatically. You can then export a branded PDF order form.',
  },
  {
    id: 'tour-training', route: '/catalog', title: 'Training Academy', place: 'bottom',
    body: 'Enable your Sales, Presales and Technical teams with role-based courses and certifications - the credentials that also help unlock higher partner tiers.',
    narration: 'The Training Academy enables your Sales, Presales and Technical teams with role-based courses and certifications - the same credentials that help you unlock higher partner tiers.',
  },
  {
    id: 'tour-growth', route: '/growth', title: 'Growth & Rewards', place: 'bottom',
    body: 'Track your tier and discount, the NCS credit you earn on every closed deal, your market development funds, and partner analytics - all in one place.',
    narration: 'Growth and Rewards brings together your tier progress and discount, the credit you earn on closed deals, your market development funds, and your partner analytics.',
  },
  {
    id: 'tour-support', route: '/support', title: 'Support', place: 'bottom',
    body: 'Raise a case with the Nobus partner team, backed by response-time SLAs and a named partner manager who is here to help you win.',
    narration: 'Need help? Support lets you raise a case with the Nobus partner team, backed by response time service levels and a named partner manager.',
  },
  {
    id: 'tour-forum', route: '/discussions', title: 'Community Forum', place: 'bottom',
    body: 'Swap knowledge with partners across the whole network in topic rooms for Compute, Storage, Networking, Security, Sales and more.',
    narration: 'The Community Forum lets you share knowledge with partners across the whole network, in topic rooms for compute, storage, networking, security, sales and more.',
  },
  {
    id: 'tour-marketing', route: '/marketing', title: 'Marketing Materials', place: 'bottom',
    body: 'Grab ready-to-use brochures, battle cards, whitepapers and campaign kits to take into your customer conversations.',
    narration: 'Under Marketing Materials you will find ready-to-use brochures, battle cards, whitepapers and campaign kits for your customer conversations.',
  },
  {
    id: 'tour-labs', route: '/demo-labs', title: 'Demo Labs', place: 'bottom',
    body: 'Book guided sandbox scenarios on the real Nobus platform to run hands-on demos in your presales meetings.',
    narration: 'And with Demo Labs you can book guided sandbox scenarios on the real Nobus platform, to run hands-on demonstrations in your presales meetings.',
  },
  {
    id: 'finish', hero: true, title: "You're ready to go", route: '/',
    body: 'That is the tour. Everything you just saw lives in the left-hand menu. Replay this walkthrough anytime from the "?" button in the top bar - now go build.',
    narration: "That's the tour. Everything you just saw lives in the left hand menu, and you can replay this walkthrough anytime from the question mark button in the top bar. Now go build.",
  },
];

// Pick the most natural available browser voice (fallback when no MP3 is present).
function bestVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  const en = voices.filter((v) => /^en(-|_|$)/i.test(v.lang));
  const pool = en.length ? en : voices;
  const pref = ['natural', 'neural', 'aria', 'jenny', 'libby', 'sonia', 'guy', 'google', 'samantha'];
  for (const p of pref) { const m = pool.find((v) => v.name.toLowerCase().includes(p)); if (m) return m; }
  return pool[0] || null;
}

export default function ProductTour() {
  const { currentUser, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [rect, setRect] = useState(null);
  const cleanupRef = useRef(null);
  const key = currentUser ? STORAGE_PREFIX + currentUser.id : null;
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stopNarration = useCallback(() => {
    if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }
    if (canSpeak) window.speechSynthesis.cancel();
  }, [canSpeak]);

  const start = useCallback(() => { setStep(0); setPlaying(true); setOpen(true); }, []);
  const finish = useCallback(() => {
    setOpen(false); stopNarration();
    if (key) { try { localStorage.setItem(key, '1'); } catch { /* ignore */ } }
  }, [key, stopNarration]);

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

  // Warm up voices (some browsers load them asynchronously).
  useEffect(() => { if (canSpeak) window.speechSynthesis.getVoices(); }, [canSpeak]);

  // Drive each step: navigate, find + spotlight the anchor, then narrate.
  useEffect(() => {
    if (!open) return;
    const s = STEPS[step];
    let cancelled = false;
    stopNarration();
    setRect(null);

    if (s.route && location.pathname !== s.route) navigate(s.route);

    const selector = s.hero ? null : `[data-tour="${s.id}"]`;
    const deadline = Date.now() + 3500;

    const settle = () => {
      if (cancelled) return;
      // Find + highlight the anchor (retry until it mounts after navigation/data load).
      if (selector) {
        const el = document.querySelector(selector);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => { if (!cancelled && el.isConnected) setRect(el.getBoundingClientRect()); }, 380);
        } else if (Date.now() < deadline) {
          setTimeout(settle, 150); return;
        }
      }
      // Narrate + auto-advance.
      if (playing) {
        cleanupRef.current = narrate(s, muted, () => { if (!cancelled && playing) setTimeout(() => go(step + 1), 550); });
      }
    };
    const t = setTimeout(settle, s.route && location.pathname !== s.route ? 260 : 60);
    return () => { cancelled = true; clearTimeout(t); stopNarration(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, playing, muted]);

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
      <div className="absolute w-[380px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={tipStyle}>
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
          <div className="flex items-center gap-0.5 shrink-0">
            <button onClick={() => setMuted((m) => !m)} title={muted ? 'Unmute' : 'Mute'} className="p-1.5 rounded-lg text-nobus-300 hover:bg-white/10">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button onClick={finish} title="End tour" className="p-1.5 rounded-lg text-nobus-300 hover:bg-white/10"><X className="w-4 h-4" /></button>
          </div>
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
            <button onClick={() => setPlaying((p) => !p)} title={playing ? 'Pause' : 'Play'}
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
          <div className="flex items-center justify-between px-5 pb-3 -mt-1">
            <button onClick={() => { setStep(0); go(0); }} className="hidden" />
            <button onClick={finish} className="text-xs text-gray-400 hover:text-gray-600">Skip tour</button>
            <button onClick={() => { setPlaying(true); go(1); }} className="text-xs font-semibold text-nobus-600 hover:text-nobus-700 inline-flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Auto-play
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Narrate a step: prefer a pristine MP3 clip, fall back to the best browser voice,
// and always call onDone (audio ended / speech ended / safety timeout). Returns cleanup.
function narrate(stepDef, muted, onDone) {
  let done = false;
  const finishOnce = () => { if (!done) { done = true; onDone(); } };
  if (muted) { const t = setTimeout(finishOnce, estMs(stepDef.narration)); return () => clearTimeout(t); }

  let audio = null; let usedTts = false;
  const speakTts = () => {
    if (usedTts) return; usedTts = true;
    if (!('speechSynthesis' in window)) { setTimeout(finishOnce, estMs(stepDef.narration)); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(stepDef.narration);
    const v = bestVoice(); if (v) u.voice = v;
    u.rate = 1.0; u.pitch = 1.0;
    u.onend = finishOnce;
    window.speechSynthesis.speak(u);
  };

  try {
    audio = new Audio(`${AUDIO_BASE}/${stepDef.id}.mp3`);
    audio.addEventListener('ended', finishOnce);
    audio.addEventListener('error', speakTts);
    audio.play().catch(speakTts);
  } catch { speakTts(); }

  const safety = setTimeout(finishOnce, 70000);
  return () => {
    clearTimeout(safety);
    if (audio) { try { audio.pause(); audio.src = ''; } catch { /* ignore */ } }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };
}

// Rough spoken duration estimate for muted auto-advance (~2.7 words/sec).
function estMs(text) {
  const words = (text || '').split(/\s+/).length;
  return Math.max(6000, Math.round((words / 2.7) * 1000) + 800);
}
