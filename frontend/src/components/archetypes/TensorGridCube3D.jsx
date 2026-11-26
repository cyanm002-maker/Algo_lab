import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Grid3X3 } from 'lucide-react';

function TensorInstancedGrid({ cells, activeSlice, axisMode }) {
  const meshRef = useRef(null);
  const { invalidate } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorObj = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || !cells.length) return;
    cells.forEach((cell, i) => {
      dummy.position.set((cell.c - 1.5) * 0.85, (1.5 - cell.r) * 0.85, (cell.d - 1) * 0.95);
      const isActive =
        axisMode === 0
          ? cell.d === activeSlice
          : axisMode === 1
          ? cell.r === activeSlice % 4
          : cell.c === activeSlice % 4;
      dummy.scale.setScalar(isActive ? 1.05 : 0.72);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      colorObj.set(isActive ? '#2563EB' : '#CBD5E1');
      mesh.setColorAt(i, colorObj);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    invalidate();
  }, [cells, activeSlice, axisMode, dummy, colorObj, invalidate]);

  if (!cells.length) return null;
  return (
    <instancedMesh key={cells.length} ref={meshRef} args={[null, null, cells.length]}>
      <boxGeometry args={[0.62, 0.62, 0.62]} />
      <meshStandardMaterial roughness={0.35} />
    </instancedMesh>
  );
}

export default function TensorGridCube3D({ stepData }) {
  const viz = stepData?.viz || {};
  const cells = viz.cells || [];
  const activeSlice = viz.activeSlice ?? 0;
  const axisMode = viz.axisMode ?? 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-[#475569] flex items-center gap-1.5">
        <Grid3X3 className="w-3.5 h-3.5 text-[#2563EB]" />
        <span>3D Tensor Cube (InstancedMesh) · Cobalt voxels show active slice/axis</span>
      </div>
      <div className="w-full h-[390px] bg-[#F8FAFC] border border-slate-200 rounded-xl overflow-hidden">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [4.6, 3.6, 5.2], fov: 45 }}>
          <color attach="background" args={['#F8FAFC']} />
          <ambientLight intensity={0.95} />
          <directionalLight position={[6, 8, 6]} intensity={0.9} />
          <TensorInstancedGrid cells={cells} activeSlice={activeSlice} axisMode={axisMode} />
          <OrbitControls enableDamping dampingFactor={0.08} />
        </Canvas>
      </div>
    </div>
  );
}
