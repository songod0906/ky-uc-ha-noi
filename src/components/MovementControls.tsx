import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MemorySpace } from '../types';

interface MovementControlsProps {
  spaces: MemorySpace[];
  currentIndex: number;
  onMove: (index: number) => void;
}

export function MovementControls({ spaces, currentIndex, onMove }: MovementControlsProps) {
  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < spaces.length - 1;

  return (
    <div className="flex items-center justify-between w-full px-2">
      {/* Left */}
      <motion.button
        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-serif text-sm transition-all ${
          canGoLeft
            ? 'bg-white/80 border border-muctim/15 text-muctim shadow hover:shadow-md hover:-translate-x-0.5'
            : 'opacity-0 pointer-events-none'
        }`}
        whileTap={canGoLeft ? { scale: 0.95 } : {}}
        onClick={() => canGoLeft && onMove(currentIndex - 1)}
      >
        <ChevronLeft className="w-4 h-4" />
        {spaces[currentIndex - 1]?.label}
      </motion.button>

      {/* Dot indicators */}
      <div className="flex gap-2 items-center">
        {spaces.map((space, i) => (
          <button
            key={space.id}
            onClick={() => onMove(i)}
            className={`transition-all duration-300 rounded-full ${
              i === currentIndex
                ? 'w-6 h-2.5 bg-muctim'
                : 'w-2.5 h-2.5 bg-muctim/20 hover:bg-muctim/40'
            }`}
            title={space.label}
          />
        ))}
      </div>

      {/* Right */}
      <motion.button
        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-serif text-sm transition-all ${
          canGoRight
            ? 'bg-white/80 border border-muctim/15 text-muctim shadow hover:shadow-md hover:translate-x-0.5'
            : 'opacity-0 pointer-events-none'
        }`}
        whileTap={canGoRight ? { scale: 0.95 } : {}}
        onClick={() => canGoRight && onMove(currentIndex + 1)}
      >
        {spaces[currentIndex + 1]?.label}
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
}
