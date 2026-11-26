import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import { Box } from 'lucide-react';

function TerrainSurface() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(7, 7, 28, 28);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = 0.22 * (x * x + y * y) + 0.35 * Math.sin(x * 1.4) * Math.cos(y * 1.4);
      pos.setZ(i, z);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color="#4F46E5" wireframe transparent opacity={0.35} />
    </mesh>
  );
}

function AnimatedBall({ current }) {
  const ref = useRef(null);
  const target = useRef(new THREE.Vector3(current.x, current.z + 0.16, -current.y));
  const { invalidate } = useThree();

  useEffect(() => {
    target.current.set(current.x, current.z + 0.16, -current.y);
    invalidate();
  }, [current.x, current.y, current.z, invalidate]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const dist = ref.current.position.distanceTo(target.current);
    if (dist > 0.005) {
      ref.current.position.lerp(target.current, Math.min(1, delta * 12));
      invalidate();
    }
  });

  return (
    <mesh ref={ref} position={[current.x, current.z + 0.16, -current.y]}>
      <sphereGeometry args={[0.18, 20, 20]} />
      <meshStandardMaterial color="#D97706" emissive="#D97706" emissiveIntensity={0.35} />
    </mesh>
  );
}

export default function LossOptimization3D({ stepData }) {
  const viz = stepData?.viz || {};
  const path = viz.path || [{ x: 0, y: 0, z: 0 }];
  const current = viz.current || path[path.length - 1] || { x: 0, y: 0, z: 0 };

  const linePts = useMemo(
    () => path.map((p) => [p.x, p.z + 0.08, -p.y]),
    [path]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-[#475569] flex items-center gap-1.5">
        <Box className="w-3.5 h-3.5 text-[#D97706]" />
        <span>3D Loss Landscape · Drag to orbit optimization trajectory</span>
      </div>
      <div className="w-full h-[390px] bg-[#F8FAFC] border border-slate-200 rounded-xl overflow-hidden">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [5.5, 4.8, 5.5], fov: 45 }}>
          <color attach="background" args={['#F8FAFC']} />
          <ambientLight intensity={0.95} />
          <directionalLight position={[6, 10, 6]} intensity={0.9} />
          <TerrainSurface />
          {linePts.length > 1 && <Line points={linePts} color="#0D9488" lineWidth={3} />}
          <AnimatedBall current={current} />
          <OrbitControls enableDamping dampingFactor={0.08} />
        </Canvas>
      </div>
    </div>
  );
}
