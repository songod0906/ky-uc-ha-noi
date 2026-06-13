import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Story } from '../types';
import { MemorySpace } from './MemorySpace';
import { MovementControls } from './MovementControls';
import { NotebookInventory } from './NotebookInventory';
import { RouteAssembly } from './RouteAssembly';
import { EndingCannotBeMoved } from './EndingCannotBeMoved';
import { CompassMotif } from './CompassMotif';
import { TutorialOverlay, TutorialStep } from './TutorialOverlay';
import { AudioSynth } from '../utils/AudioSynth';
import { BookOpen, Puzzle, ChevronLeft } from 'lucide-react';
import { FortuneFolder } from './FortuneFolder';
import { TRANG_FORTUNE, TRANG_DIR_SPACES } from '../data/fortuneContent';

type Phase = 'explore' | 'assemble' | 'ending';

// Tutorial for stories with arrow-based navigation (non-TRANG)
const EXPLORE_TUTORIAL: TutorialStep[] = [
  {
    id: 'clue',
    selector: '[data-tutorial="clue"]',
    placement: 'below',
    title: 'Mảnh ký ức ẩn ở đây',
    body: 'Những điểm sáng này chứa mảnh ký ức. Nhấp vào để nghe câu chuyện và thu thập.',
  },
  {
    id: 'notebook',
    selector: '[data-tutorial="notebook"]',
    placement: 'left',
    title: 'Sổ tay của bạn',
    body: 'Mảnh ký ức thu được lưu vào đây. Cần ít nhất 4 mảnh để mở câu đố lắp ráp.',
  },
  {
    id: 'nav',
    selector: '[data-tutorial="nav"]',
    placement: 'above',
    title: 'Di chuyển giữa các không gian',
    body: 'Dùng các nút này để đi qua ba không gian trong câu chuyện. Mỗi nơi có mảnh ký ức riêng.',
    cta: 'Bắt đầu khám phá!',
  },
];

// Tutorial for TRANG story — fortune folder is the only way to navigate
const FORTUNE_EXPLORE_TUTORIAL: TutorialStep[] = [
  {
    id: 'clue',
    selector: '[data-tutorial="clue"]',
    placement: 'below',
    title: 'Mảnh ký ức ẩn ở đây',
    body: 'Những điểm sáng này chứa mảnh ký ức. Nhấp vào để nghe câu chuyện và thu thập.',
  },
  {
    id: 'notebook',
    selector: '[data-tutorial="notebook"]',
    placement: 'left',
    title: 'Sổ tay của bạn',
    body: 'Mảnh ký ức thu được lưu vào đây. Cần ít nhất 4 mảnh để mở câu đố lắp ráp.',
  },
  {
    id: 'fortune',
    selector: '[data-tutorial="fortune"]',
    placement: 'left',
    title: 'Dùng bói giấy để di chuyển',
    body: 'Chọn một hướng (BẮC / NAM / TÂY / ĐÔNG) → chọn số bước → xem giấy mở ra → chọn một ô bên trong để khám phá ký ức. Mỗi hướng dẫn tới một không gian khác nhau.',
    cta: 'Bắt đầu khám phá!',
  },
];

const ASSEMBLE_TUTORIAL: TutorialStep[] = [
  {
    id: 'slots',
    selector: '[data-tutorial="slots"]',
    placement: 'below',
    title: 'Ghép lại một ngày',
    body: 'Ba ô này là ba thời điểm trong ngày bình thường. Xếp đúng thứ tự để mở câu chuyện.',
  },
  {
    id: 'chips',
    selector: '[data-tutorial="chips"]',
    placement: 'above',
    title: 'Mảnh ký ức đã thu thập',
    body: 'Nhấp vào từng mảnh để đặt vào ô tiếp theo. Đặt sai? Nhấn "xóa" rồi thử lại.',
    cta: 'Hiểu rồi, thử nào!',
  },
];

interface MemoryRouteGameProps {
  story: Story;
  initialSpaceIdx?: number;
  singleSpaceMode?: boolean;  // skip cross-space navigation and assembly puzzle
  onBack: () => void;
}

