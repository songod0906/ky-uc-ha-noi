import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { Story } from '../types';
import { MemorySpace as MemorySpaceComponent } from './MemorySpace';
import { EndingCannotBeMoved } from './EndingCannotBeMoved';
import { TutorialOverlay, TutorialStep } from './TutorialOverlay';
import { AudioSynth } from '../utils/AudioSynth';
import { AudioManager } from '../utils/AudioManager';
import { ChevronLeft, CheckSquare } from 'lucide-react';
import { SpaceDossier } from './SpaceDossier';
import { OralHistoryPlayer } from './OralHistoryPlayer';

const NARRATOR_COLOR: Record<string, string> = {
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
    title: 'Mảnh ký ức ẩn ở đây',
    body: 'Nhấp vào những điểm sáng để nghe câu chuyện và khám phá ký ức.',
    cta: 'Bắt đầu khám phá!',
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
  const [clueModalOpen, setClueModalOpen] = useState(false);
  const [exploreTutorialDone, setExploreTutorialDone] = useState(false);
  const oralAudioRef = useRef<HTMLAudioElement | null>(null);
  const [oralAudioActive, setOralAudioActive] = useState(false);

  const narratorColor = NARRATOR_COLOR[story.narrator] ?? '#C8B89A';
  const activeSpace = story.spaces[spaceIndex];

  // Belt-and-suspenders: also stop via ref cleanup if component unmounts unexpectedly
  useEffect(() => () => { AudioManager.stop(); }, []);

  const startOralAudio = (space: Story['spaces'][number]) => {
    if (!space.audioSegment) return;
    const el = AudioManager.play(space.audioSegment.src, space.audioSegment.startSec, 0.75, space.audioSegment.endSec);
    oralAudioRef.current = el;
    setOralAudioActive(true);
  };

  const handleCollect = (clueId: string) => {
    if (!collectedIds.includes(clueId)) {
      setCollectedIds((prev) => [...prev, clueId]);
      AudioSynth.playPluck(330, 1.2, 0.3);
    }
  };

  // Auto-collect all clues when entering a space — anchors removed, audio plays automatically
  useEffect(() => {
    const ids = activeSpace.clues.map(c => c.id);
    setCollectedIds(prev => {
      const newIds = ids.filter(id => !prev.includes(id));
      return newIds.length ? [...prev, ...newIds] : prev;
    });
  }, [activeSpace.id]);

  const handleFinish = () => {
    AudioManager.stop();
    oralAudioRef.current = null;
    setOralAudioActive(false);
    setPhase('ending');
  };

  // Restart = back to cassette tape so oral history replays from the start
  const handleRestart = () => {
    AudioManager.stop();
    oralAudioRef.current = null;
    setOralAudioActive(false);
    setCollectedIds([]);
    setPhase('dossier');
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
            Bản đồ
          </button>
        </header>
        <SpaceDossier
          story={story}
          space={activeSpace}
          narratorColor={narratorColor}
          onEnter={() => {
            startOralAudio(activeSpace);
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
    <div className="h-screen flex flex-col relative bg-[#FCFAF2] overflow-hidden">
      <div className="absolute inset-0 giay-oly opacity-20 pointer-events-none" />
      <div className="absolute inset-0 vintage-vignette pointer-events-none z-50" />

      {/* Top header */}
      <header className="relative z-30 flex items-center justify-between px-5 py-3 bg-white/50 backdrop-blur-sm border-b border-muctim/8 shadow-xs">
        <button
          onClick={() => { AudioManager.stop(); onBack(); }}
          className="flex items-center gap-1.5 text-muctim-faded hover:text-muctim font-serif text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Bản đồ
        </button>

        <div className="text-center">
          <p className="font-serif text-sm font-bold text-muctim leading-none">{activeSpace.label}</p>
          <p className="font-mono text-[9px] text-muctim-faded uppercase tracking-widest">
            {story.narrator} · {story.title}
          </p>
        </div>

        <button
          onClick={handleFinish}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-serif text-sm transition-all"
          style={{
            background: allFound ? narratorColor : 'rgba(0,0,0,0.05)',
            color: allFound ? '#0a0806' : 'rgba(0,0,0,0.4)',
            border: `1px solid ${allFound ? narratorColor : 'rgba(0,0,0,0.1)'}`,
          }}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          {allFound ? 'Rời khỏi' : `${collected}/${total}`}
        </button>
      </header>

      {/* Main scene */}
      <main className="flex-1 min-h-0 relative z-10">
        <AnimatePresence mode="wait">
          <MemorySpaceComponent
            key={activeSpace.id}
            space={activeSpace}
            story={story}
            collectedIds={collectedIds}
            onCollect={handleCollect}
            onClueModalChange={setClueModalOpen}
          />
        </AnimatePresence>

        {/* Floating oral history player */}
        {oralAudioActive && oralAudioRef.current && (
          <OralHistoryPlayer
            key={activeSpace.id}
            audioEl={oralAudioRef.current}
            narratorName={story.narrator}
            narratorColor={narratorColor}
            paused={clueModalOpen}
          />
        )}
      </main>

      {/* Tutorial */}
      {!exploreTutorialDone && (
        <TutorialOverlay
          steps={EXPLORE_TUTORIAL}
          onDone={() => setExploreTutorialDone(true)}
        />
      )}
    </div>
  );
}
