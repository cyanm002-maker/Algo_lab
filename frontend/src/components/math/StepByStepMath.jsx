import React, { useMemo } from 'react';
import katex from 'katex';
import { Calculator } from 'lucide-react';

function KatexFormula({ latex, displayMode = true }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex || '', {
        displayMode,
        throwOnError: false,
        strict: false
      });
    } catch {
      return latex;
    }
  }, [latex, displayMode]);

  return (
    <div
      className="text-[#0F172A] overflow-x-auto py-0.5"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const TONE_CLASSES = {
  indigo: 'text-[#4F46E5] bg-[#EEF2FF] border-indigo-200/70',
  teal: 'text-[#0D9488] bg-[#F0FDFA] border-teal-200/70',
  amber: 'text-[#D97706] bg-[#FFFBEB] border-amber-200/70',
  rose: 'text-rose-700 bg-rose-50 border-rose-200/70',
  slate: 'text-slate-700 bg-slate-100 border-slate-200'
};

export default function StepByStepMath({ algorithm, stepData }) {
  return (
    <div className="bento-card p-5 flex flex-col gap-3.5 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#4F46E5]" />
          Step-by-Step Math Walkthrough
        </h2>
        <span className="text-[10px] font-mono font-semibold text-[#0D9488] bg-[#F0FDFA] border border-teal-200 px-2 py-0.5 rounded-full">
          0ms Client Engine
        </span>
      </div>

      {/* Live Numerical Substitution */}
      {stepData?.substitutionLatex && (
        <div className="bg-[#EEF2FF]/60 border border-indigo-200 rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-wider text-[#4F46E5] font-bold mb-1">
            Step {stepData.step} — {stepData.phase}
          </div>
          <KatexFormula latex={stepData.substitutionLatex} displayMode />
        </div>
      )}

      {/* KPI Badges */}
      {stepData?.kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stepData.kpis.map((kpi, idx) => (
            <div
              key={idx}
              className={`border rounded-lg p-2 ${TONE_CLASSES[kpi.tone] || TONE_CLASSES.slate}`}
            >
              <div className="text-[10px] font-medium opacity-80">{kpi.label}</div>
              <div className="text-xs font-mono font-bold mt-0.5">{kpi.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Live Numerical Table */}
      {stepData?.table && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#0F172A] border-b border-slate-200">
            {stepData.table.title}
          </div>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-left text-[11px] font-mono">
              <thead className="bg-slate-50 text-[#475569] sticky top-0 border-b border-slate-200">
                <tr>
                  {stepData.table.headers.map((h, i) => (
                    <th key={i} className="px-2.5 py-1.5 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#0F172A]">
                {stepData.table.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/80">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-2.5 py-1.5">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reference Equations */}
      <div className="flex flex-col gap-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Core Equations
        </div>
        {(algorithm?.formulas || []).map((formula) => (
          <div
            key={formula.id}
            className="bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-2.5"
          >
            <div className="text-xs font-semibold text-[#0F172A] mb-0.5">
              {formula.label}
            </div>
            <KatexFormula latex={formula.latex} displayMode />
            <p className="text-[11px] text-[#475569] mt-0.5">
              {formula.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
