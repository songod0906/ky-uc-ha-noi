import { useState, useEffect } from 'react';
import { GameState, MemoryLocation } from './types';
import { MEMORY_LOCATIONS } from './data/memories';
import { OrigamiToy } from './components/OrigamiToy';
import { MemoryMap } from './components/MemoryMap';
import { GaussianSplatFrame } from './components/GaussianSplatFrame';
import { MemoryKeepsake } from './components/MemoryKeepsake';
import { AudioSynth } from './utils/AudioSynth';
import { BookOpen, MapPin, Compass, RotateCcw, Volume2, VolumeX, HelpCircle } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('playground');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [collectedKeepsakes, setCollectedKeepsakes] = useState<string[]>([]);
  const [isAppMusicMuted, setIsAppMusicMuted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Play background wind/guitar pluck by default
  useEffect(() => {
    AudioSynth.playGuitarArpeggio();
    AudioSynth.startAmbient('wind');
    return () => {
      AudioSynth.stopAmbient();
    };
  }, []);

  const handleSelectLocation = (id: string) => {
    setSelectedLocationId(id);
    setGameState('unfolding');
  };

  const handleUnfoldComplete = () => {
    setGameState('memory-box');
  };

  const handleAddKeepsake = (item: string) => {
    if (!collectedKeepsakes.includes(item)) {
      setCollectedKeepsakes((prev) => [...prev, item]);
    }
  };

  const selectedLocation = MEMORY_LOCATIONS.find((loc) => loc.id === selectedLocationId);

  const handleLoopBack = () => {
    setGameState('playground');
    setSelectedLocationId(null);
    setCollectedKeepsakes([]);
    AudioSynth.startAmbient('wind');
  };

  const handleRestartLocation = () => {
    AudioSynth.playSnap();
    if (selectedLocationId) {
      setGameState('unfolding');
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAF2] text-muctim flex flex-col justify-between selection:bg-nangthu-glow selection:text-muctim overflow-x-hidden relative">
      {/* Absolute notebook grid giấy ô ly on the entire viewport background */}
      <div className="absolute inset-0 giay-oly opacity-25 pointer-events-none z-0" />
      <div className="absolute inset-0 giay-oly-margin opacity-10 pointer-events-none z-0" />
      
      {/* Decorative old photo album overlay */}
      <div className="absolute inset-0 vintage-vignette pointer-events-none z-50" />

      {/* Primary navigation toolbar */}
      <header className="relative z-30 w-full max-w-5xl mx-auto px-6 py-4 flex justify-between items-center bg-white/30 backdrop-blur-xs border-b border-muctim/5 shadow-xs">
        <div 
          onClick={handleLoopBack}
          className="flex items-center gap-2 cursor-pointer group"
        >
          {/* Folded paper aesthetic emblem */}
          <div className="relative w-8 h-8 flex items-center justify-center transform group-hover:rotate-12 duration-300">
            <div className="absolute top-0 left-0 w-4 h-4 bg-muctim rounded-tl-md shadow-xs opacity-85" />
            <div className="absolute top-0 right-0 w-4 h-4 bg-nangthu rounded-tr-md shadow-xs opacity-85" />
            <div className="absolute bottom-0 left-0 w-4 h-4 bg-sage rounded-bl-md shadow-xs opacity-85" />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-terracotta rounded-br-md shadow-xs opacity-85" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-tight text-muctim block leading-none">
              Trang Ký Ức Hà Nội
            </span>
            <span className="font-mono text-[9px] text-muctim-faded uppercase tracking-widest leading-none mt-0.5 block">
              Đông Tây Nam Bắc • Bản Sổ Tay
            </span>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-3">
          {/* Active Keepsake badge */}
          {collectedKeepsakes.length > 0 && (
            <button
              onClick={() => setGameState('keepsake')}
              className="bg-nangthu-glow/85 border border-nangthu/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-serif font-semibold text-terracotta hover:scale-103 transition-all duration-300 shadow-xs"
            >
              <BookOpen className="w-4 h-4" />
              Sổ tay ({collectedKeepsakes.length})
            </button>
          )}

          {/* Guide toggle */}
          <button 
            onClick={() => setShowGuide(!showGuide)}
            className="w-10 h-10 rounded-xl bg-white/60 hover:bg-white text-muctim-faded hover:text-muctim flex items-center justify-center border border-muctim/5 transition-all shadow-xs"
            title="Xem hướng dẫn xếp giấy"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Guide dialog box */}
      {showGuide && (
        <div className="fixed inset-0 bg-muctim/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-muctim/15 rounded-3xl p-6 shadow-2xl max-w-md w-full relative">
            <h3 className="font-serif text-xl font-bold text-muctim mb-2">📜 Cách mở Trang Ký Ức</h3>
            <p className="text-sm text-muctim-faded font-serif leading-relaxed mb-4">
              Đông Tây Nam Bắc là trò chơi xếp giấy thân thương của thế hệ học sinh Việt Nam. 
              Mỗi nếp gập mở ra một câu chuyện, một mẩu vụn trong chiếc giếng cổ ký ức:
            </p>
            <ul className="space-y-2.5 text-sm font-serif text-muctim-faded mb-6">
              <li className="flex gap-2">
                <span className="text-nangthu">1.</span> Chọn số nhịp đếm gập (3, 5, 8, 10).
              </li>
              <li className="flex gap-2">
                <span className="text-sage">2.</span> Nhấp lên một trong các cánh Đông / Tây / Nam / Bắc để xếp paper catcher biến đổi.
              </li>
              <li className="flex gap-2">
                <span className="text-terracotta">3.</span> Cánh tháp mở tiết lộ lối rẽ ký ức: <b>Thái Thịnh</b> (Đông) và <b>Thành Công</b> (Tây).
              </li>
              <li className="flex gap-2">
                <span className="text-muctim">4.</span> Nhấn mở để phẳng bản vẽ, dạo chơi Parallax 3D và thắp sáng đom đóm âm thanh!
              </li>
            </ul>
            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 bg-muctim text-white font-serif text-sm font-medium rounded-xl hover:bg-opacity-90"
            >
              Đã hiểu, gấp giấy nào!
            </button>
          </div>
        </div>
      )}

      {/* Primary body component switch */}
      <main className="flex-1 relative z-10 w-full max-w-5xl mx-auto flex items-center justify-center py-6 md:py-10">
        {gameState === 'playground' && (
          <OrigamiToy onSelectMemory={handleSelectLocation} />
        )}

        {gameState === 'unfolding' && selectedLocation && (
          <MemoryMap 
            location={selectedLocation} 
            onTransitionComplete={handleUnfoldComplete} 
          />
        )}

        {gameState === 'memory-box' && selectedLocation && (
          <GaussianSplatFrame
            location={selectedLocation}
            collectedKeepsakes={collectedKeepsakes}
            onAddKeepsake={handleAddKeepsake}
            onGoToKeepsakes={() => setGameState('keepsake')}
          />
        )}

        {gameState === 'keepsake' && (
          <MemoryKeepsake
            collectedKeys={collectedKeepsakes}
            onLoopBack={handleLoopBack}
          />
        )}
      </main>

      {/* Global scrapbook footnotes */}
      <footer className="relative z-10 w-full text-center py-4 text-[11px] font-mono text-muctim-faded tracking-wider uppercase bg-white/10 border-t border-muctim/5 select-none">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-4 max-w-5xl mx-auto px-6">
          <span>Khí trời Hà Nội vàng mật độ ngõ Thái Thịnh • Sách di chỉ Thành Công</span>
          <span className="hidden sm:inline-block text-muctim-faded/30">•</span>
          <span>Dự án Ký ức Sổ Tay Giấy Ô Ly - 2026</span>
        </div>
      </footer>
    </div>
  );
}
