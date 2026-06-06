import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AudioSynth } from '../utils/AudioSynth';
import { Map, MapPin, Navigation, Eye, CornerRightDown } from 'lucide-react';
import { MemoryLocation } from '../types';

interface MemoryMapProps {
  location: MemoryLocation;
  onTransitionComplete: () => void;
}

export const MemoryMap: React.FC<MemoryMapProps> = ({ location, onTransitionComplete }) => {
  const [bloomPhase, setBloomPhase] = useState<'folded' | 'unfolding' | 'bloomed'>('folded');

  useEffect(() => {
    // 1. Unfolding state
    const t1 = setTimeout(() => {
      setBloomPhase('unfolding');
      AudioSynth.playSnap();
    }, 800);

    // 2. Bloomed map state
    const t2 = setTimeout(() => {
      setBloomPhase('bloomed');
      AudioSynth.playGuitarArpeggio();
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleDiveIn = () => {
    AudioSynth.playSnap();
    onTransitionComplete();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[580px] w-full max-w-2xl mx-auto px-4 py-8">
      {/* Immersive unfolding flat sheet paper wrapper */}
      <motion.div
        initial={{ rotateX: 45, rotateY: 15, scale: 0.82, opacity: 0 }}
        animate={{
          rotateX: bloomPhase === 'bloomed' ? 0 : 15,
          rotateY: bloomPhase === 'bloomed' ? 0 : 5,
          scale: bloomPhase === 'bloomed' ? 1 : 0.92,
          opacity: 1,
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="w-full bg-white border-2 border-muctim/15 rounded-3xl p-6 shadow-xl relative select-none overflow-hidden duration-700"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Giấy ô ly background inside the unfolding template */}
        <div className="absolute inset-0 giay-oly opacity-45 pointer-events-none" />
        <div className="absolute top-2 right-4 text-[10px] font-mono text-muctim-faded uppercase tracking-widest z-10">
          Khuôn Vẽ Kính Vạn Hoa • B7
        </div>

        {/* Creases overlays that fade out as paper flattens */}
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-0">
          {/* Vertical crease */}
          <motion.div
            animate={{ opacity: bloomPhase === 'bloomed' ? 0 : 0.25 }}
            className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-muctim-faded dash-border"
          />
          {/* Horizontal crease */}
          <motion.div
            animate={{ opacity: bloomPhase === 'bloomed' ? 0 : 0.25 }}
            className="absolute top-1/2 left-0 right-0 h-[1px] bg-muctim-faded dash-border"
          />
          {/* Diagonal creases */}
          <motion.div
            animate={{ opacity: bloomPhase === 'bloomed' ? 0 : 0.15 }}
            className="absolute inset-0 origin-top-left border-t border-r border-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, transparent 49.5%, rgba(74, 62, 117, 0.45) 50%, transparent 50.5%)',
            }}
          />
        </div>

        {/* Map Header with washi tape style */}
        <div className="relative mb-6 z-10 flex flex-col items-center">
          <div className="bg-nangthu/25 text-muctim px-6 py-1.5 transform -rotate-1 shadow-xs border-r-2 border-l-2 border-dashed border-nangthu font-handwritten text-xl font-bold tracking-wide relative mb-3">
            📌 Bản đồ nếp gấp sổ tay
          </div>
          <h2 className="font-serif text-2xl font-bold text-muctim text-center">
            {location.title}
          </h2>
          <p className="text-xs font-mono text-muctim-faded tracking-widest uppercase mt-1">
            {location.subTitle}
          </p>
        </div>

        {/* Handdrawn Map Box */}
        <div className="relative h-64 w-full border border-muctim/10 rounded-2xl bg-[#fdfaf2] overflow-hidden z-10 shadow-inner flex items-center justify-center">
          {/* Shimmering ink line sketches */}
          {bloomPhase === 'folded' && (
            <div className="font-serif text-muctim-faded italic text-sm animate-pulse">
              Gập bốn cánh thư...
            </div>
          )}

          {bloomPhase === 'unfolding' && (
            <div className="font-handwritten text-muctim text-xl animate-bounce">
              Nếp vẽ đang nhú mầm ký ức...
            </div>
          )}

          {bloomPhase === 'bloomed' && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Handdrawn SVG graphics to represent the detailed retro neighborhood structure */}
              <svg viewBox="0 0 400 250" className="w-full h-full p-2 opacity-85">
                <g stroke="#4a3e75" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  {/* Roads & Pathways */}
                  <path d="M 20 60 Q 150 70 380 50" strokeDasharray="3 3" />
                  <path d="M 50 180 Q 200 190 350 170" strokeDasharray="3 3" />
                  <path d="M 120 20 L 140 230" strokeOpacity="0.4" />
                  <path d="M 280 10 L 260 240" strokeOpacity="0.4" />

                  {/* Lakeside elements if thanh-cong */}
                  {location.id === 'thanh-cong' ? (
                    <>
                      {/* Quiet lake outline */}
                      <path d="M 30 110 C 60 90, 150 90, 180 120 C 190 140, 140 180, 80 170 C 40 160, 20 130, 30 110 Z" fill="#7d9b84" fillOpacity="0.15" strokeWidth="2" />
                      <text x="65" y="140" fill="#4a3e75" className="font-serif text-[12px] italic opacity-75">Hồ Thành Công</text>
                      
                      {/* Tiny fish ripples in the lake */}
                      <path d="M 55 115 A 10 3 0 0 1 65 115" />
                      <path d="M 110 135 A 8 2 0 0 1 118 135" />

                      {/* Playground structures / housing blocks */}
                      <rect x="250" y="80" width="80" height="50" rx="4" fill="#fcfaef" />
                      <line x1="250" y1="95" x2="330" y2="95" />
                      <line x1="250" y1="115" x2="330" y2="115" />
                      <text x="260" y="110" fill="#4a3e75" className="font-mono text-[9px] scale-75">Khu Tập Thể</text>
                      
                      {/* Old water well sketch */}
                      <ellipse cx="230" cy="180" rx="14" ry="7" />
                      <path d="M 230 160 L 230 180" />
                      <path d="M 220 160 A 10 10 0 0 1 240 160" />
                      <text x="215" y="200" fill="#c26d5c" className="font-handwritten text-[14px] font-bold">Giếng Cổ</text>
                    </>
                  ) : (
                    <>
                      {/* Thầy Thịnh / Thái Thịnh courtyard */}
                      {/* Net cafe */}
                      <rect x="50" y="90" width="75" height="50" rx="4" fill="#fcfaef" />
                      <text x="62" y="115" fill="#e58e26" className="font-handwritten text-[15px] font-bold">Hàng Net</text>
                      <text x="66" y="128" fill="#4a3e75" className="font-mono text-[8px]">Mái tôn đỏ</text>
                      
                      {/* Large tree covering housing */}
                      <path d="M 260 140 C 240 110, 220 110, 210 130 C 190 145, 195 180, 220 180 C 240 185, 270 170, 260 140 Z" fill="#7d9b84" fillOpacity="0.2" strokeWidth="2" />
                      <line x1="225" y1="180" x2="225" y2="210" strokeWidth="3" />
                      <text x="180" y="160" fill="#7d9b84" className="font-serif text-[11px] italic font-bold">Cây xà cừ</text>

                      {/* Small house blocks representing Thái Thịnh apartments */}
                      <rect x="240" y="60" width="110" height="60" rx="6" fill="#fcfaef" />
                      <line x1="240" y1="80" x2="350" y2="80" />
                      <line x1="240" y1="100" x2="350" y2="100" />
                      <text x="260" y="75" fill="#4a3e75" className="font-serif text-[11px] font-bold">Dãy C5 Thái Thịnh</text>
                      
                      {/* Warm star doodles */}
                      <path d="M 330 35 L 333 42 L 340 43 L 335 48 L 336 55 L 330 51 L 324 55 L 325 48 L 320 43 L 327 42 Z" fill="#e58e26" fillOpacity="0.15" />
                    </>
                  )}

                  {/* Hotspots represented visually on the handdrawn grid to prove custom hand-drawn coordinates */}
                  {location.hotspots.map((h, i) => (
                    <g key={h.id}>
                      <circle cx={h.x * 4} cy={h.y * 2.5} r="6" fill="#e58e26" fillOpacity="0.3" className="animate-ping" />
                      <circle cx={h.x * 4} cy={h.y * 2.5} r="4" fill="#c26d5c" />
                      <text x={h.x * 4 + 8} y={h.y * 2.5 + 4} fill="#4a3e75" className="font-handwritten text-[13px] font-bold bg-white/70 px-1 rounded-sm">
                        {h.label}
                      </text>
                    </g>
                  ))}
                </g>
              </svg>

              {/* Distant soft laugh label annotation */}
              <div className="absolute right-3 bottom-2 font-handwritten text-xs text-muctim-faded cursor-default flex items-center gap-1">
                🎨 Sổ nhật ký vẽ tay - 2010
              </div>
            </motion.div>
          )}
        </div>

        {/* Transition dive trigger */}
        <div className="mt-8 flex flex-col items-center">
          <AnimatePresence>
            {bloomPhase === 'bloomed' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full text-center"
              >
                <button
                  onClick={handleDiveIn}
                  className="px-8 py-3.5 bg-gradient-to-r from-muctim to-muctim-faded text-white font-serif text-base font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-103 active:scale-98 transition-all flex items-center justify-center gap-3 mx-auto group w-full sm:w-auto"
                >
                  <Navigation className="w-5 h-5 animate-pulse group-hover:rotate-45 duration-300" />
                  Mở Toang Miền Ký Ức (Gia Nhập Splat 3D)
                </button>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muctim-faded font-sans">
                  <Eye className="w-3.5 h-3.5 text-nangthu" /> 
                  Ánh sáng lấp lánh đang dắt tay bạn đi dạo 3D hoài cổ...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
