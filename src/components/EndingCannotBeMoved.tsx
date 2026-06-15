import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DiaryEntry, Story } from '../types';
import { AudioSynth } from '../utils/AudioSynth';
import { RotateCcw, FileText, BookOpen } from 'lucide-react';
import { CompassMotif } from './CompassMotif';

interface EndingCannotBeMovedProps {
  story: Story;
  diary: DiaryEntry[];
  onRestart: () => void;
  onChooseOther: () => void;
}

const SWEEP_TEXTS: Record<string, string[]> = {
  'trang': [
    'Hanoi, 2026.',
    'The land clearance and urban redevelopment project in Thanh Cong officially begins.',
    'Excavators and hammers echo by the lake. The old collective apartments begin to crumble...',
    'The expanded school yard, the manga shop, and the net café disappear forever under construction dust.',
    'But you have successfully found and preserved Kien\'s fragments of memory.',
    'The memory file has been sealed inside the Digital Archive.',
  ],
  'thai-thinh': [
    'Hanoi, 2026.',
    'The Nguyen Van Tuyet street expansion project completes land clearance.',
    'The small tutoring alley is demolished. The playground is fenced and dismantled...',
    'The rustic violin notes at the sidewalk snail stall are silenced under honking traffic.',
    'But you have successfully found and preserved Trang\'s fragments of memory.',
    'The memory file has been sealed inside the Digital Archive.',
  ],
  'essy': [
    'Hanoi, 2026.',
    'The Tam Da slope connecting to alley 267 Hoang Hoa Tham officially opens to traffic.',
    'Secluded rows of houses are reclaimed, walls fall, lemon trees and jasmine are chopped down...',
    'The ancient well is filled, the maze of alleys disappears forever under smooth black asphalt.',
    'But you have successfully found and preserved Essy\'s fragments of memory.',
    'The memory file has been sealed inside the Digital Archive.',
  ],
};

