import React from 'react';
import { Table2, ArrowRight } from 'lucide-react';

export default function DataFramePipeline2D({ stepData }) {
  const viz = stepData?.viz || {};
  const stageIndex = viz.stageIndex ?? 0;
  const stages = [
    { label: '1. Raw Ingest', count: viz.rawRows?.length ?? 6 },
    { label: '2. fillna(median)', count: viz.imputed?.length ?? 6 },
    { label: `3. Filter ≥ $${viz.minSpend ?? 100}`, count: viz.filtered?.length ?? 5 },
    { label: '4. GroupBy Mean', count: viz.groups?.length ?? 2 }
  ];

  const activeRows =
    stageIndex === 0
      ? viz.rawRows || []
      : stageIndex === 1
      ? viz.imputed || []
      : stageIndex === 2
      ? viz.filtered || []
      : viz.groups || [];

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-[#475569] flex items-center gap-1.5">
        <Table2 className="w-3.5 h-3.5 text-[#2563EB]" />
        <span>Interactive DataFrame Transformation Pipeline</span>
      </div>

      {/* Pipeline Stage Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {stages.map((st, idx) => (
          <React.Fragment key={st.label}>
            <div
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
                idx === stageIndex
                  ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                  : 'bg-[#F8FAFC] border-slate-200 text-[#475569]'
              }`}
            >
              {st.label} <span className="font-mono opacity-75">({st.count})</span>
            </div>
            {idx < stages.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-300" />}
          </React.Fragment>
        ))}
      </div>

      {/* Live DataFrame Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white h-[310px] overflow-y-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#F8FAFC] text-[#475569] border-b border-slate-200 sticky top-0">
            {stageIndex === 3 ? (
              <tr>
                <th className="px-3 py-2">segment</th>
                <th className="px-3 py-2">count</th>
                <th className="px-3 py-2">mean_spend</th>
              </tr>
            ) : (
              <tr>
                <th className="px-3 py-2">id</th>
                <th className="px-3 py-2">segment</th>
                <th className="px-3 py-2">age</th>
                <th className="px-3 py-2">spend</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-100 text-[#0F172A]">
            {activeRows.map((row, idx) =>
              stageIndex === 3 ? (
                <tr key={idx} className="hover:bg-[#EFF6FF]/40">
                  <td className="px-3 py-2 font-semibold">{row.segment}</td>
                  <td className="px-3 py-2">{row.count}</td>
                  <td className="px-3 py-2 text-[#0D9488] font-bold">${row.meanSpend}</td>
                </tr>
              ) : (
                <tr key={row.id ?? idx} className="hover:bg-[#EFF6FF]/40">
                  <td className="px-3 py-2 text-slate-400">{row.id}</td>
                  <td className="px-3 py-2 font-semibold">{row.segment}</td>
                  <td className={`px-3 py-2 ${row.imputed ? 'bg-[#FFFBEB] text-[#D97706] font-bold' : ''}`}>
                    {row.age === null ? 'NaN' : row.age}
                  </td>
                  <td className="px-3 py-2 text-[#2563EB]">${row.spend}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
