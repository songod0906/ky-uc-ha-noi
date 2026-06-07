import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Story } from './types';
import { GameStart } from './components/GameStart';
import { StorySelector } from './components/StorySelector';
import { MemoryRouteGame } from './components/MemoryRouteGame';

type AppPhase = 'start' | 'select' | 'play';

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('start');
  const [activeStory, setActiveStory] = useState<Story | null>(null);

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
          <GameStart key="start" onBegin={() => setPhase('select')} />
        )}
        {phase === 'select' && (
          <StorySelector key="select" onSelect={handleSelectStory} />
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
