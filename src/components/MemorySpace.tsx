import { lazy, Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MemorySpace as MemorySpaceType, Story } from '../types';
import { ClueObject } from './ClueObject';
import { ScanPlaceholder } from './ScanPlaceholder';

// LOCAL TEST ONLY — PanoramaViewer.tsx is gitignored, do NOT push this import.
// Revert to the commented-out version before committing.
const PanoramaViewer = lazy(() =>
  import('./PanoramaViewer').then((m) => ({ default: m.PanoramaViewer }))
);

interface MemorySpaceProps {
  space: MemorySpaceType;
  story: Story;
  collectedIds: string[];
  onCollect: (clueId: string) => void;
  onClueModalChange?: (open: boolean) => void;
}

export function MemorySpace({ space, story, collectedIds, onCollect, onClueModalChange }: MemorySpaceProps) {
  const hasTour = !!space.bgTourNodes?.length;
  const [videoExpanded, setVideoExpanded] = useState(false);

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
        <Suspense fallback={
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <p className="font-serif text-white/60 text-sm">Đang tải không gian 360°...</p>
          </div>
        }>
          <PanoramaViewer
            nodes={space.bgTourNodes!}
            collectedIds={collectedIds}
            onCollect={onCollect}
            ambient={space.bgTourAmbient}
            allClues={space.clues}
          />
        </Suspense>
      ) : null}

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


      {/* Video clip overlay — only appears after the first clue is collected */}
      {space.videoClip && space.clues.some(c => collectedIds.includes(c.id)) && (
        <AnimatePresence>
          {!videoExpanded ? (
            <motion.button
              key="thumb"
              className="absolute bottom-4 right-4 z-40 rounded-xl overflow-hidden shadow-2xl"
              style={{ width: 120, border: '1.5px solid rgba(200,180,150,0.25)', background: '#000' }}
              onClick={() => setVideoExpanded(true)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 1, duration: 0.4 }}
              title="Xem đoạn phim"
            >
              <video
                src={space.videoClip}
                autoPlay loop muted playsInline
                className="w-full h-auto block"
                style={{ aspectRatio: '16/9', objectFit: 'cover' }}
              />
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="white"><path d="M2 1.5L8.5 5 2 8.5V1.5Z" /></svg>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 px-2 py-1" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
                <p className="font-mono text-[7px] text-white/60 uppercase tracking-wider">rec</p>
              </div>
            </motion.button>
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
                onClick={() => setVideoExpanded(false)}
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
        </>
      )}
    </motion.div>
  );
}
