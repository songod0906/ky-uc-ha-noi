import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Story } from './types';
import { GameStart } from './components/GameStart';
import { MapIntroView } from './components/MapIntroView';
import { MemoryRouteGame } from './components/MemoryRouteGame';
import { ScanViewer } from './components/ScanViewer';
import { PrologueViewer } from './components/PrologueViewer';

// ?scan=<url> in the URL shows the 3D scan viewer directly (dev testing only)
const scanUrl = new URLSearchParams(window.location.search).get('scan');

type AppPhase = 'start' | 'prologue' | 'select' | 'play';

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('start');
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  // Dev shortcut: localhost:5173/?scan renders the scan viewer fullscreen
  if (scanUrl !== null) {
    return (
      <div className="h-screen w-screen relative">
        <ScanViewer url={scanUrl || '/test-scan.glb'} />
      </div>
    );
  }

  const handleSelectStory = (story: Story) => {
    setActiveStory(story);
    setPhase('play');
  };

  const handleBackToSelect = () => {
    setActiveStory(null);
    setPhase('select');
  };

  return (
    <div className="h-screen overflow-hidden bg-[#FCFAF2] text-muctim selection:bg-nangthu-glow selection:text-muctim">
      <AnimatePresence mode="wait">
        {phase === 'start' && (
          <GameStart key="start" onBegin={() => setPhase('prologue')} />
        )}
        {phase === 'prologue' && (
          <PrologueViewer key="prologue" onEnter={() => setPhase('select')} />
        )}
        {phase === 'select' && (
          <MapIntroView key="select" onSelect={handleSelectStory} />
        )}
        {phase === 'play' && activeStory && (
          <MemoryRouteGame
            key={`play-${activeStory.id}`}
            story={activeStory}
            onBack={handleBackToSelect}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
