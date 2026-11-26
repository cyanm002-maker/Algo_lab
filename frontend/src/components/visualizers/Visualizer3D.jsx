import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import { Box } from 'lucide-react';
import { CLUSTER_COLORS } from '../../engines/kMeansMath';

function PointCloudInstanced({ points, colorResolver, onHoverPoint }) {
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
    <instancedMesh
      key={points.length}
      ref={meshRef}
      args={[null, null, points.length]}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (onHoverPoint && e.instanceId !== undefined) {
          onHoverPoint(e.instanceId);
        }
      }}
      onPointerOut={() => onHoverPoint && onHoverPoint(null)}
    >
      <sphereGeometry args={[0.14, 16, 16]} />
      <meshStandardMaterial roughness={0.32} metalness={0.1} />
    </instancedMesh>
  );
}

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
      group.position.lerp(targetVec.current, Math.min(1, delta * 6));
      invalidate();
    } else if (dist > 0) {
      group.position.copy(targetVec.current);
    }
  });

  return (
    <group ref={groupRef} position={[centroid.x, centroid.z ?? 0, centroid.y]}>
      <mesh>
        <octahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color={centroid.color} emissive={centroid.color} emissiveIntensity={0.45} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.028, 12, 32]} />
        <meshBasicMaterial color="#0F172A" transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

export default function Visualizer3D({ stepData }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const viz = stepData?.viz || {};
  const kind = viz.kind || 'kmeans-3d';
  const points = viz.points || [];

  const colorResolver = useMemo(() => {
    if (kind === 'kmeans-3d') {
      return (_pt, idx) => CLUSTER_COLORS[(viz.assignments?.[idx] ?? 0) % CLUSTER_COLORS.length];
    }
    if (kind === 'svm-rbf-3d' || kind === 'knn-3d') {
      return (pt) => (pt.label === 1 ? '#0D9488' : '#4F46E5');
    }
    return () => '#4F46E5';
  }, [kind, viz.assignments]);

  const hoveredPoint = hoveredIdx !== null ? points[hoveredIdx] : null;
  const hoveredCluster = hoveredIdx !== null ? viz.assignments?.[hoveredIdx] : null;
  const hoveredDist = hoveredIdx !== null ? viz.pointDistances?.[hoveredIdx] : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[#475569] flex items-center gap-1.5">
          <Box className="w-3.5 h-3.5 text-[#D97706]" />
          Orbit, zoom &amp; hover any 3D point for live coordinates and distance math
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

      <div className="relative w-full h-[390px] bg-[#F8FAFC] border border-slate-200 rounded-xl overflow-hidden">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [6.5, 5.0, 6.5], fov: 45 }}>
          <color attach="background" args={['#F8FAFC']} />
          <ambientLight intensity={0.95} />
          <directionalLight position={[8, 12, 6]} intensity={0.95} />

          <gridHelper args={[10, 10, '#CBD5E1', '#E2E8F0']} position={[0, -2.5, 0]} />
          <axesHelper args={[3.2]} />

          <PointCloudInstanced
            points={points}
            colorResolver={colorResolver}
            onHoverPoint={setHoveredIdx}
          />

          {/* K-Means Dashed Lines from Points to Nearest Centroid */}
          {kind === 'kmeans-3d' &&
            viz.centroids?.length > 0 &&
            points.map((pt, idx) => {
              const cIdx = viz.assignments?.[idx] ?? 0;
              const cent = viz.centroids[cIdx];
              if (!cent) return null;
              return (
                <Line
                  key={`kline-${idx}`}
                  points={[
                    [pt.x, pt.z ?? 0, pt.y],
                    [cent.x, cent.z ?? 0, cent.y]
                  ]}
                  color={cent.color}
                  lineWidth={1}
                  dashed
                  dashSize={0.14}
                  gapSize={0.1}
                  transparent
                  opacity={0.42}
                />
              );
            })}

          {kind === 'kmeans-3d' &&
            (viz.centroids || []).map((c) => <AnimatedCentroid key={c.clusterId} centroid={c} />)}

          {kind === 'svm-rbf-3d' && viz.liftAlpha > 0.1 && (
            <mesh position={[0, viz.zPlane, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[5.5, 5.5]} />
              <meshStandardMaterial color="#4F46E5" transparent opacity={0.22} side={THREE.DoubleSide} />
            </mesh>
          )}

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

        {/* 3D Hover Tooltip HUD */}
        {hoveredPoint && (
          <div className="absolute top-3 right-3 bg-white/95 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono text-[#0F172A] shadow-lg pointer-events-none">
            <div className="font-bold text-[#4F46E5]">Point #{hoveredPoint.id ?? hoveredIdx + 1}</div>
            <div>
              x={hoveredPoint.x}, y={hoveredPoint.y}, z={hoveredPoint.z ?? 0}
            </div>
            {hoveredCluster !== undefined && (
              <div className="text-[#0D9488] font-semibold">
                Cluster C{hoveredCluster + 1} · dist = {hoveredDist}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
