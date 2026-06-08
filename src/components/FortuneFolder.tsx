/**
 * FortuneFolder — Trò chơi Đông Tây Nam Bắc
 *
 * Correct physical-game mechanic:
 *   1. Player picks a direction  (where do you want to go?)
 *   2. Player picks a free count (any number — the ritual steps)
 *   3. The paper opens/closes that many times
 *   4. Inner panels revealed → player picks one → memory surfaces
 *
 * Directions map to destinations in LTK's neighborhood.
 * Navigation fires after counting finishes (you "arrive"), then
 * the inner panels show what memories are there.
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimate } from 'motion/react';
import type { FortuneReveal } from '../data/fortuneContent';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DirId = 'B' | 'N' | 'Đ' | 'T';

type Phase =
  | 'idle'         // 4 direction flaps visible
  | 'number-pick'  // direction chosen; player selects how many squishes
  | 'counting'     // squish animation playing
  | 'inner'        // inner panels ①②③④ visible
  | 'revealed'     // memory card showing
  | 'closing';     // fading before reset

// ─── Constants ────────────────────────────────────────────────────────────────

const DIRS: Array<{ id: DirId; label: string }> = [
  { id: 'B', label: 'BẮC' },   // top-left
  { id: 'Đ', label: 'ĐÔNG' },  // top-right
  { id: 'T', label: 'TÂY' },   // bottom-left
  { id: 'N', label: 'NAM' },   // bottom-right
];

// Numbers the player can freely choose — matches physical game convention
const PICK_NUMBERS = [3, 4, 5, 6, 7, 8];

// ─── Props ────────────────────────────────────────────────────────────────────

interface FortuneFolderProps {
  /** "DIR-PANEL" → reveal content, e.g. "B-1", "T-3" */
  contentMap: Record<string, FortuneReveal>;
  /** Direction → space ID (null = no navigation). Passed from story config. */
  dirSpaces: Record<string, string | null>;
  /** Called when the player picks an inner panel */
  onReveal?: (dir: DirId, panel: number, content: FortuneReveal) => void;
  /** Called at end of counting, with the destination space ID (or null) */
  onNavigate?: (spaceId: string | null) => void;
  /** Which space is currently active (to show current state) */
  currentSpaceId?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FortuneFolder({
  contentMap,
  dirSpaces,
  onReveal,
  onNavigate,
  currentSpaceId,
}: FortuneFolderProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [selectedDir, setSelectedDir] = useState<DirId | null>(null);
  const [pickedCount, setPickedCount] = useState<number | null>(null);
  const [revealContent, setRevealContent] = useState<FortuneReveal | null>(null);
  const [spellIndex, setSpellIndex] = useState(-1); // which squish we're on

  // Ref mirrors selectedDir so async closures (handleCountPick, handlePanelClick)
  // always read the latest value — avoids React concurrent-mode stale-state bugs.
  const selectedDirRef = useRef<DirId | null>(null);

  // useAnimate gives us imperative control over the paper element's transform
  const [paperScope, animatePaper] = useAnimate();

  // ── Counting animation ──────────────────────────────────────────────────────

  const runCountAnimation = useCallback(
    async (n: number) => {
      if (!paperScope.current) return;
      for (let i = 0; i < n; i++) {
        setSpellIndex(i + 1);

        if (i % 2 === 0) {
          // Horizontal open: stretch wide, flatten tall
          await animatePaper(paperScope.current, { scaleX: 1.2, scaleY: 0.06 }, { duration: 0.11, ease: 'easeInOut' });
          await animatePaper(paperScope.current, { scaleX: 1, scaleY: 1 }, { duration: 0.14, ease: [0.34, 1.56, 0.64, 1] });
        } else {
          // Vertical open: flatten wide, stretch tall
          await animatePaper(paperScope.current, { scaleX: 0.06, scaleY: 1.2 }, { duration: 0.11, ease: 'easeInOut' });
          await animatePaper(paperScope.current, { scaleX: 1, scaleY: 1 }, { duration: 0.14, ease: [0.34, 1.56, 0.64, 1] });
        }

        if (i < n - 1) await new Promise((r) => setTimeout(r, 55));
      }
      setSpellIndex(-1);
    },
    [animatePaper, paperScope],
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleDirClick = useCallback(
    (dir: (typeof DIRS)[number]) => {
      if (phase !== 'idle') return;
      selectedDirRef.current = dir.id;
      setSelectedDir(dir.id);
      setPhase('number-pick');
    },
    [phase],
  );

  const handleCountPick = useCallback(
    async (n: number) => {
      if (!selectedDir || phase !== 'number-pick') return;
      setPickedCount(n);
      setPhase('counting');

      await runCountAnimation(n);

      // After the ritual → navigate to the destination space
      const spaceId = dirSpaces[selectedDir] ?? null;
      onNavigate?.(spaceId);

      // Brief pause for the transition to settle, then reveal inner panels
      await new Promise((r) => setTimeout(r, 280));
      setPhase('inner');
    },
    [selectedDir, phase, runCountAnimation, dirSpaces, onNavigate],
  );

  const handlePanelClick = useCallback(
    (panel: number) => {
      const activeDir = selectedDirRef.current;
      if (!activeDir || phase !== 'inner') return;

      const key = `${activeDir}-${panel}`;
      const content: FortuneReveal = contentMap[key] ?? {
        text: 'Không có gì ở đây...',
        isQuote: false,
      };

      setRevealContent(content);
      setPhase('revealed');
      onReveal?.(activeDir, panel, content);

      // Auto-dismiss after 4.5 s
      setTimeout(() => {
        setPhase('closing');
        setTimeout(() => {
          selectedDirRef.current = null;
          setPhase('idle');
          setSelectedDir(null);
          setPickedCount(null);
          setRevealContent(null);
        }, 400);
      }, 4500);
    },
    [selectedDir, phase, contentMap, onReveal],
  );

  const handleReset = useCallback(() => {
    if (phase === 'inner' || phase === 'revealed' || phase === 'number-pick') {
      selectedDirRef.current = null;
      setPhase('idle');
      setSelectedDir(null);
      setPickedCount(null);
      setRevealContent(null);
    }
  }, [phase]);

  const selectedDirData = DIRS.find((d) => d.id === selectedDir);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center gap-2 select-none">

      {/* ── Paper artifact ── */}
      <div className="relative" style={{ width: 156, height: 156 }}>
        {/*
          paperScope is attached here — useAnimate imperatively drives
          the scaleX/scaleY squish animation during counting.
          The idle breathing is a separate child motion.div.
        */}
        <div ref={paperScope} className="w-full h-full" style={{ willChange: 'transform' }}>

          {/* Idle breathing — only runs when idle or picking a number */}
          <motion.div
            className="w-full h-full"
            animate={
              phase === 'idle' || phase === 'number-pick'
                ? { scale: [1, 1.012, 1] }
                : { scale: 1 }
            }
            transition={
              phase === 'idle' || phase === 'number-pick'
                ? { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0 }
            }
          >
            <AnimatePresence mode="wait">

              {/* ── OUTER PANELS (idle + number-pick + counting) ── */}
              {(phase === 'idle' || phase === 'number-pick' || phase === 'counting') && (
                <motion.div
                  key="outer"
                  className="absolute inset-0"
                  exit={{ opacity: 0, scale: 0.82, transition: { duration: 0.2 } }}
                >
                  {/* Paper base */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(145deg, #f6f1e2 0%, #eee5cb 55%, #e6dbbe 100%)',
                      boxShadow: '0 5px 22px rgba(50,30,5,0.18), 0 1px 4px rgba(50,30,5,0.10)',
                    }}
                  />

                  {/* SVG fold lines */}
                  <svg className="absolute inset-0 pointer-events-none" width="156" height="156" viewBox="0 0 156 156">
                    <line x1="0" y1="0" x2="156" y2="156" stroke="#c4aa82" strokeWidth="0.6" opacity="0.45" />
                    <line x1="156" y1="0" x2="0" y2="156" stroke="#c4aa82" strokeWidth="0.6" opacity="0.45" />
                    <line x1="78" y1="2" x2="78" y2="154" stroke="#c4aa82" strokeWidth="1.4" opacity="0.55" />
                    <line x1="2" y1="78" x2="154" y2="78" stroke="#c4aa82" strokeWidth="1.4" opacity="0.55" />
                    <circle cx="78" cy="78" r="2.5" fill="#c4aa82" opacity="0.5" />
                  </svg>

                  {/* 4 direction buttons */}
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                    {DIRS.map((dir, idx) => {
                      const isSelected = selectedDir === dir.id;
                      const isCurrentDest =
                        currentSpaceId != null &&
                        dirSpaces[dir.id] === currentSpaceId;
                      const corners = [
                        'rounded-tl-sm', 'rounded-tr-sm',
                        'rounded-bl-sm', 'rounded-br-sm',
                      ];
                      return (
                        <motion.button
                          key={dir.id}
                          data-dir={dir.id}
                          onClick={() => handleDirClick(dir)}
                          disabled={phase !== 'idle'}
                          className={`flex items-center justify-center ${corners[idx]} ${
                            phase === 'idle' ? 'cursor-pointer' : 'cursor-default'
                          }`}
                          animate={
                            isSelected
                              ? { backgroundColor: 'rgba(180,148,90,0.22)' }
                              : isCurrentDest && phase === 'idle'
                                ? { backgroundColor: 'rgba(150,180,120,0.12)' }
                                : {}
                          }
                          whileHover={
                            phase === 'idle'
                              ? { backgroundColor: 'rgba(180,148,90,0.10)' }
                              : {}
                          }
                          whileTap={phase === 'idle' ? { scale: 0.93 } : {}}
                          transition={{ duration: 0.15 }}
                        >
                          <div className="flex flex-col items-center gap-0.5">
                            <span
                              style={{
                                fontFamily: "'Noto Serif', 'Times New Roman', serif",
                                fontSize: '9px',
                                fontWeight: 700,
                                letterSpacing: '0.16em',
                                color: isSelected ? '#3a2208' : '#6a4c20',
                                textShadow: '0 1px 2px rgba(255,248,230,0.9)',
                              }}
                            >
                              {dir.label}
                            </span>
                            {/* Dot indicates this direction has a destination */}
                            {dirSpaces[dir.id] != null && (
                              <span
                                style={{
                                  width: 3,
                                  height: 3,
                                  borderRadius: '50%',
                                  background: isCurrentDest ? '#7da86a' : 'rgba(160,130,80,0.4)',
                                  display: 'block',
                                }}
                              />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Idle pulse ring */}
                  {phase === 'idle' && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none rounded-sm"
                      animate={{
                        boxShadow: [
                          '0 0 0 0px rgba(160,120,50,0)',
                          '0 0 0 3px rgba(160,120,50,0.13)',
                          '0 0 0 0px rgba(160,120,50,0)',
                        ],
                      }}
                      transition={{ duration: 2.8, repeat: Infinity, delay: 1.5 }}
                    />
                  )}
                </motion.div>
              )}

              {/* ── INNER PANELS (after counting) ── */}
              {phase === 'inner' && (
                <motion.div
                  key="inner"
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(145deg, #ece4cc 0%, #e2d8bc 50%, #d8ceaa 100%)',
                    boxShadow: '0 7px 28px rgba(50,30,5,0.22), inset 0 1px 3px rgba(255,248,230,0.9)',
                  }}
                  initial={{ scale: 0.25, opacity: 0, rotate: 45 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                >
                  <svg className="absolute inset-0 pointer-events-none z-10" width="156" height="156" viewBox="0 0 156 156">
                    <line x1="78" y1="0" x2="78" y2="156" stroke="#b8a280" strokeWidth="1" />
                    <line x1="0" y1="78" x2="156" y2="78" stroke="#b8a280" strokeWidth="1" />
                  </svg>

                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2" style={{ gap: '1px', background: '#b8a280' }}>
                    {[1, 2, 3, 4].map((n, i) => (
                      <motion.button
                        key={n}
                        data-panel={n}
                        onClick={() => handlePanelClick(n)}
                        className="flex items-center justify-center bg-[#f2eada] hover:bg-[#e8dcca] transition-colors"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.07, type: 'spring', stiffness: 420, damping: 26 }}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.93 }}
                      >
                        <span
                          style={{
                            fontFamily: "'Noto Serif', 'Times New Roman', serif",
                            fontSize: '22px',
                            color: '#5a3e18',
                            textShadow: '0 1px 2px rgba(255,248,220,0.9)',
                          }}
                        >
                          {['①', '②', '③', '④'][i]}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── REVEALED — memory fragment ── */}
              {(phase === 'revealed' || phase === 'closing') && revealContent && (
                <motion.div
                  key="revealed"
                  className="absolute inset-0 flex items-center justify-center p-4"
                  style={{
                    background: 'linear-gradient(145deg, #f8f4e8 0%, #f0e8d4 50%, #ecdfc8 100%)',
                    boxShadow: '0 7px 28px rgba(50,30,5,0.2)',
                  }}
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={phase === 'revealed' ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.88 }}
                  transition={{ duration: 0.28 }}
                >
                  {/* Ruled-paper lines */}
                  <svg className="absolute inset-0 pointer-events-none" width="156" height="156" viewBox="0 0 156 156" preserveAspectRatio="none">
                    {[22, 38, 54, 70, 86, 102, 118, 134].map((y) => (
                      <line key={y} x1="0" y1={y} x2="156" y2={y} stroke="#c8b48a" strokeWidth="0.4" opacity="0.18" />
                    ))}
                  </svg>

                  <div className="relative text-center">
                    <p
                      style={{
                        fontFamily: "'Noto Serif', 'Times New Roman', serif",
                        fontSize: '8.5px',
                        lineHeight: 1.75,
                        color: '#3a2810',
                        fontStyle: revealContent.isQuote ? 'italic' : 'normal',
                      }}
                    >
                      {revealContent.text}
                    </p>
                    {selectedDirData && (
                      <p
                        className="mt-2"
                        style={{
                          fontFamily: "'Noto Serif', serif",
                          fontSize: '7px',
                          letterSpacing: '0.22em',
                          fontWeight: 700,
                          color: '#8a6a30',
                          opacity: 0.45,
                        }}
                      >
                        {selectedDirData.label}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Dismiss × button */}
        <AnimatePresence>
          {(phase === 'inner' || phase === 'revealed' || phase === 'number-pick') && (
            <motion.button
              className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full flex items-center justify-center z-20 text-xs font-bold"
              style={{ background: '#c4aa82', color: '#3a2810', boxShadow: '0 1px 4px rgba(50,30,5,0.2)' }}
              onClick={handleReset}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              whileHover={{ scale: 1.15, backgroundColor: '#b89862' }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            >
              ×
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── NUMBER PICKER — appears below paper after direction click ── */}
      <AnimatePresence>
        {phase === 'number-pick' && selectedDirData && (
          <motion.div
            key="number-pick"
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <p
              style={{
                fontFamily: "'Noto Serif', serif",
                fontSize: '8px',
                color: '#8a7050',
                letterSpacing: '0.12em',
                opacity: 0.75,
              }}
            >
              {selectedDirData.label} — chọn số bước
            </p>
            <div className="flex gap-1.5">
              {PICK_NUMBERS.map((n) => (
                <motion.button
                  key={n}
                  onClick={() => handleCountPick(n)}
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold"
                  style={{
                    fontFamily: "'Noto Serif', serif",
                    fontSize: '10px',
                    background: 'linear-gradient(145deg, #f0e8d4, #e6dcc8)',
                    color: '#5a3e18',
                    boxShadow: '0 2px 8px rgba(50,30,5,0.14), inset 0 1px 2px rgba(255,248,220,0.8)',
                    border: '1px solid rgba(180,148,90,0.3)',
                  }}
                  whileHover={{
                    scale: 1.15,
                    boxShadow: '0 3px 12px rgba(50,30,5,0.22)',
                    backgroundColor: '#e0d4b8',
                  }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (n - 3) * 0.04, type: 'spring', stiffness: 500, damping: 28 }}
                >
                  {n}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom caption ── */}
      <AnimatePresence mode="wait">
        {phase === 'counting' && pickedCount != null && (
          <motion.div
            key="counting-display"
            className="flex items-center gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: pickedCount }).map((_, i) => (
              <motion.span
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: i < spellIndex ? '#6a4c20' : 'rgba(160,130,80,0.3)',
                  display: 'block',
                  transition: 'background 0.1s',
                }}
              />
            ))}
          </motion.div>
        )}

        {phase === 'inner' && (
          <motion.p
            key="inner-hint"
            className="text-center"
            style={{ fontFamily: "'Noto Serif', serif", fontSize: '8px', color: '#8a7050', opacity: 0.6 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
          >
            chọn một ô
          </motion.p>
        )}

        {phase === 'idle' && (
          <motion.p
            key="idle-hint"
            className="text-center"
            style={{ fontFamily: "'Noto Serif', serif", fontSize: '8px', color: '#8a7050', opacity: 0.5 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
          >
            chọn một hướng
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
