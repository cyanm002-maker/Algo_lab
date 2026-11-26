import React from 'react';
import Visualizer2D from '../visualizers/Visualizer2D';
import Visualizer3D from '../visualizers/Visualizer3D';

export default function SpatialRegressionClassifier({
  viewMode,
  stepData,
  onAddPoint,
  onMoveQuery,
  onResetPoints,
  hasCustomPoints
}) {
  if (viewMode === '3d') {
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
