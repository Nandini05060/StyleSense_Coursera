/**
 * StyleSense AI — Outfit Builder Service
 *
 * Coordinates compatible items into cohesive outfits:
 * Slot 1: Top (or Dress as one-piece alternate)
 * Slot 2: Bottom (omitted if Dress is chosen)
 * Slot 3: Shoes
 * Slot 4: Outerwear (optional layer)
 * Slot 5: Accessory (handbag, scarf, jewelry)
 *
 * Criteria for Cohesion:
 * - Style compatibility (shared style tags)
 * - Occasion harmony (shared occasion tags)
 * - Harmonious color pairing (complementary neutral or tonal match)
 * - Total outfit cost evaluated against target budget
 *
 * Notice: Outfit combinations are algorithmic heuristic pairings based on product attributes,
 * not subjective guarantees.
 */

export function buildOutfitSuggestion(products, preferences = {}) {
  const {
    style = 'minimalist',
    occasion = 'casual',
    budget_max = 350,
    preferred_colors = ['ivory', 'charcoal', 'beige'],
    useDress = false,
  } = preferences;

  // Filter in-stock and active products
  const available = products.filter(p => {
    if (!p.active) return false;
    const stock = p.variants?.reduce((s, v) => s + v.stock_quantity, 0) ?? p.total_stock ?? 0;
    return stock > 0;
  });

  const getProductsByCat = (catSlug) => available.filter(p => {
    const slug = (p.category_slug || p.categorySlug || '').toLowerCase();
    return slug === catSlug;
  });

  const tops = getProductsByCat('tops');
  const bottoms = getProductsByCat('bottoms');
  const dresses = getProductsByCat('dresses');
  const shoes = getProductsByCat('shoes');
  const outerwear = getProductsByCat('outerwear');
  const accessories = getProductsByCat('accessories');

  // Compatibility score helper between an item and criteria
  function scoreItemCompatibility(item) {
    let score = 0;
    const styles = (item.style_tags || []).map(s => String(s).toLowerCase());
    const occasions = (item.occasion_tags || []).map(o => String(o).toLowerCase());
    const colors = (item.colors || []).map(c => String(c).toLowerCase());

    if (styles.includes(style.toLowerCase())) score += 30;
    if (occasions.includes(occasion.toLowerCase())) score += 30;

    const colorMatch = colors.some(c => preferred_colors.map(x => x.toLowerCase()).includes(c));
    if (colorMatch) score += 25;

    return score;
  }

  const sortBest = (items) => [...items].sort((a, b) => {
    const scoreDiff = scoreItemCompatibility(b) - scoreItemCompatibility(a);
    if (scoreDiff !== 0) return scoreDiff;
    return (a.price || 0) - (b.price || 0);
  });

  let selectedSlots = [];

  if (useDress && dresses.length > 0) {
    const sortedDresses = sortBest(dresses);
    selectedSlots.push({ slot: 'Dress', product: sortedDresses[0] });
  } else {
    const sortedTops = sortBest(tops);
    const sortedBottoms = sortBest(bottoms);
    if (sortedTops.length > 0) selectedSlots.push({ slot: 'Top', product: sortedTops[0] });
    if (sortedBottoms.length > 0) selectedSlots.push({ slot: 'Bottom', product: sortedBottoms[0] });
  }

  const sortedShoes = sortBest(shoes);
  if (sortedShoes.length > 0) selectedSlots.push({ slot: 'Shoes', product: sortedShoes[0] });

  const sortedOuter = sortBest(outerwear);
  if (sortedOuter.length > 0) selectedSlots.push({ slot: 'Outerwear', product: sortedOuter[0] });

  const sortedAcc = sortBest(accessories);
  if (sortedAcc.length > 0) selectedSlots.push({ slot: 'Accessory', product: sortedAcc[0] });

  // Calculate total price
  const totalPrice = selectedSlots.reduce((sum, item) => sum + parseFloat(item.product.price), 0);
  const withinBudget = budget_max ? totalPrice <= budget_max : true;

  // Outfit cohesion assessment
  const sharedOccasion = selectedSlots.every(s =>
    (s.product.occasion_tags || []).some(o => o.toLowerCase() === occasion.toLowerCase())
  );
  const sharedStyle = selectedSlots.every(s =>
    (s.product.style_tags || []).some(st => st.toLowerCase() === style.toLowerCase())
  );

  let harmonyDescription = `Coordinated ${style} ensemble tailored for ${occasion} settings.`;
  if (!withinBudget && budget_max) {
    harmonyDescription += ` Current selection exceeds target budget by $${(totalPrice - budget_max).toFixed(2)}.`;
  }

  return {
    style,
    occasion,
    slots: selectedSlots,
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    budgetMax: budget_max,
    withinBudget,
    cohesion: {
      sharedOccasion,
      sharedStyle,
      itemCount: selectedSlots.length,
      harmonyDescription,
    },
    disclaimer: 'Pairings are derived from rule-based attribute matching (style, occasion, color palette) and do not represent a guaranteed fashion endorsement.',
  };
}

