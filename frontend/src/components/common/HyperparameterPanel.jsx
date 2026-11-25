import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

export default function HyperparameterPanel({
  hyperparameters = [],
  values = {},
  onChange
}) {
  if (!hyperparameters.length) return null;

  return (
    <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {hyperparameters.map((hp) => {
        const val = values[hp.key] ?? hp.defaultValue;
        return (
          <div key={hp.key} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#0F172A] font-semibold flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#4F46E5]" />
                {hp.label}
              </span>
              <span className="font-mono text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-md font-semibold">
                {val}
                {hp.unit ? ` ${hp.unit}` : ''}
              </span>
            </div>
            <input
              type="range"
              min={hp.min}
              max={hp.max}
              step={hp.step}
              value={val}
              onChange={(e) => onChange(hp.key, Number(e.target.value))}
              aria-label={hp.label}
              className="w-full accent-[#4F46E5] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
            <p className="text-[11px] text-[#475569] leading-snug">
              {hp.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
