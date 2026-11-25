import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import { Box } from 'lucide-react';
import { CLUSTER_COLORS } from '../../engines/kMeansMath';

/**
 * High-FPS 3D InstancedMesh point cloud (single GPU draw call).
 * Updates matrices & colors via useRef; never calls useState in useFrame.
 */
function PointCloudInstanced({ points, colorResolver }) {
  const meshRef = useRef(null);
  const { invalidate } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorObj = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || points.length === 0) return;

    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      dummy.position.set(pt.x, pt.z ?? 0, pt.y);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      colorObj.set(colorResolver(pt, i));
      mesh.setColorAt(i, colorObj);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    invalidate();
  }, [points, colorResolver, dummy, colorObj, invalidate]);

  if (!points.length) return null;

  return (
    <instancedMesh key={points.length} ref={meshRef} args={[null, null, points.length]}>
      <sphereGeometry args={[0.13, 14, 14]} />
      <meshStandardMaterial roughness={0.35} metalness={0.1} />
    </instancedMesh>
  );
}

/**
 * Animated 3D Centroid using useRef inside useFrame (no setState).
 */
function AnimatedCentroid({ centroid }) {
  const groupRef = useRef(null);
  const targetVec = useRef(new THREE.Vector3(centroid.x, centroid.z ?? 0, centroid.y));
  const { invalidate } = useThree();

  useEffect(() => {
    targetVec.current.set(centroid.x, centroid.z ?? 0, centroid.y);
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
    <group ref={groupRef} position={[centroid.x, centroid.z ?? 0, centroid.y]}>
      <mesh>
        <octahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial color={centroid.color} emissive={centroid.color} emissiveIntensity={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.36, 0.025, 12, 32]} />
        <meshBasicMaterial color="#0F172A" transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

export default function Visualizer3D({ stepData }) {
  const viz = stepData?.viz || {};
  const kind = viz.kind || 'kmeans-3d';
  const points = viz.points || [];

  const colorResolver = useMemo(() => {
    if (kind === 'kmeans-3d') {
      return (_pt, idx) => CLUSTER_COLORS[(viz.assignments?.[idx] ?? 0) % CLUSTER_COLORS.length];
    }
    if (kind === 'svm-rbf-3d') {
      return (pt) => (pt.label === 1 ? '#0D9488' : '#4F46E5');
    }
    if (kind === 'knn-3d') {
      return (pt) => (pt.label === 1 ? '#0D9488' : '#4F46E5');
    }
    return () => '#4F46E5';
  }, [kind, viz.assignments]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[#475569] flex items-center gap-1.5">
          <Box className="w-3.5 h-3.5 text-[#D97706]" />
          Drag to orbit · Scroll to zoom (InstancedMesh + on-demand GPU render)
        </span>

        {kind === 'kmeans-3d' && viz.centroids && (
          <div className="flex flex-wrap gap-1.5">
            {viz.centroids.map((c) => (
              <span
                key={c.clusterId}
                className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border"
                style={{
                  borderColor: `${c.color}44`,
                  backgroundColor: `${c.color}12`,
                  color: c.color
                }}
              >
                C{c.clusterId + 1}: {c.count}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="w-full h-[390px] bg-[#F8FAFC] border border-slate-200 rounded-xl overflow-hidden">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [6.5, 5.0, 6.5], fov: 45 }}>
          <color attach="background" args={['#F8FAFC']} />
          <ambientLight intensity={0.95} />
          <directionalLight position={[8, 12, 6]} intensity={0.95} />

          <gridHelper args={[10, 10, '#CBD5E1', '#E2E8F0']} position={[0, -2.5, 0]} />
          <axesHelper args={[3.2]} />

          <PointCloudInstanced points={points} colorResolver={colorResolver} />

          {/* K-Means Animated Centroids */}
          {kind === 'kmeans-3d' &&
            (viz.centroids || []).map((c) => <AnimatedCentroid key={c.clusterId} centroid={c} />)}

          {/* SVM RBF 3D Separating Hyperplane */}
          {kind === 'svm-rbf-3d' && viz.liftAlpha > 0.1 && (
            <mesh position={[0, viz.zPlane, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[5.5, 5.5]} />
              <meshStandardMaterial color="#4F46E5" transparent opacity={0.22} side={THREE.DoubleSide} />
            </mesh>
          )}

          {/* KNN 3D Query Sphere */}
          {kind === 'knn-3d' && viz.query && (
            <group position={[viz.query.x - 4, viz.query.z ?? 0, viz.query.y - 4]}>
              <mesh>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color="#D97706" />
              </mesh>
              <mesh>
                <sphereGeometry args={[Math.max(0.5, viz.radius * 0.4), 24, 24]} />
                <meshBasicMaterial color="#4F46E5" wireframe transparent opacity={0.25} />
              </mesh>
            </group>
          )}

          {/* PCA Principal Component Axes */}
          {kind === 'pca-3d' && viz.pc1 && viz.pc2 && (
            <>
              <Line
                points={[
                  [-viz.pc1[0] * 3.5, -viz.pc1[2] * 3.5, -viz.pc1[1] * 3.5],
                  [viz.pc1[0] * 3.5, viz.pc1[2] * 3.5, viz.pc1[1] * 3.5]
                ]}
                color="#4F46E5"
                lineWidth={3}
              />
              <Line
                points={[
                  [-viz.pc2[0] * 2.5, -viz.pc2[2] * 2.5, -viz.pc2[1] * 2.5],
                  [viz.pc2[0] * 2.5, viz.pc2[2] * 2.5, viz.pc2[1] * 2.5]
                ]}
                color="#0D9488"
                lineWidth={2.5}
              />
            </>
          )}

          <OrbitControls enableDamping dampingFactor={0.08} />
        </Canvas>
      </div>
    </div>
  );
}
