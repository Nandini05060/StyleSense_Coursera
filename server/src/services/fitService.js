/**
 * StyleSense AI — Fit Finder & Size Intelligence Service
 * Category-aware deterministic sizing engine with transparent body measurement comparison.
 */

export const CATEGORY_SIZE_CHARTS = {
  tops: [
    { size: 'XS', chest_min: 34, chest_max: 36, waist_min: 28, waist_max: 30, shoulder: 16.5, sleeve: 32.5 },
    { size: 'S', chest_min: 36, chest_max: 38, waist_min: 30, waist_max: 32, shoulder: 17.0, sleeve: 33.0 },
    { size: 'M', chest_min: 38, chest_max: 40, waist_min: 32, waist_max: 34, shoulder: 17.5, sleeve: 33.5 },
    { size: 'L', chest_min: 40, chest_max: 42, waist_min: 34, waist_max: 37, shoulder: 18.0, sleeve: 34.0 },
    { size: 'XL', chest_min: 42, chest_max: 45, waist_min: 37, waist_max: 40, shoulder: 18.7, sleeve: 34.5 },
    { size: 'XXL', chest_min: 45, chest_max: 48, waist_min: 40, waist_max: 44, shoulder: 19.5, sleeve: 35.0 },
  ],
  bottoms: [
    { size: 'XS', waist_min: 27, waist_max: 29, hips_min: 34, hips_max: 36, inseam: 30.0, rise: 10.0 },
    { size: 'S', waist_min: 29, waist_max: 31, hips_min: 36, hips_max: 38, inseam: 31.0, rise: 10.5 },
    { size: 'M', waist_min: 31, waist_max: 33, hips_min: 38, hips_max: 40, inseam: 32.0, rise: 11.0 },
    { size: 'L', waist_min: 33, waist_max: 36, hips_min: 40, hips_max: 43, inseam: 32.0, rise: 11.5 },
    { size: 'XL', waist_min: 36, waist_max: 39, hips_min: 43, hips_max: 46, inseam: 33.0, rise: 12.0 },
  ],
  dresses: [
    { size: 'XS', bust_min: 32, bust_max: 34, waist_min: 25, waist_max: 27, hips_min: 35, hips_max: 37, length: 38.0 },
    { size: 'S', bust_min: 34, bust_max: 36, waist_min: 27, waist_max: 29, hips_min: 37, hips_max: 39, length: 39.0 },
    { size: 'M', bust_min: 36, bust_max: 38, waist_min: 29, waist_max: 31, hips_min: 39, hips_max: 41, length: 40.0 },
    { size: 'L', bust_min: 38, bust_max: 41, waist_min: 31, waist_max: 34, hips_min: 41, hips_max: 44, length: 41.0 },
    { size: 'XL', bust_min: 41, bust_max: 44, waist_min: 34, waist_max: 37, hips_min: 44, hips_max: 47, length: 42.0 },
  ],
  outerwear: [
    { size: 'XS', chest_min: 35, chest_max: 37, shoulder: 17.0, sleeve: 33.0, length: 28.0 },
    { size: 'S', chest_min: 37, chest_max: 39, shoulder: 17.5, sleeve: 33.5, length: 29.0 },
    { size: 'M', chest_min: 39, chest_max: 41, shoulder: 18.0, sleeve: 34.0, length: 30.0 },
    { size: 'L', chest_min: 41, chest_max: 44, shoulder: 18.8, sleeve: 34.5, length: 31.0 },
    { size: 'XL', chest_min: 44, chest_max: 47, shoulder: 19.5, sleeve: 35.2, length: 31.5 },
  ],
  shoes: [
    { size: 'UK 5', uk: '5', us: '6.5', eu: '39', foot_length_in: 9.3, foot_length_cm: 23.7 },
    { size: 'UK 6', uk: '6', us: '7', eu: '40', foot_length_in: 9.6, foot_length_cm: 24.5 },
    { size: 'UK 7', uk: '7', us: '8', eu: '41', foot_length_in: 10.0, foot_length_cm: 25.4 },
    { size: 'UK 8', uk: '8', us: '9', eu: '42', foot_length_in: 10.3, foot_length_cm: 26.2 },
    { size: 'UK 9', uk: '9', us: '10', eu: '43', foot_length_in: 10.6, foot_length_cm: 27.0 },
    { size: 'UK 10', uk: '10', us: '11', eu: '44', foot_length_in: 11.0, foot_length_cm: 27.9 },
    { size: 'UK 11', uk: '11', us: '12', eu: '45', foot_length_in: 11.3, foot_length_cm: 28.7 },
  ],
};

/**
 * Standardize category names from various labels (e.g. 'shirts', 'jackets', 'footwear')
 */
