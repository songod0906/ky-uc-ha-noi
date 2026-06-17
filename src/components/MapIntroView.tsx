import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, MapPin } from 'lucide-react';
import { DiaryEntry, Story, MemorySpace } from '../types';
import { ALL_STORIES } from '../data/stories';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapIntroViewProps {
  onSelect: (story: Story, spaceIdx: number) => void;
  diary?: DiaryEntry[];
}

// Color per narrator
const NARRATOR_COLOR: Record<string, string> = {
  LTK:   '#C8A882',
  Essy:  '#8BAF9A',
  Trang: '#B09EC3',
};

// Suggested narrative order for the three stories
const STORY_ORDER: Record<string, number> = { 'trang': 1, 'essy': 2, 'thai-thinh': 3 };

// Flat list of all spaces with their parent story
type SpacePin = { space: MemorySpace; story: Story; spaceIdx: number };

function getAllSpacePins(): SpacePin[] {
  return ALL_STORIES.flatMap((story) =>
    story.spaces
      .filter((s) => s.lat !== undefined && s.lng !== undefined)
      .map((space, i) => ({ space, story, spaceIdx: i }))
  );
}

function makePinIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:48px;height:48px;cursor:pointer;">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:${color}22;
          animation:mapPulse 2.2s ease-out infinite;
        "></div>
        <div style="
          position:absolute;inset:8px;border-radius:50%;
          background:${color}44;
          animation:mapPulse 2.2s ease-out infinite;
          animation-delay:0.4s;
        "></div>
        <div style="
          position:absolute;inset:17px;border-radius:50%;
          background:${color};
          box-shadow:0 0 10px ${color}99, 0 0 20px ${color}44;
        "></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

