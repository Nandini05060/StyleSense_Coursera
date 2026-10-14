import { query, memoryStore } from '../config/db.js';
import { buildOutfitSuggestion, getSlotReplacements, evaluateOutfitCompatibility } from '../services/outfitService.js';

async function getAvailableProducts() {
  if (memoryStore.products) {
    return memoryStore.products.map(p => {
      const cat = memoryStore.categories.find(c => c.id === p.category_id);
      const variants = memoryStore.product_variants.filter(v => v.product_id === p.id);
      return {
        ...p,
        category_slug: cat ? cat.slug : 'tops',
        variants,
        total_stock: variants.reduce((s, v) => s + (v.stock_quantity || 0), 0)
      };
    });
  }

  const prods = await query(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.active = 1
  `);
  const variants = await query('SELECT * FROM product_variants');

  return prods.map(p => ({
    ...p,
    style_tags: typeof p.style_tags === 'string' ? JSON.parse(p.style_tags) : p.style_tags,
    occasion_tags: typeof p.occasion_tags === 'string' ? JSON.parse(p.occasion_tags) : p.occasion_tags,
    colors: typeof p.colors === 'string' ? JSON.parse(p.colors) : p.colors,
    variants: variants.filter(v => v.product_id === p.id),
    total_stock: variants.filter(v => v.product_id === p.id).reduce((s, v) => s + v.stock_quantity, 0)
  }));
}

/**
 * Generate coordinated outfit
 */
export async function generateOutfit(req, res, next) {
  try {
    const {
      style = 'minimalist',
      occasion = 'casual',
      budget_max = 350,
      preferred_colors = ['ivory', 'charcoal', 'beige'],
      useDress = false,
    } = req.body;

    const products = await getAvailableProducts();
    const outfit = buildOutfitSuggestion(products, {
      style,
      occasion,
      budget_max: parseFloat(budget_max) || 350,
      preferred_colors,
      useDress: Boolean(useDress)
    });

    return res.status(200).json({
      success: true,
      data: outfit
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get replacements for an individual slot in outfit builder
 */
export async function replaceSlot(req, res, next) {
  try {
    const { slotName, style, occasion } = req.body;
    if (!slotName) {
      return res.status(400).json({ success: false, message: 'Slot name is required.' });
    }

    const products = await getAvailableProducts();
    const replacements = getSlotReplacements(products, slotName, { style, occasion });

    return res.status(200).json({
      success: true,
      data: replacements
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Evaluate deterministic compatibility for custom mix & match outfit
 */
export async function evaluateOutfit(req, res, next) {
  try {
    const { items = [], targetOccasion, targetStyle } = req.body;
    const result = evaluateOutfitCompatibility(items, { targetOccasion, targetStyle });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
