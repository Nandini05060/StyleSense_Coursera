import { query, memoryStore } from '../config/db.js';
import { compareProductWithWardrobe } from '../services/wardrobeService.js';

/**
 * Compare Candidate Product with User's Digital Wardrobe
 */
export async function compareWithWardrobe(req, res, next) {
  try {
    const userId = req.user?.id;
    const { product_id, product_slug } = req.body;

    if (!product_id && !product_slug) {
      return res.status(400).json({ success: false, message: 'product_id or product_slug is required.' });
    }

    // 1. Fetch Product
    let product = null;
    if (memoryStore.products) {
      product = memoryStore.products.find(p =>
        (product_id && p.id === Number(product_id)) ||
        (product_slug && p.slug === product_slug)
      );
    } else {
      const rows = await query(
        `SELECT p.*, c.name AS category_name, c.slug AS category_slug
         FROM products p
         JOIN categories c ON p.category_id = c.id
         WHERE p.id = ? OR p.slug = ?`,
        [product_id || 0, product_slug || '']
      );
      if (rows && rows.length > 0) {
        product = rows[0];
      }
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // 2. Fetch User's Wardrobe (if user authenticated)
    let wardrobeItems = [];
    if (userId) {
      if (memoryStore.wardrobe_items) {
        wardrobeItems = memoryStore.wardrobe_items.filter(i => i.user_id === userId);
      } else {
        wardrobeItems = await query('SELECT * FROM wardrobe_items WHERE user_id = ?', [userId]);
      }
    }

    // 3. Run Smart Buy-or-Reuse Analysis
    const comparison = compareProductWithWardrobe(product, wardrobeItems);

    return res.status(200).json({
      success: true,
      data: {
        ...comparison,
        isAuthenticated: !!userId,
        wardrobeItemCount: wardrobeItems.length
      }
    });
  } catch (error) {
    next(error);
  }
}
