/**
 * PanoramaViewer — 360° equirectangular photo tour using React Three Fiber
 *
 * Takes DJI Osmo 360 stills (stitched in-camera as equirectangular JPEGs, 2:1 ratio)
 * and renders them as a navigable inside-out sphere. Clue hotspots float in 3D space
 * as HTML buttons (no mesh click conflicts with OrbitControls). Nav arrows let the
 * player walk between nodes.
 *
 * This runs completely separate from the Street View iframe placeholder. MemorySpace
 * renders one or the other depending on whether bgTourNodes is populated.
 */

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Howl } from 'howler';
import { X, ArrowUp, ArrowDown } from 'lucide-react';
import type { TourNode, TourClueAnchor, TourNavAnchor, TourScanAnchor, Clue } from '../types';
import { ScanViewer } from './ScanViewer';

// ---------- helpers ----------

const CLUE_ICONS: Record<string, string> = {
  place: '📍',
  sound: '🔊',
  routine: '🌀',
  object: '📦',
  loss: '🕯',
};

/**
 * Convert yaw/pitch angles to a 3D position on a sphere of radius r.
 * yaw=0 → forward (−Z), yaw increases → right
 * pitch=0 → horizon, pitch positive → up
 */
function toPos(yaw: number, pitch: number, r = 80): [number, number, number] {
  const y = (yaw * Math.PI) / 180;
  const p = (pitch * Math.PI) / 180;
  return [
    -r * Math.sin(y) * Math.cos(p),
     r * Math.sin(p),
    -r * Math.cos(y) * Math.cos(p),
  ];
}

// ---------- Three.js scene pieces ----------

