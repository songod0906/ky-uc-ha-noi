import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Story, MemorySpace } from '../types';

interface SpaceDossierProps {
  story: Story;
  space: MemorySpace;
  narratorColor: string;
  onEnter: () => void;
}

// Side label color per narrator — warm tones, hand-sticker feeling
const SIDE_LABEL: Record<string, string> = {
  LTK:   'A',
  Essy:  'B',
  Trang: 'C',
};

// One evocative line per space — pulled from the oral history transcripts
// This is the cassette label "title" — intimate, not clinical
const SPACE_TAGLINE: Record<string, string> = {
  'cong-truong':       'School drum sounding while eating lemon ice cream at the gate',
  'quan-net':          'Our family ran a net café. An amazing childhood.',
  'ho-thanh-cong':     'People from Thanh Cong never enter through the main gate',
  'nha-ngo':           'Turning three or four times to enter. Grab drivers get lost.',
  'gieng-khu-choi':    'At the end of the alley lies a well — known only to locals',
  'nha-hoc-them':      'The street used to be a ditch, not a single car',
  'san-choi-tap-the':  'Passed by countless times — never allowed to enter',
  'quan-oc-violin':    'Hearing the violin for the first time at a snail stall',
};

export function SpaceDossier({ story, space, narratorColor, onEnter }: SpaceDossierProps) {
  const [reelsSpinning, setReelsSpinning] = useState(false);

  useEffect(() => {
    if (!document.getElementById('cassette-spin-style')) {
      const s = document.createElement('style');
      s.id = 'cassette-spin-style';
      s.textContent = `
        @keyframes reelSpin { to { transform: rotate(360deg); } }
        @keyframes reelSpinR { to { transform: rotate(-360deg); } }
        @keyframes tapeFeed { 0%,100% { opacity:0.25; } 50% { opacity:0.55; } }
      `;
      document.head.appendChild(s);
    }
  }, []);

  const handlePlay = () => {
    if (reelsSpinning) return;
    setReelsSpinning(true);
    setTimeout(() => onEnter(), 1400);
  };

  const side = SIDE_LABEL[story.narrator] ?? 'A';
  const tagline = SPACE_TAGLINE[space.id] ?? space.sublabel;
  const year = '2026';

  return (
    <div
      className="flex-1 flex items-center justify-center relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #1a1410 0%, #0a0806 100%)' }}
    >
      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      <motion.div
        className="flex flex-col items-center gap-8 px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Cassette tape body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -3 }}
        >
          {/* Outer shell */}
          <div
            className="relative rounded-xl overflow-hidden shadow-2xl"
            style={{
              width: 300,
              height: 188,
              background: 'linear-gradient(160deg, #2a2520 0%, #1c1814 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: `0 24px 60px rgba(0,0,0,0.7), 0 0 40px ${narratorColor}12`,
            }}
          >
            {/* Top screw holes */}
            {[-1, 1].map((side) => (
              <div
                key={side}
                className="absolute top-3"
                style={{ [side === -1 ? 'left' : 'right']: 12 }}
              >
                <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)' }} />
              </div>
            ))}

            {/* Label sticker */}
            <div
              className="absolute inset-x-4 top-5 bottom-14 rounded-md overflow-hidden"
              style={{
                background: 'linear-gradient(170deg, #f5eedd 0%, #ede0c8 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              {/* Colored stripe */}
              <div className="h-2 w-full" style={{ background: narratorColor }} />

              <div className="px-3 pt-2 pb-1">
                {/* Side + narrator */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="font-mono text-[9px] uppercase tracking-[0.25em] font-bold"
                    style={{ color: narratorColor }}
                  >
                    SIDE {side}
                  </span>
                  <span className="font-mono text-[8px] text-stone-500 tracking-widest">{year}</span>
                </div>

                {/* Location name — biggest text on label */}
                <p className="font-serif text-base font-bold text-stone-800 leading-tight mb-0.5">
                  {space.label}
                </p>
                <p className="font-mono text-[8px] text-stone-500 uppercase tracking-wider mb-2">
                  {story.narrator} · {story.title}
                </p>

                {/* Tagline — handwritten feel */}
                <p
                  className="text-[10px] text-stone-600 leading-snug italic"
                  style={{ fontFamily: "'Noto Serif', serif" }}
                >
                  "{tagline}"
                </p>
              </div>

              {/* Tape time marks */}
              <div className="absolute bottom-1.5 right-3 flex gap-1.5 items-center">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="w-4 h-0.5 rounded-full bg-stone-400/40" />
                ))}
              </div>
            </div>

            {/* Tape window */}
            <div
              className="absolute bottom-3 inset-x-4 h-10 rounded"
              style={{ background: '#0d0a08', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              {/* Tape strip */}
              <div
                className="absolute inset-y-1 left-[42px] right-[42px] rounded-sm"
                style={{
                  background: 'rgba(40,30,20,0.9)',
                  animation: reelsSpinning ? 'tapeFeed 0.5s ease-in-out infinite' : 'none',
                }}
              />

              {/* Left reel */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8">
                <div
                  className="w-full h-full rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(35,28,22,0.95)',
                    border: `1.5px solid ${narratorColor}40`,
                    transformOrigin: 'center',
                    animation: reelsSpinning ? 'reelSpin 0.7s linear infinite' : 'none',
                  }}
                >
                  {/* Spokes */}
                  {[0, 60, 120].map(deg => (
                    <div key={deg} className="absolute" style={{
                      width: 10, height: 1.5,
                      background: narratorColor,
                      opacity: 0.5,
                      transformOrigin: '0 50%',
                      transform: `translateY(-50%) rotate(${deg}deg)`,
                      left: '50%', top: '50%',
                    }} />
                  ))}
                  <div className="w-2 h-2 rounded-full" style={{ background: narratorColor, opacity: 0.7 }} />
                </div>
              </div>

              {/* Right reel */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8">
                <div
                  className="w-full h-full rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(35,28,22,0.95)',
                    border: `1.5px solid ${narratorColor}40`,
                    transformOrigin: 'center',
                    animation: reelsSpinning ? 'reelSpinR 0.9s linear infinite' : 'none',
                  }}
                >
                  {[0, 60, 120].map(deg => (
                    <div key={deg} className="absolute" style={{
                      width: 10, height: 1.5,
                      background: narratorColor,
                      opacity: 0.5,
                      transformOrigin: '0 50%',
                      transform: `translateY(-50%) rotate(${deg}deg)`,
                      left: '50%', top: '50%',
                    }} />
                  ))}
                  <div className="w-2 h-2 rounded-full" style={{ background: narratorColor, opacity: 0.7 }} />
                </div>
              </div>

              {/* Capstans */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-3">
                {[-1, 0, 1].map(i => (
                  <div key={i} className="w-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Below cassette: clue count + play button */}
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-amber-200/30">
            {space.clues.length} memory fragments · {story.title}
          </p>

          <button
            onClick={handlePlay}
            disabled={reelsSpinning}
            className="flex items-center gap-3 px-7 py-3 rounded-2xl font-serif text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-60"
            style={{
              background: reelsSpinning ? `${narratorColor}22` : narratorColor,
              color: reelsSpinning ? narratorColor : '#0a0806',
              border: `1px solid ${narratorColor}`,
            }}
          >
            {reelsSpinning ? (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <rect x="1" y="1" width="4" height="10" rx="1.5" />
                  <rect x="7" y="1" width="4" height="10" rx="1.5" />
                </svg>
                Playing...
              </>
            ) : (
              <>
                <svg width="11" height="13" viewBox="0 0 11 13" fill="currentColor">
                  <path d="M0 0L11 6.5 0 13V0Z" />
                </svg>
                Play cassette to enter
              </>
            )}
          </button>

          {/* Bio bullets — shown below the tape, smaller and secondary */}
          {space.narratorBio && (
            <div className="flex flex-col gap-1.5 max-w-xs text-center mt-1">
              {space.narratorBio.map((line, i) => (
                <p key={i} className="font-serif text-[11px] text-amber-200/35 leading-snug">
                  {line}
                </p>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
