import { Router } from 'express';
import { generateOutfit, replaceSlot, evaluateOutfit } from '../controllers/outfitController.js';

const router = Router();

router.post('/', generateOutfit);
router.post('/replace', replaceSlot);
router.post('/evaluate', evaluateOutfit);

export default router;