/**
 * Find replacement options for a single outfit slot
 */
export function getSlotReplacements(products, slotName, preferences = {}) {
  const catSlug = slotName.toLowerCase() === 'top' ? 'tops'
    : slotName.toLowerCase() === 'bottom' ? 'bottoms'
    : slotName.toLowerCase() === 'dress' ? 'dresses'
    : slotName.toLowerCase() === 'shoes' ? 'shoes'
    : slotName.toLowerCase() === 'outerwear' ? 'outerwear'
    : 'accessories';

  const matches = products.filter(p => {
    if (!p.active) return false;
    const slug = (p.category_slug || p.categorySlug || '').toLowerCase();
    return slug === catSlug;
  });

  return matches;
}

/**
 * Deterministic Compatibility Service for Mix & Match Studio
 * Evaluates combinations of catalog and wardrobe items.
 */
export function evaluateOutfitCompatibility(items = [], options = {}) {
  const { targetOccasion = null, targetStyle = null } = options;

  if (!Array.isArray(items) || items.length === 0) {
    return {
      score: 0,
      level: 'Incomplete Outfit',
      breakdown: { occasionScore: 0, styleScore: 0, colorScore: 0, silhouetteScore: 0 },
      explanations: ['Select pieces to begin outfit compatibility analysis.'],
      totalPurchasablePrice: 0,
      ownedItemsCount: 0,
      purchasableItemsCount: 0,
      hasSilhouetteWarning: false,
    };
  }

  let occasionScore = 0;
  let styleScore = 0;
  let colorScore = 0;
  let silhouetteScore = 0;
  const explanations = [];

  // Helper to extract arrays safely
  const getArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(v => String(v).toLowerCase());
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed.map(v => String(v).toLowerCase());
      } catch (e) {
        return [val.toLowerCase()];
      }
      return [val.toLowerCase()];
    }
    return [];
  };

  const itemCategories = items.map(i => (i.category || i.category_slug || i.slot || '').toLowerCase());
  const hasTop = itemCategories.some(c => c.includes('top'));
  const hasBottom = itemCategories.some(c => c.includes('bottom'));
  const hasDress = itemCategories.some(c => c.includes('dress'));
  const hasShoes = itemCategories.some(c => c.includes('shoe'));
  const hasOuter = itemCategories.some(c => c.includes('outer'));

  // 1. Silhouette & Proportions (20 pts)
  let silhouetteWarning = false;
  if (hasDress && hasBottom) {
    silhouetteScore += 8;
    silhouetteWarning = true;
    explanations.push('Silhouette advisory: A full-length dress and tailored bottoms are both selected. Consider removing one for cleaner lines.');
  } else if ((hasTop && hasBottom) || hasDress) {
    silhouetteScore += 15;
    explanations.push(hasDress ? 'Foundation: One-piece dress silhouette creates an uninterrupted focal line.' : 'Foundation: Balanced top and bottom foundation silhouette.');
  } else if (hasTop || hasBottom) {
    silhouetteScore += 8;
    explanations.push('Incomplete base silhouette: Missing matching top or bottom.');
  }

  if (hasShoes) {
    silhouetteScore += 5;
    explanations.push('Footwear anchor: Shoes provide foundational grounding to the silhouette.');
  } else {
    explanations.push('Missing footwear: Add shoes to complete the silhouette line.');
  }

  // 2. Occasion Harmony (30 pts)
  const allOccasions = items.map(i => getArray(i.occasion_tags || i.occasion));
  const occasionFrequency = {};
  allOccasions.forEach(occList => {
    occList.forEach(occ => {
      occasionFrequency[occ] = (occasionFrequency[occ] || 0) + 1;
    });
  });

  const bestOccasion = targetOccasion?.toLowerCase() ||
    Object.keys(occasionFrequency).reduce((a, b) => (occasionFrequency[a] > occasionFrequency[b] ? a : b), 'casual');

  const itemsMatchingOccasion = allOccasions.filter(occs => occs.includes(bestOccasion) || occs.length === 0).length;
  const occasionRatio = items.length > 0 ? itemsMatchingOccasion / items.length : 0;

  if (occasionRatio === 1) {
    occasionScore = 30;
    explanations.push(`Occasion synergy: 100% of pieces harmonize effortlessly for ${bestOccasion} settings.`);
  } else if (occasionRatio >= 0.6) {
    occasionScore = 22;
    explanations.push(`Occasion alignment: Strong cohesion (${Math.round(occasionRatio * 100)}%) for ${bestOccasion} settings.`);
  } else {
    occasionScore = 12;
    explanations.push(`Occasion contrast: Blend of varied formality across pieces creates an eclectic mix.`);
  }

  // 3. Style Aesthetic Alignment (25 pts)
  const allStyles = items.map(i => getArray(i.style_tags || i.style));
  const styleFrequency = {};
  allStyles.forEach(sList => {
    sList.forEach(st => {
      styleFrequency[st] = (styleFrequency[st] || 0) + 1;
    });
  });

  const primaryStyle = targetStyle?.toLowerCase() ||
    Object.keys(styleFrequency).reduce((a, b) => (styleFrequency[a] > styleFrequency[b] ? a : b), 'minimalist');

  const itemsMatchingStyle = allStyles.filter(sts => sts.includes(primaryStyle) || sts.length === 0).length;
  const styleRatio = items.length > 0 ? itemsMatchingStyle / items.length : 0;

  if (styleRatio === 1) {
    styleScore = 25;
    explanations.push(`Aesthetic coherence: Pure ${primaryStyle} aesthetic maintained across all items.`);
  } else if (styleRatio >= 0.5) {
    styleScore = 18;
    explanations.push(`Aesthetic balance: Unified primary ${primaryStyle} feel with tasteful complementary accents.`);
  } else {
    styleScore = 10;
    explanations.push(`Style juxtaposition: Multiple distinct design languages combined.`);
  }

  // 4. Color Palette Harmony (25 pts)
  const allColors = items.flatMap(i => getArray(i.colors || i.color));
  const uniqueColors = [...new Set(allColors)];
  const neutralPalette = ['ivory', 'white', 'beige', 'charcoal', 'black', 'taupe', 'camel', 'grey', 'gray'];
  const neutralCount = uniqueColors.filter(c => neutralPalette.includes(c)).length;
  const accentColors = uniqueColors.filter(c => !neutralPalette.includes(c));

  if (accentColors.length <= 1 && neutralCount >= 1) {
    colorScore = 25;
    explanations.push(
      accentColors.length === 0
        ? 'Tonal harmony: Pure editorial neutral palette with refined shade balance.'
        : `Accent focus: Cohesive neutral base elevated with a tasteful ${accentColors[0]} statement.`
    );
  } else if (accentColors.length === 2) {
    colorScore = 20;
    explanations.push(`Balanced two-tone palette: Harmonious color contrast between ${accentColors.join(' and ')}.`);
  } else {
    colorScore = 14;
    explanations.push('Eclectic palette: Dynamic multi-color pairing.');
  }

  const totalScore = Math.min(100, Math.max(0, occasionScore + styleScore + colorScore + silhouetteScore));

  let level = 'Casual Pairing';
  if (totalScore >= 85) level = 'Exceptional Editorial Harmony';
  else if (totalScore >= 70) level = 'Balanced Contemporary Ensemble';
  else if (totalScore >= 50) level = 'Eclectic Contrast';

  // Purchasable price calculation: ONLY store items
  let totalPurchasablePrice = 0;
  let ownedItemsCount = 0;
  let purchasableItemsCount = 0;

  items.forEach(item => {
    const isOwned = item.isOwned || item.item_type === 'wardrobe';
    if (isOwned) {
      ownedItemsCount++;
    } else {
      purchasableItemsCount++;
      totalPurchasablePrice += parseFloat(item.price || item.purchase_price || 0);
    }
  });

  return {
    score: totalScore,
    level,
    breakdown: {
      occasionScore,
      styleScore,
      colorScore,
      silhouetteScore
    },
    primaryOccasion: bestOccasion,
    primaryStyle,
    explanations,
    totalPurchasablePrice: parseFloat(totalPurchasablePrice.toFixed(2)),
    ownedItemsCount,
    purchasableItemsCount,
    hasSilhouetteWarning: silhouetteWarning
  };
}
