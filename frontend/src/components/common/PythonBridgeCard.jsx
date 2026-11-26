import React from 'react';
import { Layers, Terminal, Cpu } from 'lucide-react';

export default function PythonBridgeCard({ pythonBridge, onSelectLibrary }) {
  if (!pythonBridge) return null;

  const bridges = [
    {
      lib: 'Pandas',
      slug: 'pandas-dataframe-lab',
      icon: Layers,
      text: pythonBridge.pandas,
      badge: 'bg-[#EFF6FF] text-[#2563EB] border-blue-200'
    },
    {
      lib: 'NumPy',
      slug: 'numpy-tensor-lab',
      icon: Terminal,
      text: pythonBridge.numpy,
      badge: 'bg-[#EEF2FF] text-[#4F46E5] border-indigo-200'
    },
    {
      lib: 'PyTorch',
      slug: 'pytorch-autograd-lab',
      icon: Cpu,
      text: pythonBridge.pytorch,
      badge: 'bg-[#FFFBEB] text-[#D97706] border-amber-200'
    }
  ];

  return (
    <div className="bento-card p-4 bg-gradient-to-r from-[#EFF6FF]/60 via-white to-[#EEF2FF]/50">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="text-xs font-bold text-[#0F172A] flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold uppercase">
            Under the Hood
          </span>
          Python AI Stack Bridge
        </div>
        <span className="text-[11px] text-[#475569]">
          Click any library to open its interactive sandbox
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {bridges.map((b) => {
          const Icon = b.icon;
          return (
            <button
              key={b.lib}
              type="button"
              onClick={() => onSelectLibrary && onSelectLibrary(b.slug)}
              className="text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-[#2563EB] hover:shadow-sm transition-all flex flex-col gap-1.5"
            >
              <span
                className={`inline-flex items-center gap-1.5 self-start px-2 py-0.5 rounded-full text-[10px] font-bold border ${b.badge}`}
              >
                <Icon className="w-3 h-3" />
                {b.lib}
              </span>
              <code className="text-[11px] font-mono text-[#0F172A] leading-snug break-words">
                {b.text}
              </code>
            </button>
          );
        })}
      </div>
    </div>
  );
}
