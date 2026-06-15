import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Story } from '../types';
import { AudioSynth } from '../utils/AudioSynth';
import { RotateCcw, FileText, Sparkles } from 'lucide-react';
import { CompassMotif } from './CompassMotif';

interface EndingCannotBeMovedProps {
  story: Story;
  onRestart: () => void;
  onChooseOther: () => void;
}

const DIGITAL_ARTIFACTS: Record<string, { name: string; desc: string; icon: string }> = {
  'trang': {
    name: 'Collectible Tin Box & CRT Monitor',
    desc: 'Preserving soccer/Vinamilk cards and the clacking Audition keyboard sounds in the family net café with air conditioning.',
    icon: '📦',
  },
  'thai-thinh': {
    name: 'Wooden Violin & Sidewalk Boiled Snails',
    desc: 'Preserving rustic violin tones by the sidewalk snail stall and the childhood urge to stop and play at the playground.',
    icon: '🎻',
  },
  'essy': {
    name: 'Shared Courtyard Brick & Ancient Well Scoop',
    desc: 'Preserving the lemon-jasmine scent of the secluded courtyard and local knowledge of labyrinthine alleys.',
    icon: '🧱',
  },
};

const PRESET_MESSAGES: Record<string, Array<{ author: string; text: string; time: string }>> = {
  'trang': [
    { author: 'Hoang Nam, 28 years old', text: 'As a kid, after school I would sneak out to the school gate net café to play Half-Life. Now that complex has been demolished, walking past it hurts my heart.', time: '1 day ago' },
    { author: 'Minh Trang, 24 years old', text: 'Thanh Cong Lake used to be so uneven, I remember dad helping me learn to cycle and scraping my knees. The lake is nicer now, but dad is no longer here.', time: '3 days ago' },
  ],
  'thai-thinh': [
    { author: 'Ngoc Anh, 26 years old', text: 'In 1st grade, going to tutoring class in Trung Liet alley, I also desperately wanted to enter that playground, but mom kept dragging me along. Reading Trang\'s story hits so close to home.', time: '2 days ago' },
    { author: 'Tuan Hai, 30 years old', text: 'I\'ll always remember the violin at the snail stall. The owner was so cheerful. Now the food street is too noisy for such artistic moments.', time: '5 days ago' },
  ],
  'essy': [
    { author: 'Thuy Linh, 25 years old', text: 'Hoang Hoa Tham alley is truly a maze, ride-hailing drivers always give up. But it was so breezy, neighbors knew everyone. Now with the main road, it feels distant.', time: '1 day ago' },
    { author: 'Thanh Son, 29 years old', text: 'Remembering the ancient well and the scent of jasmine when walking with grandma at night. Hanoi is urbanizing so fast, quiet green spots are disappearing.', time: '4 days ago' },
  ],
};

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

export function EndingCannotBeMoved({ story, onRestart, onChooseOther }: EndingCannotBeMovedProps) {
  const [sweepPhase, setSweepPhase] = useState<'intro' | 'showCase'>('intro');
  const [typewriterIndex, setTypewriterIndex] = useState(0);

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

  const artifact = DIGITAL_ARTIFACTS[story.id];

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
              <span className="opacity-50">CASE NO.</span>
              <br />
              <span className="text-muctim font-bold">
                {story.id === 'trang'
                  ? '#TC-CAS3020-2026'
                  : story.id === 'thai-thinh'
                  ? '#TL-CAS3020-2026'
                  : story.id === 'essy'
                  ? '#HHT-BD-2024-001'
                  : `GTC-2026-${story.id.toUpperCase()}`}
              </span>
            </div>
            <div>
              <span className="opacity-50">DISTRICT</span>
              <br />
              <span className="text-muctim font-bold">
                {story.id === 'thai-thinh' ? 'Dong Da' : 'Ba Dinh'}
              </span>
            </div>
            <div><span className="opacity-50">STATUS</span><br /><span className="text-emerald-700 font-bold">SEALED & ARCHIVED</span></div>
            <div>
              <span className="opacity-50">RESIDENCY</span>
              <br />
              <span className="text-muctim font-bold">Entire Childhood</span>
            </div>
            <div><span className="opacity-50">URBAN PROJECT</span><br /><span className="text-terracotta font-bold">Road Upgrades & Expansion 2026</span></div>
            <div><span className="opacity-50">NARRATOR</span><br /><span className="text-muctim font-bold">{story.narrator}</span></div>
          </div>
        </div>

        {/* Unlocked Artifact display */}
        {artifact && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-amber-100/50 border border-amber-200/40 rounded-2xl p-4 mb-6 shadow-xs font-serif flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex-none flex items-center justify-center text-2xl border border-amber-500/10">
              {artifact.icon}
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Preserved Artifact
              </h4>
              <p className="text-sm font-bold text-stone-850 mt-1 mb-0.5">{artifact.name}</p>
              <p className="text-[11px] text-stone-600 leading-snug">{artifact.desc}</p>
            </div>
          </motion.div>
        )}

        {/* Section title */}
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-4 h-4 text-muctim-faded" />
          <h2 className="font-serif text-lg font-bold text-muctim">Things That Cannot Be Moved</h2>
        </div>

        {/* The list */}
        <ul className="space-y-3.5 mb-8 pl-1">
          {story.cannotBeMoved.map((item, i) => (
            <motion.li
              key={i}
              className="font-serif text-xs text-muctim-faded leading-relaxed pl-3 border-l-2 border-muctim/10"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              {item}
            </motion.li>
          ))}
        </ul>

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
