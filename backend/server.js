import 'dotenv/config';
import mongoose from 'mongoose';
import app from './src/app.js';

const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

const startServer = async () => {
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      console.log('Connected to MongoDB');
    } catch (err) {
      console.warn(
        `MongoDB unavailable (${err.message}). Falling back to JSON curriculum seeds.`
      );
    }
  } else {
    console.log('MONGODB_URI not set. Serving curriculum from JSON seeds.');
  }

  app.listen(PORT, () => {
    console.log(`AI/ML Visualizer API listening on http://localhost:${PORT}`);
  });
};

startServer();
