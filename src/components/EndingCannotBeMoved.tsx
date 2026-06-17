import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DiaryEntry, MemorySpace, Story } from '../types';
import { AudioSynth } from '../utils/AudioSynth';
import { StampDiary } from './StampDiary';

interface EndingCannotBeMovedProps {
  story: Story;
  activeSpace: MemorySpace;
  diary: DiaryEntry[];
  onRestart: () => void;
  onChooseOther: () => void;
  onNextStory?: (storyId: string) => void;
}

export function EndingCannotBeMoved({ story, activeSpace, diary, onRestart, onChooseOther, onNextStory }: EndingCannotBeMovedProps) {
  const [sweepPhase, setSweepPhase] = useState<'intro' | 'showCase'>('intro');
  const [typewriterIndex, setTypewriterIndex] = useState(1);

  const spaceEntries = diary.filter(e => activeSpace.clues.some(c => c.id === e.clueId));

  type LineKind = 'normal' | 'quote' | 'accent';
  interface Line { text: string; kind: LineKind; }

  const lines: Line[] = [
    { text: 'Hanoi, 2026.', kind: 'normal' },
    { text: `${activeSpace.label} — scheduled for clearance.`, kind: 'normal' },
    ...spaceEntries.map(e => ({ text: `"${e.clueLabel}"`, kind: 'quote' as LineKind })),
    {
      text: spaceEntries.length > 0
        ? `${spaceEntries.length === 1 ? 'This fragment is' : 'These fragments are'} now part of ${story.narrator}'s archive.`
        : `${story.narrator}'s memory of this place has been sealed.`,
      kind: 'normal',
    },
    { text: 'The streets will change. These voices will not.', kind: 'accent' },
  ];

  useEffect(() => {
    AudioSynth.stopAmbient();
  }, []);

  // Keep the ending from ever looking like an empty black screen.
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
              className={
                line.kind === 'accent'
                  ? 'text-amber-400 font-bold mt-2'
                  : line.kind === 'quote'
                  ? 'text-amber-200/80 italic pl-3 border-l border-amber-500/30'
                  : ''
              }
            >
              {line.text}
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
