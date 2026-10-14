/**
 * StyleSense AI — Fit Controller
 * Sizing charts, user fit profiles, and real-time size evaluations
 */

import { query, memoryStore } from '../config/db.js';
import {
  CATEGORY_SIZE_CHARTS,
  normalizeCategory,
  evaluateFitRecommendation
} from '../services/fitService.js';

/**
 * GET /api/fit/charts
 * GET /api/fit/charts/:category
 */
export async function getFitCharts(req, res, next) {
  try {
    const { category } = req.params;
    if (category) {
      const norm = normalizeCategory(category);
      const chart = CATEGORY_SIZE_CHARTS[norm] || CATEGORY_SIZE_CHARTS.tops;
      return res.status(200).json({
        success: true,
        data: {
          category: norm,
          chart
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: CATEGORY_SIZE_CHARTS
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/fit/preferences
 */
export async function getFitPreferences(req, res, next) {
  try {
    const userId = req.user?.id;
    let profile = null;

    if (userId) {
      if (memoryStore.user_fit_profiles) {
        profile = memoryStore.user_fit_profiles.find(p => p.user_id === userId) || null;
      } else {
        const rows = await query('SELECT * FROM user_fit_profiles WHERE user_id = ?', [userId]);
        if (rows && rows.length > 0) profile = rows[0];
      }
    }

    // Default fallback profile for guest or initial setup
    const defaultProfile = {
      user_id: userId || null,
      height: 170,
      height_unit: 'cm',
      weight: 65,
      weight_unit: 'kg',
      chest: 38,
      waist: 31,
      hips: 39,
      foot_length: 10.0,
      measurement_unit: 'in',
      shoe_size: 'UK 7',
      shoe_size_system: 'UK',
      preferred_fit: 'regular',
      usual_brand_sizes: { 'Zara': 'M', 'H&M': 'M', 'Uniqlo': 'M' },
      notes: ''
    };

    return res.status(200).json({
      success: true,
      data: profile || defaultProfile
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/fit/preferences
 */
export async function updateFitPreferences(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to save fit preferences.'
      });
    }

    const {
      height = null,
      height_unit = 'cm',
      weight = null,
      weight_unit = 'kg',
      chest = null,
      waist = null,
      hips = null,
      foot_length = null,
      measurement_unit = 'in',
      shoe_size = 'UK 7',
      shoe_size_system = 'UK',
      preferred_fit = 'regular',
      usual_brand_sizes = {},
      notes = ''
    } = req.body;

    const brandSizesObj = typeof usual_brand_sizes === 'object' ? usual_brand_sizes : {};

    const profileData = {
      user_id: userId,
      height: height ? parseFloat(height) : null,
      height_unit,
      weight: weight ? parseFloat(weight) : null,
      weight_unit,
      chest: chest ? parseFloat(chest) : null,
      waist: waist ? parseFloat(waist) : null,
      hips: hips ? parseFloat(hips) : null,
      foot_length: foot_length ? parseFloat(foot_length) : null,
      measurement_unit,
      shoe_size,
      shoe_size_system,
      preferred_fit,
      usual_brand_sizes: brandSizesObj,
      notes,
      updated_at: new Date()
    };

    if (memoryStore.user_fit_profiles) {
      const idx = memoryStore.user_fit_profiles.findIndex(p => p.user_id === userId);
      if (idx >= 0) {
        memoryStore.user_fit_profiles[idx] = { ...memoryStore.user_fit_profiles[idx], ...profileData };
      } else {
        memoryStore.user_fit_profiles.push({
          id: memoryStore.nextId.user_fit_profiles++,
          ...profileData
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Fit preferences updated successfully.',
        data: profileData
      });
    }

    await query(
      `INSERT INTO user_fit_profiles (
        user_id, height, height_unit, weight, weight_unit, chest, waist, hips,
        foot_length, measurement_unit, shoe_size, shoe_size_system, preferred_fit,
        usual_brand_sizes, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        height = VALUES(height),
        height_unit = VALUES(height_unit),
        weight = VALUES(weight),
        weight_unit = VALUES(weight_unit),
        chest = VALUES(chest),
        waist = VALUES(waist),
        hips = VALUES(hips),
        foot_length = VALUES(foot_length),
        measurement_unit = VALUES(measurement_unit),
        shoe_size = VALUES(shoe_size),
        shoe_size_system = VALUES(shoe_size_system),
        preferred_fit = VALUES(preferred_fit),
        usual_brand_sizes = VALUES(usual_brand_sizes),
        notes = VALUES(notes)`,
      [
        userId,
        profileData.height,
        profileData.height_unit,
        profileData.weight,
        profileData.weight_unit,
        profileData.chest,
        profileData.waist,
        profileData.hips,
        profileData.foot_length,
        profileData.measurement_unit,
        profileData.shoe_size,
        profileData.shoe_size_system,
        profileData.preferred_fit,
        JSON.stringify(brandSizesObj),
        profileData.notes
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Fit preferences updated successfully.',
      data: profileData
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/fit/evaluate
 */
export async function evaluateFit(req, res, next) {
  try {
    const userId = req.user?.id;
    const {
      category,
      product_id,
      chest,
      bust,
      waist,
      hips,
      height,
      weight,
      foot_length,
      shoe_size,
      shoe_size_system,
      preferred_fit,
      usual_brand_sizes,
      measurement_unit
    } = req.body;

    // Load user profile if fields are not explicitly supplied in request
    let userProfile = null;
    if (userId) {
      if (memoryStore.user_fit_profiles) {
        userProfile = memoryStore.user_fit_profiles.find(p => p.user_id === userId);
      } else {
        const rows = await query('SELECT * FROM user_fit_profiles WHERE user_id = ?', [userId]);
        if (rows && rows.length > 0) userProfile = rows[0];
      }
    }

    // Product lookup if product_id provided
    let product = null;
    if (product_id) {
      if (memoryStore.products) {
        product = memoryStore.products.find(p => p.id === parseInt(product_id, 10)) || null;
      } else {
        const prods = await query('SELECT * FROM products WHERE id = ?', [product_id]);
        if (prods && prods.length > 0) product = prods[0];
      }
    }

    // Merge inputs (body params override saved profile)
    const evalInput = {
      category: category || product?.category_name || product?.category_slug || 'tops',
      chest: chest ?? userProfile?.chest,
      bust: bust ?? userProfile?.chest,
      waist: waist ?? userProfile?.waist,
      hips: hips ?? userProfile?.hips,
      height: height ?? userProfile?.height,
      weight: weight ?? userProfile?.weight,
      foot_length: foot_length ?? userProfile?.foot_length,
      shoe_size: shoe_size ?? userProfile?.shoe_size,
      shoe_size_system: shoe_size_system ?? userProfile?.shoe_size_system ?? 'UK',
      preferred_fit: preferred_fit ?? userProfile?.preferred_fit ?? 'regular',
      usual_brand_sizes: usual_brand_sizes ?? userProfile?.usual_brand_sizes ?? {},
      measurement_unit: measurement_unit ?? userProfile?.measurement_unit ?? 'in',
      product
    };

    const evaluation = evaluateFitRecommendation(evalInput);

    // If product details and variants are known, check if recommended size is in stock
    let inStock = true;
    let availableSizes = [];
    if (product) {
      let variants = [];
      if (memoryStore.product_variants) {
        variants = memoryStore.product_variants.filter(v => v.product_id === product.id);
      } else {
        variants = await query('SELECT * FROM product_variants WHERE product_id = ?', [product.id]);
      }
      availableSizes = [...new Set(variants.map(v => v.size))];
      const matchVariant = variants.find(
        v => v.size.toLowerCase() === evaluation.recommended_size.toLowerCase()
      );
      if (matchVariant) {
        inStock = matchVariant.stock_quantity > 0;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        ...evaluation,
        product_id: product?.id || null,
        product_name: product?.name || null,
        is_in_stock: inStock,
        available_sizes: availableSizes
      }
    });
  } catch (error) {
    next(error);
  }
}
