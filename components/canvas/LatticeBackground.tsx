'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField() {
  const ref = useRef<THREE.Points>(null!);
  
  // Generate 2000 random points in a sphere
  const positions = useMemo(() => {
    const count = 2000;
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 10 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      array[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      array[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      array[i * 3 + 2] = r * Math.cos(phi);
    }
    return array;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      // Slow orbit rotation
      ref.current.rotation.x -= delta / 20;
      ref.current.rotation.y -= delta / 25;
      
      // Subtle "Breathing" scale effect
      const t = state.clock.getElapsedTime();
      ref.current.scale.setScalar(1 + Math.sin(t / 2) * 0.05);
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#3B82F6"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  );
}

export default function LatticeBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-background">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        {/* Deep Void Fog */}
        <fog attach="fog" args={['#0A0A0B', 3, 10]} /> 
        <ParticleField />
      </Canvas>
    </div>
  );
}