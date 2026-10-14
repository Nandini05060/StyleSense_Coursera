import { query, memoryStore } from '../config/db.js';
import { generateOutfitPlan, OCCASION_TEMPLATES } from '../services/plannerService.js';

/**
 * Generate Occasion Outfit Plan
 */
export async function generateOutfit(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      occasion = 'casual',
      preferred_aesthetic = 'minimalist',
      preferred_colors = ['ivory', 'charcoal'],
      budget = 250,
      mode = 'wardrobe_only' // 'wardrobe_only' | 'wardrobe_and_store'
    } = req.body;

    // Fetch user's wardrobe
    let wardrobeItems = [];
    if (memoryStore.wardrobe_items) {
      wardrobeItems = memoryStore.wardrobe_items.filter(i => i.user_id === userId);
    } else {
      wardrobeItems = await query('SELECT * FROM wardrobe_items WHERE user_id = ?', [userId]);
    }

    // Fetch store products if needed
    let storeProducts = [];
    if (mode === 'wardrobe_and_store') {
      if (memoryStore.products) {
        storeProducts = memoryStore.products.filter(p => p.active).map(p => ({
          ...p,
          variants: (memoryStore.product_variants || []).filter(v => v.product_id === p.id)
        }));
      } else {
        const prods = await query('SELECT * FROM products WHERE active = TRUE');
        const variants = await query('SELECT * FROM product_variants WHERE stock_quantity > 0');
        storeProducts = prods.map(p => ({
          ...p,
          variants: variants.filter(v => v.product_id === p.id)
        }));
      }
    }

    const plan = generateOutfitPlan({
      occasion,
      preferredAesthetic: preferred_aesthetic,
      preferredColors: Array.isArray(preferred_colors) ? preferred_colors : [preferred_colors].filter(Boolean),
      budget: parseFloat(budget) || 250,
      mode,
      wardrobeItems,
      storeProducts
    });

    return res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Save Generated or Custom Outfit
 */
