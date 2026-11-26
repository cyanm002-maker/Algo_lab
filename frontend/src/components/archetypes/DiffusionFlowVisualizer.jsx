import React from 'react';
import * as d3 from 'd3';
import { Sparkles } from 'lucide-react';

export default function DiffusionFlowVisualizer({ stepData }) {
  const viz = stepData?.viz || {};
  const points = viz.points || [];
  const noiseLevel = viz.noiseLevel ?? 0.5;
  const xScale = d3.scaleLinear().domain([0, 10]).range([24, 656]);
  const yScale = d3.scaleLinear().domain([0, 10]).range([346, 24]);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-[#475569] flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
        <span>Reverse Denoising Manifold · Noise σ = {noiseLevel}</span>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <svg viewBox="0 0 680 370" className="w-full h-auto block">
          {[2, 4, 6, 8].map((t) => (
            <g key={t}>
              <line x1={xScale(t)} x2={xScale(t)} y1={24} y2={346} stroke="#F1F5F9" />
              <line x1={24} x2={656} y1={yScale(t)} y2={yScale(t)} stroke="#F1F5F9" />
            </g>
          ))}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={xScale(pt.x)}
              cy={yScale(pt.y)}
              r={5.5}
              fill={noiseLevel > 0.4 ? '#D97706' : '#0D9488'}
              fillOpacity={0.85}
              stroke="#FFFFFF"
              strokeWidth={1.5}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
