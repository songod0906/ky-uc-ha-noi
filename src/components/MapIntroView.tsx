import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, MapPin } from 'lucide-react';
import { Story } from '../types';
import { ALL_STORIES } from '../data/stories';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapIntroViewProps {
  onSelect: (story: Story) => void;
}

// Real Hanoi coordinates for each story location
const STORY_PINS: Record<string, { lat: number; lng: number; zone: string; color: string }> = {
  trang: {
    lat: 21.0270,
    lng: 105.8218,
    zone: 'Ba Đình',
    color: '#C8A882',
  },
  essy: {
    lat: 21.0430,
    lng: 105.8340,
    zone: 'Ba Đình',
    color: '#8BAF9A',
  },
  'thai-thinh': {
    lat: 21.0178,
    lng: 105.8398,
    zone: 'Đống Đa',
    color: '#B09EC3',
  },
};

// Build custom pulsing marker HTML for each story
function makePinIcon(color: string, label: string) {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:48px;height:48px;cursor:pointer;">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:${color}22;
          animation:mapPulse 2s ease-out infinite;
        "></div>
        <div style="
          position:absolute;inset:8px;border-radius:50%;
          background:${color}44;
          animation:mapPulse 2s ease-out infinite;
          animation-delay:0.3s;
        "></div>
        <div style="
          position:absolute;inset:16px;border-radius:50%;
          background:${color};
          box-shadow:0 0 12px ${color}88, 0 0 24px ${color}44;
        "></div>
        <div style="
          position:absolute;top:54px;left:50%;transform:translateX(-50%);
          white-space:nowrap;
          font-family:serif;font-size:10px;color:#f5f0e8;letter-spacing:0.05em;
          text-shadow:0 1px 4px rgba(0,0,0,0.8);
          pointer-events:none;
        ">${label}</div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

export function MapIntroView({ onSelect }: MapIntroViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [selected, setSelected] = useState<Story | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Inject pulse animation keyframes once
    if (!document.getElementById('map-pulse-style')) {
      const style = document.createElement('style');
      style.id = 'map-pulse-style';
      style.textContent = `
        @keyframes mapPulse {
          0%   { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        /* Override Leaflet default control styles for dark theme */
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
          color: rgba(200,180,150,0.4) !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a { color: rgba(200,180,150,0.5) !important; }
      `;
      document.head.appendChild(style);
    }

    const map = L.map(mapContainerRef.current, {
      center: [21.031, 105.828],
      zoom: 14,
      zoomControl: true,
      attributionControl: true,
    });

    // CartoDB Dark Matter — free, no API key
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    // Add story pins
    ALL_STORIES.forEach((story) => {
      const pin = STORY_PINS[story.id];
      if (!pin) return;

      const marker = L.marker([pin.lat, pin.lng], {
        icon: makePinIcon(pin.color, story.narrator),
      }).addTo(map);

      marker.on('click', () => {
        setSelected(story);
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const selectedPin = selected ? STORY_PINS[selected.id] : null;

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-black">
      {/* The map */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* Dark vignette overlay — doesn't block map interaction */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, rgba(5,4,3,0.55) 100%)`,
        }}
      />

      {/* Top header */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none flex flex-col items-center pt-8 pb-4">
        <motion.p
          className="font-mono text-[9px] uppercase tracking-[0.35em] text-amber-200/40 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Hà Nội · 2026 · Giải tỏa mặt bằng
        </motion.p>
        <motion.h1
          className="font-serif text-2xl md:text-3xl font-bold text-amber-50/90 text-center drop-shadow-lg"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          Are you ready to explore?
        </motion.h1>
        <motion.p
          className="font-serif text-xs text-amber-200/50 mt-1.5 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Chọn một khu phố đang biến mất để bước vào
        </motion.p>
      </div>

      {/* Story count badge — bottom left */}
      <motion.div
        className="absolute bottom-6 left-6 z-20 pointer-events-none"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.1 }}
      >
        <div className="font-mono text-[9px] text-amber-200/35 uppercase tracking-widest leading-5">
          <div>{ALL_STORIES.length} khu phố · {ALL_STORIES.reduce((s, st) => s + st.spaces.length, 0)} không gian</div>
          <div>Ký Ức Hà Nội · CAS3020 · VinUniversity</div>
        </div>
      </motion.div>

      {/* Story detail panel — slides up when pin clicked */}
      <AnimatePresence>
        {selected && selectedPin && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-30"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          >
            <div
              className="mx-auto max-w-md mb-0 rounded-t-3xl overflow-hidden shadow-2xl"
              style={{
                background: 'rgba(10, 8, 6, 0.92)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(200,180,150,0.12)',
                borderBottom: 'none',
              }}
            >
              {/* Color accent bar */}
              <div
                className="h-1 w-full"
                style={{ background: selectedPin.color }}
              />

              <div className="p-5">
                {/* Close */}
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <X className="w-4 h-4 text-amber-200/60" />
                </button>

                {/* Zone tag */}
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-3.5 h-3.5" style={{ color: selectedPin.color }} />
                  <span className="font-mono text-[9px] uppercase tracking-widest"
                    style={{ color: selectedPin.color }}>
                    {selectedPin.zone}
                  </span>
                </div>

                {/* Story info */}
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h2 className="font-serif text-xl font-bold text-amber-50/95">
                    {selected.title}
                  </h2>
                  <span
                    className="flex-shrink-0 font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full mt-1"
                    style={{
                      background: `${selectedPin.color}22`,
                      color: selectedPin.color,
                      border: `1px solid ${selectedPin.color}44`,
                    }}
                  >
                    {selected.narrator}
                  </span>
                </div>
                <p className="font-serif text-sm text-amber-200/50 leading-relaxed mb-4">
                  {selected.subtitle}
                </p>

                {/* Spaces list */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {selected.spaces.map((space) => (
                    <span
                      key={space.id}
                      className="font-serif text-[10px] px-2.5 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(245,240,232,0.5)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {space.label}
                    </span>
                  ))}
                </div>

                {/* Enter button */}
                <button
                  onClick={() => onSelect(selected)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-serif text-sm font-medium transition-all duration-200 active:scale-95"
                  style={{
                    background: selectedPin.color,
                    color: '#0a0806',
                  }}
                >
                  Bước vào khu phố này
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
