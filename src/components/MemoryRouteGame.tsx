import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Story } from '../types';
import { MemorySpace } from './MemorySpace';
import { MovementControls } from './MovementControls';
import { NotebookInventory } from './NotebookInventory';
import { RouteAssembly } from './RouteAssembly';
import { EndingCannotBeMoved } from './EndingCannotBeMoved';
import { CompassMotif } from './CompassMotif';
import { AudioSynth } from '../utils/AudioSynth';
import { BookOpen, Puzzle, ChevronLeft } from 'lucide-react';

type Phase = 'explore' | 'assemble' | 'ending';

interface MemoryRouteGameProps {
  story: Story;
  onBack: () => void;
}

export function MemoryRouteGame({ story, onBack }: MemoryRouteGameProps) {
  const [phase, setPhase] = useState<Phase>('explore');
  const [spaceIndex, setSpaceIndex] = useState(0);
  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [notebookOpen, setNotebookOpen] = useState(false);

  const totalClues = story.spaces.flatMap((s) => s.clues).length;
  const canUnlock = collectedIds.length >= story.cluesNeededToUnlock;

  const handleCollect = (clueId: string) => {
    if (!collectedIds.includes(clueId)) {
      setCollectedIds((prev) => [...prev, clueId]);
    }
  };

  const handleMoveToSpace = (idx: number) => {
    AudioSynth.playSnap();
    AudioSynth.startAmbient('wind');
    setSpaceIndex(idx);
  };

  const handleStartAssembly = () => {
    AudioSynth.stopAmbient();
    AudioSynth.playGuitarArpeggio();
    setPhase('assemble');
  };

  const handleAssemblySuccess = () => {
    setPhase('ending');
  };

  const handleRestart = () => {
    setPhase('explore');
    setSpaceIndex(0);
    setCollectedIds([]);
    AudioSynth.startAmbient('wind');
  };

  if (phase === 'assemble') {
    return (
      <RouteAssembly
        story={story}
        collectedIds={collectedIds}
        onSuccess={handleAssemblySuccess}
        onBackToExplore={() => setPhase('explore')}
      />
    );
  }

  if (phase === 'ending') {
    return (
      <EndingCannotBeMoved
        story={story}
        onRestart={handleRestart}
        onChooseOther={onBack}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-[#FCFAF2]">
      <div className="absolute inset-0 giay-oly opacity-20 pointer-events-none" />
      <div className="absolute inset-0 vintage-vignette pointer-events-none z-50" />

      {/* Top HUD */}
      <header className="relative z-30 flex items-center justify-between px-5 py-3 bg-white/50 backdrop-blur-sm border-b border-muctim/8 shadow-xs">
        <button
          onClick={() => { AudioSynth.stopAmbient(); onBack(); }}
          className="flex items-center gap-1.5 text-muctim-faded hover:text-muctim font-serif text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Chọn câu chuyện
        </button>

        <div className="flex items-center gap-2">
          <CompassMotif size={28} />
          <div className="text-center">
            <p className="font-serif text-sm font-bold text-muctim leading-none">{story.title}</p>
            <p className="font-mono text-[9px] text-muctim-faded uppercase tracking-widest">
              {story.narrator}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Clues progress */}
          <button
            onClick={() => setNotebookOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-nangthu-glow/70 border border-nangthu/20 text-sm font-serif text-terracotta hover:bg-nangthu-glow transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span className="font-bold">{collectedIds.length}</span>
            <span className="text-muctim-faded">/ {totalClues}</span>
          </button>

          {/* Unlock puzzle button */}
          {canUnlock && (
            <motion.button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muctim text-white text-sm font-serif shadow hover:bg-muctim/80 transition-all"
              onClick={handleStartAssembly}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.04 }}
            >
              <Puzzle className="w-4 h-4" />
              Lắp ráp
            </motion.button>
          )}
        </div>
      </header>

      {/* Unlock hint banner */}
      <AnimatePresence>
        {canUnlock && phase === 'explore' && (
          <motion.div
            className="relative z-20 bg-sage/20 border-b border-sage/30 px-5 py-2 text-center"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <p className="font-serif text-sm text-sage font-semibold">
              Đã có đủ mảnh ghép — nhấn{' '}
              <button
                onClick={handleStartAssembly}
                className="underline hover:text-muctim transition-colors"
              >
                Lắp ráp
              </button>{' '}
              để ghép lại một ngày của {story.narrator}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main scene area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 gap-4 relative z-10">
        {/* Scene panel — fixed tall ratio */}
        <div className="w-full max-w-2xl" style={{ height: 'clamp(340px, 55vh, 520px)' }}>
          <AnimatePresence mode="wait">
            <MemorySpace
              key={story.spaces[spaceIndex].id}
              space={story.spaces[spaceIndex]}
              story={story}
              collectedIds={collectedIds}
              onCollect={handleCollect}
            />
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="w-full max-w-2xl">
          <MovementControls
            spaces={story.spaces}
            currentIndex={spaceIndex}
            onMove={handleMoveToSpace}
          />
        </div>

        {/* Space list chips */}
        <div className="w-full max-w-2xl flex gap-3 justify-center flex-wrap">
          {story.spaces.map((space, i) => {
            const spaceCollected = space.clues.filter((c) => collectedIds.includes(c.id)).length;
            const isCurrent = i === spaceIndex;
            return (
              <button
                key={space.id}
                onClick={() => handleMoveToSpace(i)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-serif transition-all ${
                  isCurrent
                    ? 'bg-muctim text-white border-muctim shadow'
                    : 'bg-white/60 border-muctim/15 text-muctim hover:border-muctim/30'
                }`}
              >
                <span>{space.label}</span>
                <span
                  className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${
                    isCurrent ? 'bg-white/20 text-white' : 'bg-muctim/10 text-muctim-faded'
                  }`}
                >
                  {spaceCollected}/{space.clues.length}
                </span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Notebook overlay */}
      <AnimatePresence>
        {notebookOpen && (
          <NotebookInventory
            story={story}
            collectedIds={collectedIds}
            onClose={() => setNotebookOpen(false)}
            cluesNeeded={story.cluesNeededToUnlock}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
