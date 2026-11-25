import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import algorithmRoutes from './routes/algorithmRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'OPTIONS']
  })
);
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'aiml-visualizer-api' });
});

app.use('/api/algorithms', algorithmRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
