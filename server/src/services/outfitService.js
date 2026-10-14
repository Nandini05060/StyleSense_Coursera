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
