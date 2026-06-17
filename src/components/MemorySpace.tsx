import { lazy, Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MemorySpace as MemorySpaceType, Story } from '../types';
import { ClueObject } from './ClueObject';
import { ScanPlaceholder } from './ScanPlaceholder';
import { PanoramicVideoViewer } from './PanoramicVideoViewer';
import { AudioManager } from '../utils/AudioManager';
import { AudioSynth } from '../utils/AudioSynth';

const PanoramaViewer = lazy(() =>
  import('./PanoramaViewer').then((m) => ({ default: m.PanoramaViewer }))
);

interface MemorySpaceProps {
  space: MemorySpaceType;
  story: Story;
  collectedIds: string[];
  onCollect: (clueId: string) => void;
  tutorialDone?: boolean;
}

function withAutoplay(url: string) {
  if (url.includes('autoplay=')) return url;
  return `${url}${url.includes('?') ? '&' : '?'}autoplay=1`;
}

function stopMemoryLayerAudio() {
  window.dispatchEvent(new Event('kyuc:stop-memory-audio'));
  AudioSynth.stopAmbient();
  AudioManager.pause();
}

export function MemorySpace({ space, story, collectedIds, onCollect, tutorialDone }: MemorySpaceProps) {
  const hasTour = !!space.bgTourNodes?.length;
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [, setIsScanOpen] = useState(false);
  const driveMode = ['quan-net', 'nha-ngo', 'nha-hoc-them'].includes(space.id);
  const driveIntervalMs = space.id === 'nha-ngo' ? 2200 : space.id === 'nha-hoc-them' ? 3200 : 4500;
  const [demolitionFlash, setDemolitionFlash] = useState(false);

  // Memory fade: desaturate scene as player walks deeper into the sequence
  const totalNodes = space.bgTourNodes?.length ?? 1;
  const fadeProgress = totalNodes > 1 ? currentNodeIndex / (totalNodes - 1) : 0;
  const sceneFilter = `saturate(${1 - fadeProgress * 0.4}) sepia(${fadeProgress * 0.2})`;

  // Auto-expand only when the final node is not itself a clue moment.
  // If the last node has a clue, the video stays as a button so it cannot cover the memory.
  useEffect(() => {
    const nodes = space.bgTourNodes;
    const finalNodeHasClue = !!nodes?.[nodes.length - 1]?.clueAnchors?.length;
    if (space.isPanoramicVideo && nodes && nodes.length > 0 && !finalNodeHasClue && currentNodeIndex >= nodes.length - 1) {
      stopMemoryLayerAudio();
      setDemolitionFlash(true);
      const t = setTimeout(() => {
        setDemolitionFlash(false);
        setVideoExpanded(true);
      }, 2800);
      return () => clearTimeout(t);
    }
  }, [space.isPanoramicVideo, currentNodeIndex, space.bgTourNodes]);

  const handleOpenVideo = () => {
    stopMemoryLayerAudio();
    setVideoExpanded(true);
  };

  const handleCloseVideo = () => {
    setVideoExpanded(false);
    AudioManager.resume();
  };

  return (
    <motion.div
      key={space.id}
      className="relative w-full h-full overflow-hidden"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={
        hasTour || space.bgStreetView || space.bgImage
          ? {}
          : { background: space.bgGradient }
      }
    >
      {hasTour ? (
        <div className="absolute inset-0" style={{ filter: sceneFilter, transition: 'filter 1s ease' }}>
          <Suspense fallback={
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <p className="font-serif text-white/60 text-sm">Loading 360° space...</p>
            </div>
          }>
            <PanoramaViewer
              nodes={space.bgTourNodes!}
              collectedIds={collectedIds}
              onCollect={onCollect}
              ambient={space.bgTourAmbient}
              allClues={space.clues}
              minimapFlipX={space.minimapFlipX}
              onNodeIndexChange={setCurrentNodeIndex}
              driveMode={driveMode}
              driveIntervalMs={driveIntervalMs}
              tutorialDone={tutorialDone}
              onScanChange={setIsScanOpen}
              audioSegmentSrc={space.audioSegment?.src}
              spaceId={space.id}
            />
          </Suspense>
        </div>
      ) : null}

      {/* Demolition flash — shown just before panoramic video auto-expands */}
      <AnimatePresence>
        {demolitionFlash && (
          <motion.div
            className="absolute inset-0 z-[200] flex flex-col items-center justify-center bg-[#080604]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.p
              className="font-mono text-[9px] text-red-400/70 uppercase tracking-[0.3em] mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Urban Planning Document · Classified
            </motion.p>
            <motion.h2
              className="font-serif text-4xl font-bold text-white text-center px-10 leading-tight"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              {space.label}
            </motion.h2>
            <motion.p
              className="font-mono text-xs text-white/30 mt-4 tracking-widest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Hanoi, 2026 — scheduled for clearance
            </motion.p>
            <motion.div
              className="mt-8 h-px bg-red-400/30"
              initial={{ width: 0 }}
              animate={{ width: 72 }}
              transition={{ delay: 1.5, duration: 0.7 }}
            />
            <motion.p
              className="font-mono text-[9px] text-red-300/40 uppercase tracking-widest mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.1 }}
            >
              Loading last memory…
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Street View panorama — Google Maps embed, placeholder until 360 scan is ready */}
      {!hasTour && space.bgStreetView && (
        <iframe
          src={space.bgStreetView}
          className="absolute inset-0 w-full h-full border-0 z-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={space.label}
          style={{ pointerEvents: 'all' }}
        />
      )}

      {/* Static photo background — fallback when no Street View */}
      {!hasTour && !space.bgStreetView && space.bgImage && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${space.bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Overlay — darkens edges for readability over both Street View and photos */}
      {!hasTour && (space.bgStreetView || space.bgImage) && (
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={
            space.bgStreetView
              ? {
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 25%, transparent 65%, rgba(0,0,0,0.45) 100%)',
                }
              : {
                  background: `linear-gradient(160deg, ${space.bgTone}99 0%, ${space.bgTone}44 50%, rgba(0,0,0,0.35) 100%)`,
                  mixBlendMode: 'multiply',
                }
          }
        />
      )}

      {/* Subtle noise texture */}
      {!hasTour && <div className="absolute inset-0 giay-oly opacity-10 pointer-events-none mix-blend-overlay z-[2]" />}
      {/* Vintage vignette */}
      {!hasTour && <div className="absolute inset-0 vintage-vignette pointer-events-none z-[3]" />}

      {/* Space label top-left */}
      <div className="absolute top-4 left-4 z-[20] bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-sm border border-muctim/10">
        <p className="font-mono text-[9px] text-muctim-faded uppercase tracking-widest">
          {story.narrator} · {story.title}
        </p>
        <h2 className="font-serif text-base font-bold text-muctim leading-tight">{space.label}</h2>
        <p className="font-serif text-[11px] text-muctim-faded">{space.sublabel}</p>
      </div>


      {/* Video clip overlay — only shown at the end of the tour sequence (or if there is no tour) */}
      {(space.videoClip || space.vimeoUrl) && (!hasTour || currentNodeIndex === space.bgTourNodes!.length - 1) && (
        <AnimatePresence>
          {!videoExpanded ? (
            <motion.button
              key="thumb"
              className="absolute bottom-4 right-4 z-[35] rounded-xl overflow-hidden shadow-2xl flex items-center gap-3 px-4 py-3 border transition-all"
              style={{
                background: 'rgba(8, 6, 4, 0.85)',
                borderColor: 'rgba(212, 175, 55, 0.45)',
                boxShadow: '0 4px 24px rgba(212, 175, 55, 0.15), inset 0 0 12px rgba(212, 175, 55, 0.05)',
                backdropFilter: 'blur(12px)',
              }}
              onClick={handleOpenVideo}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              whileHover={{ scale: 1.05, borderColor: 'rgba(212, 175, 55, 0.75)' }}
              transition={{ delay: 0.8, duration: 0.4 }}
              title={space.isPanoramicVideo ? "Watch 360° VR film" : "Watch video clip"}
            >
              {/* Play Icon with pulsing glow */}
              <div className="relative w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center shadow-lg transition-all flex-shrink-0">
                <span className="absolute -inset-1 rounded-full bg-amber-400/35 animate-ping opacity-75" />
                <svg width="12" height="12" viewBox="0 0 10 10" fill="currentColor" className="ml-0.5">
                  <path d="M2 1.5L8.5 5 2 8.5V1.5Z" />
                </svg>
              </div>

              {/* Text Label */}
              <div className="text-left pr-1">
                <p className="font-mono text-[8px] text-amber-400/80 uppercase tracking-widest leading-none mb-1">
                  {space.isPanoramicVideo ? "360° VR film" : "rec"}
                </p>
                <p className="font-serif text-[11px] font-bold text-amber-50 leading-none">
                  {space.isPanoramicVideo ? "WATCH 360° FILM" : "WATCH VIDEO CLIP"}
                </p>
              </div>
            </motion.button>
          ) : space.vimeoUrl ? (
            <motion.div
              key="vimeo-expanded"
              className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Top Close Bar */}
              <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
                <span className="font-serif text-sm md:text-base text-amber-50/90 font-medium tracking-wide">
                  360° Panoramic Video · {space.label}
                </span>
                <button
                  onClick={handleCloseVideo}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white/95 flex items-center justify-center transition-all active:scale-95 shadow-md border border-white/10"
                  title="Close"
                >
                  <span className="font-mono text-sm">✕</span>
                </button>
              </div>

              {/* Vimeo Iframe Container */}
              <div className="flex-1 w-full h-full relative flex items-center justify-center p-2 sm:p-6 bg-black">
                <div className="w-full h-full max-w-5xl aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl relative">
                  <iframe
                    src={withAutoplay(space.vimeoUrl)}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; gyroscope; accelerometer"
                    referrerPolicy="strict-origin-when-cross-origin"
                    title={space.label}
                  />
                </div>
              </div>
            </motion.div>
          ) : space.isPanoramicVideo ? (
            <PanoramicVideoViewer
              url={space.videoClip!}
              onClose={handleCloseVideo}
            />
          ) : (
            <motion.div
              key="expanded"
              className="absolute inset-x-4 bottom-4 z-50 rounded-2xl overflow-hidden shadow-2xl"
              style={{ border: '1px solid rgba(200,180,150,0.2)', background: '#000' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <video
                src={space.videoClip}
                autoPlay controls loop playsInline
                className="w-full block"
                style={{ maxHeight: '45vh' }}
              />
              <button
                onClick={handleCloseVideo}
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs text-white/70 hover:text-white"
                style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}
              >✕</button>
            </motion.div>
          )}
        </AnimatePresence>
      )}


      {/* Scan placeholder + HTML clue hotspots + bottom strip — placeholder mode only */}
      {!hasTour && (
        <>
          <div className="absolute bottom-4 right-4 z-20 w-32">
            <ScanPlaceholder label={space.label} />
          </div>
          {/* Clues disabled for now */}
          {/*
          {space.clues.map((clue) => (
            <ClueObject
              key={clue.id}
              clue={clue}
              collected={collectedIds.includes(clue.id)}
              onCollect={onCollect}
              onModalChange={onClueModalChange}
            />
          ))}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/30 to-transparent">
            <p className="font-handwritten text-white/80 text-sm text-center drop-shadow">
              Nhấp vào những điểm sáng để tìm mảnh ký ức
            </p>
          </div>
          */}
        </>
      )}
    </motion.div>
  );
}
