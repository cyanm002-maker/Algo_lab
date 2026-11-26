import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import { Box } from 'lucide-react';

function TerrainSurface() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(7.2, 7.2, 32, 32);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // J(w1, w2) = 0.5 * (w1^2 + 1.8 * w2^2) scaled down vertically for crisp 3D framing
      const z = 0.18 * (x * x + 1.8 * y * y);
      pos.setZ(i, z);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color="#4F46E5" wireframe transparent opacity={0.32} />
    </mesh>
  );
}

function AnimatedBall({ current, onHover }) {
  const ref = useRef(null);
  const yVal = 0.18 * (current.x * current.x + 1.8 * current.y * current.y) + 0.18;
  const target = useRef(new THREE.Vector3(current.x, yVal, -current.y));
  const { invalidate } = useThree();

  useEffect(() => {
    const nextY = 0.18 * (current.x * current.x + 1.8 * current.y * current.y) + 0.18;
    target.current.set(current.x, nextY, -current.y);
    invalidate();
  }, [current.x, current.y, invalidate]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const dist = ref.current.position.distanceTo(target.current);
    if (dist > 0.005) {
      ref.current.position.lerp(target.current, Math.min(1, delta * 9));
      invalidate();
    }
  });

  return (
    <mesh
      ref={ref}
      position={[current.x, yVal, -current.y]}
      onPointerOver={() => onHover(true)}
      onPointerOut={() => onHover(false)}
    >
      <sphereGeometry args={[0.2, 22, 22]} />
      <meshStandardMaterial color="#D97706" emissive="#D97706" emissiveIntensity={0.4} />
    </mesh>
  );
}

export default function LossOptimization3D({ stepData }) {
  const [hovered, setHovered] = useState(false);
  const viz = stepData?.viz || {};
  const path = viz.path || [{ x: 2.6, y: -2.2, z: 7.7 }];
  const current = viz.current || path[path.length - 1] || { x: 0, y: 0, z: 0 };

  const linePts = useMemo(
    () =>
      path.map((p) => [
        p.x,
        0.18 * (p.x * p.x + 1.8 * p.y * p.y) + 0.09,
        -p.y
      ]),
    [path]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-[#475569] flex items-center gap-1.5">
        <Box className="w-3.5 h-3.5 text-[#D97706]" />
        <span>3D Loss Bowl J(w₁, w₂) · Drag to orbit · Hover sphere for live gradient</span>
      </div>
      <div className="relative w-full h-[390px] bg-[#F8FAFC] border border-slate-200 rounded-xl overflow-hidden">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [5.6, 5.2, 5.8], fov: 45 }}>
          <color attach="background" args={['#F8FAFC']} />
          <ambientLight intensity={0.95} />
          <directionalLight position={[6, 10, 6]} intensity={0.9} />
          <axesHelper args={[3.2]} />
          <TerrainSurface />
          {linePts.length > 1 && <Line points={linePts} color="#0D9488" lineWidth={3} />}
          <AnimatedBall current={current} onHover={setHovered} />
          <OrbitControls enableDamping dampingFactor={0.08} />
        </Canvas>

        {hovered && (
          <div className="absolute top-3 right-3 bg-white/95 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono text-[#0F172A] shadow-lg pointer-events-none">
            <div className="font-bold text-[#D97706]">Parameter Sphere</div>
            <div>w₁ = {Number(current.x).toFixed(3)}, w₂ = {Number(current.y).toFixed(3)}</div>
            <div className="text-[#4F46E5]">J(w) = {Number(current.z).toFixed(3)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
