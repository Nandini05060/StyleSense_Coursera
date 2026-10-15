import { query, memoryStore } from '../config/db.js';
import {
  calculateCostPerWear,
  generateWardrobeAnalytics,
  identifyWardrobeGaps
} from '../services/wardrobeService.js';

const VALID_CATEGORIES = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'];

/**
 * List Wardrobe Items for Authenticated User with Filtering & Sorting
 */
export async function getWardrobeItems(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      category,
      color,
      style,
      occasion,
      is_favorite,
      search,
      sort = 'newest'
    } = req.query;

    let items = [];

    if (memoryStore.wardrobe_items) {
      items = memoryStore.wardrobe_items.filter(item => item.user_id === userId);
    } else {
      items = await query('SELECT * FROM wardrobe_items WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    }

    // Apply Filters
    if (category) {
      items = items.filter(i => (i.category || '').toLowerCase() === category.toLowerCase());
    }
    if (color) {
      items = items.filter(i => (i.color || '').toLowerCase() === color.toLowerCase());
    }
    if (style) {
      items = items.filter(i => (i.style || '').toLowerCase() === style.toLowerCase());
    }
    if (occasion) {
      items = items.filter(i => (i.occasion || '').toLowerCase() === occasion.toLowerCase());
    }
    if (is_favorite !== undefined) {
      const favBool = is_favorite === 'true' || is_favorite === true || is_favorite === '1';
      items = items.filter(i => Boolean(i.is_favorite) === favBool);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i =>
        (i.name || '').toLowerCase().includes(q) ||
        (i.brand || '').toLowerCase().includes(q) ||
        (i.color || '').toLowerCase().includes(q) ||
        (i.category || '').toLowerCase().includes(q)
      );
    }

    // Apply Sorting
    switch (sort) {
      case 'wears_desc':
        items.sort((a, b) => (Number(b.wears_count) || 0) - (Number(a.wears_count) || 0));
        break;
      case 'wears_asc':
        items.sort((a, b) => (Number(a.wears_count) || 0) - (Number(b.wears_count) || 0));
        break;
      case 'price_desc':
        items.sort((a, b) => (Number(b.purchase_price) || 0) - (Number(a.purchase_price) || 0));
        break;
      case 'price_asc':
        items.sort((a, b) => (Number(a.purchase_price) || 0) - (Number(b.purchase_price) || 0));
        break;
      case 'name_asc':
        items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'newest':
      default:
        items.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
    }

    // Decorate items with calculated cost per wear
    const decorated = items.map(item => ({
      ...item,
      cpw: calculateCostPerWear(item.purchase_price, item.wears_count)
    }));

    return res.status(200).json({
      success: true,
      count: decorated.length,
      data: decorated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Single Wardrobe Item by ID (with Ownership Check)
 */
export async function getWardrobeItemById(req, res, next) {
  try {
    const userId = req.user.id;
    const itemId = parseInt(req.params.id, 10);

    let item = null;
    let wearLogs = [];

    if (memoryStore.wardrobe_items) {
      item = memoryStore.wardrobe_items.find(i => i.id === itemId);
      if (item && item.user_id !== userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to this wardrobe item.' });
      }
      if (item) {
        wearLogs = (memoryStore.wardrobe_wear_logs || []).filter(w => w.wardrobe_item_id === itemId);
      }
    } else {
      const rows = await query('SELECT * FROM wardrobe_items WHERE id = ?', [itemId]);
      if (rows && rows.length > 0) {
        item = rows[0];
        if (item.user_id !== userId) {
          return res.status(403).json({ success: false, message: 'Unauthorized access to this wardrobe item.' });
        }
        wearLogs = await query('SELECT * FROM wardrobe_wear_logs WHERE wardrobe_item_id = ? ORDER BY worn_date DESC', [itemId]);
      }
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Wardrobe item not found.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...item,
        cpw: calculateCostPerWear(item.purchase_price, item.wears_count),
        wear_history: wearLogs
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create New Wardrobe Item
 */
export async function createWardrobeItem(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      name,
      category,
      color,
      style = 'minimalist',
      occasion = 'casual',
      size = 'M',
      brand = null,
      purchase_price = null,
      image_url = null
    } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Item name is required.' });
    }

    const normCategory = (category || '').toLowerCase();
    if (!VALID_CATEGORIES.includes(normCategory)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}.`
      });
    }

    if (!color || typeof color !== 'string') {
      return res.status(400).json({ success: false, message: 'Color is required.' });
    }

    const parsedPrice = purchase_price !== null && purchase_price !== '' && !isNaN(purchase_price)
      ? parseFloat(purchase_price)
      : null;

    const newItem = {
      user_id: userId,
      name: name.trim(),
      category: normCategory,
      color: color.trim(),
      style: style ? style.trim() : 'minimalist',
      occasion: occasion ? occasion.trim() : 'casual',
      size: size ? size.trim() : 'M',
      brand: brand ? brand.trim() : null,
      purchase_price: parsedPrice,
      wears_count: 0,
      is_favorite: false,
      image_url: image_url ? image_url.trim() : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80',
      created_at: new Date(),
      updated_at: new Date()
    };

    if (memoryStore.wardrobe_items) {
      newItem.id = memoryStore.nextId.wardrobe_items++;
      memoryStore.wardrobe_items.push(newItem);
    } else {
      const result = await query(
        `INSERT INTO wardrobe_items (user_id, name, category, color, style, occasion, size, brand, purchase_price, wears_count, is_favorite, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, FALSE, ?)`,
        [
          newItem.user_id,
          newItem.name,
          newItem.category,
          newItem.color,
          newItem.style,
          newItem.occasion,
          newItem.size,
          newItem.brand,
          newItem.purchase_price,
          newItem.image_url
        ]
      );
      newItem.id = result.insertId;
    }

    return res.status(201).json({
      success: true,
      message: 'Wardrobe item created successfully.',
      data: {
        ...newItem,
        cpw: calculateCostPerWear(newItem.purchase_price, newItem.wears_count)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update Existing Wardrobe Item (with Ownership Check)
 */
export async function updateWardrobeItem(req, res, next) {
  try {
    const userId = req.user.id;
    const itemId = parseInt(req.params.id, 10);
    const {
      name,
      category,
      color,
      style,
      occasion,
      size,
      brand,
      purchase_price,
      wears_count,
      image_url
    } = req.body;

    if (category && !VALID_CATEGORIES.includes(category.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}.`
      });
    }

    let existing = null;
    if (memoryStore.wardrobe_items) {
      existing = memoryStore.wardrobe_items.find(i => i.id === itemId);
      if (existing && existing.user_id !== userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to modify this wardrobe item.' });
      }
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Wardrobe item not found.' });
      }

      if (name !== undefined) existing.name = name.trim();
      if (category !== undefined) existing.category = category.toLowerCase();
      if (color !== undefined) existing.color = color.trim();
      if (style !== undefined) existing.style = style.trim();
      if (occasion !== undefined) existing.occasion = occasion.trim();
      if (size !== undefined) existing.size = size.trim();
      if (brand !== undefined) existing.brand = brand ? brand.trim() : null;
      if (purchase_price !== undefined) {
        existing.purchase_price = purchase_price !== null && purchase_price !== '' ? parseFloat(purchase_price) : null;
      }
      if (wears_count !== undefined && wears_count !== null && !isNaN(wears_count)) {
        existing.wears_count = Math.max(0, parseInt(wears_count, 10));
      }
      if (image_url !== undefined) existing.image_url = image_url;
      existing.updated_at = new Date();

      return res.status(200).json({
        success: true,
        message: 'Wardrobe item updated successfully.',
        data: {
          ...existing,
          cpw: calculateCostPerWear(existing.purchase_price, existing.wears_count)
        }
      });
    }

    const rows = await query('SELECT * FROM wardrobe_items WHERE id = ?', [itemId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Wardrobe item not found.' });
    }
    if (rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this wardrobe item.' });
    }

    const updatedPrice = purchase_price !== undefined
      ? (purchase_price !== null && purchase_price !== '' ? parseFloat(purchase_price) : null)
      : rows[0].purchase_price;

    const updatedWears = wears_count !== undefined && wears_count !== null && !isNaN(wears_count)
      ? Math.max(0, parseInt(wears_count, 10))
      : rows[0].wears_count;

    await query(
      `UPDATE wardrobe_items SET
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        color = COALESCE(?, color),
        style = COALESCE(?, style),
        occasion = COALESCE(?, occasion),
        size = COALESCE(?, size),
        brand = ?,
        purchase_price = ?,
        wears_count = ?,
        image_url = COALESCE(?, image_url)
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        category ? category.toLowerCase() : null,
        color ? color.trim() : null,
        style ? style.trim() : null,
        occasion ? occasion.trim() : null,
        size ? size.trim() : null,
        brand ? brand.trim() : (brand === null ? null : rows[0].brand),
        updatedPrice,
        updatedWears,
        image_url || null,
        itemId
      ]
    );

    const [updatedRow] = await query('SELECT * FROM wardrobe_items WHERE id = ?', [itemId]);
    return res.status(200).json({
      success: true,
      message: 'Wardrobe item updated successfully.',
      data: {
        ...updatedRow,
        cpw: calculateCostPerWear(updatedRow.purchase_price, updatedRow.wears_count)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete Wardrobe Item (with Ownership Check)
 */
export async function deleteWardrobeItem(req, res, next) {
  try {
    const userId = req.user.id;
    const itemId = parseInt(req.params.id, 10);

    if (memoryStore.wardrobe_items) {
      const idx = memoryStore.wardrobe_items.findIndex(i => i.id === itemId);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Wardrobe item not found.' });
      }
      if (memoryStore.wardrobe_items[idx].user_id !== userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to delete this wardrobe item.' });
      }

      memoryStore.wardrobe_items.splice(idx, 1);
      // Remove wear logs
      memoryStore.wardrobe_wear_logs = memoryStore.wardrobe_wear_logs.filter(w => w.wardrobe_item_id !== itemId);

      return res.status(200).json({
        success: true,
        message: 'Wardrobe item deleted successfully.'
      });
    }

    const rows = await query('SELECT user_id FROM wardrobe_items WHERE id = ?', [itemId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Wardrobe item not found.' });
    }
    if (rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this wardrobe item.' });
    }

    await query('DELETE FROM wardrobe_items WHERE id = ?', [itemId]);
    return res.status(200).json({
      success: true,
      message: 'Wardrobe item deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Record Item Wear (+1 Wear count and creates wear log)
 */
export async function recordItemWear(req, res, next) {
  try {
    const userId = req.user.id;
    const itemId = parseInt(req.params.id, 10);
    const { occasion_worn = null, notes = null, worn_date = new Date().toISOString().split('T')[0] } = req.body;

    let item = null;
    if (memoryStore.wardrobe_items) {
      item = memoryStore.wardrobe_items.find(i => i.id === itemId);
      if (!item) return res.status(404).json({ success: false, message: 'Wardrobe item not found.' });
      if (item.user_id !== userId) return res.status(403).json({ success: false, message: 'Unauthorized.' });

      item.wears_count = (Number(item.wears_count) || 0) + 1;
      item.updated_at = new Date();

      const wearLog = {
        id: memoryStore.nextId.wardrobe_wear_logs++,
        wardrobe_item_id: itemId,
        user_id: userId,
        worn_date,
        occasion_worn: occasion_worn || item.occasion,
        notes,
        created_at: new Date()
      };
      memoryStore.wardrobe_wear_logs.push(wearLog);

      return res.status(200).json({
        success: true,
        message: `Wear recorded. Item worn ${item.wears_count} times.`,
        data: {
          item: {
            ...item,
            cpw: calculateCostPerWear(item.purchase_price, item.wears_count)
          },
          wearLog
        }
      });
    }

    const rows = await query('SELECT * FROM wardrobe_items WHERE id = ?', [itemId]);
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Wardrobe item not found.' });
    if (rows[0].user_id !== userId) return res.status(403).json({ success: false, message: 'Unauthorized.' });

    await query('UPDATE wardrobe_items SET wears_count = wears_count + 1 WHERE id = ?', [itemId]);
    await query(
      'INSERT INTO wardrobe_wear_logs (wardrobe_item_id, user_id, worn_date, occasion_worn, notes) VALUES (?, ?, ?, ?, ?)',
      [itemId, userId, worn_date, occasion_worn || rows[0].occasion, notes]
    );

    const [updatedRow] = await query('SELECT * FROM wardrobe_items WHERE id = ?', [itemId]);

    return res.status(200).json({
      success: true,
      message: `Wear recorded. Item worn ${updatedRow.wears_count} times.`,
      data: {
        item: {
          ...updatedRow,
          cpw: calculateCostPerWear(updatedRow.purchase_price, updatedRow.wears_count)
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle Favorite Status
 */
export async function toggleFavoriteItem(req, res, next) {
  try {
    const userId = req.user.id;
    const itemId = parseInt(req.params.id, 10);

    if (memoryStore.wardrobe_items) {
      const item = memoryStore.wardrobe_items.find(i => i.id === itemId);
      if (!item) return res.status(404).json({ success: false, message: 'Wardrobe item not found.' });
      if (item.user_id !== userId) return res.status(403).json({ success: false, message: 'Unauthorized.' });

      item.is_favorite = !item.is_favorite;
      item.updated_at = new Date();

      return res.status(200).json({
        success: true,
        message: item.is_favorite ? 'Item added to favorites.' : 'Item removed from favorites.',
        data: item
      });
    }

    const rows = await query('SELECT * FROM wardrobe_items WHERE id = ?', [itemId]);
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Wardrobe item not found.' });
    if (rows[0].user_id !== userId) return res.status(403).json({ success: false, message: 'Unauthorized.' });

    const newFav = !rows[0].is_favorite;
    await query('UPDATE wardrobe_items SET is_favorite = ? WHERE id = ?', [newFav, itemId]);

    return res.status(200).json({
      success: true,
      message: newFav ? 'Item added to favorites.' : 'Item removed from favorites.',
      data: { ...rows[0], is_favorite: newFav }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle Secure Image Upload
 */
export async function handleWardrobeUpload(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided or file format was rejected.'
      });
    }

    // Relative public URL
    const imageUrl = `/uploads/wardrobe/${req.file.filename}`;
    return res.status(200).json({
      success: true,
      message: 'Wardrobe image uploaded safely.',
      imageUrl
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Wardrobe Usage Analytics and Cost-Per-Wear Summary
 */
export async function getWardrobeAnalytics(req, res, next) {
  try {
    const userId = req.user.id;
    let items = [];
    let wearLogs = [];
    let userProfile = null;
    let savedOutfitsCount = 0;

    if (memoryStore.wardrobe_items) {
      items = memoryStore.wardrobe_items.filter(i => i.user_id === userId);
      wearLogs = (memoryStore.wardrobe_wear_logs || []).filter(w => w.user_id === userId);
      userProfile = (memoryStore.user_style_profiles || []).find(p => p.user_id === userId) ||
                    (memoryStore.user_preferences || []).find(p => p.user_id === userId) || null;
      savedOutfitsCount = (memoryStore.saved_outfits || []).filter(o => o.user_id === userId).length;
    } else {
      items = await query('SELECT * FROM wardrobe_items WHERE user_id = ?', [userId]);
      wearLogs = await query('SELECT * FROM wardrobe_wear_logs WHERE user_id = ? ORDER BY worn_date ASC', [userId]);
      const profRows = await query('SELECT * FROM user_style_profiles WHERE user_id = ?', [userId]);
      if (profRows && profRows.length > 0) {
        userProfile = profRows[0];
      } else {
        const prefRows = await query('SELECT * FROM user_preferences WHERE user_id = ?', [userId]);
        userProfile = prefRows && prefRows.length > 0 ? prefRows[0] : null;
      }
      const outfitRows = await query('SELECT COUNT(*) as cnt FROM saved_outfits WHERE user_id = ?', [userId]);
      savedOutfitsCount = outfitRows && outfitRows.length > 0 ? outfitRows[0].cnt : 0;
    }

    const analytics = generateWardrobeAnalytics(items, wearLogs, userProfile, savedOutfitsCount);
    return res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Wardrobe Gap Finder Suggestions
 */
export async function getWardrobeGaps(req, res, next) {
  try {
    const userId = req.user.id;
    let items = [];
    let dismissedKeys = [];

    if (memoryStore.wardrobe_items) {
      items = memoryStore.wardrobe_items.filter(i => i.user_id === userId);
      dismissedKeys = (memoryStore.dismissed_gap_suggestions || [])
        .filter(d => d.user_id === userId)
        .map(d => d.gap_key);
    } else {
      items = await query('SELECT * FROM wardrobe_items WHERE user_id = ?', [userId]);
      const rows = await query('SELECT gap_key FROM dismissed_gap_suggestions WHERE user_id = ?', [userId]);
      dismissedKeys = rows.map(r => r.gap_key);
    }

    const gaps = identifyWardrobeGaps(items, {}, dismissedKeys);
    return res.status(200).json({
      success: true,
      count: gaps.length,
      data: gaps
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Dismiss a Wardrobe Gap Suggestion
 */
export async function dismissWardrobeGap(req, res, next) {
  try {
    const userId = req.user.id;
    const { gap_key } = req.body;

    if (!gap_key) {
      return res.status(400).json({ success: false, message: 'gap_key is required.' });
    }

    if (memoryStore.dismissed_gap_suggestions) {
      const exists = memoryStore.dismissed_gap_suggestions.some(
        d => d.user_id === userId && d.gap_key === gap_key
      );
      if (!exists) {
        memoryStore.dismissed_gap_suggestions.push({
          id: memoryStore.nextId.dismissed_gap_suggestions++,
          user_id: userId,
          gap_key,
          created_at: new Date()
        });
      }
    } else {
      await query(
        'INSERT IGNORE INTO dismissed_gap_suggestions (user_id, gap_key) VALUES (?, ?)',
        [userId, gap_key]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Suggestion dismissed.'
    });
  } catch (error) {
    next(error);
  }
}
