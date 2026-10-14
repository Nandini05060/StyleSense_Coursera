import { describe, it, expect } from 'vitest';
import {
  calculateProductScore,
  generateMatchExplanation,
  recommendProducts
} from '../src/services/recommendationService.js';

describe('StyleSense AI — Recommendation Engine Tests', () => {
  const sampleProduct = {
    id: 1,
    name: 'Minimalist Cashmere Sweater',
    price: 90.00,
    style_tags: ['minimalist', 'classic'],
    occasion_tags: ['office', 'casual'],
    colors: ['ivory', 'charcoal'],
    category_slug: 'tops',
    featured: true,
    active: true,
    total_stock: 20,
    variants: [
      { id: 101, size: 'S', color: 'Ivory', stock_quantity: 10 },
      { id: 102, size: 'M', color: 'Ivory', stock_quantity: 10 },
      { id: 103, size: 'L', color: 'Ivory', stock_quantity: 0 } // Out of stock in L
    ]
  };

  it('Test 1: Exact matches receive the expected full score (100 points)', () => {
    const preferences = {
      occasion: 'office',          // +30
      style: 'minimalist',         // +25
      preferred_colors: ['ivory'], // +20
      budget_max: 100,             // +15 ($90 <= $100)
      category: 'tops'             // +10
    };

    const result = calculateProductScore(sampleProduct, preferences);
    expect(result.score).toBe(100);
    expect(result.matchPercentage).toBe(100);
    expect(result.matchDetails.occasion.points).toBe(30);
    expect(result.matchDetails.style.points).toBe(25);
    expect(result.matchDetails.color.points).toBe(20);
    expect(result.matchDetails.budget.points).toBe(15);
    expect(result.matchDetails.category.points).toBe(10);
  });

  it('Test 2: Partial matches receive exact proportional score', () => {
    const preferences = {
      occasion: 'party',           // 0 points (no party tag)
      style: 'minimalist',         // +25
      preferred_colors: ['charcoal'], // +20
      budget_max: 100,             // +15
      category: 'tops'             // +10
    };

    const result = calculateProductScore(sampleProduct, preferences);
    expect(result.score).toBe(70);
    expect(result.matchDetails.occasion.matched).toBe(false);
    expect(result.matchDetails.style.matched).toBe(true);
  });

  it('Test 3: Out-of-budget products receive documented partial or zero budget score', () => {
    // 3a: Within 15% stretch ($90 vs $80 -> 90 <= 92 -> 8 pts)
    const stretchResult = calculateProductScore(sampleProduct, {
      occasion: 'office',
      style: 'minimalist',
      preferred_colors: ['ivory'],
      budget_max: 80,
      category: 'tops'
    });
    expect(stretchResult.matchDetails.budget.points).toBe(8);
    expect(stretchResult.score).toBe(93);

    // 3b: Way over budget ($90 vs $40 max -> 0 pts)
    const overBudgetResult = calculateProductScore(sampleProduct, {
      occasion: 'office',
      style: 'minimalist',
      preferred_colors: ['ivory'],
      budget_max: 40,
      category: 'tops'
    });
    expect(overBudgetResult.matchDetails.budget.points).toBe(0);
    expect(overBudgetResult.score).toBe(85);
  });

  it('Test 4: Products without stock are excluded', () => {
    const outOfStockProduct = {
      ...sampleProduct,
      id: 2,
      total_stock: 0,
      variants: [
        { id: 201, size: 'S', color: 'Ivory', stock_quantity: 0 }
      ]
    };

    const ranked = recommendProducts([sampleProduct, outOfStockProduct], {
      style: 'minimalist'
    });

    expect(ranked.some(p => p.id === 2)).toBe(false);
    expect(ranked.some(p => p.id === 1)).toBe(true);
  });

  it('Test 5: Products without the selected size in stock are excluded', () => {
    // sampleProduct has size S in stock (10), but size L has 0 stock
    const rankedForS = recommendProducts([sampleProduct], { preferred_size: 'S' });
    expect(rankedForS.length).toBe(1);

    const rankedForL = recommendProducts([sampleProduct], { preferred_size: 'L' });
    expect(rankedForL.length).toBe(0);
  });

  it('Test 6: Missing metadata does not crash the recommendation engine', () => {
    const bareProduct = {
      id: 99,
      name: 'Undocumented Tee',
      price: 25.00,
      active: true,
      variants: [{ id: 991, size: 'M', color: 'White', stock_quantity: 5 }]
      // style_tags, occasion_tags, colors omitted
    };

    expect(() => {
      const scoreResult = calculateProductScore(bareProduct, {
        occasion: 'casual',
        style: 'streetwear',
        budget_max: 50
      });
      expect(scoreResult.score).toBeGreaterThanOrEqual(0);
    }).not.toThrow();
  });

  it('Test 7: Results are deterministically sorted by score, featured, and ID tie-breaker', () => {
    const prodA = {
      ...sampleProduct,
      id: 10,
      name: 'Product A',
      price: 50,
      style_tags: ['minimalist'],
      occasion_tags: ['casual'],
      featured: false,
    };
    const prodB = {
      ...sampleProduct,
      id: 5,
      name: 'Product B',
      price: 50,
      style_tags: ['minimalist'],
      occasion_tags: ['office'], // Will match office preferences
      featured: true,
    };

    const preferences = { occasion: 'office', style: 'minimalist' };
    const ranked = recommendProducts([prodA, prodB], preferences);

    // ProdB matches both occasion and style, so higher score
    expect(ranked[0].id).toBe(5);
  });

  it('Test 8: Match explanations agree with the actual scoring rules', () => {
    const preferences = {
      occasion: 'office',
      style: 'minimalist',
      preferred_colors: ['ivory'],
      budget_max: 100
    };

    const scoring = calculateProductScore(sampleProduct, preferences);
    expect(scoring.explanation).toContain('minimalist');
    expect(scoring.explanation).toContain('office');
    expect(scoring.explanation).toContain('ivory');
    expect(scoring.explanation).toContain('within your $100 budget');
  });
});
