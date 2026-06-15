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

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function OralHistoryPlayer({ audioEl, narratorName, narratorColor, paused = false, storyId }: OralHistoryPlayerProps) {
  const [playing, setPlaying] = useState(!audioEl.paused);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  
  // Subtitle states
  const [subLanguage, setSubLanguage] = useState<'vn' | 'en' | 'off'>('en'); // Default to English subtitles
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [currentSubText, setCurrentSubText] = useState('');
  
  // Interactive Transcript states
  const [showTranscript, setShowTranscript] = useState(false);
  const [lastActiveLanguage, setLastActiveLanguage] = useState<'en' | 'vn'>('en');
  const [activeSubIndex, setActiveSubIndex] = useState<number>(-1);
  
  const subtitlesRef = useRef<Subtitle[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    subtitlesRef.current = subtitles;
  }, [subtitles]);

  // Sync last active language when user changes it
  useEffect(() => {
    if (subLanguage !== 'off') {
      setLastActiveLanguage(subLanguage);
    }
  }, [subLanguage]);

  // Map storyId to subtitle filename prefix
  const subKey = (() => {
    if (storyId === 'trang') return 'thanh-cong';
    if (storyId === 'essy') return 'hoang-hoa-tham';
    if (storyId === 'thai-thinh') return 'trung-liet';
    return '';
  })();

  // Fetch subtitles file on language or narrator change
  useEffect(() => {
    if (!subKey) {
      setSubtitles([]);
      setCurrentSubText('');
      return;
    }

    // Load either active subLanguage or fallback to lastActiveLanguage so transcript is populated
    const lang = subLanguage === 'off' ? lastActiveLanguage : subLanguage;
    const langSuffix = lang === 'en' ? 'eng' : 'vie';
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
  }, [subKey, subLanguage, lastActiveLanguage]);

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
      
      // Sync subtitles and index
      const time = el.currentTime;
      const index = subtitlesRef.current.findIndex(s => time >= s.start && time <= s.end);
      setActiveSubIndex(index);
      setCurrentSubText(index !== -1 ? subtitlesRef.current[index].text : '');
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

  // Auto-scroll active line into view smoothly
  useEffect(() => {
    if (showTranscript && activeSubIndex !== -1 && listRef.current) {
      const activeEl = listRef.current.children[activeSubIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [activeSubIndex, showTranscript]);

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

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Avoid triggering the parent div's play/pause toggle
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newProgress = Math.max(0, Math.min(1, clickX / width));
    if (audioEl && audioEl.duration) {
      audioEl.currentTime = newProgress * audioEl.duration;
      setProgress(newProgress);
    }
  };

  const isSpinning = playing && !paused;

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="absolute bottom-4 left-4 z-[80] select-none"
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.9 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          {/* Transcript Panel (Slide up from above the player widget) */}
          <AnimatePresence>
            {showTranscript && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="absolute bottom-full left-0 mb-3 w-80 rounded-2xl p-3 border text-white z-[81]"
                style={{
                  background: 'rgba(8, 6, 4, 0.92)',
                  backdropFilter: 'blur(16px)',
                  borderColor: `${narratorColor}33`,
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), inset 0 0 16px rgba(255,255,255,0.02)',
                }}
              >
                {/* Transcript Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <h3 className="font-serif text-[11px] font-bold text-amber-50/90 flex items-center gap-1.5 uppercase tracking-wide">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={narratorColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Transcript
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSubLanguage('en');
                      }}
                      className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold transition-all border ${
                        subLanguage === 'en' || (subLanguage === 'off' && lastActiveLanguage === 'en')
                          ? 'text-black border-transparent font-extrabold'
                          : 'text-white/40 border-white/10 hover:bg-white/5 hover:text-white/70'
                      }`}
                      style={(subLanguage === 'en' || (subLanguage === 'off' && lastActiveLanguage === 'en')) ? { background: narratorColor } : {}}
                    >
                      EN
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSubLanguage('vn');
                      }}
                      className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold transition-all border ${
                        subLanguage === 'vn' || (subLanguage === 'off' && lastActiveLanguage === 'vn')
                          ? 'text-black border-transparent font-extrabold'
                          : 'text-white/40 border-white/10 hover:bg-white/5 hover:text-white/70'
                      }`}
                      style={(subLanguage === 'vn' || (subLanguage === 'off' && lastActiveLanguage === 'vn')) ? { background: narratorColor } : {}}
                    >
                      VN
                    </button>
                  </div>
                </div>
                
                {/* Scrollable list */}
                <div 
                  ref={listRef}
                  className="overflow-y-auto pr-1 text-left flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-white/10 scroll-smooth"
                  style={{ maxHeight: '200px' }}
                >
                  {subtitles.length === 0 ? (
                    <p className="text-white/30 text-[10px] font-serif py-6 text-center italic">Loading transcript...</p>
                  ) : (
                    subtitles.map((sub, idx) => {
                      const isActive = idx === activeSubIndex;
                      const formattedTime = formatTime(sub.start);
                      return (
                        <div
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            audioEl.currentTime = sub.start;
                            if (audioEl.paused) {
                              audioEl.play().catch(() => {});
                            }
                          }}
                          className={`p-2 rounded-lg cursor-pointer transition-all hover:bg-white/5 text-[11px] font-serif leading-relaxed ${
                            isActive ? 'bg-white/10 border-l-2' : ''
                          }`}
                          style={{
                            borderLeftColor: isActive ? narratorColor : 'transparent',
                            color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                            boxShadow: isActive ? `inset 0 0 8px ${narratorColor}15` : 'none',
                          }}
                        >
                          <span className="font-mono text-[8px] block opacity-40 mb-0.5" style={isActive ? { color: narratorColor, opacity: 0.8 } : {}}>{formattedTime}</span>
                          <p className={isActive ? 'font-medium' : ''}>{sub.text}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Player Widget Bar */}
          <div
            role="button"
            tabIndex={0}
            aria-label={isSpinning ? 'Pause narration' : 'Play narration'}
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
                {isSpinning ? 'playing' : 'paused'}
              </p>
              <p className="font-serif text-xs font-semibold text-amber-50/85 leading-none">
                {narratorName} · narration
              </p>
              {/* Interactive Seek Bar */}
              <div 
                onClick={handleSeek}
                className="mt-2 w-28 h-1 rounded-full cursor-pointer relative group/seek"
                style={{ background: `${narratorColor}22` }}
                title="Click to seek"
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.max(2, progress * 100)}%`, background: narratorColor }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full opacity-0 group-hover/seek:opacity-100 transition-opacity"
                  style={{ left: `calc(${progress * 100}% - 4px)`, background: narratorColor }}
                />
              </div>
            </div>

            {/* Transcript Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Avoid play/pause toggle
                setShowTranscript(prev => !prev);
              }}
              className="flex-shrink-0 w-8 h-8 rounded-lg border transition-all active:scale-90 hover:bg-white/5 flex items-center justify-center"
              style={{
                borderColor: `${narratorColor}44`,
                color: narratorColor,
                background: showTranscript ? `${narratorColor}25` : 'transparent',
              }}
              title="View transcript / translation"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <circle cx="3" cy="6" r="1"></circle>
                <circle cx="3" cy="12" r="1"></circle>
                <circle cx="3" cy="18" r="1"></circle>
              </svg>
            </button>

            {/* Subtitle Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Avoid play/pause toggle
                cycleLanguage();
              }}
              className="flex-shrink-0 px-2 py-1.5 min-w-[38px] rounded-lg text-[9px] font-mono border transition-all active:scale-90 hover:bg-white/5 font-semibold text-center select-none uppercase tracking-wider flex items-center justify-center"
              style={{
                borderColor: `${narratorColor}44`,
                color: narratorColor,
                background: subLanguage !== 'off' ? `${narratorColor}15` : 'transparent',
              }}
              title="Toggle subtitles"
            >
              {subLanguage === 'en' ? 'Sub: EN' : subLanguage === 'vn' ? 'Sub: VN' : 'Sub: Off'}
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
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[80] max-w-[85%] md:max-w-2xl text-center pointer-events-none select-none">
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

