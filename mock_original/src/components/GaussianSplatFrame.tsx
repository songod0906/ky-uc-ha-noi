import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AudioSynth } from '../utils/AudioSynth';
import { MemoryLocation, Hotspot } from '../types';
import { 
  Volume2, VolumeX, Sparkles, Plus, CheckCircle, ArrowRight, 
  Tv, Compass, HelpCircle, Music, RefreshCw
} from 'lucide-react';

interface GaussianSplatFrameProps {
  location: MemoryLocation;
  collectedKeepsakes: string[];
  onAddKeepsake: (keepsake: string) => void;
  onGoToKeepsakes: () => void;
}

export const GaussianSplatFrame: React.FC<GaussianSplatFrameProps> = ({
  location,
  collectedKeepsakes,
  onAddKeepsake,
  onGoToKeepsakes,
}) => {
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [addedMemoryIds, setAddedMemoryIds] = useState<{ [key: string]: boolean }>({});
  
  // Parallax calculations
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Sound loop initialization for the location default ambient sound
  useEffect(() => {
    if (!isMuted) {
      // play a gentle starter music
      AudioSynth.startAmbient('wind');
    } else {
      AudioSynth.stopAmbient();
    }
    return () => {
      AudioSynth.stopAmbient();
    };
  }, [isMuted, location]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

    setParallaxOffset({ x: x * 20, y: y * 20 });
  };

  const handleMouseLeave = () => {
    setParallaxOffset({ x: 0, y: 0 });
  };

  const handleHotspotClick = (hotspot: Hotspot) => {
    AudioSynth.playSnap();
    setActiveHotspot(hotspot);
    
    if (!isMuted) {
      AudioSynth.startAmbient(hotspot.ambientSoundTrigger);
    }
  };

  const handleAddKeepsakeItem = (item: string) => {
    AudioSynth.playSnap();
    onAddKeepsake(item);
    setAddedMemoryIds(prev => ({ ...prev, [item]: true }));
  };

  // Sound active status check
  const isSoundPlaying = (hotspot: Hotspot) => {
    return activeHotspot?.id === hotspot.id && !isMuted;
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 max-w-3xl mx-auto w-full">
      {/* Upper digital washi tape container holding scrapbook header style */}
      <div className="relative w-full flex flex-col items-center mb-6">
        {/* Washi Tape Strip */}
        <div className="absolute -top-4 bg-amber-100/70 border-r-4 border-l-4 border-dashed border-amber-300 text-muctim-faded/90 px-8 py-1 shadow-sm font-handwritten text-lg transform -rotate-1 tracking-wider z-20 pointer-events-none select-none">
          {location.washiTitle}
        </div>
        
        {/* Story details */}
        <div className="text-center pt-8 px-4">
          <h2 className="font-serif text-2xl font-black text-muctim flex items-center justify-center gap-2">
            🌿 {location.title}
          </h2>
          <p className="font-serif text-xs text-muctim-faded italic mt-1 leading-relaxed max-w-lg mx-auto">
            {location.description}
          </p>
        </div>
      </div>

      {/* Main 3D Gaussian Splat Box with Parallax */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-[380px] bg-sky-950 rounded-2xl overflow-hidden border-4 border-white shadow-xl flex items-center justify-center group cursor-crosshair select-none"
      >
        {/* Soft yellow twilight sunbeams filter - Ghibli / retro lighting */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#fbf5e6]/5 to-[#e58e26]/12 mix-blend-color-burn z-14 pointer-events-none" />
        <div className="absolute inset-0 bg-[#e58e26]/3 pointer-events-none z-14 mix-blend-color" />
        {/* Old CRT / film grain scans */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_60%,_rgba(0,0,0,0.45))] z-13 pointer-events-none" />

        {/* Parallax Background Layer - blur sky & hills */}
        <div 
          className="absolute inset-0 scale-110 transition-transform duration-200"
          style={{
            transform: `translate(${parallaxOffset.x * -0.5}px, ${parallaxOffset.y * -0.5}px)`,
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=1200&q=80" // golden sunbeams dust photo
            alt="Hanoi sun rays sky background"
            className="w-full h-full object-cover blur-md opacity-25 brightness-50"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Parallax Middle Layer: The core physical memory scan */}
        <div 
          className="absolute inset-0 scale-105 transition-transform duration-100 ease-out flex items-center justify-center"
          style={{
            transform: `translate(${parallaxOffset.x * 0.4}px, ${parallaxOffset.y * 0.4}px)`,
            filter: 'sepia(0.35) saturate(1.15) contrast(1.02) hue-rotate(-8deg)'
          }}
        >
          <img
            src={location.splatUrl}
            alt={location.title}
            className="w-full h-full object-cover rounded-xl"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Ambient floating fireflies / dust motes dancing in sunlight */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {[...Array(12)].map((_, idx) => (
            <div
              key={idx}
              className="absolute w-2.5 h-2.5 bg-nangthu-glow rounded-full firefly-glow opacity-30"
              style={{
                left: `${15 + idx * 7.5}%`,
                top: `${20 + (idx % 3) * 25 + Math.sin(idx) * 10}%`,
                animationDelay: `${idx * 0.35}s`,
                animationDuration: `${2.5 + (idx % 2) * 1.5}s`
              }}
            />
          ))}
        </div>

        {/* Shimmering Ghost vector overlays on hotspot hover */}
        <AnimatePresence>
          {(hoveredHotspot || activeHotspot) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none z-12 flex items-center justify-center bg-muctim/20 backdrop-blur-xs"
            >
              {(() => {
                const trigger = (hoveredHotspot || activeHotspot)?.ghostIllustration;
                if (!trigger) return null;
                
                return (
                  <svg viewBox="0 0 100 100" className="w-56 h-56 stroke-nangthu fill-none stroke-[1] drop-shadow-[0_0_15px_rgba(229,142,38,0.7)]">
                    {trigger === 'well' && (
                      <g strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                        {/* Circular old brick well */}
                        <ellipse cx="50" cy="75" rx="35" ry="12" />
                        <ellipse cx="50" cy="71" rx="34" ry="11" />
                        <ellipse cx="50" cy="67" rx="33" ry="10" />
                        {/* Well pillar supports */}
                        <line x1="25" y1="71" x2="25" y2="35" />
                        <line x1="75" y1="71" x2="75" y2="35" />
                        {/* Spindle or roof */}
                        <path d="M 20 35 L 50 15 L 80 35 Z" />
                        <line x1="50" y1="35" x2="50" y2="55" />
                        <rect x="47" y="55" width="6" height="8" rx="2" />
                        {/* Soft Vietnamese words */}
                        <text x="36" y="93" fill="#ffeed0" stroke="none" className="font-handwritten text-[7px]">Sân Giếng Hè Cũ</text>
                      </g>
                    )}

                    {trigger === 'slide' && (
                      <g strokeLinecap="round" strokeLinejoin="round" className="animate-zoom">
                        {/* Children playground nostalgia slide */}
                        <line x1="20" y1="80" x2="20" y2="30" />
                        <line x1="20" y1="30" x2="55" y2="55" />
                        <path d="M 55 55 Q 65 65, 80 80" />
                        <line x1="30" y1="80" x2="30" y2="38" />
                        {/* Ladder rungs */}
                        <line x1="16" y1="70" x2="24" y2="70" />
                        <line x1="16" y1="58" x2="24" y2="58" />
                        <line x1="16" y1="46" x2="24" y2="46" />
                        {/* Slide bars */}
                        <line x1="20" y1="20" x2="25" y2="15" />
                        <text x="30" y="22" fill="#ffeed0" stroke="none" className="font-handwritten text-[8px]">Cầu Trượt Sắt</text>
                      </g>
                    )}

                    {trigger === 'monitor' && (
                      <g strokeLinecap="round" strokeLinejoin="round">
                        {/* Old boxy desktop CRT computer screen */}
                        <rect x="20" y="20" width="60" height="48" rx="6" />
                        <rect x="25" y="24" width="50" height="38" rx="3" />
                        <line x1="40" y1="68" x2="35" y2="78" />
                        <line x1="60" y1="68" x2="65" y2="78" />
                        <line x1="30" y1="78" x2="70" y2="78" />
                        {/* Screen sparks representing Audition or Chat Yahoo */}
                        <path d="M 40 40 L 44 42 L 50 35 L 43 45 Z" fill="#FAF6ED" />
                        <text x="30" y="92" fill="#ffeed0" stroke="none" className="font-handwritten text-[8px]">Nét Cỏ 1.5</text>
                      </g>
                    )}

                    {trigger === 'bicycle' && (
                      <g strokeLinecap="round" strokeLinejoin="round">
                        {/* Mini physical bike */}
                        <circle cx="30" cy="70" r="14" />
                        <circle cx="70" cy="70" r="14" />
                        <line x1="30" y1="70" x2="50" y2="70" />
                        <line x1="50" y1="70" x2="64" y2="45" />
                        <line x1="30" y1="70" x2="45" y2="45" />
                        <line x1="45" y1="45" x2="70" y2="70" />
                        <line x1="45" y1="45" x2="40" y2="35" />
                        <line x1="35" y1="35" x2="45" y2="35" />
                        <line x1="64" y1="45" x2="66" y2="38" />
                        <line x1="60" y1="38" x2="72" y2="38" />
                        <text x="32" y="94" fill="#ffeed0" stroke="none" className="font-handwritten text-[8px]">Xe Phượng Hoàng</text>
                      </g>
                    )}

                    {trigger === 'bowlsnail' && (
                      <g strokeLinecap="round" strokeLinejoin="round">
                        {/* Bowl of steaming snails */}
                        <path d="M 20 50 C 20 75, 80 75, 80 50 Z" />
                        <line x1="20" y1="50" x2="80" y2="50" />
                        {/* Steaming heat lines */}
                        <path d="M 35 44 Q 38 35, 33 26" />
                        <path d="M 50 44 Q 53 32, 48 20" />
                        <path d="M 65 44 Q 68 35, 63 26" />
                        <text x="24" y="92" fill="#ffeed0" stroke="none" className="font-handwritten text-[8px]">Bát Ốc Lá Chanh</text>
                      </g>
                    )}

                    {trigger === 'pho' && (
                      <g strokeLinecap="round" strokeLinejoin="round">
                        <path d="M 25 50 C 25 70, 75 70, 75 50 Z" />
                        <line x1="20" y1="45" x2="80" y2="45" />
                        {/* Chopsticks angled */}
                        <line x1="30" y1="30" x2="85" y2="55" strokeWidth="2" />
                        <text x="33" y="88" fill="#ffeed0" stroke="none" className="font-handwritten text-[8px]">Trận Bóng Đá Vỉa Hè</text>
                      </g>
                    )}
                  </svg>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hotspots plotted based on coordinates */}
        {location.hotspots.map((hotspot) => {
          const active = activeHotspot?.id === hotspot.id;
          return (
            <div
              key={hotspot.id}
              className="absolute z-15 group/hotspot transition-all duration-300"
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
              }}
            >
              {/* Soft touch pulsating rings around firefly */}
              <div 
                onClick={() => handleHotspotClick(hotspot)}
                onMouseEnter={() => setHoveredHotspot(hotspot)}
                onMouseLeave={() => setHoveredHotspot(null)}
                className={`w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                  active 
                    ? 'bg-nangthu border-2 border-white scale-110 shadow-lg' 
                    : 'bg-nangthu/45 hover:bg-nangthu/95 hover:scale-115'
                }`}
              >
                {/* Center glowing golden speck (resembles firefly) */}
                <div className={`w-3.5 h-3.5 rounded-full ${active ? 'bg-white' : 'bg-white/80'} firefly-glow shadow-xs`} />
                
                {/* Ring expanded indicator */}
                {active && (
                  <div className="absolute -inset-1 border-2 border-dashed border-nangthu rounded-full animate-spin duration-3500 pointer-events-none" />
                )}
              </div>

              {/* Little Floating Title tag hoverable tooltip */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/95 px-2.5 py-1 border border-muctim/15 shadow-md rounded-lg text-[10px] font-sans font-bold text-muctim uppercase whitespace-nowrap pointer-events-none origin-bottom scale-75 group-hover/hotspot:scale-100 opacity-0 group-hover/hotspot:opacity-100 transition-all duration-300">
                {hotspot.label}
              </div>
            </div>
          );
        })}

        {/* Sound/Music and system control hub on the lower corners */}
        <div className="absolute bottom-3 left-3 z-20 flex gap-2">
          {/* Mute button */}
          <button
            onClick={() => {
              AudioSynth.playSnap();
              setIsMuted(!isMuted);
            }}
            className="w-10 h-10 rounded-xl bg-white/90 hover:bg-white text-muctim flex items-center justify-center transition-all shadow-md active:scale-95"
            title={isMuted ? "Mở âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Random chord strum plucker for manual acoustic play */}
          <button
            onClick={() => {
              AudioSynth.playGuitarArpeggio();
            }}
            className="w-10 h-10 rounded-xl bg-white/90 hover:bg-white text-muctim flex items-center justify-center transition-all shadow-md active:scale-95"
            title="Gảy một nốt đàn ấm"
          >
            <Music className="w-4 h-4 text-nangthu" />
          </button>
        </div>

        {/* Top-right help button explaining 3D orientation */}
        <div className="absolute top-3 right-3 z-20">
          <div className="bg-black/45 text-white/90 px-3 py-1 rounded-lg text-[10px] font-mono tracking-wide uppercase flex items-center gap-1">
            <Compass className="w-3 h-3 text-nangthu animate-spin duration-5000" /> Parallax Lens
          </div>
        </div>
      </div>

      {/* Narrative Section: Displays voice quotes, ambient cues, and diary collection */}
      <div className="w-full mt-6 bg-white border border-muctim/10 rounded-2xl p-5 shadow-sm min-h-36 relative">
        <AnimatePresence mode="wait">
          {activeHotspot ? (
            <motion.div
              key={activeHotspot.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col md:flex-row justify-between items-start gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
                  <span className="font-serif text-xs font-bold text-terracotta uppercase tracking-wide">
                    {activeHotspot.quote}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-muctim">
                  {activeHotspot.label}
                </h3>
                <p className="font-handwritten text-lg text-muctim/90 mt-2 italic leading-relaxed">
                  {activeHotspot.voiceNote}
                </p>
                
                {/* Audio activity equalizer visualizer */}
                {!isMuted && (
                  <div className="flex items-center gap-2 mt-4 text-xs font-mono text-muctim-faded">
                    <span className="animate-spin text-xs text-orange-400">⚡</span> Đang phát âm thanh: {activeHotspot.ambientSoundTrigger}
                    <div className="flex items-end gap-0.5 h-3 w-8">
                      <div className="bg-nangthu w-1 h-2/3 rounded-full animate-bounce duration-500" />
                      <div className="bg-nangthu w-1 h-full rounded-full animate-bounce duration-300" />
                      <div className="bg-nangthu w-1 h-1/3 rounded-full animate-bounce duration-700" />
                      <div className="bg-nangthu w-1 h-3/4 rounded-full animate-bounce duration-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* Side Add Keepsake Section */}
              <div className="w-full md:w-auto shrink-0 flex flex-col pt-2 md:pt-0">
                {(() => {
                  const items = location.keepsakes;
                  const itemIndex = activeHotspot.id === 'net-cafe' ? 2 : activeHotspot.id === 'balcony-music' ? 0 : 1;
                  const currentKeepsakeText = items[itemIndex] || items[0];
                  const alreadySaved = collectedKeepsakes.includes(currentKeepsakeText);

                  return (
                    <button
                      onClick={() => !alreadySaved && handleAddKeepsakeItem(currentKeepsakeText)}
                      className={`py-3 px-5 rounded-xl font-serif text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-xs ${
                        alreadySaved 
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-default'
                          : 'bg-nangthu-glow hover:bg-orange-100 text-terracotta border border-terracotta/20 active:scale-95'
                      }`}
                    >
                      {alreadySaved ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-600" /> Kỷ niệm đã lưu
                        </>
                      ) : (
                        <>
                          <Plus className="w-4.5 h-4.5" /> Ghi lại cuốn di cảo
                        </>
                      )}
                    </button>
                  );
                })()}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-center py-6 text-sm font-serif text-muctim-faded"
            >
              <div className="w-10 h-10 rounded-full bg-nangthu-glow flex items-center justify-center mb-2 animate-pulse">
                <Sparkles className="w-5 h-5 text-nangthu" />
              </div>
              <p className="font-bold text-muctim text-base mb-1">Hãy khẽ chạm các đốm sáng lóng lánh (đom đóm)</p>
              <p className="max-w-md text-xs">Mỗi hạt bụi sáng thắp lên một thanh âm trầm ấm của thời ấu thơ: tiếng xập xình aerobic, phím gõ Yahoo hàng net cũ, hay tiếng gàu xối nước mát.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom navigation bar: See collected keepsakes list or Return home */}
      <div className="w-full mt-8 pt-4 border-t border-muctim/10 flex justify-between items-center px-2">
        <div className="text-xs font-serif text-muctim-faded">
          Độc bản của: <span className="font-bold text-muctim">{location.title}</span>
        </div>
        
        <button
          onClick={onGoToKeepsakes}
          className="px-6 py-2.5 bg-muctim text-white font-serif text-sm font-medium rounded-xl shadow-xs hover:bg-opacity-95 active:scale-98 transition-all flex items-center gap-2 group"
        >
          Nắp hộp Kỷ vật Sổ tay
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 duration-300" />
        </button>
      </div>
    </div>
  );
};
