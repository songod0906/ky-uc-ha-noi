import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clue } from '../types';
import { AudioSynth } from '../utils/AudioSynth';
import { X, Volume2, BookOpen, Sparkles } from 'lucide-react';

const CLUE_ICONS: Record<string, string> = {
  place: '📍',
  sound: '🔊',
  routine: '🌀',
  object: '📦',
  loss: '🕯',
};

interface ClueObjectProps {
  clue: Clue;
  collected: boolean;
  onCollect: (clueId: string) => void;
  onModalChange?: (open: boolean) => void;
}

export function ClueObject({ clue, collected, onCollect, onModalChange }: ClueObjectProps) {
  const [open, setOpen] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const handleMarkerClick = () => {
    if (!open) {
      AudioSynth.playSnap();
      onModalChange?.(true);
    }
    setOpen(true);
  };

  const handleCollect = () => {
    onCollect(clue.id);
    setOpen(false);
    onModalChange?.(false);
  };

  const handleClose = () => {
    AudioSynth.stopAmbient();
    setOpen(false);
    onModalChange?.(false);
  };

  const handleAudio = () => {
    setAudioPlaying((p) => !p);
  };

  return (
    <>
      {/* Hotspot marker pinned at clue position */}
      <motion.button
        className="absolute z-20 flex flex-col items-center gap-1 group"
        style={{ left: `${clue.x}%`, top: `${clue.y}%`, transform: 'translate(-50%, -50%)' }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleMarkerClick}
        title={clue.label}
        data-tutorial="clue"
      >
        <motion.div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg border-2 transition-all duration-300 ${
            collected
              ? 'bg-sage/80 border-sage text-white'
              : 'bg-white/90 border-nangthu/50 hover:border-nangthu firefly-glow'
          }`}
          animate={collected ? {} : { scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        >
          {collected ? '✓' : CLUE_ICONS[clue.type]}
        </motion.div>
        <span className="font-serif text-[10px] text-muctim bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap max-w-[120px] truncate">
          {clue.label}
        </span>
      </motion.button>

      {/* Reveal panel (bottom sheet style) */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            <div className="absolute inset-0 bg-muctim/40 backdrop-blur-sm" />
            <motion.div
              className="relative z-10 w-full max-w-lg bg-[#FCFAF2] rounded-3xl shadow-2xl border border-muctim/10 overflow-hidden"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Notebook grid background */}
              <div className="absolute inset-0 giay-oly opacity-20 pointer-events-none" />

              <div className="relative p-5 pt-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{CLUE_ICONS[clue.type]}</span>
                    <div>
                      <span className="font-mono text-[9px] text-muctim-faded uppercase tracking-widest block">
                        {clue.type}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-muctim leading-tight">
                        {clue.label}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-full bg-muctim/5 hover:bg-muctim/10 flex items-center justify-center text-muctim-faded hover:text-muctim transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quote */}
                <blockquote className="font-handwritten text-base text-terracotta border-l-2 border-terracotta/40 pl-3 mb-4 leading-snug">
                  {clue.quote}
                </blockquote>

                {/* Voice note */}
                <p className="font-serif text-sm text-muctim-faded leading-relaxed mb-5">
                  {clue.voiceNote}
                </p>

                {/* Audio placeholder */}
                <div className="flex items-center gap-2 mb-5 bg-nangthu-glow/40 rounded-xl p-3">
                  <button
                    onClick={handleAudio}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      audioPlaying
                        ? 'bg-terracotta text-white'
                        : 'bg-nangthu/20 text-nangthu hover:bg-nangthu/30'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <div>
                    <p className="font-serif text-xs font-semibold text-muctim">Listen to memory audio</p>
                    <p className="font-mono text-[9px] text-muctim-faded">
                      {audioPlaying ? 'Playing...' : 'Real audio will be added later'}
                    </p>
                  </div>
                </div>

                {/* Collect / Already collected */}
                {collected ? (
                  <div className="flex items-center gap-2 justify-center py-2 text-sage font-serif text-sm">
                    <Sparkles className="w-4 h-4" />
                    Saved in notebook
                  </div>
                ) : (
                  <button
                    onClick={handleCollect}
                    className="w-full py-3 bg-muctim text-white font-serif font-semibold rounded-2xl hover:bg-muctim/80 transition-all flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Save to notebook
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
