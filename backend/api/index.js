import mongoose from 'mongoose';
import app from '../src/app.js';

let dbPromise = null;

async function ensureDbConnection() {
  const uri = process.env.MONGODB_URI;
  if (!uri || mongoose.connection.readyState === 1) return;

  if (!dbPromise) {
    dbPromise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 3000 })
      .catch((err) => {
        console.warn(`MongoDB unavailable (${err.message}). Using JSON seeds.`);
        dbPromise = null;
      });
  }

  await dbPromise;
}

export default async function handler(req, res) {
  await ensureDbConnection();
  return app(req, res);
}
