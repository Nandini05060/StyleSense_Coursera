import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { uploadWardrobeImage } from '../middleware/upload.js';
import {
  getWardrobeItems,
  getWardrobeItemById,
  createWardrobeItem,
  updateWardrobeItem,
  deleteWardrobeItem,
  recordItemWear,
  toggleFavoriteItem,
  handleWardrobeUpload,
  getWardrobeAnalytics,
  getWardrobeGaps,
  dismissWardrobeGap
} from '../controllers/wardrobeController.js';

const router = express.Router();

// All wardrobe routes require authentication
router.use(authenticateToken);

// Analytics & Gaps
router.get('/analytics', getWardrobeAnalytics);
router.get('/gaps', getWardrobeGaps);
router.post('/gaps/dismiss', dismissWardrobeGap);

// Image Upload
router.post('/upload', uploadWardrobeImage.single('image'), handleWardrobeUpload);

// Wardrobe Item CRUD
router.get('/', getWardrobeItems);
router.get('/:id', getWardrobeItemById);
router.post('/', createWardrobeItem);
router.put('/:id', updateWardrobeItem);
router.delete('/:id', deleteWardrobeItem);

// Item Interactions
router.post('/:id/wear', recordItemWear);
router.patch('/:id/favorite', toggleFavoriteItem);

export default router;
