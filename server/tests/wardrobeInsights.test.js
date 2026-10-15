import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { initDatabaseConnection, memoryStore } from '../src/config/db.js';
import { calculateCostPerWear, generateWardrobeAnalytics } from '../src/services/wardrobeService.js';

describe('Part 7: Wardrobe Impact Insights & Cost-Per-Wear Analytics', () => {
  let authToken = '';
  let userId = null;
  let testItemId = null;

  beforeAll(async () => {
    await initDatabaseConnection();

    // Authenticate as demo user (Priya)
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@stylesense.ai', password: 'Student@123' });

    expect(loginRes.status).toBe(200);
    authToken = loginRes.body.token;
    userId = loginRes.body.user.id;
  });

  // Test 22: Calculating cost per wear
  it('Requirement 22: Calculates cost per wear correctly for garments with logged wears', () => {
    const cpwResult = calculateCostPerWear(6000, 15);
    expect(cpwResult.status).toBe('calculated');
    expect(cpwResult.costPerWear).toBe(400);
    expect(cpwResult.display).toBe('₹400.00');

    const oddCpw = calculateCostPerWear(2499, 7);
    expect(oddCpw.status).toBe('calculated');
    expect(oddCpw.costPerWear).toBe(357);
  });

  // Test 23: Handling zero wears
  it('Requirement 23: Safely handles zero wears displaying "Not worn yet" without division by zero', () => {
    const zeroWearsResult = calculateCostPerWear(4500, 0);
    expect(zeroWearsResult.status).toBe('never_worn');
    expect(zeroWearsResult.costPerWear).toBeNull();
    expect(zeroWearsResult.display).toBe('Not worn yet');
    expect(zeroWearsResult.purchasePrice).toBe(4500);

    const missingPriceResult = calculateCostPerWear(null, 5);
    expect(missingPriceResult.status).toBe('missing_price');
    expect(missingPriceResult.costPerWear).toBeNull();
  });

  // Test 24: Calculating category distribution from real persisted data
  it('Requirement 24: Accurately calculates category distribution and category investments from real data', async () => {
    const mockItems = [
      { id: 101, category: 'tops', purchase_price: 3000, wears_count: 5, created_at: new Date() },
      { id: 102, category: 'tops', purchase_price: 2500, wears_count: 3, created_at: new Date() },
      { id: 103, category: 'bottoms', purchase_price: 4500, wears_count: 8, created_at: new Date() },
      { id: 104, category: 'shoes', purchase_price: 5000, wears_count: 10, created_at: new Date() }
    ];

    const analytics = generateWardrobeAnalytics(mockItems, []);
    expect(analytics.totalItems).toBe(4);
    expect(analytics.totalInvestment).toBe(15000);
    expect(analytics.totalWearsRecorded).toBe(26);

    const topsDist = analytics.categoryDistribution.find(c => c.category === 'tops');
    expect(topsDist).toBeDefined();
    expect(topsDist.count).toBe(2);
    expect(topsDist.percentage).toBe(50);
    expect(topsDist.investment).toBe(5500);

    const bottomsDist = analytics.categoryDistribution.find(c => c.category === 'bottoms');
    expect(bottomsDist).toBeDefined();
    expect(bottomsDist.count).toBe(1);
    expect(bottomsDist.percentage).toBe(25);
    expect(bottomsDist.investment).toBe(4500);
  });

  // Test 25: Displaying empty analytics states gracefully
  it('Requirement 25: Returns clean empty analytics state when wardrobe contains zero items', () => {
    const emptyAnalytics = generateWardrobeAnalytics([], []);
    expect(emptyAnalytics.totalItems).toBe(0);
    expect(emptyAnalytics.totalInvestment).toBe(0);
    expect(emptyAnalytics.averageCostPerWear).toBeNull();
    expect(emptyAnalytics.mostWornItems).toEqual([]);
    expect(emptyAnalytics.underusedItems).toEqual([]);
    expect(emptyAnalytics.categoryDistribution).toEqual([]);
    expect(emptyAnalytics.monthlyWearTrends).toEqual([]);
    expect(emptyAnalytics.status).toBe('empty_wardrobe');
    expect(emptyAnalytics.message).toContain('Add items to your digital wardrobe');
  });

  // Test 25b: Planned shopping budget vs actual recorded purchases
  it('Requirement 25b: Compares planned seasonal budget against actual recorded purchases', () => {
    const mockItems = [
      { id: 201, category: 'tops', purchase_price: 15000, wears_count: 5, created_at: new Date() },
      { id: 202, category: 'outerwear', purchase_price: 25000, wears_count: 2, created_at: new Date() }
    ];
    const mockProfile = { budget_max: 50000 };

    const analytics = generateWardrobeAnalytics(mockItems, [], mockProfile, 3);
    expect(analytics.savedOutfitsCount).toBe(3);
    expect(analytics.budgetComparison.plannedBudget).toBe(50000);
    expect(analytics.budgetComparison.actualInvestment).toBe(40000);
    expect(analytics.budgetComparison.remainingBudget).toBe(10000);
    expect(analytics.budgetComparison.utilizationPercentage).toBe(80);
    expect(analytics.budgetComparison.status).toBe('within_budget');
  });

  // Test 25c: Monthly wear trends aggregation from wear logs
  it('Requirement 25c: Aggregates wear logs into chronological monthly trends', () => {
    const mockLogs = [
      { id: 1, worn_date: '2026-09-15' },
      { id: 2, worn_date: '2026-09-20' },
      { id: 3, worn_date: '2026-10-02' },
      { id: 4, worn_date: '2026-10-14' }
    ];

    const analytics = generateWardrobeAnalytics([{ id: 1, category: 'tops', wears_count: 4, purchase_price: 2000 }], mockLogs);
    expect(analytics.monthlyWearTrends.length).toBe(2);
    expect(analytics.monthlyWearTrends[0].month).toBe('2026-09');
    expect(analytics.monthlyWearTrends[0].wears).toBe(2);
    expect(analytics.monthlyWearTrends[1].month).toBe('2026-10');
    expect(analytics.monthlyWearTrends[1].wears).toBe(2);
  });

  // Test 25d: End-to-end API analytics retrieval
  it('Requirement 25d: GET /api/wardrobe/analytics returns complete intelligence payload for authenticated user', async () => {
    const res = await request(app)
      .get('/api/wardrobe/analytics')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalItems).toBeGreaterThan(0);
    expect(res.body.data.underusedRule).toBeDefined();
    expect(Array.isArray(res.body.data.categoryDistribution)).toBe(true);
    expect(res.body.data.budgetComparison).toBeDefined();
  });

  // Test 25e: Updating incorrect usage records
  it('Requirement 25e: Allows users to update and correct wear counts directly', async () => {
    // Create item
    const createRes = await request(app)
      .post('/api/wardrobe')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Italian Silk Scarf',
        category: 'accessories',
        color: 'Burgundy',
        purchase_price: 4500,
        size: 'One Size'
      });

    expect(createRes.status).toBe(201);
    testItemId = createRes.body.data.id;
    expect(createRes.body.data.wears_count).toBe(0);

    // Update wear count directly to 12
    const updateRes = await request(app)
      .put(`/api/wardrobe/${testItemId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        wears_count: 12
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.wears_count).toBe(12);
    expect(updateRes.body.data.cpw.status).toBe('calculated');
    expect(updateRes.body.data.cpw.costPerWear).toBe(375); // 4500 / 12 = 375
  });
});
