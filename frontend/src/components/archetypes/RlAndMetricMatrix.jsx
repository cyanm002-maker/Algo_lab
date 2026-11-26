import React from 'react';
import { Grid } from 'lucide-react';

export default function RlAndMetricMatrix({ stepData }) {
  const viz = stepData?.viz || {};
  const grid = viz.grid || [];

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-[#475569] flex items-center gap-1.5">
        <Grid className="w-3.5 h-3.5 text-[#0D9488]" />
        <span>4×4 Value &amp; Policy Matrix (Goal = +10, Hazard = -5)</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 h-[360px] flex items-center justify-center">
        <div className="grid grid-cols-4 gap-2 w-full max-w-[340px]">
          {grid.map((cell, idx) => (
            <div
              key={idx}
              className={`aspect-square rounded-xl border flex flex-col items-center justify-center font-mono text-xs font-bold transition-all ${
                cell.isGoal
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                  : cell.isHazard
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'border-slate-200 text-[#0F172A]'
              }`}
              style={
                !cell.isGoal && !cell.isHazard
                  ? { backgroundColor: `rgba(79, 70, 229, ${Math.max(0.04, Math.min(0.45, cell.val / 15))})` }
                  : undefined
              }
            >
              <span className="text-[10px] opacity-60">
                {cell.isGoal ? 'GOAL' : cell.isHazard ? 'TRAP' : `S(${cell.r},${cell.c})`}
              </span>
              <span>{cell.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
