/**
 * StyleSense AI — Lookbook & Capsule Builder Controller
 * Curated digital lookbooks with public shareable tokens and editorial export
 */

import crypto from 'crypto';
import { query, memoryStore } from '../config/db.js';

/**
 * Helper to populate outfit item details (wardrobe item or store product)
 */
function populateOutfitDetails(outfitId) {
  let outfit = null;
  let items = [];

  if (memoryStore.saved_outfits) {
    outfit = memoryStore.saved_outfits.find(o => o.id === outfitId);
    if (!outfit) return null;

    const outfitItems = memoryStore.saved_outfit_items.filter(oi => oi.outfit_id === outfitId);
    items = outfitItems.map(item => {
      let resolvedItem = null;
      if (item.item_type === 'wardrobe' && item.wardrobe_item_id) {
        resolvedItem = memoryStore.wardrobe_items.find(w => w.id === item.wardrobe_item_id);
      } else if (item.product_id) {
        resolvedItem = memoryStore.products.find(p => p.id === item.product_id);
      }

      return {
        id: item.id,
        slot_name: item.slot_name,
        item_type: item.item_type,
        name: resolvedItem?.name || 'Garment',
        brand: resolvedItem?.brand || 'Luxury Label',
        image_url: resolvedItem?.image_url || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80',
        price: resolvedItem?.purchase_price || resolvedItem?.price || 0,
        color: resolvedItem?.color || 'Neutral',
        category: resolvedItem?.category || item.slot_name,
      };
    });
  }

  return {
    ...outfit,
    items
  };
}

/**
 * GET /api/lookbooks
 * List all lookbooks for authenticated user
 */
