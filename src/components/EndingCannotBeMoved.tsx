import { motion } from 'motion/react';
import { Story } from '../types';
import { AudioSynth } from '../utils/AudioSynth';
import { useEffect } from 'react';
import { RotateCcw, FileText } from 'lucide-react';
import { CompassMotif } from './CompassMotif';

interface EndingCannotBeMovedProps {
  story: Story;
  onRestart: () => void;
  onChooseOther: () => void;
}

export function EndingCannotBeMoved({ story, onRestart, onChooseOther }: EndingCannotBeMovedProps) {
  useEffect(() => {
    AudioSynth.stopAmbient();
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center px-6 py-16 relative overflow-auto">
      <div className="absolute inset-0 giay-oly opacity-30 pointer-events-none" />
      <div className="absolute inset-0 vintage-vignette pointer-events-none" />
      {/* Dark gradient from top for gravity */}
      <div className="absolute inset-0 bg-gradient-to-b from-muctim/5 via-transparent to-transparent pointer-events-none" />

      <motion.div
        className="relative z-10 w-full max-w-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Admin-style case header */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm border border-muctim/15 rounded-2xl p-5 mb-8 shadow-sm font-mono text-xs text-muctim-faded"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
            <div><span className="opacity-50">SỐ HỒ SƠ</span><br /><span className="text-muctim font-bold">GTC-2026-{story.id.toUpperCase()}</span></div>
            <div><span className="opacity-50">QUẬN</span><br /><span className="text-muctim">{story.id === 'trang' ? 'Đống Đa' : 'Đống Đa'}</span></div>
            <div><span className="opacity-50">DỰ ÁN</span><br /><span className="text-muctim">Giải tỏa mặt bằng — Quy hoạch đô thị 2026</span></div>
            <div>
              <span className="opacity-50">THỜI GIAN SINH SỐNG</span>
              <br />
              <span className="text-muctim">Toàn bộ tuổi thơ</span>
            </div>
            <div><span className="opacity-50">THỜI HẠN THÔNG BÁO</span><br /><span className="text-terracotta font-bold">90 ngày</span></div>
            <div><span className="opacity-50">NARRATOR</span><br /><span className="text-muctim font-bold">{story.narrator}</span></div>
          </div>
        </motion.div>

        {/* Section title */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <FileText className="w-5 h-5 text-muctim-faded" />
          <h2 className="font-serif text-2xl font-bold text-muctim">Những điều không thể mang đi</h2>
        </motion.div>

        {/* The list — plain, spaced, no styling */}
        <motion.ul
          className="space-y-5 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {story.cannotBeMoved.map((item, i) => (
            <motion.li
              key={i}
              className="font-serif text-base text-muctim leading-relaxed pl-0 border-l-0"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + i * 0.18 }}
            >
              {item}
            </motion.li>
          ))}
        </motion.ul>

        {/* Compass + restart */}
        <motion.div
          className="flex flex-col items-center gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <CompassMotif size={52} />

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onRestart}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl border border-muctim/20 bg-white/70 font-serif text-sm text-muctim hover:bg-white transition-all shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Nghe lại
            </button>
            <button
              onClick={onChooseOther}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-muctim text-white font-serif text-sm hover:bg-muctim/80 transition-all shadow"
            >
              Về bản đồ
            </button>
          </div>

          <p className="font-mono text-[9px] text-muctim-faded uppercase tracking-widest text-center">
            Dự án Ký ức Sổ Tay · CAS3020 · VinUniversity · 2026
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
