/**
 * StyleSense AI — Occasion-to-Outfit Planner Compatibility Engine
 * Deterministic rules-based outfit generator across 8 occasions with
 * support for Wardrobe-Only and Wardrobe-Plus-Store modes.
 */

export const OCCASION_TEMPLATES = {
  college: {
    name: 'College & Campus Casual',
    primaryAesthetic: 'casual',
    defaultSlots: ['top', 'bottom', 'shoes', 'outerwear'],
    allowedCategories: {
      top: ['tops'],
      bottom: ['bottoms'],
      shoes: ['shoes'],
      outerwear: ['outerwear']
    },
    vibeKeywords: ['casual', 'streetwear', 'relaxed', 'minimalist']
  },
  office: {
    name: 'Office & Business Casual',
    primaryAesthetic: 'classic',
    defaultSlots: ['top', 'bottom', 'shoes', 'outerwear'],
    allowedCategories: {
      top: ['tops'],
      bottom: ['bottoms'],
      shoes: ['shoes'],
      outerwear: ['outerwear']
    },
    vibeKeywords: ['office', 'classic', 'minimalist', 'formal']
  },
  interview: {
    name: 'Professional Interview',
    primaryAesthetic: 'classic',
    defaultSlots: ['top', 'bottom', 'outerwear', 'shoes', 'accessory'],
    allowedCategories: {
      top: ['tops'],
      bottom: ['bottoms'],
      outerwear: ['outerwear'],
      shoes: ['shoes'],
      accessory: ['accessories']
    },
    vibeKeywords: ['interview', 'office', 'formal', 'classic']
  },
  casual: {
    name: 'Casual Outing',
    primaryAesthetic: 'minimalist',
    defaultSlots: ['top', 'bottom', 'shoes', 'accessory'],
    allowedCategories: {
      top: ['tops'],
      bottom: ['bottoms'],
      shoes: ['shoes'],
      accessory: ['accessories']
    },
    vibeKeywords: ['casual', 'minimalist', 'streetwear']
  },
  party: {
    name: 'Party & Evening Social',
    primaryAesthetic: 'chic',
    defaultSlots: ['top', 'bottom', 'shoes', 'accessory'],
    allowedCategories: {
      top: ['tops', 'dresses'],
      bottom: ['bottoms'],
      shoes: ['shoes'],
      accessory: ['accessories']
    },
    vibeKeywords: ['party', 'chic', 'streetwear']
  },
  festive: {
    name: 'Festive & Celebration',
    primaryAesthetic: 'chic',
    defaultSlots: ['top', 'bottom', 'shoes', 'accessory'],
    allowedCategories: {
      top: ['tops', 'dresses'],
      bottom: ['bottoms'],
      shoes: ['shoes'],
      accessory: ['accessories']
    },
    vibeKeywords: ['festive', 'party', 'chic', 'classic']
  },
  formal: {
    name: 'Formal Event & Gala',
    primaryAesthetic: 'classic',
    defaultSlots: ['top', 'bottom', 'outerwear', 'shoes', 'accessory'],
    allowedCategories: {
      top: ['tops', 'dresses'],
      bottom: ['bottoms'],
      outerwear: ['outerwear'],
      shoes: ['shoes'],
      accessory: ['accessories']
    },
    vibeKeywords: ['formal', 'interview', 'classic', 'chic']
  },
  travel: {
    name: 'Travel & Exploration',
    primaryAesthetic: 'minimalist',
    defaultSlots: ['top', 'bottom', 'outerwear', 'shoes'],
    allowedCategories: {
      top: ['tops'],
      bottom: ['bottoms'],
      outerwear: ['outerwear'],
      shoes: ['shoes']
    },
    vibeKeywords: ['travel', 'casual', 'minimalist']
  }
};

/**
 * Normalizes category mapping
 */
function normalizeCategory(cat) {
  if (!cat) return '';
  const c = cat.toLowerCase();
  if (c.includes('top') || c.includes('shirt') || c.includes('sweater') || c.includes('knit')) return 'tops';
  if (c.includes('bottom') || c.includes('trouser') || c.includes('pant') || c.includes('jean') || c.includes('skirt')) return 'bottoms';
  if (c.includes('outerwear') || c.includes('blazer') || c.includes('coat') || c.includes('jacket')) return 'outerwear';
  if (c.includes('shoe') || c.includes('boot') || c.includes('loafer') || c.includes('sneaker')) return 'shoes';
  if (c.includes('accessor') || c.includes('belt') || c.includes('tie') || c.includes('bag')) return 'accessories';
  if (c.includes('dress')) return 'dresses';
  return c;
}

/**
 * Score an individual item for occasion compatibility
 */
