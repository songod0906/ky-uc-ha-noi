import { useState, useEffect } from 'react';
import { DiaryEntry, Story } from '../types';
import { MemorySpace as MemorySpaceComponent } from './MemorySpace';
import { EndingCannotBeMoved } from './EndingCannotBeMoved';
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

interface MemoryRouteGameProps {
  story: Story;
  initialSpaceIdx?: number;
  singleSpaceMode?: boolean;
  diary: DiaryEntry[];
  addToDiary: (entry: DiaryEntry) => void;
  onBack: () => void;
}

export function MemoryRouteGame({ story, initialSpaceIdx = 0, diary, addToDiary, onBack }: MemoryRouteGameProps) {
  const [phase, setPhase] = useState<Phase>('dossier');
  const [spaceIndex] = useState(initialSpaceIdx);
  const narratorColor = NARRATOR_COLOR[story.narrator] ?? '#C8B89A';
  const activeSpace = story.spaces[spaceIndex];
  const getDiaryIdsForSpace = () =>
    activeSpace?.clues
      .filter((clue) => diary.some((entry) => entry.clueId === clue.id))
      .map((clue) => clue.id) ?? [];
  const [collectedIds, setCollectedIds] = useState<string[]>(getDiaryIdsForSpace);

  // Kill any lingering audio on mount/unmount
  useEffect(() => {
    AudioManager.stop();
    return () => { AudioManager.stop(); AudioSynth.stopAmbient(); };
  }, []);

  useEffect(() => {
    setCollectedIds((prev) => Array.from(new Set([...prev, ...getDiaryIdsForSpace()])));
  }, [diary, activeSpace]);

  useEffect(() => {
    if (phase !== 'explore') return;
    const ambientType = activeSpace?.clues.find((clue) => clue.ambient)?.ambient;
    if (ambientType) AudioSynth.startAmbient(ambientType);
    return () => AudioSynth.stopAmbient();
  }, [phase, activeSpace]);

  const handleBack = () => {
    AudioManager.stop();
    AudioSynth.stopAmbient();
    onBack();
  };

  const handleFinish = () => {
    AudioManager.stop();
    AudioSynth.stopAmbient();
    setPhase('ending');
  };

  const handleCollect = (clueId: string) => {
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
      foundAt: Date.now(),
    });
  };

  const handleRestart = () => {
    AudioManager.stop();
    AudioSynth.stopAmbient();
    setCollectedIds(getDiaryIdsForSpace());
    setPhase('dossier');
  };

  // ── Dossier phase ──
  if (phase === 'dossier') {
    return (
      <div className="h-screen flex flex-col relative bg-[#0a0806] overflow-hidden">
        <header className="relative z-30 flex items-center px-5 py-3 bg-black/30 border-b border-amber-200/5">
          <button
            onClick={handleBack}
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
        diary={diary}
        onRestart={handleRestart}
        onChooseOther={handleBack}
      />
    );
  }

  // ── Explore phase ──
  return (
    <div className="h-screen flex flex-col relative bg-[#FCFAF2] overflow-hidden">
      <div className="absolute inset-0 giay-oly opacity-20 pointer-events-none" />
      <div className="absolute inset-0 vintage-vignette pointer-events-none z-[5]" />

      {/* Top header */}
      <header className="relative z-30 flex items-center justify-between px-5 py-3 bg-white/50 backdrop-blur-sm border-b border-muctim/8 shadow-xs">
        <button
          onClick={handleBack}
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
          onClick={handleFinish}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-serif text-sm transition-all shadow-[0_0_12px_rgba(200,168,130,0.45)]"
          style={{
            background: narratorColor,
            border: `1px solid ${narratorColor}`,
            color: '#0a0806',
          }}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          Complete Archive
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
      </main>
    </div>
  );
}
