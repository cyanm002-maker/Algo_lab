import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Algorithm from '../models/Algorithm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');
const lessonsDir = path.join(dataDir, 'lessons');

const loadRegistry = () => {
  const raw = fs.readFileSync(path.join(dataDir, 'curriculumRegistry.json'), 'utf-8');
  return JSON.parse(raw);
};

const LEGACY_FILE_MAP = {
  'linear-regression': 'linearRegression.json',
  'polynomial-ridge': 'polynomialRidge.json',
  'logistic-regression': 'logisticRegression.json',
  knn: 'knn.json',
  'svm-rbf': 'svmRbf.json',
  'decision-tree': 'decisionTree.json',
  'random-forest': 'randomForest.json',
  'gaussian-naive-bayes': 'gaussianNaiveBayes.json',
  'k-means': 'kMeans.json',
  dbscan: 'dbscan.json',
  'hierarchical-clustering': 'hierarchicalClustering.json',
  'gmm-em': 'gmmEm.json',
  pca: 'pca.json',
  'isolation-forest': 'isolationForest.json'
};

const ARCHETYPE_TEMPLATES = {
  SpatialRegressionClassifier: (meta) => ({
    latex: `\\hat{y}(\\mathbf{x}) = f(\\mathbf{w}^T\\phi(\\mathbf{x}) + b), \\quad \\mathcal{L} = \\frac{1}{n}\\sum_{i=1}^n \\ell(\\hat{y}_i, y_i) + \\lambda\\Omega(\\mathbf{w})`,
    formulaLabel: `${meta.title} Decision / Regression Function`,
    formulaDesc: `Maps input features via linear or kernelized weights while balancing fit against regularization.`,
    chartTitle: `${meta.title} — Error & Fit Profile`,
    xLabel: 'Iteration / Complexity',
    yLabel: 'Loss / Error',
    intuition: `${meta.title} finds a geometric boundary or curve in feature space that separates classes or predicts continuous values with minimal error: ${meta.summary}`,
    steps: [
      { step: 1, title: 'Feature Representation', detail: `Project input samples x into the target coordinate space for ${meta.title}.` },
      { step: 2, title: 'Compute Predictions', detail: 'Evaluate linear or kernelized scores w^T x + b across all training points.' },
      { step: 3, title: 'Measure Residual / Margin Loss', detail: 'Quantify prediction error and apply any L1/L2 regularization penalty.' },
      { step: 4, title: 'Update Weights or Support Vectors', detail: 'Adjust parameters to minimize loss or maximize the separating margin.' },
      { step: 5, title: 'Generalize on Test Data', detail: 'Evaluate calibrated predictions on unseen validation samples.' }
    ],
    advantages: [
      `Clear geometric boundary in 2D/3D feature space for ${meta.title}.`,
      'Fast inference once parameters or support vectors are learned.',
      'Strong baseline with well-understood regularization controls.'
    ],
    limitations: [
      'Sensitive to unscaled features; standardization is strongly recommended.',
      'Extreme outliers can pull boundaries unless robust loss or kernels are used.'
    ],
    properties: { timeComplexity: 'O(T · n · d)', spaceComplexity: 'O(n · d)', interpretability: 'High', scalingRequired: 'Yes' }
  }),

  LossOptimization3D: (meta) => ({
    latex: `\\theta_{t+1} = \\theta_t - \\alpha \\, \\mathbf{P}_t \\nabla \\mathcal{L}(\\theta_t)`,
    formulaLabel: `${meta.title} Parameter Update`,
    formulaDesc: `Steers parameters downhill along the 3D loss landscape using gradients, curvature, or stochastic search.`,
    chartTitle: `${meta.title} — Objective Convergence Curve`,
    xLabel: 'Step / Generation',
    yLabel: 'Objective Loss J(θ)',
    intuition: `${meta.title} navigates a hilly mathematical landscape in search of the lowest valley: ${meta.summary}`,
    steps: [
      { step: 1, title: 'Initialize Candidate State', detail: `Place initial parameters θ₀ on the 3D objective surface for ${meta.title}.` },
      { step: 2, title: 'Probe Local Landscape', detail: 'Measure gradient slope, curvature Hessian, or neighboring candidate fitness.' },
      { step: 3, title: 'Compute Step Direction & Scale', detail: 'Apply learning rate α, momentum, temperature, or swarm velocity.' },
      { step: 4, title: 'Move Parameters', detail: 'Update θ toward lower objective loss while avoiding oscillation.' },
      { step: 5, title: 'Verify Stationarity', detail: 'Stop when step improvements fall below tolerance or max budget is reached.' }
    ],
    advantages: [
      `Directly optimizes complex objective surfaces in ${meta.title}.`,
      'Scales smoothly to high-dimensional parameter vectors.',
      'Balances exploration of plateaus with fast local convergence.'
    ],
    limitations: [
      'Step-size / schedule hyperparameters strongly impact convergence speed.',
      'Non-convex landscapes can still trap naive trajectories in saddle points.'
    ],
    properties: { timeComplexity: 'O(T · d)', spaceComplexity: 'O(d)', interpretability: 'High', scalingRequired: 'Yes' }
  }),

  ClusterDensity3D: (meta) => ({
    latex: `J = \\sum_{k=1}^{K} \\sum_{\\mathbf{x}_i \\in C_k} d(\\mathbf{x}_i, \\boldsymbol{\\mu}_k)^2`,
    formulaLabel: `${meta.title} Cohesion Objective`,
    formulaDesc: `Groups points by geometric proximity, density reachability, or probabilistic likelihood.`,
    chartTitle: `${meta.title} — Cluster Quality / Inertia`,
    xLabel: 'Clusters / Sorted Points',
    yLabel: 'Inertia / Distance',
    intuition: `${meta.title} discovers natural neighborhoods in unlabeled data without human labels: ${meta.summary}`,
    steps: [
      { step: 1, title: 'Compute Pairwise Distances', detail: `Measure Euclidean or density-weighted distances across the point cloud.` },
      { step: 2, title: 'Identify Cores or Centroids', detail: `Locate dense neighborhoods or initialize representative cluster centers for ${meta.title}.` },
      { step: 3, title: 'Assign Memberships', detail: 'Group points into clusters or flag sparse points as outliers.' },
      { step: 4, title: 'Refine Cluster Structure', detail: 'Update centroids, covariance ellipses, or merge hierarchy.' },
      { step: 5, title: 'Validate Cohesion', detail: 'Check Inertia, Silhouette Score, or reachability stability.' }
    ],
    advantages: [
      `Uncovers hidden structure in unlabeled data via ${meta.title}.`,
      'Intuitive spatial grouping visible directly in 2D/3D point clouds.',
      'Useful for segmentation, compression, and outlier isolation.'
    ],
    limitations: [
      'Distance metrics degrade in very high dimensions (Curse of Dimensionality).',
      'Requires feature scaling so wide-range columns do not dominate distance.'
    ],
    properties: { timeComplexity: 'O(n log n) to O(n²)', spaceComplexity: 'O(n · d)', interpretability: 'High', scalingRequired: 'Yes (Mandatory)' }
  }),

  SubspaceEmbedding3D: (meta) => ({
    latex: `\\mathbf{Z} = \\mathbf{X}\\mathbf{W}_k, \\quad \\mathbf{W}_k^T\\mathbf{W}_k = \\mathbf{I}_k`,
    formulaLabel: `${meta.title} Latent Projection`,
    formulaDesc: `Maps high-dimensional vectors onto a compact k-dimensional subspace preserving variance or topology.`,
    chartTitle: `${meta.title} — Variance / Reconstruction Profile`,
    xLabel: 'Latent Component',
    yLabel: 'Captured Signal %',
    intuition: `${meta.title} shines a spotlight from the best angle to cast a clear low-dimensional shadow of complex data: ${meta.summary}`,
    steps: [
      { step: 1, title: 'Center & Scale Features', detail: 'Zero-mean and standardize features so variance reflects true signal.' },
      { step: 2, title: 'Measure Structure / Neighbors', detail: `Compute covariance, SVD factors, or neighbor affinities for ${meta.title}.` },
      { step: 3, title: 'Solve Embedding Axes', detail: 'Extract top-k eigenvectors or optimize low-dimensional coordinates.' },
      { step: 4, title: 'Project onto Subspace', detail: 'Transform 3D/high-dim points onto the compressed 2D/k-D manifold.' },
      { step: 5, title: 'Inspect Retained Variance', detail: 'Verify reconstruction error or neighborhood preservation.' }
    ],
    advantages: [
      `Compresses high-dimensional noise into clean latent axes via ${meta.title}.`,
      'Accelerates downstream models and removes multicollinearity.',
      'Enables visual exploration of embeddings in 2D and 3D.'
    ],
    limitations: [
      'Latent axes are combinations of features, reducing direct explainability.',
      'Hyperparameters (e.g., n_components, perplexity) affect global vs. local fidelity.'
    ],
    properties: { timeComplexity: 'O(n · d²)', spaceComplexity: 'O(n · k)', interpretability: 'Low (Latent)', scalingRequired: 'Yes (Mandatory)' }
  }),

  TreeEnsembleVisualizer: (meta) => ({
    latex: `\\hat{y}(\\mathbf{x}) = \\sum_{m=1}^{M} \\eta \\, h_m(\\mathbf{x}), \\quad \\Delta G = G(S) - \\sum_v \\frac{|S_v|}{|S|}G(S_v)`,
    formulaLabel: `${meta.title} Split & Ensemble Rule`,
    formulaDesc: `Recursively partitions feature space along axis-aligned cuts and aggregates weak learners.`,
    chartTitle: `${meta.title} — Ensemble Error / Feature Importance`,
    xLabel: 'Trees / Features',
    yLabel: 'Error / Gain',
    intuition: `${meta.title} plays a smart game of 20 Questions, slicing the data with crisp threshold rules: ${meta.summary}`,
    steps: [
      { step: 1, title: 'Evaluate Candidate Splits', detail: 'Scan feature thresholds to find cuts maximizing purity or gradient gain.' },
      { step: 2, title: 'Partition Nodes Recursively', detail: 'Route samples left or right down orthogonal decision boundaries.' },
      { step: 3, title: 'Build Ensemble Learners', detail: `Combine trees via bagging or sequential residual boosting in ${meta.title}.` },
      { step: 4, title: 'Apply Regularization / Pruning', detail: 'Limit max_depth, min_samples, or leaf L2 penalties to prevent overfitting.' },
      { step: 5, title: 'Aggregate Predictions', detail: 'Output majority class vote, weighted sum, or path-length anomaly score.' }
    ],
    advantages: [
      `State-of-the-art accuracy on structured tabular data with ${meta.title}.`,
      'Requires zero feature scaling and handles non-linear interactions natively.',
      'Provides built-in feature importance rankings.'
    ],
    limitations: [
      'Cannot extrapolate trends beyond the range of training target values.',
      'Large ensembles increase memory footprint and require tuning depth/learning rate.'
    ],
    properties: { timeComplexity: 'O(M · n · d log n)', spaceComplexity: 'O(M · nodes)', interpretability: 'Moderate', scalingRequired: 'No' }
  }),

  NeuralNetworkGraph3D: (meta) => ({
    latex: `\\mathbf{h}^{(l)} = \\sigma\\left(\\mathbf{W}^{(l)}\\mathbf{h}^{(l-1)} + \\mathbf{b}^{(l)}\\right), \\quad \\nabla_\\theta \\mathcal{L} = \\text{Autograd}(\\mathcal{L})`,
    formulaLabel: `${meta.title} Layer & Gradient Flow`,
    formulaDesc: `Composes parameterized affine layers with non-linear activations trained via reverse-mode autodiff.`,
    chartTitle: `${meta.title} — Training Loss Curve`,
    xLabel: 'Epoch / Step',
    yLabel: 'Loss L(θ)',
    intuition: `${meta.title} stacks layers of simple pattern detectors that learn hierarchical representations from data: ${meta.summary}`,
    steps: [
      { step: 1, title: 'Initialize Layer Weights', detail: `Allocate tensor weights W and biases b across the network graph for ${meta.title}.` },
      { step: 2, title: 'Forward Tensor Pass', detail: 'Propagate activations layer-by-layer through linear maps and non-linearities.' },
      { step: 3, title: 'Compute Loss Objective', detail: 'Compare network output against target or structural constraint.' },
      { step: 4, title: 'Backward Autograd Pass', detail: 'Apply the chain rule backward to compute ∂L/∂W for every parameter.' },
      { step: 5, title: 'Optimizer Step', detail: 'Update weights with Adam/SGD and repeat across mini-batches.' }
    ],
    advantages: [
      `Learns rich end-to-end representations automatically for ${meta.title}.`,
      'Hardware-accelerated on CUDA GPUs and TPUs.',
      'Modular building blocks compose into deep, multi-task architectures.'
    ],
    limitations: [
      'Requires larger datasets and careful normalization/regularization.',
      'Black-box internal weights are harder to interpret than linear/tree models.'
    ],
    properties: { timeComplexity: 'O(E · n · params)', spaceComplexity: 'O(params + acts)', interpretability: 'Low', scalingRequired: 'Yes (Norm Layers)' }
  }),

  TensorGridCube3D: (meta) => ({
    latex: `Y_{i,j,k} = \\sum_{u,v} X_{i+u,\\, j+v} \\cdot K_{u,v} \\quad \\text{or} \\quad \\text{Broadcast}(A, B)`,
    formulaLabel: `${meta.title} Tensor Operation`,
    formulaDesc: `Executes vectorized stride slicing, broadcasting, or sliding convolution kernels over multi-dimensional arrays.`,
    chartTitle: `${meta.title} — Vectorized Speedup / Compute Profile`,
    xLabel: 'Implementation',
    yLabel: 'Latency (ms)',
    intuition: `${meta.title} manipulates multi-dimensional number cubes in parallel instead of slow element-by-element loops: ${meta.summary}`,
    steps: [
      { step: 1, title: 'Verify Tensor Shapes & Strides', detail: `Inspect array dimensions (N, H, W, C) before running ${meta.title}.` },
      { step: 2, title: 'Align Axes / Broadcast', detail: 'Match trailing dimensions or apply sliding spatial windows.' },
      { step: 3, title: 'Execute Vectorized Kernel', detail: 'Run SIMD CPU or GPU tensor-core operations across contiguous memory.' },
      { step: 4, title: 'Reduce or Transform Output', detail: 'Produce sliced views, pooled maps, or quantized weight blocks.' },
      { step: 5, title: 'Validate Output Shape', detail: 'Confirm resulting tensor dimensions match downstream layer expectations.' }
    ],
    advantages: [
      `Orders-of-magnitude speedup via contiguous vectorized math in ${meta.title}.`,
      'Zero-copy stride slicing saves memory on large tensors.',
      'Directly maps to GPU tensor cores and spatial vision grids.'
    ],
    limitations: [
      'Shape mismatch errors occur if trailing axes are incompatible.',
      'High-dimensional tensors can consume significant VRAM.'
    ],
    properties: { timeComplexity: 'O(N) vectorized', spaceComplexity: 'O(N) contiguous', interpretability: 'High (Shapes)', scalingRequired: 'N/A' }
  }),

  DataFramePipeline2D: (meta) => ({
    latex: `\\mathbf{X}_{\\text{clean}} = \\text{Transform}\\left(\\text{Impute}(\\mathbf{X}_{\\text{raw}})\\right)`,
    formulaLabel: `${meta.title} Pipeline Transform`,
    formulaDesc: `Applies deterministic, leakage-free tabular transformations from raw DataFrames to model-ready matrices.`,
    chartTitle: `${meta.title} — Pipeline Stage Record Profile`,
    xLabel: 'Pipeline Stage',
    yLabel: 'Records / Features',
    intuition: `${meta.title} turns messy real-world tables into clean, leak-free numerical features: ${meta.summary}`,
    steps: [
      { step: 1, title: 'Ingest Raw Table', detail: 'Load heterogeneous columns (numeric, categorical, missing NaNs).' },
      { step: 2, title: 'Fit Statistics on Train Only', detail: `Compute medians, means, or vocabularies exclusively on training rows for ${meta.title}.` },
      { step: 3, title: 'Transform & Encode', detail: 'Apply scaling, imputation, or encoding consistently to train and test.' },
      { step: 4, title: 'Validate Schema', detail: 'Verify zero NaNs remain and feature dimensions align.' },
      { step: 5, title: 'Export NumPy / Tensor', detail: 'Pass clean float matrices directly into downstream ML estimators.' }
    ],
    advantages: [
      `Prevents silent validation data leakage via ${meta.title}.`,
      'Reproducible preprocessing across training and production inference.',
      'Improves downstream convergence speed and model accuracy.'
    ],
    limitations: [
      'Must be refit carefully if production feature distributions drift.',
      'High-cardinality categoricals can cause sparse feature explosion.'
    ],
    properties: { timeComplexity: 'O(n · d)', spaceComplexity: 'O(n · d)', interpretability: 'Very High', scalingRequired: 'Core Prep' }
  }),

  AttentionTransformerFlow: (meta) => ({
    latex: `\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V`,
    formulaLabel: `${meta.title} Attention Routing`,
    formulaDesc: `Dynamically scores pairwise token/patch relevance and aggregates contextual value vectors.`,
    chartTitle: `${meta.title} — Attention Weight Distribution`,
    xLabel: 'Token / Position',
    yLabel: 'Attention Weight α',
    intuition: `${meta.title} lets every token look across the entire context and dynamically spotlight the most relevant clues: ${meta.summary}`,
    steps: [
      { step: 1, title: 'Embed & Add Positions', detail: 'Convert tokens or patches into vectors with positional encoding / RoPE.' },
      { step: 2, title: 'Project Q, K, V', detail: 'Multiply embeddings by learned Query, Key, and Value weight matrices.' },
      { step: 3, title: 'Compute Scaled Dot Products', detail: `Score token affinities QK^T / sqrt(d_k) for ${meta.title}.` },
      { step: 4, title: 'Apply Mask & Softmax', detail: 'Normalize attention weights (applying causal mask if autoregressive).' },
      { step: 5, title: 'Aggregate Values & FFN', detail: 'Mix Value vectors and pass through residual LayerNorm + MLP.' }
    ],
    advantages: [
      `Captures long-range dependencies in O(1) path length via ${meta.title}.`,
      'Fully parallelizable across sequence positions during training.',
      'Scales predictably with data, parameters, and compute.'
    ],
    limitations: [
      'Quadratic O(N²) memory and compute in sequence length N without tiling.',
      'Large context windows require KV-cache optimization at inference.'
    ],
    properties: { timeComplexity: 'O(N² · d)', spaceComplexity: 'O(N²)', interpretability: 'Moderate (Heatmaps)', scalingRequired: 'LayerNorm' }
  }),

  DiffusionFlowVisualizer: (meta) => ({
    latex: `x_{t-1} = \\frac{1}{\\sqrt{\\alpha_t}}\\left(x_t - \\frac{1-\\alpha_t}{\\sqrt{1-\\bar{\\alpha}_t}}\\epsilon_\\theta(x_t, t)\\right) + \\sigma_t z`,
    formulaLabel: `${meta.title} Reverse Denoising Step`,
    formulaDesc: `Iteratively refines pure Gaussian noise into structured samples along a learned score or velocity field.`,
    chartTitle: `${meta.title} — Signal Recovery vs. Denoising Step`,
    xLabel: 'Denoising Step',
    yLabel: 'Signal Recovery %',
    intuition: `${meta.title} starts with static TV snow and gradually carves out a sharp, realistic sample step by step: ${meta.summary}`,
    steps: [
      { step: 1, title: 'Sample Gaussian Noise', detail: 'Draw an initial random latent vector z_T ~ N(0, I).' },
      { step: 2, title: 'Predict Noise / Velocity', detail: `Run the neural denoiser ε_θ(x_t, t) conditioned on timestep t for ${meta.title}.` },
      { step: 3, title: 'Apply Guidance (if conditional)', detail: 'Blend conditional and unconditional predictions via guidance scale.' },
      { step: 4, title: 'Step Reverse Trajectory', detail: 'Subtract predicted noise to move toward the clean data manifold.' },
      { step: 5, title: 'Decode Clean Sample', detail: 'After final step t=0, decode latent into output space.' }
    ],
    advantages: [
      `Produces state-of-the-art sample diversity and fidelity in ${meta.title}.`,
      'Stable training objective (MSE on noise/velocity) without GAN mode collapse.',
      'Flexible conditioning via text, edges, or latent guidance.'
    ],
    limitations: [
      'Iterative multi-step sampling is slower than single-pass generators.',
      'High-resolution synthesis requires latent compression or distillation.'
    ],
    properties: { timeComplexity: 'O(S · net)', spaceComplexity: 'O(latent)', interpretability: 'Moderate', scalingRequired: 'Yes' }
  }),

  TimeSeriesForecastPlot: (meta) => ({
    latex: `\\hat{y}_{t+h} = f\\left(y_t, y_{t-1}, \\dots, \\text{trend}_t, \\text{seasonal}_t\\right)`,
    formulaLabel: `${meta.title} Temporal Forecast`,
    formulaDesc: `Models autocorrelation, trend, seasonality, and uncertainty intervals across ordered time steps.`,
    chartTitle: `${meta.title} — Temporal Forecast & Signal`,
    xLabel: 'Time Step (t)',
    yLabel: 'Value y_t',
    intuition: `${meta.title} separates underlying trend and repeating seasonal rhythms from noise to project into the future: ${meta.summary}`,
    steps: [
      { step: 1, title: 'Order Chronologically', detail: 'Sort observations strictly by timestamp without future leakage.' },
      { step: 2, title: 'Decompose or Difference', detail: `Extract trend, seasonality, or stationarity lags for ${meta.title}.` },
      { step: 3, title: 'Fit Temporal Dynamics', detail: 'Estimate autoregressive weights, smoothing factors, or sequence states.' },
      { step: 4, title: 'Roll Forward Horizon', detail: 'Predict multi-step future values h=1..H.' },
      { step: 5, title: 'Compute Confidence Intervals', detail: 'Quantify widening forecast uncertainty across the horizon.' }
    ],
    advantages: [
      `Respects temporal ordering and seasonality patterns in ${meta.title}.`,
      'Produces calibrated uncertainty intervals for planning.',
      'Handles multi-horizon forecasting cleanly.'
    ],
    limitations: [
      'Sudden structural breaks or regime shifts invalidate historical trends.',
      'Requires careful time-series cross-validation (no random shuffling).'
    ],
    properties: { timeComplexity: 'O(T · lags)', spaceComplexity: 'O(T)', interpretability: 'High', scalingRequired: 'Depends' }
  }),

  RlAndMetricMatrix: (meta) => ({
    latex: `Q(s, a) \\leftarrow Q(s, a) + \\alpha\\left[r + \\gamma\\max_{a'}Q(s', a') - Q(s, a)\\right]`,
    formulaLabel: `${meta.title} Value / Matrix Rule`,
    formulaDesc: `Updates state-action values, recommendation factors, or evaluation matrices iteratively from feedback.`,
    chartTitle: `${meta.title} — Episode Return / Metric Curve`,
    xLabel: 'Episode / Threshold',
    yLabel: 'Score / Return',
    intuition: `${meta.title} learns from structured feedback tables or evaluates model trade-offs cell by cell: ${meta.summary}`,
    steps: [
      { step: 1, title: 'Initialize Matrix / Policy', detail: `Set initial Q-table, latent factors, or evaluation grid for ${meta.title}.` },
      { step: 2, title: 'Observe Feedback / Scores', detail: 'Collect environment rewards, user ratings, or predicted class labels.' },
      { step: 3, title: 'Compute Target / Metric', detail: 'Evaluate Bellman backup, matrix error, or Precision/Recall balance.' },
      { step: 4, title: 'Update Estimates', detail: 'Refine cell values or policy probabilities using step rate α.' },
      { step: 5, title: 'Verify Optimal Policy / Score', detail: 'Inspect converged grid policy or diagnostic curve.' }
    ],
    advantages: [
      `Directly optimizes sequential rewards or exact evaluation metrics in ${meta.title}.`,
      'Transparent cell-by-cell inspection of values and trade-offs.',
      'Forms the mathematical core of RL, RecSys, and model evaluation.'
    ],
    limitations: [
      'Tabular grids grow exponentially with state/action space size.',
      'Imbalanced rewards or class distributions require careful weighting.'
    ],
    properties: { timeComplexity: 'O(E · |S| · |A|)', spaceComplexity: 'O(|S| · |A|)', interpretability: 'High', scalingRequired: 'No' }
  })
};

