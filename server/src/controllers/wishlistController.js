/**
 * StyleSense AI — Smart Wishlist & Price Watch Controller
 * Collections, target price alerts, price history, and drop notifications
 */

import { query, memoryStore } from '../config/db.js';

/**
 * Helper to compute price trends from price history
 */
function computePriceTrend(productId, currentPrice) {
  let history = [];
  if (memoryStore.price_history) {
    history = memoryStore.price_history
      .filter(ph => ph.product_id === productId)
      .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
  }

  if (history.length === 0) {
    return { trend: 'stable', lowest_price: currentPrice, previous_price: currentPrice };
  }

  const prices = history.map(h => h.price);
  const minPrice = Math.min(...prices, currentPrice);
  const prevPrice = prices.length > 1 ? prices[prices.length - 2] : prices[0];

  let trend = 'stable';
  if (currentPrice < prevPrice) {
    trend = 'dropped';
  } else if (currentPrice <= minPrice) {
    trend = 'lowest';
  }

  return {
    trend,
    lowest_price: minPrice,
    previous_price: prevPrice
  };
}

/**
 * GET /api/wishlist
 * Returns wishlisted products with smart metadata
 */
export async function getWishlist(req, res, next) {
  try {
    const userId = req.user.id;
    const { collection } = req.query;

    if (memoryStore.wishlists) {
      let userWishlist = memoryStore.wishlists.filter(w => w.user_id === userId);
      if (collection && collection !== 'All Saved Pieces') {
        userWishlist = userWishlist.filter(w => w.collection_name === collection);
      }

      const products = userWishlist.map(w => {
        const prod = memoryStore.products.find(p => p.id === w.product_id);
        if (!prod) return null;

        const variants = memoryStore.product_variants.filter(v => v.product_id === prod.id);
        const { trend, lowest_price, previous_price } = computePriceTrend(prod.id, prod.price);
        const targetPriceNum = w.target_price ? parseFloat(w.target_price) : null;
        const isTargetMet = targetPriceNum !== null && prod.price <= targetPriceNum;
        const priceDiff = targetPriceNum !== null ? targetPriceNum - prod.price : null;

        return {
          ...prod,
          wishlist_id: w.id,
          collection_name: w.collection_name || 'All Saved Pieces',
          target_price: targetPriceNum,
          is_target_met: isTargetMet,
          price_difference: priceDiff,
          price_trend: trend,
          lowest_recorded_price: lowest_price,
          previous_price: previous_price,
          notes: w.notes || '',
          alert_triggered: w.alert_triggered || false,
          variants,
          total_stock: variants.reduce((s, v) => s + (v.stock_quantity || 0), 0)
        };
      }).filter(Boolean);

      return res.status(200).json({
        success: true,
        data: products
      });
    }

    let sql = `SELECT p.*, c.name as category_name, w.id as wishlist_id,
                      w.collection_name, w.target_price, w.alert_triggered, w.notes
               FROM wishlists w
               JOIN products p ON w.product_id = p.id
               JOIN categories c ON p.category_id = c.id
               WHERE w.user_id = ?`;
    const params = [userId];

    if (collection && collection !== 'All Saved Pieces') {
      sql += ` AND w.collection_name = ?`;
      params.push(collection);
    }
    sql += ` ORDER BY w.created_at DESC`;

    const rows = await query(sql, params);
    const enriched = rows.map(item => {
      const targetPriceNum = item.target_price ? parseFloat(item.target_price) : null;
      return {
        ...item,
        target_price: targetPriceNum,
        is_target_met: targetPriceNum !== null && item.price <= targetPriceNum,
        price_difference: targetPriceNum !== null ? targetPriceNum - item.price : null,
        price_trend: 'stable'
      };
    });

    return res.status(200).json({
      success: true,
      data: enriched
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/wishlist
 */
export async function addToWishlist(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId, collectionName = 'All Saved Pieces', targetPrice = null, notes = '' } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const pId = parseInt(productId, 10);
    const targetPriceNum = targetPrice ? parseFloat(targetPrice) : null;

    if (memoryStore.wishlists) {
      const existingIdx = memoryStore.wishlists.findIndex(w => w.user_id === userId && w.product_id === pId);
      if (existingIdx !== -1) {
        memoryStore.wishlists[existingIdx] = {
          ...memoryStore.wishlists[existingIdx],
          collection_name: collectionName || memoryStore.wishlists[existingIdx].collection_name,
          target_price: targetPriceNum !== null ? targetPriceNum : memoryStore.wishlists[existingIdx].target_price,
          notes: notes || memoryStore.wishlists[existingIdx].notes
        };
      } else {
        memoryStore.wishlists.push({
          id: memoryStore.nextId.wishlists++,
          user_id: userId,
          product_id: pId,
          collection_name: collectionName || 'All Saved Pieces',
          target_price: targetPriceNum,
          alert_triggered: false,
          notes: notes || '',
          created_at: new Date()
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Product added to your wishlist.'
      });
    }

    await query(
      `INSERT INTO wishlists (user_id, product_id, collection_name, target_price, notes)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         collection_name = VALUES(collection_name),
         target_price = VALUES(target_price),
         notes = VALUES(notes),
         created_at = CURRENT_TIMESTAMP`,
      [userId, pId, collectionName, targetPriceNum, notes]
    );

    return res.status(200).json({
      success: true,
      message: 'Product added to your wishlist.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/wishlist/:productId/price-watch
 * Set or update target price alert for a product
 */
export async function updatePriceWatch(req, res, next) {
  try {
    const userId = req.user.id;
    const pId = parseInt(req.params.productId, 10);
    const { target_price, notes } = req.body;

    const targetPriceNum = target_price ? parseFloat(target_price) : null;

    if (memoryStore.wishlists) {
      const item = memoryStore.wishlists.find(w => w.user_id === userId && w.product_id === pId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found in wishlist.' });
      }

      item.target_price = targetPriceNum;
      if (notes !== undefined) item.notes = notes;

      // Check if price already satisfies condition
      const product = memoryStore.products.find(p => p.id === pId);
      if (product && targetPriceNum !== null && product.price <= targetPriceNum) {
        item.alert_triggered = true;
        // Generate in-app notification if not already notified
        const existingNotif = memoryStore.user_notifications.find(
          n => n.user_id === userId && n.product_id === pId && n.type === 'target_price_met'
        );
        if (!existingNotif) {
          memoryStore.user_notifications.push({
            id: memoryStore.nextId.user_notifications++,
            user_id: userId,
            type: 'target_price_met',
            title: 'Target Price Reached!',
            message: `${product.name} is now available at ₹${product.price}, matching your alert of ₹${targetPriceNum}.`,
            product_id: pId,
            is_read: false,
            created_at: new Date()
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Price watch alert configured successfully.',
        data: item
      });
    }

    await query(
      `UPDATE wishlists
       SET target_price = ?, notes = COALESCE(?, notes)
       WHERE user_id = ? AND product_id = ?`,
      [targetPriceNum, notes, userId, pId]
    );

    return res.status(200).json({
      success: true,
      message: 'Price watch alert configured successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/wishlist/:productId/collection
 * Move wishlisted item to another collection folder
 */
export async function updateItemCollection(req, res, next) {
  try {
    const userId = req.user.id;
    const pId = parseInt(req.params.productId, 10);
    const { collection_name } = req.body;

    if (!collection_name) {
      return res.status(400).json({ success: false, message: 'Collection name is required.' });
    }

    if (memoryStore.wishlists) {
      const item = memoryStore.wishlists.find(w => w.user_id === userId && w.product_id === pId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found in wishlist.' });
      }
      item.collection_name = collection_name;

      return res.status(200).json({
        success: true,
        message: `Moved piece to "${collection_name}".`,
        data: item
      });
    }

    await query(
      `UPDATE wishlists SET collection_name = ? WHERE user_id = ? AND product_id = ?`,
      [collection_name, userId, pId]
    );

    return res.status(200).json({
      success: true,
      message: `Moved piece to "${collection_name}".`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/wishlist/:productId
 */
export async function removeFromWishlist(req, res, next) {
  try {
    const userId = req.user.id;
    const pId = parseInt(req.params.productId, 10);

    if (memoryStore.wishlists) {
      memoryStore.wishlists = memoryStore.wishlists.filter(
        w => !(w.user_id === userId && w.product_id === pId)
      );
      return res.status(200).json({
        success: true,
        message: 'Product removed from your wishlist.'
      });
    }

    await query('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [userId, pId]);
    return res.status(200).json({
      success: true,
      message: 'Product removed from your wishlist.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/wishlist/collections
 */
export async function getCollections(req, res, next) {
  try {
    const userId = req.user.id;

    if (memoryStore.wishlist_collections) {
      const collections = memoryStore.wishlist_collections.filter(c => c.user_id === userId);
      const userWishlist = memoryStore.wishlists.filter(w => w.user_id === userId);

      // Ensure 'All Saved Pieces' is always present
      const list = collections.map(c => ({
        ...c,
        item_count: c.name === 'All Saved Pieces'
          ? userWishlist.length
          : userWishlist.filter(w => w.collection_name === c.name).length
      }));

      if (!list.some(c => c.name === 'All Saved Pieces')) {
        list.unshift({
          id: 0,
          user_id: userId,
          name: 'All Saved Pieces',
          description: 'Complete collection of saved items',
          icon: 'bookmark',
          item_count: userWishlist.length
        });
      }

      return res.status(200).json({
        success: true,
        data: list
      });
    }

    const rows = await query(
      `SELECT c.*, COUNT(w.id) as item_count
       FROM wishlist_collections c
       LEFT JOIN wishlists w ON c.user_id = w.user_id AND c.name = w.collection_name
       WHERE c.user_id = ?
       GROUP BY c.id`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/wishlist/collections
 */
export async function createCollection(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, description = '', icon = 'bookmark' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Collection name is required.' });
    }

    const cleanName = name.trim();

    if (memoryStore.wishlist_collections) {
      const existing = memoryStore.wishlist_collections.find(
        c => c.user_id === userId && c.name.toLowerCase() === cleanName.toLowerCase()
      );
      if (existing) {
        return res.status(400).json({ success: false, message: 'A collection with this name already exists.' });
      }

      const newCol = {
        id: memoryStore.nextId.wishlist_collections++,
        user_id: userId,
        name: cleanName,
        description,
        icon,
        created_at: new Date()
      };
      memoryStore.wishlist_collections.push(newCol);

      return res.status(201).json({
        success: true,
        message: 'Collection created successfully.',
        data: { ...newCol, item_count: 0 }
      });
    }

    const result = await query(
      `INSERT INTO wishlist_collections (user_id, name, description, icon) VALUES (?, ?, ?, ?)`,
      [userId, cleanName, description, icon]
    );

    return res.status(201).json({
      success: true,
      message: 'Collection created successfully.',
      data: { id: result.insertId, name: cleanName, description, icon, item_count: 0 }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/wishlist/collections/:name
 */
export async function deleteCollection(req, res, next) {
  try {
    const userId = req.user.id;
    const { name } = req.params;

    if (name === 'All Saved Pieces') {
      return res.status(400).json({ success: false, message: 'Cannot delete default collection.' });
    }

    if (memoryStore.wishlist_collections) {
      memoryStore.wishlist_collections = memoryStore.wishlist_collections.filter(
        c => !(c.user_id === userId && c.name === name)
      );

      // Reassign products to 'All Saved Pieces'
      memoryStore.wishlists.forEach(w => {
        if (w.user_id === userId && w.collection_name === name) {
          w.collection_name = 'All Saved Pieces';
        }
      });

      return res.status(200).json({
        success: true,
        message: `Collection "${name}" removed. Items moved to "All Saved Pieces".`
      });
    }

    await query('DELETE FROM wishlist_collections WHERE user_id = ? AND name = ?', [userId, name]);
    await query(`UPDATE wishlists SET collection_name = 'All Saved Pieces' WHERE user_id = ? AND collection_name = ?`, [userId, name]);

    return res.status(200).json({
      success: true,
      message: `Collection "${name}" removed.`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/wishlist/notifications
 */
export async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id;

    if (memoryStore.user_notifications) {
      const notifs = memoryStore.user_notifications
        .filter(n => n.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return res.status(200).json({
        success: true,
        data: notifs,
        unread_count: notifs.filter(n => !n.is_read).length
      });
    }

    const rows = await query(
      `SELECT * FROM user_notifications WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: rows,
      unread_count: rows.filter(r => !r.is_read).length
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/wishlist/notifications/:id/read
 */
export async function markNotificationRead(req, res, next) {
  try {
    const userId = req.user.id;
    const notifId = parseInt(req.params.id, 10);

    if (memoryStore.user_notifications) {
      const n = memoryStore.user_notifications.find(item => item.id === notifId && item.user_id === userId);
      if (n) n.is_read = true;
      return res.status(200).json({ success: true, message: 'Notification marked as read.' });
    }

    await query('UPDATE user_notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [notifId, userId]);
    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/wishlist/price-history/:productId
 */
export async function getProductPriceHistory(req, res, next) {
  try {
    const pId = parseInt(req.params.productId, 10);

    if (memoryStore.price_history) {
      const history = memoryStore.price_history
        .filter(ph => ph.product_id === pId)
        .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));

      return res.status(200).json({
        success: true,
        data: history
      });
    }

    const rows = await query('SELECT * FROM price_history WHERE product_id = ? ORDER BY recorded_at ASC', [pId]);
    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
}
