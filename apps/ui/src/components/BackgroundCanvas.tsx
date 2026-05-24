'use client';

import { Environment, useGLTF } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { usePathname } from 'next/navigation';
import { Suspense, memo, useEffect, useRef, useState } from 'react';
import { Timer } from 'three';

function Model() {
  const { scene } = useGLTF('/models/mercedes190e_1k.glb');
  return <primitive object={scene} scale={1} />;
}

const CAMERA_SPEED = 0.01;

function CameraRig({ radius = 5 }) {
  const timer = useRef(new Timer());

  useFrame((state) => {
    timer.current.update();

    const time = timer.current.getElapsed();
    const angle = time * CAMERA_SPEED;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;

    state.camera.position.set(x, 1.33, z);
    state.camera.lookAt(0, 1, 0);
  });

  return null;
}

const Scene = memo(function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 0], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <CameraRig radius={4} />
      <Suspense fallback={null}>
        <Model />
        <Environment files={'/modern_evening_street_4k.exr'} background />
      </Suspense>
    </Canvas>
  );
});

export default function BackgroundCanvas() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isBlurredRoute =
    pathname.startsWith('/sign') || pathname.startsWith('/setup');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 -z-1 pointer-events-auto"
      style={{
        filter: isBlurredRoute ? 'blur(8px) brightness(0.7)' : 'none',
        transition: 'filter 0.5s ease-out',
      }}
    >
      <Scene />
    </div>
  );
}
