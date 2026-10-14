/**
 * StyleSense AI — Deterministic Rule-Based Recommendation Engine
 *
 * Scoring Rubric (Total: 100 points):
 * 1. Occasion Match: 30 points
 * 2. Style Match: 25 points
 * 3. Color Match: 20 points
 * 4. Budget Fit: 15 points
 * 5. Category Match: 10 points
 *
 * Exclusions:
 * - Inactive products
 * - Products with zero stock
 * - Products without stock in user's selected size (if size is specified)
 *
 * Note: This is an auditable, transparent rule-based algorithm, NOT a generative AI or opaque black-box model.
 */

export function calculateProductScore(product, preferences) {
  const {
    occasion,
    style,
    preferred_colors = [],
    budget_max,
    budget_min = 0,
    category
  } = preferences;

  let score = 0;
  const matchDetails = {
    occasion: { matched: false, points: 0, maxPoints: 30, value: null },
    style: { matched: false, points: 0, maxPoints: 25, value: null },
    color: { matched: false, points: 0, maxPoints: 20, matchedColor: null },
    budget: { matched: false, points: 0, maxPoints: 15, rule: 'none' },
    category: { matched: false, points: 0, maxPoints: 10, value: null },
  };

  const productStyles = Array.isArray(product.style_tags)
    ? product.style_tags.map(s => String(s).toLowerCase())
    : [];
  const productOccasions = Array.isArray(product.occasion_tags)
    ? product.occasion_tags.map(o => String(o).toLowerCase())
    : [];
  const productColors = Array.isArray(product.colors)
    ? product.colors.map(c => String(c).toLowerCase())
    : [];

  // 1. Occasion Match (30 pts)
  if (occasion) {
    const targetOccasion = String(occasion).toLowerCase();
    if (productOccasions.includes(targetOccasion)) {
      score += 30;
      matchDetails.occasion = { matched: true, points: 30, maxPoints: 30, value: occasion };
    }
  } else {
    // Neutral when not constrained
    score += 30;
    matchDetails.occasion = { matched: true, points: 30, maxPoints: 30, value: 'All occasions' };
  }

  // 2. Style Match (25 pts)
  if (style) {
    const targetStyle = String(style).toLowerCase();
    if (productStyles.includes(targetStyle)) {
      score += 25;
      matchDetails.style = { matched: true, points: 25, maxPoints: 25, value: style };
    }
  } else {
    score += 25;
    matchDetails.style = { matched: true, points: 25, maxPoints: 25, value: 'All styles' };
  }

  // 3. Color Match (20 pts)
  const normalizedPrefColors = Array.isArray(preferred_colors)
    ? preferred_colors.map(c => String(c).toLowerCase())
    : [];

  if (normalizedPrefColors.length > 0) {
    const matched = productColors.find(pc => normalizedPrefColors.includes(pc));
    if (matched) {
      score += 20;
      matchDetails.color = { matched: true, points: 20, maxPoints: 20, matchedColor: matched };
    }
  } else {
    score += 20;
    matchDetails.color = { matched: true, points: 20, maxPoints: 20, matchedColor: 'Any color' };
  }

  // 4. Budget Fit (15 pts) - Deterministic budget scoring with partial points
  const price = parseFloat(product.price);
  if (budget_max && !isNaN(budget_max) && Number(budget_max) > 0) {
    const maxB = Number(budget_max);
    if (price <= maxB) {
      score += 15;
      matchDetails.budget = { matched: true, points: 15, maxPoints: 15, rule: 'within_budget' };
    } else if (price <= maxB * 1.15) {
      // Within 15% budget stretch
      score += 8;
      matchDetails.budget = { matched: false, points: 8, maxPoints: 15, rule: 'slight_stretch_15' };
    } else if (price <= maxB * 1.30) {
      // Within 30% budget stretch
      score += 4;
      matchDetails.budget = { matched: false, points: 4, maxPoints: 15, rule: 'stretch_30' };
    } else {
      score += 0;
      matchDetails.budget = { matched: false, points: 0, maxPoints: 15, rule: 'over_budget' };
    }
  } else {
    score += 15;
    matchDetails.budget = { matched: true, points: 15, maxPoints: 15, rule: 'no_budget_limit' };
  }

  // 5. Category Match (10 pts)
  if (category && category !== 'all') {
    const targetCat = String(category).toLowerCase();
    const prodCatSlug = String(product.category_slug || '').toLowerCase();
    const prodCatName = String(product.category_name || '').toLowerCase();

    if (prodCatSlug === targetCat || prodCatName === targetCat) {
      score += 10;
      matchDetails.category = { matched: true, points: 10, maxPoints: 10, value: category };
    }
  } else {
    score += 10;
    matchDetails.category = { matched: true, points: 10, maxPoints: 10, value: 'All categories' };
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(score)));
  const explanation = generateMatchExplanation(matchDetails, preferences, product);

  return {
    score: finalScore,
    matchPercentage: finalScore,
    matchDetails,
    explanation,
  };
}

