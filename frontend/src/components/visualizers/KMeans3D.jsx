import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box } from 'lucide-react';
import { CLUSTER_COLORS } from '../../engines/kMeansMath';

/**
 * High-FPS 3D point cloud using Three.js InstancedMesh (single GPU draw call).
 * Updates instance transforms and colors via useRef without React state in useFrame.
 */
function PointCloudInstanced({ points, assignments }) {
  const meshRef = useRef(null);
  const { invalidate } = useThree();

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorObj = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || points.length === 0) return;

    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      dummy.position.set(pt.x, pt.y, pt.z);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      const clusterIdx = assignments[i] ?? 0;
      const hex = CLUSTER_COLORS[clusterIdx % CLUSTER_COLORS.length];
      colorObj.set(hex);
      mesh.setColorAt(i, colorObj);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
    invalidate();
  }, [points, assignments, dummy, colorObj, invalidate]);

  if (points.length === 0) return null;

  return (
    <instancedMesh
      key={points.length}
      ref={meshRef}
      args={[null, null, points.length]}
    >
      <sphereGeometry args={[0.11, 14, 14]} />
      <meshStandardMaterial roughness={0.35} metalness={0.15} />
    </instancedMesh>
  );
}

/**
 * Animated 3D Centroid marker.
 * Mutates position directly via useRef in useFrame (never triggers useState)
 * and calls invalidate() only while still moving toward its target.
 */
function AnimatedCentroid({ centroid }) {
  const groupRef = useRef(null);
  const targetVec = useRef(new THREE.Vector3(centroid.x, centroid.y, centroid.z));
  const { invalidate } = useThree();

  useEffect(() => {
    targetVec.current.set(centroid.x, centroid.y, centroid.z);
    invalidate();
  }, [centroid.x, centroid.y, centroid.z, invalidate]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const dist = group.position.distanceTo(targetVec.current);
    if (dist > 0.005) {
      group.position.lerp(targetVec.current, Math.min(1, delta * 10));
      invalidate();
    } else if (dist > 0) {
      group.position.copy(targetVec.current);
    }
  });

  return (
    <group ref={groupRef} position={[centroid.x, centroid.y, centroid.z]}>
      <mesh>
        <octahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial
          color={centroid.color}
          emissive={centroid.color}
          emissiveIntensity={0.65}
          roughness={0.2}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.36, 0.025, 12, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

export default function KMeans3D({ stepData }) {
  const points = stepData?.points || [];
  const assignments = stepData?.assignments || [];
  const centroids = stepData?.centroids || [];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Box className="w-4 h-4 text-sky-400" />
          <span>Drag to orbit, scroll to zoom (InstancedMesh + on-demand GPU render)</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {centroids.map((c) => (
            <span
              key={c.clusterId}
              className="px-2 py-0.5 rounded text-[11px] font-mono border"
              style={{
                borderColor: `${c.color}55`,
                backgroundColor: `${c.color}18`,
                color: c.color
              }}
            >
              C{c.clusterId + 1}: {c.count} pts
            </span>
          ))}
        </div>
      </div>

      <div className="w-full h-[400px] bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
        <Canvas
          frameloop="demand"
          dpr={[1, 2]}
          camera={{ position: [6.8, 5.2, 6.8], fov: 45 }}
        >
          <color attach="background" args={['#020617']} />
          <ambientLight intensity={0.75} />
          <directionalLight position={[8, 10, 6]} intensity={1.15} />
          <pointLight position={[-6, -4, -6]} intensity={0.45} color="#38bdf8" />

          <gridHelper args={[10, 10, '#1e293b', '#0f172a']} position={[0, -3.2, 0]} />
          <axesHelper args={[3.5]} />

          <PointCloudInstanced points={points} assignments={assignments} />

          {centroids.map((centroid) => (
            <AnimatedCentroid key={centroid.clusterId} centroid={centroid} />
          ))}

          <OrbitControls enableDamping dampingFactor={0.08} />
        </Canvas>
      </div>
    </div>
  );
}
