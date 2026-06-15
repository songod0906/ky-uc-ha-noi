import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Story } from '../types';
import { MemorySpace as MemorySpaceComponent } from './MemorySpace';
import { EndingCannotBeMoved } from './EndingCannotBeMoved';
import { TutorialOverlay, TutorialStep } from './TutorialOverlay';
import { AudioSynth } from '../utils/AudioSynth';
import { AudioManager } from '../utils/AudioManager';
import { ChevronLeft, CheckSquare } from 'lucide-react';
import { SpaceDossier } from './SpaceDossier';

const NARRATOR_COLOR: Record<string, string> = {
  'Lê Trung Kiên': '#C8A882',
  LTK:   '#C8A882',
  Essy:  '#8BAF9A',
  Trang: '#B09EC3',
};

type Phase = 'dossier' | 'explore' | 'ending';

const EXPLORE_TUTORIAL: TutorialStep[] = [
  {
    id: 'clue',
    selector: '[data-tutorial="clue"]',
    placement: 'below',
    title: 'Hidden Memory Fragments',
    body: 'Click on the glowing hotspots to hear oral history and explore past memories.',
    cta: 'Begin Exploration!',
  },
];

interface MemoryRouteGameProps {
  story: Story;
  initialSpaceIdx?: number;
  singleSpaceMode?: boolean;
  onBack: () => void;
}