/**
 * Generate human-readable match explanation from actual scoring breakdown
 */
export function generateMatchExplanation(details, preferences, product) {
  const highlights = [];

  if (details.style.matched && preferences.style) {
    highlights.push(`${preferences.style} style aesthetic`);
  }
  if (details.occasion.matched && preferences.occasion) {
    highlights.push(`${preferences.occasion} wardrobe`);
  }
  if (details.color.matched && details.color.matchedColor && details.color.matchedColor !== 'Any color') {
    highlights.push(`preferred ${details.color.matchedColor} tone`);
  }
  if (details.budget.points === 15 && preferences.budget_max) {
    highlights.push(`within your $${preferences.budget_max} budget`);
  } else if (details.budget.points === 8) {
    highlights.push(`slight stretch above budget ($${product.price})`);
  }

  if (highlights.length === 0) {
    return 'Recommended based on overall catalog compatibility and popular styling.';
  }

  return `Matches your ${highlights.join(', ')}.`;
}

/**
 * Filter, score, and rank products according to preferences
 */
export function recommendProducts(products, preferences = {}, options = {}) {
  const { limit = 12, minScore = 0 } = options;
  const { preferred_size } = preferences;

  // Step 1: Filter out ineligible products
  const eligible = products.filter(product => {
    // Exclude inactive
    if (product.active === false || product.active === 0) return false;

    // Check stock
    const variants = product.variants || [];
    const totalStock = variants.length > 0
      ? variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)
      : (product.total_stock || 0);

    if (totalStock <= 0) return false;

    // Size filter: if user requested a specific size, product must have stock in that size
    if (preferred_size && preferred_size !== 'all') {
      const sizeVariant = variants.find(
        v => String(v.size).toUpperCase() === String(preferred_size).toUpperCase()
      );
      if (!sizeVariant || sizeVariant.stock_quantity <= 0) {
        return false;
      }
    }

    return true;
  });

  // Step 2: Score products
  const scored = eligible.map(prod => {
    const scoring = calculateProductScore(prod, preferences);
    return {
      ...prod,
      recommendationScore: scoring.score,
      matchPercentage: scoring.matchPercentage,
      matchExplanation: scoring.explanation,
      matchDetails: scoring.matchDetails,
    };
  });

  // Step 3: Filter by minScore if specified
  const passing = scored.filter(p => p.recommendationScore >= minScore);

  // Step 4: Deterministic Sort
  // 1st: Score DESC
  // 2nd: Featured DESC
  // 3rd: Total Stock DESC
  // 4th: ID ASC (Stable tie-breaker)
  passing.sort((a, b) => {
    if (b.recommendationScore !== a.recommendationScore) {
      return b.recommendationScore - a.recommendationScore;
    }
    const aFeat = a.featured ? 1 : 0;
    const bFeat = b.featured ? 1 : 0;
    if (bFeat !== aFeat) return bFeat - aFeat;

    const aStock = a.total_stock || 0;
    const bStock = b.total_stock || 0;
    if (bStock !== aStock) return bStock - aStock;

    return a.id - b.id;
  });

  return passing.slice(0, limit);
}
