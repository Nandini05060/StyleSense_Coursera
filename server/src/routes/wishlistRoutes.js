import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  updatePriceWatch,
  updateItemCollection,
  getCollections,
  createCollection,
  deleteCollection,
  getNotifications,
  markNotificationRead,
  getProductPriceHistory
} from '../controllers/wishlistController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// Named Collections
router.get('/collections', getCollections);
router.post('/collections', createCollection);
router.delete('/collections/:name', deleteCollection);

// Price Alerts & Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);

// Price History
router.get('/price-history/:productId', getProductPriceHistory);

// Item Actions
router.get('/', getWishlist);
router.post('/', addToWishlist);
router.put('/:productId/price-watch', updatePriceWatch);
router.put('/:productId/collection', updateItemCollection);
router.delete('/:productId', removeFromWishlist);

export default router;
