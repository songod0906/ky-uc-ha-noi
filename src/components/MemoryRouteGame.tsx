import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DiaryEntry, Story } from '../types';
import { MemorySpace as MemorySpaceComponent } from './MemorySpace';
import { EndingCannotBeMoved } from './EndingCannotBeMoved';
import { TutorialOverlay, TutorialStep } from './TutorialOverlay';
import { AudioSynth, playClick, playDiscover } from '../utils/AudioSynth';
import { AudioManager } from '../utils/AudioManager';
import { OralHistoryAudio } from '../utils/OralHistoryAudio';
import { ChevronLeft, CheckSquare } from 'lucide-react';
import { SpaceDossier } from './SpaceDossier';

const EXPLORE_TUTORIAL: TutorialStep[] = [
  {
    id: 'drag',
    selector: '#__none__',
    placement: 'below',
    title: 'Look around in 360°',
    body: 'Click and drag anywhere to rotate the view. Memory fragments are hidden in different directions — explore to find them all.',
    showDragHint: true,
  },
  {
    id: 'fragments',
    selector: '[data-tutorial="fragments"]',
    placement: 'right',
    title: 'Find memory fragments',
    body: 'Polaroid cards with memory stories are scattered in the panorama. Click one when you spot it to unlock and listen.',
  },
  {
    id: 'archive',
    selector: '[data-tutorial="archive"]',
    placement: 'below',
    title: 'Seal the archive',
    body: "Once you've collected all fragments, this button lights up. Press it to preserve your memories forever.",
    cta: 'Start exploring!',
  },
];

const NARRATOR_COLOR: Record<string, string> = {
  'Lê Trung Kiên': '#C8A882',
  LTK:   '#C8A882',
  Essy:  '#8BAF9A',
  Trang: '#B09EC3',
};

type Phase = 'dossier' | 'explore' | 'ending';

interface MemoryRouteGameProps {
  story: Story;
  initialSpaceIdx?: number;
  singleSpaceMode?: boolean;
  diary: DiaryEntry[];
  addToDiary: (entry: DiaryEntry) => void;
  removeDiaryEntries?: (clueIds: string[]) => void;
  onBack: () => void;
  onNextStory?: (storyId: string) => void;
}

