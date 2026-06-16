import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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

function FirstPersonControls() {
  const { camera, gl } = useThree();
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const pointerDown = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const keys = useRef(new Set<string>());

  useEffect(() => {
    const el = gl.domElement;

    const applyDelta = (dx: number, dy: number) => {
      euler.current.y -= dx * 0.004;
      euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x - dy * 0.004));
      camera.quaternion.setFromEuler(euler.current);
    };

    const onMouseDown = (e: MouseEvent) => {
      pointerDown.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!pointerDown.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      applyDelta(dx, dy);
    };
    const onMouseUp = () => { pointerDown.current = false; };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      pointerDown.current = true;
      lastPointer.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!pointerDown.current || e.touches.length !== 1) return;
      e.preventDefault();
      const dx = e.touches[0].clientX - lastPointer.current.x;
      const dy = e.touches[0].clientY - lastPointer.current.y;
      lastPointer.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      applyDelta(dx, dy);
    };
    const onTouchEnd = () => { pointerDown.current = false; };

    const onKeyDown = (e: KeyboardEvent) => keys.current.add(e.key.toLowerCase());
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [camera, gl.domElement]);

  useFrame((_, delta) => {
    const speed = 2 * delta;
    const dir = new THREE.Vector3();
    if (keys.current.has('w') || keys.current.has('arrowup')) dir.z -= 1;
    if (keys.current.has('s') || keys.current.has('arrowdown')) dir.z += 1;
    if (keys.current.has('a') || keys.current.has('arrowleft')) dir.x -= 1;
    if (keys.current.has('d') || keys.current.has('arrowright')) dir.x += 1;
    if (dir.length() > 0) {
      dir.normalize().applyQuaternion(camera.quaternion);
      camera.position.addScaledVector(dir, speed);
    }
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
        camera={{ position: [0, 0, 0], fov: 75 }}
        gl={{ antialias: true }}
        style={{ touchAction: 'none' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[4, 8, 4]} intensity={0.9} color="#fff8e8" />
          <Environment preset="apartment" />
          <Model url={url} />
          <FirstPersonControls />
        </Suspense>
      </Canvas>
      <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full">
          W / A / S / D to move · drag to look
        </p>
      </div>
    </div>
  );
}

