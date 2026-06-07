import { motion } from 'motion/react';
import { CompassMotif } from './CompassMotif';
import { AudioSynth } from '../utils/AudioSynth';

interface GameStartProps {
  onBegin: () => void;
}

export function GameStart({ onBegin }: GameStartProps) {
  const handleBegin = () => {
    AudioSynth.playGuitarArpeggio();
    AudioSynth.startAmbient('wind');
    onBegin();
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 giay-oly opacity-30 pointer-events-none" />
      <div className="absolute inset-0 vintage-vignette pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-8 max-w-lg text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <CompassMotif size={80} />

        <div className="space-y-3">
          <motion.h1
            className="font-serif text-4xl md:text-5xl font-bold text-muctim leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Ký Ức Hà Nội
          </motion.h1>
          <motion.p
            className="font-handwritten text-xl text-nangthu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Đông · Tây · Nam · Bắc
          </motion.p>
        </div>

        <motion.p
          className="font-serif text-base text-muctim-faded leading-relaxed max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Hai khu phố ở Hà Nội sắp bị giải tỏa. Hai người đã lớn lên ở đó.
          <br className="hidden sm:block" />
          <span className="italic mt-2 block">
            Đi theo họ. Tìm mảnh ký ức. Ghép lại một ngày bình thường trước khi nó biến mất.
          </span>
        </motion.p>

        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <button
            onClick={handleBegin}
            className="px-8 py-3 bg-muctim text-white font-serif text-lg font-semibold rounded-2xl hover:bg-muctim/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Bắt đầu
          </button>
          <p className="font-mono text-[10px] text-muctim-faded uppercase tracking-widest">
            CAS3020 · Digital Arts & Sciences · 2026
          </p>
        </motion.div>
      </motion.div>

      {/* Decorative scattered dots representing locations on a map */}
      {[
        { top: '20%', left: '12%', delay: 1.2 },
        { top: '70%', left: '80%', delay: 1.4 },
        { top: '35%', right: '8%', delay: 1.6 },
        { bottom: '20%', left: '20%', delay: 1.8 },
      ].map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-nangthu/40"
          style={pos as React.CSSProperties}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: pos.delay, type: 'spring' }}
        />
      ))}
    </div>
  );
}
