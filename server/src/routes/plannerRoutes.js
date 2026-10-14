import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  generateOutfit,
  saveOutfit,
  getSavedOutfits,
  deleteSavedOutfit,
  getSlotAlternatives
} from '../controllers/plannerController.js';

const router = express.Router();

// Require authentication for planner
router.use(authenticateToken);

router.post('/generate', generateOutfit);
router.post('/save', saveOutfit);
router.get('/saved', getSavedOutfits);
router.delete('/saved/:id', deleteSavedOutfit);
router.post('/alternatives', getSlotAlternatives);

export default router;
