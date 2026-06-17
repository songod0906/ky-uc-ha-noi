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
import { Howl, Howler } from 'howler';
import { X, ArrowUp, ArrowDown, Box, Camera, Check, MapPin, Pause, Play, Volume2 } from 'lucide-react';
import type { TourNode, TourClueAnchor, TourNavAnchor, TourScanAnchor, Clue } from '../types';
import { ScanViewer } from './ScanViewer';
import { DriveMinimap } from './DriveMinimap';
import { MemoryClueIllustration } from './MemoryClueIllustration';
import { AudioSynth } from '../utils/AudioSynth';

// ---------- helpers ----------

interface SrtCue { start: number; end: number; text: string; }

function parseSrt(raw: string): SrtCue[] {
  const cues: SrtCue[] = [];
  for (const block of raw.trim().split(/\n\n+/)) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;
    const m = lines[1].match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);
    if (!m) continue;
    const s = (h: string, mn: string, sc: string, ms: string) => +h * 3600 + +mn * 60 + +sc + +ms / 1000;
    cues.push({ start: s(m[1],m[2],m[3],m[4]), end: s(m[5],m[6],m[7],m[8]), text: lines.slice(2).join(' ').trim() });
  }
  return cues;
}

const SRT_MAP: Record<string, string> = {
  '/audio/oral-history/thanh-cong.m4a':     '/subtitles/thanh-cong-eng.srt',
  '/audio/oral-history/trung-liet.m4a':     '/subtitles/trung-liet-eng.srt',
  '/audio/oral-history/hoang-hoa-tham.m4a': '/subtitles/hoang-hoa-tham-eng.srt',
};

const CLUE_ICONS: Record<string, string> = {
  place: '📍',
  sound: '🔊',
  routine: '🌀',
  object: '📦',
  loss: '🕯',
};

