import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Story, MemorySpace, DiaryEntry, TourNode } from '../types';
import { RotateCcw, Play, Pause, MapPin, Box } from 'lucide-react';
import { CompassMotif } from './CompassMotif';

const PanoramaViewer = lazy(() =>
  import('./PanoramaViewer').then((m) => ({ default: m.PanoramaViewer }))
);
const ScanViewer = lazy(() =>
  import('./ScanViewer').then((m) => ({ default: m.ScanViewer }))
);

const CLUE_EMOJI: Record<string, string> = {
  place: '📍',
  sound: '🔊',
  routine: '🔄',
  object: '📦',
  loss: '🌿',
};

function findClueNode(clueId: string, nodes?: TourNode[]): TourNode | undefined {
  return nodes?.find(n => n.clueAnchors?.some(a => a.clueId === clueId));
}

function findClueScan(clueId: string, nodes?: TourNode[]) {
  return nodes
    ?.flatMap(n => n.scanAnchors ?? [])
    .find(anchor => anchor.clueId === clueId);
}

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

interface StampDiaryProps {
  story: Story;
  activeSpace: MemorySpace;
  diary: DiaryEntry[];
  onRestart: () => void;
  onChooseOther: () => void;
  onNextStory?: (storyId: string) => void;
}

export function StampDiary({ story, activeSpace, diary, onRestart, onChooseOther, onNextStory }: StampDiaryProps) {
  const allClues = activeSpace.clues;
  const collectedSet = new Set(diary.map(e => e.clueId));

  const [selectedClueId, setSelectedClueId] = useState<string | null>(
    () => diary[0]?.clueId ?? null
  );

  // Audio player
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const selectedClue = allClues.find(c => c.id === selectedClueId) ?? null;
  const selectedNode = selectedClueId
    ? findClueNode(selectedClueId, activeSpace.bgTourNodes)
    : null;
  const selectedScan = selectedClueId
    ? findClueScan(selectedClueId, activeSpace.bgTourNodes)
    : null;

  // Stop audio and reset when selected clue changes
  useEffect(() => {
    if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setAudioPlaying(false);
    setAudioProgress(0);
    setAudioDuration(0);
  }, [selectedClueId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  const toggleAudio = () => {
    if (!selectedClue?.audioSrc) return;

    if (!audioRef.current) {
      const el = new Audio(selectedClue.audioSrc);
      audioRef.current = el;
      el.addEventListener('loadedmetadata', () => setAudioDuration(el.duration));
      el.addEventListener('ended', () => {
        setAudioPlaying(false);
        setAudioProgress(el.duration);
        if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
      });
    }

    if (audioPlaying) {
      audioRef.current.pause();
      if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
      setAudioPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setAudioPlaying(true);
      progressTimerRef.current = window.setInterval(() => {
        if (audioRef.current) setAudioProgress(audioRef.current.currentTime);
      }, 200);
    }
  };

  const seekAudio = (pct: number) => {
    if (!audioRef.current) return;
    const t = pct * (audioDuration || 0);
    audioRef.current.currentTime = t;
    setAudioProgress(t);
  };

  const progressPct = audioDuration > 0 ? audioProgress / audioDuration : 0;

  return (
    <motion.div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: '#F0E8D8' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* Book header / spine cap */}
      <div
        className="flex-none flex items-center justify-between px-5 py-2.5 border-b"
        style={{ background: '#3e2a1a', borderColor: '#5a3e28' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border border-[#c8a97a] rounded flex items-center justify-center text-[#c8a97a] text-xs">✦</div>
          <div>
            <p className="font-mono text-[8px] text-[#c8a97a]/60 uppercase tracking-widest">Ký Ức Hà Nội · Memory Passport</p>
            <p className="font-serif text-sm font-bold text-[#f5e6c8]">{story.narrator} · {activeSpace.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-[#c8a97a]/60">
            {diary.length} / {allClues.length} stamps
          </span>
          <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: '#5a3e28' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(diary.length / Math.max(allClues.length, 1)) * 100}%`, background: '#c8a97a' }}
            />
          </div>
        </div>
      </div>

      {/* Book spread */}
      <div className="flex-1 flex overflow-hidden">

        {/* Spine */}
        <div
          className="w-6 flex-shrink-0 flex flex-col items-center justify-center gap-2.5"
          style={{ background: '#3e2a1a' }}
        >
          {[0,1,2,3,4].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#c8a97a', opacity: 0.5 }} />
          ))}
        </div>

        {/* LEFT PAGE — stamp collection */}
        <div
          className="flex-shrink-0 flex flex-col overflow-hidden border-r"
          style={{ width: 210, background: '#fdf8f0', borderColor: '#c8b89a' }}
        >
          {/* Page header */}
          <div
            className="flex-none flex items-center justify-between px-3 py-2 border-b"
            style={{ borderColor: '#d4c5a8' }}
          >
            <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: '#a08060' }}>
              Stamps collected
            </span>
            <span
              className="font-mono text-[7px] px-1.5 py-0.5 rounded"
              style={{ background: '#e8d8b8', color: '#7a5c38' }}
            >
              {activeSpace.label.split(' ')[0]}
            </span>
          </div>

          {/* Stamp grid */}
          <div className="flex-1 overflow-y-auto p-2.5">
            <div className="grid grid-cols-3 gap-1.5">
              {allClues.map((clue) => {
                const collected = collectedSet.has(clue.id);
                const selected = selectedClueId === clue.id;
                return (
                  <button
                    key={clue.id}
                    onClick={() => collected && setSelectedClueId(clue.id)}
                    disabled={!collected}
                    title={collected ? clue.label : 'Not found yet'}
                    className="relative overflow-hidden flex flex-col items-center justify-center gap-1 p-1 transition-all"
                    style={{
                      aspectRatio: '1 / 1.2',
                      borderRadius: 4,
                      border: selected
                        ? '2px solid #8b6240'
                        : collected
                          ? '1.5px solid #8b6240'
                          : '1.5px dashed #c0a880',
                      background: collected ? (selected ? '#fff7ee' : '#fff') : '#faf4e8',
                      cursor: collected ? 'pointer' : 'not-allowed',
                      boxShadow: selected ? '0 0 0 2px #8b624055' : undefined,
                    }}
                  >
                    {collected ? (
                      <>
                        {/* Perforation top */}
                        <div className="absolute top-0 left-0 right-0 flex justify-around px-0.5 -translate-y-1/2 pointer-events-none">
                          {[0,1,2,3].map(i => (
                            <div key={i} className="w-1 h-1 rounded-full" style={{ background: '#F0E8D8' }} />
                          ))}
                        </div>
                        {/* Perforation bottom */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-around px-0.5 translate-y-1/2 pointer-events-none">
                          {[0,1,2,3].map(i => (
                            <div key={i} className="w-1 h-1 rounded-full" style={{ background: '#F0E8D8' }} />
                          ))}
                        </div>
                        <span className="text-base leading-none">{CLUE_EMOJI[clue.type] ?? '📍'}</span>
                        <span
                          className="font-mono leading-tight text-center w-full line-clamp-2 px-0.5"
                          style={{ fontSize: 6, color: '#5a3e28', fontWeight: 500 }}
                        >
                          {clue.label.split('—')[0].split('–')[0].trim()}
                        </span>
                        <span style={{ fontSize: 5.5, color: '#a08060' }} className="font-mono uppercase tracking-wide">
                          {clue.type}
                        </span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 14, opacity: 0.35 }}>🔒</span>
                        <span style={{ fontSize: 5.5, color: '#c8b090' }} className="font-mono">not found</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Page number */}
          <div className="flex-none px-3 py-1.5 border-t" style={{ borderColor: '#d4c5a8' }}>
            <span className="font-mono text-[7px]" style={{ color: '#c0a880' }}>p. I</span>
          </div>
        </div>

        {/* RIGHT PAGE — selected stamp content */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#fdf8f0' }}>
          {selectedClue ? (
            <>
              {/* Clue header */}
              <div
                className="flex-none flex items-start justify-between gap-3 px-4 py-2.5 border-b"
                style={{ borderColor: '#d4c5a8' }}
              >
                <div className="min-w-0">
                  <p className="font-mono text-[8px] uppercase tracking-widest mb-0.5" style={{ color: '#a08060' }}>
                    {activeSpace.label} · {story.narrator}
                  </p>
                  <h3
                    className="font-serif font-bold leading-snug truncate"
                    style={{ fontSize: 13, color: '#3a2010' }}
                  >
                    {selectedClue.label}
                  </h3>
                </div>
                <span
                  className="flex-shrink-0 font-mono text-[7px] px-2 py-0.5 rounded"
                  style={{ background: '#e8d8b8', color: '#7a5c38' }}
                >
                  Active memory
                </span>
              </div>

              {/* 360° panorama viewer */}
              <div className="relative overflow-hidden" style={{ height: '42%', flexShrink: 0 }}>
                {selectedScan ? (
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center" style={{ background: '#0d0b08' }}>
                      <p className="font-mono text-[9px] text-amber-400/60">Loading 3D artifact...</p>
                    </div>
                  }>
                    <ScanViewer url={selectedScan.scanUrl} />
                  </Suspense>
                ) : activeSpace.bgTourNodes?.length ? (
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center" style={{ background: '#1a1206' }}>
                      <p className="font-mono text-[9px] text-amber-400/60">Loading 360°...</p>
                    </div>
                  }>
                    <PanoramaViewer
                      nodes={activeSpace.bgTourNodes}
                      startNodeId={selectedNode?.id}
                      collectedIds={[selectedClue.id]}
                      onCollect={() => {}}
                      allClues={[]}
                      backgroundMode={true}
                      spaceId={activeSpace.id}
                    />
                  </Suspense>
                ) : activeSpace.bgImage ? (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${activeSpace.bgImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                ) : (
                  <div className="w-full h-full" style={{ background: activeSpace.bgGradient }} />
                )}
                {/* Corner label */}
                <div
                  className="absolute bottom-2 right-2 font-mono text-[8px] px-2 py-1 rounded"
                  style={{ background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.7)' }}
                >
                  {selectedScan ? (
                    <Box className="inline w-2.5 h-2.5 mr-1" />
                  ) : (
                    <MapPin className="inline w-2.5 h-2.5 mr-1" />
                  )}
                  {selectedScan
                    ? `${selectedScan.label.replace(/^View /, '').replace(/^Inspect /, '')} · drag to inspect`
                    : '360° · drag to explore'}
                </div>
              </div>

              {/* Audio player */}
              <div
                className="flex-none px-4 py-2.5 border-t border-b"
                style={{ borderColor: '#d4c5a8', background: '#f5ece0' }}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleAudio}
                    disabled={!selectedClue.audioSrc}
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
                    style={selectedClue.audioSrc
                      ? { background: '#8b6240', color: '#fff' }
                      : { background: '#d4c5a8', color: '#a08060', cursor: 'not-allowed' }
                    }
                    title={selectedClue.audioSrc ? (audioPlaying ? 'Pause' : 'Play audio clue') : 'No audio'}
                  >
                    {audioPlaying
                      ? <Pause className="w-3.5 h-3.5" />
                      : <Play className="w-3.5 h-3.5 ml-0.5" />
                    }
                  </button>

                  <div className="flex-1 flex flex-col gap-1.5">
                    <p className="font-mono text-[8px] truncate" style={{ color: '#7a5c38' }}>
                      {selectedClue.audioSrc
                        ? selectedClue.label
                        : 'No audio clip for this memory'}
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex-1 h-1.5 rounded-full overflow-hidden relative cursor-pointer"
                        style={{ background: '#e0d0b8' }}
                        onClick={e => {
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          seekAudio((e.clientX - rect.left) / rect.width);
                        }}
                      >
                        <div
                          className="h-full rounded-full transition-none"
                          style={{ width: `${progressPct * 100}%`, background: '#8b6240' }}
                        />
                      </div>
                      <span className="font-mono text-[7px] w-[52px] text-right flex-shrink-0" style={{ color: '#a08060' }}>
                        {formatTime(audioProgress)} / {formatTime(audioDuration)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote + voice note */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <blockquote
                  className="font-handwritten text-sm italic leading-relaxed border-l-2 pl-3"
                  style={{ color: '#8b6240', borderColor: '#c8a97a' }}
                >
                  {selectedClue.quote}
                </blockquote>
                {selectedClue.voiceNote && (
                  <p
                    className="mt-3 font-serif leading-relaxed"
                    style={{ fontSize: 11, color: '#7a5c38', opacity: 0.8 }}
                  >
                    {selectedClue.voiceNote}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="text-4xl block mb-3 opacity-30">✦</span>
                <p className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: '#c0a880' }}>
                  Select a stamp
                </p>
                <p className="font-serif text-sm" style={{ color: '#a08060' }}>
                  Click a collected stamp to view its memory
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer navigation */}
      <div
        className="flex-none flex items-center justify-between px-5 py-2.5 border-t"
        style={{ borderColor: '#d4c5a8', background: '#f5ece0' }}
      >
        <div className="flex items-center gap-2.5">
          <CompassMotif size={28} />
          <span className="font-mono text-[8px]" style={{ color: '#a08060' }}>
            CAS3020 · Digital Humanities · VinUniversity
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-serif transition-all active:scale-95"
            style={{ borderColor: '#c0a880', background: 'rgba(255,255,255,0.6)', color: '#5a3e28', fontSize: 12 }}
          >
            <RotateCcw className="w-3 h-3" /> Replay
          </button>
          <button
            onClick={onChooseOther}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-serif transition-all active:scale-95"
            style={{ borderColor: '#c0a880', background: 'rgba(255,255,255,0.6)', color: '#5a3e28', fontSize: 12 }}
          >
            Map
          </button>
          {onNextStory && (
            <button
              onClick={onChooseOther}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-serif font-semibold transition-all active:scale-95"
              style={{ background: '#5a3e28', color: '#f5e6c8', fontSize: 12 }}
            >
              Choose another location
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
