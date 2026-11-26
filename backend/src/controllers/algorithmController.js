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

function enrichLesson(lesson, meta) {
  const slug = lesson.slug || meta?.slug;
  const title = lesson.title || meta?.title;
  const code = lesson.codeTemplates || {};
  const intuition =
    lesson.intuition ||
    lesson.theory?.intuition ||
    `${title} works by iteratively refining internal parameters against an objective until patterns in the data become clearly separated or predicted.`;

  const howItWorks =
    lesson.howItWorks || [
      {
        step: 1,
        title: 'Initialize State & Hyperparameters',
        detail: `Set initial model parameters and hyperparameters for ${title}.`
      },
      {
        step: 2,
        title: 'Forward Pass / Distance Computation',
        detail: `Evaluate predictions, distances, or projections across the input samples.`
      },
      {
        step: 3,
        title: 'Measure Objective / Error',
        detail: `Compute the loss or structural score quantifying current model fit.`
      },
      {
        step: 4,
        title: 'Update Parameters',
        detail: `Adjust weights, centroids, or splits to improve the objective.`
      },
      {
        step: 5,
        title: 'Converge & Evaluate',
        detail: `Verify convergence and inspect diagnostic curves on held-out data.`
      }
    ];

  return {
    ...meta,
    ...lesson,
    visualArchetype: lesson.visualArchetype || meta?.visualArchetype || 'SpatialRegressionClassifier',
    domainId: lesson.domainId || meta?.domainId || 'supervised-classification',
    domainTitle: lesson.domainTitle || meta?.domainTitle || 'Core Curriculum',
    intuition,
    howItWorks,
    pythonBridge: lesson.pythonBridge || {
      pandas: `df = pd.read_csv('dataset.csv').dropna()`,
      numpy: `X_np = df.to_numpy(dtype=np.float64) # Vectorized ${title} math`,
      pytorch: `X_t = torch.tensor(X_np, dtype=torch.float32, requires_grad=True)`
    },
    codeTemplates: {
      fromScratch:
        code.fromScratch ||
        `import numpy as np\n\n# From Scratch (NumPy) — ${title}\nX = np.random.randn(20, 3)\nprint('${slug} shape:', X.shape)`,
      production:
        code.production ||
        code.scikitLearn ||
        `from sklearn.preprocessing import StandardScaler\nimport numpy as np\n\nX = np.random.randn(20, 3)\nX_scaled = StandardScaler().fit_transform(X)\nprint('Production pipeline ready for ${title}:', X_scaled.shape)`,
      dataPrep:
        code.dataPrep ||
        `import pandas as pd\n\ndf = pd.DataFrame({'f1': [1.0, 2.0, 3.0], 'f2': [4.0, 5.0, 6.0]})\ndf = df.fillna(df.median())\nprint(df.head())`
    }
  };
}

function buildFallbackLesson(meta) {
  const is3D = meta.visualizationType === '3d';
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
      evaluationChart: {
        type: 'line',
        title: `${meta.title} — Convergence & Diagnostic Profile`,
        xLabel: 'Iteration / Complexity',
        yLabel: 'Objective Metric',
        description: `Live diagnostic curve computed client-side for ${meta.title}.`
      },
      prosAndCons: {
        advantages: [
          `Core ${meta.domainTitle} technique for structured pattern modeling.`,
          `Maps cleanly to ${meta.visualArchetype} geometric intuition.`,
          `Vectorizable in NumPy and accelerated on GPU via PyTorch.`
        ],
        limitations: [
          'Requires careful hyperparameter tuning and validation splitting.',
          'Performance depends on feature quality and representative sampling.'
        ],
        properties: {
          timeComplexity: is3D ? 'O(T · n · d)' : 'O(n · log n)',
          spaceComplexity: 'O(n · d)',
          interpretability: 'Moderate',
          scalingRequired: 'Recommended'
        },
        applications: [meta.domainTitle, 'Production ML Pipelines', 'Research Prototyping']
      },
      formulas: [
        {
          id: 'core',
          label: `${meta.title} Objective`,
          latex: `\\mathcal{L}(\\theta) = \\frac{1}{n}\\sum_{i=1}^{n} \\ell\\left(f_\\theta(\\mathbf{x}_i), y_i\\right) + \\lambda \\Omega(\\theta)`,
          description: `Balances empirical objective fit with regularization complexity for ${meta.title}.`
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
          description: 'Adjusts active iteration depth or spatial scale at 0ms latency.'
        },
        {
          key: 'learningRate',
          label: 'Step Rate (α)',
          min: 0.01,
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