export async function getUserLookbooks(req, res, next) {
  try {
    const userId = req.user.id;
    let list = [];

    if (memoryStore.lookbooks) {
      const userLbs = memoryStore.lookbooks.filter(lb => lb.user_id === userId);
      list = userLbs.map(lb => {
        const lbOutfits = memoryStore.lookbook_outfits.filter(lbo => lbo.lookbook_id === lb.id);
        const outfitSummaries = lbOutfits.map(lbo => populateOutfitDetails(lbo.outfit_id)).filter(Boolean);
        const previewImages = outfitSummaries
          .flatMap(o => o.items.map(i => i.image_url))
          .filter(Boolean)
          .slice(0, 4);

        return {
          ...lb,
          outfit_count: lbOutfits.length,
          preview_images: previewImages,
          outfits: outfitSummaries
        };
      });
    } else {
      const rows = await query(
        `SELECT l.*, COUNT(lo.id) as outfit_count
         FROM lookbooks l
         LEFT JOIN lookbook_outfits lo ON l.id = lo.lookbook_id
         WHERE l.user_id = ?
         GROUP BY l.id
         ORDER BY l.updated_at DESC`,
        [userId]
      );
      list = rows;
    }

    return res.status(200).json({
      success: true,
      data: list
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/lookbooks/:id
 * Retrieve specific lookbook by ID
 */
export async function getLookbookById(req, res, next) {
  try {
    const userId = req.user.id;
    const lookbookId = parseInt(req.params.id, 10);

    let lookbook = null;

    if (memoryStore.lookbooks) {
      const found = memoryStore.lookbooks.find(lb => lb.id === lookbookId && lb.user_id === userId);
      if (!found) {
        return res.status(404).json({ success: false, message: 'Lookbook not found.' });
      }

      const lbOutfits = memoryStore.lookbook_outfits
        .filter(lbo => lbo.lookbook_id === found.id)
        .sort((a, b) => a.position - b.position);

      const populatedOutfits = lbOutfits.map(lbo => {
        const outfitData = populateOutfitDetails(lbo.outfit_id);
        return {
          ...outfitData,
          curator_note: lbo.curator_note,
          position: lbo.position
        };
      }).filter(Boolean);

      lookbook = {
        ...found,
        outfit_count: populatedOutfits.length,
        outfits: populatedOutfits
      };
    } else {
      const rows = await query('SELECT * FROM lookbooks WHERE id = ? AND user_id = ?', [lookbookId, userId]);
      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Lookbook not found.' });
      }
      lookbook = rows[0];
    }

    return res.status(200).json({
      success: true,
      data: lookbook
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/lookbooks
 * Create new lookbook
 */
export async function createLookbook(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      title,
      description = '',
      theme = 'Contemporary Minimalist',
      cover_image_url = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=80',
      is_public = true,
      outfit_ids = []
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Lookbook title is required.' });
    }

    const shareToken = `lb-${crypto.randomBytes(6).toString('hex')}`;

    if (memoryStore.lookbooks) {
      const newLookbook = {
        id: memoryStore.nextId.lookbooks++,
        user_id: userId,
        title: title.trim(),
        description: description ? description.trim() : '',
        theme,
        cover_image_url,
        is_public: Boolean(is_public),
        share_token: shareToken,
        created_at: new Date(),
        updated_at: new Date()
      };
      memoryStore.lookbooks.push(newLookbook);

      // Attach outfits
      if (Array.isArray(outfit_ids) && outfit_ids.length > 0) {
        outfit_ids.forEach((ofId, index) => {
          memoryStore.lookbook_outfits.push({
            id: memoryStore.nextId.lookbook_outfits++,
            lookbook_id: newLookbook.id,
            outfit_id: parseInt(ofId, 10),
            position: index,
            curator_note: '',
            created_at: new Date()
          });
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Lookbook created successfully.',
        data: {
          ...newLookbook,
          outfit_count: outfit_ids.length
        }
      });
    }

    const result = await query(
      `INSERT INTO lookbooks (user_id, title, description, theme, cover_image_url, is_public, share_token)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, title.trim(), description.trim(), theme, cover_image_url, Boolean(is_public), shareToken]
    );

    const insertedId = result.insertId;

    if (Array.isArray(outfit_ids) && outfit_ids.length > 0) {
      for (let i = 0; i < outfit_ids.length; i++) {
        await query(
          `INSERT INTO lookbook_outfits (lookbook_id, outfit_id, position) VALUES (?, ?, ?)`,
          [insertedId, parseInt(outfit_ids[i], 10), i]
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Lookbook created successfully.',
      data: {
        id: insertedId,
        user_id: userId,
        title,
        share_token: shareToken,
        outfit_count: outfit_ids.length
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/lookbooks/:id
 * Update lookbook details and outfits
 */
export async function updateLookbook(req, res, next) {
  try {
    const userId = req.user.id;
    const lookbookId = parseInt(req.params.id, 10);
    const {
      title,
      description,
      theme,
      cover_image_url,
      is_public,
      outfit_ids
    } = req.body;

    if (memoryStore.lookbooks) {
      const idx = memoryStore.lookbooks.findIndex(lb => lb.id === lookbookId && lb.user_id === userId);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Lookbook not found.' });
      }

      const current = memoryStore.lookbooks[idx];
      const updated = {
        ...current,
        title: title !== undefined ? title.trim() : current.title,
        description: description !== undefined ? description.trim() : current.description,
        theme: theme !== undefined ? theme : current.theme,
        cover_image_url: cover_image_url !== undefined ? cover_image_url : current.cover_image_url,
        is_public: is_public !== undefined ? Boolean(is_public) : current.is_public,
        updated_at: new Date()
      };
      memoryStore.lookbooks[idx] = updated;

      // Update outfit associations if provided
      if (Array.isArray(outfit_ids)) {
        memoryStore.lookbook_outfits = memoryStore.lookbook_outfits.filter(lbo => lbo.lookbook_id !== lookbookId);
        outfit_ids.forEach((ofId, index) => {
          memoryStore.lookbook_outfits.push({
            id: memoryStore.nextId.lookbook_outfits++,
            lookbook_id: lookbookId,
            outfit_id: parseInt(ofId, 10),
            position: index,
            curator_note: '',
            created_at: new Date()
          });
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Lookbook updated successfully.',
        data: updated
      });
    }

    await query(
      `UPDATE lookbooks
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           theme = COALESCE(?, theme),
           cover_image_url = COALESCE(?, cover_image_url),
           is_public = COALESCE(?, is_public)
       WHERE id = ? AND user_id = ?`,
      [title, description, theme, cover_image_url, is_public !== undefined ? Boolean(is_public) : null, lookbookId, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Lookbook updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/lookbooks/:id
 */
export async function deleteLookbook(req, res, next) {
  try {
    const userId = req.user.id;
    const lookbookId = parseInt(req.params.id, 10);

    if (memoryStore.lookbooks) {
      const idx = memoryStore.lookbooks.findIndex(lb => lb.id === lookbookId && lb.user_id === userId);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Lookbook not found.' });
      }
      memoryStore.lookbooks.splice(idx, 1);
      memoryStore.lookbook_outfits = memoryStore.lookbook_outfits.filter(lbo => lbo.lookbook_id !== lookbookId);

      return res.status(200).json({
        success: true,
        message: 'Lookbook deleted successfully.'
      });
    }

    await query('DELETE FROM lookbooks WHERE id = ? AND user_id = ?', [lookbookId, userId]);
    return res.status(200).json({
      success: true,
      message: 'Lookbook deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/lookbooks/:id/outfits
 */
export async function addOutfitToLookbook(req, res, next) {
  try {
    const userId = req.user.id;
    const lookbookId = parseInt(req.params.id, 10);
    const { outfit_id, curator_note = '' } = req.body;

    if (!outfit_id) {
      return res.status(400).json({ success: false, message: 'Outfit ID is required.' });
    }

    if (memoryStore.lookbooks) {
      const lb = memoryStore.lookbooks.find(l => l.id === lookbookId && l.user_id === userId);
      if (!lb) return res.status(404).json({ success: false, message: 'Lookbook not found.' });

      const exists = memoryStore.lookbook_outfits.some(lbo => lbo.lookbook_id === lookbookId && lbo.outfit_id === parseInt(outfit_id, 10));
      if (!exists) {
        memoryStore.lookbook_outfits.push({
          id: memoryStore.nextId.lookbook_outfits++,
          lookbook_id: lookbookId,
          outfit_id: parseInt(outfit_id, 10),
          position: memoryStore.lookbook_outfits.filter(l => l.lookbook_id === lookbookId).length,
          curator_note,
          created_at: new Date()
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Outfit added to lookbook.'
      });
    }

    await query(
      `INSERT INTO lookbook_outfits (lookbook_id, outfit_id, curator_note) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE curator_note = VALUES(curator_note)`,
      [lookbookId, parseInt(outfit_id, 10), curator_note]
    );

    return res.status(200).json({
      success: true,
      message: 'Outfit added to lookbook.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/lookbooks/:id/outfits/:outfitId
 */
export async function removeOutfitFromLookbook(req, res, next) {
  try {
    const userId = req.user.id;
    const lookbookId = parseInt(req.params.id, 10);
    const outfitId = parseInt(req.params.outfitId, 10);

    if (memoryStore.lookbooks) {
      const lb = memoryStore.lookbooks.find(l => l.id === lookbookId && l.user_id === userId);
      if (!lb) return res.status(404).json({ success: false, message: 'Lookbook not found.' });

      memoryStore.lookbook_outfits = memoryStore.lookbook_outfits.filter(
        lbo => !(lbo.lookbook_id === lookbookId && lbo.outfit_id === outfitId)
      );

      return res.status(200).json({
        success: true,
        message: 'Outfit removed from lookbook.'
      });
    }

    await query('DELETE FROM lookbook_outfits WHERE lookbook_id = ? AND outfit_id = ?', [lookbookId, outfitId]);

    return res.status(200).json({
      success: true,
      message: 'Outfit removed from lookbook.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/lookbooks/shared/:token
 * Public unauthenticated read-only endpoint for shared lookbooks
 */
export async function getSharedLookbook(req, res, next) {
  try {
    const { token } = req.params;

    let lookbook = null;
    let creator = null;

    if (memoryStore.lookbooks) {
      const found = memoryStore.lookbooks.find(lb => lb.share_token === token);
      if (!found) {
        return res.status(404).json({
          success: false,
          message: 'This lookbook does not exist or has been removed.'
        });
      }

      if (!found.is_public) {
        return res.status(403).json({
          success: false,
          message: 'This lookbook is private.'
        });
      }

      creator = memoryStore.users.find(u => u.id === found.user_id);

      const lbOutfits = memoryStore.lookbook_outfits
        .filter(lbo => lbo.lookbook_id === found.id)
        .sort((a, b) => a.position - b.position);

      const populatedOutfits = lbOutfits.map(lbo => {
        const outfitData = populateOutfitDetails(lbo.outfit_id);
        return {
          ...outfitData,
          curator_note: lbo.curator_note,
          position: lbo.position
        };
      }).filter(Boolean);

      lookbook = {
        ...found,
        curator_name: creator ? creator.name : 'StyleSense Stylist',
        outfit_count: populatedOutfits.length,
        outfits: populatedOutfits
      };
    } else {
      const rows = await query(
        `SELECT l.*, u.name as curator_name
         FROM lookbooks l
         JOIN users u ON l.user_id = u.id
         WHERE l.share_token = ?`,
        [token]
      );

      if (!rows || rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'This lookbook does not exist or has been removed.'
        });
      }

      lookbook = rows[0];
      if (!lookbook.is_public) {
        return res.status(403).json({
          success: false,
          message: 'This lookbook is private.'
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: lookbook
    });
  } catch (error) {
    next(error);
  }
}