function enrichLesson(lesson, meta) {
  const slug = lesson.slug || meta?.slug;
  const title = lesson.title || meta?.title;
  const code = lesson.codeTemplates || {};
  const template = (ARCHETYPE_TEMPLATES[lesson.visualArchetype || meta?.visualArchetype] || ARCHETYPE_TEMPLATES.SpatialRegressionClassifier)(
    meta || { title, summary: lesson.summary || '' }
  );

  const intuition = lesson.intuition || lesson.theory?.intuition || template.intuition;
  const howItWorks = lesson.howItWorks || template.steps;

  return {
    ...meta,
    ...lesson,
    visualArchetype: lesson.visualArchetype || meta?.visualArchetype || 'SpatialRegressionClassifier',
    domainId: lesson.domainId || meta?.domainId || 'supervised-classification',
    domainTitle: lesson.domainTitle || meta?.domainTitle || 'Core Curriculum',
    intuition,
    howItWorks,
    pythonBridge: lesson.pythonBridge || {
      pandas: `df = pd.read_csv('data.csv').dropna() # Clean & align columns for ${title}`,
      numpy: `X_np = df.to_numpy(dtype=np.float64) # Vectorized ${title} matrix math`,
      pytorch: `X_t = torch.tensor(X_np, dtype=torch.float32, requires_grad=True)`
    },
    codeTemplates: {
      fromScratch:
        code.fromScratch ||
        `import numpy as np\n\n# From Scratch (NumPy) — ${title}\nX = np.random.randn(20, 3)\nmean = X.mean(axis=0)\nprint('${title} centered shape:', (X - mean).shape)`,
      production:
        code.production ||
        code.scikitLearn ||
        `from sklearn.preprocessing import StandardScaler\nimport numpy as np\n\n# Production Pipeline — ${title}\nX = np.random.randn(20, 3)\nX_scaled = StandardScaler().fit_transform(X)\nprint('Ready for ${title}:', X_scaled.shape)`,
      dataPrep:
        code.dataPrep ||
        `import pandas as pd\n\ndf = pd.DataFrame({'f1': [1.2, 2.4, None, 4.1], 'f2': [0.5, 1.1, 1.8, 2.3]})\ndf = df.fillna(df.median())\nprint('${title} prepared rows:', len(df))`
    }
  };
}

