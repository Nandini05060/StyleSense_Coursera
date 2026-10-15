/**
 * StyleSense AI — Wardrobe Intelligence Service
 * Business logic for Cost-Per-Wear tracking, Wardrobe Analytics,
 * Wardrobe Gap Identification, and Buy-or-Reuse Advisor.
 */

/**
 * Calculates Cost Per Wear safely avoiding division by zero
 * @param {number|null} purchasePrice
 * @param {number} wearsCount
 * @returns {object} { costPerWear, status, display, message }
 */
export function calculateCostPerWear(purchasePrice, wearsCount = 0) {
  const numericPrice = purchasePrice !== null && purchasePrice !== undefined ? Number(purchasePrice) : null;
  const numericWears = Number(wearsCount) || 0;

  if (numericPrice === null || isNaN(numericPrice) || numericPrice < 0) {
    return {
      costPerWear: null,
      status: 'missing_price',
      display: 'Price not logged',
      message: 'Purchase price not recorded for this item.'
    };
  }

  if (numericWears <= 0) {
    return {
      costPerWear: null,
      status: 'never_worn',
      display: 'Not worn yet',
      purchasePrice: numericPrice,
      message: 'Item has not been worn yet (0 wears recorded).'
    };
  }

  const cpw = Number((numericPrice / numericWears).toFixed(2));
  return {
    costPerWear: cpw,
    status: 'calculated',
    display: `₹${cpw.toFixed(2)}`,
    purchasePrice: numericPrice,
    wearsCount: numericWears,
    message: `₹${cpw.toFixed(2)} per wear across ${numericWears} wear${numericWears === 1 ? '' : 's'}.`
  };
}

/**
 * Generates editorial wardrobe analytics
 * @param {Array} items - User's wardrobe items
 * @param {Array} wearLogs - User's wear activity logs
 * @param {object|null} userProfile - User's style profile or preferences (for budget comparison)
 * @param {number} savedOutfitsCount - Count of user's saved outfits
 * @returns {object} analytics summary
 */
