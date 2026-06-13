import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Story, MemorySpace } from '../types';

interface SpaceDossierProps {
  story: Story;
  space: MemorySpace;
  narratorColor: string;
  onEnter: () => void;
}

const NARRATOR_INITIALS: Record<string, string> = {
  LTK: 'LTK',
  Essy: 'ES',
  Trang: 'TR',
};

const NARRATOR_FULLNAME: Record<string, string> = {
  LTK: 'L.T.K',
  Essy: 'Essy N.',
  Trang: 'Trang P.',
};

// Typewriter effect hook
function useTypewriter(text: string, speed = 28, startDelay = 0) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(interval);
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);
  return displayed;
}

export function SpaceDossier({ story, space, narratorColor, onEnter }: SpaceDossierProps) {
  const [phase, setPhase] = useState<'stamp' | 'content' | 'ready'>('stamp');
  const [bioVisible, setBioVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('content'), 800);
    const t2 = setTimeout(() => { setPhase('ready'); setBioVisible(true); }, 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const initials = NARRATOR_INITIALS[story.narrator] ?? story.narrator.slice(0, 2).toUpperCase();
  const fullname = NARRATOR_FULLNAME[story.narrator] ?? story.narrator;
  const bio = space.narratorBio ?? [];

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: 'rgba(4,3,2,0.96)', backdropFilter: 'blur(4px)' }}
    >
      {/* Subtle kraft paper noise */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      {/* Corner evidence tape accents */}
      <div className="absolute top-0 left-0 w-32 h-1.5 opacity-40" style={{ background: `linear-gradient(90deg, ${narratorColor}, transparent)` }} />
      <div className="absolute bottom-0 right-0 w-32 h-1.5 opacity-40" style={{ background: `linear-gradient(270deg, ${narratorColor}, transparent)` }} />

      <motion.div
        className="relative w-full max-w-sm mx-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Case file folder top tab */}
        <div
          className="absolute -top-8 left-6 px-4 py-1.5 rounded-t-lg"
          style={{ background: `${narratorColor}22`, border: `1px solid ${narratorColor}33`, borderBottom: 'none' }}
        >
          <p className="font-mono text-[8px] uppercase tracking-[0.2em]" style={{ color: narratorColor }}>
            Hồ sơ nhân chứng
          </p>
        </div>

        {/* Main card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(14,11,8,0.95)',
            border: `1px solid ${narratorColor}28`,
            boxShadow: `0 0 60px ${narratorColor}18, 0 24px 48px rgba(0,0,0,0.6)`,
          }}
        >
          {/* Color bar */}
          <div className="h-0.5 w-full" style={{ background: narratorColor }} />

          <div className="p-6">
            {/* Header row */}
            <div className="flex items-start gap-4 mb-5">
              {/* Avatar circle */}
              <div className="flex-shrink-0 relative">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: `${narratorColor}18`, border: `1.5px solid ${narratorColor}44` }}
                >
                  <span className="font-mono text-xs font-bold" style={{ color: narratorColor }}>
                    {initials}
                  </span>
                </div>
                {/* ACTIVE WITNESS badge */}
                <div
                  className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-full"
                  style={{ background: '#c0392b', border: '1px solid #e74c3c33' }}
                >
                  <p className="font-mono text-[7px] uppercase tracking-wider text-red-100 leading-none">live</p>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-mono text-[8px] uppercase tracking-[0.22em] mb-0.5 opacity-40 text-amber-200">
                  nhân chứng số {story.spaces.findIndex(s => s.id === space.id) + 1} · {story.narrator}
                </p>
                <h2 className="font-serif text-xl font-bold text-amber-50/95 leading-tight">
                  {fullname}
                </h2>
                <p className="font-mono text-[9px] mt-1 tracking-wider" style={{ color: narratorColor, opacity: 0.8 }}>
                  {story.title}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px mb-4 opacity-10" style={{ background: narratorColor }} />

            {/* Location */}
            <div
              className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl"
              style={{ background: `${narratorColor}0d`, border: `1px solid ${narratorColor}1a` }}
            >
              <svg width="10" height="12" viewBox="0 0 10 12" fill={narratorColor} opacity="0.7">
                <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 7 5 7s5-3.25 5-7c0-2.76-2.24-5-5-5zm0 6.5C4.17 6.5 3.5 5.83 3.5 5S4.17 3.5 5 3.5 6.5 4.17 6.5 5 5.83 6.5 5 6.5z" />
              </svg>
              <span className="font-serif text-sm font-semibold text-amber-50/90">{space.label}</span>
              <span className="font-mono text-[8px] text-amber-200/30 ml-auto">· {space.sublabel}</span>
            </div>

            {/* Bio bullets - typewriter style */}
            <motion.div
              className="space-y-2.5 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: bioVisible ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            >
              {bio.map((line, i) => (
                <motion.div
                  key={i}
                  className="flex gap-2.5 items-start"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: bioVisible ? 1 : 0, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.35 }}
                >
                  <span className="flex-shrink-0 w-1 h-1 rounded-full mt-1.5" style={{ background: narratorColor, opacity: 0.6 }} />
                  <p className="font-serif text-sm text-amber-50/65 leading-relaxed">{line}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Clue count strip */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex gap-1">
                {space.clues.map((_, i) => (
                  <div
                    key={i}
                    className="w-5 h-1 rounded-full opacity-30"
                    style={{ background: narratorColor }}
                  />
                ))}
              </div>
              <p className="font-mono text-[8px] uppercase tracking-wider text-amber-200/30">
                {space.clues.length} mảnh ký ức cần tìm
              </p>
            </div>

            {/* Enter button */}
            <motion.button
              onClick={onEnter}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-serif text-sm font-semibold tracking-wide transition-all duration-200 active:scale-95"
              style={{ background: narratorColor, color: '#08050d' }}
              whileHover={{ scale: 1.015 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: phase === 'ready' ? 1 : 0, y: phase === 'ready' ? 0 : 8 }}
              transition={{ duration: 0.4 }}
            >
              Bắt đầu điều tra
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M7.293 1.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L10.586 8H2a1 1 0 110-2h8.586L7.293 2.707a1 1 0 010-1.414z" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Case number bottom */}
        <p className="text-center font-mono text-[8px] uppercase tracking-[0.25em] text-amber-200/20 mt-3">
          Ký Ức Hà Nội · CAS3020 · {space.id.toUpperCase()}
        </p>
      </motion.div>
    </div>
  );
}
