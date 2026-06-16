import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { DiaryEntry, Story } from './types';
import { GameStart } from './components/GameStart';
import { MapIntroView } from './components/MapIntroView';
import { MemoryRouteGame } from './components/MemoryRouteGame';
import { ScanViewer } from './components/ScanViewer';
import { PrologueViewer } from './components/PrologueViewer';
import { StoryLoadingScreen } from './components/StoryLoadingScreen';
import { AudioManager } from './utils/AudioManager';
import { ALL_STORIES } from './data/stories';

// ?scan=<url> in the URL shows the 3D scan viewer directly (dev testing only)
const scanUrl = new URLSearchParams(window.location.search).get('scan');

type AppPhase = 'start' | 'prologue' | 'select' | 'loading' | 'play';

export default function App() {
  const [activeStory, setActiveStory] = useState<Story | null>(() => {
    const storyId = new URLSearchParams(window.location.search).get('story');
    if (storyId) {
      return ALL_STORIES.find((s) => s.id === storyId) || null;
    }
    return null;
  });
  const [activeSpaceIdx, setActiveSpaceIdx] = useState(() => {
    const spaceIdx = new URLSearchParams(window.location.search).get('space');
    return spaceIdx ? parseInt(spaceIdx, 10) : 0;
  });
  const [phase, setPhase] = useState<AppPhase>(() => {
    const storyId = new URLSearchParams(window.location.search).get('story');
    return storyId ? 'play' : 'start';
  });
  const [diary, setDiary] = useState<DiaryEntry[]>([]);

  // Redirect to selector map if story is invalid in play mode
  useEffect(() => {
    if (phase === 'play' && !activeStory) {
      setPhase('select');
    }
  }, [phase, activeStory]);

  if (scanUrl !== null) {
    return (
      <div className="h-screen w-screen relative">
        <ScanViewer url={scanUrl || '/test-scan.glb'} />
      </div>
    );
  }

  const handleSelectSpace = (story: Story, spaceIdx: number) => {
    setActiveStory(story);
    setActiveSpaceIdx(spaceIdx);
    setPhase('loading');
  };

  const handleBackToSelect = () => {
    AudioManager.stop();
    setActiveStory(null);
    setActiveSpaceIdx(0);
    setPhase('select');
  };

  const handleNextStory = (storyId: string) => {
    AudioManager.stop();
    const next = ALL_STORIES.find((s) => s.id === storyId);
    if (!next) return;
    setActiveStory(next);
    setActiveSpaceIdx(0);
    setPhase('loading');
  };

  const addToDiary = (entry: DiaryEntry) => {
    setDiary((prev) =>
      prev.some((existing) => existing.clueId === entry.clueId)
        ? prev
        : [...prev, entry]
    );
  };

  const removeDiaryEntries = (clueIds: string[]) => {
    setDiary((prev) => prev.filter((e) => !clueIds.includes(e.clueId)));
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
          <MapIntroView key="select" onSelect={handleSelectSpace} />
        )}
        {phase === 'loading' && activeStory && (
          <StoryLoadingScreen
            key={`loading-${activeStory.id}-${activeSpaceIdx}`}
            story={activeStory}
            spaceIdx={activeSpaceIdx}
            onReady={() => setPhase('play')}
          />
        )}
        {phase === 'play' && activeStory && (
          <MemoryRouteGame
            key={`play-${activeStory.id}-${activeSpaceIdx}`}
            story={activeStory}
            initialSpaceIdx={activeSpaceIdx}
            singleSpaceMode
            diary={diary}
            addToDiary={addToDiary}
            removeDiaryEntries={removeDiaryEntries}
            onBack={handleBackToSelect}
            onNextStory={handleNextStory}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
