import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AttentionTransformerFlow({ stepData }) {
  const viz = stepData?.viz || {};
  const tokens = viz.tokens || ['The', 'river', 'bank', 'flooded', 'fast'];
  const matrix = viz.matrix || [];
  const activeQuery = viz.activeQuery ?? 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-[#475569] flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
        <span>Q · Kᵀ Softmax Attention Heatmap (Row = Query Token, Col = Key Token)</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 h-[360px] flex flex-col justify-center">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `84px repeat(${tokens.length}, minmax(0, 1fr))` }}>
          <div />
          {tokens.map((tok, i) => (
            <div key={i} className="text-center text-xs font-mono font-bold text-[#475569] py-1">
              {tok}
            </div>
          ))}

          {tokens.map((qTok, rIdx) => (
            <React.Fragment key={rIdx}>
              <div
                className={`text-xs font-mono font-bold flex items-center justify-end pr-2 rounded ${
                  rIdx === activeQuery ? 'text-[#4F46E5] bg-[#EEF2FF]' : 'text-[#475569]'
                }`}
              >
                {qTok}
              </div>
              {tokens.map((_, cIdx) => {
                const w = matrix[rIdx]?.[cIdx] ?? 0;
                return (
                  <div
                    key={cIdx}
                    className={`h-11 rounded-lg flex items-center justify-center text-xs font-mono font-semibold border transition-all ${
                      rIdx === activeQuery ? 'border-[#4F46E5]/50' : 'border-slate-100'
                    }`}
                    style={{
                      backgroundColor: `rgba(79, 70, 229, ${0.06 + w * 0.82})`,
                      color: w > 0.35 ? '#FFFFFF' : '#0F172A'
                    }}
                  >
                    {w}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
