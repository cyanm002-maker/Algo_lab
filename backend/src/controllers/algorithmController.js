import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Algorithm from '../models/Algorithm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadSeedLessons = () => {
  const dataDir = path.join(__dirname, '../data');
  const files = ['linearRegression.json', 'kMeans.json'];
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(dataDir, file), 'utf-8');
    return JSON.parse(raw);
  });
};

const seedLessons = loadSeedLessons();

const isDbConnected = () => mongoose.connection.readyState === 1;

export const getAlgorithms = async (req, res, next) => {
  try {
    const { category } = req.query;

    if (isDbConnected()) {
      const filter = category ? { category } : {};
      const algorithms = await Algorithm.find(filter)
        .select('slug title subtitle category visualizationType difficulty summary')
        .sort({ category: 1, title: 1 })
        .lean();

      if (algorithms.length > 0) {
        return res.json({ source: 'mongodb', data: algorithms });
      }
    }

    const filtered = category
      ? seedLessons.filter((item) => item.category === category)
      : seedLessons;

    const summaries = filtered.map(
      ({ slug, title, subtitle, category: cat, visualizationType, difficulty, summary }) => ({
        slug,
        title,
        subtitle,
        category: cat,
        visualizationType,
        difficulty,
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
