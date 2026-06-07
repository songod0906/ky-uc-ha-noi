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

import { Suspense, useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Howl } from 'howler';
import { X, ArrowUp } from 'lucide-react';
import type { TourNode, TourClueAnchor, TourNavAnchor, Clue } from '../types';

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
  const texture = useLoader(THREE.TextureLoader, url);
  texture.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh>
      <sphereGeometry args={[500, 64, 32]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

/** Visual glow orb at hotspot position. No interaction — just decoration. */
function GlowOrb({
  pos,
  collected,
}: {
  pos: [number, number, number];
  collected: boolean;
}) {
  return (
    <mesh position={pos}>
      <sphereGeometry args={[2.5, 16, 16]} />
      <meshBasicMaterial
        color={collected ? '#a8c89a' : '#f5c518'}
        transparent
        opacity={collected ? 0.5 : 0.9}
      />
    </mesh>
  );
}

/** Clue hotspot: glow orb (visual) + Html button (interaction). */
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
    <>
      <GlowOrb pos={pos} collected={collected} />
      <Html position={pos} center distanceFactor={90} zIndexRange={[10, 15]}>
        <button
          className={`px-2.5 py-1.5 rounded-xl text-xs font-serif shadow-lg transition-all whitespace-nowrap select-none ${
            collected
              ? 'bg-sage/80 text-white cursor-default'
              : 'bg-white/95 text-muctim hover:scale-105 cursor-pointer'
          }`}
          onClick={() => !collected && onPreview(clue)}
        >
          {CLUE_ICONS[clue.type]} {clue.label}
          {collected && ' ✓'}
        </button>
      </Html>
    </>
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
  return (
    <Html position={pos} center distanceFactor={90} zIndexRange={[10, 15]}>
      <button
        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono bg-black/60 text-white hover:bg-black/80 transition-all whitespace-nowrap select-none"
        onClick={() => onNavigate(anchor.toNodeId)}
      >
        <ArrowUp className="w-3 h-3" />
        {anchor.label ?? 'Đi tiếp'}
      </button>
    </Html>
  );
}

/** Everything that lives inside the Canvas (needs R3F context). */
function Scene({
  node,
  collectedIds,
  allClues,
  onPreview,
  onNavigate,
}: {
  node: TourNode;
  collectedIds: string[];
  allClues: Clue[];
  onPreview: (clue: Clue) => void;
  onNavigate: (id: string) => void;
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

      {/*
        OrbitControls for panorama:
        - Camera at (0, 0, 0.1), orbits around origin → effectively rotates in place
        - enableZoom/Pan false → pure rotation only
        - rotateSpeed negative → natural drag direction (drag right = look right)
        - makeDefault so Html elements get correct projection matrix
      */}
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

// ---------- Main export ----------

export function PanoramaViewer({
  nodes,
  startNodeId,
  collectedIds,
  onCollect,
  ambient,
  allClues,
}: {
  nodes: TourNode[];
  startNodeId?: string;
  collectedIds: string[];
  onCollect: (clueId: string) => void;
  ambient?: string;
  allClues: Clue[];
}) {
  const [nodeId, setNodeId] = useState(startNodeId ?? nodes[0]?.id);
  const [preview, setPreview] = useState<Clue | null>(null);

  const node = nodes.find((n) => n.id === nodeId) ?? nodes[0];

  // Ambient audio — fade in/out on mount/unmount
  useEffect(() => {
    if (!ambient) return;
    const snd = new Howl({ src: [ambient], loop: true, volume: 0, html5: true });
    snd.play();
    snd.fade(0, 0.4, 1000);
    return () => {
      snd.fade(0.4, 0, 800);
      setTimeout(() => { snd.stop(); snd.unload(); }, 900);
    };
  }, [ambient]);

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
          onNavigate={setNodeId}
        />
      </Canvas>

      {/* Drag hint — shown briefly */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <p className="font-handwritten text-white/70 text-xs text-center drop-shadow">
          Kéo để nhìn xung quanh · Nhấn vào điểm sáng để nghe ký ức
        </p>
      </div>

      {/* Node progress dots (only if multi-node) */}
      {nodes.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 pointer-events-none">
          {nodes.map((n) => (
            <div
              key={n.id}
              className={`rounded-full transition-all duration-300 ${
                n.id === nodeId ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white/40'
              }`}
            />
          ))}
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
