import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import {
  getFitCharts,
  getFitPreferences,
  updateFitPreferences,
  evaluateFit
} from '../controllers/fitController.js';

const router = Router();

// Size charts
router.get('/charts', getFitCharts);
router.get('/charts/:category', getFitCharts);

// Saved fit preferences
router.get('/preferences', optionalAuth, getFitPreferences);
router.put('/preferences', requireAuth, updateFitPreferences);

// Real-time fit evaluation
router.post('/evaluate', optionalAuth, evaluateFit);

export default router;
