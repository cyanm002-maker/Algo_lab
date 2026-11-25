import React from 'react';
import { CheckCircle2, AlertTriangle, Cpu, Compass } from 'lucide-react';

export default function AdvantagesPanel({ algorithm }) {
  const pros = algorithm?.prosAndCons;
  if (!pros) return null;

  const props = pros.properties || {};

  return (
    <div className="bento-card p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#4F46E5]" />
          Advantages, Limitations &amp; Properties
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Key Advantages */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5">
          <h4 className="text-xs font-bold text-emerald-900 mb-2">
            Key Advantages
          </h4>
          <ul className="space-y-1.5">
            {(pros.advantages || []).map((adv, idx) => (
              <li key={idx} className="text-xs text-emerald-950/85 flex items-start gap-2 leading-snug">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Limitations & Trade-offs */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
          <h4 className="text-xs font-bold text-amber-900 mb-2">
            Limitations &amp; Trade-offs
          </h4>
          <ul className="space-y-1.5">
            {(pros.limitations || []).map((lim, idx) => (
              <li key={idx} className="text-xs text-amber-950/85 flex items-start gap-2 leading-snug">
                <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                <span>{lim}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Complexity & Properties */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            Time Complexity
          </div>
          <div className="text-xs font-mono font-semibold text-[#0F172A] mt-0.5">
            {props.timeComplexity}
          </div>
        </div>
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            Space
          </div>
          <div className="text-xs font-mono font-semibold text-[#0F172A] mt-0.5">
            {props.spaceComplexity}
          </div>
        </div>
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            Interpretability
          </div>
          <div className="text-xs font-semibold text-[#4F46E5] mt-0.5">
            {props.interpretability}
          </div>
        </div>
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            Feature Scaling
          </div>
          <div className="text-xs font-semibold text-[#0D9488] mt-0.5">
            {props.scalingRequired}
          </div>
        </div>
      </div>

      {/* Real-World Applications */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
        <span className="text-[11px] font-semibold text-[#475569] flex items-center gap-1 mr-1">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          Use Cases:
        </span>
        {(pros.applications || []).map((app, idx) => (
          <span
            key={idx}
            className="px-2.5 py-0.5 rounded-full text-[11px] bg-slate-100 text-[#475569] border border-slate-200"
          >
            {app}
          </span>
        ))}
      </div>
    </div>
  );
}
