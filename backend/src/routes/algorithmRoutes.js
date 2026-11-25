import { Router } from 'express';
import { getAlgorithms, getAlgorithmBySlug } from '../controllers/algorithmController.js';

const router = Router();

router.get('/', getAlgorithms);
router.get('/:slug', getAlgorithmBySlug);

export default router;