export function generateWardrobeAnalytics(items = [], wearLogs = [], userProfile = null, savedOutfitsCount = 0) {
  const totalItems = items.length;
  const outfitsCount = Number(savedOutfitsCount) || 0;

  // Monthly Wear Trends calculation helper
  const calculateMonthlyTrends = (logs) => {
    if (!logs || logs.length === 0) return [];
    const monthCounts = {};
    for (const log of logs) {
      const dateVal = log.worn_date || log.created_at;
      if (!dateVal) continue;
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthCounts[key]) {
        monthCounts[key] = { month: key, label, wears: 0 };
      }
      monthCounts[key].wears += 1;
    }
    return Object.values(monthCounts).sort((a, b) => a.month.localeCompare(b.month));
  };

  const monthlyWearTrends = calculateMonthlyTrends(wearLogs);

  if (totalItems === 0) {
    const plannedBudget = userProfile?.budget_max ? Number(userProfile.budget_max) : null;
    return {
      totalItems: 0,
      savedOutfitsCount: outfitsCount,
      totalInvestment: 0,
      itemsWithPriceRecorded: 0,
      totalWearsRecorded: 0,
      averageCostPerWear: null,
      mostWornItems: [],
      underusedItems: [],
      underusedRule: 'Items with 0 logged wears or owned 30+ days with 2 or fewer recorded wears.',
      categoryDistribution: [],
      colorDistribution: [],
      occasionCoverage: [],
      monthlyWearTrends,
      budgetComparison: {
        plannedBudget,
        actualInvestment: 0,
        remainingBudget: plannedBudget,
        utilizationPercentage: 0,
        status: plannedBudget ? 'within_budget' : 'no_budget_set'
      },
      status: 'empty_wardrobe',
      message: 'Add items to your digital wardrobe to unlock cost-per-wear and usage insights.'
    };
  }

  let totalInvestment = 0;
  let itemsWithPrice = 0;
  let totalWearsRecorded = 0;
  let weightedCpwSum = 0;
  let validCpwItemsCount = 0;

  const categoryCounts = {};
  const categoryInvestments = {};
  const colorCounts = {};
  const occasionCounts = {};

  const decoratedItems = items.map(item => {
    const cpwData = calculateCostPerWear(item.purchase_price, item.wears_count);
    const wears = Number(item.wears_count) || 0;
    const price = item.purchase_price !== null && item.purchase_price !== undefined ? Number(item.purchase_price) : null;

    if (price !== null && !isNaN(price)) {
      totalInvestment += price;
      itemsWithPrice++;
    }

    totalWearsRecorded += wears;

    if (cpwData.status === 'calculated') {
      weightedCpwSum += cpwData.costPerWear;
      validCpwItemsCount++;
    }

    // Category tally & investment sum
    const cat = item.category ? item.category.toLowerCase() : 'other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    categoryInvestments[cat] = (categoryInvestments[cat] || 0) + (price !== null && !isNaN(price) ? price : 0);

    // Color tally
    const color = item.color ? item.color.toLowerCase() : 'unspecified';
    colorCounts[color] = (colorCounts[color] || 0) + 1;

    // Occasion tally
    const occ = item.occasion ? item.occasion.toLowerCase() : 'casual';
    occasionCounts[occ] = (occasionCounts[occ] || 0) + 1;

    // Calculate days owned
    const createdAt = item.created_at ? new Date(item.created_at) : new Date();
    const daysOwned = Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      ...item,
      cpwData,
      daysOwned
    };
  });

  // Most worn items (top 5 with wears > 0)
  const mostWornItems = [...decoratedItems]
    .filter(i => (Number(i.wears_count) || 0) > 0)
    .sort((a, b) => (Number(b.wears_count) || 0) - (Number(a.wears_count) || 0))
    .slice(0, 5)
    .map(i => ({
      id: i.id,
      name: i.name,
      category: i.category,
      image_url: i.image_url,
      wears_count: i.wears_count,
      purchase_price: i.purchase_price,
      cost_per_wear: i.cpwData.costPerWear,
      cost_per_wear_display: i.cpwData.costPerWear ? `₹${i.cpwData.costPerWear.toFixed(2)}` : 'Not worn yet'
    }));

  // Underused items rule:
  // Items with 0 wears OR (owned >= 30 days AND wears <= 2)
  const underusedItems = decoratedItems
    .filter(i => {
      const wears = Number(i.wears_count) || 0;
      if (wears === 0) return true;
      return i.daysOwned >= 30 && wears <= 2;
    })
    .sort((a, b) => (Number(a.wears_count) || 0) - (Number(b.wears_count) || 0) || b.daysOwned - a.daysOwned)
    .slice(0, 5)
    .map(i => ({
      id: i.id,
      name: i.name,
      category: i.category,
      image_url: i.image_url,
      wears_count: i.wears_count,
      purchase_price: i.purchase_price,
      daysOwned: i.daysOwned,
      cost_per_wear_display: (Number(i.wears_count) || 0) === 0 ? 'Not worn yet' : (i.cpwData.costPerWear ? `₹${i.cpwData.costPerWear.toFixed(2)}` : 'Price not logged'),
      reason: (Number(i.wears_count) || 0) === 0
        ? 'Not worn yet since adding to closet'
        : `Only worn ${i.wears_count} time${i.wears_count === 1 ? '' : 's'} across ${i.daysOwned} days`
    }));

  const averageCostPerWear = validCpwItemsCount > 0
    ? Number((weightedCpwSum / validCpwItemsCount).toFixed(2))
    : null;

  // Planned shopping budget vs actual recorded purchases
  const plannedBudget = userProfile?.budget_max ? Number(userProfile.budget_max) : null;
  const roundedInvestment = Number(totalInvestment.toFixed(2));
  const budgetComparison = {
    plannedBudget,
    actualInvestment: roundedInvestment,
    remainingBudget: plannedBudget !== null ? Number((plannedBudget - roundedInvestment).toFixed(2)) : null,
    utilizationPercentage: plannedBudget && plannedBudget > 0 ? Math.round((roundedInvestment / plannedBudget) * 100) : null,
    status: plannedBudget === null ? 'no_budget_set' : roundedInvestment <= plannedBudget ? 'within_budget' : 'exceeded_budget'
  };

  return {
    totalItems,
    savedOutfitsCount: outfitsCount,
    itemsWithPriceRecorded: itemsWithPrice,
    totalInvestment: roundedInvestment,
    totalWearsRecorded,
    averageCostPerWear,
    mostWornItems,
    underusedItems,
    underusedRule: 'Items with 0 logged wears or owned 30+ days with 2 or fewer recorded wears.',
    categoryDistribution: Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / totalItems) * 100),
      investment: Number((categoryInvestments[category] || 0).toFixed(2))
    })),
    colorDistribution: Object.entries(colorCounts).map(([color, count]) => ({
      color,
      count,
      percentage: Math.round((count / totalItems) * 100)
    })),
    occasionCoverage: Object.entries(occasionCounts).map(([occasion, count]) => ({
      occasion,
      count,
      percentage: Math.round((count / totalItems) * 100)
    })),
    monthlyWearTrends,
    budgetComparison,
    status: 'complete'
  };
}

