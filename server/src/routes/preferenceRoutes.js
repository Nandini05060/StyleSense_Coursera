import { Router } from 'express';
import {
  getPreferences,
  updatePreferences,
  getStyleProfile,
  updateStyleProfile,
  resetStyleProfile
} from '../controllers/preferenceController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getPreferences);
router.put('/', requireAuth, updatePreferences);

router.get('/profile', requireAuth, getStyleProfile);
router.put('/profile', requireAuth, updateStyleProfile);
router.post('/profile/reset', requireAuth, resetStyleProfile);

export default router;

