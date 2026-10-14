import { Router } from 'express';
import { getRecommendations } from '../controllers/recommendationController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Allows both anonymous shoppers to experiment and logged-in users to persist preferences
router.post('/', optionalAuth, getRecommendations);

export default router;
