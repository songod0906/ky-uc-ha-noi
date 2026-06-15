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

  const [showLeaveWarning, setShowLeaveWarning] = useState(false);

  const handleCollect = (clueId: string) => {
    if (!collectedIds.includes(clueId)) {
      setCollectedIds((prev) => [...prev, clueId]);
      AudioSynth.playPluck(330, 1.2, 0.3);
    }
  };

  const handleFinish = () => {
    AudioManager.stop();
    oralAudioRef.current = null;
    setOralAudioActive(false);
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
      <div className="absolute inset-0 vintage-vignette pointer-events-none z-[5]" />

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
          {allFound ? 'Hoàn thành hồ sơ' : 'Rời đi sớm'}
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

        {/* Floating memory tracker checklist */}
        <div className="absolute top-20 left-4 z-20 max-w-[240px] bg-[#FCFAF2]/85 backdrop-blur-md border border-muctim/15 rounded-2xl p-4 shadow-lg font-serif">
          <p className="font-mono text-[8px] text-muctim-faded uppercase tracking-widest mb-1.5">
            Nhiệm vụ lưu trữ
          </p>
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-muctim/10">
            <span className="text-xs font-bold text-muctim">Tiến độ lưu trữ</span>
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
                  <span className={found ? 'text-muctim-faded line-through' : 'text-muctim font-medium'}>
                    {clue.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating oral history player */}
        {oralAudioActive && oralAudioRef.current && (
          <OralHistoryPlayer
            key={activeSpace.id}
            audioEl={oralAudioRef.current}
            narratorName={story.narrator}
            narratorColor={narratorColor}
            paused={clueModalOpen}
            storyId={story.id}
          />
        )}
      </main>

      {/* Warning confirmation modal */}
      {showLeaveWarning && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#FCFAF2] border border-muctim/15 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-muctim mb-2">Hồ sơ chưa hoàn tất</h3>
            <p className="font-serif text-xs text-muctim-faded leading-relaxed mb-6">
              Một số mảnh ký ức về <span className="font-bold text-muctim">{activeSpace.label}</span> chưa được lưu trữ. Nếu rời đi bây giờ, những ký ức này sẽ bị san phẳng vào năm 2026 và biến mất vĩnh viễn. Bạn có chắc chắn muốn rời đi?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveWarning(false)}
                className="flex-1 py-2 rounded-xl border border-muctim/20 text-muctim font-serif text-xs font-semibold hover:bg-muctim/5 transition-all"
              >
                Quay lại tìm kiếm
              </button>
              <button
                onClick={() => {
                  setShowLeaveWarning(false);
                  handleFinish();
                }}
                className="flex-1 py-2 bg-amber-700 text-white font-serif text-xs font-semibold rounded-xl hover:bg-amber-800 transition-all shadow-sm"
              >
                Chấp nhận rời đi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
