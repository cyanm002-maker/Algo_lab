import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import CanvasWrapper from '../visualizers/CanvasWrapper';
import HyperparameterPanel from '../common/HyperparameterPanel';
import StepByStepMath from '../math/StepByStepMath';
import CodeViewer from '../code/CodeViewer';

/**
 * 4-pane responsive learning grid:
 * 1. Interactive Canvas (2D D3/SVG or 3D React Three Fiber) + Hyperparameters
 * 2. Live Step-by-Step Math (KaTeX + Substitution Table)
 * 3. Theory & Intuition
 * 4. Tabbed Python Code Viewer
 */
export default function LessonWorkspace({
  algorithm,
  hyperparams,
  onHyperparamChange,
  playback,
  currentStepData,
  points,
  onAddPoint,
  onResetPoints,
  hasCustomPoints
}) {
  const theory = algorithm?.theory;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      {/* Pane 1: Visualization Canvas + Hyperparameter/Playback Controls */}
      <section className="xl:col-span-7 flex flex-col gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <CanvasWrapper
            algorithm={algorithm}
            stepData={currentStepData}
            points={points}
            onAddPoint={onAddPoint}
            onResetPoints={onResetPoints}
            hasCustomPoints={hasCustomPoints}
          />
        </div>

        <HyperparameterPanel
          hyperparameters={algorithm?.hyperparameters}
          values={hyperparams}
          onChange={onHyperparamChange}
          playback={playback}
          currentStepData={currentStepData}
        />
      </section>

      {/* Pane 2: Live Math & Numerical Substitution */}
      <section className="xl:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-4 overflow-y-auto max-h-[760px]">
        <StepByStepMath algorithm={algorithm} stepData={currentStepData} />
      </section>

      {/* Pane 3: Theory & Intuition */}
      <section className="xl:col-span-6 bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold text-slate-100">
            Theory &amp; Geometric Intuition
          </h2>
        </div>

        {theory && (
          <div className="flex flex-col gap-3 text-xs text-slate-300 leading-relaxed">
            <div>
              <h3 className="text-slate-100 font-semibold mb-1">Overview</h3>
              <p className="text-slate-300">{theory.overview}</p>
            </div>

            <div className="bg-sky-500/5 border border-sky-500/20 rounded-lg p-3">
              <h3 className="text-sky-300 font-semibold mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Mental Model
              </h3>
              <p className="text-slate-300">{theory.intuition}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                <h4 className="text-slate-200 font-semibold mb-1.5">
                  Key Assumptions
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  {(theory.assumptions || []).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex flex-col justify-between gap-2">
                <div>
                  <h4 className="text-slate-200 font-semibold mb-1">
                    Complexity
                  </h4>
                  <p className="font-mono text-[11px] text-emerald-300">
                    Time: {theory.complexity?.time}
                  </p>
                  <p className="font-mono text-[11px] text-sky-300">
                    Space: {theory.complexity?.space}
                  </p>
                </div>
                <div>
                  <h4 className="text-slate-200 font-semibold mb-1">
                    Real-World Applications
                  </h4>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                    {(theory.applications || []).map((app, idx) => (
                      <li key={idx}>{app}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Pane 4: Tabbed Python Code Viewer */}
      <section className="xl:col-span-6 bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <CodeViewer codeTemplates={algorithm?.codeTemplates} />
      </section>
    </div>
  );
}
