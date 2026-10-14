import { query, memoryStore } from '../config/db.js';
import { recommendProducts } from '../services/recommendationService.js';

/**
 * Fetch eligible products from database/memory store
 */
async function getCatalogProducts() {
  if (memoryStore.products && memoryStore.products.length > 0) {
    return memoryStore.products.map(p => {
      const cat = memoryStore.categories.find(c => c.id === p.category_id);
      const variants = memoryStore.product_variants.filter(v => v.product_id === p.id);
      return {
        ...p,
        category_name: cat ? cat.name : 'Fashion',
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
 * Handle Style Studio recommendation requests
 */
export async function getRecommendations(req, res, next) {
  try {
    const {
      occasion,
      style,
      preferred_colors = [],
      preferred_size,
      budget_min = 0,
      budget_max,
      category,
      limit = 12
    } = req.body;

    const preferences = {
      occasion,
      style,
      preferred_colors: Array.isArray(preferred_colors) ? preferred_colors : [preferred_colors].filter(Boolean),
      preferred_size,
      budget_min: parseFloat(budget_min) || 0,
      budget_max: budget_max ? parseFloat(budget_max) : null,
      category
    };

    const catalog = await getCatalogProducts();
    const rankedProducts = recommendProducts(catalog, preferences, { limit: parseInt(limit, 10) || 12 });

    // If user is authenticated, persist preferences
    if (req.user && req.user.id) {
      const userId = req.user.id;
      const prefRecord = {
        user_id: userId,
        preferred_style: style || 'minimalist',
        preferred_colors: JSON.stringify(preferences.preferred_colors),
        preferred_size: preferred_size || 'M',
        budget_min: preferences.budget_min,
        budget_max: preferences.budget_max || 500,
        preferred_occasion: occasion || 'casual',
      };

      if (memoryStore.user_preferences) {
        const existingIdx = memoryStore.user_preferences.findIndex(p => p.user_id === userId);
        if (existingIdx >= 0) {
          memoryStore.user_preferences[existingIdx] = {
            ...memoryStore.user_preferences[existingIdx],
            ...prefRecord,
            preferred_colors: preferences.preferred_colors,
            updated_at: new Date()
          };
        } else {
          memoryStore.user_preferences.push({
            id: memoryStore.nextId.user_preferences++,
            ...prefRecord,
            preferred_colors: preferences.preferred_colors,
            updated_at: new Date()
          });
        }
      } else {
        await query(
          `INSERT INTO user_preferences (user_id, preferred_style, preferred_colors, preferred_size, budget_min, budget_max, preferred_occasion)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             preferred_style = VALUES(preferred_style),
             preferred_colors = VALUES(preferred_colors),
             preferred_size = VALUES(preferred_size),
             budget_min = VALUES(budget_min),
             budget_max = VALUES(budget_max),
             preferred_occasion = VALUES(preferred_occasion)`,
          [
            userId,
            prefRecord.preferred_style,
            prefRecord.preferred_colors,
            prefRecord.preferred_size,
            prefRecord.budget_min,
            prefRecord.budget_max,
            prefRecord.preferred_occasion
          ]
        );
      }
    }

    return res.status(200).json({
      success: true,
      data: rankedProducts,
      meta: {
        totalFound: rankedProducts.length,
        scoringEngine: 'StyleSense Deterministic Rule-Based AI Engine v1.0',
        rubric: {
          occasion: '30 points',
          style: '25 points',
          color: '20 points',
          budget: '15 points (full or partial)',
          category: '10 points'
        },
        appliedPreferences: preferences
      }
    });
  } catch (error) {
    next(error);
  }
}
