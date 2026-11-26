import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import { Cpu } from 'lucide-react';

export default function NeuralNetworkGraph3D({ stepData }) {
  const viz = stepData?.viz || {};
  const layers = viz.layers || [2, 4, 3, 1];
  const isBackward = Boolean(viz.isBackward);

  const { nodes, edges } = useMemo(() => {
    const nList = [];
    const eList = [];
    const xSpacing = 2.1;
    const startX = -((layers.length - 1) * xSpacing) / 2;

    layers.forEach((count, lIdx) => {
      const layerNodes = [];
      const yStart = -((count - 1) * 0.9) / 2;
      for (let i = 0; i < count; i++) {
        const pos = [startX + lIdx * xSpacing, yStart + i * 0.9, 0];
        layerNodes.push(pos);
        nList.push({ pos, lIdx });
      }
      if (lIdx > 0) {
        const prevCount = layers[lIdx - 1];
        const prevStartY = -((prevCount - 1) * 0.9) / 2;
        for (let p = 0; p < prevCount; p++) {
          for (let c = 0; c < count; c++) {
            eList.push([
              [startX + (lIdx - 1) * xSpacing, prevStartY + p * 0.9, 0],
              layerNodes[c]
            ]);
          }
        }
      }
    });
    return { nodes: nList, edges: eList };
  }, [layers]);

  const edgeColor = isBackward ? '#D97706' : '#4F46E5';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#475569] flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-[#2563EB]" />
          3D Computation Graph · {isBackward ? 'Reverse .backward() Gradient Flow' : 'Forward Tensor Pass'}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isBackward ? 'bg-[#FFFBEB] text-[#D97706]' : 'bg-[#EEF2FF] text-[#4F46E5]'
          }`}
        >
          {isBackward ? '← Autograd Backward' : '→ Forward Pass'}
        </span>
      </div>

      <div className="w-full h-[390px] bg-[#F8FAFC] border border-slate-200 rounded-xl overflow-hidden">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [0, 0.8, 7.2], fov: 45 }}>
          <color attach="background" args={['#F8FAFC']} />
          <ambientLight intensity={0.95} />
          <directionalLight position={[5, 8, 5]} intensity={0.9} />

          {edges.map((seg, idx) => (
            <Line key={idx} points={seg} color={edgeColor} lineWidth={1.4} transparent opacity={0.55} />
          ))}

          {nodes.map((n, idx) => (
            <mesh key={idx} position={n.pos}>
              <sphereGeometry args={[0.22, 18, 18]} />
              <meshStandardMaterial
                color={n.lIdx === 0 ? '#2563EB' : n.lIdx === layers.length - 1 ? '#0D9488' : edgeColor}
                roughness={0.3}
              />
            </mesh>
          ))}

          <OrbitControls enableDamping dampingFactor={0.08} />
        </Canvas>
      </div>
    </div>
  );
}
