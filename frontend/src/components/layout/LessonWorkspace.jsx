import React from 'react';
import CanvasWrapper from '../visualizers/CanvasWrapper';
import HyperparameterPanel from '../common/HyperparameterPanel';
import StepByStepMath from '../math/StepByStepMath';
import EvaluationChart from '../charts/EvaluationChart';
import AdvantagesPanel from '../theory/AdvantagesPanel';
import CodeViewer from '../code/CodeViewer';

/**
 * 5-Module Light-Mode Bento Workspace:
 * 1. Top-Left (60% / 7 cols): Interactive 2D/3D Canvas + Hyperparameter Sliders
 * 2. Top-Right (40% / 5 cols): Step-by-Step Math Walkthrough
 * 3. Middle-Left (50% / 6 cols): Evaluation & Diagnostic Graph
 * 4. Middle-Right (50% / 6 cols): Advantages, Limitations & Properties
 * 5. Bottom (100% / 12 cols): Tabbed Python Implementation Viewer
 */
export default function LessonWorkspace({
  algorithm,
  viewMode,
  hyperparams,
  onHyperparamChange,
  currentStepData,
  onAddPoint,
  onMoveQuery,
  onResetPoints,
  hasCustomPoints
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Module 1: Interactive 2D/3D Spatial Canvas (60%) */}
      <section className="lg:col-span-7 bento-card p-5 flex flex-col gap-4">
        <CanvasWrapper
          algorithm={algorithm}
          viewMode={viewMode}
          stepData={currentStepData}
          onAddPoint={onAddPoint}
          onMoveQuery={onMoveQuery}
          onResetPoints={onResetPoints}
          hasCustomPoints={hasCustomPoints}
        />
        <HyperparameterPanel
          hyperparameters={algorithm?.hyperparameters}
          values={hyperparams}
          onChange={onHyperparamChange}
        />
      </section>

      {/* Module 2: Step-by-Step Mathematical Walkthrough (40%) */}
      <section className="lg:col-span-5 max-h-[680px] overflow-y-auto">
        <StepByStepMath algorithm={algorithm} stepData={currentStepData} />
      </section>

      {/* Module 3: Evaluation & Diagnostic Graph (50%) */}
      <section className="lg:col-span-6">
        <EvaluationChart algorithm={algorithm} stepData={currentStepData} />
      </section>

      {/* Module 4: Advantages, Limitations & Best Use Cases (50%) */}
      <section className="lg:col-span-6">
        <AdvantagesPanel algorithm={algorithm} />
      </section>

      {/* Module 5: Python Implementation Viewer (Full-Width Bottom) */}
      <section className="lg:col-span-12">
        <CodeViewer codeTemplates={algorithm?.codeTemplates} />
      </section>
    </div>
  );
}
