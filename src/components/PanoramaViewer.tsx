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
import { DriveMinimap } from './DriveMinimap';
import { MemoryClueIllustration } from './MemoryClueIllustration';

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
  const currRef = useRef<THREE.Mesh>(null);
  const prevRef = useRef<THREE.Mesh>(null);
  // Textures stored in refs — no React state churn during crossfade
  const texRef = useRef<{ curr: THREE.Texture | null; prev: THREE.Texture | null }>({ curr: null, prev: null });
  const fadeRef = useRef({ active: false, elapsed: 0, duration: 0.38 });
  const [hasFirst, setHasFirst] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.load(url, (tex) => {
      if (cancelled) { tex.dispose(); return; }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.repeat.x = -1;
      tex.offset.x = 1;

      const old = texRef.current;
      if (old.prev) old.prev.dispose();
      texRef.current = { curr: tex, prev: old.curr };
      fadeRef.current = { active: true, elapsed: 0, duration: 0.38 };

      if (!hasFirst) setHasFirst(true);
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useFrame((_, delta) => {
    const { curr, prev } = texRef.current;

    // Keep mesh textures in sync with refs (direct Three.js mutation, no React re-render)
    if (currRef.current) {
      const mat = currRef.current.material as THREE.MeshBasicMaterial;
      if (mat.map !== curr) { mat.map = curr; mat.needsUpdate = true; }
    }
    if (prevRef.current) {
      const mat = prevRef.current.material as THREE.MeshBasicMaterial;
      if (mat.map !== prev) { mat.map = prev; mat.needsUpdate = true; }
    }

    const f = fadeRef.current;
    if (!f.active) {
      if (currRef.current) (currRef.current.material as THREE.MeshBasicMaterial).opacity = 1;
      if (prevRef.current) (prevRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
      return;
    }

    f.elapsed += delta;
    const t = Math.min(1, f.elapsed / f.duration);
    // Smoothstep — ease in/out without the harsh linear ramp
    const ease = t * t * (3 - 2 * t);

    if (currRef.current) (currRef.current.material as THREE.MeshBasicMaterial).opacity = ease;
    if (prevRef.current) (prevRef.current.material as THREE.MeshBasicMaterial).opacity = 1 - ease;

    if (t >= 1) {
      f.active = false;
      if (texRef.current.prev) {
        texRef.current.prev.dispose();
        texRef.current.prev = null;
      }
    }
  });

  if (!hasFirst) {
    return (
      <Html center distanceFactor={90} zIndexRange={[10, 15]}>
        <div className="font-serif text-white/85 text-xs whitespace-nowrap bg-black/60 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 shadow-lg select-none">
          Loading 360° space...
        </div>
      </Html>
    );
  }

  return (
    <>
      {/* Previous panorama — fades out during crossfade */}
      <mesh ref={prevRef}>
        <sphereGeometry args={[500, 64, 32]} />
        <meshBasicMaterial side={THREE.BackSide} transparent opacity={0} />
      </mesh>
      {/* Current panorama — fades in during crossfade */}
      <mesh ref={currRef}>
        <sphereGeometry args={[500, 64, 32]} />
        <meshBasicMaterial side={THREE.BackSide} transparent opacity={1} />
      </mesh>
    </>
  );
}

/** Clue hotspot: map-pin shape (circle + tail). Pulsing ring when uncollected. */
function ClueHotspot({
  anchor,
  clue,
  collected,
  onPreview,
  onCalibDrag,
  onCalibRemove,
  onCalibDragStart,
  onCalibDragEnd,
}: {
  anchor: TourClueAnchor;
  clue: Clue;
  collected: boolean;
  onPreview: (clue: Clue) => void;
  onCalibDrag?: (clueId: string, yaw: number, pitch: number) => void;
  onCalibRemove?: (clueId: string) => void;
  onCalibDragStart?: () => void;
  onCalibDragEnd?: () => void;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startYaw: number; startPitch: number } | null>(null);
  const hasDragged = useRef(false);
  const pos = toPos(anchor.yaw, anchor.pitch);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onCalibDrag) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rx = -(y / (rect.height / 2)) * 14;
    const ry = (x / (rect.width / 2)) * 14;
    setTilt({ x: rx, y: ry });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const cardColor = collected ? '#c8a882' : '#8fafb9';

  return (
    <Html position={pos} center distanceFactor={90} zIndexRange={[10, 15]}>
      <div 
        className="flex flex-col items-center select-none" 
        style={{ 
          filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.65))',
          perspective: '500px'
        }}
      >
        {onCalibRemove && (
          <button
            onClick={() => onCalibRemove(clue.id)}
            className="mb-1.5 w-5 h-5 rounded-full bg-red-500/90 text-white text-[10px] flex items-center justify-center hover:bg-red-400 leading-none shadow-lg border border-red-300/30 z-50"
          >✕</button>
        )}
        <div
          className={`relative w-[112px] h-[142px] bg-[#fdfcf7] rounded-lg p-2 flex flex-col items-center justify-between border transition-all duration-300 ${
            collected 
              ? 'border-amber-400/40 shadow-[0_0_20px_rgba(200,168,130,0.3)]' 
              : 'border-stone-300/40 shadow-[0_0_12px_rgba(0,0,0,0.25)] opacity-85 hover:opacity-100 card-glitch'
          }`}
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.08 : 1})`,
            transition: isHovered ? 'transform 0.05s ease-out' : 'transform 0.4s ease, opacity 0.3s',
            cursor: onCalibDrag ? 'grab' : 'pointer'
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          onClick={() => {
            if (!hasDragged.current) onPreview(clue);
          }}
          onPointerDown={onCalibDrag ? (e) => {
            e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
            hasDragged.current = false;
            dragRef.current = { startX: e.clientX, startY: e.clientY, startYaw: anchor.yaw, startPitch: anchor.pitch ?? -8 };
            onCalibDragStart?.();
          } : undefined}
          onPointerMove={onCalibDrag ? (e) => {
            if (!dragRef.current) return;
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;
            if (Math.abs(dx) + Math.abs(dy) > 4) hasDragged.current = true;
            const newYaw = dragRef.current.startYaw - dx * 0.45;
            const newPitch = dragRef.current.startPitch - dy * 0.28;
            onCalibDrag(clue.id, Math.round(newYaw), Math.round(newPitch));
          } : undefined}
          onPointerUp={onCalibDrag ? () => { dragRef.current = null; onCalibDragEnd?.(); } : undefined}
        >
          {/* Stamps/badges */}
          <div className="absolute top-1 right-1 flex gap-0.5 z-10">
            {!collected ? (
              <span className="text-[5px] font-mono font-bold bg-amber-600/10 text-amber-700 px-1 py-0.5 rounded border border-amber-600/20 uppercase tracking-tight scale-85 origin-top-right">
                Demolition
              </span>
            ) : (
              <span className="text-[5px] font-mono font-bold bg-emerald-600/10 text-emerald-700 px-1 py-0.5 rounded border border-emerald-600/20 uppercase tracking-tight scale-85 origin-top-right">
                Preserved
              </span>
            )}
          </div>

          {/* Polaroid inner frame (Illustration container) */}
          <div className={`w-full aspect-[4/3] rounded bg-[#FCFAF2] border flex items-center justify-center p-1.5 overflow-hidden transition-all duration-300 ${
            collected ? 'border-amber-400/20 bg-amber-50/5' : 'border-stone-200'
          }`}>
            <MemoryClueIllustration clueId={clue.id} color={cardColor} />
          </div>

          {/* Polaroid label text */}
          <div className="w-full flex-1 flex flex-col justify-center text-center px-0.5 pt-1.5 overflow-hidden">
            <span className="font-serif text-[8.5px] leading-tight text-stone-800 font-bold truncate w-full">
              {clue.label}
            </span>
            <span className="font-mono text-[5.5px] text-stone-400 uppercase tracking-widest mt-0.5">
              {collected ? 'Saved ✓' : 'Click to save'}
            </span>
          </div>

          {/* Active glow ring behind the card */}
          <div className={`absolute -inset-0.5 rounded-lg border pointer-events-none transition-opacity duration-300 ${
            collected 
              ? 'border-amber-400/15 animate-pulse opacity-100' 
              : 'border-blue-400/5 opacity-30'
          }`} />
        </div>
      </div>
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
          <ArrowUp className="w-5 h-5 text-amber-400 group-hover:text-amber-200 transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,1)]" />
        )}
        <span className="px-3 py-1 rounded-lg text-[11px] font-serif bg-black/55 text-white/90 group-hover:bg-black/75 group-hover:text-white transition-all whitespace-nowrap shadow-lg backdrop-blur-sm">
          {anchor.label === 'Quay lại' ? 'Go Back' : (anchor.label === 'Tiếp tục' || anchor.label === 'Đi tiếp' || !anchor.label) ? 'Go Forward' : anchor.label}
        </span>
        {isBack && (
          <ArrowDown className="w-5 h-5 text-amber-400 group-hover:text-amber-200 transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,1)]" />
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

// Calibration tracker — reads camera yaw+pitch every frame, writes to a DOM ref (no React re-render).
function CalibTracker({ yawElRef }: { yawElRef: React.RefObject<HTMLSpanElement> }) {
  const { camera } = useThree();
  useFrame(() => {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const yaw = Math.round(Math.atan2(-dir.x, -dir.z) * 180 / Math.PI);
    const pitch = Math.round(Math.atan2(dir.y, Math.sqrt(dir.x * dir.x + dir.z * dir.z)) * 180 / Math.PI);
    if (yawElRef.current) {
      yawElRef.current.textContent = `${yaw}`;
      yawElRef.current.dataset.yaw = String(yaw);
      yawElRef.current.dataset.pitch = String(pitch);
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
  localNodes,
  clueVisible,
  playgroundBlocked,
  onInteract,
  onCalibClueDrag,
  onCalibClueRemove,
  onCalibClueDragStart,
  onCalibClueDragEnd,
  clueIsDragging,
}: {
  node: TourNode;
  collectedIds: string[];
  allClues: Clue[];
  onPreview: (clue: Clue) => void;
  onNavigate: (id: string) => void;
  onScan: (url: string) => void;
  calibrate?: boolean;
  yawElRef: React.RefObject<HTMLSpanElement>;
  localNodes: TourNode[];
  clueVisible: boolean;
  playgroundBlocked: boolean;
  onInteract: () => void;
  onCalibClueDrag?: (clueId: string, yaw: number, pitch: number) => void;
  onCalibClueRemove?: (clueId: string) => void;
  onCalibClueDragStart?: () => void;
  onCalibClueDragEnd?: () => void;
  clueIsDragging?: boolean;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <PanoSphere url={node.panorama} />
      </Suspense>

      {clueVisible && node.clueAnchors?.map((anchor) => {
        const clue = allClues.find((c) => c.id === anchor.clueId);
        if (!clue) return null;
        return (
          <ClueHotspot
            key={anchor.clueId}
            anchor={anchor}
            clue={clue}
            collected={collectedIds.includes(anchor.clueId)}
            onPreview={onPreview}
            onCalibDrag={calibrate ? onCalibClueDrag : undefined}
            onCalibRemove={calibrate ? onCalibClueRemove : undefined}
            onCalibDragStart={calibrate ? onCalibClueDragStart : undefined}
            onCalibDragEnd={calibrate ? onCalibClueDragEnd : undefined}
          />
        );
      })}

      {node.navAnchors
        ?.filter(a => !playgroundBlocked || a.label === 'Quay lại')
        .map((anchor) => (
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
        enabled={!clueIsDragging}
        onChange={onInteract}
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
  nextHint,
}: {
  clue: Clue;
  collected: boolean;
  onCollect: () => void;
  onClose: () => void;
  nextHint?: string;
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
      onpause: () => setPlaying(false),
    });
    howlRef.current = snd;
    // No autoplay — user presses ▶ when they're ready
    return () => {
      snd.stop();
      snd.unload();
    };
  }, [clue.audioSrc]);

  const togglePlay = () => {
    const snd = howlRef.current;
    if (!snd) return;
    if (snd.playing()) { 
      snd.pause(); 
      setPlaying(false); 
    } else { 
      snd.play(); 
      setPlaying(true); 
    }
  };

  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-[#FCFAF2] rounded-3xl p-6 shadow-2xl border border-muctim/10 flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden relative"
        style={{
          boxShadow: '0 20px 50px rgba(0,0,0,0.4), inset 0 0 40px rgba(200, 168, 130, 0.05)'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-muctim/40 hover:text-muctim bg-white/40 hover:bg-white/80 p-2 rounded-full transition-all z-10 border border-muctim/5 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Content - Two columns on desktop */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin flex flex-col md:flex-row gap-6 mt-4 pb-2">
          
          {/* Left Column: Warm Memory (Childhood) */}
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <span className="font-mono text-[9px] text-muctim-faded uppercase tracking-widest block mb-1">
                📍 Childhood Memory
              </span>
              <h3 className="font-serif text-lg font-bold text-muctim leading-tight">
                {clue.label}
              </h3>
            </div>

            {/* Illustration container */}
            <div className="w-full aspect-[16/10] bg-[#fdfcf7] border border-amber-200/40 rounded-xl p-3 flex items-center justify-center shadow-inner relative overflow-hidden bg-radial from-[#FCFAF2] to-[#FAF6ED] flex-shrink-0">
              <div className="w-20 h-20">
                <MemoryClueIllustration clueId={clue.id} color="#c8a882" />
              </div>
            </div>

            {/* Audio Waveform & Player */}
            {clue.audioSrc && (
              <div 
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all text-left ${
                  playing 
                    ? 'bg-amber-100/30 border border-amber-200' 
                    : 'bg-stone-100 hover:bg-stone-200/60 border border-stone-200'
                }`}
              >
                <button
                  onClick={togglePlay}
                  className={`w-9 h-9 rounded-full flex-none flex items-center justify-center text-xs transition-all shadow-md active:scale-95 cursor-pointer ${
                    playing ? 'bg-amber-600 text-white' : 'bg-amber-700 text-white'
                  }`}
                >
                  {playing ? '⏸' : '▶'}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[8px] text-amber-800 uppercase tracking-widest font-bold">
                    {playing ? 'STREAMING ORAL HISTORY' : 'LISTEN TO NARRATIVE'}
                  </p>
                  <div className="flex gap-0.5 items-end h-4 mt-1">
                    {/* Retro waveform bars */}
                    {[0.3, 0.7, 0.4, 0.9, 0.5, 0.8, 0.6, 0.4, 0.7, 0.5, 0.8, 0.3, 0.9, 0.6, 0.4].map((h, i) => (
                      <div 
                        key={i} 
                        className={`w-[3px] rounded-full transition-all duration-300 ${
                          playing ? 'bg-amber-600' : 'bg-stone-300'
                        }`}
                        style={{ 
                          height: playing ? `${h * 100}%` : '20%',
                          animationDelay: `${i * 0.05}s`
                        }} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Poetic quote */}
            <p className="font-handwritten text-lg text-amber-900 italic leading-relaxed text-center px-2 py-1 bg-amber-500/5 rounded-xl border border-amber-200/10">
              {clue.quote}
            </p>

            {/* Detailed voice note */}
            <p className="font-serif text-xs text-muctim-faded leading-relaxed bg-[#fbfaf5]/50 rounded-xl p-3 border border-muctim/5">
              {clue.voiceNote}
            </p>
          </div>

          {/* Vertical divider on desktop */}
          <div className="hidden md:block w-px bg-muctim/10 self-stretch my-2" />

          {/* Right Column: What Will Be Lost */}
          <div className="flex-1 flex flex-col justify-between gap-5">
            <div className="flex flex-col gap-4">
              <div>
                <span className="font-mono text-[9px] text-red-500/80 uppercase tracking-widest block mb-1 font-bold">
                  2026 Urban Redevelopment
                </span>
                <h3 className="font-serif text-base font-bold text-stone-700 leading-tight">
                  What will be demolished
                </h3>
              </div>

              {clue.planningImpact && (
                <div className="bg-stone-100/60 border border-stone-200 rounded-2xl p-4 font-serif text-[11.5px] leading-relaxed text-stone-700">
                  {clue.planningImpact}
                </div>
              )}
            </div>

            {/* Bottom Save Action */}
            <div className="pt-3 border-t border-muctim/5 flex-none">
              {collected ? (
                <div className="flex flex-col gap-2">
                  <div className="w-full py-2.5 bg-emerald-700/10 border border-emerald-600/30 rounded-xl text-center font-serif text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
                    <span>✓</span> Memory Archived
                  </div>
                  {nextHint && (
                    <button
                      onClick={onClose}
                      className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-200 font-serif text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {nextHint} →
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={onCollect}
                  className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-serif text-sm font-semibold rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 hover:shadow-[0_4px_16px_rgba(180,83,9,0.3)] cursor-pointer"
                >
                  📥 Save to Digital Archive
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ---------- Calib clue sidebar ----------

function CalibCluePanel({
  allClues,
  nodeId,
  calibClues,
  baseAnchors,
  onPlace,
  onRemove,
}: {
  allClues: Clue[];
  nodeId: string;
  calibClues: Array<{ nodeId: string; clueId: string; yaw: number; pitch: number; removed?: boolean }>;
  baseAnchors: Array<{ clueId: string }> | undefined;
  onPlace: (clueId: string) => void;
  onRemove: (clueId: string) => void;
}) {
  const baseIds = new Set((baseAnchors ?? []).map(a => a.clueId));
  const nodeCalib = calibClues.filter(c => c.nodeId === nodeId);
  const removedIds = new Set(nodeCalib.filter(c => c.removed).map(c => c.clueId));
  const addedIds = new Set(nodeCalib.filter(c => !c.removed && !baseIds.has(c.clueId)).map(c => c.clueId));

  const isOnNode = (id: string) =>
    (baseIds.has(id) && !removedIds.has(id)) || addedIds.has(id);

  return (
    <div className="absolute right-3 top-14 bottom-20 z-40 w-52 flex flex-col overflow-hidden">
      <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-white/10 flex flex-col overflow-hidden">
        <p className="text-[9px] font-mono text-yellow-400/70 uppercase tracking-widest px-3 pt-2 pb-1 flex-none">
          Clues — click Place, then drag
        </p>
        <div className="overflow-y-auto flex-1 px-2 pb-2 flex flex-col gap-1">
          {allClues.map(clue => {
            const on = isOnNode(clue.id);
            return (
              <div
                key={clue.id}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-mono border ${
                  on
                    ? 'bg-purple-500/20 border-purple-400/50 text-purple-200'
                    : 'bg-white/5 border-white/10 text-white/60'
                }`}
              >
                <span className="flex-1 truncate" title={clue.label}>
                  {CLUE_ICONS[clue.type]} {clue.label}
                </span>
                {on ? (
                  <button
                    onClick={() => onRemove(clue.id)}
                    className="flex-none text-red-400 hover:text-red-300 bg-red-500/20 rounded px-1 text-[9px]"
                  >✕ Remove</button>
                ) : (
                  <button
                    onClick={() => onPlace(clue.id)}
                    className="flex-none text-green-400 hover:text-green-300 bg-green-500/20 rounded px-1 text-[9px]"
                  >+ Place</button>
                )}
              </div>
            );
          })}
        </div>
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
  driveMode = false,
}: {
  nodes: TourNode[];
  startNodeId?: string;
  collectedIds: string[];
  onCollect: (clueId: string) => void;
  ambient?: string;
  allClues: Clue[];
  minimapFlipX?: boolean;
  onNodeIndexChange?: (idx: number) => void;
  driveMode?: boolean;
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
  // Only count dwell time after the player first drags at each node (not during narrator card)
  const nodeInteracted = useRef(false);

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
  const [clueIsDragging, setClueIsDragging] = useState(false);
  const [showHistoric, setShowHistoric] = useState(false);
  const [dragHintVisible, setDragHintVisible] = useState(true);
  const [exportText, setExportText] = useState<string | null>(null);
  const [dwellSecs, setDwellSecs] = useState(0);
  // Clues visible from the start — no dwell gate needed
  const clueVisible = true;
  const playgroundBlocked = !CALIB_MODE && !!nodeId?.startsWith('tt-pg') && dwellSecs < 15;

  // Drive mode — auto-advance through nodes like a moving car
  const DRIVE_MS = 4500;
  const [drivePlaying, setDrivePlaying] = useState(true);
  const [driveProgress, setDriveProgress] = useState(0); // 0–100
  const driveElapsedRef = useRef(0);
  const driveLastRef = useRef(Date.now());

  // Persist node list for this sequence whenever it changes
  useEffect(() => {
    if (!CALIB_MODE) return;
    try { localStorage.setItem(`calib_seq_${seqKey}`, JSON.stringify(localNodes)); }
    catch (e) { console.error('[calib] localStorage write failed (nodes):', e); }
  }, [localNodes, seqKey]);

  // calibClues: clue anchor positions calibrated this session, persisted to localStorage
  // removed:true = clue was explicitly deleted from this node in calib mode
  const [calibClues, setCalibClues] = useState<Array<{ nodeId: string; clueId: string; yaw: number; pitch: number; removed?: boolean }>>(() => {
    if (!CALIB_MODE) return [];
    try {
      const saved = localStorage.getItem('calib_clues');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Persist accumulated yaws whenever they change
  useEffect(() => {
    if (!CALIB_MODE) return;
    try { localStorage.setItem('calib_yaws', JSON.stringify(calibYaws)); }
    catch (e) { console.error('[calib] localStorage write failed (yaws):', e); }
  }, [calibYaws]);

  // Persist calibrated clue positions
  useEffect(() => {
    if (!CALIB_MODE) return;
    try { localStorage.setItem('calib_clues', JSON.stringify(calibClues)); }
    catch (e) { console.error('[calib] localStorage write failed (clues):', e); }
  }, [calibClues]);

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
    if (playgroundBlocked) return;
    if (nodeIndex < localNodes.length - 1) setNodeId(localNodes[nodeIndex + 1].id);
  }, [nodeIndex, localNodes, playgroundBlocked]);
  const goPrev = useCallback(() => {
    if (nodeIndex > 0) setNodeId(localNodes[nodeIndex - 1].id);
  }, [nodeIndex, localNodes]);

  // Reset historic overlay and show drag hint when moving to a different node
  useEffect(() => { setShowHistoric(false); setDragHintVisible(true); }, [nodeId]);

  // Auto-fade the drag hint after 4 seconds
  useEffect(() => {
    if (!dragHintVisible) return;
    const timer = setTimeout(() => setDragHintVisible(false), 4000);
    return () => clearTimeout(timer);
  }, [dragHintVisible]);

  // Dwell timer — only counts after first drag at each node (narrator card doesn't count)
  useEffect(() => {
    nodeInteracted.current = false;
    setDwellSecs(0);
    const t = setInterval(() => {
      if (nodeInteracted.current) setDwellSecs(s => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [nodeId]);

  // Drive mode: reset progress whenever node changes
  useEffect(() => {
    if (!driveMode) return;
    driveElapsedRef.current = 0;
    driveLastRef.current = Date.now();
    setDriveProgress(0);
  }, [nodeId, driveMode]);

  // Drive mode: tick forward, auto-advance when timer expires
  useEffect(() => {
    if (!driveMode) return;
    const id = setInterval(() => {
      if (!drivePlaying || preview) return;
      const now = Date.now();
      driveElapsedRef.current += now - driveLastRef.current;
      driveLastRef.current = now;
      const pct = Math.min(100, (driveElapsedRef.current / DRIVE_MS) * 100);
      setDriveProgress(pct);
      if (driveElapsedRef.current >= DRIVE_MS) {
        driveElapsedRef.current = 0;
        setDriveProgress(0);
        setNodeId(cur => {
          const idx = localNodes.findIndex(n => n.id === cur);
          return idx < localNodes.length - 1 ? localNodes[idx + 1].id : cur;
        });
      }
    }, 80);
    return () => clearInterval(id);
  }, [driveMode, drivePlaying, preview, localNodes]);

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

    const navJson = JSON.stringify(allData, null, 2);
    // Also include any clue anchors calibrated this session
    const clueJson = calibClues.length > 0
      ? '\n\n// === Calibrated clue anchors — paste into stories.ts ===\n' + JSON.stringify(calibClues, null, 2)
      : '';
    const combined = navJson + clueJson;
    setExportText(combined);
    try { navigator.clipboard?.writeText(combined); } catch {}
  }, [seqKey, localNodes, calibYaws, calibClues]);

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
      // C key: lock current camera yaw as the clue anchor yaw for ALL clues at this node
      if (e.key === 'c' || e.key === 'C') {
        const anchors = rawNode?.clueAnchors ?? [];
        if (anchors.length > 0) {
          const newEntries = anchors.map(a => ({ nodeId, clueId: a.clueId, yaw, pitch: a.pitch ?? -8 }));
          setCalibClues(prev => {
            const filtered = prev.filter(c => !(c.nodeId === nodeId && anchors.some(a => a.clueId === c.clueId)));
            return [...filtered, ...newEntries];
          });
          console.log('CALIB_CLUE', JSON.stringify(newEntries) + ',');
          setJustLocked('fwd');
          setTimeout(() => setJustLocked(null), 800);
        }
        return;
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
    // Apply calibrated clue anchors: reposition existing, filter removed, add newly placed
    const nodeCalib = calibClues.filter(c => c.nodeId === base.id);
    const removedIds = new Set(nodeCalib.filter(c => c.removed).map(c => c.clueId));
    const calibrated = (base.clueAnchors ?? [])
      .filter(a => !removedIds.has(a.clueId))
      .map(a => {
        const c = nodeCalib.find(cc => cc.clueId === a.clueId && !cc.removed);
        return c ? { ...a, yaw: c.yaw, pitch: c.pitch } : a;
      });
    // Add clues placed via sidebar that weren't in the original node
    const baseIds = new Set((base.clueAnchors ?? []).map(a => a.clueId));
    const added = nodeCalib
      .filter(c => !c.removed && !baseIds.has(c.clueId))
      .map(c => ({ clueId: c.clueId, yaw: c.yaw, pitch: c.pitch }));
    const allClueAnchors = [...calibrated, ...added];
    return { ...base, navAnchors, ...(allClueAnchors.length ? { clueAnchors: allClueAnchors } : { clueAnchors: [] }) };
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
          localNodes={localNodes}
          clueVisible={clueVisible}
          playgroundBlocked={playgroundBlocked}
          onInteract={() => { nodeInteracted.current = true; }}
          onCalibClueDrag={CALIB_MODE ? (clueId, yaw, pitch) => {
            setCalibClues(prev => {
              const filtered = prev.filter(c => !(c.nodeId === nodeId && c.clueId === clueId));
              return [...filtered, { nodeId, clueId, yaw, pitch }];
            });
          } : undefined}
          onCalibClueRemove={CALIB_MODE ? (clueId) => {
            setCalibClues(prev => {
              const filtered = prev.filter(c => !(c.nodeId === nodeId && c.clueId === clueId));
              return [...filtered, { nodeId, clueId, yaw: 0, pitch: -8, removed: true }];
            });
          } : undefined}
          onCalibClueDragStart={CALIB_MODE ? () => setClueIsDragging(true) : undefined}
          onCalibClueDragEnd={CALIB_MODE ? () => setClueIsDragging(false) : undefined}
          clueIsDragging={clueIsDragging}
        />
      </Canvas>

      {/* Prev / Next buttons */}
      {nodeIndex > 0 && (
        <button onClick={goPrev}
          aria-label="Quay lại"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-40 bg-black/60 hover:bg-black/80 text-white rounded-xl px-3 py-4 font-mono text-lg transition-all">
          ◀
        </button>
      )}
      {nodeIndex < localNodes.length - 1 && !playgroundBlocked && (
        <button onClick={goNext}
          aria-label="Tiếp tục"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-40 bg-black/60 hover:bg-black/80 text-white rounded-xl px-3 py-4 font-mono text-lg transition-all">
          ▶
        </button>
      )}
      {playgroundBlocked && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-40 pointer-events-none">
          <div className="bg-black/55 backdrop-blur-sm text-white/40 rounded-xl px-3 py-4 font-mono text-lg text-center">
            ⏳
          </div>
        </div>
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
            {Object.keys(calibYaws).length} nav locked · {calibClues.length} clues
          </span>
          {(rawNode?.clueAnchors?.length ?? 0) > 0 && (
            <>
              <span className="text-white/30 w-full text-center text-[9px]">— clues at this node —</span>
              {rawNode!.clueAnchors!.map(a => {
                const cal = calibClues.find(c => c.nodeId === nodeId && c.clueId === a.clueId);
                return (
                  <span key={a.clueId} className={cal ? 'text-purple-300 font-bold' : 'text-yellow-400/80'}>
                    <kbd className="bg-white/20 px-1 rounded text-[9px]">C</kbd>{' '}
                    {a.clueId.split('-').slice(-2).join('-')} @ {cal?.yaw ?? a.yaw}°
                    {cal ? ' ✓' : ' (default)'}
                  </span>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Calib clue sidebar */}
      {CALIB_MODE && (
        <CalibCluePanel
          allClues={allClues}
          nodeId={nodeId}
          calibClues={calibClues}
          baseAnchors={rawNode?.clueAnchors}
          onPlace={(clueId) => {
            const yaw = Number(yawElRef.current?.dataset.yaw ?? 0);
            const pitch = Number(yawElRef.current?.dataset.pitch ?? -8);
            setCalibClues(prev => {
              const filtered = prev.filter(c => !(c.nodeId === nodeId && c.clueId === clueId));
              return [...filtered, { nodeId, clueId, yaw, pitch }];
            });
          }}
          onRemove={(clueId) => {
            setCalibClues(prev => {
              const filtered = prev.filter(c => !(c.nodeId === nodeId && c.clueId === clueId));
              return [...filtered, { nodeId, clueId, yaw: 0, pitch: -8, removed: true }];
            });
          }}
        />
      )}

      {/* Minimap — show whenever nodes carry GPS, regardless of drive mode */}
      {!CALIB_MODE && localNodes.some(n => n.lat != null) && (
        <DriveMinimap nodes={localNodes} currentIndex={nodeIndex} />
      )}

      {/* Drive mode — progress bar + play/pause + walking badge */}
      {driveMode && !CALIB_MODE && (
        <>
          {/* Drive progress bar — thin strip at the very bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-30 h-[3px] bg-white/10">
            <div
              className="h-full bg-amber-400/80 transition-none"
              style={{ width: `${driveProgress}%` }}
            />
          </div>

          {/* Play / pause button — bottom-right above nav dot */}
          <button
            onClick={() => {
              driveLastRef.current = Date.now();
              setDrivePlaying(p => !p);
            }}
            className="absolute bottom-[52px] right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[11px] transition-all select-none"
            style={{
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(6px)',
            }}
          >
            {drivePlaying ? '⏸' : '▶'} {drivePlaying ? 'pause' : 'resume'}
          </button>

          {/* "Đang đi" badge — top centre label */}
          <div className="absolute top-[52px] left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px]"
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <span style={{ fontSize: 9 }}>🚶</span>
              {drivePlaying ? 'Navigating...' : 'Paused'}
            </div>
          </div>
        </>
      )}

      {/* Drag hint — auto-fades after 4s */}
      {dragHintVisible && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-700">
          <p className="font-handwritten text-white/70 text-xs text-center drop-shadow">
            Drag to look around
          </p>
        </div>
      )}

      {/* Node progress indicator (only if multi-node) */}
      {localNodes.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-auto">
          <div className="bg-black/55 backdrop-blur-sm px-3 py-1 rounded-full text-white text-[11px] font-serif tracking-wide select-none border border-white/10 shadow-lg">
            Point {nodeIndex + 1} / {localNodes.length}
          </div>
          <div className="flex gap-1.5 justify-center">
            {localNodes.map((n, i) => (
              <button
                key={n.id}
                onClick={() => setNodeId(n.id)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  n.id === nodeId ? 'w-5 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                title={`Go to point ${i + 1}`}
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
          <span style={{ fontSize: 10 }}>📷</span> Past Comparison
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
            title="Past Google Street View"
          />
          <div className="flex-none flex items-center justify-between px-4 py-2 bg-black/70">
            <p className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Google Street View — Past</p>
            <button
              onClick={() => setShowHistoric(false)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl px-3 py-1.5 text-xs font-mono transition-all"
            >
              <X className="w-3.5 h-3.5" /> Go Back
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
              Drag to rotate · Scroll to zoom
            </p>
            <button
              onClick={() => setActiveScan(null)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-mono transition-all"
            >
              <X className="w-4 h-4" /> Go Back
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
      {preview && (() => {
        // Find where the next uncollected clue lives so modal can direct the player
        const currentNodeIdx = localNodes.findIndex(n =>
          n.clueAnchors?.some(a => a.clueId === preview.id)
        );
        const nextNode = localNodes.find((n, i) =>
          i !== currentNodeIdx &&
          n.clueAnchors?.some(a => !collectedIds.includes(a.clueId) && a.clueId !== preview.id)
        );
        const nextIdx = nextNode ? localNodes.indexOf(nextNode) : -1;
        const nextHint = nextNode
          ? nextIdx > nodeIndex
            ? `Go to Point ${nextIdx + 1}`
            : `Go back to Point ${nextIdx + 1}`
          : undefined;
        return (
          <CluePreviewModal
            clue={preview}
            collected={collectedIds.includes(preview.id)}
            onCollect={() => {
              onCollect(preview.id);
              setPreview(null);
            }}
            onClose={() => setPreview(null)}
            nextHint={nextHint}
          />
        );
      })()}
    </div>
  );
}