/**
 * Identifies gaps in user's digital wardrobe
 * @param {Array} items - User's wardrobe items
 * @param {object} preferences - User's style preferences
 * @param {Array} dismissedKeys - Keys already dismissed by user
 * @returns {Array} List of wardrobe gap suggestions
 */
export function identifyWardrobeGaps(items = [], preferences = {}, dismissedKeys = []) {
  const suggestions = [];
  const dismissedSet = new Set(dismissedKeys || []);

  const totalItems = items.length;
  if (totalItems === 0) {
    return [
      {
        key: 'starter_capsule',
        title: 'Start Your Core Capsule',
        category: 'tops',
        importance: 'high',
        reason: 'Your digital wardrobe is currently empty.',
        explanation: 'Add your most frequently worn everyday pieces (e.g. a favorite shirt, daily trousers, and comfortable shoes) to unlock outfit suggestions and gap analysis.',
        recommendedSearch: 'tops',
        actionLabel: 'Browse Wardrobe Essentials'
      }
    ];
  }

  // Count by category
  const categories = {
    tops: items.filter(i => i.category === 'tops'),
    bottoms: items.filter(i => i.category === 'bottoms'),
    dresses: items.filter(i => i.category === 'dresses'),
    outerwear: items.filter(i => i.category === 'outerwear'),
    shoes: items.filter(i => i.category === 'shoes'),
    accessories: items.filter(i => i.category === 'accessories')
  };

  // Occasions present
  const occasions = new Set(items.map(i => (i.occasion || '').toLowerCase()));
  const colors = items.map(i => (i.color || '').toLowerCase());
  const hasNeutralColor = colors.some(c => ['white', 'black', 'navy', 'beige', 'charcoal', 'grey', 'ivory'].includes(c));

  // Gap 1: Tailored Blazer / Formal Outerwear
  if (!dismissedSet.has('formal_outerwear')) {
    const hasFormalOuterwear = categories.outerwear.some(i =>
      ['interview', 'office', 'formal'].includes((i.occasion || '').toLowerCase()) ||
      (i.style || '').toLowerCase() === 'classic' ||
      (i.name || '').toLowerCase().includes('blazer')
    );
    if (!hasFormalOuterwear) {
      suggestions.push({
        key: 'formal_outerwear',
        title: 'Tailored Blazer or Formal Layer',
        category: 'outerwear',
        importance: 'high',
        reason: 'Missing structured formal layer for professional or interview settings.',
        explanation: `You currently own ${categories.tops.length} tops and ${categories.bottoms.length} bottoms, but have no tailored blazer or formal outerwear logged for professional occasions.`,
        recommendedSearch: 'outerwear',
        actionLabel: 'Explore Tailored Blazers'
      });
    }
  }

  // Gap 2: Formal / Tailored Bottoms
  if (!dismissedSet.has('tailored_bottoms')) {
    const hasTailoredBottoms = categories.bottoms.some(i =>
      ['interview', 'office', 'formal'].includes((i.occasion || '').toLowerCase()) ||
      (i.style || '').toLowerCase() === 'classic' ||
      (i.name || '').toLowerCase().includes('trouser') ||
      (i.name || '').toLowerCase().includes('pant')
    );
    if (!hasTailoredBottoms && categories.bottoms.length > 0) {
      suggestions.push({
        key: 'tailored_bottoms',
        title: 'Tailored Wool or Crepe Trousers',
        category: 'bottoms',
        importance: 'medium',
        reason: 'Current bottoms are predominantly casual.',
        explanation: `Your ${categories.bottoms.length} bottoms are tagged for casual occasions. A pair of tailored neutral trousers would pair with your existing shirts for interviews and office days.`,
        recommendedSearch: 'bottoms',
        actionLabel: 'Explore Tailored Trousers'
      });
    }
  }

  // Gap 3: Core Neutral Foundation Top
  if (!dismissedSet.has('neutral_foundation_top')) {
    const hasNeutralTop = categories.tops.some(i =>
      ['white', 'ivory', 'black', 'navy'].includes((i.color || '').toLowerCase())
    );
    if (!hasNeutralTop && categories.tops.length > 0) {
      suggestions.push({
        key: 'neutral_foundation_top',
        title: 'Neutral Foundation Shirt or Tee',
        category: 'tops',
        importance: 'medium',
        reason: 'High-versatility neutral anchor missing in tops.',
        explanation: 'A crisp white or ivory button-down or minimalist knit connects differing bottom and outerwear colors into cohesive outfits.',
        recommendedSearch: 'tops',
        actionLabel: 'Explore Neutral Tops'
      });
    }
  }

  // Gap 4: Polished Footwear
  if (!dismissedSet.has('polished_shoes')) {
    const hasDressShoes = categories.shoes.some(i =>
      ['office', 'interview', 'formal', 'party'].includes((i.occasion || '').toLowerCase()) ||
      (i.name || '').toLowerCase().includes('loafer') ||
      (i.name || '').toLowerCase().includes('oxford') ||
      (i.name || '').toLowerCase().includes('heel') ||
      (i.name || '').toLowerCase().includes('boot')
    );
    if (!hasDressShoes) {
      suggestions.push({
        key: 'polished_shoes',
        title: 'Polished Leather Loafers or Dress Shoes',
        category: 'shoes',
        importance: 'medium',
        reason: 'Elevates casual outfits for semi-formal and professional settings.',
        explanation: 'Your footwear collection would benefit from a versatile leather loafer or dress shoe to elevate your everyday trousers and knits.',
        recommendedSearch: 'shoes',
        actionLabel: 'Explore Dress Shoes'
      });
    }
  }

  // Gap 5: Weather / Travel Outerwear
  if (!dismissedSet.has('versatile_trench_jacket')) {
    if (categories.outerwear.length === 0) {
      suggestions.push({
        key: 'versatile_trench_jacket',
        title: 'Versatile Transitional Trench or Jacket',
        category: 'outerwear',
        importance: 'low',
        reason: 'No outerwear pieces registered in wardrobe.',
        explanation: 'Adding a classic trench coat or light wool jacket provides layer versatility across unpredictable weather and travel.',
        recommendedSearch: 'outerwear',
        actionLabel: 'Explore Outerwear'
      });
    }
  }

  return suggestions;
}

