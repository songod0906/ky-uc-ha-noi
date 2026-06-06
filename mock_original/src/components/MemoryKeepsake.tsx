import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { AudioSynth } from '../utils/AudioSynth';
import { Heart, RefreshCcw, Home, Smile, Library } from 'lucide-react';

interface MemoryKeepsakeProps {
  collectedKeys: string[];
  onLoopBack: () => void;
}

export const MemoryKeepsake: React.FC<MemoryKeepsakeProps> = ({
  collectedKeys,
  onLoopBack,
}) => {
  // Play beautiful acoustic plucks on diary load
  useEffect(() => {
    AudioSynth.playGuitarArpeggio();
    // Start wind so there is a soft, background rustling
    AudioSynth.startAmbient('wind');
    return () => {
      AudioSynth.stopAmbient();
    };
  }, []);

  // Standard nostalgic diary list if the user didn't find any during their session
  const defaultKeepSakes = [
    'Nỗi hờn dỗi lướt qua sân chơi vắng buổi tan trường, khi hai đứa giận nhau chẳng chịu nhường xích đu gỉ.',
    'Những con phố rợp bóng keo lả lướt gió heo may, chẳng bóng xe hơi năm 2010 yên bình kì lạ.',
    'Khúc cầm dội lên từ ban công rỉ vệt hoa vàng vữa nát, hòa quyện hương sả lừng gánh ốc vỉa hè.'
  ];

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 max-w-xl mx-auto w-full md:min-h-[550px]">
      {/* Diary Card styled like authentic vintage notepad paper with ring binder on top */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 90, damping: 14 }}
        className="relative w-full bg-[#f6efe2] border border-[#dfd4be] p-6 rounded-2xl shadow-lg select-none min-h-[460px] overflow-hidden vintage-vignette"
      >
        {/* Notebook binding rings mock */}
        <div className="absolute top-0 inset-x-0 h-4 flex justify-around px-8 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-4 h-6 border-2 border-[#b8ab90] bg-[#e6ddc8] rounded-full -translate-y-3 shadow-inner" />
          ))}
        </div>

        {/* Giấy ô ly lines overlaid with soft brownish toner */}
        <div className="absolute inset-0 giay-oly opacity-15 pointer-events-none" />
        
        {/* Handwriting content container */}
        <div className="pt-6 relative z-10 font-handwritten">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-[#dfd4be]/60 pb-3 mb-6">
            <h2 className="text-3xl font-bold text-muctim tracking-wide font-handwritten">
              Những điều cất giữ lại...
            </h2>
            <span className="font-mono text-xs text-[#8f7d63] uppercase tracking-widest bg-[#ebe3d0] px-2 py-0.5 rounded-md">
              Di chúc Tuổi Thơ
            </span>
          </div>

          <p className="text-[#6b583f] text-lg leading-relaxed mb-6 italic">
            "Hà Nội ngày chuyển mùa se se lạnh. Cuốn nhật ký cũ kẹp nhành phượng khô úa, thắp lên những mẩu chuyện nhỏ ta góp nhặt dọc khoảng sân bóng xế chiều."
          </p>

          {/* Active collected list */}
          <div className="space-y-4">
            {collectedKeys.length > 0 ? (
              collectedKeys.map((item, index) => (
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.15 }}
                  key={index}
                  className="flex items-start gap-3 border-b border-dashed border-[#dfd4be]/60 pb-3"
                >
                  <span className="text-xl text-terracotta mt-0.5">✒️</span>
                  <p className="text-muctim text-lg tracking-wide leading-relaxed">
                    {item}
                  </p>
                </motion.div>
              ))
            ) : (
              // If none collected, show basic memories with a small nudge
              defaultKeepSakes.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 border-b border-dashed border-[#dfd4be]/60 pb-3"
                >
                  <span className="text-xl text-terracotta mt-0.5">✏️</span>
                  <p className="text-muctim-faded text-lg tracking-wide leading-relaxed">
                    {item}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Unlocked status stats */}
          <div className="mt-8 flex items-center justify-between text-[#8f7d63] text-sm font-sans italic border-t border-[#dfd4be]/40 pt-4">
            <span className="flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-nangthu" /> 
              {collectedKeys.length > 0 
                ? `Đã gom nhặt ${collectedKeys.length} khoảnh khắc di sản.` 
                : "Tìm đom đóm lóng lánh để ghi lại khoảnh khắc."
              }
            </span>
            <span>Thái Thịnh & Thành Công 🍂</span>
          </div>
        </div>
      </motion.div>

      {/* Looping navigation layout - back to children home */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <button
          onClick={() => {
            AudioSynth.playSnap();
            onLoopBack();
          }}
          className="px-6 py-3.5 bg-gradient-to-r from-terracotta to-nangthu text-white font-serif text-sm font-bold rounded-2xl shadow-md hover:shadow-lg hover:scale-103 active:scale-97 transition-all flex items-center justify-center gap-3"
        >
          {/* Miniature origami colored representation */}
          <div className="relative w-5 h-5 flex items-center justify-center">
            <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-muctim rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-nangthu rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-sage rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-terracotta rounded-br-sm" />
          </div>
          Trở về đón ánh Nắng Thu (Chơi lại)
        </button>
      </motion.div>
    </div>
  );
};
