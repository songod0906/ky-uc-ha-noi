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

const PAD = 10;           // px padding around the spotlight rect
const TOOLTIP_W = 288;    // w-72 = 18rem = 288px
const TOOLTIP_MARGIN = 12; // min gap to viewport edges

interface TutorialOverlayProps {
  steps: TutorialStep[];
  onDone: () => void;
}

interface Layout {
  tooltipStyle: React.CSSProperties;
  /** How far the arrow should be shifted along the tooltip's main axis (px) */
  arrowShift: number;
}

export function TutorialOverlay({ steps, onDone }: TutorialOverlayProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const step = steps[stepIdx];

  // Measure the target element on each step change.
  // Uses a rAF retry to catch elements that mount on the same frame.
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
    const rafId = requestAnimationFrame(measure); // retry after paint
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  const advance = () => {
    if (stepIdx < steps.length - 1) {
      setStepIdx((i) => i + 1);
    } else {
      onDone();
    }
  };

  if (!step) return null;

  // Compute tooltip position with viewport clamping.
  // arrowShift: positive = shift arrow toward positive axis (right for h, down for v).
  // NOTE: Do NOT use CSS `transform` in tooltipStyle — Framer Motion overrides the
  // entire transform property with its own animation values, silently dropping any
  // CSS translate/translateY you set here. All positioning must be pure pixel values.
  const computeLayout = (): Layout => {
    const GAP = 20;
    const TOOLTIP_EST_H = 220;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (!rect) {
      return {
        tooltipStyle: {
          position: 'fixed',
          top: Math.round((vh - TOOLTIP_EST_H) / 2),
          left: Math.round((vw - TOOLTIP_W) / 2),
        },
        arrowShift: 0,
      };
    }

    const spotCX = rect.left + rect.width / 2;
    const spotCY = rect.top + rect.height / 2;

    // Horizontal: clamp so tooltip never clips viewport edges
    const hCenter = (cx: number) =>
      Math.max(TOOLTIP_MARGIN, Math.min(vw - TOOLTIP_W - TOOLTIP_MARGIN, cx - TOOLTIP_W / 2));

    switch (step.placement) {
      case 'above': {
        const left = hCenter(spotCX);
        // Bottom of tooltip sits GAP above spotlight top; shift up by estimated height
        const top = Math.max(TOOLTIP_MARGIN, rect.top - GAP - TOOLTIP_EST_H);
        return {
          tooltipStyle: { position: 'fixed', top, left },
          arrowShift: spotCX - (left + TOOLTIP_W / 2),
        };
      }
      case 'below': {
        const left = hCenter(spotCX);
        const top = Math.min(
          vh - TOOLTIP_EST_H - TOOLTIP_MARGIN,
          rect.top + rect.height + GAP,
        );
        return {
          tooltipStyle: { position: 'fixed', top, left },
          arrowShift: spotCX - (left + TOOLTIP_W / 2),
        };
      }
      case 'left': {
        const top = Math.max(TOOLTIP_MARGIN, Math.min(vh - TOOLTIP_EST_H - TOOLTIP_MARGIN, spotCY - TOOLTIP_EST_H / 2));
        const left = Math.max(TOOLTIP_MARGIN, rect.left - GAP - TOOLTIP_W);
        return {
          tooltipStyle: { position: 'fixed', top, left },
          arrowShift: spotCY - (top + TOOLTIP_EST_H / 2),
        };
      }
      case 'right': {
        const top = Math.max(TOOLTIP_MARGIN, Math.min(vh - TOOLTIP_EST_H - TOOLTIP_MARGIN, spotCY - TOOLTIP_EST_H / 2));
        const left = Math.min(vw - TOOLTIP_W - TOOLTIP_MARGIN, rect.left + rect.width + GAP);
        return {
          tooltipStyle: { position: 'fixed', top, left },
          arrowShift: spotCY - (top + TOOLTIP_EST_H / 2),
        };
      }
    }
  };

  const { tooltipStyle, arrowShift } = computeLayout();

  // CSS triangle pointing toward the spotlight.
  // arrowShift adjusts position along the tooltip edge so it still points at the target
  // even when the tooltip has been clamped away from its ideal centered position.
  const arrowStyle = (): React.CSSProperties => {
    const size = 10;
    const base: React.CSSProperties = { position: 'absolute', width: 0, height: 0, pointerEvents: 'none' };
    switch (step.placement) {
      case 'above':
        return {
          ...base,
          bottom: -size,
          left: `calc(50% + ${arrowShift}px)`,
          transform: 'translateX(-50%)',
          borderLeft: `${size}px solid transparent`,
          borderRight: `${size}px solid transparent`,
          borderTop: `${size}px solid #FCFAF2`,
        };
      case 'below':
        return {
          ...base,
          top: -size,
          left: `calc(50% + ${arrowShift}px)`,
          transform: 'translateX(-50%)',
          borderLeft: `${size}px solid transparent`,
          borderRight: `${size}px solid transparent`,
          borderBottom: `${size}px solid #FCFAF2`,
        };
      case 'left':
        return {
          ...base,
          right: -size,
          top: `calc(50% + ${arrowShift}px)`,
          transform: 'translateY(-50%)',
          borderTop: `${size}px solid transparent`,
          borderBottom: `${size}px solid transparent`,
          borderLeft: `${size}px solid #FCFAF2`,
        };
      case 'right':
        return {
          ...base,
          left: -size,
          top: `calc(50% + ${arrowShift}px)`,
          transform: 'translateY(-50%)',
          borderTop: `${size}px solid transparent`,
          borderBottom: `${size}px solid transparent`,
          borderRight: `${size}px solid #FCFAF2`,
        };
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[200] pointer-events-none">
      {/* Dark overlay — clicking it advances to next step */}
      <div className="absolute inset-0 bg-muctim/70" style={{ pointerEvents: 'all' }} onClick={advance} />

      {/* Spotlight cutout via box-shadow trick */}
      {rect && (
        <motion.div
          key={step.id + '-spotlight'}
          className="absolute pointer-events-none"
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
          style={{ ...tooltipStyle, zIndex: 202, pointerEvents: 'all' }}
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
                title="Skip tutorial"
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
              {step.cta ?? (stepIdx < steps.length - 1 ? 'Next →' : 'Begin Exploration!')}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
