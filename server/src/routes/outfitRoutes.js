import { Router } from 'express';
import { generateOutfit, replaceSlot } from '../controllers/outfitController.js';

const router = Router();

router.post('/', generateOutfit);
router.post('/replace', replaceSlot);

export default router;
