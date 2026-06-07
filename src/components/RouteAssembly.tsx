import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Story, Clue } from '../types';
import { AudioSynth } from '../utils/AudioSynth';
import { ArrowRight, RotateCcw, CheckCircle, XCircle, ChevronLeft, Lightbulb } from 'lucide-react';

const CLUE_ICONS: Record<string, string> = {
  place: '📍',
  sound: '🔊',
  routine: '🌀',
  object: '📦',
  loss: '🕯',
};

interface RouteAssemblyProps {
  story: Story;
  collectedIds: string[];
  onSuccess: () => void;
  onBackToExplore: () => void;
}

export function RouteAssembly({ story, collectedIds, onSuccess, onBackToExplore }: RouteAssemblyProps) {
  // Slots: array of 3, each holds a clue id or null
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null]);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [wrongCount, setWrongCount] = useState(0);
  const [showLocationHint, setShowLocationHint] = useState(false);

  const allClues = story.spaces.flatMap((s) => s.clues);
  const collectedClues = allClues.filter((c) => collectedIds.includes(c.id));
  // Clues that haven't been placed in a slot
  const unplaced = collectedClues.filter((c) => !slots.includes(c.id));

  const placeInSlot = (slotIdx: number, clueId: string) => {
    AudioSynth.playSnap();
    setFeedback('idle');
    setSlots((prev) => {
      const next = [...prev];
      // If clue already in another slot, remove it first
      const existingIdx = next.indexOf(clueId);
      if (existingIdx !== -1) next[existingIdx] = null;
      next[slotIdx] = clueId;
      return next;
    });
  };

  const removeFromSlot = (slotIdx: number) => {
    AudioSynth.playSnap();
    setFeedback('idle');
    setSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
  };

  const checkAnswer = () => {
    const correct = story.routeClueIds.every((id, i) => slots[i] === id);
    if (correct) {
      setFeedback('correct');
      AudioSynth.playGuitarArpeggio();
      setTimeout(() => onSuccess(), 1800);
    } else {
      const newCount = wrongCount + 1;
      setWrongCount(newCount);
      setFeedback('wrong');
      AudioSynth.playSnap();
      setTimeout(() => setFeedback('idle'), 1200);
    }
  };

  // Returns which space label is correct for a given slot (hint without giving exact clue)
  const slotSpaceHint = (slotIdx: number): string => {
    const correctId = story.routeClueIds[slotIdx];
    const space = story.spaces.find((s) => s.clues.some((c) => c.id === correctId));
    return space?.label ?? '?';
  };

  const getClue = (id: string | null): Clue | undefined =>
    id ? allClues.find((c) => c.id === id) : undefined;

  const slotsComplete = slots.every((s) => s !== null);

  return (
    <div className="h-screen flex flex-col items-center justify-center px-6 py-8 relative overflow-auto">
      <div className="absolute inset-0 giay-oly opacity-25 pointer-events-none" />
      <div className="absolute inset-0 vintage-vignette pointer-events-none" />

      <motion.div
        className="relative z-10 w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBackToExplore}
            className="flex items-center gap-1.5 text-muctim-faded hover:text-muctim font-serif text-sm transition-colors mx-auto mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại khám phá
          </button>
          <p className="font-mono text-[10px] text-muctim-faded uppercase tracking-widest mb-1">
            Ghép lại một ngày của {story.narrator}
          </p>
          <h2 className="font-serif text-3xl font-bold text-muctim">Lắp Ráp Ký Ức</h2>
          <p className="font-serif text-muctim-faded text-sm mt-2 max-w-sm mx-auto">
            Sắp xếp các mảnh ký ức theo đúng thứ tự trong ngày bình thường của {story.narrator}.
          </p>
        </div>

        {/* Slot labels + slots */}
        <div className="grid grid-cols-3 gap-3 mb-6" data-tutorial="slots">
          {story.routeSlotLabels.map((label, i) => {
            const placed = getClue(slots[i]);
            return (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 px-1">
                  <span className="w-5 h-5 rounded-full bg-muctim text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="font-handwritten text-xs text-muctim-faded leading-snug">{label}</p>
                </div>

                <motion.div
                  className={`min-h-24 rounded-2xl border-2 border-dashed p-3 flex flex-col items-center justify-center text-center transition-all ${
                    placed
                      ? 'border-nangthu/50 bg-nangthu-glow/40'
                      : feedback === 'wrong' && slots[i] !== null
                      ? 'border-terracotta/60 bg-terracotta/10'
                      : 'border-muctim/20 bg-white/40'
                  }`}
                  animate={feedback === 'wrong' ? { x: [-4, 4, -3, 3, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {placed ? (
                    <div className="w-full">
                      <span className="text-xl">{CLUE_ICONS[placed.type]}</span>
                      <p className="font-serif text-xs font-semibold text-muctim mt-1 leading-snug">
                        {placed.label}
                      </p>
                      <button
                        className="mt-2 font-mono text-[9px] text-muctim-faded underline"
                        onClick={() => removeFromSlot(i)}
                      >
                        xóa
                      </button>
                    </div>
                  ) : (
                    <p className="font-serif text-xs text-muctim-faded italic">Kéo mảnh vào đây</p>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Arrow dividers between slots */}
        <div className="flex justify-center gap-28 mb-6 -mt-2 pointer-events-none">
          <ArrowRight className="w-4 h-4 text-muctim/30" />
          <ArrowRight className="w-4 h-4 text-muctim/30" />
        </div>

        {/* Available clues */}
        <div className="mb-6">
          <p className="font-mono text-[10px] text-muctim-faded uppercase tracking-widest mb-3 text-center">
            Các mảnh ký ức đã thu thập — nhấn để đặt vào ô trống tiếp theo
          </p>
          <div className="flex flex-wrap gap-2 justify-center" data-tutorial="chips">
            {collectedClues.map((clue) => {
              const isPlaced = slots.includes(clue.id);
              const nextEmptySlot = slots.findIndex((s) => s === null);
              return (
                <motion.button
                  key={clue.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-serif transition-all ${
                    isPlaced
                      ? 'bg-muctim/10 border-muctim/20 text-muctim-faded opacity-50 cursor-default'
                      : 'bg-white/80 border-muctim/15 text-muctim hover:border-nangthu/50 hover:shadow-md cursor-pointer'
                  }`}
                  whileHover={!isPlaced ? { scale: 1.03 } : {}}
                  whileTap={!isPlaced ? { scale: 0.97 } : {}}
                  onClick={() => {
                    if (!isPlaced && nextEmptySlot !== -1) {
                      placeInSlot(nextEmptySlot, clue.id);
                    }
                  }}
                  disabled={isPlaced}
                >
                  <span>{CLUE_ICONS[clue.type]}</span>
                  <span>{clue.label}</span>
                  {isPlaced && <span className="text-sage text-xs">✓</span>}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Check button */}
        <div className="flex flex-col items-center gap-3">
          <AnimatePresence mode="wait">
            {feedback === 'correct' && (
              <motion.div
                key="correct"
                className="flex items-center gap-2 text-sage font-serif font-semibold"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <CheckCircle className="w-5 h-5" />
                Đúng rồi! Đang mở câu chuyện...
              </motion.div>
            )}
            {feedback === 'wrong' && (
              <motion.div
                key="wrong"
                className="flex flex-col items-center gap-1 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center gap-2 text-terracotta font-serif text-sm">
                  <XCircle className="w-4 h-4" />
                  {wrongCount === 1
                    ? `Chưa đúng — thứ tự này không khớp với một ngày của ${story.narrator}.`
                    : wrongCount === 2
                    ? 'Bạn đã rất gần rồi. Thử nghĩ theo trình tự thời gian trong ngày.'
                    : 'Ký ức đôi khi cần thêm một chút trợ giúp.'}
                </div>
                {wrongCount >= 2 && (
                  <p className="font-serif text-xs text-muctim-faded italic">
                    Gợi ý: mỗi ô tương ứng với một địa điểm khác nhau.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hint panel — appears after 3 wrong attempts */}
          <AnimatePresence>
            {wrongCount >= 3 && (
              <motion.div
                key="hint-panel"
                className="w-full rounded-2xl border border-nangthu/30 bg-nangthu-glow/30 p-4 flex flex-col gap-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center gap-2 text-muctim">
                  <Lightbulb className="w-4 h-4 text-nangthu flex-shrink-0" />
                  <p className="font-serif text-sm font-semibold">Gợi ý theo địa điểm</p>
                </div>

                <button
                  className="font-serif text-xs text-muctim-faded underline text-left"
                  onClick={() => setShowLocationHint((v) => !v)}
                >
                  {showLocationHint ? 'Ẩn gợi ý' : '🔍 Xem gợi ý — địa điểm cho mỗi ô'}
                </button>

                {showLocationHint && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {story.routeSlotLabels.map((label, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <p className="font-handwritten text-[10px] text-muctim-faded">{label}</p>
                        <div className="bg-white/70 rounded-xl px-2 py-1.5">
                          <p className="font-serif text-xs font-semibold text-muctim">{slotSpaceHint(i)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-muctim/10 pt-2">
                  <p className="font-serif text-[11px] text-muctim-faded mb-2 text-center">
                    "Có lẽ ký ức không phải lúc nào cũng được sắp xếp đúng thứ tự."
                  </p>
                  <button
                    className="w-full py-2 rounded-xl font-serif text-xs text-muctim-faded border border-muctim/20 hover:bg-muctim/5 transition-colors"
                    onClick={() => {
                      AudioSynth.playGuitarArpeggio();
                      setTimeout(() => onSuccess(), 600);
                    }}
                  >
                    📖 Tiếp tục theo cách của riêng mình →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            disabled={!slotsComplete || feedback === 'correct'}
            onClick={checkAnswer}
            className={`px-8 py-3 rounded-2xl font-serif font-semibold transition-all ${
              slotsComplete
                ? 'bg-muctim text-white hover:bg-muctim/80 shadow-lg hover:-translate-y-0.5'
                : 'bg-muctim/20 text-muctim-faded cursor-not-allowed'
            }`}
          >
            Kiểm tra thứ tự
          </button>

          <button
            className="flex items-center gap-1.5 font-serif text-xs text-muctim-faded hover:text-muctim transition-colors"
            onClick={() => {
              setSlots([null, null, null]);
              setFeedback('idle');
            }}
          >
            <RotateCcw className="w-3 h-3" />
            Xóa và làm lại
          </button>
        </div>
      </motion.div>
    </div>
  );
}
