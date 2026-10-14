import { Router } from 'express';
import {
  getAdminSummary,
  createProduct,
  updateProduct,
  toggleProductActive,
  updateVariantStock,
  getAllOrders,
  updateOrderStatus
} from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

// Server-enforced admin authorization on every endpoint
router.use(requireAuth, requireAdmin);

router.get('/summary', getAdminSummary);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.patch('/products/:id/toggle', toggleProductActive);
router.patch('/variants/:id/stock', updateVariantStock);
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);

export default router;
