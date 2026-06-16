import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OralHistoryAudio } from '../utils/OralHistoryAudio';

interface SubtitleCue {
  start: number;
  end: number;
  text: string;
}

function parseSrt(raw: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  for (const block of raw.trim().split(/\n\n+/)) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;
    const m = lines[1].match(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3}) --> (\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
    );
    if (!m) continue;
    const sec = (h: string, min: string, s: string, ms: string) =>
      +h * 3600 + +min * 60 + +s + +ms / 1000;
    cues.push({
      start: sec(m[1], m[2], m[3], m[4]),
      end:   sec(m[5], m[6], m[7], m[8]),
      text: lines.slice(2).join(' ').trim(),
    });
  }
  return cues;
}

const SRT_MAP: Record<string, { en: string; vi: string }> = {
  '/audio/oral-history/thanh-cong.m4a':     { en: '/subtitles/thanh-cong-eng.srt',      vi: '/subtitles/thanh-cong-vie.srt' },
  '/audio/oral-history/trung-liet.m4a':     { en: '/subtitles/trung-liet-eng.srt',      vi: '/subtitles/trung-liet-vie.srt' },
  '/audio/oral-history/hoang-hoa-tham.m4a': { en: '/subtitles/hoang-hoa-tham-eng.srt',  vi: '/subtitles/hoang-hoa-tham-vie.srt' },
};

export function SubtitleOverlay({ audioSrc }: { audioSrc: string }) {
  const [lang, setLang]         = useState<'en' | 'vi'>('en');
  const [cues, setCues]         = useState<SubtitleCue[]>([]);
  const [currentText, setText]  = useState('');
  const rafRef                  = useRef<number>(0);

  const paths = SRT_MAP[audioSrc];

  useEffect(() => {
    if (!paths) return;
    fetch(paths[lang]).then(r => r.text()).then(raw => setCues(parseSrt(raw)));
  }, [audioSrc, lang]);

  useEffect(() => {
    if (cues.length === 0) return;
    const tick = () => {
      const el = OralHistoryAudio.current;
      if (el && !el.paused) {
        const t = el.currentTime;
        const hit = cues.find(c => t >= c.start && t <= c.end);
        setText(hit?.text ?? '');
      } else {
        setText('');
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [cues]);

  if (!paths) return null;

  return (
    <div className="absolute bottom-20 left-0 right-0 z-[60] flex flex-col items-center gap-2 px-6 pointer-events-none">
      <AnimatePresence mode="wait">
        {currentText && (
          <motion.p
            key={currentText}
            className="text-center font-serif text-[13px] leading-relaxed text-white/95 max-w-lg px-5 py-2.5 rounded-xl"
            style={{
              background: 'rgba(6,4,2,0.72)',
              backdropFilter: 'blur(8px)',
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            {currentText}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Language toggle — always visible when subtitles are available */}
      <div
        className="flex rounded-lg overflow-hidden pointer-events-auto"
        style={{ background: 'rgba(6,4,2,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {(['en', 'vi'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className="px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors"
            style={{
              color: lang === l ? '#fff' : 'rgba(255,255,255,0.4)',
              background: lang === l ? 'rgba(255,255,255,0.12)' : 'transparent',
            }}
          >
            {l === 'en' ? 'EN' : 'VI'}
          </button>
        ))}
      </div>
    </div>
  );
}
