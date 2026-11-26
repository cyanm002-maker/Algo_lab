import { runLinearRegressionHistory } from './linearRegressionMath.js';
import { runPolynomialRidgeHistory } from './polynomialRidgeMath.js';
import { runLogisticRegressionHistory } from './logisticRegressionMath.js';
import { runKnnHistory } from './knnMath.js';
import { runSvmRbfHistory } from './svmRbfMath.js';
import { runDecisionTreeHistory } from './decisionTreeMath.js';
import { runRandomForestHistory } from './randomForestMath.js';
import { runGaussianNaiveBayesHistory } from './gaussianNaiveBayesMath.js';
import { runKMeansHistory } from './kMeansMath.js';
import { runDbscanHistory } from './dbscanMath.js';
import { runHierarchicalHistory } from './hierarchicalMath.js';
import { runGmmEmHistory } from './gmmEmMath.js';
import { runPcaHistory } from './pcaMath.js';
import { runIsolationForestHistory } from './isolationForestMath.js';
import { runArchetypeEngine } from './archetypeEngine.js';

const ENGINE_MAP = {
  'linear-regression': runLinearRegressionHistory,
  'polynomial-ridge': runPolynomialRidgeHistory,
  'logistic-regression': runLogisticRegressionHistory,
  knn: runKnnHistory,
  'svm-rbf': runSvmRbfHistory,
  'decision-tree': runDecisionTreeHistory,
  'random-forest': runRandomForestHistory,
  'gaussian-naive-bayes': runGaussianNaiveBayesHistory,
  'k-means': runKMeansHistory,
  dbscan: runDbscanHistory,
  'hierarchical-clustering': runHierarchicalHistory,
  'gmm-em': runGmmEmHistory,
  pca: runPcaHistory,
  'isolation-forest': runIsolationForestHistory
};

export function runAlgorithmEngine(algorithmOrSlug, dataset, params, viewMode) {
  const slug = typeof algorithmOrSlug === 'string' ? algorithmOrSlug : algorithmOrSlug?.slug;
  const runner = ENGINE_MAP[slug];
  if (runner) {
    return runner(dataset, params, viewMode);
  }
  return runArchetypeEngine(algorithmOrSlug, dataset, params, viewMode);
}
