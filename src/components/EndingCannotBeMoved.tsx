import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DiaryEntry, MemorySpace, Story } from '../types';
import { AudioSynth } from '../utils/AudioSynth';
import { StampDiary } from './StampDiary';

// Narrative bridge: after each story, what connects to the next
const STORY_BRIDGE: Record<string, { nextId: string; nextNarrator: string; bridge: string }> = {
  'trang': {
    nextId: 'essy',
    nextNarrator: 'Essy',
    bridge: 'A few kilometers west, in alley 267 Hoang Hoa Tham, someone else is also packing her last memories of a place that is about to disappear.',
  },
  'essy': {
    nextId: 'thai-thinh',
    nextNarrator: 'Trang',
    bridge: 'And just a few streets away in the Trung Liet lanes, the afternoon light is turning golden. A violin is still playing from a sidewalk stall.',
  },
};

interface EndingCannotBeMovedProps {
  story: Story;
  activeSpace: MemorySpace;
  diary: DiaryEntry[];
  onRestart: () => void;
  onChooseOther: () => void;
  onNextStory?: (storyId: string) => void;
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

export function EndingCannotBeMoved({ story, activeSpace, diary, onRestart, onChooseOther, onNextStory }: EndingCannotBeMovedProps) {
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

  // ── Stamp diary (main showcase) ──
  return (
    <StampDiary
      story={story}
      activeSpace={activeSpace}
      diary={diary}
      onRestart={onRestart}
      onChooseOther={onChooseOther}
      onNextStory={onNextStory}
    />
  );
}
