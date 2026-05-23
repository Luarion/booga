'use client';
import { Environment, useGLTF } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Timer } from 'three';

const Model = () => {
  const { scene } = useGLTF('/models/mercedes190e_1k.glb');
  return <primitive object={scene} scale={1} />;
};

const animation: 'ROTATE' | 'DRIVER' = 'ROTATE';

function CameraRig({ radius = 5 }) {
  const timer = useRef(new Timer());
  useFrame((state) => {
    switch (animation) {
      case 'ROTATE': {
        timer.current.update();

        const speed: number = 0.01;
        const time: number = timer.current.getElapsed();
        const angle: number = time * speed;

        const x: number = Math.sin(angle) * radius;
        const z: number = Math.cos(angle) * radius;

        state.camera.position.set(x, 1.33, z);

        state.camera.lookAt(0, 1, 0);
        break;
      }

      case 'DRIVER': {
        state.camera.position.set(0.2, 1.1, 0);
        state.camera.lookAt(0, 0, 4.5);
        break;
      }

      default:
        break;
    }
  });
  return null;
}

export default function BackgroundCanvas() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isSignRoute = pathname.startsWith('/sign');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        // IMPORTANTE: Para detectar el ratón, pointerEvents NO debe ser "none"
        // Si necesita interactuar con elementos superiores, use una capa invisible
        pointerEvents: 'auto',
        filter: isSignRoute ? 'blur(8px) brightness(0.7)' : 'none',
        transition: 'filter 0.5s ease-out',
      }}
    >
      <Canvas camera={{ position: [0, 0, 0], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <CameraRig radius={4} />
        <Suspense fallback={null}>
          <Model />
          <Environment files={'/modern_evening_street_4k.exr'} background />
        </Suspense>
      </Canvas>
    </div>
  );
}
