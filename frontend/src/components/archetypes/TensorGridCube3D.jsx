import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Grid3X3 } from 'lucide-react';

function AnimatedVoxel({ cell, onHover }) {
  const meshRef = useRef(null);
  const { invalidate } = useThree();

  const baseX = (cell.c - 1) * 0.92;
  const baseY = (1.5 - cell.r) * 0.92;
  const baseZ = (1 - cell.d) * 0.95;
  // Pull active sliced sub-cubes forward cleanly along Z!
  const targetZ = cell.active ? baseZ + 0.75 : baseZ - 0.15;
  const targetPos = useRef(new THREE.Vector3(baseX, baseY, targetZ));

  useEffect(() => {
    targetPos.current.set(baseX, baseY, targetZ);
    invalidate();
  }, [baseX, baseY, targetZ, invalidate]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const dist = meshRef.current.position.distanceTo(targetPos.current);
    if (dist > 0.005) {
      meshRef.current.position.lerp(targetPos.current, Math.min(1, delta * 9));
      invalidate();
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[baseX, baseY, baseZ]}
      scale={cell.active ? 1.0 : 0.76}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(cell);
      }}
      onPointerOut={() => onHover(null)}
    >
      <boxGeometry args={[0.64, 0.64, 0.64]} />
      <meshStandardMaterial
        color={cell.active ? '#2563EB' : '#CBD5E1'}
        emissive={cell.active ? '#2563EB' : '#000000'}
        emissiveIntensity={cell.active ? 0.18 : 0}
        transparent
        opacity={cell.active ? 0.96 : 0.45}
        roughness={0.3}
      />
    </mesh>
  );
}

const SLICE_BUTTONS = [
  { mode: 0, label: 'arr[0, :, :]' },
  { mode: 1, label: 'arr[:, 1:3, :]' },
  { mode: 2, label: 'arr + [10, 20, 30]' }
];

export default function TensorGridCube3D({ stepData, onHyperparamChange }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const viz = stepData?.viz || {};
  const cells = viz.cells || [];
  const activeMode = viz.sliceOp ?? 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[#475569] flex items-center gap-1.5">
          <Grid3X3 className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Shape (3, 4, 3) · Click a slice operation to pull out sub-cubes</span>
        </span>

        <div className="flex flex-wrap gap-1.5">
          {SLICE_BUTTONS.map((btn) => (
            <button
              key={btn.mode}
              type="button"
              onClick={() => onHyperparamChange && onHyperparamChange('sliceOp', btn.mode)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold border transition-all ${
                activeMode === btn.mode
                  ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                  : 'bg-[#EFF6FF] text-[#2563EB] border-blue-200 hover:bg-blue-100'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full h-[390px] bg-[#F8FAFC] border border-slate-200 rounded-xl overflow-hidden">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [4.8, 3.6, 5.4], fov: 45 }}>
          <color attach="background" args={['#F8FAFC']} />
          <ambientLight intensity={0.95} />
          <directionalLight position={[6, 8, 6]} intensity={0.9} />
          {cells.map((cell) => (
            <AnimatedVoxel
              key={`${cell.d}-${cell.r}-${cell.c}`}
              cell={cell}
              onHover={setHoveredCell}
            />
          ))}
          <OrbitControls enableDamping dampingFactor={0.08} />
        </Canvas>

        {hoveredCell && (
          <div className="absolute top-3 right-3 bg-white/95 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono text-[#0F172A] shadow-lg pointer-events-none">
            <div className="font-bold text-[#2563EB]">
              arr[{hoveredCell.d}, {hoveredCell.r}, {hoveredCell.c}]
            </div>
            <div>Base value: {hoveredCell.val}</div>
            <div className="text-[#0D9488] font-semibold">
              Output value: {hoveredCell.displayVal}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
