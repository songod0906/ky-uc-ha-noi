import { motion } from 'motion/react';

interface CompassMotifProps {
  size?: number;
  spinning?: boolean;
  className?: string;
}

export function CompassMotif({ size = 64, spinning = false, className = '' }: CompassMotifProps) {
  const dirs = ['Đ', 'T', 'N', 'B'];
  const angles = [90, 270, 180, 0];

  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      animate={spinning ? { rotate: 360 } : {}}
      transition={spinning ? { repeat: Infinity, duration: 12, ease: 'linear' } : {}}
    >
      {/* Outer ring */}
      <div
        className="absolute rounded-full border border-muctim/20"
        style={{ width: size, height: size }}
      />
      {/* Inner circle */}
      <div
        className="absolute rounded-full bg-nangthu-glow/60 border border-nangthu/30"
        style={{ width: size * 0.35, height: size * 0.35 }}
      />

      {/* Needle pointing north */}
      <motion.div
        className="absolute"
        style={{ width: 2, height: size * 0.36, originY: 1 }}
        animate={spinning ? {} : { rotate: [0, 8, -4, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
      >
        <div className="w-full h-1/2 bg-terracotta rounded-t-full" />
        <div className="w-full h-1/2 bg-muctim/30 rounded-b-full" />
      </motion.div>
    </motion.div>
  );
}
