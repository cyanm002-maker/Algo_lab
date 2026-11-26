import React from 'react';
import SpatialRegressionClassifier from '../archetypes/SpatialRegressionClassifier';
import LossOptimization3D from '../archetypes/LossOptimization3D';
import ClusterDensity3D from '../archetypes/ClusterDensity3D';
import SubspaceEmbedding3D from '../archetypes/SubspaceEmbedding3D';
import TreeEnsembleVisualizer from '../archetypes/TreeEnsembleVisualizer';
import NeuralNetworkGraph3D from '../archetypes/NeuralNetworkGraph3D';
import TensorGridCube3D from '../archetypes/TensorGridCube3D';
import DataFramePipeline2D from '../archetypes/DataFramePipeline2D';
import AttentionTransformerFlow from '../archetypes/AttentionTransformerFlow';
import DiffusionFlowVisualizer from '../archetypes/DiffusionFlowVisualizer';
import TimeSeriesForecastPlot from '../archetypes/TimeSeriesForecastPlot';
import RlAndMetricMatrix from '../archetypes/RlAndMetricMatrix';

const ARCHETYPE_MAP = {
  SpatialRegressionClassifier,
  LossOptimization3D,
  ClusterDensity3D,
  SubspaceEmbedding3D,
  TreeEnsembleVisualizer,
  NeuralNetworkGraph3D,
  TensorGridCube3D,
  DataFramePipeline2D,
  AttentionTransformerFlow,
  DiffusionFlowVisualizer,
  TimeSeriesForecastPlot,
  RlAndMetricMatrix
};

export default function CanvasWrapper(props) {
  const { algorithm } = props;
  if (!algorithm) return null;

  const Component =
    ARCHETYPE_MAP[algorithm.visualArchetype] || SpatialRegressionClassifier;

  return <Component {...props} />;
}