/**
 * Smart Buy-or-Reuse Advisor
 * Compares candidate store product against user's actual wardrobe items
 * @param {object} product - Store product candidate
 * @param {Array} wardrobeItems - User's wardrobe items
 * @returns {object} Analysis result with advice, matching items, and outfit pairing
 */
export function compareProductWithWardrobe(product, wardrobeItems = []) {
  if (!product) {
    return {
      status: 'error',
      headline: 'Product information unavailable.',
      advice: 'Unable to analyze product at this time.'
    };
  }

  const items = Array.isArray(wardrobeItems) ? wardrobeItems : [];

  // Low data edge-case
  if (items.length < 2) {
    return {
      status: 'limited_data',
      headline: 'Limited wardrobe data — add more items for better suggestions.',
      advice: 'We noticed you have few items saved in your digital wardrobe. Adding a few tops, bottoms, and shoes helps StyleSense AI advise whether to buy or reuse.',
      category: product.category_slug || 'fashion',
      closestItems: items,
      pairedOutfits: [],
      newPurchasePrice: Number(product.price) || 0
    };
  }

  const prodCatSlug = (product.category_slug || '').toLowerCase();
  const prodColors = Array.isArray(product.colors)
    ? product.colors.map(c => c.toLowerCase())
    : [String(product.colors || '').toLowerCase()];
  const prodStyles = Array.isArray(product.style_tags)
    ? product.style_tags.map(s => s.toLowerCase())
    : [String(product.style_tags || '').toLowerCase()];

  // 1. Direct substitutes in user's wardrobe
  const sameCategoryItems = items.filter(w => {
    const wCat = (w.category || '').toLowerCase();
    if (prodCatSlug.includes('top') || prodCatSlug.includes('shirt') || prodCatSlug.includes('sweater')) {
      return wCat === 'tops';
    }
    if (prodCatSlug.includes('bottom') || prodCatSlug.includes('trouser') || prodCatSlug.includes('pant') || prodCatSlug.includes('skirt') || prodCatSlug.includes('jean')) {
      return wCat === 'bottoms';
    }
    if (prodCatSlug.includes('outerwear') || prodCatSlug.includes('blazer') || prodCatSlug.includes('coat') || prodCatSlug.includes('jacket')) {
      return wCat === 'outerwear';
    }
    if (prodCatSlug.includes('dress')) {
      return wCat === 'dresses';
    }
    if (prodCatSlug.includes('shoe') || prodCatSlug.includes('sneaker') || prodCatSlug.includes('loafer') || prodCatSlug.includes('boot')) {
      return wCat === 'shoes';
    }
    if (prodCatSlug.includes('accessor')) {
      return wCat === 'accessories';
    }
    return wCat === prodCatSlug;
  });

  // Check if user already owns very similar items (same category + overlapping color/style)
  const similarItems = sameCategoryItems.filter(w => {
    const wColor = (w.color || '').toLowerCase();
    const wStyle = (w.style || '').toLowerCase();
    const colorMatch = prodColors.some(pc => pc.includes(wColor) || wColor.includes(pc));
    const styleMatch = prodStyles.some(ps => ps.includes(wStyle) || wStyle.includes(ps));
    return colorMatch || styleMatch;
  });

  // 2. Complementary companion items in different categories
  const complementaryItems = items.filter(w => {
    const wCat = (w.category || '').toLowerCase();
    // Don't pair with same category
    if (sameCategoryItems.some(sc => sc.id === w.id)) return false;

    // Check color harmony: neutrals match everything; or shared palette
    const wColor = (w.color || '').toLowerCase();
    const isNeutral = ['white', 'black', 'navy', 'ivory', 'charcoal', 'beige', 'grey'].includes(wColor);
    const colorOverlap = prodColors.some(pc => pc.includes(wColor) || wColor.includes(pc));

    return isNeutral || colorOverlap;
  });

  let verdict = '';
  let headline = '';
  let advice = '';

  if (similarItems.length > 0) {
    verdict = 'create_similar_look';
    headline = 'Create a similar look with your wardrobe.';
    advice = `You already own ${similarItems.length} similar item${similarItems.length > 1 ? 's' : ''} (such as "${similarItems[0].name}") with comparable color and styling. Consider styling what you already own before purchasing this piece.`;
  } else if (sameCategoryItems.length === 0) {
    verdict = 'adds_new_category';
    headline = 'Adds a new category to your wardrobe.';
    advice = `You currently have no ${product.category_name || prodCatSlug} recorded in your wardrobe. This piece would expand your style repertoire and fill a genuine category gap.`;
  } else {
    verdict = 'complements_wardrobe';
    headline = 'Complements your existing wardrobe.';
    advice = `This ${product.name} coordinates with ${complementaryItems.length} pieces you already own, giving you versatile new pairing options without requiring extra purchases.`;
  }

  // Create an outfit suggestion combining existing items + this product (or purely existing items if similar look)
  const suggestedOutfit = [];
  if (verdict === 'create_similar_look' && similarItems[0]) {
    suggestedOutfit.push({
      slot: 'Alternative You Own',
      item: similarItems[0],
      isOwned: true
    });
  } else {
    suggestedOutfit.push({
      slot: 'Candidate Purchase',
      item: {
        name: product.name,
        category: product.category_name,
        price: product.price,
        image_url: product.image_url
      },
      isOwned: false
    });
  }

  // Add complementary owned items
  const companionSlots = ['bottoms', 'tops', 'outerwear', 'shoes'];
  for (const slot of companionSlots) {
    const match = complementaryItems.find(i => i.category === slot && !suggestedOutfit.some(so => so.item?.id === i.id));
    if (match && suggestedOutfit.length < 4) {
      suggestedOutfit.push({
        slot: slot.slice(0, -1),
        item: match,
        isOwned: true
      });
    }
  }

  return {
    status: 'analyzed',
    verdict,
    headline,
    advice,
    product: {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      category: product.category_name,
      image_url: product.image_url
    },
    closestItems: similarItems.length > 0 ? similarItems.slice(0, 3) : sameCategoryItems.slice(0, 3),
    complementaryCount: complementaryItems.length,
    suggestedOutfit,
    newPurchasePrice: Number(product.price)
  };
}
