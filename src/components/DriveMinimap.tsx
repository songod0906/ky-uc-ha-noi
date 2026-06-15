import { useEffect, useRef } from 'react';
import type L from 'leaflet';
import type { TourNode } from '../types';

interface DriveMinimapProps {
  nodes: TourNode[];
  currentIndex: number;
}

function interpolateCoords(nodes: TourNode[]): [number, number][] {
  const raw = nodes.map(n =>
    n.lat != null && n.lng != null ? [n.lat, n.lng] as [number, number] : null
  );
  const out: [number, number][] = new Array(nodes.length);
  for (let i = 0; i < nodes.length; i++) {
    if (raw[i]) { out[i] = raw[i]!; continue; }
    let prev = -1, next = -1;
    for (let j = i - 1; j >= 0; j--) { if (raw[j]) { prev = j; break; } }
    for (let j = i + 1; j < nodes.length; j++) { if (raw[j]) { next = j; break; } }
    if (prev >= 0 && next >= 0) {
      const t = (i - prev) / (next - prev);
      out[i] = [
        raw[prev]![0] + t * (raw[next]![0] - raw[prev]![0]),
        raw[prev]![1] + t * (raw[next]![1] - raw[prev]![1]),
      ];
    } else if (prev >= 0) out[i] = raw[prev]!;
    else if (next >= 0) out[i] = raw[next]!;
    else out[i] = [21.0, 105.8];
  }
  return out;
}

export function DriveMinimap({ nodes, currentIndex }: DriveMinimapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const coordsRef = useRef<[number, number][]>(interpolateCoords(nodes));

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let destroyed = false;

    import('leaflet').then(({ default: Lf }) => {
      if (destroyed || !containerRef.current) return;

      const map = Lf.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        keyboard: false,
      });

      Lf.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 19 }
      ).addTo(map);

      const coords = coordsRef.current;

      // Route polyline
      Lf.polyline(coords, {
        color: '#60a5fa',
        weight: 2.5,
        opacity: 0.9,
      }).addTo(map);

      // Start dot
      Lf.circleMarker(coords[0], {
        radius: 4, color: '#4ade80',
        fillColor: '#4ade80', fillOpacity: 1, weight: 1.5,
      }).addTo(map);

      // End dot
      Lf.circleMarker(coords[coords.length - 1], {
        radius: 4, color: '#f59e0b',
        fillColor: '#f59e0b', fillOpacity: 1, weight: 1.5,
      }).addTo(map);

      // Current-position marker
      markerRef.current = Lf.circleMarker(coords[currentIndex] ?? coords[0], {
        radius: 6, color: '#fff',
        fillColor: '#fff', fillOpacity: 1, weight: 2,
        className: 'drive-pos-dot',
      }).addTo(map);

      // Fit route with padding
      map.fitBounds(Lf.latLngBounds(coords), { padding: [18, 18] });
      mapRef.current = map;
    });

    return () => {
      destroyed = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; markerRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!markerRef.current) return;
    const pos = coordsRef.current[currentIndex];
    if (!pos) return;
    markerRef.current.setLatLng(pos);
  }, [currentIndex]);

  return (
    <div
      className="absolute bottom-20 left-4 z-30 rounded-xl overflow-hidden shadow-2xl pointer-events-none"
      style={{
        width: 170, height: 150,
        border: '1px solid rgba(255,255,255,0.15)',
        background: '#111',
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 backdrop-blur-sm flex items-center justify-between">
        <span className="font-mono text-[8px] text-white/50 uppercase tracking-wider">location</span>
        <span className="font-mono text-[8px] text-blue-300/80">Thanh Cong</span>
      </div>
    </div>
  );
}
