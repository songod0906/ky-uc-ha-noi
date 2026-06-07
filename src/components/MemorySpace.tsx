import { lazy, Suspense } from 'react';
import { motion } from 'motion/react';
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
}

export function MemorySpace({ space, story, collectedIds, onCollect }: MemorySpaceProps) {
  const hasTour = !!space.bgTourNodes?.length;

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

      {/* Clue count top-right */}
      <div className="absolute top-4 right-4 z-20 bg-white/80 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-sm border border-muctim/10 text-center">
        <p className="font-mono text-[8px] text-muctim-faded uppercase tracking-widest">Mảnh ghép</p>
        <p className="font-serif text-sm font-bold text-muctim">
          {space.clues.filter((c) => collectedIds.includes(c.id)).length}
          <span className="text-muctim-faded font-normal">/{space.clues.length}</span>
        </p>
      </div>

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