export function normalizeCategory(category = '') {
  const cat = String(category).toLowerCase().trim();
  if (cat.includes('shoe') || cat.includes('footwear') || cat.includes('sneaker') || cat.includes('boot') || cat.includes('loafer')) {
    return 'shoes';
  }
  if (cat.includes('outerwear') || cat.includes('blazer') || cat.includes('coat') || cat.includes('jacket')) {
    return 'outerwear';
  }
  if (cat.includes('bottom') || cat.includes('pant') || cat.includes('trouser') || cat.includes('jean') || cat.includes('skirt') || cat.includes('short')) {
    return 'bottoms';
  }
  if (cat.includes('dress') || cat.includes('gown')) {
    return 'dresses';
  }
  return 'tops';
}

/**
 * Deterministically evaluate fit recommendation for user measurements and category
 */
export function evaluateFitRecommendation({
  category = 'tops',
  chest = null,
  bust = null,
  waist = null,
  hips = null,
  height = null,
  weight = null,
  foot_length = null,
  shoe_size = null,
  shoe_size_system = 'UK',
  preferred_fit = 'regular', // tight | regular | relaxed | oversized
  usual_brand_sizes = {},
  measurement_unit = 'in', // 'in' or 'cm'
  product = null
}) {
  const normCat = normalizeCategory(category || product?.category_name || product?.category_slug || 'tops');
  const chart = CATEGORY_SIZE_CHARTS[normCat] || CATEGORY_SIZE_CHARTS.tops;

  // Convert inputs to inches if entered in cm
  const unitFactor = measurement_unit === 'cm' ? 1 / 2.54 : 1;
  const userChest = (parseFloat(chest) || parseFloat(bust) || null) ? (parseFloat(chest) || parseFloat(bust)) * unitFactor : null;
  const userWaist = parseFloat(waist) ? parseFloat(waist) * unitFactor : null;
  const userHips = parseFloat(hips) ? parseFloat(hips) * unitFactor : null;
  const userFootLength = parseFloat(foot_length) ? parseFloat(foot_length) * unitFactor : null;

  // Step 1: Determine Match Quality Level
  let matchLevel = 'Insufficient data';
  let confidence = 35;

  const hasDirectTopsMeasurement = normCat === 'tops' && (userChest !== null || userWaist !== null);
  const hasDirectBottomsMeasurement = normCat === 'bottoms' && (userWaist !== null || userHips !== null);
  const hasDirectDressesMeasurement = normCat === 'dresses' && (userChest !== null || userWaist !== null || userHips !== null);
  const hasDirectOuterwearMeasurement = normCat === 'outerwear' && userChest !== null;
  const hasDirectShoesMeasurement = normCat === 'shoes' && (userFootLength !== null || shoe_size);

  const hasDirectMeasurement = hasDirectTopsMeasurement || hasDirectBottomsMeasurement || hasDirectDressesMeasurement || hasDirectOuterwearMeasurement || hasDirectShoesMeasurement;

  const hasBrandSizes = usual_brand_sizes && typeof usual_brand_sizes === 'object' && Object.keys(usual_brand_sizes).length > 0;
  const hasHeightWeight = (height && parseFloat(height) > 0) || (weight && parseFloat(weight) > 0);

  if (hasDirectMeasurement) {
    matchLevel = 'Good data match';
    confidence = 94;
  } else if (hasBrandSizes || hasHeightWeight) {
    matchLevel = 'Partial data match';
    confidence = 72;
  } else {
    matchLevel = 'Insufficient data';
    confidence = 35;
  }

  // Step 2: Determine Baseline Recommended Size
  let recommendedSize = 'M';
  let comparisonDetails = [];
  let fitNarrative = '';
  let fitAdvice = '';

  if (normCat === 'shoes') {
    // Shoe sizing logic
    const shoeChart = CATEGORY_SIZE_CHARTS.shoes;
    let matchedShoe = null;

    if (userFootLength) {
      matchedShoe = shoeChart.find(s => userFootLength <= s.foot_length_in + 0.15) || shoeChart[shoeChart.length - 1];
    } else if (shoe_size) {
      const cleanSize = String(shoe_size).toUpperCase().replace(/UK|US|EU/g, '').trim();
      matchedShoe = shoeChart.find(s => s.uk === cleanSize || s.us === cleanSize || s.eu === cleanSize) || shoeChart[2];
    } else if (usual_brand_sizes && (usual_brand_sizes.Nike || usual_brand_sizes.Adidas)) {
      const ref = String(usual_brand_sizes.Nike || usual_brand_sizes.Adidas).toUpperCase();
      matchedShoe = shoeChart.find(s => ref.includes(s.uk) || ref.includes(s.eu) || ref.includes(s.us)) || shoeChart[2];
    } else {
      matchedShoe = shoeChart[2]; // UK 7 default
    }

    recommendedSize = matchedShoe.size;
    const userFootDisplay = userFootLength ? `${(userFootLength / unitFactor).toFixed(1)} ${measurement_unit}` : 'Standard';
    comparisonDetails.push({
      dimension: 'Foot Length',
      user_value: userFootDisplay,
      recommended_spec: `${(matchedShoe.foot_length_in / unitFactor).toFixed(1)} ${measurement_unit}`,
      difference: userFootLength
        ? `${((matchedShoe.foot_length_in - userFootLength) / unitFactor).toFixed(1)} ${measurement_unit} toe room`
        : 'True to benchmark size',
      status: 'comfort'
    });

    fitNarrative = userFootLength
      ? `Your foot length (${userFootDisplay}) aligns directly with ${matchedShoe.size} (${matchedShoe.eu} EU / ${matchedShoe.us} US), providing comfortable toe clearance.`
      : `Based on your usual footwear profile, ${matchedShoe.size} provides an accurate true-to-size luxury fit.`;

    fitAdvice = 'Italian and Spanish lasts run true to size. If between sizes with thick winter socks, consider sizing up.';
  } else {
    // Apparel sizing logic (tops, bottoms, dresses, outerwear)
    let primaryVal = null;
    let primaryMinKey = 'chest_min';
    let primaryMaxKey = 'chest_max';
    let primaryLabel = 'Chest';

    if (normCat === 'bottoms') {
      primaryVal = userWaist || (userHips ? userHips - 7 : null);
      primaryMinKey = 'waist_min';
      primaryMaxKey = 'waist_max';
      primaryLabel = 'Waist';
    } else if (normCat === 'dresses') {
      primaryVal = userChest || userWaist || null;
      primaryMinKey = userChest ? 'bust_min' : 'waist_min';
      primaryMaxKey = userChest ? 'bust_max' : 'waist_max';
      primaryLabel = userChest ? 'Bust' : 'Waist';
    } else if (normCat === 'outerwear') {
      primaryVal = userChest;
      primaryMinKey = 'chest_min';
      primaryMaxKey = 'chest_max';
      primaryLabel = 'Chest';
    } else {
      primaryVal = userChest || (userWaist ? userWaist + 6 : null);
      primaryMinKey = 'chest_min';
      primaryMaxKey = 'chest_max';
      primaryLabel = 'Chest';
    }

    let candidateIndex = 2; // Default to 'M' (index 2)

    if (primaryVal !== null) {
      // Find candidate: prefer the size where measurement is comfortably housed within [min, max)
      // so boundary value (e.g. 38 in) matches Medium (38-40) rather than maxed-out Small (36-38)
      const exactIdx = chart.findIndex((item, idx) => {
        if (idx === chart.length - 1) {
          return primaryVal >= item[primaryMinKey] && primaryVal <= item[primaryMaxKey];
        }
        return primaryVal >= item[primaryMinKey] && primaryVal < item[primaryMaxKey];
      });

      if (exactIdx !== -1) {
        candidateIndex = exactIdx;
      } else if (primaryVal < chart[0][primaryMinKey]) {
        candidateIndex = 0;
      } else {
        candidateIndex = chart.length - 1;
      }
    } else if (usual_brand_sizes && (usual_brand_sizes.Zara || usual_brand_sizes['H&M'] || usual_brand_sizes.Uniqlo)) {
      const usual = String(usual_brand_sizes.Zara || usual_brand_sizes['H&M'] || usual_brand_sizes.Uniqlo).toUpperCase();
      const mappedIdx = chart.findIndex(item => item.size.toUpperCase() === usual);
      if (mappedIdx !== -1) candidateIndex = mappedIdx;
    }

    // Step 3: Apply Preferred Fit Modifier (tight, regular, relaxed, oversized)
    let adjustedIndex = candidateIndex;
    if (preferred_fit === 'tight' && candidateIndex > 0) {
      // If close to lower bound of current size, can step down
      adjustedIndex = Math.max(0, candidateIndex - 1);
    } else if (preferred_fit === 'relaxed') {
      // If near top half of candidate size, step up
      if (candidateIndex < chart.length - 1) {
        adjustedIndex = Math.min(chart.length - 1, candidateIndex + 1);
      }
    } else if (preferred_fit === 'oversized') {
      // Intentionally size up for dramatic editorial drape
      adjustedIndex = Math.min(chart.length - 1, candidateIndex + 1);
    }

    const matchedSizeSpec = chart[adjustedIndex] || chart[2];
    recommendedSize = matchedSizeSpec.size;

    // Step 4: Transparent Comparison Differences
    if (primaryVal !== null) {
      const minVal = matchedSizeSpec[primaryMinKey];
      const maxVal = matchedSizeSpec[primaryMaxKey];
      const midVal = (minVal + maxVal) / 2;
      const diffInches = midVal - primaryVal;
      const diffDisplay = (diffInches / unitFactor).toFixed(1);
      const userValDisplay = `${(primaryVal / unitFactor).toFixed(1)} ${measurement_unit}`;
      const rangeDisplay = `${(minVal / unitFactor).toFixed(0)}-${(maxVal / unitFactor).toFixed(0)} ${measurement_unit}`;

      comparisonDetails.push({
        dimension: primaryLabel,
        user_value: userValDisplay,
        recommended_spec: rangeDisplay,
        difference: diffInches >= 0 ? `+${diffDisplay} ${measurement_unit} ease` : `${diffDisplay} ${measurement_unit} snug`,
        status: Math.abs(diffInches) <= 1.0 ? 'optimal' : diffInches > 1.0 ? 'comfort' : 'snug'
      });

      // Secondary dimension comparison if user provided it
      if (normCat === 'tops' && userWaist !== null && matchedSizeSpec.waist_min) {
        const wMin = matchedSizeSpec.waist_min;
        const wMax = matchedSizeSpec.waist_max;
        const wMid = (wMin + wMax) / 2;
        const wDiff = (wMid - userWaist) / unitFactor;
        comparisonDetails.push({
          dimension: 'Waist',
          user_value: `${(userWaist / unitFactor).toFixed(1)} ${measurement_unit}`,
          recommended_spec: `${(wMin / unitFactor).toFixed(0)}-${(wMax / unitFactor).toFixed(0)} ${measurement_unit}`,
          difference: wDiff >= 0 ? `+${wDiff.toFixed(1)} ${measurement_unit} ease` : `${wDiff.toFixed(1)} ${measurement_unit} snug`,
          status: Math.abs(wDiff) <= 1.0 ? 'optimal' : 'comfort'
        });
      }

      if (normCat === 'bottoms' && userHips !== null && matchedSizeSpec.hips_min) {
        const hMin = matchedSizeSpec.hips_min;
        const hMax = matchedSizeSpec.hips_max;
        const hMid = (hMin + hMax) / 2;
        const hDiff = (hMid - userHips) / unitFactor;
        comparisonDetails.push({
          dimension: 'Hips',
          user_value: `${(userHips / unitFactor).toFixed(1)} ${measurement_unit}`,
          recommended_spec: `${(hMin / unitFactor).toFixed(0)}-${(hMax / unitFactor).toFixed(0)} ${measurement_unit}`,
          difference: hDiff >= 0 ? `+${hDiff.toFixed(1)} ${measurement_unit} ease` : `${hDiff.toFixed(1)} ${measurement_unit} snug`,
          status: Math.abs(hDiff) <= 1.5 ? 'optimal' : 'comfort'
        });
      }

      fitNarrative = `Your ${primaryLabel.toLowerCase()} measurement (${userValDisplay}) fits comfortably within ${recommendedSize} (${rangeDisplay}).`;
      if (preferred_fit !== 'regular') {
        fitNarrative += ` Adjusted for your preference of a ${preferred_fit} silhouette.`;
      }
    } else {
      fitNarrative = `Recommended size ${recommendedSize} is based on your calibrated style profile and usual brand sizing.`;
    }

    if (preferred_fit === 'oversized') {
      fitAdvice = 'Cut for a relaxed boxy drape. Stick with this recommended size for intentional volume, or size down for classic tailored lines.';
    } else if (preferred_fit === 'tight') {
      fitAdvice = 'Form-fitting cut. Garment will contour closely to your waist and torso.';
    } else {
      fitAdvice = 'True to luxury tailoring proportions. Structured across shoulders with balanced ease through the torso.';
    }
  }

  // Filter size chart to relevant display dimensions for UI table
  const formattedChart = chart.map(row => {
    const formattedRow = { size: row.size };
    Object.keys(row).forEach(key => {
      if (key !== 'size') {
        const val = row[key];
        if (typeof val === 'number') {
          formattedRow[key] = measurement_unit === 'cm' ? (val * 2.54).toFixed(1) : val;
        } else {
          formattedRow[key] = val;
        }
      }
    });
    return formattedRow;
  });

  return {
    category: normCat,
    match_level: matchLevel,
    confidence_score: confidence,
    recommended_size: recommendedSize,
    preferred_fit,
    measurement_unit,
    fit_narrative: fitNarrative,
    fit_advice: fitAdvice,
    dimension_comparisons: comparisonDetails,
    size_chart: formattedChart,
    is_good_data_match: matchLevel === 'Good data match',
  };
}
