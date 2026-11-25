import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Algorithm from '../models/Algorithm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_FILES = [
  'linearRegression.json',
  'polynomialRidge.json',
  'logisticRegression.json',
  'knn.json',
  'svmRbf.json',
  'decisionTree.json',
  'randomForest.json',
  'gaussianNaiveBayes.json',
  'kMeans.json',
  'dbscan.json',
  'hierarchicalClustering.json',
  'gmmEm.json',
  'pca.json',
  'isolationForest.json'
];

const loadSeedLessons = () => {
  const dataDir = path.join(__dirname, '../data');
  return SEED_FILES.map((file) => {
    const raw = fs.readFileSync(path.join(dataDir, file), 'utf-8');
    return JSON.parse(raw);
  }).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
};

const isDbConnected = () => mongoose.connection.readyState === 1;

export const getAlgorithms = async (req, res, next) => {
  try {
    const { category, visualizationType, difficulty } = req.query;

    if (isDbConnected()) {
      const filter = {};
      if (category) filter.category = category;
      if (visualizationType) filter.visualizationType = visualizationType;
      if (difficulty) filter.difficulty = difficulty;

      const algorithms = await Algorithm.find(filter)
        .select(
          'order slug title subtitle category visualizationType supports2D3DToggle difficulty summary'
        )
        .sort({ order: 1, title: 1 })
        .lean();

      if (algorithms.length > 0) {
        return res.json({ source: 'mongodb', data: algorithms });
      }
    }

    const seedLessons = loadSeedLessons();
    const filtered = seedLessons.filter((item) => {
      if (category && item.category !== category) return false;
      if (visualizationType && item.visualizationType !== visualizationType) return false;
      if (difficulty && item.difficulty !== difficulty) return false;
      return true;
    });

    const summaries = filtered.map(
      ({
        order,
        slug,
        title,
        subtitle,
        category: cat,
        visualizationType: viz,
        supports2D3DToggle,
        difficulty: diff,
        summary
      }) => ({
        order,
        slug,
        title,
        subtitle,
        category: cat,
        visualizationType: viz,
        supports2D3DToggle: Boolean(supports2D3DToggle),
        difficulty: diff,
        summary
      })
    );

    return res.json({ source: 'seed-json', data: summaries });
  } catch (error) {
    return next(error);
  }
};

export const getAlgorithmBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (isDbConnected()) {
      const algorithm = await Algorithm.findOne({ slug: slug.toLowerCase() }).lean();
      if (algorithm) {
        return res.json({ source: 'mongodb', data: algorithm });
      }
    }

    const seedLessons = loadSeedLessons();
    const seedMatch = seedLessons.find(
      (item) => item.slug.toLowerCase() === slug.toLowerCase()
    );

    if (!seedMatch) {
      const err = new Error(`Algorithm '${slug}' not found`);
      err.statusCode = 404;
      return next(err);
    }

    return res.json({ source: 'seed-json', data: seedMatch });
  } catch (error) {
    return next(error);
  }
};