export function MapIntroView({ onSelect, diary = [] }: MapIntroViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [selected, setSelected] = useState<SpacePin | null>(null);
  const pins = getAllSpacePins();
  const collectedIds = new Set(diary.map((entry) => entry.clueId));

  const getSavedCount = (space: MemorySpace) =>
    space.clues.filter((clue) => collectedIds.has(clue.id)).length;

  const getSaveLabel = (space: MemorySpace) => {
    const saved = getSavedCount(space);
    if (saved === 0) return `${space.clues.length} fragments`;
    if (saved >= space.clues.length) return 'Complete';
    return `${saved}/${space.clues.length} saved`;
  };

  const selectPin = (pin: SpacePin) => {
    setSelected(pin);
    mapRef.current?.flyTo([pin.space.lat!, pin.space.lng!], 16, { duration: 0.55 });
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    if (!document.getElementById('map-pulse-style')) {
      const style = document.createElement('style');
      style.id = 'map-pulse-style';
      style.textContent = `
        @keyframes mapPulse {
          0%   { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .leaflet-control-zoom a {
          background: rgba(20,15,10,0.85) !important;
          color: #c8b89a !important;
          border-color: rgba(200,180,150,0.15) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(40,30,20,0.95) !important;
          color: #f5f0e8 !important;
        }
        .leaflet-control-attribution {
          background: rgba(10,8,6,0.6) !important;
          color: rgba(200,180,150,0.35) !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a { color: rgba(200,180,150,0.45) !important; }
      `;
      document.head.appendChild(style);
    }

    const map = L.map(mapContainerRef.current, {
      zoom: 14,
      center: [21.025, 105.817],
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    // Fit bounds to all pins after a tick so the container is sized
    const bounds = L.latLngBounds(pins.map((p) => [p.space.lat!, p.space.lng!]));
    const fitTimeout = setTimeout(() => {
      if (mapRef.current) {
        map.fitBounds(bounds, { padding: [60, 60] });
      }
    }, 100);

    pins.forEach((pin) => {
      const color = NARRATOR_COLOR[pin.story.narrator] ?? '#ffffff';
      const marker = L.marker([pin.space.lat!, pin.space.lng!], {
        icon: makePinIcon(color),
        title: `${pin.space.label}, ${pin.story.narrator}`,
        alt: pin.space.label,
        keyboard: true,
      }).addTo(map);
      marker.on('click', () => {
        setSelected(pin);
        map.flyTo([pin.space.lat!, pin.space.lng!], 16, { duration: 0.55 });
      });
    });

    mapRef.current = map;
    return () => {
      clearTimeout(fitTimeout);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const color = selected ? (NARRATOR_COLOR[selected.story.narrator] ?? '#fff') : '#fff';

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-black">
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* Vignette */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 25%, rgba(5,4,3,0.5) 100%)' }}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none flex flex-col items-center pt-7">
        <motion.p
          className="font-mono text-[9px] uppercase tracking-[0.35em] text-amber-200/40 mb-1.5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        >
          Hanoi · 2026 · Land Clearance
        </motion.p>
        <motion.h1
          className="font-serif text-2xl md:text-3xl font-bold text-amber-50/90 text-center drop-shadow-lg"
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        >
          Preserve these places before they disappear
        </motion.h1>
        <motion.p
          className="font-serif text-xs text-amber-200/60 mt-1 text-center max-w-[320px] leading-relaxed"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
        >
          Enter a location, listen for memory fragments, then seal the stamps into the passport.
        </motion.p>
      </div>

      {/* Legend — narrator colors */}
      <motion.div
        className="absolute top-24 right-4 z-20 pointer-events-none flex flex-col gap-1.5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
      >
        {ALL_STORIES.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: NARRATOR_COLOR[s.narrator] }} />
            <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: NARRATOR_COLOR[s.narrator] }}>
              {s.narrator}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Named location strip — gives phone visitors a clear tap target when pins cluster */}
      {!selected && (
        <motion.div
          className="absolute left-0 right-0 bottom-5 z-20 px-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05 }}
        >
          <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto rounded-2xl border border-amber-200/10 bg-black/65 p-2 shadow-2xl backdrop-blur-md">
            {pins.map((pin) => {
              const pinColor = NARRATOR_COLOR[pin.story.narrator] ?? '#fff';
              const saved = getSavedCount(pin.space);
              const complete = saved >= pin.space.clues.length;
              return (
                <button
                  key={`${pin.story.id}-${pin.space.id}`}
                  onClick={() => selectPin(pin)}
                  className="min-w-[170px] rounded-xl border px-3 py-2 text-left transition-all active:scale-[0.98]"
                  style={{
                    borderColor: `${pinColor}33`,
                    background: `${pinColor}10`,
                  }}
                >
                  <span className="block font-mono text-[9px] uppercase tracking-widest" style={{ color: pinColor }}>
                    {pin.story.narrator}
                  </span>
                  <span className="mt-0.5 block truncate font-serif text-sm font-semibold text-amber-50/90">
                    {pin.space.label}
                  </span>
                  <span className="mt-1 block font-mono text-[9px] uppercase tracking-wider text-amber-200/40">
                    {getSaveLabel(pin.space)}
                  </span>
                  <span
                    className="mt-1.5 block h-1 rounded-full overflow-hidden"
                    style={{ background: 'rgba(245,230,200,0.12)' }}
                  >
                    <span
                      className="block h-full rounded-full transition-all"
                      style={{
                        width: `${(saved / Math.max(pin.space.clues.length, 1)) * 100}%`,
                        background: complete ? '#f5d38a' : pinColor,
                      }}
                    />
                  </span>
                  {pin.spaceIdx === 0 && STORY_ORDER[pin.story.id] && (
                    <span className="mt-1.5 inline-block font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ background: `${pinColor}22`, color: pinColor }}>
                      Part {STORY_ORDER[pin.story.id]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Bottom credit */}
      <motion.div
        className="absolute bottom-5 left-5 z-20 pointer-events-none hidden font-mono text-[9px] text-amber-200/30 uppercase tracking-widest leading-5 md:block"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
      >
        <div>{ALL_STORIES.reduce((n, s) => n + s.spaces.length, 0)} locations · {ALL_STORIES.length} narrators</div>
        <div>Ký Ức Hà Nội · CAS3020 · VinUniversity</div>
      </motion.div>

      {/* Space detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-30"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          >
            <div
              className="mx-auto max-w-md rounded-t-3xl overflow-hidden shadow-2xl"
              style={{
                background: 'rgba(10,8,6,0.93)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(200,180,150,0.1)',
                borderBottom: 'none',
              }}
            >
              <div className="h-0.5 w-full" style={{ background: color }} />

              <div className="p-5 relative">
                {(() => {
                  const saved = getSavedCount(selected.space);
                  const complete = saved >= selected.space.clues.length;
                  return (
                    <div
                      className="absolute top-4 left-5 font-mono text-[8px] uppercase tracking-widest px-2 py-1 rounded-full"
                      style={{
                        background: complete ? 'rgba(245,211,138,0.16)' : `${color}16`,
                        color: complete ? '#f5d38a' : color,
                        border: complete ? '1px solid rgba(245,211,138,0.35)' : `1px solid ${color}33`,
                      }}
                    >
                      {saved} / {selected.space.clues.length} saved
                    </div>
                  );
                })()}
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <X className="w-4 h-4 text-amber-200/50" />
                </button>

                {/* Narrator + location */}
                <div className="flex items-center gap-2 mb-3 pt-8">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
                  <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color }}>
                    {selected.story.narrator} · {selected.story.title}
                  </span>
                </div>

                <h2 className="font-serif text-xl font-bold text-amber-50/95 mb-1 pr-8">
                  {selected.space.label}
                </h2>
                <p className="font-serif text-sm text-amber-200/50 leading-relaxed mb-4">
                  {selected.space.sublabel}
                </p>
                <p className="font-serif text-xs text-amber-100/55 leading-relaxed mb-4">
                  Save the fragments here so this place becomes a page in the Memory Passport.
                </p>

                {/* Clue count */}
                <div className="flex items-center gap-2 mb-5">
                  <span
                    className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: `${color}18`, color, border: `1px solid ${color}33` }}
                  >
                    {getSaveLabel(selected.space)}
                  </span>
                  {selected.space.bgTourNodes && (
                    <span
                      className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(245,240,232,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      360° tour
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onSelect(selected.story, selected.spaceIdx)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-serif text-sm font-medium transition-all duration-200 active:scale-95"
                  style={{ background: color, color: '#0a0806' }}
                >
                  Enter this space
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