function scoreItem(item, occasion, preferredAesthetic, preferredColors = []) {
  let score = 50; // Baseline
  const occasionLower = (occasion || '').toLowerCase();
  const aestheticLower = (preferredAesthetic || '').toLowerCase();
  const colorsLower = preferredColors.map(c => c.toLowerCase());

  // Occasion Match (+25)
  const itemOccasion = (item.occasion || '').toLowerCase();
  const occasionTags = Array.isArray(item.occasion_tags)
    ? item.occasion_tags.map(t => t.toLowerCase())
    : [itemOccasion];

  if (occasionTags.includes(occasionLower)) {
    score += 25;
  } else if (OCCASION_TEMPLATES[occasionLower]?.vibeKeywords.some(vk => occasionTags.includes(vk))) {
    score += 15;
  }

  // Style / Aesthetic Match (+15)
  const itemStyle = (item.style || '').toLowerCase();
  const styleTags = Array.isArray(item.style_tags)
    ? item.style_tags.map(t => t.toLowerCase())
    : [itemStyle];

  if (styleTags.includes(aestheticLower)) {
    score += 15;
  }

  // Color harmony (+10)
  const itemColor = (item.color || '').toLowerCase();
  const isNeutral = ['white', 'ivory', 'charcoal', 'black', 'navy', 'beige', 'grey'].includes(itemColor);
  if (colorsLower.includes(itemColor)) {
    score += 10;
  } else if (isNeutral) {
    score += 8;
  }

  // Favorite boost (+5)
  if (item.is_favorite) {
    score += 5;
  }

  return Math.min(score, 100);
}

/**
 * Generate outfit combinations deterministically
 */
