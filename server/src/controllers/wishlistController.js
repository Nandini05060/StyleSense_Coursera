import { query, memoryStore } from '../config/db.js';

export async function getWishlist(req, res, next) {
  try {
    const userId = req.user.id;

    if (memoryStore.wishlists) {
      const userWishlist = memoryStore.wishlists.filter(w => w.user_id === userId);
      const productIds = userWishlist.map(w => w.product_id);
      const products = memoryStore.products
        .filter(p => productIds.includes(p.id))
        .map(p => {
          const variants = memoryStore.product_variants.filter(v => v.product_id === p.id);
          return {
            ...p,
            variants,
            total_stock: variants.reduce((s, v) => s + (v.stock_quantity || 0), 0)
          };
        });

      return res.status(200).json({
        success: true,
        data: products
      });
    }

    const items = await query(
      `SELECT p.*, c.name as category_name
       FROM wishlists w
       JOIN products p ON w.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    next(error);
  }
}

export async function addToWishlist(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const pId = parseInt(productId, 10);

    if (memoryStore.wishlists) {
      const existing = memoryStore.wishlists.find(w => w.user_id === userId && w.product_id === pId);
      if (!existing) {
        memoryStore.wishlists.push({
          id: memoryStore.nextId.wishlists++,
          user_id: userId,
          product_id: pId,
          created_at: new Date()
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Product added to your wishlist.'
      });
    }

    await query(
      `INSERT INTO wishlists (user_id, product_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP`,
      [userId, pId]
    );

    return res.status(200).json({
      success: true,
      message: 'Product added to your wishlist.'
    });
  } catch (error) {
    next(error);
  }
}

export async function removeFromWishlist(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const pId = parseInt(productId, 10);

    if (memoryStore.wishlists) {
      memoryStore.wishlists = memoryStore.wishlists.filter(
        w => !(w.user_id === userId && w.product_id === pId)
      );
      return res.status(200).json({
        success: true,
        message: 'Product removed from wishlist.'
      });
    }

    await query('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [userId, pId]);

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist.'
    });
  } catch (error) {
    next(error);
  }
}
