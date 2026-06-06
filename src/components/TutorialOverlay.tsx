import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export interface TutorialStep {
  id: string;
  /** CSS selector of the element to spotlight */
  selector: string;
  /** Where to place the tooltip relative to the spotlight */
  placement: 'above' | 'below' | 'left' | 'right';
  title: string;
  body: string;
  /** Label on the advance button */
  cta?: string;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 10; // px padding around the spotlight rect

interface TutorialOverlayProps {
  steps: TutorialStep[];
  onDone: () => void;
}

export function TutorialOverlay({ steps, onDone }: TutorialOverlayProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const step = steps[stepIdx];

  // Measure the target element on each step change
  const measure = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.selector);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({
      top: r.top - PAD,
      left: r.left - PAD,
      width: r.width + PAD * 2,
      height: r.height + PAD * 2,
    });
  }, [step]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const advance = () => {
    if (stepIdx < steps.length - 1) {
      setStepIdx((i) => i + 1);
    } else {
      onDone();
    }
  };

  if (!step) return null;

  // Tooltip position relative to the spotlight rect
  const tooltipStyle = (): React.CSSProperties => {
    if (!rect) return { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' };
    const GAP = 20;
    switch (step.placement) {
      case 'above':
        return {
          position: 'fixed',
          top: rect.top - GAP,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'below':
        return {
          position: 'fixed',
          top: rect.top + rect.height + GAP,
          left: rect.left + rect.width / 2,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          position: 'fixed',
          top: rect.top + rect.height / 2,
          left: rect.left - GAP,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          position: 'fixed',
          top: rect.top + rect.height / 2,
          left: rect.left + rect.width + GAP,
          transform: 'translateY(-50%)',
        };
    }
  };

  // CSS triangle pointing toward the spotlight
  const arrowStyle = (): React.CSSProperties => {
    const size = 10;
    const base: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      pointerEvents: 'none',
    };
    switch (step.placement) {
      case 'above':
        return {
          ...base,
          bottom: -size,
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: `${size}px solid transparent`,
          borderRight: `${size}px solid transparent`,
          borderTop: `${size}px solid #FCFAF2`,
        };
      case 'below':
        return {
          ...base,
          top: -size,
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: `${size}px solid transparent`,
          borderRight: `${size}px solid transparent`,
          borderBottom: `${size}px solid #FCFAF2`,
        };
      case 'left':
        return {
          ...base,
          right: -size,
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: `${size}px solid transparent`,
          borderBottom: `${size}px solid transparent`,
          borderLeft: `${size}px solid #FCFAF2`,
        };
      case 'right':
        return {
          ...base,
          left: -size,
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: `${size}px solid transparent`,
          borderBottom: `${size}px solid transparent`,
          borderRight: `${size}px solid #FCFAF2`,
        };
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[200] pointer-events-none">
      {/* Dark overlay — click-through except the bottom dismiss */}
      <div className="absolute inset-0 bg-muctim/70" style={{ pointerEvents: 'all' }} onClick={advance} />

      {/* Spotlight cutout via box-shadow trick */}
      {rect && (
        <motion.div
          key={step.id + '-spotlight'}
          className="absolute rounded-2xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow: '0 0 0 9999px rgba(74,62,117,0.72)',
            borderRadius: 14,
            zIndex: 201,
          }}
        />
      )}

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          className="relative bg-[#FCFAF2] rounded-2xl shadow-2xl border border-muctim/10 p-5 w-72"
          style={{ ...tooltipStyle(), zIndex: 202, pointerEvents: 'all' }}
          initial={{ opacity: 0, scale: 0.9, y: step.placement === 'above' ? 8 : -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        >
          {/* Notebook grid texture */}
          <div className="absolute inset-0 giay-oly opacity-20 pointer-events-none rounded-2xl" />

          {/* CSS arrow pointing at spotlight */}
          <div style={arrowStyle()} />

          {/* Content */}
          <div className="relative">
            {/* Step counter */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-300 ${
                      i === stepIdx ? 'w-4 h-2 bg-muctim' : 'w-2 h-2 bg-muctim/20'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={onDone}
                className="text-muctim-faded hover:text-muctim transition-colors"
                title="Bỏ qua hướng dẫn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-serif text-base font-bold text-muctim mb-1.5">{step.title}</h3>
            <p className="font-serif text-sm text-muctim-faded leading-relaxed mb-4">{step.body}</p>

            <button
              onClick={advance}
              className="w-full py-2.5 bg-muctim text-white font-serif text-sm font-semibold rounded-xl hover:bg-muctim/80 transition-all"
            >
              {step.cta ?? (stepIdx < steps.length - 1 ? 'Tiếp theo →' : 'Bắt đầu khám phá!')}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
