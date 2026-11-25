import React from 'react';
import LinearRegression2D from './LinearRegression2D';
import KMeans3D from './KMeans3D';

/**
 * Dynamically switches between 2D D3/SVG and 3D React Three Fiber canvases
 * based on the active algorithm lesson.
 */
export default function CanvasWrapper({
  algorithm,
  stepData,
  points,
  onAddPoint,
  onResetPoints,
  hasCustomPoints
}) {
  if (!algorithm) return null;

  if (algorithm.visualizationType === '3d' || algorithm.slug === 'k-means') {
    return <KMeans3D stepData={stepData} />;
  }

  return (
    <LinearRegression2D
      stepData={stepData}
      points={points}
      onAddPoint={onAddPoint}
      onResetPoints={onResetPoints}
      hasCustomPoints={hasCustomPoints}
    />
  );
}