/** The 360 sphere. Equirectangular texture painted on the inside. */
function PanoSphere({ url }: { url: string }) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let active = true;
    const loader = new THREE.TextureLoader();
    
    loader.load(url, (newTex) => {
      if (!active) {
        newTex.dispose();
        return;
      }
      newTex.colorSpace = THREE.SRGBColorSpace;
      newTex.wrapS = THREE.RepeatWrapping;
      newTex.repeat.x = -1;
      newTex.offset.x = 1;
      
      setTexture(prevTex => {
        if (prevTex) {
          prevTex.dispose();
        }
        return newTex;
      });
    });

    return () => {
      active = false;
    };
  }, [url]);

  useEffect(() => {
    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [texture]);

  if (!texture) {
    return (
      <Html center distanceFactor={90} zIndexRange={[10, 15]}>
        <div className="font-serif text-white/85 text-xs whitespace-nowrap bg-black/60 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 shadow-lg select-none">
          Đang tải không gian 360°...
        </div>
      </Html>
    );
  }

  return (
    <mesh>
      <sphereGeometry args={[500, 64, 32]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

/** Clue hotspot: subtle icon puck that expands label on hover. No mesh orb. */
function ClueHotspot({
  anchor,
  clue,
  collected,
  onPreview,
}: {
  anchor: TourClueAnchor;
  clue: Clue;
  collected: boolean;
  onPreview: (clue: Clue) => void;
}) {
  const pos = toPos(anchor.yaw, anchor.pitch);
  return (
    <Html position={pos} center distanceFactor={90} zIndexRange={[10, 15]}>
      <button
        className="flex flex-col items-center gap-0.5 select-none group"
        onClick={() => !collected && onPreview(clue)}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base
          shadow-lg transition-all duration-200 group-hover:scale-110
          ${collected
            ? 'bg-white/30 border border-white/30 text-white/60'
            : 'bg-white/20 border border-white/50 text-white backdrop-blur-sm group-hover:bg-white/35'
          }`}>
          {collected ? '✓' : CLUE_ICONS[clue.type]}
        </div>
        <span className={`max-w-[120px] text-center text-[9px] font-serif leading-tight
          drop-shadow-md transition-opacity duration-200 px-1
          ${collected ? 'text-white/40' : 'text-white/0 group-hover:text-white/90'}`}>
          {clue.label}
        </span>
      </button>
    </Html>
  );
}

/** Navigation hotspot to move to a different node. */
function NavHotspot({
  anchor,
  onNavigate,
}: {
  anchor: TourNavAnchor;
  onNavigate: (id: string) => void;
}) {
  const pos = toPos(anchor.yaw, anchor.pitch, 60);
  const isBack = anchor.label === 'Quay lại';
  return (
    <Html position={pos} center distanceFactor={90} zIndexRange={[10, 15]}>
      <button
        className="flex flex-col items-center gap-0.5 select-none group"
        onClick={() => onNavigate(anchor.toNodeId)}
      >
        {!isBack && (
          <ArrowUp className="w-5 h-5 text-white/80 group-hover:text-white transition-all drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
        )}
        <span className="px-3 py-1 rounded-lg text-[11px] font-serif bg-black/55 text-white/90 group-hover:bg-black/75 group-hover:text-white transition-all whitespace-nowrap shadow-lg backdrop-blur-sm">
          {anchor.label ?? 'Đi tiếp'}
        </span>
        {isBack && (
          <ArrowDown className="w-5 h-5 text-white/80 group-hover:text-white transition-all drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
        )}
      </button>
    </Html>
  );
}

/** 3D scan hotspot — pulsing cube icon + label, opens ScanViewer overlay on click. */
function ScanHotspot({ anchor, onOpen }: { anchor: TourScanAnchor; onOpen: (url: string) => void }) {
  const pos = toPos(anchor.yaw, anchor.pitch, 60);
  return (
    <Html position={pos} center distanceFactor={90} zIndexRange={[10, 15]}>
      <button
        className="flex flex-col items-center gap-1 select-none group"
        onClick={() => onOpen(anchor.scanUrl)}
      >
        <span className="text-xl animate-pulse drop-shadow-[0_0_8px_rgba(255,200,100,0.9)]">⬡</span>
        <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-amber-500/80 text-white whitespace-nowrap group-hover:bg-amber-400/90 transition-all shadow-lg">
          {anchor.label}
        </span>
      </button>
    </Html>
  );
}

// Calibration tracker — reads camera yaw every frame, writes to a DOM ref (no React re-render).
function CalibTracker({ yawElRef }: { yawElRef: React.RefObject<HTMLSpanElement> }) {
  const { camera } = useThree();
  useFrame(() => {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const yaw = Math.round(Math.atan2(-dir.x, -dir.z) * 180 / Math.PI);
    if (yawElRef.current) {
      yawElRef.current.textContent = `${yaw}`;
      yawElRef.current.dataset.yaw = String(yaw);
    }
  });
  return null;
}

/** Everything that lives inside the Canvas (needs R3F context). */
function Scene({
  node,
  collectedIds,
  allClues,
  onPreview,
  onNavigate,
  onScan,
  calibrate,
  yawElRef,
}: {
  node: TourNode;
  collectedIds: string[];
  allClues: Clue[];
  onPreview: (clue: Clue) => void;
  onNavigate: (id: string) => void;
  onScan: (url: string) => void;
  calibrate?: boolean;
  yawElRef: React.RefObject<HTMLSpanElement>;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <PanoSphere url={node.panorama} />
      </Suspense>

      {node.clueAnchors?.map((anchor) => {
        const clue = allClues.find((c) => c.id === anchor.clueId);
        if (!clue) return null;
        return (
          <ClueHotspot
            key={anchor.clueId}
            anchor={anchor}
            clue={clue}
            collected={collectedIds.includes(anchor.clueId)}
            onPreview={onPreview}
          />
        );
      })}

      {node.navAnchors?.map((anchor) => (
        <NavHotspot key={anchor.toNodeId} anchor={anchor} onNavigate={onNavigate} />
      ))}

      {node.scanAnchors?.map((anchor) => (
        <ScanHotspot key={anchor.scanUrl} anchor={anchor} onOpen={onScan} />
      ))}

      {calibrate && <CalibTracker yawElRef={yawElRef} />}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={-0.4}
        makeDefault
      />
    </>
  );
}

// ---------- Clue preview modal ----------

function CluePreviewModal({
  clue,
  collected,
  onCollect,
  onClose,
}: {
  clue: Clue;
  collected: boolean;
  onCollect: () => void;
  onClose: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const howlRef = useRef<Howl | null>(null);

  useEffect(() => {
    if (!clue.audioSrc) return;
    const snd = new Howl({
      src: [clue.audioSrc],
      html5: true,
      volume: 1,
      onplay: () => setPlaying(true),
      onend: () => setPlaying(false),
      onstop: () => setPlaying(false),
    });
    howlRef.current = snd;
    // No auto-play — user initiates via the play button
    return () => { snd.stop(); snd.unload(); };
  }, [clue.audioSrc]);

  const togglePlay = () => {
    const snd = howlRef.current;
    if (!snd) return;
    if (snd.playing()) { snd.pause(); setPlaying(false); }
    else { snd.play(); setPlaying(true); }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center p-4 bg-black/50">
      <div className="w-full max-w-sm bg-[#FCFAF2] rounded-2xl p-5 shadow-2xl border border-muctim/10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-mono text-[9px] text-muctim-faded uppercase tracking-widest">
              {CLUE_ICONS[clue.type]} {clue.type}
            </p>
            <h3 className="font-serif text-base font-bold text-muctim">{clue.label}</h3>
          </div>
          <button onClick={onClose} className="text-muctim-faded hover:text-muctim p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quote */}
        <p className="font-handwritten text-muctim italic mb-3 leading-relaxed text-sm">
          {clue.quote}
        </p>

        {/* Oral history audio player */}
        {clue.audioSrc && (
          <button
            onClick={togglePlay}
            className={`flex items-center gap-3 w-full mb-3 px-3 py-2.5 rounded-xl transition-all text-left
              ${playing
                ? 'bg-muctim/12 border border-muctim/20'
                : 'bg-muctim/6 hover:bg-muctim/10 border border-muctim/10'}`}
          >
            <div className={`w-7 h-7 rounded-full flex-none flex items-center justify-center text-sm transition-all
              ${playing ? 'bg-muctim text-white' : 'bg-muctim/15 text-muctim'}`}>
              {playing ? '⏸' : '▶'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[9px] text-muctim-faded uppercase tracking-wider">
                {playing ? 'Đang phát giọng kể...' : 'Nghe lời kể trực tiếp'}
              </p>
              {playing && (
                <div className="flex gap-0.5 items-end h-2.5 mt-1">
                  {[0.6, 1, 0.7, 0.9, 0.5, 0.8, 0.6].map((h, i) => (
                    <div key={i} className="w-0.5 bg-muctim/50 rounded-full animate-pulse"
                      style={{ height: `${h * 10}px`, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              )}
            </div>
          </button>
        )}

        {/* Voice note text */}
        <p className="font-serif text-xs text-muctim-faded leading-relaxed mb-4">
          {clue.voiceNote}
        </p>

        {collected ? (
          <p className="text-center font-serif text-xs text-sage">✓ Đã thu thập</p>
        ) : (
          <button
            onClick={onCollect}
            className="w-full py-2.5 bg-muctim text-white font-serif text-sm font-semibold rounded-xl hover:bg-muctim/80 transition-all"
          >
            Thu thập mảnh ký ức
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- Path mini-map ----------

// Returns compass bearing in degrees (0 = north, clockwise) from GPS coords.
function gpsBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toR = (d: number) => d * Math.PI / 180;
  const φ1 = toR(lat1), φ2 = toR(lat2), Δλ = toR(lng2 - lng1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return Math.atan2(y, x) * 180 / Math.PI; // -180..180
}

/**
 * Derives 2-D map positions.
 * When consecutive nodes both carry GPS coords, uses GPS bearing directly
 * (no accumulated error). Falls back to yaw-based heading for uncalibrated segments.
 */
function computePath(nodes: TourNode[]): [number, number][] {
  // Fill null-GPS nodes by linearly interpolating between known neighbors
  const gps = nodes.map(n => ({ lat: n.lat, lng: n.lng }));
  for (let i = 0; i < gps.length; i++) {
    if (gps[i].lat != null) continue;
    let prev = -1, next = -1;
    for (let j = i - 1; j >= 0; j--) { if (gps[j].lat != null) { prev = j; break; } }
    for (let j = i + 1; j < gps.length; j++) { if (gps[j].lat != null) { next = j; break; } }
    if (prev >= 0 && next >= 0) {
      const t = (i - prev) / (next - prev);
      gps[i].lat = gps[prev].lat! + t * (gps[next].lat! - gps[prev].lat!);
      gps[i].lng = gps[prev].lng! + t * (gps[next].lng! - gps[prev].lng!);
    } else if (prev >= 0) { gps[i].lat = gps[prev].lat; gps[i].lng = gps[prev].lng; }
      else if (next >= 0) { gps[i].lat = gps[next].lat; gps[i].lng = gps[next].lng; }
  }

  const pts: [number, number][] = [[0, 0]];
  let globalPanoDir = 0;

  for (let i = 0; i < nodes.length - 1; i++) {
    const backAnchorNext = nodes[i + 1]?.navAnchors?.find(a => a.label === 'Quay lại');
    const backYaw = backAnchorNext?.yaw ?? 180;

    let travelDeg: number;
    if (gps[i].lat != null && gps[i + 1].lat != null) {
      // GPS bearing — physically accurate, no drift
      travelDeg = gpsBearing(gps[i].lat!, gps[i].lng!, gps[i + 1].lat!, gps[i + 1].lng!);
      globalPanoDir = travelDeg + 180 - backYaw;
    } else {
      // Yaw-based fallback (no GPS at all for this space)
      const fwdYaw = nodes[i].navAnchors?.find(
        a => a.label === 'Tiếp tục' || a.label === 'Đi tiếp'
      )?.yaw ?? 0;
      travelDeg = globalPanoDir + fwdYaw;
      globalPanoDir = travelDeg + 180 - backYaw;
    }

    const rad = travelDeg * Math.PI / 180;
    const [px, py] = pts[i];
    pts.push([px + Math.sin(rad), py - Math.cos(rad)]);
  }
  return pts;
}

function PathMap({ nodes, currentIndex, flipX = false }: { nodes: TourNode[]; currentIndex: number; flipX?: boolean }) {
  const W = 110, H = 80, PAD = 10;
  const pts = computePath(nodes);

  // Normalize into [PAD, W-PAD] × [PAD, H-PAD]
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1, rangeY = maxY - minY || 1;
  const scale = Math.min((W - PAD * 2) / rangeX, (H - PAD * 2) / rangeY);
  const cx = (W - scale * rangeX) / 2, cy = (H - scale * rangeY) / 2;
  const tx = (x: number) => cx + (x - minX) * scale;
  const ty = (y: number) => cy + (y - minY) * scale;

  const polyline = pts.map(([x, y]) => `${tx(x).toFixed(1)},${ty(y).toFixed(1)}`).join(' ');

  return (
    <div className="absolute bottom-16 right-3 z-30 pointer-events-none" style={flipX ? { transform: 'scaleX(-1)' } : undefined}>
      <div className="bg-black/55 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Path line */}
          <polyline
            points={polyline}
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Visited segment */}
          {currentIndex > 0 && (
            <polyline
              points={pts.slice(0, currentIndex + 1).map(([x, y]) =>
                `${tx(x).toFixed(1)},${ty(y).toFixed(1)}`).join(' ')}
              fill="none"
              stroke="rgba(255,220,120,0.6)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {/* All node dots */}
          {pts.map(([x, y], i) => (
            <circle
              key={i}
              cx={tx(x)}
              cy={ty(y)}
              r={i === currentIndex ? 3.5 : 1.8}
              fill={i === currentIndex ? '#ffd878' : i < currentIndex ? 'rgba(255,220,120,0.5)' : 'rgba(255,255,255,0.3)'}
            />
          ))}
          {/* Direction arrow at current node (if not last) */}
          {currentIndex < nodes.length - 1 && (() => {
            const [x1, y1] = pts[currentIndex];
            const [x2, y2] = pts[currentIndex + 1];
            const dx = tx(x2) - tx(x1), dy = ty(y2) - ty(y1);
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const ex = tx(x1) + (dx / len) * 6, ey = ty(y1) + (dy / len) * 6;
            return (
              <line
                x1={tx(x1)} y1={ty(y1)} x2={ex} y2={ey}
                stroke="#ffd878" strokeWidth="1.5" strokeLinecap="round"
              />
            );
          })()}
        </svg>
        <p className="text-[8px] font-mono text-white/30 text-center pb-1 -mt-1">
          {currentIndex + 1} / {nodes.length}
        </p>
      </div>
    </div>
  );
}

// ---------- Main export ----------

// Activate calibration mode with ?calib=1 in the URL.
const CALIB_MODE = new URLSearchParams(window.location.search).has('calib');

export function PanoramaViewer({
  nodes,
  startNodeId,
  collectedIds,
  onCollect,
  ambient,
  allClues,
  minimapFlipX = false,
  onNodeIndexChange,
}: {
  nodes: TourNode[];
  startNodeId?: string;
  collectedIds: string[];
  onCollect: (clueId: string) => void;
  ambient?: string;
  allClues: Clue[];
  minimapFlipX?: boolean;
  onNodeIndexChange?: (idx: number) => void;
}) {
  // Stable key for this sequence (e.g. \"ct\" from \"ct-01\"), used for localStorage
  const seqKey = useRef(nodes[0]?.id.replace(/-\d+$/, '') ?? 'seq').current;

  // localNodes: restore from localStorage if a previous calib session exists for this sequence
  const [localNodes, setLocalNodes] = useState<TourNode[]>(() => {
    if (!CALIB_MODE) return nodes;
    try {
      const saved = localStorage.getItem(`calib_seq_${seqKey}`);
      if (saved) { const p = JSON.parse(saved) as TourNode[]; if (p.length) return p; }
    } catch {}
    return nodes;
  });

  const [nodeId, setNodeId] = useState(startNodeId ?? nodes[0]?.id);
  const [preview, setPreview] = useState<Clue | null>(null);
  const [activeScan, setActiveScan] = useState<string | null>(null);
  const yawElRef = useRef<HTMLSpanElement>(null);

  // calibYaws: accumulated across ALL sequences via localStorage — restored on every mount
  const [calibYaws, setCalibYaws] = useState<Record<string, { fwd: number; back: number }>>(() => {
    if (!CALIB_MODE) return {};
    try {
      const saved = localStorage.getItem('calib_yaws');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const [justLocked, setJustLocked] = useState<'fwd' | 'back' | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [allShots, setAllShots] = useState<string[]>([]);
  const [manifestError, setManifestError] = useState<string | null>(null);
  const [copyFlash, setCopyFlash] = useState(false);
  const [showHistoric, setShowHistoric] = useState(false);
  const [exportText, setExportText] = useState<string | null>(null);

  // Persist node list for this sequence whenever it changes
  useEffect(() => {
    if (!CALIB_MODE) return;
    try { localStorage.setItem(`calib_seq_${seqKey}`, JSON.stringify(localNodes)); }
    catch (e) { console.error('[calib] localStorage write failed (nodes):', e); }
  }, [localNodes, seqKey]);

  // Persist accumulated yaws whenever they change
  useEffect(() => {
    if (!CALIB_MODE) return;
    try { localStorage.setItem('calib_yaws', JSON.stringify(calibYaws)); }
    catch (e) { console.error('[calib] localStorage write failed (yaws):', e); }
  }, [calibYaws]);

  // Load full_manifest in calib mode to know available shots
  useEffect(() => {
    if (!CALIB_MODE) return;
    fetch('/tours/full_manifest.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((manifest: Array<{ story: string; slug: string; allShots: string[] }>) => {
        const firstPano = nodes[0]?.panorama ?? '';
        const parts = firstPano.split('/');
        const story = parts[2], slug = parts[3];
        const entry = manifest.find(e => e.story === story && e.slug === slug);
        if (entry) {
          setAllShots(entry.allShots);
        } else {
          setManifestError(`No entry for ${story}/${slug} in full_manifest.json`);
        }
      })
      .catch((e: Error) => setManifestError(`Failed to load manifest: ${e.message}`));
  }, []);

  // Index-based prev/next on localNodes
  const nodeIndex = localNodes.findIndex(n => n.id === nodeId);
  const fallbackHistoricUrl = localNodes[nodeIndex]?.historicMapUrl || localNodes.find(n => n.historicMapUrl)?.historicMapUrl;
  const goNext = useCallback(() => {
    if (nodeIndex < localNodes.length - 1) setNodeId(localNodes[nodeIndex + 1].id);
  }, [nodeIndex, localNodes]);
  const goPrev = useCallback(() => {
    if (nodeIndex > 0) setNodeId(localNodes[nodeIndex - 1].id);
  }, [nodeIndex, localNodes]);

  // Reset historic overlay when moving to a different node
  useEffect(() => { setShowHistoric(false); }, [nodeId]);

  // Notify parent component of the current node index change
  useEffect(() => {
    if (onNodeIndexChange && nodeIndex >= 0) {
      onNodeIndexChange(nodeIndex);
    }
  }, [nodeIndex, onNodeIndexChange]);

  // Preload neighboring textures to speed up transition
  useEffect(() => {
    const preloadImage = (url?: string) => {
      if (!url) return;
      const img = new Image();
      img.src = url;
    };
    if (nodeIndex > 0) {
      preloadImage(localNodes[nodeIndex - 1]?.panorama);
    }
    if (nodeIndex < localNodes.length - 1) {
      preloadImage(localNodes[nodeIndex + 1]?.panorama);
    }
  }, [nodeIndex, localNodes]);

  // Delete current node from localNodes, move to next/prev
  const deleteNode = useCallback(() => {
    if (localNodes.length <= 1) return;
    const id = localNodes[nodeIndex].id;
    console.log('DELETE', JSON.stringify({ nodeId: id }));
    const next = localNodes[nodeIndex + 1] ?? localNodes[nodeIndex - 1];
    setLocalNodes(prev => prev.filter(n => n.id !== id));
    setNodeId(next.id);
  }, [localNodes, nodeIndex]);

  // Add a shot after current position
  const addShot = useCallback((panoramaUrl: string) => {
    const newId = `added-${Date.now()}`;
    // Give placeholder anchors so F/B arrows are visible and calibratable
    const newNode: TourNode = {
      id: newId,
      panorama: panoramaUrl,
      navAnchors: [
        { toNodeId: '__prev__', yaw: 180, pitch: -10, label: 'Quay lại' },
        { toNodeId: '__next__', yaw: 0,   pitch: -10, label: 'Tiếp tục' },
      ],
    };
    console.log('ADD', JSON.stringify({ afterNodeId: localNodes[nodeIndex]?.id, panorama: panoramaUrl }));
    setLocalNodes(prev => {
      const copy = [...prev];
      copy.splice(nodeIndex + 1, 0, newNode);
      return copy;
    });
    setNodeId(newId);
    setShowAddPanel(false);
  }, [localNodes, nodeIndex]);

  // Build calibration export from ALL sequences in localStorage and copy to clipboard
  const copyCalibData = useCallback(() => {
    try {
      localStorage.setItem(`calib_seq_${seqKey}`, JSON.stringify(localNodes));
      localStorage.setItem('calib_yaws', JSON.stringify(calibYaws));
    } catch (e) {
      setExportText(`ERROR: Could not save to localStorage before export:\n${e}`);
      return;
    }

    const yaws: Record<string, { fwd: number; back: number }> = calibYaws;
    const allData: Array<{ id: string; panorama: string; fwdYaw: number | null; backYaw: number | null }> = [];

    // Only export sequences belonging to the same story as the current viewer
    // Works for both local (/tours/ltk/...) and CDN (https://.../tours/ltk/...) URLs
    const storyFromPano = (p: string) => { const i = p.indexOf('/tours/'); return i >= 0 ? p.slice(i + 7).split('/')[0] : ''; };
    const currentStory = storyFromPano(nodes[0]?.panorama ?? '');

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith('calib_seq_')) continue;
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const seqNodes = JSON.parse(raw) as TourNode[];
        // Skip sequences from other stories or prologue (dla-*)
        const seqStory = storyFromPano(seqNodes[0]?.panorama ?? '');
        if (seqStory !== currentStory) continue;
        if (seqNodes[0]?.id.startsWith('dla-')) continue;
        seqNodes.forEach(n => allData.push({
          id: n.id,
          panorama: n.panorama,
          fwdYaw: yaws[n.id]?.fwd ?? null,
          backYaw: yaws[n.id]?.back ?? null,
        }));
      }
    } catch (e) {
      setExportText(`ERROR reading localStorage sequences:\n${e}`);
      return;
    }

    if (allData.length === 0) {
      setExportText('ERROR: No calib_seq_* keys found in localStorage.\nMake sure you are in ?calib=1 mode and have visited at least one sequence.');
      return;
    }

    const json = JSON.stringify(allData, null, 2);
    setExportText(json);
    try { navigator.clipboard?.writeText(json); } catch {}
  }, [seqKey, localNodes, calibYaws]);

  // Keyboard handlers
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { goNext(); return; }
      if (e.key === 'ArrowLeft')  { goPrev(); return; }
      if (!CALIB_MODE) return;
      if (e.key === 'd' || e.key === 'D') { deleteNode(); return; }
      if (e.key === 'a' || e.key === 'A') { setShowAddPanel(v => !v); return; }
      const yaw = Number(yawElRef.current?.dataset.yaw ?? 0);
      if (e.key === 'f' || e.key === 'F') {
        const back = ((yaw + 180 + 360) % 360) > 180
          ? ((yaw + 180 + 360) % 360) - 360
          : (yaw + 180 + 360) % 360;
        setCalibYaws(prev => ({ ...prev, [nodeId]: { fwd: yaw, back } }));
        console.log('CALIB', JSON.stringify({ nodeId, forwardYaw: yaw }) + ',');
        setJustLocked('fwd');
        setTimeout(() => setJustLocked(null), 800);
      }
      if (e.key === 'b' || e.key === 'B') {
        setCalibYaws(prev => ({ ...prev, [nodeId]: { ...(prev[nodeId] ?? { fwd: 0, back: 0 }), back: yaw } }));
        console.log('CALIB_BACK', JSON.stringify({ nodeId, backYaw: yaw }) + ',');
        setJustLocked('back');
        setTimeout(() => setJustLocked(null), 800);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [nodeId, goNext, goPrev, deleteNode]);

  // Intercept __prev__/__next__ sentinel IDs used by placeholder anchors on added nodes
  const handleNavigate = useCallback((id: string) => {
    if (id === '__prev__') { goPrev(); return; }
    if (id === '__next__') { goNext(); return; }
    setNodeId(id);
  }, [goPrev, goNext]);

  const rawNode = localNodes.find(n => n.id === nodeId) ?? localNodes[0];

  // Shots already in the sequence (to exclude from the add panel)
  const inSequence = new Set(localNodes.map(n => n.panorama));

  // In calib mode, always rebuild nav anchors from localNodes position + locked yaws.
  // This works for every node including added ones (which may have [] or stale anchors).
  const node: TourNode = (() => {
    const base = rawNode ?? nodes[0];
    if (!CALIB_MODE || !base) return base;
    const locked = calibYaws[base.id];
    const navAnchors: TourNavAnchor[] = [];
    if (nodeIndex > 0) navAnchors.push({
      toNodeId: localNodes[nodeIndex - 1].id,
      yaw: locked?.back ?? 180,
      pitch: -10,
      label: 'Quay lại',
    });
    if (nodeIndex < localNodes.length - 1) navAnchors.push({
      toNodeId: localNodes[nodeIndex + 1].id,
      yaw: locked?.fwd ?? 0,
      pitch: -10,
      label: 'Tiếp tục',
    });
    return { ...base, navAnchors };
  })();

  // Ambient audio disabled

  if (!node) return null;

  return (
    <div className="absolute inset-0">
      {/* R3F Canvas — fills the scene panel */}
      <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
        <Scene
          node={node}
          collectedIds={collectedIds}
          allClues={allClues}
          onPreview={setPreview}
          onNavigate={handleNavigate}
          onScan={setActiveScan}
          calibrate={CALIB_MODE}
          yawElRef={yawElRef}
        />
      </Canvas>

      {/* Prev / Next buttons */}
      {nodeIndex > 0 && (
        <button onClick={goPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-40 bg-black/60 hover:bg-black/80 text-white rounded-xl px-3 py-4 font-mono text-lg transition-all">
          ◀
        </button>
      )}
      {nodeIndex < localNodes.length - 1 && (
        <button onClick={goNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-40 bg-black/60 hover:bg-black/80 text-white rounded-xl px-3 py-4 font-mono text-lg transition-all">
          ▶
        </button>
      )}

      {/* Delete + Add buttons (calib mode only) */}
      {CALIB_MODE && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 flex gap-2">
          <button onClick={deleteNode}
            className="bg-red-600/90 hover:bg-red-500 text-white font-mono text-xs px-3 py-1.5 rounded-lg transition-all">
            🗑 Delete  <kbd className="opacity-60">D</kbd>
          </button>
          <button onClick={() => setShowAddPanel(v => !v)}
            className="bg-blue-600/90 hover:bg-blue-500 text-white font-mono text-xs px-3 py-1.5 rounded-lg transition-all">
            + Add after  <kbd className="opacity-60">A</kbd>
          </button>
        </div>
      )}

      {/* Add panel — filmstrip of available shots not yet in sequence */}
      {CALIB_MODE && showAddPanel && (
        <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-50 bg-black/90 rounded-2xl p-3 max-w-2xl w-full">
          <p className="text-white/60 font-mono text-[10px] mb-2 text-center">
            click a shot to insert after current — {allShots.filter(s => !inSequence.has(s)).length} available
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {manifestError
              ? <p className="text-red-400 font-mono text-xs w-full text-center py-2">{manifestError}</p>
              : allShots.filter(s => !inSequence.has(s)).length === 0
              ? <p className="text-white/40 font-mono text-xs w-full text-center py-2">all shots already in sequence</p>
              : allShots.filter(s => !inSequence.has(s)).map(shot => (
                  <button key={shot} onClick={() => addShot(shot)}
                    className="flex-none w-24 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-400 transition-all">
                    <img src={shot} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))
            }
          </div>
        </div>
      )}

      {/* Calibration HUD — only visible with ?calib=1 */}
      {CALIB_MODE && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-black/85 text-white rounded-xl px-4 py-2.5 font-mono text-xs leading-relaxed select-none text-center flex items-center gap-3 flex-wrap justify-center">
          <span className="text-yellow-400 font-bold">CALIB</span>
          <span className="text-green-300">{rawNode.id}</span>
          <span>yaw: <span ref={yawElRef} className="text-yellow-300">0</span>°</span>
          <span className="text-white/30">|</span>
          <span className={justLocked === 'fwd' ? 'text-green-400 font-bold' : 'text-white/50'}>
            <kbd className="bg-white/20 px-1 rounded">F</kbd> forward
            {justLocked === 'fwd' && ' ✓'}
          </span>
          <span className="text-white/30">·</span>
          <span className={justLocked === 'back' ? 'text-green-400 font-bold' : 'text-white/50'}>
            <kbd className="bg-white/20 px-1 rounded">B</kbd> back
            {justLocked === 'back' && ' ✓'}
          </span>
          <span className="text-white/30">|</span>
          <span className="text-white/40">◀▶ jump</span>
          <span className="text-white/30">|</span>
          <button
            onClick={copyCalibData}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              copyFlash ? 'bg-green-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            {copyFlash ? '✓ Copied!' : '💾 Copy calib'}
          </button>
          <span className="text-white/30 text-[10px]">
            {Object.keys(calibYaws).length} locked total
          </span>
        </div>
      )}

      {/* Drag hint — shown briefly */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <p className="font-handwritten text-white/70 text-xs text-center drop-shadow">
          Kéo để nhìn xung quanh · Nhấn vào điểm sáng để nghe ký ức
        </p>
      </div>

      {/* Node progress indicator (only if multi-node) */}
      {localNodes.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-auto">
          <div className="bg-black/55 backdrop-blur-sm px-3 py-1 rounded-full text-white text-[11px] font-serif tracking-wide select-none border border-white/10 shadow-lg">
            Điểm {nodeIndex + 1} / {localNodes.length}
          </div>
          <div className="flex gap-1.5 justify-center">
            {localNodes.map((n, i) => (
              <button
                key={n.id}
                onClick={() => setNodeId(n.id)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  n.id === nodeId ? 'w-5 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                title={`Đi tới điểm ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Historic Street View toggle button */}
      {fallbackHistoricUrl && !CALIB_MODE && (
        <button
          onClick={() => setShowHistoric(v => !v)}
          className="absolute top-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs transition-all"
          style={{
            background: showHistoric ? 'rgba(200,170,120,0.9)' : 'rgba(0,0,0,0.45)',
            color: showHistoric ? '#1a1006' : 'rgba(255,255,255,0.75)',
            border: showHistoric ? '1px solid rgba(200,170,120,0.4)' : '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <span style={{ fontSize: 10 }}>📷</span> Trước đây
        </button>
      )}

      {/* Historic Street View iframe overlay */}
      {showHistoric && fallbackHistoricUrl && (
        <div className="absolute inset-0 z-[60] flex flex-col">
          <iframe
            src={fallbackHistoricUrl}
            className="flex-1 w-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ảnh lịch sử"
          />
          <div className="flex-none flex items-center justify-between px-4 py-2 bg-black/70">
            <p className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Google Street View — trước đây</p>
            <button
              onClick={() => setShowHistoric(false)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl px-3 py-1.5 text-xs font-mono transition-all"
            >
              <X className="w-3.5 h-3.5" /> Quay lại
            </button>
          </div>
        </div>
      )}

      {/* 3D Scan overlay */}
      {activeScan && (
        <div className="absolute inset-0 z-[70] bg-black flex flex-col">
          <div className="flex-1 relative">
            <ScanViewer url={activeScan} />
          </div>
          {/* Close bar sits outside the Canvas so clicks always land */}
          <div className="flex-none flex items-center justify-between px-4 py-3 bg-black/80">
            <p className="text-white/40 font-mono text-xs">
              Kéo để xoay · cuộn để zoom · hai ngón để di chuyển
            </p>
            <button
              onClick={() => setActiveScan(null)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-mono transition-all"
            >
              <X className="w-4 h-4" /> Quay lại
            </button>
          </div>
        </div>
      )}

      {/* Calib export modal — shown when clipboard API is unavailable (http://IP) */}
      {exportText && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 p-6">
          <div className="bg-[#1a1a1a] rounded-2xl p-5 w-full max-w-2xl flex flex-col gap-3 max-h-[80vh]">
            <div className="flex items-center justify-between">
              <p className="text-white font-mono text-sm font-bold">📋 Calib data — Cmd+A then Cmd+C</p>
              <button onClick={() => setExportText(null)} className="text-white/50 hover:text-white font-mono text-lg leading-none">✕</button>
            </div>
            <textarea
              readOnly
              value={exportText}
              className="flex-1 bg-black/60 text-green-300 font-mono text-xs rounded-xl p-3 resize-none outline-none min-h-[300px]"
              onFocus={e => e.target.select()}
              autoFocus
            />
            <p className="text-white/40 font-mono text-[10px] text-center">Click inside → Cmd+A → Cmd+C → paste to Claude</p>
          </div>
        </div>
      )}

      {/* Clue preview modal (rendered over the canvas, outside R3F) */}
      {preview && (
        <CluePreviewModal
          clue={preview}
          collected={collectedIds.includes(preview.id)}
          onCollect={() => {
            onCollect(preview.id);
            setPreview(null);
          }}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
