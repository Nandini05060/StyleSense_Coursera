import { query, memoryStore } from '../config/db.js';

export async function getPreferences(req, res, next) {
  try {
    const userId = req.user.id;
    let prefs = null;

    if (memoryStore.user_preferences) {
      prefs = memoryStore.user_preferences.find(p => p.user_id === userId) || null;
    } else {
      const rows = await query('SELECT * FROM user_preferences WHERE user_id = ?', [userId]);
      if (rows && rows.length > 0) prefs = rows[0];
    }

    return res.status(200).json({
      success: true,
      data: prefs || {
        preferred_style: 'minimalist',
        preferred_colors: ['ivory', 'charcoal', 'beige'],
        preferred_size: 'M',
        budget_min: 0,
        budget_max: 200,
        preferred_occasion: 'casual'
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePreferences(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      preferred_style = 'minimalist',
      preferred_colors = ['ivory', 'charcoal'],
      preferred_size = 'M',
      budget_min = 0,
      budget_max = 300,
      preferred_occasion = 'casual'
    } = req.body;

    const colorsArr = Array.isArray(preferred_colors) ? preferred_colors : [preferred_colors].filter(Boolean);

    if (memoryStore.user_preferences) {
      const idx = memoryStore.user_preferences.findIndex(p => p.user_id === userId);
      const updated = {
        user_id: userId,
        preferred_style,
        preferred_colors: colorsArr,
        preferred_size,
        budget_min: parseFloat(budget_min) || 0,
        budget_max: parseFloat(budget_max) || 300,
        preferred_occasion,
        updated_at: new Date()
      };

      if (idx >= 0) {
        memoryStore.user_preferences[idx] = { ...memoryStore.user_preferences[idx], ...updated };
      } else {
        memoryStore.user_preferences.push({ id: memoryStore.nextId.user_preferences++, ...updated });
      }

      return res.status(200).json({
        success: true,
        message: 'Style preferences updated successfully.',
        data: updated
      });
    }

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
        preferred_style,
        JSON.stringify(colorsArr),
        preferred_size,
        parseFloat(budget_min) || 0,
        parseFloat(budget_max) || 300,
        preferred_occasion
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Style preferences updated successfully.',
      data: {
        preferred_style,
        preferred_colors: colorsArr,
        preferred_size,
        budget_min,
        budget_max,
        preferred_occasion
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Comprehensive Style Profile
 */
export async function getStyleProfile(req, res, next) {
  try {
    const userId = req.user.id;
    let profile = null;

    if (memoryStore.user_style_profiles) {
      profile = memoryStore.user_style_profiles.find(p => p.user_id === userId) || null;
    } else {
      const rows = await query('SELECT * FROM user_style_profiles WHERE user_id = ?', [userId]);
      if (rows && rows.length > 0) profile = rows[0];
    }

    if (!profile) {
      // Fallback default style profile
      profile = {
        user_id: userId,
        preferred_aesthetics: ['minimalist', 'classic'],
        preferred_colors: ['ivory', 'charcoal', 'navy'],
        favorite_categories: ['tops', 'bottoms'],
        preferred_occasions: ['casual', 'college', 'office'],
        budget_min: 25.00,
        budget_max: 200.00,
        lifestyle_tags: ['Urban Professional', 'Weekend Explorer'],
        notes: 'Prefers versatile neutral tones with subtle textures and high cost-per-wear utility.',
        updated_at: new Date()
      };
    }

    return res.status(200).json({
      success: true,
      data: profile,
      explanation: 'Your style profile is used strictly to curate compatible wardrobe recommendations, calculate outfit synergy, and identify missing wardrobe essentials. We never infer sensitive personal attributes.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update Comprehensive Style Profile
 */
export async function updateStyleProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      preferred_aesthetics = ['minimalist'],
      preferred_colors = ['ivory', 'charcoal'],
      favorite_categories = ['tops', 'bottoms'],
      preferred_occasions = ['casual'],
      budget_min = 25,
      budget_max = 250,
      lifestyle_tags = [],
      notes = ''
    } = req.body;

    const updated = {
      user_id: userId,
      preferred_aesthetics: Array.isArray(preferred_aesthetics) ? preferred_aesthetics : [preferred_aesthetics],
      preferred_colors: Array.isArray(preferred_colors) ? preferred_colors : [preferred_colors],
      favorite_categories: Array.isArray(favorite_categories) ? favorite_categories : [favorite_categories],
      preferred_occasions: Array.isArray(preferred_occasions) ? preferred_occasions : [preferred_occasions],
      budget_min: parseFloat(budget_min) || 0,
      budget_max: parseFloat(budget_max) || 300,
      lifestyle_tags: Array.isArray(lifestyle_tags) ? lifestyle_tags : [lifestyle_tags].filter(Boolean),
      notes: notes ? notes.trim() : '',
      updated_at: new Date()
    };

    if (memoryStore.user_style_profiles) {
      const idx = memoryStore.user_style_profiles.findIndex(p => p.user_id === userId);
      if (idx >= 0) {
        memoryStore.user_style_profiles[idx] = { ...memoryStore.user_style_profiles[idx], ...updated };
      } else {
        updated.id = memoryStore.nextId.user_style_profiles++;
        memoryStore.user_style_profiles.push(updated);
      }
      return res.status(200).json({
        success: true,
        message: 'Personal style profile updated successfully.',
        data: updated
      });
    }

    await query(
      `INSERT INTO user_style_profiles (user_id, preferred_aesthetics, preferred_colors, favorite_categories, preferred_occasions, budget_min, budget_max, lifestyle_tags, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         preferred_aesthetics = VALUES(preferred_aesthetics),
         preferred_colors = VALUES(preferred_colors),
         favorite_categories = VALUES(favorite_categories),
         preferred_occasions = VALUES(preferred_occasions),
         budget_min = VALUES(budget_min),
         budget_max = VALUES(budget_max),
         lifestyle_tags = VALUES(lifestyle_tags),
         notes = VALUES(notes)`,
      [
        userId,
        JSON.stringify(updated.preferred_aesthetics),
        JSON.stringify(updated.preferred_colors),
        JSON.stringify(updated.favorite_categories),
        JSON.stringify(updated.preferred_occasions),
        updated.budget_min,
        updated.budget_max,
        JSON.stringify(updated.lifestyle_tags),
        updated.notes
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Personal style profile updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