const SHOW_EDGE_NAV = false; // Set to true to restore 2D edge chevrons (◀/▶)

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
  scanLabel,
  onPreview,
  onCalibDrag,
  onCalibRemove,
  onCalibDragStart,
  onCalibDragEnd,
}: {
  anchor: TourClueAnchor;
  clue: Clue;
  collected: boolean;
  scanLabel?: string;
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
          data-tutorial="clue"
          className={`relative w-[124px] h-[156px] bg-[#fdfcf7] rounded-lg p-2.5 flex flex-col items-center justify-between border transition-all duration-300 ${
            collected
              ? 'border-amber-400/40 shadow-[0_0_20px_rgba(200,168,130,0.3)]'
              : 'border-amber-500/60 shadow-[0_0_22px_rgba(251,191,36,0.38)] opacity-95 hover:opacity-100 card-glitch'
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
                Click me
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
            <span 
              className="font-serif text-[8.5px] leading-tight text-stone-900 font-bold whitespace-normal w-full"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {clue.label}
            </span>
            <span className={`font-mono text-[6.5px] uppercase tracking-widest mt-1 ${collected ? 'text-emerald-700' : 'text-amber-700 font-bold'}`}>
              {collected ? 'Saved' : 'Tap to hear'}
            </span>
            {scanLabel && (
              <span className="font-mono text-[5.5px] text-amber-700 uppercase tracking-tight mt-0.5 leading-tight">
                Inside {scanLabel.replace(/^View /, '').replace(/^Inspect /, '')}
              </span>
            )}
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
  showNavigation,
  suppressForwardNavigation,
  playgroundBlocked,
  onInteract,
  onCalibClueDrag,
  onCalibClueRemove,
  onCalibClueDragStart,
  onCalibClueDragEnd,
  clueIsDragging,
  lastNavDirRef,
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
  showNavigation: boolean;
  suppressForwardNavigation: boolean;
  playgroundBlocked: boolean;
  onInteract: () => void;
  onCalibClueDrag?: (clueId: string, yaw: number, pitch: number) => void;
  onCalibClueRemove?: (clueId: string) => void;
  onCalibClueDragStart?: () => void;
  onCalibClueDragEnd?: () => void;
  clueIsDragging?: boolean;
  lastNavDirRef?: React.MutableRefObject<'fwd' | 'back' | 'none'>;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    // Read and immediately consume the nav direction — reset so future re-renders don't re-fire
    const lastNavDir = lastNavDirRef?.current ?? 'none';
    if (lastNavDirRef) lastNavDirRef.current = 'none';

    // 1. Determine target yaw
    let targetYaw = 0;
    let found = false;
    const uncollectedClueAnchor = clueVisible
      ? node.clueAnchors?.find((anchor) => !collectedIds.includes(anchor.clueId))
      : undefined;

    if (!calibrate && uncollectedClueAnchor) {
      targetYaw = uncollectedClueAnchor.yaw;
      found = true;
    } else if (lastNavDir === 'fwd') {
      const fwdAnchor = node.navAnchors?.find(
        (a) => a.label === 'Tiếp tục' || a.label === 'Đi tiếp' || !a.label
      );
      if (fwdAnchor) {
        targetYaw = fwdAnchor.yaw;
        found = true;
      }
    } else if (lastNavDir === 'back') {
      const backAnchor = node.navAnchors?.find((a) => a.label === 'Quay lại');
      if (backAnchor) {
        targetYaw = backAnchor.yaw;
        found = true;
      }
    }

    // Fallback for initial entry: face the first clue if present,
    // otherwise face the forward nav anchor.
    if (!found) {
      const clueAnchor = node.clueAnchors?.[0];
      if (clueAnchor && lastNavDir === 'none') {
        targetYaw = clueAnchor.yaw;
      } else {
        const fwdAnchor = node.navAnchors?.find(
          (a) => a.label === 'Tiếp tục' || a.label === 'Đi tiếp' || !a.label
        );
        if (fwdAnchor) {
          targetYaw = fwdAnchor.yaw;
        }
      }
    }

    // 2. Set camera position and target in OrbitControls
    const r = 0.1;
    const yawRad = (targetYaw * Math.PI) / 180;
    const x = r * Math.sin(yawRad);
    const z = r * Math.cos(yawRad);

    camera.position.set(x, 0, z);
    camera.lookAt(0, 0, 0);

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.id, camera]);

  return (
    <>
      <Suspense fallback={null}>
        <PanoSphere url={node.panorama} />
      </Suspense>

      {clueVisible && node.clueAnchors?.map((anchor) => {
        const clue = allClues.find((c) => c.id === anchor.clueId);
        if (!clue) return null;
        const scanLabel = node.scanAnchors?.find((scan) => scan.clueId === anchor.clueId)?.label;
        return (
          <ClueHotspot
            key={anchor.clueId}
            anchor={anchor}
            clue={clue}
            collected={collectedIds.includes(anchor.clueId)}
            scanLabel={scanLabel}
            onPreview={onPreview}
            onCalibDrag={calibrate ? onCalibClueDrag : undefined}
            onCalibRemove={calibrate ? onCalibClueRemove : undefined}
            onCalibDragStart={calibrate ? onCalibClueDragStart : undefined}
            onCalibDragEnd={calibrate ? onCalibClueDragEnd : undefined}
          />
        );
      })}

      {showNavigation && node.navAnchors
        ?.filter((anchor) => {
          const isBack = anchor.label === 'Quay lại';
          if (playgroundBlocked) return isBack;
          if (!calibrate && suppressForwardNavigation) return isBack;
          return true;
        })
        .map((anchor) => {
          // Visitor mode nudges nav away from clue cards. Calibration mode must show exact yaws.
          let adjustedAnchor = { ...anchor };
          if (!calibrate && clueVisible && node.clueAnchors) {
            for (const clueAnchor of node.clueAnchors) {
              let diff = (adjustedAnchor.yaw - clueAnchor.yaw) % 360;
              if (diff > 180) diff -= 360;
              if (diff < -180) diff += 360;

              // If they are too close in yaw (less than 28 degrees), nudge the nav arrow
              if (Math.abs(diff) < 28) {
                const nudge = diff >= 0 ? 30 : -30;
                adjustedAnchor.yaw += nudge;
                // Also nudge pitch slightly down to avoid overlapping the card height
                adjustedAnchor.pitch = Math.min(adjustedAnchor.pitch, -18);
              }
            }
          }
          return <NavHotspot key={adjustedAnchor.toNodeId} anchor={adjustedAnchor} onNavigate={onNavigate} />;
        })}

      {node.scanAnchors?.map((anchor) => (
        <ScanHotspot key={anchor.scanUrl} anchor={anchor} onOpen={onScan} />
      ))}

      {calibrate && <CalibTracker yawElRef={yawElRef} />}

      <OrbitControls
        ref={controlsRef}
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

function MemoryAudioDock({
  clue,
  playing,
  progress,
  duration,
  saved,
  scanLabel,
  onToggle,
  onClose,
  onOpenScan,
  onOpenHistoric,
}: {
  clue: Clue;
  playing: boolean;
  progress: number;
  duration: number;
  saved: boolean;
  scanLabel?: string;
  onToggle: () => void;
  onClose: () => void;
  onOpenScan?: () => void;
  onOpenHistoric?: () => void;
}) {
  const pct = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;
  const timeLeft = duration > 0 ? Math.max(0, Math.ceil(duration - progress)) : null;

  return (
    <div className="absolute inset-x-3 bottom-20 z-[90] flex justify-center pointer-events-none">
      <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0b0907]/88 shadow-2xl backdrop-blur-md pointer-events-auto overflow-hidden">
        <div className="h-1 bg-white/10">
          <div className="h-full bg-amber-400 transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-start gap-3 p-3 sm:p-4">
          <button
            onClick={onToggle}
            aria-label={playing ? 'Pause memory audio' : 'Play memory audio'}
            className="mt-0.5 flex h-12 w-12 flex-none items-center justify-center rounded-full bg-amber-500 text-black shadow-lg transition-all hover:bg-amber-300 active:scale-95"
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="flex items-center gap-1 rounded-full bg-white/8 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-amber-100/70">
                <Volume2 className="h-3 w-3" />
                Memory audio
              </span>
              <span className="rounded-full bg-emerald-400/12 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-emerald-200">
                {saved ? 'Saved to diary' : 'Saving'}
              </span>
              {timeLeft !== null && (
                <span className="font-mono text-[10px] text-white/45">{timeLeft}s left</span>
              )}
            </div>
            <h3 className="truncate font-serif text-sm font-bold leading-tight text-white sm:text-base">
              {clue.label}
            </h3>
            <p className="mt-1 line-clamp-2 font-serif text-xs leading-relaxed text-amber-50/78 sm:text-sm">
              {clue.quote.replace(/^"|"$/g, '')}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {onOpenScan && (
                <button
                  onClick={onOpenScan}
                  className="flex min-h-10 items-center gap-2 rounded-xl border border-amber-300/25 bg-amber-300/12 px-3 py-2 font-serif text-xs font-semibold text-amber-100 transition-all hover:bg-amber-300/20 active:scale-95"
                >
                  <Box className="h-4 w-4" />
                  {scanLabel ?? 'View 3D artifact'}
                </button>
              )}
              {onOpenHistoric && (
                <button
                  onClick={onOpenHistoric}
                  className="flex min-h-10 items-center gap-2 rounded-xl border border-sky-200/25 bg-sky-200/12 px-3 py-2 font-serif text-xs font-semibold text-sky-100 transition-all hover:bg-sky-200/20 active:scale-95"
                >
                  <Camera className="h-4 w-4" />
                  Compare with past
                </button>
              )}
              {!clue.audioSrc && (
                <span className="flex min-h-10 items-center rounded-xl border border-white/10 bg-white/8 px-3 py-2 font-serif text-xs text-white/70">
                  Silent fragment saved
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close memory audio"
            className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white/8 text-white/65 transition-all hover:bg-white/14 hover:text-white active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
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
  driveIntervalMs = 4500,
  backgroundMode = false,
  onScanChange,
  audioSegmentSrc,
  spaceId,
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
  driveIntervalMs?: number;
  backgroundMode?: boolean;
  onScanChange?: (isOpen: boolean) => void;
  audioSegmentSrc?: string;
  spaceId?: string;
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
  const [activeClue, setActiveClue] = useState<Clue | null>(null);
  const [memoryPlaying, setMemoryPlaying] = useState(false);
  const [memoryProgress, setMemoryProgress] = useState(0);
  const [memoryDuration, setMemoryDuration] = useState(0);
  const [activeScan, setActiveScan] = useState<string | null>(null);
  const [srtCues, setSrtCues] = useState<SrtCue[]>([]);
  const [ambientEnabled, setAmbientEnabled] = useState(true);
  const [nextNodeLoaded, setNextNodeLoaded] = useState(true);

  // Notify parent component of active 3D scan state changes
  useEffect(() => {
    onScanChange?.(!!activeScan);
  }, [activeScan, onScanChange]);

  // Load the full oral history SRT once (EN). Each clue is a segment of this recording,
  // so we look up cues using (node.audioSec + memoryProgress) as the absolute timestamp.
  useEffect(() => {
    const srtPath = audioSegmentSrc ? SRT_MAP[audioSegmentSrc] : undefined;
    if (!srtPath) { setSrtCues([]); return; }
    fetch(srtPath)
      .then(r => { if (!r.ok) throw new Error(); return r.text(); })
      .then(raw => setSrtCues(parseSrt(raw)))
      .catch(() => setSrtCues([]));
  }, [audioSegmentSrc]);

  // Keep currentAudioSecRef in sync with the current node's audioSec.
  useEffect(() => {
    currentAudioSecRef.current = rawNode?.audioSec ?? 0;
  });

  const memoryHowlRef = useRef<Howl | null>(null);
  const memoryProgressTimerRef = useRef<number | null>(null);
  const lastNavDirRef = useRef<'fwd' | 'back' | 'none'>('none');
  const currentAudioSecRef = useRef<number>(0);
  const activeClueAudioSecRef = useRef<number>(0);
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
  const clueVisible = true;
  const playgroundBlocked = !CALIB_MODE && !!nodeId?.startsWith('tt-pg') && dwellSecs < 15;

  // Drive mode — auto-advance through nodes like a moving car
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
  const rawNode = localNodes.find(n => n.id === nodeId) ?? localNodes[0];
  const fallbackHistoricUrl = localNodes[nodeIndex]?.historicMapUrl || localNodes.find(n => n.historicMapUrl)?.historicMapUrl;
  const blockingClueId = !CALIB_MODE && driveMode
    ? rawNode?.clueAnchors?.find((anchor) => !collectedIds.includes(anchor.clueId) && activeClue?.id !== anchor.clueId)?.clueId
    : undefined;
  const goNext = useCallback(() => {
    if (!CALIB_MODE && blockingClueId) return;
    if (playgroundBlocked) return;
    if (nodeIndex < localNodes.length - 1) {
      lastNavDirRef.current = 'fwd';
      setNodeId(localNodes[nodeIndex + 1].id);
    }
  }, [nodeIndex, localNodes, playgroundBlocked, blockingClueId]);
  const goPrev = useCallback(() => {
    if (nodeIndex > 0) {
      lastNavDirRef.current = 'back';
      setNodeId(localNodes[nodeIndex - 1].id);
    }
  }, [nodeIndex, localNodes]);

  const clearMemoryProgressTimer = useCallback(() => {
    if (!memoryProgressTimerRef.current) return;
    window.clearInterval(memoryProgressTimerRef.current);
    memoryProgressTimerRef.current = null;
  }, []);

  const stopMemoryAudio = useCallback(() => {
    clearMemoryProgressTimer();
    memoryHowlRef.current?.stop();
    memoryHowlRef.current?.unload();
    memoryHowlRef.current = null;
    setMemoryPlaying(false);
  }, [clearMemoryProgressTimer]);

  const startMemoryClue = useCallback((clue: Clue) => {
    // Use the anchor-level audioSec override if present (clue MP3 may start at a different
    // position in the oral history than the node's background audioSec).
    const anchor = rawNode?.clueAnchors?.find(a => a.clueId === clue.id);
    activeClueAudioSecRef.current = anchor?.audioSec ?? currentAudioSecRef.current;
    onCollect(clue.id);
    setActiveClue(clue);
    setMemoryProgress(0);
    setMemoryDuration(0);
    stopMemoryAudio();

    if (!clue.audioSrc) return;

    try {
      if (Howler.ctx?.state === 'suspended') {
        void Howler.ctx.resume();
      }
    } catch {
      // If the browser does not expose an audio context, Howler can still try playback.
    }

    const sound = new Howl({
      src: [clue.audioSrc],
      volume: 1,
      onload: () => setMemoryDuration(sound.duration()),
      onplay: () => {
        setMemoryPlaying(true);
        setMemoryDuration(sound.duration());
        clearMemoryProgressTimer();
        memoryProgressTimerRef.current = window.setInterval(() => {
          const seek = sound.seek();
          setMemoryProgress(typeof seek === 'number' ? seek : 0);
        }, 250);
      },
      onpause: () => setMemoryPlaying(false),
      onstop: () => setMemoryPlaying(false),
      onend: () => {
        setMemoryPlaying(false);
        setMemoryProgress(sound.duration());
        clearMemoryProgressTimer();
      },
      onplayerror: () => {
        setMemoryPlaying(false);
        clearMemoryProgressTimer();
      },
    });

    memoryHowlRef.current = sound;
    sound.play();
  }, [clearMemoryProgressTimer, onCollect, stopMemoryAudio, rawNode]);

  const toggleMemoryAudio = useCallback(() => {
    const sound = memoryHowlRef.current;
    if (!sound || !activeClue?.audioSrc) return;
    if (sound.playing()) {
      sound.pause();
    } else {
      sound.play();
    }
  }, [activeClue]);

  const closeMemoryDock = useCallback(() => {
    stopMemoryAudio();
    setActiveClue(null);
    setMemoryProgress(0);
    setMemoryDuration(0);
  }, [stopMemoryAudio]);

  useEffect(() => {
    return () => stopMemoryAudio();
  }, [stopMemoryAudio]);

  useEffect(() => {
    const stopForVideo = () => {
      closeMemoryDock();
      AudioSynth.stopAmbient();
    };
    window.addEventListener('kyuc:stop-memory-audio', stopForVideo);
    return () => window.removeEventListener('kyuc:stop-memory-audio', stopForVideo);
  }, [closeMemoryDock]);

  // Reset temporary overlays when moving to a different point.
  useEffect(() => {
    setShowHistoric(false);
    setDragHintVisible(true);
  }, [nodeId]);

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

  // Reset drive timer when state changes to avoid time-jumps on resume
  useEffect(() => {
    driveLastRef.current = Date.now();
  }, [drivePlaying, blockingClueId, memoryPlaying]);

  // Ambient sound management: follow the active clue first, then scan ambience.
  useEffect(() => {
    if (!ambientEnabled) {
      AudioSynth.stopAmbient();
      return;
    }
    const inScan = activeScan !== null;

    if (memoryPlaying && activeClue?.ambient) {
      AudioSynth.startAmbient(activeClue.ambient);
      return;
    }

    if (!inScan) {
      AudioSynth.stopAmbient();
      return;
    }

    if (spaceId === 'quan-net') {
      AudioSynth.startAmbient('keyboard');
    } else if (spaceId === 'ho-thanh-cong') {
      AudioSynth.startAmbient('aerobic');
    } else if (spaceId === 'quan-oc-violin' && nodeIndex >= 4) {
      AudioSynth.startAmbient('violin');
    } else {
      AudioSynth.stopAmbient();
    }
    AudioSynth.duckAmbient(false);
  }, [spaceId, nodeIndex, memoryPlaying, activeClue?.id, activeClue?.ambient, ambientEnabled, activeScan]);

  // Stop ambient when unmounting
  useEffect(() => {
    return () => { AudioSynth.stopAmbient(); };
  }, []);

  // Drive mode: tick forward, auto-advance when timer expires
  useEffect(() => {
    if (!driveMode) return;
    const id = setInterval(() => {
      if (!drivePlaying || blockingClueId || memoryPlaying) {
        driveLastRef.current = Date.now();
        return;
      }
      const now = Date.now();
      driveElapsedRef.current += now - driveLastRef.current;
      driveLastRef.current = now;
      const pct = Math.min(100, (driveElapsedRef.current / driveIntervalMs) * 100);
      setDriveProgress(pct);
      if (driveElapsedRef.current >= driveIntervalMs) {
        driveElapsedRef.current = 0;
        setDriveProgress(0);
        setNodeId(cur => {
          const idx = localNodes.findIndex(n => n.id === cur);
          if (idx < localNodes.length - 1) {
            lastNavDirRef.current = 'fwd';
            return localNodes[idx + 1].id;
          }
          return cur;
        });
      }
    }, 80);
    return () => clearInterval(id);
  }, [driveMode, drivePlaying, blockingClueId, memoryPlaying, driveIntervalMs, localNodes]);

  // Notify parent component of the current node index change
  useEffect(() => {
    if (onNodeIndexChange && nodeIndex >= 0) {
      onNodeIndexChange(nodeIndex);
    }
  }, [nodeIndex, onNodeIndexChange]);

  // Preload neighboring textures; track whether next node is ready for navigation
  useEffect(() => {
    // Always preload prev and 2 ahead speculatively
    if (nodeIndex > 0) {
      const img = new Image();
      img.src = localNodes[nodeIndex - 1]?.panorama ?? '';
    }
    const n2 = localNodes[nodeIndex + 2]?.panorama;
    if (n2) { const img2 = new Image(); img2.src = n2; }
    const nextUrl = localNodes[nodeIndex + 1]?.panorama;
    if (!nextUrl) {
      setNextNodeLoaded(true);
      return;
    }
    const img = new Image();
    img.src = nextUrl;
    if (img.complete && img.naturalWidth > 0) {
      setNextNodeLoaded(true);
      return;
    }
    setNextNodeLoaded(false);
    const onLoad = () => setNextNodeLoaded(true);
    const onError = () => setNextNodeLoaded(true);
    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
    return () => {
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };
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
    
    const curIdx = localNodes.findIndex(n => n.id === nodeId);
    const targetIdx = localNodes.findIndex(n => n.id === id);
    if (targetIdx > curIdx) {
      lastNavDirRef.current = 'fwd';
    } else if (targetIdx < curIdx) {
      lastNavDirRef.current = 'back';
    }
    setNodeId(id);
  }, [nodeId, localNodes, goPrev, goNext]);

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
  const currentScanAnchor = node.scanAnchors?.[0];
  const foundCount = allClues.filter((clue) => collectedIds.includes(clue.id)).length;

  return (
    <div className="absolute inset-0">
      {/* R3F Canvas — fills the scene panel */}
      <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
        <Scene
          node={node}
          collectedIds={collectedIds}
          allClues={allClues}
          onPreview={startMemoryClue}
          onNavigate={handleNavigate}
          onScan={setActiveScan}
          calibrate={CALIB_MODE}
          yawElRef={yawElRef}
          localNodes={localNodes}
          clueVisible={clueVisible}
          showNavigation={!backgroundMode}
          suppressForwardNavigation={!!blockingClueId}
          playgroundBlocked={playgroundBlocked}
          onInteract={() => { nodeInteracted.current = true; }}
          lastNavDirRef={lastNavDirRef}
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

      {!backgroundMode && !CALIB_MODE && allClues.length > 0 && (
        <div data-tutorial="fragments" className="absolute left-4 top-24 z-30 pointer-events-none">
          <div className="rounded-2xl border border-black/10 bg-[#FCFAF2]/90 px-4 py-3 shadow-lg backdrop-blur-md">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muctim-faded">
              Memory fragments
            </p>
            <p className="mt-0.5 font-serif text-sm font-bold text-muctim">
              {foundCount} / {allClues.length} found
            </p>
            {blockingClueId && (
              <p className="mt-2.5 max-w-[230px] font-serif text-[11px] leading-relaxed text-[#c25e42] flex items-center gap-1.5 border-t border-dashed border-[#c25e42]/20 pt-2 font-medium">
                <span className="animate-pulse">📍</span> The route is paused here. Click the Polaroid in front of you to save this memory.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Prev / Next buttons */}
      {SHOW_EDGE_NAV && !backgroundMode && nodeIndex > 0 && (
        <button onClick={goPrev}
          aria-label="Quay lại"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-40 bg-black/60 hover:bg-black/80 text-white rounded-xl px-3 py-4 font-mono text-lg transition-all">
          ◀
        </button>
      )}
      {SHOW_EDGE_NAV && !backgroundMode && nodeIndex < localNodes.length - 1 && !playgroundBlocked && !blockingClueId && (
        <button
          onClick={nextNodeLoaded ? goNext : undefined}
          aria-label="Tiếp tục"
          disabled={!nextNodeLoaded}
          className={`absolute right-3 top-1/2 -translate-y-1/2 z-40 rounded-xl px-3 py-4 font-mono text-lg transition-all ${nextNodeLoaded ? 'bg-black/60 hover:bg-black/80 text-white cursor-pointer' : 'bg-black/30 text-white/30 cursor-wait'}`}
        >
          {nextNodeLoaded ? '▶' : '⟳'}
        </button>
      )}
      {!backgroundMode && playgroundBlocked && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-40 pointer-events-none">
          <div className="bg-black/85 backdrop-blur-md text-amber-50/90 rounded-2xl px-5 py-4 border border-amber-400/25 text-center flex flex-col items-center gap-2 shadow-2xl" style={{ minWidth: 148 }}>
            <div className="w-5 h-5 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
            <span className="font-serif text-[12px] font-bold tracking-wider uppercase mt-0.5 text-amber-100">Stay a moment</span>
            <span className="font-serif text-[10px] italic text-amber-200/55 leading-snug" style={{ maxWidth: 120 }}>You never got to linger here before</span>
            <span className="font-mono text-[11px] font-medium text-amber-400/80">{Math.max(0, 15 - dwellSecs)}s</span>
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
      {!backgroundMode && !CALIB_MODE && localNodes.some(n => n.lat != null) && (
        <DriveMinimap nodes={localNodes} currentIndex={nodeIndex} />
      )}

      {/* Drive mode — progress bar + play/pause + walking badge */}
      {!backgroundMode && driveMode && !CALIB_MODE && (
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
            {drivePlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {drivePlaying ? 'pause route' : 'resume route'}
          </button>

          {/* "Đang đi" badge — top centre label */}
          <div className="absolute top-[52px] left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl font-mono text-[10px] text-center"
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <span className="uppercase tracking-widest text-white/80">
                {blockingClueId ? 'Memory stop' : drivePlaying ? 'Moving route' : 'Route paused'}
              </span>
              <span className="text-white/55">
                Point {nodeIndex + 1} / {localNodes.length}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Drag hint — auto-fades after 4s */}
      {!backgroundMode && dragHintVisible && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-700">
          <p className="font-handwritten text-white/70 text-xs text-center drop-shadow">
            Drag to look around
          </p>
        </div>
      )}

      {/* Node progress indicator (only if multi-node) */}
      {!backgroundMode && !driveMode && localNodes.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-auto">
          <div className="bg-black/55 backdrop-blur-sm px-3 py-1 rounded-full text-white text-[11px] font-serif tracking-wide select-none border border-white/10 shadow-lg">
            Point {nodeIndex + 1} / {localNodes.length}
          </div>
          <div className="flex gap-1.5 justify-center">
            {localNodes.map((n, i) => (
              <button
                key={n.id}
                onClick={() => setNodeId(n.id)}
                className={`h-6 min-w-6 rounded-full px-2 font-mono text-[10px] font-bold transition-all duration-300 ${
                  n.id === nodeId ? 'bg-amber-400 text-black shadow-lg' : 'bg-black/55 text-white/75 hover:bg-black/75 hover:text-white'
                }`}
                title={`Go to point ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ambient sound toggle — only shown in spaces with ambient */}
      {!backgroundMode && !CALIB_MODE && ['quan-net', 'ho-thanh-cong', 'quan-oc-violin', 'cong-truong'].includes(spaceId ?? '') && (
        <button
          onClick={() => setAmbientEnabled(v => !v)}
          className="absolute bottom-12 left-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[11px] transition-all select-none"
          style={{
            background: 'rgba(0,0,0,0.55)',
            border: `1px solid ${ambientEnabled ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.15)'}`,
            color: ambientEnabled ? 'rgba(251,191,36,0.9)' : 'rgba(255,255,255,0.45)',
            backdropFilter: 'blur(6px)',
          }}
        >
          {ambientEnabled ? '♪ Sound on' : '♪ Sound off'}
        </button>
      )}

      {/* Historic Street View toggle button */}
      {!backgroundMode && fallbackHistoricUrl && !CALIB_MODE && !showHistoric && (
        <button
          onClick={() => setShowHistoric(true)}
          className="absolute top-4 right-4 z-[65] flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs transition-all"
          style={{
            background: 'rgba(0,0,0,0.45)',
            color: 'rgba(255,255,255,0.75)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <Camera className="w-3 h-3" /> Past Comparison
        </button>
      )}

      {/* Historic Street View — split panel (de-la-thanh style): panorama left, Street View right */}
      {showHistoric && fallbackHistoricUrl && (
        <>
          {/* Right half: historic Street View */}
          <div className="absolute inset-y-0 right-0 w-1/2 z-[60] flex flex-col">
            <iframe
              src={fallbackHistoricUrl}
              className="flex-1 w-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Past Google Street View"
            />
          </div>
          {/* Center divider */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-px w-px bg-white/40 z-[61] pointer-events-none" />
          {/* Year labels */}
          <div className="absolute top-12 left-4 z-[62] bg-black/70 text-white font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg pointer-events-none">
            2026 · Now
          </div>
          <div className="absolute top-12 left-1/2 translate-x-4 z-[62] bg-black/70 text-white font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg pointer-events-none">
            Past · Google Street View
          </div>
          {/* Close button — sits above everything in the overlay */}
          <button
            onClick={() => setShowHistoric(false)}
            className="absolute top-4 right-4 z-[65] flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs transition-all"
            style={{
              background: 'rgba(200,170,120,0.9)',
              color: '#1a1006',
              border: '1px solid rgba(200,170,120,0.4)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <Camera className="w-3 h-3" /> Close
          </button>
        </>
      )}

      {/* 3D Scan overlay */}
      {activeScan && (
        <div className="absolute inset-0 z-[70] bg-black flex flex-col">
          <div className="flex-1 relative">
            <ScanViewer url={activeScan} />
            {/* Clue hotspots available inside the 3D scan.
                Collects: clues already on this node + any clue explicitly linked via scanAnchor.clueId */}
            {(() => {
              const nodeClueIds = new Set((rawNode?.clueAnchors ?? []).map(a => a.clueId));
              if (currentScanAnchor?.clueId) nodeClueIds.add(currentScanAnchor.clueId);
              const scanClues = Array.from(nodeClueIds).map(id => allClues.find(c => c.id === id)).filter(Boolean) as typeof allClues;
              if (!scanClues.length) return null;
              return (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4 pointer-events-none">
                  {scanClues.map(clue => {
                    const collected = collectedIds.includes(clue.id);
                    return (
                      <button
                        key={clue.id}
                        onClick={() => startMemoryClue(clue)}
                        className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-serif transition-all active:scale-95"
                        style={collected
                          ? { background: 'rgba(52,211,153,0.12)', borderColor: 'rgba(52,211,153,0.3)', color: 'rgba(167,243,208,0.8)' }
                          : { background: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.4)', color: 'rgba(253,230,138,0.95)' }
                        }
                      >
                        {collected ? <Check className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        {clue.label}
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>
          {/* Close bar sits outside the Canvas so clicks always land */}
          <div className="flex-none flex items-center justify-between px-4 py-3 bg-black/80">
            <p className="text-white/40 font-mono text-xs">
              W / A / S / D to move · drag to look
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

      {activeClue && (() => {
        const t = activeClueAudioSecRef.current + memoryProgress;
        const cueText = memoryPlaying ? (srtCues.find(c => t >= c.start && t <= c.end)?.text ?? '') : '';
        const activeClueScanAnchor = localNodes
          .flatMap((candidate) => candidate.scanAnchors ?? [])
          .find((anchor) => anchor.clueId === activeClue.id);
        // Subtitle sits above the audio dock so it does not cover route controls.
        const subBottom = activeScan ? 'bottom-[228px]' : 'bottom-[228px]';
        return (
          <>
            {cueText && (
              <div className={`absolute ${subBottom} left-0 right-0 z-[91] flex justify-center px-6 pointer-events-none`}>
                <div className="bg-black/80 backdrop-blur-md px-4 py-2.5 rounded-xl text-white font-serif text-sm leading-relaxed text-center max-w-lg border border-white/10 shadow-xl">
                  {cueText}
                </div>
              </div>
            )}
            <MemoryAudioDock
              clue={activeClue}
              playing={memoryPlaying}
              progress={memoryProgress}
              duration={memoryDuration}
              saved={collectedIds.includes(activeClue.id)}
              scanLabel={activeClueScanAnchor?.label}
              onToggle={toggleMemoryAudio}
              onClose={closeMemoryDock}
              onOpenScan={activeClueScanAnchor ? () => setActiveScan(activeClueScanAnchor.scanUrl) : undefined}
              onOpenHistoric={fallbackHistoricUrl ? () => setShowHistoric(true) : undefined}
            />
          </>
        );
      })()}

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

    </div>
  );
}
