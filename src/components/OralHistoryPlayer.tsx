import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Subtitle {
  start: number;
  end: number;
  text: string;
}

interface OralHistoryPlayerProps {
  audioEl: HTMLAudioElement;      // already created + playing — we just display/control it
  narratorName: string;
  narratorColor: string;
  paused?: boolean;               // external pause request (clue modal open)
  storyId: string;                // story narrator ID (trang, essy, thai-thinh)
}

function parseSRT(content: string): Subtitle[] {
  const items: Subtitle[] = [];
  const blocks = content.trim().split(/\r?\n\s*\r?\n/);
  
  for (const block of blocks) {
    const lines = block.split(/\r?\n/);
    if (lines.length >= 3) {
      const timeLine = lines[1];
      const match = timeLine.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);
      if (match) {
        const start = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]) + parseInt(match[4]) / 1000;
        const end = parseInt(match[5]) * 3600 + parseInt(match[6]) * 60 + parseInt(match[7]) + parseInt(match[8]) / 1000;
        const text = lines.slice(2).join(' ').replace(/\s+/g, ' ').trim();
        items.push({ start, end, text });
      }
    }
  }
  return items;
}

export function OralHistoryPlayer({ audioEl, narratorName, narratorColor, paused = false, storyId }: OralHistoryPlayerProps) {
  const [playing, setPlaying] = useState(!audioEl.paused);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  
  // Subtitle states
  const [subLanguage, setSubLanguage] = useState<'vn' | 'en' | 'off'>('en'); // Default to English subtitles
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [currentSubText, setCurrentSubText] = useState('');
  
  const subtitlesRef = useRef<Subtitle[]>([]);

  useEffect(() => {
    subtitlesRef.current = subtitles;
  }, [subtitles]);

  // Map storyId to subtitle filename prefix
  const subKey = (() => {
    if (storyId === 'trang') return 'thanh-cong';
    if (storyId === 'essy') return 'hoang-hoa-tham';
    if (storyId === 'thai-thinh') return 'trung-liet';
    return '';
  })();

  // Fetch subtitles file on language or narrator change
  useEffect(() => {
    if (subLanguage === 'off' || !subKey) {
      setSubtitles([]);
      setCurrentSubText('');
      return;
    }

    const langSuffix = subLanguage === 'en' ? 'eng' : 'vie';
    const srtUrl = `/subtitles/${subKey}-${langSuffix}.srt`;

    fetch(srtUrl)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(text => {
        const parsed = parseSRT(text);
        setSubtitles(parsed);
      })
      .catch(err => {
        console.error("Failed to load subtitles:", srtUrl, err);
        setSubtitles([]);
        setCurrentSubText('');
      });
  }, [subKey, subLanguage]);

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
      if (el.duration) setProgress(el.currentTime / el.duration);
      
      // Sync subtitles
      const time = el.currentTime;
      const active = subtitlesRef.current.find(s => time >= s.start && time <= s.end);
      setCurrentSubText(active ? active.text : '');
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

  const cycleLanguage = () => {
    setSubLanguage(prev => {
      if (prev === 'en') return 'vn';
      if (prev === 'vn') return 'off';
      return 'en';
    });
  };

  const isSpinning = playing && !paused;

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="absolute bottom-4 left-4 z-40 select-none"
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.9 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <div
            role="button"
            tabIndex={0}
            aria-label={isSpinning ? 'Tạm dừng lời kể' : 'Phát lời kể'}
            onClick={toggle}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
            className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left transition-all active:scale-95 cursor-pointer"
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

            {/* Subtitle Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Avoid play/pause toggle
                cycleLanguage();
              }}
              className="flex-shrink-0 px-2.5 py-2 min-w-[44px] min-h-[44px] rounded-lg text-[10px] font-mono border transition-all active:scale-90 hover:bg-white/5 font-semibold text-center select-none uppercase tracking-wider flex items-center justify-center"
              style={{
                borderColor: `${narratorColor}44`,
                color: narratorColor,
                background: subLanguage !== 'off' ? `${narratorColor}15` : 'transparent',
              }}
              title="Chuyển đổi phụ đề"
            >
              {subLanguage === 'en' ? 'Sub: EN' : subLanguage === 'vn' ? 'Sub: VN' : 'Sub: Tắt'}
            </button>

            {/* Play/pause */}
            <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors" style={{ background: `${narratorColor}22` }}>
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
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Subtitles Render Box */}
      {currentSubText && subLanguage !== 'off' && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 max-w-[85%] md:max-w-2xl text-center pointer-events-none select-none">
          <div 
            className="bg-black/80 backdrop-blur-md px-4 py-2.5 rounded-xl border shadow-2xl text-white font-serif text-sm md:text-base leading-relaxed"
            style={{ borderColor: `${narratorColor}33`, boxShadow: `0 8px 32px rgba(0,0,0,0.4)` }}
          >
            {currentSubText}
          </div>
        </div>
      )}
    </>
  );
}
