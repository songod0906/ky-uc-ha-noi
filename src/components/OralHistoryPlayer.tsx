import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface OralHistoryPlayerProps {
  audioEl: HTMLAudioElement;      // already created + playing — we just display/control it
  narratorName: string;
  narratorColor: string;
  paused?: boolean;               // external pause request (clue modal open)
}

export function OralHistoryPlayer({ audioEl, narratorName, narratorColor, paused = false }: OralHistoryPlayerProps) {
  const [playing, setPlaying] = useState(!audioEl.paused);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!document.getElementById('oral-spin-style')) {
      const s = document.createElement('style');
      s.id = 'oral-spin-style';
      s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    const el = audioEl;

    const onPlay    = () => setPlaying(true);
    const onPause   = () => setPlaying(false);
    const onReady   = () => setReady(true);
    const onTimeUpdate = () => {
      const startSec = el.currentTime; // approximate — we don't have startSec here but that's fine for bar
      if (el.duration) setProgress(el.currentTime / el.duration);
    };

    el.addEventListener('play',       onPlay);
    el.addEventListener('pause',      onPause);
    el.addEventListener('canplay',    onReady);
    el.addEventListener('timeupdate', onTimeUpdate);

    // If already past canplay
    if (el.readyState >= 3) setReady(true);
    setPlaying(!el.paused);

    return () => {
      el.removeEventListener('play',       onPlay);
      el.removeEventListener('pause',      onPause);
      el.removeEventListener('canplay',    onReady);
      el.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [audioEl]);

  // External pause (e.g. clue modal)
  useEffect(() => {
    if (paused) audioEl.pause();
    else audioEl.play().catch(() => {});
  }, [paused, audioEl]);

  const toggle = () => {
    if (playing) audioEl.pause();
    else audioEl.play().catch(() => {});
  };

  const isSpinning = playing && !paused;

  return (
    <AnimatePresence>
      <motion.div
        className="absolute bottom-4 left-4 z-40 select-none"
        initial={{ opacity: 0, y: 12, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.9 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <button
          onClick={toggle}
          className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left transition-all active:scale-95"
          style={{
            background: 'rgba(8, 6, 4, 0.82)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${narratorColor}33`,
            boxShadow: `0 0 18px ${narratorColor}18`,
          }}
        >
          {/* Cassette reel icon */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke={narratorColor} strokeWidth="1" opacity="0.3" />
            <circle cx="10" cy="10" r="5.5" stroke={narratorColor} strokeWidth="1.2" />
            <circle cx="10" cy="10" r="1.8" fill={narratorColor} />
            {[0, 72, 144, 216, 288].map((deg) => (
              <line
                key={deg}
                x1="10" y1="10"
                x2={10 + 3.4 * Math.cos((deg * Math.PI) / 180)}
                y2={10 + 3.4 * Math.sin((deg * Math.PI) / 180)}
                stroke={narratorColor}
                strokeWidth="1.2"
                opacity="0.6"
                style={isSpinning ? {
                  transformOrigin: '10px 10px',
                  animation: 'spin 1.6s linear infinite',
                  animationDelay: `${-deg / 360}s`,
                } : {}}
              />
            ))}
          </svg>

          <div className="min-w-0">
            <p className="font-mono text-[8px] uppercase tracking-[0.18em] mb-0.5" style={{ color: narratorColor, opacity: 0.65 }}>
              {isSpinning ? 'đang phát' : 'đã dừng'}
            </p>
            <p className="font-serif text-xs font-semibold text-amber-50/85 leading-none">
              {narratorName} · kể chuyện
            </p>
            <div className="mt-1.5 w-24 h-0.5 rounded-full overflow-hidden" style={{ background: `${narratorColor}22` }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(2, progress * 100)}%`, background: narratorColor }}
              />
            </div>
          </div>

          {/* Play/pause */}
          <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${narratorColor}22` }}>
            {isSpinning ? (
              <svg width="8" height="10" viewBox="0 0 8 10" fill={narratorColor}>
                <rect x="0" y="0" width="2.5" height="10" rx="1" />
                <rect x="5.5" y="0" width="2.5" height="10" rx="1" />
              </svg>
            ) : (
              <svg width="9" height="10" viewBox="0 0 9 10" fill={narratorColor}>
                <path d="M0 0L9 5 0 10V0Z" />
              </svg>
            )}
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
