import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AudioSegment } from '../types';

interface OralHistoryPlayerProps {
  segment: AudioSegment;
  narratorName: string;
  narratorColor: string;
  paused?: boolean; // external pause (e.g. clue modal open)
}

export function OralHistoryPlayer({ segment, narratorName, narratorColor, paused = false }: OralHistoryPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0); // 0-1

  useEffect(() => {
    if (!document.getElementById('oral-spin-style')) {
      const s = document.createElement('style');
      s.id = 'oral-spin-style';
      s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    const el = new Audio(segment.src);
    el.preload = 'metadata';
    audioRef.current = el;

    const onCanPlay = () => {
      el.currentTime = segment.startSec;
      setReady(true);
      el.play().catch(() => {});
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => {
      if (el.duration) {
        setProgress((el.currentTime - segment.startSec) / (el.duration - segment.startSec));
      }
    };

    el.addEventListener('canplay', onCanPlay);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      el.pause();
      el.removeEventListener('canplay', onCanPlay);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('timeupdate', onTimeUpdate);
      audioRef.current = null;
    };
  }, [segment.src, segment.startSec]);

  // External pause control (e.g. clue modal opens)
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !ready) return;
    if (paused) {
      el.pause();
    } else {
      el.play().catch(() => {});
    }
  }, [paused, ready]);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) el.pause();
    else el.play().catch(() => {});
  };

  // Cassette spools animation
  const SpoolIcon = ({ spin }: { spin: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke={narratorColor} strokeWidth="1.2" opacity="0.4" />
      <circle cx="9" cy="9" r="4.5" stroke={narratorColor} strokeWidth="1.2" />
      <circle cx="9" cy="9" r="1.5" fill={narratorColor} />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <line
          key={i}
          x1="9" y1="9"
          x2={9 + 3.2 * Math.cos((deg * Math.PI) / 180)}
          y2={9 + 3.2 * Math.sin((deg * Math.PI) / 180)}
          stroke={narratorColor}
          strokeWidth="1"
          opacity={spin ? 0.7 : 0.3}
          style={spin ? { transformOrigin: '9px 9px', animation: 'spin 1.4s linear infinite' } : {}}
        />
      ))}
    </svg>
  );

  return (
    <AnimatePresence>
      {ready && (
        <motion.div
          className="absolute bottom-4 left-4 z-40 select-none"
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.9 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <button
            onClick={toggle}
            className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left transition-all active:scale-95"
            style={{
              background: 'rgba(8, 6, 4, 0.82)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${narratorColor}33`,
              boxShadow: `0 0 18px ${narratorColor}22`,
            }}
          >
            {/* Cassette spool */}
            <SpoolIcon spin={playing && !paused} />

            <div className="min-w-0">
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] mb-0.5" style={{ color: narratorColor, opacity: 0.7 }}>
                {playing && !paused ? 'đang kể chuyện' : 'tạm dừng'}
              </p>
              <p className="font-serif text-xs font-semibold text-amber-50/90 leading-none">
                {narratorName} · oral history
              </p>

              {/* Progress tape */}
              <div className="mt-1.5 w-28 h-0.5 rounded-full overflow-hidden" style={{ background: `${narratorColor}22` }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.max(1, progress * 100)}%`, background: narratorColor }}
                />
              </div>
            </div>

            {/* Play/pause icon */}
            <div
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: `${narratorColor}22` }}
            >
              {playing && !paused ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill={narratorColor}>
                  <rect x="1.5" y="1" width="2.5" height="8" rx="1" />
                  <rect x="6" y="1" width="2.5" height="8" rx="1" />
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 10 10" fill={narratorColor}>
                  <path d="M2 1.5L8.5 5 2 8.5V1.5Z" />
                </svg>
              )}
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
