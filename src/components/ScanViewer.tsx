import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment, Center, OrbitControls } from '@react-three/drei';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
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
        style={{ touchAction: 'none' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[4, 8, 4]} intensity={0.9} color="#fff8e8" />
          <Environment preset="apartment" />
          <Model url={url} />
          <OrbitControls
            makeDefault
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={0.5}
            maxDistance={20}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/test-scan.glb');