export function MemoryRouteGame({ story, initialSpaceIdx = 0, singleSpaceMode = false, onBack }: MemoryRouteGameProps) {
  const [phase, setPhase] = useState<Phase>('explore');
  const [spaceIndex, setSpaceIndex] = useState(initialSpaceIdx);
  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [exploreTutorialDone, setExploreTutorialDone] = useState(false);
  const [assembleTutorialDone, setAssembleTutorialDone] = useState(false);
  // Which space the fortune folder is hinting at (subtle glow on the space chip)
  const [hintedSpaceId, setHintedSpaceId] = useState<string | undefined>(undefined);

  const hasFortune = false; // temporarily disabled for nav testing

  const activeSpace = story.spaces[spaceIndex];
  const totalClues = singleSpaceMode
    ? activeSpace.clues.length
    : story.spaces.flatMap((s) => s.clues).length;
  const cluesNeeded = singleSpaceMode
    ? Math.max(1, activeSpace.clues.length)
    : story.cluesNeededToUnlock;
  const canUnlock = collectedIds.length >= cluesNeeded;

  const handleCollect = (clueId: string) => {
    if (!collectedIds.includes(clueId)) {
      setCollectedIds((prev) => [...prev, clueId]);
    }
  };

  const handleMoveToSpace = (idx: number) => {
    if (singleSpaceMode) return; // locked to one space
    AudioSynth.playSnap();
    AudioSynth.startAmbient('wind');
    setSpaceIndex(idx);
  };

  // Called by FortuneFolder after counting finishes — navigate to the space
  const handleFortuneNavigate = (spaceId: string | null) => {
    if (!spaceId) return; // ĐÔNG direction: no navigation, just reveals memory
    const idx = story.spaces.findIndex((s) => s.id === spaceId);
    if (idx !== -1) handleMoveToSpace(idx);
  };

  const handleStartAssembly = () => {
    AudioSynth.stopAmbient();
    AudioSynth.playGuitarArpeggio();
    // In singleSpaceMode there is no cross-space puzzle — go straight to case file
    setPhase(singleSpaceMode ? 'ending' : 'assemble');
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
      <>
        <RouteAssembly
          story={story}
          collectedIds={collectedIds}
          onSuccess={handleAssemblySuccess}
          onBackToExplore={() => setPhase('explore')}
        />
        {!assembleTutorialDone && (
          <TutorialOverlay
            steps={ASSEMBLE_TUTORIAL}
            onDone={() => setAssembleTutorialDone(true)}
          />
        )}
      </>
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
    <div className="h-screen flex flex-col relative bg-[#FCFAF2] overflow-hidden">
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
            data-tutorial="notebook"
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

      {/* Main scene area — fills all remaining height */}
      <main className="flex-1 flex min-h-0 relative z-10">

        {/* ── Left column: scene + bottom nav ── */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Scene panel */}
          <div className="flex-1 min-h-0 w-full">
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

          {/* Compact bottom bar: nav + space chips — hidden in singleSpaceMode */}
          {!singleSpaceMode && (
          <div className="shrink-0 bg-[#FCFAF2]/95 backdrop-blur-sm border-t border-muctim/10 px-4 pt-2 pb-3">
            {!hasFortune && (
              <div data-tutorial="nav">
                <MovementControls
                  spaces={story.spaces}
                  currentIndex={spaceIndex}
                  onMove={handleMoveToSpace}
                />
              </div>
            )}

            <div className={`flex gap-2 justify-center flex-wrap ${hasFortune ? '' : 'mt-2'}`}>
              {story.spaces.map((space, i) => {
                const spaceCollected = space.clues.filter((c) => collectedIds.includes(c.id)).length;
                const isCurrent = i === spaceIndex;
                const isHinted = hintedSpaceId === space.id && !isCurrent;
                // For TRANG: chips are visual-only indicators (fortune teller navigates)
                return (
                  <motion.button
                    key={space.id}
                    onClick={hasFortune ? undefined : () => handleMoveToSpace(i)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-serif transition-all ${
                      hasFortune ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      isCurrent
                        ? 'bg-muctim text-white border-muctim shadow'
                        : isHinted
                          ? 'bg-nangthu-glow/60 border-nangthu/40 text-muctim'
                          : 'bg-white/60 border-muctim/15 text-muctim'
                    }`}
                    animate={
                      isHinted
                        ? { boxShadow: ['0 0 0 0px rgba(180,150,50,0)', '0 0 0 4px rgba(180,150,50,0.2)', '0 0 0 0px rgba(180,150,50,0)'] }
                        : { boxShadow: '0 0 0 0px rgba(0,0,0,0)' }
                    }
                    transition={isHinted ? { duration: 1.8, repeat: Infinity } : {}}
                  >
                    <span>{space.label}</span>
                    <span
                      className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${
                        isCurrent ? 'bg-white/20 text-white' : 'bg-muctim/10 text-muctim-faded'
                      }`}
                    >
                      {spaceCollected}/{space.clues.length}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
          )} {/* end !singleSpaceMode */}
        </div>

        {/* ── Right panel: Fortune Folder (TRANG story only) ── */}
        {hasFortune && (
          <div
            data-tutorial="fortune"
            className="shrink-0 flex flex-col items-center justify-center border-l border-muctim/8 bg-[#FAF7EE]/80 backdrop-blur-sm"
            style={{ width: 192 }}
          >
            {/* Aged paper label above */}
            <p
              className="mb-3 tracking-[0.22em] font-bold"
              style={{
                fontFamily: "'Noto Serif', serif",
                fontSize: '7.5px',
                color: '#8a7050',
                opacity: 0.55,
                letterSpacing: '0.22em',
              }}
            >
              ĐÔNG · TÂY · NAM · BẮC
            </p>

            <FortuneFolder
              contentMap={TRANG_FORTUNE}
              dirSpaces={TRANG_DIR_SPACES}
              currentSpaceId={story.spaces[spaceIndex].id}
              onNavigate={handleFortuneNavigate}
              onReveal={(_dir, _panel, content) => {
                // Glow the hinted space chip after reveal
                if (content.spaceHint) setHintedSpaceId(content.spaceHint);
                setTimeout(() => setHintedSpaceId(undefined), 5000);
              }}
            />
          </div>
        )}
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

      {/* Tutorial overlay for explore phase — fortune variant for TRANG */}
      {!exploreTutorialDone && (
        <TutorialOverlay
          steps={hasFortune ? FORTUNE_EXPLORE_TUTORIAL : EXPLORE_TUTORIAL}
          onDone={() => setExploreTutorialDone(true)}
        />
      )}
    </div>
  );
}
