import { motion } from 'motion/react';
import { MemorySpace as MemorySpaceType, Story } from '../types';
import { ClueObject } from './ClueObject';
import { ScanPlaceholder } from './ScanPlaceholder';

interface MemorySpaceProps {
  space: MemorySpaceType;
  story: Story;
  collectedIds: string[];
  onCollect: (clueId: string) => void;
}

export function MemorySpace({ space, story, collectedIds, onCollect }: MemorySpaceProps) {
  return (
    <motion.div
      key={space.id}
      className="relative w-full h-full overflow-hidden"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={
        space.bgStreetView || space.bgImage
          ? {} // background handled by iframe or bg-image below
          : { background: space.bgGradient }
      }
    >
      {/* Street View panorama — real Google Maps embed of the actual location */}
      {space.bgStreetView && (
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
      {!space.bgStreetView && space.bgImage && (
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
      {(space.bgStreetView || space.bgImage) && (
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={
            space.bgStreetView
              ? {
                  // Subtle vignette only — don't tint live Street View
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 25%, transparent 65%, rgba(0,0,0,0.45) 100%)',
                }
              : {
                  // Photo: colour-tone overlay as before
                  background: `linear-gradient(160deg, ${space.bgTone}99 0%, ${space.bgTone}44 50%, rgba(0,0,0,0.35) 100%)`,
                  mixBlendMode: 'multiply',
                }
          }
        />
      )}

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 giay-oly opacity-10 pointer-events-none mix-blend-overlay z-[2]" />

      {/* Vintage vignette */}
      <div className="absolute inset-0 vintage-vignette pointer-events-none z-[3]" />

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

      {/* 3D scan placeholder bottom-right */}
      <div className="absolute bottom-4 right-4 z-20 w-32">
        <ScanPlaceholder label={space.label} />
      </div>

      {/* Clue hotspots — positioned absolutely over the scene */}
      {space.clues.map((clue) => (
        <ClueObject
          key={clue.id}
          clue={clue}
          collected={collectedIds.includes(clue.id)}
          onCollect={onCollect}
        />
      ))}

      {/* Bottom narrative strip */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/30 to-transparent">
        <p className="font-handwritten text-white/80 text-sm text-center drop-shadow">
          Nhấp vào những điểm sáng để tìm mảnh ký ức
        </p>
      </div>
    </motion.div>
  );
}