export function EndingCannotBeMoved({ story, diary, onRestart, onChooseOther }: EndingCannotBeMovedProps) {
  const [sweepPhase, setSweepPhase] = useState<'intro' | 'showCase'>('intro');
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const orderedDiary = [...diary].sort((a, b) => a.foundAt - b.foundAt);

  const lines = SWEEP_TEXTS[story.id] ?? [
    'Hanoi, 2026.',
    'Neighborhood land clearance and urban planning.',
    'The old spaces have vanished under asphalt.',
    'But the memories have been successfully archived.',
  ];

  useEffect(() => {
    AudioSynth.stopAmbient();
  }, []);

  // Typewriter effect controller
  useEffect(() => {
    if (sweepPhase !== 'intro') return;
    if (typewriterIndex < lines.length) {
      const timer = setTimeout(() => {
        setTypewriterIndex((prev) => prev + 1);
      }, 1500); // Reveal a line every 1.5s
      return () => clearTimeout(timer);
    }
  }, [typewriterIndex, sweepPhase, lines.length]);

  // ── Sweep intro typewriter phase ──
  if (sweepPhase === 'intro') {
    return (
      <div className="h-screen bg-[#080706] text-amber-100/90 font-mono text-xs flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
        {/* Analog scanline grid */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 12, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 4px, 6px 100%'
        }} />
        <div className="absolute inset-0 vintage-vignette opacity-60 pointer-events-none" />

        <div className="w-full max-w-md flex flex-col gap-4 text-left leading-relaxed">
          {lines.slice(0, typewriterIndex).map((line, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className={idx === lines.length - 1 ? "text-amber-400 font-bold mt-2" : ""}
            >
              &gt; {line}
            </motion.p>
          ))}

          {typewriterIndex >= lines.length && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              onClick={() => setSweepPhase('showCase')}
              className="mt-8 self-center px-6 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold transition-all active:scale-95 cursor-pointer"
            >
              Open Memory File
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  // ── Main case file page ──
  return (
    <div className="min-h-screen bg-[#FCFAF2] flex flex-col items-center justify-start px-6 py-12 relative overflow-y-auto">
      <div className="absolute inset-0 giay-oly opacity-20 pointer-events-none" />
      <div className="absolute inset-0 vintage-vignette pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-muctim/5 via-transparent to-transparent pointer-events-none" />

      <motion.div
        className="relative z-10 w-full max-w-lg flex flex-col"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Admin-style case header */}
        <div className="bg-white/80 backdrop-blur-sm border border-muctim/15 rounded-2xl p-5 mb-6 shadow-xs font-mono text-[10px] text-muctim-faded">
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
            <div>
              <span className="opacity-50">FILE</span>
              <br />
              <span className="text-muctim font-bold">SESSION DIARY</span>
            </div>
            <div>
              <span className="opacity-50">MEMORIES SAVED</span>
              <br />
              <span className="text-muctim font-bold">{orderedDiary.length}</span>
            </div>
            <div><span className="opacity-50">STATUS</span><br /><span className="text-emerald-700 font-bold">SEALED & ARCHIVED</span></div>
            <div>
              <span className="opacity-50">LAST SPACE</span>
              <br />
              <span className="text-muctim font-bold">{story.title}</span>
            </div>
            <div><span className="opacity-50">FORM</span><br /><span className="text-terracotta font-bold">FOUND CLUES ONLY</span></div>
            <div><span className="opacity-50">CURRENT NARRATOR</span><br /><span className="text-muctim font-bold">{story.narrator}</span></div>
          </div>
        </div>

        {/* Section title */}
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-4 h-4 text-muctim-faded" />
          <h2 className="font-serif text-lg font-bold text-muctim">The Diary</h2>
        </div>

        {orderedDiary.length === 0 ? (
          <motion.div
            className="mb-8 rounded-2xl border border-muctim/10 bg-white/70 p-6 text-center shadow-xs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <BookOpen className="mx-auto mb-3 h-6 w-6 text-muctim-faded" />
            <p className="font-serif text-sm text-muctim">You left without collecting any memories.</p>
            <p className="mt-2 font-serif text-xs leading-relaxed text-muctim-faded">
              Return to the panorama and save the fragments you want this archive to remember.
            </p>
          </motion.div>
        ) : (
          <ol className="space-y-4 mb-8">
            {orderedDiary.map((entry, i) => (
              <motion.li
                key={entry.clueId}
                className="relative rounded-2xl border border-muctim/10 bg-white/75 p-4 shadow-xs overflow-hidden"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
              >
                <div
                  className="absolute left-0 top-0 h-full w-1"
                  style={{ background: entry.narratorColor }}
                />
                <div className="pl-2">
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-muctim-faded">
                      Entry {String(i + 1).padStart(2, '0')} · {entry.spaceLabel}
                    </p>
                    <p className="font-serif text-xs font-bold" style={{ color: entry.narratorColor }}>
                      {entry.narratorName}
                    </p>
                  </div>
                  <h3 className="font-serif text-sm font-bold leading-snug text-muctim">
                    {entry.clueLabel}
                  </h3>
                  <blockquote className="mt-2 border-l border-muctim/10 pl-3 font-handwritten text-base italic leading-relaxed text-terracotta">
                    {entry.quote}
                  </blockquote>
                </div>
              </motion.li>
            ))}
          </ol>
        )}

        {/* Navigation buttons — prominent at bottom */}
        <div className="flex flex-col items-center gap-4 border-t border-muctim/10 pt-6 pb-8">
          <CompassMotif size={44} />

          <div className="flex gap-3">
            <button
              onClick={onRestart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-muctim/15 bg-white/75 font-serif text-sm font-semibold text-muctim hover:bg-white transition-all shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Replay
            </button>
            <button
              onClick={onChooseOther}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-muctim text-white font-serif text-sm font-semibold hover:bg-muctim/85 transition-all shadow-sm cursor-pointer"
            >
              ← Back to Map
            </button>
          </div>

          <p className="font-mono text-[8px] text-muctim-faded uppercase tracking-widest text-center mt-1">
            CAS3020 · Digital Arts & Sciences · VinUniversity · 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
}
