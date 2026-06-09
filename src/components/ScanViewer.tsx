/**
 * ScanViewer — cinematic viewer for Polycam .glb scans
 * No user controls — camera drifts slowly through the space
 * Uses React Three Fiber + Drei (already in project deps)
 */

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

// Camera drifts in a slow ellipse around the scene — no user input
function CinematicCamera() {
  const t = useRef(0);
  useFrame((state, delta) => {
    t.current += delta * 0.06; // very slow
    const r = 6;
    const x = Math.sin(t.current) * r;
    const z = Math.cos(t.current) * r * 0.7;
    const y = 2.5 + Math.sin(t.current * 0.4) * 0.8; // gentle vertical drift
    state.camera.position.set(x, y, z);
    state.camera.lookAt(0, 1, 0);
  });
  return null;
}

interface ScanViewerProps {
  url?: string;
}

export function ScanViewer({ url = '/test-scan.glb' }: ScanViewerProps) {
  return (
    <div className="w-full h-full relative" style={{ background: '#0d0b08' }}>
      <Canvas
        camera={{ position: [0, 2.5, 6], fov: 55 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[4, 8, 4]} intensity={0.9} color="#fff8e8" />
          <Environment preset="apartment" />
          <Model url={url} />
          <CinematicCamera />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/test-scan.glb');
