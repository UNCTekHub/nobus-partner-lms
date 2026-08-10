import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, Pause, Square } from 'lucide-react';

// "Listen or read" control for a lesson: reads the lesson text aloud with the
// best available browser voice, so learners can listen instead of (or while)
// reading. The text stays on screen either way.

// Prefer the most natural voice the device offers (Edge/Chrome expose cloud
// "Natural" neural voices; others fall back to the default system voice).
function bestVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  const en = voices.filter((v) => /^en(-|_|$)/i.test(v.lang));
  const pool = en.length ? en : voices;
  const pref = ['natural', 'neural', 'online', 'aria', 'jenny', 'libby', 'sonia', 'guy', 'google', 'samantha'];
  for (const p of pref) { const m = pool.find((v) => v.name.toLowerCase().includes(p)); if (m) return m; }
  return pool[0] || null;
}

// Strip markdown to readable prose so the narration doesn't read syntax aloud.
function toPlainText(md) {
  return (md || '')
    .replace(/```[\s\S]*?```/g, ' ')            // fenced code blocks
    .replace(/`([^`]+)`/g, '$1')                // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')      // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')    // links -> link text
    .replace(/^\s{0,3}#{1,6}\s*/gm, '')         // headings
    .replace(/^\s*>\s?/gm, '')                  // blockquotes
    .replace(/^\s*[-*+]\s+/gm, '')              // bullets
    .replace(/^\s*[:|\s-]+\s*$/gm, '')          // table separator rows
    .replace(/\|/g, ', ')                       // table cells -> pauses
    .replace(/[*_~]/g, '')                      // emphasis marks
    .replace(/\r/g, '')
    .replace(/\n{2,}/g, '. ')                   // paragraph breaks -> sentence pause
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Break into short chunks (per sentence, capped) so long lessons speak reliably
// and pause/resume stays responsive.
function chunk(text, size = 220) {
  const sentences = text.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) || [text];
  const out = []; let cur = '';
  for (const s of sentences) {
    if ((cur + s).length > size && cur) { out.push(cur.trim()); cur = ''; }
    cur += s + ' ';
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

export default function LessonListen({ text }) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [state, setState] = useState('idle'); // idle | playing | paused
  const keepAlive = useRef(null);

  // Warm up the (async-loading) voice list.
  useEffect(() => { if (supported) window.speechSynthesis.getVoices(); }, [supported]);

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    if (keepAlive.current) { clearInterval(keepAlive.current); keepAlive.current = null; }
    setState('idle');
  }, [supported]);

  // Stop narration when the lesson changes or the page unmounts.
  useEffect(() => { stop(); return stop; }, [text, stop]);

  const play = useCallback(() => {
    if (!supported) return;
    if (state === 'paused') { window.speechSynthesis.resume(); setState('playing'); return; }
    const parts = chunk(toPlainText(text));
    if (parts.length === 0) return;
    window.speechSynthesis.cancel();
    const voice = bestVoice();
    let remaining = parts.length;
    for (const p of parts) {
      const u = new SpeechSynthesisUtterance(p);
      if (voice) u.voice = voice;
      u.rate = 1.0; u.pitch = 1.0;
      u.onend = () => { remaining -= 1; if (remaining <= 0) stop(); };
      window.speechSynthesis.speak(u);
    }
    setState('playing');
    // Nudge past the Chrome "stops speaking after ~15s" bug on long content.
    keepAlive.current = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) window.speechSynthesis.resume();
    }, 9000);
  }, [supported, state, text, stop]);

  const pause = useCallback(() => { if (supported) window.speechSynthesis.pause(); setState('paused'); }, [supported]);

  if (!supported) return null;

  return (
    <div className="flex items-center gap-1.5">
      <button onClick={state === 'playing' ? pause : play}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
        title={state === 'idle' ? 'Listen to this lesson' : state === 'playing' ? 'Pause' : 'Resume'}>
        {state === 'playing' ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        {state === 'playing' ? 'Pause' : state === 'paused' ? 'Resume' : 'Listen'}
      </button>
      {state !== 'idle' && (
        <button onClick={stop} title="Stop" className="p-1.5 rounded-lg text-nobus-300 hover:bg-white/10">
          <Square className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
