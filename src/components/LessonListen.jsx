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

// Strip markdown to readable prose, line by line. Crucially, headings, list
// items and table rows have no terminal punctuation, so we add a full stop to
// any line that lacks one - otherwise the voice runs each line into the next
// with no pause and sounds like it ignores punctuation.
function toPlainText(md) {
  const src = (md || '').replace(/```[\s\S]*?```/g, '\n').replace(/\r/g, '');
  const out = [];
  for (const raw of src.split('\n')) {
    let line = raw
      .replace(/`([^`]+)`/g, '$1')             // inline code
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')   // images
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> link text
      .replace(/^\s{0,3}#{1,6}\s*/, '')        // headings
      .replace(/^\s*>\s?/, '')                 // blockquotes
      .replace(/^\s*[-*+]\s+/, '')             // bullets
      .replace(/\|/g, ', ')                    // table cells -> comma pauses
      .replace(/[*_~]/g, '')                   // emphasis marks
      .replace(/^[,\s]+|[,\s]+$/g, '')         // trim stray commas/space (table edges)
      .trim();
    if (!line || /^[-:,\s]+$/.test(line)) continue; // blank or table separator row
    if (!/[.!?:;]$/.test(line)) line += '.';        // give every line a pause
    out.push(line);
  }
  return out.join(' ').replace(/\s+([,.])/g, '$1').replace(/\s{2,}/g, ' ').trim();
}

// Group whole sentences into larger chunks so the engine keeps natural prosody
// across commas within each chunk, while staying short enough to speak reliably.
function chunk(text, size = 500) {
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)|\S[^.!?]*$/g) || [text];
  const out = []; let cur = '';
  for (const s of sentences) {
    if ((cur + s).length > size && cur) { out.push(cur.trim()); cur = ''; }
    cur += s;
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
