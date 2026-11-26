import React from 'react';
import CanvasWrapper from '../visualizers/CanvasWrapper';
import HyperparameterPanel from '../common/HyperparameterPanel';
import StepByStepMath from '../math/StepByStepMath';
import EvaluationChart from '../charts/EvaluationChart';
import TheoryDeepDive from '../theory/TheoryDeepDive';
import PythonBridgeCard from '../common/PythonBridgeCard';
import CodeViewer from '../code/CodeViewer';

export default function LessonWorkspace({
  algorithm,
  viewMode,
  hyperparams,
  onHyperparamChange,
  currentStepData,
  onAddPoint,
  onMoveQuery,
  onResetPoints,
  hasCustomPoints,
  onSelectLibrary
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Module 1: Interactive 2D/3D Spatial & Tensor Canvas (60%) */}
      <section className="lg:col-span-7 bento-card p-5 flex flex-col gap-4">
        <CanvasWrapper
          algorithm={algorithm}
          viewMode={viewMode}
          stepData={currentStepData}
          onAddPoint={onAddPoint}
          onMoveQuery={onMoveQuery}
          onResetPoints={onResetPoints}
          hasCustomPoints={hasCustomPoints}
          onHyperparamChange={onHyperparamChange}
        />
        <HyperparameterPanel
          hyperparameters={algorithm?.hyperparameters}
          values={hyperparams}
          onChange={onHyperparamChange}
        />
      </section>

      {/* Module 2: Live Mathematical Walkthrough (40%) */}
      <section className="lg:col-span-5 max-h-[680px] overflow-y-auto">
        <StepByStepMath algorithm={algorithm} stepData={currentStepData} />
      </section>

      {/* Module 3: Evaluation & Diagnostic Graph (50%) */}
      <section className="lg:col-span-6">
        <EvaluationChart algorithm={algorithm} stepData={currentStepData} />
      </section>

      {/* Module 4: Intuition, 5-Step How It Works, & Pros/Cons (50%) */}
      <section className="lg:col-span-6">
        <TheoryDeepDive algorithm={algorithm} />
      </section>

      {/* Module 5: Contextual Python Ecosystem Bridge */}
      <section className="lg:col-span-12">
        <PythonBridgeCard
          pythonBridge={algorithm?.pythonBridge}
          onSelectLibrary={onSelectLibrary}
        />
      </section>

      {/* Module 6: 3-Tab Python Implementation Viewer */}
      <section className="lg:col-span-12">
        <CodeViewer codeTemplates={algorithm?.codeTemplates} />
      </section>
    </div>
  );
}