export async function saveOutfit(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      name,
      occasion = 'casual',
      notes = null,
      items = [] // array of { slot_name, item_type: 'wardrobe'|'store_product', wardrobe_item_id, product_id, variant_id }
    } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Outfit name is required.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Outfit must contain at least one item.' });
    }

    const outfitRecord = {
      user_id: userId,
      name: name.trim(),
      occasion: occasion.trim(),
      notes: notes ? notes.trim() : null,
      created_at: new Date(),
      updated_at: new Date()
    };

    if (memoryStore.saved_outfits) {
      outfitRecord.id = memoryStore.nextId.saved_outfits++;
      memoryStore.saved_outfits.push(outfitRecord);

      const savedItems = items.map(item => {
        const itemRec = {
          id: memoryStore.nextId.saved_outfit_items++,
          outfit_id: outfitRecord.id,
          slot_name: item.slot_name || item.slot || 'item',
          item_type: item.item_type || (item.isOwned ? 'wardrobe' : 'store_product'),
          wardrobe_item_id: item.wardrobe_item_id || (item.isOwned ? item.id : null),
          product_id: item.product_id || (!item.isOwned ? item.id : null),
          variant_id: item.variant_id || null,
          created_at: new Date()
        };
        memoryStore.saved_outfit_items.push(itemRec);
        return itemRec;
      });

      return res.status(201).json({
        success: true,
        message: 'Outfit saved successfully.',
        data: {
          ...outfitRecord,
          items: savedItems
        }
      });
    }

    const result = await query(
      'INSERT INTO saved_outfits (user_id, name, occasion, notes) VALUES (?, ?, ?, ?)',
      [userId, outfitRecord.name, outfitRecord.occasion, outfitRecord.notes]
    );
    outfitRecord.id = result.insertId;

    for (const item of items) {
      await query(
        `INSERT INTO saved_outfit_items (outfit_id, slot_name, item_type, wardrobe_item_id, product_id, variant_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          outfitRecord.id,
          item.slot_name || item.slot || 'item',
          item.item_type || (item.isOwned ? 'wardrobe' : 'store_product'),
          item.wardrobe_item_id || (item.isOwned ? item.id : null),
          item.product_id || (!item.isOwned ? item.id : null),
          item.variant_id || null
        ]
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Outfit saved successfully.',
      data: outfitRecord
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List User Saved Outfits
 */
export async function getSavedOutfits(req, res, next) {
  try {
    const userId = req.user.id;

    if (memoryStore.saved_outfits) {
      const userOutfits = memoryStore.saved_outfits.filter(o => o.user_id === userId);
      const populated = userOutfits.map(outfit => {
        const outfitItems = (memoryStore.saved_outfit_items || [])
          .filter(oi => oi.outfit_id === outfit.id)
          .map(oi => {
            let itemDetails = null;
            if (oi.item_type === 'wardrobe' && oi.wardrobe_item_id) {
              const w = memoryStore.wardrobe_items.find(x => x.id === oi.wardrobe_item_id);
              if (w) itemDetails = { ...w, isOwned: true };
            } else if (oi.product_id) {
              const p = memoryStore.products.find(x => x.id === oi.product_id);
              if (p) itemDetails = { ...p, isOwned: false };
            }
            return {
              ...oi,
              item: itemDetails
            };
          });

        return {
          ...outfit,
          items: outfitItems
        };
      });

      return res.status(200).json({
        success: true,
        count: populated.length,
        data: populated
      });
    }

    const outfits = await query('SELECT * FROM saved_outfits WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    const populated = await Promise.all(
      outfits.map(async (outfit) => {
        const items = await query(
          `SELECT soi.*,
                  wi.name AS wardrobe_name, wi.image_url AS wardrobe_image, wi.category AS wardrobe_category, wi.color AS wardrobe_color, wi.purchase_price AS wardrobe_price,
                  p.name AS product_name, p.image_url AS product_image, p.price AS product_price
           FROM saved_outfit_items soi
           LEFT JOIN wardrobe_items wi ON soi.wardrobe_item_id = wi.id
           LEFT JOIN products p ON soi.product_id = p.id
           WHERE soi.outfit_id = ?`,
          [outfit.id]
        );
        return {
          ...outfit,
          items: items.map(i => ({
            id: i.id,
            slot_name: i.slot_name,
            item_type: i.item_type,
            isOwned: i.item_type === 'wardrobe',
            item: i.item_type === 'wardrobe' ? {
              id: i.wardrobe_item_id,
              name: i.wardrobe_name,
              image_url: i.wardrobe_image,
              category: i.wardrobe_category,
              color: i.wardrobe_color,
              price: i.wardrobe_price
            } : {
              id: i.product_id,
              name: i.product_name,
              image_url: i.product_image,
              price: i.product_price
            }
          }))
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: populated.length,
      data: populated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete Saved Outfit (Ownership Check)
 */
export async function deleteSavedOutfit(req, res, next) {
  try {
    const userId = req.user.id;
    const outfitId = parseInt(req.params.id, 10);

    if (memoryStore.saved_outfits) {
      const idx = memoryStore.saved_outfits.findIndex(o => o.id === outfitId);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Outfit not found.' });
      if (memoryStore.saved_outfits[idx].user_id !== userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to delete this outfit.' });
      }

      memoryStore.saved_outfits.splice(idx, 1);
      memoryStore.saved_outfit_items = (memoryStore.saved_outfit_items || []).filter(oi => oi.outfit_id !== outfitId);

      return res.status(200).json({ success: true, message: 'Outfit deleted successfully.' });
    }

    const rows = await query('SELECT user_id FROM saved_outfits WHERE id = ?', [outfitId]);
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Outfit not found.' });
    if (rows[0].user_id !== userId) return res.status(403).json({ success: false, message: 'Unauthorized.' });

    await query('DELETE FROM saved_outfits WHERE id = ?', [outfitId]);
    return res.status(200).json({ success: true, message: 'Outfit deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Available Replacement Candidates for a Slot
 */
export async function getSlotAlternatives(req, res, next) {
  try {
    const userId = req.user.id;
    const { slot, currentItemId, occasion = 'casual' } = req.body;

    const normSlot = (slot || '').toLowerCase();
    const template = OCCASION_TEMPLATES[occasion.toLowerCase()] || OCCASION_TEMPLATES.casual;
    const validCats = template.allowedCategories[normSlot] || [normSlot];

    let wardrobeAlternatives = [];
    let storeAlternatives = [];

    if (memoryStore.wardrobe_items) {
      wardrobeAlternatives = memoryStore.wardrobe_items.filter(i =>
        i.user_id === userId &&
        validCats.includes(i.category?.toLowerCase()) &&
        i.id !== Number(currentItemId)
      );
      storeAlternatives = memoryStore.products.filter(p =>
        p.active && validCats.some(vc => (p.category_slug || '').includes(vc))
      );
    } else {
      wardrobeAlternatives = await query(
        'SELECT * FROM wardrobe_items WHERE user_id = ? AND category IN (?) AND id != ?',
        [userId, validCats, Number(currentItemId) || 0]
      );
      storeAlternatives = await query(
        'SELECT * FROM products WHERE active = TRUE'
      );
      storeAlternatives = storeAlternatives.filter(p => validCats.some(vc => (p.slug || '').includes(vc)));
    }

    return res.status(200).json({
      success: true,
      data: {
        slot: normSlot,
        wardrobeAlternatives,
        storeAlternatives: storeAlternatives.slice(0, 6)
      }
    });
  } catch (error) {
    next(error);
  }
}
