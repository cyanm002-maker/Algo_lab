import React from 'react';
import Visualizer2D from './Visualizer2D';
import Visualizer3D from './Visualizer3D';

export default function CanvasWrapper({
  algorithm,
  viewMode,
  stepData,
  onAddPoint,
  onMoveQuery,
  onResetPoints,
  hasCustomPoints
}) {
  if (!algorithm) return null;

  const activeMode = viewMode || algorithm.visualizationType;
  if (activeMode === '3d') {
    return <Visualizer3D stepData={stepData} />;
  }

  return (
    <Visualizer2D
      stepData={stepData}
      onAddPoint={onAddPoint}
      onMoveQuery={onMoveQuery}
      onResetPoints={onResetPoints}
      hasCustomPoints={hasCustomPoints}
    />
  );
}
