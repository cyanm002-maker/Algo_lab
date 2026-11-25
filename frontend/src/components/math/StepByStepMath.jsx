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
      className="text-slate-100 overflow-x-auto py-0.5"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function StepByStepMath({ algorithm, stepData }) {
  const isLinear = algorithm?.slug === 'linear-regression';
  const isKMeans = algorithm?.slug === 'k-means';

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-sky-400" />
          Live Mathematical Execution
        </h2>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
          0ms Local JS Engine
        </span>
      </div>

      {/* Live Substitution Banner */}
      {stepData?.substitutionLatex && (
        <div className="bg-slate-950/80 border border-sky-500/30 rounded-lg p-3">
          <div className="text-[11px] uppercase tracking-wider text-sky-400 font-semibold mb-1">
            Step {stepData.step} Substitution
          </div>
          <KatexFormula latex={stepData.substitutionLatex} displayMode />
        </div>
      )}

      {/* KPI Metrics */}
      {isLinear && stepData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400">Slope (w)</div>
            <div className="text-sm font-mono font-semibold text-sky-300">
              {stepData.w}
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400">Intercept (b)</div>
            <div className="text-sm font-mono font-semibold text-sky-300">
              {stepData.b}
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400">MSE Loss (J)</div>
            <div className="text-sm font-mono font-semibold text-rose-300">
              {stepData.mse}
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400">R² Fit</div>
            <div className="text-sm font-mono font-semibold text-emerald-300">
              {stepData.r2}
            </div>
          </div>
        </div>
      )}

      {isKMeans && stepData && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400">Clusters (K)</div>
            <div className="text-sm font-mono font-semibold text-sky-300">
              {stepData.k}
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400">Inertia (WCSS)</div>
            <div className="text-sm font-mono font-semibold text-amber-300">
              {stepData.inertia}
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400">Max Centroid Shift</div>
            <div className="text-sm font-mono font-semibold text-emerald-300">
              {stepData.maxShift}
            </div>
          </div>
        </div>
      )}

      {/* Concrete Numerical Substitution Table */}
      {isLinear && stepData?.predictions && (
        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <div className="bg-slate-950/70 px-3 py-2 text-xs font-medium text-slate-300 border-b border-slate-800 flex justify-between">
            <span>Point-by-Point Residual Table</span>
            <span className="font-mono text-slate-400">
              ∂J/∂w = {stepData.dw} | ∂J/∂b = {stepData.db}
            </span>
          </div>
          <div className="max-h-56 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 sticky top-0">
                <tr>
                  <th className="px-2.5 py-1.5">i</th>
                  <th className="px-2.5 py-1.5">x</th>
                  <th className="px-2.5 py-1.5">y</th>
                  <th className="px-2.5 py-1.5">ŷ = wx+b</th>
                  <th className="px-2.5 py-1.5">Error (ŷ-y)</th>
                  <th className="px-2.5 py-1.5">SqErr</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-200">
                {stepData.predictions.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40">
                    <td className="px-2.5 py-1.5 text-slate-400">{row.id}</td>
                    <td className="px-2.5 py-1.5">{row.x}</td>
                    <td className="px-2.5 py-1.5">{row.y}</td>
                    <td className="px-2.5 py-1.5 text-sky-300">{row.yHat}</td>
                    <td
                      className={`px-2.5 py-1.5 ${
                        row.error >= 0 ? 'text-amber-300' : 'text-rose-300'
                      }`}
                    >
                      {row.error}
                    </td>
                    <td className="px-2.5 py-1.5 text-slate-300">{row.sqError}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isKMeans && stepData?.sampleDistances && (
        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <div className="bg-slate-950/70 px-3 py-2 text-xs font-medium text-slate-300 border-b border-slate-800 flex justify-between">
            <span>Sample Euclidean Distances &amp; Assignments</span>
            <span className="font-mono text-slate-400">
              {stepData.points?.length} 3D pts
            </span>
          </div>
          <div className="max-h-56 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 sticky top-0">
                <tr>
                  <th className="px-2.5 py-1.5">Pt</th>
                  <th className="px-2.5 py-1.5">(x, y, z)</th>
                  <th className="px-2.5 py-1.5">d(x, μₖ)</th>
                  <th className="px-2.5 py-1.5">Cluster</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-200">
                {stepData.sampleDistances.map((row) => {
                  const centroid = stepData.centroids[row.assignedCluster];
                  return (
                    <tr key={row.id} className="hover:bg-slate-800/40">
                      <td className="px-2.5 py-1.5 text-slate-400">#{row.id}</td>
                      <td className="px-2.5 py-1.5">
                        ({row.x}, {row.y}, {row.z})
                      </td>
                      <td className="px-2.5 py-1.5 text-slate-300">
                        [{row.distances.join(', ')}]
                      </td>
                      <td className="px-2.5 py-1.5">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold"
                          style={{
                            backgroundColor: `${centroid?.color}22`,
                            color: centroid?.color
                          }}
                        >
                          C{row.assignedCluster + 1}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reference KaTeX Formulas */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Core Equations
        </div>
        <div className="grid grid-cols-1 gap-2">
          {(algorithm?.formulas || []).map((formula) => (
            <div
              key={formula.id}
              className="bg-slate-950/60 border border-slate-800/90 rounded-lg p-2.5"
            >
              <div className="text-xs font-semibold text-slate-200 mb-1">
                {formula.label}
              </div>
              <KatexFormula latex={formula.latex} displayMode />
              <p className="text-[11px] text-slate-400 mt-1">
                {formula.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