function buildFallbackLesson(meta) {
  const tpl = (ARCHETYPE_TEMPLATES[meta.visualArchetype] || ARCHETYPE_TEMPLATES.SpatialRegressionClassifier)(meta);

  return enrichLesson(
    {
      slug: meta.slug,
      title: meta.title,
      subtitle: `${meta.domainTitle} · Interactive Visual Lab`,
      category: meta.category,
      visualizationType: meta.visualizationType,
      supports2D3DToggle: Boolean(meta.supports2D3DToggle),
      difficulty: meta.difficulty,
      visualArchetype: meta.visualArchetype,
      summary: meta.summary,
      intuition: tpl.intuition,
      howItWorks: tpl.steps,
      evaluationChart: {
        type: 'line',
        title: tpl.chartTitle,
        xLabel: tpl.xLabel,
        yLabel: tpl.yLabel,
        description: `Live diagnostic curve computed client-side for ${meta.title}.`
      },
      prosAndCons: {
        advantages: tpl.advantages,
        limitations: tpl.limitations,
        properties: tpl.properties,
        applications: [meta.domainTitle, 'Production ML Pipelines', 'Research & Prototyping']
      },
      formulas: [
        {
          id: 'core',
          label: tpl.formulaLabel,
          latex: tpl.latex,
          description: tpl.formulaDesc
        }
      ],
      hyperparameters: [
        {
          key: 'intensity',
          label: 'Model Complexity / Step',
          min: 1,
          max: 10,
          step: 1,
          defaultValue: 5,
          unit: '',
          description: `Adjusts active iteration depth or spatial scale for ${meta.title} at 0ms latency.`
        },
        {
          key: 'learningRate',
          label: 'Step Rate (α)',
          min: 0.02,
          max: 0.5,
          step: 0.02,
          defaultValue: 0.12,
          unit: '',
          description: 'Controls optimization or transition speed.'
        }
      ],
      defaultDataset: []
    },
    meta
  );
}

