import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AudioSynth } from '../utils/AudioSynth';
import { Sparkles, ArrowRight, HelpCircle, Heart, Star, RotateCcw } from 'lucide-react';

interface OrigamiToyProps {
  onSelectMemory: (id: string) => void;
}

export const OrigamiToy: React.FC<OrigamiToyProps> = ({ onSelectMemory }) => {
  const [clickCount, setClickCount] = useState<number>(5);
  const [isSnapping, setIsSnapping] = useState<boolean>(false);
  const [snapPhase, setSnapPhase] = useState<'horizontal' | 'vertical'>('horizontal');
  const [openedFlaps, setOpenedFlaps] = useState<Record<string, boolean>>({
    Nam: false,
    Bắc: false,
    Đông: false,
    Tây: false,
  });
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);
  const [hintText, setHintText] = useState<string>('Chọn số lần gập và ấn vào hướng mong muốn');

  // Play nostalgic greeting arpeggio on load
  useEffect(() => {
    AudioSynth.playGuitarArpeggio();
  }, []);

  const handleChooseCount = (count: number) => {
    AudioSynth.playSnap();
    setClickCount(count);
    setHintText(`Đã chuẩn bị ${count} nhịp gập. Hãy click một cánh gấp để xoay!`);
  };

  // Snappy classic folding cycle
  const runSnappingCycle = async () => {
    setIsSnapping(true);
    setHintText('Đông Tây Nam Bắc đang xếp gập nhịp nhàng...');
    
    // Close all flaps for authentic cycle feel
    setOpenedFlaps({
      Nam: false,
      Bắc: false,
      Đông: false,
      Tây: false,
    });

    let currentPhase: 'horizontal' | 'vertical' = 'horizontal';
    for (let i = 0; i < clickCount; i++) {
      await new Promise((resolve) => setTimeout(resolve, 240));
      currentPhase = currentPhase === 'horizontal' ? 'vertical' : 'horizontal';
      setSnapPhase(currentPhase);
      AudioSynth.playSnap();
    }
    
    setIsSnapping(false);
  };

  const handleFlapClick = async (direction: string) => {
    if (isSnapping) return;

    // Reset previous selection and run rhythmic folding countdown
    AudioSynth.playSnap();
    await runSnappingCycle();

    // After folding cycle completes, open target flap elegantly with heavy spring
    setOpenedFlaps((prev) => ({
      ...prev,
      [direction]: true,
    }));
    setSelectedDirection(direction);
    AudioSynth.playPluck(330, 1.5, 0.35); // comforting guitar string pluck to welcome memory
    setHintText(`Cánh ${direction.toUpperCase()} đã mở! Click để xem ký ức bên dưới.`);
  };

  const handleCloseAll = () => {
    AudioSynth.playSnap();
    setOpenedFlaps({
      Nam: false,
      Bắc: false,
      Đông: false,
      Tây: false,
    });
    setSelectedDirection(null);
    setHintText('Đã đóng các góc giấy. Hãy chọn một hướng mới!');
  };

  // Card styles for elegant CSS 3D folds
  const getFlapStyle = (dir: string, isOpened: boolean): React.CSSProperties => {
    let transform = 'rotateX(0deg)';
    let origin = 'center';

    if (dir === 'Nam') {
      origin = 'top center';
      transform = isOpened ? 'rotateX(-180deg)' : 'rotateX(0deg)';
    } else if (dir === 'Bắc') {
      origin = 'bottom center';
      transform = isOpened ? 'rotateX(180deg)' : 'rotateX(0deg)';
    } else if (dir === 'Đông') {
      origin = 'left center';
      transform = isOpened ? 'rotateY(-180deg)' : 'rotateY(0deg)';
    } else if (dir === 'Tây') {
      origin = 'right center';
      transform = isOpened ? 'rotateY(180deg)' : 'rotateY(0deg)';
    }

    return {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      transformOrigin: origin,
      transform,
      transformStyle: 'preserve-3d',
      transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.3s ease',
      zIndex: isOpened ? 25 : 10,
    };
  };

  // Content mapped inside the flaps
  const getFlapContent = (dir: string) => {
    switch (dir) {
      case 'Đông':
        return {
          title: 'Góc của Trang',
          subtitle: 'Thái Thịnh, 1999',
          desc: 'Quay về ngõ nhỏ Thái Thịnh thơm lừng gánh ốc nóng cuối chiều hanh hao, rộn rã tiệm net xưa.',
          quote: '"Hương hoa sữa nồng nàn góc phố, tiếng cười giòn tan lọt qua tán xà cừ râm ran."',
          action: () => onSelectMemory('thai-thinh'),
          color: 'bg-muctim text-white hover:bg-opacity-95',
          coordinate: '105.819° E , 21.012° N'
        };
      case 'Tây':
        return {
          title: 'Ngõ của Essy',
          subtitle: 'Khu tập thể Thành Công, 1996',
          desc: 'Trở lại sân chơi giếng cổ Thành Công hòa trong tiếng cười giòn giã thuở thơ ngây và loa thể dục.',
          quote: '"Những trưa hè nhảy lò cò mướt mồ hôi, gàu nước giếng giội mát lịm cả khoảng sân."',
          action: () => onSelectMemory('thanh-cong'),
          color: 'bg-sage text-white hover:bg-opacity-95',
          coordinate: '105.812° E , 21.018° N'
        };
      case 'Nam':
        return {
          title: 'Ước mơ thơ bé',
          subtitle: 'Sân phơi lộng gió',
          desc: 'Vẽ một cánh diều gác mái nhặt nhạnh từ trang giấy nháp học trò, gieo ước vọng bay cao.',
          quote: '"Khi lớn lên, tớ sẽ đạp xe chở hết ước mơ của cậu đi khắp thế giới..."',
          action: null,
          color: 'bg-terracotta text-white hover:bg-opacity-95',
          coordinate: 'Kỷ niệm học trò'
        };
      case 'Bắc':
        return {
          title: 'Bí mật sổ tay',
          subtitle: 'Audition Perfect x5',
          desc: 'Trang thơ chép vội bằng mực tím: Hôm nay mượn chiếc máy tính đạt Perfect nhảy Audition tận 5 lần liên tiếp!',
          quote: '"Hà Nội chiều đổ giông rào, hàng net cúp điện đột ngột nhưng cả bọn vẫn nhảy cười vang."',
          action: null,
          color: 'bg-nangthu text-muctim hover:bg-opacity-95',
          coordinate: 'Lưu bút năm ấy'
        };
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-4 px-4 w-full max-w-xl mx-auto z-10 select-none">
      
      {/* Title section with a vintage storybook frame */}
      <div className="text-center mb-6">
        <span className="inline-block px-3 py-1 bg-terracotta/15 text-terracotta rounded-full font-handwritten text-lg mb-2">
          Ký Ức Tuổi Thơ Hà Nội
        </span>
        <h1 className="font-serif text-3xl font-semibold text-muctim tracking-tight mb-2">
          Đông Tây Nam Bắc
        </h1>
        <p className="font-serif italic text-sm text-muctim-faded max-w-sm mx-auto leading-relaxed">
          "Chiếc đồ chơi gập bằng giấy thô ráp ấm nắng, lướt nhẹ ngón tay khẽ mở từng lát cắt ký ức rực rỡ."
        </p>
      </div>

      {/* Snap counter selector */}
      <div className="w-full bg-white/70 backdrop-blur-xs border border-muctim/10 rounded-2xl p-4 shadow-xs mb-6">
        <div className="text-xs font-mono text-muctim-faded text-center mb-2.5 tracking-wider uppercase">
          Chọn số nhịp quay ký ức (Lần gập)
        </div>
        <div className="flex justify-center gap-3">
          {[3, 5, 8, 10].map((num) => (
            <button
              key={num}
              onClick={() => handleChooseCount(num)}
              className={`w-12 h-10 rounded-xl font-serif text-base font-semibold transition-all shadow-xs duration-300 ${
                clickCount === num
                  ? 'bg-nangthu text-white shadow-md scale-105'
                  : 'bg-white hover:bg-nangthu-light text-muctim border border-muctim/10'
              }`}
              disabled={isSnapping}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* 2D STRICT WORKSPACE CONTAINER & SUBTLE PAPER TEXTURE */}
      <div 
        className="relative w-full h-[370px] sm:h-[410px] bg-[#fbf8ed] rounded-3xl border border-muctim/10 shadow-lg overflow-hidden flex items-center justify-center my-2 group outline outline-offset-1 outline-amber-200/40"
        style={{ perspective: '1200px' }}
      >
        {/* Subtle grid background suggesting old school sketchbook */}
        <div className="absolute inset-0 giay-oly opacity-40 pointer-events-none" />
        
        {/* Squeezable container representing mouth snapping action */}
        <motion.div
          id="origami-paper-board"
          className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
          animate={isSnapping ? {
            scaleX: snapPhase === 'horizontal' ? 1.14 : 0.84,
            scaleY: snapPhase === 'horizontal' ? 0.84 : 1.14,
            rotateZ: snapPhase === 'horizontal' ? -1 : 1,
          } : {
            scaleX: 1,
            scaleY: 1,
            rotateZ: 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 15,
          }}
        >
          {/********************* TOP FLAP - NAM *********************/}
          <div 
            style={getFlapStyle('Nam', openedFlaps.Nam)}
            onClick={() => handleFlapClick('Nam')}
            className="group/flap"
          >
            {/* FRONT FACE (Terracotta, points down to center) */}
            <div 
              className="absolute inset-0 w-full h-full bg-linear-to-b from-terracotta to-terracotta/90 filter hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer shadow-md select-none flex items-center justify-center"
              style={{ 
                clipPath: 'polygon(0 0, 100% 0, 50% 50%)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div className="absolute top-[16%] flex flex-col items-center text-center">
                <span className="font-serif text-lg font-bold tracking-widest text-[#fbf8ed]">NAM</span>
                <span className="font-handwritten text-base italic text-[#fbf8ed]/85 mt-0.5">Cây bàng</span>
              </div>
            </div>

            {/* BACK FACE (Flipped Cream Paper, hand-written notes) */}
            <div 
              className="absolute inset-0 w-full h-full bg-[#fcfaf2] border border-muctim/5 shadow-inner select-none flex items-center justify-center"
              style={{ 
                clipPath: 'polygon(0 0, 100% 0, 50% 50%)',
                transform: 'rotateX(-180deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              {/* Back side text aligned upright */}
              <div className="absolute top-[16%] flex flex-col items-center text-center px-4 w-full">
                <span className="font-serif text-[10px] font-bold tracking-widest text-muctim-faded uppercase">Ước Mơ</span>
                <span className="font-handwritten text-lg font-bold text-[#4B0082] mt-0.5 leading-tight">Sân phơi diều</span>
                <span className="font-mono text-[9px] text-[#4B0082]/70 mt-1">Hà Nội 1996</span>
              </div>
            </div>
          </div>

          {/********************* BOTTOM FLAP - BẮC *********************/}
          <div 
            style={getFlapStyle('Bắc', openedFlaps.Bắc)}
            onClick={() => handleFlapClick('Bắc')}
            className="group/flap"
          >
            {/* FRONT FACE (Orange, points up to center) */}
            <div 
              className="absolute inset-0 w-full h-full bg-linear-to-t from-nangthu to-nangthu/90 filter hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer shadow-md select-none flex items-center justify-center"
              style={{ 
                clipPath: 'polygon(0 100%, 100% 100%, 50% 50%)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div className="absolute bottom-[16%] flex flex-col items-center text-center rotate-180">
                <span className="font-serif text-lg font-bold tracking-widest text-[#fbf8ed]">BẮC</span>
                <span className="font-handwritten text-base italic text-[#fbf8ed]/85 mt-0.5">Giếng cũ</span>
              </div>
            </div>

            {/* BACK FACE (Flipped Cream Paper, hand-written notes) */}
            <div 
              className="absolute inset-0 w-full h-full bg-[#fcfaf2] border border-muctim/5 shadow-inner select-none flex items-center justify-center"
              style={{ 
                clipPath: 'polygon(0 100%, 100% 100%, 50% 50%)',
                transform: 'rotateX(180deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div className="absolute bottom-[16%] flex flex-col items-center text-center rotate-180 px-4 w-full">
                <span className="font-serif text-[10px] font-bold tracking-widest text-muctim-faded uppercase">Nhật Ký</span>
                <span className="font-handwritten text-lg font-bold text-[#4B0082] mt-0.5 leading-tight">Audition x5</span>
                <span className="font-mono text-[9px] text-[#4B0082]/70 mt-1">Pen Ink #4B0082</span>
              </div>
            </div>
          </div>

          {/********************* LEFT FLAP - ĐÔNG *********************/}
          <div 
            style={getFlapStyle('Đông', openedFlaps.Đông)}
            onClick={() => handleFlapClick('Đông')}
            className="group/flap"
          >
            {/* FRONT FACE (Deep Blue, points right to center) */}
            <div 
              className="absolute inset-0 w-full h-full bg-linear-to-r from-muctim to-[#3e3463] filter hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer shadow-md select-none flex items-center justify-center"
              style={{ 
                clipPath: 'polygon(0 0, 0 100%, 50% 50%)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div className="absolute left-[14%] top-1/2 -translate-y-1/2 flex flex-col items-center text-center -rotate-90">
                <span className="font-serif text-lg font-bold tracking-widest text-[#fbf8ed]">ĐÔNG</span>
                <span className="font-handwritten text-base italic text-[#fbf8ed]/85 mt-0.5">Xe đạp</span>
              </div>
            </div>

            {/* BACK FACE (Flipped Cream Paper, hand-written notes) */}
            <div 
              className="absolute inset-0 w-full h-full bg-[#fcfaf2] border border-muctim/5 shadow-inner select-none flex items-center justify-center"
              style={{ 
                clipPath: 'polygon(0 0, 0 100%, 50% 50%)',
                transform: 'rotateY(-180deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div className="absolute left-[14%] top-1/2 -translate-y-1/2 flex flex-col items-center text-center -rotate-90 px-4 w-full">
                <span className="font-serif text-[10px] font-bold tracking-widest text-muctim-faded uppercase font-bold">Trang</span>
                <span className="font-handwritten text-[15px] font-bold text-[#4B0082] mt-0.5 whitespace-nowrap">Thái Thịnh 99</span>
                <span className="font-mono text-[9px] text-[#4B0082]/70 mt-1">Cổ vật gánh ốc</span>
              </div>
            </div>
          </div>

          {/********************* RIGHT FLAP - TÂY *********************/}
          <div 
            style={getFlapStyle('Tây', openedFlaps.Tây)}
            onClick={() => handleFlapClick('Tây')}
            className="group/flap"
          >
            {/* FRONT FACE (Muted Green, points left to center) */}
            <div 
              className="absolute inset-0 w-full h-full bg-linear-to-l from-sage to-sage/95 filter hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer shadow-md select-none flex items-center justify-center"
              style={{ 
                clipPath: 'polygon(100% 0, 100% 100%, 50% 50%)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div className="absolute right-[14%] top-1/2 -translate-y-1/2 flex flex-col items-center text-center rotate-90">
                <span className="font-serif text-lg font-bold tracking-widest text-[#fbf8ed]">TÂY</span>
                <span className="font-handwritten text-base italic text-[#fbf8ed]/85 mt-0.5">Nóc nhà</span>
              </div>
            </div>

            {/* BACK FACE (Flipped Cream Paper, hand-written notes) */}
            <div 
              className="absolute inset-0 w-full h-full bg-[#fcfaf2] border border-muctim/5 shadow-inner select-none flex items-center justify-center"
              style={{ 
                clipPath: 'polygon(100% 0, 100% 100%, 50% 50%)',
                transform: 'rotateY(180deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div className="absolute right-[14%] top-1/2 -translate-y-1/2 flex flex-col items-center text-center rotate-90 px-4 w-full">
                <span className="font-serif text-[10px] font-bold tracking-widest text-muctim-faded uppercase">Essy</span>
                <span className="font-handwritten text-[15px] font-bold text-[#4B0082] mt-0.5 whitespace-nowrap">Thành Công 96</span>
                <span className="font-mono text-[9px] text-[#4B0082]/70 mt-1">Sân chơi giếng</span>
              </div>
            </div>
          </div>

          {/* DELICATE CENTRAL PINK ENAMEL FLOWER RIVET */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none drop-shadow-md">
            <div className="w-8 h-8 rounded-full bg-linear-to-r from-pink-400 to-rose-300 border border-white/70 shadow-md flex items-center justify-center transition-transform group-hover:scale-105">
              {/* Inner golden centerpiece */}
              <div className="w-2.5 h-2.5 rounded-full bg-amber-200 border border-amber-400/80 shadow-xs" />
              {/* Pressed line textures */}
              <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/40 transform -translate-x-1/2" />
              <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-white/40 transform -translate-y-1/2" />
              {/* Tiny gold speckle */}
              <div className="absolute w-1 h-1 rounded-full bg-amber-400 opacity-60 top-1 left-2.5" />
            </div>
          </div>

        </motion.div>

        {/* Vintage copper photo-album corner mounts */}
        <div className="absolute top-4 left-4 w-5 h-5 rounded-tl-lg border-t-2 border-l-2 border-muctim/20 pointer-events-none" />
        <div className="absolute top-4 right-4 w-5 h-5 rounded-tr-lg border-t-2 border-r-2 border-muctim/20 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-5 h-5 rounded-bl-lg border-b-2 border-l-2 border-muctim/20 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-5 h-5 rounded-br-lg border-b-2 border-r-2 border-muctim/20 pointer-events-none" />

        {/* Dynamic closed count badge */}
        <div className="absolute top-4 right-4 bg-white/80 border border-muctim/10 text-[10px] font-mono text-muctim px-2 py-0.5 rounded-full z-20">
          Nhịp đập: {clickCount}
        </div>
      </div>

      {/* Guide/Hint banner stating exact designated serif prompt below canvas as requested */}
      <div className="text-center mt-3 mb-6 select-none z-20">
        <p className="font-serif text-muctim text-base font-semibold tracking-wide">
          Chọn số lần gập và ấn vào hướng mong muốn
        </p>
        <p className="font-handwritten text-terracotta text-lg mt-1 tracking-wide leading-relaxed">
          {hintText}
        </p>
      </div>

      {/* Unfolding Flap results */}
      <div className="w-full h-44 relative z-20">
        <div className="flex justify-center mb-2">
          {Object.values(openedFlaps).some(Boolean) && (
            <button
              onClick={handleCloseAll}
              className="flex items-center gap-1.5 text-xs font-serif text-terracotta hover:text-terracotta/80 py-1 px-3 bg-white border border-terracotta/20 rounded-full shadow-xs hover:shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Xếp các cánh giấy lại
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {selectedDirection && openedFlaps[selectedDirection] && (
            <motion.div
              key={selectedDirection}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute inset-x-0 top-0 bg-white border border-muctim/10 rounded-2xl p-4 shadow-md overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-nangthu/40 to-transparent" />
              {(() => {
                const content = getFlapContent(selectedDirection);
                if (!content) return null;
                return (
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-serif text-xs font-bold text-muctim-faded tracking-widest uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-nangthu" /> Cánh mở hướng {selectedDirection}
                        </span>
                        <span className="text-[10px] text-muctim-faded font-mono">
                          {content.coordinate}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-muctim flex items-baseline gap-2">
                        {content.title}
                        <span className="font-handwritten text-sm text-terracotta font-medium font-normal italic">({content.subtitle})</span>
                      </h3>
                      <p className="text-sm font-serif text-muctim-faded mt-1 leading-relaxed">
                        {content.desc}
                      </p>
                      {content.quote && (
                        <p className="font-handwritten italic text-terracotta text-lg mt-1 whitespace-pre-line leading-snug">
                          {content.quote}
                        </p>
                      )}
                    </div>
                    
                    {content.action ? (
                      <button
                        onClick={() => {
                          AudioSynth.playSnap();
                          content.action?.();
                        }}
                        className={`w-full mt-3 py-2.5 px-4 rounded-xl font-serif text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs ${content.color} active:scale-98`}
                      >
                        Mở ký ức vàng son <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-serif text-muctim-faded mt-3 italic bg-nangthu-light/50 p-2 rounded-lg border border-muctim/5">
                        <HelpCircle className="w-3.5 h-3.5 text-nangthu shrink-0" /> Vui lòng click chọn cánh <b>Đông</b> hoặc <b>Tây</b> để dịch chuyển vào bản đồ Splat 3D.
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          )}

          {!Object.values(openedFlaps).some(Boolean) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-xs font-mono text-muctim-faded pt-8 flex flex-col items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-nangthu-glow/50 flex items-center justify-center animate-bounce">
                <Heart className="w-4 h-4 text-terracotta fill-terracotta/40" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-serif text-muctim-faded">
                <Star className="w-3.5 h-3.5 text-nangthu fill-nangthu" /> 
                Rê chuột lên mô hình để xem nét gấp nổi và bấm chọn để bắt đầu
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