export function generateOutfitPlan({
  occasion = 'casual',
  preferredAesthetic = 'minimalist',
  preferredColors = ['ivory', 'charcoal'],
  budget = 300,
  mode = 'wardrobe_only', // 'wardrobe_only' | 'wardrobe_and_store'
  wardrobeItems = [],
  storeProducts = []
}) {
  const normOccasion = OCCASION_TEMPLATES[occasion.toLowerCase()] ? occasion.toLowerCase() : 'casual';
  const template = OCCASION_TEMPLATES[normOccasion];

  const slotsNeeded = template.defaultSlots;
  const selectedSlots = {};
  let totalStoreCost = 0;
  let remainingBudget = budget ? Number(budget) : 500;

  // Track selected colors to ensure harmony
  const selectedColors = new Set();
  const explanations = [];

  for (const slot of slotsNeeded) {
    const validCatNames = template.allowedCategories[slot] || [slot];

    // 1. Try finding best wardrobe item
    const candidateWardrobe = wardrobeItems.filter(item => {
      const normCat = normalizeCategory(item.category);
      return validCatNames.includes(normCat);
    });

    let bestWardrobeMatch = null;
    let highestWardrobeScore = -1;

    for (const wItem of candidateWardrobe) {
      const s = scoreItem(wItem, normOccasion, preferredAesthetic, preferredColors);
      if (s > highestWardrobeScore) {
        highestWardrobeScore = s;
        bestWardrobeMatch = wItem;
      }
    }

    if (bestWardrobeMatch && (mode === 'wardrobe_only' || highestWardrobeScore >= 70)) {
      selectedSlots[slot] = {
        slot,
        isOwned: true,
        score: highestWardrobeScore,
        item: {
          id: bestWardrobeMatch.id,
          name: bestWardrobeMatch.name,
          category: bestWardrobeMatch.category,
          color: bestWardrobeMatch.color,
          style: bestWardrobeMatch.style,
          occasion: bestWardrobeMatch.occasion,
          image_url: bestWardrobeMatch.image_url,
          brand: bestWardrobeMatch.brand,
          purchase_price: bestWardrobeMatch.purchase_price,
          wears_count: bestWardrobeMatch.wears_count,
        }
      };
      if (bestWardrobeMatch.color) selectedColors.add(bestWardrobeMatch.color.toLowerCase());
      continue;
    }

    // 2. If wardrobe has no item or mode is wardrobe_and_store and store has item
    if (mode === 'wardrobe_and_store') {
      const candidateStore = storeProducts.filter(prod => {
        const normCat = normalizeCategory(prod.category_slug || prod.category_name);
        const price = Number(prod.price) || 0;
        const inStock = prod.variants ? prod.variants.some(v => v.stock_quantity > 0) : true;
        return validCatNames.includes(normCat) && price <= remainingBudget && inStock;
      });

      let bestStoreMatch = null;
      let highestStoreScore = -1;

      for (const sProd of candidateStore) {
        const s = scoreItem({
          occasion_tags: sProd.occasion_tags,
          style_tags: sProd.style_tags,
          color: Array.isArray(sProd.colors) ? sProd.colors[0] : sProd.colors
        }, normOccasion, preferredAesthetic, preferredColors);

        if (s > highestStoreScore) {
          highestStoreScore = s;
          bestStoreMatch = sProd;
        }
      }

      // If store match is found and within budget, or wardrobe didn't have one
      if (bestStoreMatch && (!bestWardrobeMatch || highestStoreScore > highestWardrobeScore)) {
        const itemPrice = Number(bestStoreMatch.price) || 0;
        remainingBudget -= itemPrice;
        totalStoreCost += itemPrice;

        selectedSlots[slot] = {
          slot,
          isOwned: false,
          score: highestStoreScore,
          item: {
            id: bestStoreMatch.id,
            product_id: bestStoreMatch.id,
            name: bestStoreMatch.name,
            category: bestStoreMatch.category_name || slot,
            color: Array.isArray(bestStoreMatch.colors) ? bestStoreMatch.colors[0] : bestStoreMatch.colors,
            style: Array.isArray(bestStoreMatch.style_tags) ? bestStoreMatch.style_tags[0] : 'modern',
            price: itemPrice,
            image_url: bestStoreMatch.image_url,
            isStoreProduct: true
          }
        };
        const c = Array.isArray(bestStoreMatch.colors) ? bestStoreMatch.colors[0] : bestStoreMatch.colors;
        if (c) selectedColors.add(String(c).toLowerCase());
        continue;
      }
    }

    // Fallback: If wardrobe match existed even with lower score, use it
    if (bestWardrobeMatch) {
      selectedSlots[slot] = {
        slot,
        isOwned: true,
        score: highestWardrobeScore,
        item: {
          id: bestWardrobeMatch.id,
          name: bestWardrobeMatch.name,
          category: bestWardrobeMatch.category,
          color: bestWardrobeMatch.color,
          style: bestWardrobeMatch.style,
          occasion: bestWardrobeMatch.occasion,
          image_url: bestWardrobeMatch.image_url,
          brand: bestWardrobeMatch.brand,
          purchase_price: bestWardrobeMatch.purchase_price,
          wears_count: bestWardrobeMatch.wears_count,
        }
      };
      if (bestWardrobeMatch.color) selectedColors.add(bestWardrobeMatch.color.toLowerCase());
    }
  }

  // Calculate overall outfit compatibility score
  const slotEntries = Object.values(selectedSlots);
  const totalScore = slotEntries.length > 0
    ? Math.round(slotEntries.reduce((acc, curr) => acc + curr.score, 0) / slotEntries.length)
    : 0;

  const ownedItemsCount = slotEntries.filter(s => s.isOwned).length;
  const storeItemsCount = slotEntries.filter(s => !s.isOwned).length;

  // Build transparent deterministic explanation
  const ownedNames = slotEntries.filter(s => s.isOwned).map(s => s.item.name);
  const storeNames = slotEntries.filter(s => !s.isOwned).map(s => s.item.name);

  let explanation = '';
  if (slotEntries.length === 0) {
    explanation = `No compatible wardrobe items found for ${template.name}. Try adding items to your digital wardrobe or switching to "Wardrobe + Store" mode.`;
  } else if (storeItemsCount === 0) {
    explanation = `Curated exclusively from your wardrobe for ${template.name}. Combines your ${ownedNames.slice(0, 3).join(', ')} with harmonious ${Array.from(selectedColors).slice(0, 3).join(' and ')} tones.`;
  } else if (ownedItemsCount === 0) {
    explanation = `Curated from the store catalog within your $${budget} budget to form a complete ${template.name} ensemble.`;
  } else {
    explanation = `Suggested for your ${template.name} because it coordinates your owned ${ownedNames.slice(0, 2).join(' and ')} with ${storeNames.join(' and ')} for a cohesive ${preferredAesthetic} look within your budget.`;
  }

  return {
    id: `outfit-${Date.now()}`,
    name: `${template.name} Combination`,
    occasion: normOccasion,
    occasionLabel: template.name,
    aesthetic: preferredAesthetic,
    compatibilityScore: totalScore,
    explanation,
    totalStoreCost: Number(totalStoreCost.toFixed(2)),
    budgetRemaining: Number(Math.max(0, remainingBudget).toFixed(2)),
    ownedCount: ownedItemsCount,
    purchaseCount: storeItemsCount,
    colorPalette: Array.from(selectedColors),
    slots: selectedSlots,
    itemsList: slotEntries.map(s => ({
      slot: s.slot,
      isOwned: s.isOwned,
      score: s.score,
      ...s.item
    }))
  };
}