const isDbConnected = () => mongoose.connection.readyState === 1;

export const getAlgorithms = async (req, res, next) => {
  try {
    const { category, domainId } = req.query;
    const registry = loadRegistry();

    let algorithms = registry.algorithms;
    if (category) {
      algorithms = algorithms.filter((a) => a.category === category);
    }
    if (domainId) {
      algorithms = algorithms.filter((a) => a.domainId === domainId);
    }

    return res.json({
      source: 'curriculum-registry',
      totalAlgorithms: registry.totalAlgorithms,
      totalDomains: registry.totalDomains,
      domains: registry.domains,
      libraries: registry.libraries,
      data: algorithms
    });
  } catch (error) {
    return next(error);
  }
};

export const getAlgorithmBySlug = async (req, res, next) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const registry = loadRegistry();
    const meta =
      registry.algorithms.find((a) => a.slug === slug) ||
      registry.libraries.find((l) => l.slug === slug);

    if (isDbConnected()) {
      const dbDoc = await Algorithm.findOne({ slug }).lean();
      if (dbDoc) {
        return res.json({ source: 'mongodb', data: enrichLesson(dbDoc, meta) });
      }
    }

    const lessonFile = path.join(lessonsDir, `${slug}.json`);
    if (fs.existsSync(lessonFile)) {
      const parsed = JSON.parse(fs.readFileSync(lessonFile, 'utf-8'));
      return res.json({ source: 'lesson-json', data: enrichLesson(parsed, meta) });
    }

    if (LEGACY_FILE_MAP[slug]) {
      const legacyPath = path.join(dataDir, LEGACY_FILE_MAP[slug]);
      if (fs.existsSync(legacyPath)) {
        const parsed = JSON.parse(fs.readFileSync(legacyPath, 'utf-8'));
        return res.json({ source: 'seed-json', data: enrichLesson(parsed, meta) });
      }
    }

    if (meta) {
      return res.json({ source: 'generated-curriculum', data: buildFallbackLesson(meta) });
    }

    const err = new Error(`Curriculum topic '${slug}' not found`);
    err.statusCode = 404;
    return next(err);
  } catch (error) {
    return next(error);
  }
};