export function MemoryRouteGame({ story, initialSpaceIdx = 0, onBack }: MemoryRouteGameProps) {
  const [phase, setPhase] = useState<Phase>('dossier');
  const [spaceIndex] = useState(initialSpaceIdx);
  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [exploreTutorialDone, setExploreTutorialDone] = useState(false);

  // States for physical feedback (shake + flash)
  const [screenShake, setScreenShake] = useState(false);
  const [collectFlash, setCollectFlash] = useState(false);

  // State for floating memory echoes
  const [currentEcho, setCurrentEcho] = useState<{ text: string; top: number; left: number } | null>(null);

  const narratorColor = NARRATOR_COLOR[story.narrator] ?? '#C8B89A';
  const activeSpace = story.spaces[spaceIndex];

  // Stop any global audio manager playbacks on mount/unmount
  useEffect(() => {
    AudioManager.stop();
    return () => {
      AudioManager.stop();
      AudioSynth.stopAmbient();
    };
  }, []);

  // Ambient audio intentionally disabled — clue hotspots are the primary audio delivery.

  // Floating nostalgic text echoes logic
  useEffect(() => {
    if (phase !== 'explore' || !activeSpace.memoryEchoes || activeSpace.memoryEchoes.length === 0) {
      setCurrentEcho(null);
      return;
    }

    let timer: any = null;
    const triggerNextEcho = () => {
      const echoes = activeSpace.memoryEchoes || [];
      const randomText = echoes[Math.floor(Math.random() * echoes.length)];
      
      // Random position avoiding edges (15% to 70% top, 10% to 60% left)
      const top = 15 + Math.random() * 55;
      const left = 10 + Math.random() * 50;
      
      setCurrentEcho({ text: randomText, top, left });

      timer = setTimeout(() => {
        setCurrentEcho(null);
        timer = setTimeout(triggerNextEcho, 3000 + Math.random() * 2000);
      }, 4500);
    };

    timer = setTimeout(triggerNextEcho, 2500);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [phase, activeSpace]);

  const [showLeaveWarning, setShowLeaveWarning] = useState(false);

  const handleCollect = (clueId: string) => {
    if (!collectedIds.includes(clueId)) {
      setCollectedIds((prev) => [...prev, clueId]);
      AudioSynth.playPluck(330, 1.2, 0.3);

      // Trigger physical visual feedback on success
      setScreenShake(true);
      setCollectFlash(true);
      setTimeout(() => setScreenShake(false), 500);
      setTimeout(() => setCollectFlash(false), 700);
    }
  };

  const handleFinish = () => {
    AudioSynth.stopAmbient();
    setPhase('ending');
  };

  const handleLeaveClick = () => {
    const collectedInSpace = activeSpace.clues.filter(c => collectedIds.includes(c.id)).length;
    const totalInSpace = activeSpace.clues.length;
    if (collectedInSpace < totalInSpace) {
      setShowLeaveWarning(true);
    } else {
      handleFinish();
    }
  };

  const handleRestart = () => {
    AudioSynth.stopAmbient();
    setCollectedIds([]);
    setPhase('dossier');
  };

  // Helper to find which node index contains a clue to render hint
  const findCluePoint = (clueId: string): string => {
    if (!activeSpace.bgTourNodes) return '';
    const nodeIdx = activeSpace.bgTourNodes.findIndex(node => 
      node.clueAnchors?.some(anchor => anchor.clueId === clueId)
    );
    if (nodeIdx === -1) return '';
    return `(Point ${nodeIdx + 1})`;
  };

  // ── Dossier phase ──
  if (phase === 'dossier') {
    return (
      <div className="h-screen flex flex-col relative bg-[#0a0806] overflow-hidden">
        <header className="relative z-30 flex items-center px-5 py-3 bg-black/30 border-b border-amber-200/5">
          <button
            onClick={() => { AudioManager.stop(); onBack(); }}
            className="flex items-center gap-1.5 text-amber-200/30 hover:text-amber-200/60 font-serif text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Map
          </button>
        </header>
        <SpaceDossier
          story={story}
          space={activeSpace}
          narratorColor={narratorColor}
          onEnter={() => {
            setPhase('explore');
          }}
        />
      </div>
    );
  }

  // ── Ending phase ──
  if (phase === 'ending') {
    return (
      <EndingCannotBeMoved
        story={story}
        onRestart={handleRestart}
        onChooseOther={onBack}
      />
    );
  }

  // ── Explore phase ──
  const collected = activeSpace.clues.filter((c) => collectedIds.includes(c.id)).length;
  const total = activeSpace.clues.length;
  const allFound = collected === total && total > 0;

  return (
    <div className={`h-screen flex flex-col relative bg-[#FCFAF2] overflow-hidden ${screenShake ? 'screen-shake' : ''}`}>
      <div className="absolute inset-0 giay-oly opacity-20 pointer-events-none" />
      <div className="absolute inset-0 vintage-vignette pointer-events-none z-[5]" />

      {/* Golden photographic flash overlay */}
      {collectFlash && (
        <div className="absolute inset-0 bg-[#e58e26]/30 mix-blend-color-dodge z-[99] pointer-events-none memory-flash" />
      )}

      {/* Top header */}
      <header className="relative z-30 flex items-center justify-between px-5 py-3 bg-white/50 backdrop-blur-sm border-b border-muctim/8 shadow-xs">
        <button
          onClick={() => { onBack(); }}
          className="flex items-center gap-1.5 text-muctim-faded hover:text-muctim font-serif text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Map
        </button>

        <div className="text-center">
          <p className="font-serif text-sm font-bold text-muctim leading-none">{activeSpace.label}</p>
          <p className="font-mono text-[9px] text-muctim-faded uppercase tracking-widest">
            {story.narrator} · {story.title}
          </p>
        </div>

        <button
          onClick={handleLeaveClick}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-serif text-sm transition-all text-[#0a0806] ${
            allFound ? 'shadow-[0_0_12px_rgba(200,168,130,0.45)]' : 'opacity-85'
          }`}
          style={{
            background: allFound ? narratorColor : 'rgba(255, 255, 255, 0.45)',
            border: `1px solid ${allFound ? narratorColor : 'rgba(0,0,0,0.15)'}`,
            color: allFound ? '#0a0806' : '#5a4a3a',
          }}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          {allFound ? 'Complete Archive' : 'Leave Early'}
        </button>
      </header>

      {/* Main scene */}
      <main className="flex-1 min-h-0 relative z-10">
        <MemorySpaceComponent
          key={activeSpace.id}
          space={activeSpace}
          story={story}
          collectedIds={collectedIds}
          onCollect={handleCollect}
          onClueModalChange={() => {}}
        />

        {/* Floating memory echoes */}
        <AnimatePresence>
          {currentEcho && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 0.82, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute pointer-events-none select-none font-handwritten text-[#9e8367] text-sm md:text-base font-semibold max-w-[200px] md:max-w-[280px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] z-20 text-center leading-relaxed text-balance"
              style={{
                top: `${currentEcho.top}%`,
                left: `${currentEcho.left}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {currentEcho.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating memory tracker checklist */}
        <div className="absolute top-20 left-4 z-20 max-w-[240px] bg-[#FCFAF2]/85 backdrop-blur-md border border-muctim/15 rounded-2xl p-4 shadow-lg font-serif">
          <p className="font-mono text-[8px] text-muctim-faded uppercase tracking-widest mb-1.5">
            Archived Mission
          </p>
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-muctim/10">
            <span className="text-xs font-bold text-muctim">Archive Progress</span>
            <span className="font-mono text-xs text-muctim font-bold">
              {collected} / {total}
            </span>
          </div>
          <div className="space-y-2">
            {activeSpace.clues.map(clue => {
              const found = collectedIds.includes(clue.id);
              return (
                <div key={clue.id} className="flex items-start gap-2 text-[11px] leading-tight">
                  <span className={`mt-0.5 flex-none font-bold ${found ? 'text-emerald-700' : 'text-muctim/30'}`}>
                    {found ? '✓' : '○'}
                  </span>
                  <span className={found ? 'text-muctim-faded line-through font-serif' : 'text-muctim font-medium font-serif'}>
                    {clue.label} {!found && findCluePoint(clue.id) && (
                      <span className="text-[9px] text-amber-600 font-mono ml-1">{findCluePoint(clue.id)}</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Warning confirmation modal */}
      {showLeaveWarning && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#FCFAF2] border border-muctim/15 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-muctim mb-2">Archive Unfinished</h3>
            <p className="font-serif text-xs text-muctim-faded leading-relaxed mb-6">
              Some fragments of memory about <span className="font-bold text-muctim">{activeSpace.label}</span> have not been archived. If you leave now, these memories will be demolished in 2026 and lost forever. Are you sure you want to leave?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveWarning(false)}
                className="flex-1 py-2 rounded-xl border border-muctim/20 text-muctim font-serif text-xs font-semibold hover:bg-muctim/5 transition-all"
              >
                Back to Search
              </button>
              <button
                onClick={() => {
                  setShowLeaveWarning(false);
                  handleFinish();
                }}
                className="flex-1 py-2 bg-amber-700 text-white font-serif text-xs font-semibold rounded-xl hover:bg-amber-800 transition-all shadow-sm"
              >
                Accept & Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Overlay */}
      {!exploreTutorialDone && (
        <TutorialOverlay
          steps={EXPLORE_TUTORIAL}
          onDone={() => setExploreTutorialDone(true)}
        />
      )}
    </div>
  );
}