export function MemoryRouteGame({ story, initialSpaceIdx = 0, diary, addToDiary, removeDiaryEntries, onBack, onNextStory }: MemoryRouteGameProps) {
  const [phase, setPhase] = useState<Phase>('dossier');
  const [finishing, setFinishing] = useState(false);
  const [spaceIndex] = useState(initialSpaceIdx);
  const [tutorialDone, setTutorialDone] = useState(false);
  const narratorColor = NARRATOR_COLOR[story.narrator] ?? '#C8B89A';
  const activeSpace = story.spaces[spaceIndex];
  const getDiaryIdsForSpace = () =>
    activeSpace?.clues
      .filter((clue) => diary.some((entry) => entry.clueId === clue.id))
      .map((clue) => clue.id) ?? [];
  const [collectedIds, setCollectedIds] = useState<string[]>(getDiaryIdsForSpace);
  const requiredClueCount = activeSpace?.clues.length ?? 0;
  const foundInSpaceCount = activeSpace?.clues.filter((clue) => collectedIds.includes(clue.id)).length ?? 0;
  const archiveReady = requiredClueCount > 0 && foundInSpaceCount >= requiredClueCount;

  // Kill any lingering audio on mount/unmount
  useEffect(() => {
    AudioManager.stop();
    return () => { AudioManager.stop(); AudioSynth.stopAmbient(); AudioSynth.stopBackgroundMusic(); };
  }, []);

  // Start background music when entering explore phase
  useEffect(() => {
    if (phase === 'explore') {
      AudioSynth.startBackgroundMusic();
    } else {
      AudioSynth.stopBackgroundMusic();
    }
  }, [phase]);

  useEffect(() => {
    setCollectedIds((prev) => Array.from(new Set([...prev, ...getDiaryIdsForSpace()])));
  }, [diary, activeSpace]);



  const handleBack = () => {
    playClick();
    AudioManager.stop();
    AudioSynth.stopAmbient();
    AudioSynth.stopBackgroundMusic();
    onBack();
  };

  const handleFinish = () => {
    if (!archiveReady) return;
    if (finishing) return;
    playClick();
    OralHistoryAudio.stop();
    AudioSynth.stopAmbient();
    AudioSynth.stopBackgroundMusic();
    setFinishing(true);
    setTimeout(() => {
      AudioManager.stop();
      setFinishing(false);
      setPhase('ending');
    }, 600);
  };

  const handleCollect = (clueId: string) => {
    playDiscover();
    setCollectedIds((prev) => prev.includes(clueId) ? prev : [...prev, clueId]);

    const clue = activeSpace.clues.find((candidate) => candidate.id === clueId);
    if (!clue) return;

    addToDiary({
      clueId,
      spaceLabel: activeSpace.label,
      narratorName: story.narrator,
      narratorColor,
      clueLabel: clue.label,
      quote: clue.quote,
      voiceNote: clue.voiceNote,
      foundAt: Date.now(),
    });
  };

  const handleRestart = () => {
    playClick();
    AudioManager.stop();
    OralHistoryAudio.stop();
    AudioSynth.stopAmbient();
    AudioSynth.stopBackgroundMusic();
    removeDiaryEntries?.(activeSpace.clues.map((c) => c.id));
    setCollectedIds([]);
    setPhase('dossier');
  };

  // ── Dossier phase ──
  if (phase === 'dossier') {
    return (
      <div className="h-screen flex flex-col relative bg-[#0a0806] overflow-hidden">
        <header className="relative z-30 flex items-center px-5 py-3 bg-black/30 border-b border-amber-200/5">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-white/60 hover:text-white font-serif text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Map
          </button>
        </header>
        <SpaceDossier
          story={story}
          space={activeSpace}
          narratorColor={narratorColor}
          onEnter={() => setPhase('explore')}
        />
      </div>
    );
  }

  // ── Ending phase ──
  if (phase === 'ending') {
    return (
      <EndingCannotBeMoved
        story={story}
        activeSpace={activeSpace}
        diary={diary}
        onRestart={handleRestart}
        onChooseOther={handleBack}
        onNextStory={onNextStory}
      />
    );
  }

  // ── Explore phase ──
  return (
    <div className="h-screen flex flex-col relative bg-[#FCFAF2] overflow-hidden">
      <div className="absolute inset-0 giay-oly opacity-20 pointer-events-none" />
      <div className="absolute inset-0 vintage-vignette pointer-events-none z-[5]" />

      {/* Top header */}
      <header className="relative z-30 flex items-center justify-between px-5 py-3 bg-black/60 backdrop-blur-sm border-b border-white/8">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-white/60 hover:text-white font-serif text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Map
        </button>

        <div className="text-center">
          <p className="font-serif text-sm font-bold text-white leading-none tracking-wide uppercase">{activeSpace.label}</p>
          <p className="font-mono text-[10px] text-white/65 uppercase tracking-widest mt-0.5">{story.title}</p>
          <p className="font-mono text-[9px] text-white/35 uppercase tracking-wider">{story.narrator}</p>
        </div>

        <button
          data-tutorial="archive"
          onClick={archiveReady ? handleFinish : undefined}
          disabled={!archiveReady}
          title={archiveReady ? undefined : `Find all ${requiredClueCount} memory fragments first`}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-serif text-sm transition-all"
          style={archiveReady ? {
            background: narratorColor,
            border: `1px solid ${narratorColor}`,
            color: '#0a0806',
            boxShadow: '0 0 12px rgba(200,168,130,0.45)',
          } : {
            background: 'transparent',
            border: `1px solid rgba(255,255,255,0.15)`,
            color: 'rgba(255,255,255,0.3)',
            cursor: 'not-allowed',
          }}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          Complete Archive
          <span className="font-mono text-[10px] opacity-70">
            {foundInSpaceCount}/{requiredClueCount}
          </span>
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
          tutorialDone={tutorialDone}
        />
      </main>

      {/* Fade-to-black on archive complete */}
      <AnimatePresence>
        {finishing && (
          <motion.div
            className="absolute inset-0 z-[300] bg-[#080706] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Tutorial overlay — shown once per explore entry */}
      {!tutorialDone && (
        <TutorialOverlay
          steps={EXPLORE_TUTORIAL}
          onDone={() => setTutorialDone(true)}
        />
      )}
    </div>
  );
}
