import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Story, Clue } from '../types';

interface NotebookInventoryProps {
  story: Story;
  collectedIds: string[];
  onClose: () => void;
  cluesNeeded: number;
}

const NOTE_COLORS = [
  { bg: '#fef9c3', border: '#fde68a', tape: '#fbbf24' },
  { bg: '#dbeafe', border: '#bfdbfe', tape: '#60a5fa' },
  { bg: '#fce7f3', border: '#fbcfe8', tape: '#f472b6' },
  { bg: '#dcfce7', border: '#bbf7d0', tape: '#34d399' },
  { bg: '#ede9fe', border: '#ddd6fe', tape: '#a78bfa' },
];

const TYPE_LABEL: Record<string, string> = {
  place: 'place',
  sound: 'sound',
  routine: 'daily ritual',
  object: 'object',
  loss: 'loss',
};

function getAllClues(story: Story): Clue[] {
  return story.spaces.flatMap((s) => s.clues);
}

export function NotebookInventory({ story, collectedIds, onClose, cluesNeeded }: NotebookInventoryProps) {
  const allClues = getAllClues(story);
  const collected = allClues.filter((c) => collectedIds.includes(c.id));
  const pct = Math.min((collected.length / cluesNeeded) * 100, 100);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        className="relative z-10 w-full max-w-sm flex flex-col overflow-hidden"
        style={{
          maxHeight: '88vh',
          background: '#f5f0e8',
          borderRadius: '4px 4px 2px 2px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.1)',
        }}
        initial={{ y: 60, opacity: 0, rotate: -1 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
      >
        {/* Notebook binding strip at top */}
        <div className="flex-none h-3 w-full" style={{ background: 'linear-gradient(to bottom, #8b6c4a, #6b4f32)' }} />

        {/* Spiral holes */}
        <div className="absolute top-0 left-0 right-0 flex justify-around px-6 pointer-events-none" style={{ zIndex: 10 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full mt-1" style={{ background: '#3a2a1a', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)' }} />
          ))}
        </div>

        {/* Header */}
        <div className="flex-none flex items-center justify-between px-5 pt-5 pb-3 border-b-2 border-dashed border-amber-800/20">
          <div>
            <p className="font-mono text-[9px] text-amber-900/50 uppercase tracking-widest">Memory Journal</p>
            <h3 className="font-handwritten text-xl text-amber-900 leading-none mt-0.5">{story.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-amber-900/40 hover:text-amber-900/70 transition-colors"
            style={{ background: 'rgba(139,108,74,0.12)' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress — hand-drawn style bar */}
        <div className="flex-none px-5 py-3 border-b border-amber-800/10">
          <div className="flex justify-between font-handwritten text-xs text-amber-800/60 mb-1.5">
            <span>{collected.length} fragments found</span>
            <span>{cluesNeeded} needed</span>
          </div>
          <div className="relative h-3 rounded-sm overflow-hidden" style={{ background: 'rgba(139,108,74,0.15)', border: '1px solid rgba(139,108,74,0.2)' }}>
            <motion.div
              className="h-full rounded-sm"
              style={{ background: 'linear-gradient(90deg, #c8793a, #e8a84a)' }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            {/* Pen-stroke texture overlay */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.3) 5px)' }} />
          </div>
          {collected.length >= cluesNeeded && (
            <motion.p className="font-handwritten text-[11px] text-emerald-700 mt-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              ✓ All fragments gathered!
            </motion.p>
          )}
        </div>

        {/* Sticky note cards */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
          {collected.length === 0 ? (
            <div className="text-center py-10">
              <p className="font-handwritten text-base text-amber-900/40 italic leading-relaxed">
                No fragments yet.<br />Keep exploring the spaces.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {collected.map((clue, i) => {
                const color = NOTE_COLORS[i % NOTE_COLORS.length];
                const tilt = (i % 2 === 0 ? 1 : -1) * (0.5 + (i % 3) * 0.4);
                return (
                  <motion.div
                    key={clue.id}
                    className="relative"
                    style={{ transform: `rotate(${tilt}deg)` }}
                    initial={{ opacity: 0, y: 16, rotate: tilt + 4 }}
                    animate={{ opacity: 1, y: 0, rotate: tilt }}
                    transition={{ delay: i * 0.06, type: 'spring', damping: 18 }}
                  >
                    {/* Tape strip at top */}
                    <div
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 rounded-sm opacity-70 z-10"
                      style={{ background: color.tape, transform: `translateX(-50%) rotate(${-tilt * 0.5}deg)` }}
                    />

                    <div
                      className="p-4 pt-5 rounded-sm shadow-md"
                      style={{
                        background: color.bg,
                        border: `1px solid ${color.border}`,
                        boxShadow: '2px 3px 8px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)',
                      }}
                    >
                      <p className="font-mono text-[8px] uppercase tracking-widest opacity-50 mb-1">
                        {TYPE_LABEL[clue.type] ?? clue.type}
                      </p>
                      <p className="font-handwritten text-base font-bold text-stone-800 leading-snug mb-2">
                        {clue.label}
                      </p>
                      <p className="font-handwritten text-xs text-stone-600 italic leading-relaxed">
                        {clue.quote}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div className="h-2" />
        </div>
      </motion.div>
    </motion.div>
  );
}
