import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getUserLookbooks,
  getLookbookById,
  createLookbook,
  updateLookbook,
  deleteLookbook,
  addOutfitToLookbook,
  removeOutfitFromLookbook,
  getSharedLookbook
} from '../controllers/lookbookController.js';

const router = Router();

// Public shareable token route
router.get('/shared/:token', getSharedLookbook);

// Authenticated user lookbook management
router.get('/', requireAuth, getUserLookbooks);
router.get('/:id', requireAuth, getLookbookById);
router.post('/', requireAuth, createLookbook);
router.put('/:id', requireAuth, updateLookbook);
router.delete('/:id', requireAuth, deleteLookbook);

// Outfit associations
router.post('/:id/outfits', requireAuth, addOutfitToLookbook);
router.delete('/:id/outfits/:outfitId', requireAuth, removeOutfitFromLookbook);

export default router;
