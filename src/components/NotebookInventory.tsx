import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Sparkles } from 'lucide-react';
import { Story, Clue } from '../types';

interface NotebookInventoryProps {
  story: Story;
  collectedIds: string[];
  onClose: () => void;
  cluesNeeded: number;
}

const CLUE_ICONS: Record<string, string> = {
  place: '📍',
  sound: '🔊',
  routine: '🌀',
  object: '📦',
  loss: '🕯',
};

function getAllClues(story: Story): Clue[] {
  return story.spaces.flatMap((s) => s.clues);
}

export function NotebookInventory({ story, collectedIds, onClose, cluesNeeded }: NotebookInventoryProps) {
  const allClues = getAllClues(story);
  const collected = allClues.filter((c) => collectedIds.includes(c.id));

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-muctim/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-md bg-[#FCFAF2] rounded-3xl shadow-2xl border border-muctim/10 overflow-hidden max-h-[85vh] flex flex-col"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 22 }}
      >
        <div className="absolute inset-0 giay-oly opacity-20 pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between p-5 border-b border-muctim/10">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-muctim" />
            <div>
              <h3 className="font-serif text-lg font-bold text-muctim">Memory Journal</h3>
              <p className="font-mono text-[10px] text-muctim-faded uppercase tracking-wider">
                {collected.length}/{allClues.length} fragments
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muctim/5 hover:bg-muctim/10 flex items-center justify-center text-muctim-faded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="relative px-5 py-3 border-b border-muctim/5">
          <div className="flex justify-between text-[10px] font-mono text-muctim-faded mb-1.5 uppercase tracking-wider">
            <span>Discovery Progress</span>
            <span>{collected.length} / {cluesNeeded} to unlock puzzle</span>
          </div>
          <div className="h-2 bg-muctim/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-nangthu to-terracotta rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((collected.length / cluesNeeded) * 100, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          {collected.length >= cluesNeeded && (
            <motion.div
              className="flex items-center gap-1.5 mt-2 text-sage font-serif text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Sparkles className="w-3 h-3" />
              All fragments gathered — ready to assemble memories!
            </motion.div>
          )}
        </div>

        {/* Clue list */}
        <div className="relative overflow-y-auto flex-1 p-4 space-y-3">
          {collected.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-serif text-muctim-faded text-sm italic">
                No fragments found yet. Keep searching in the memory spaces.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {collected.map((clue, i) => (
                <motion.div
                  key={clue.id}
                  className="bg-white/60 rounded-2xl p-4 border border-muctim/8 shadow-sm"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{CLUE_ICONS[clue.type]}</span>
                    <div>
                      <span className="font-mono text-[9px] text-muctim-faded uppercase tracking-widest">
                        {clue.type}
                      </span>
                      <p className="font-serif text-sm font-semibold text-muctim">{clue.label}</p>
                      <p className="font-handwritten text-xs text-terracotta mt-1 italic leading-snug">
                        {clue.quote}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
