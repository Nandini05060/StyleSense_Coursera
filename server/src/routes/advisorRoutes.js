import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { compareWithWardrobe } from '../controllers/advisorController.js';

const router = express.Router();

// Compare candidate product with user's wardrobe (optional auth so guests can see preview, logged-in users get personal analysis)
router.post('/compare', optionalAuth, compareWithWardrobe);

export default router;
