import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { initDatabaseConnection } from '../src/config/db.js';
import { calculateCostPerWear } from '../src/services/wardrobeService.js';
import { generateOutfitPlan } from '../src/services/plannerService.js';

describe('StyleSense AI — Digital Wardrobe & Outfit Intelligence Tests', () => {
  let user1Token = '';
  let user1Id = null;
  let user2Token = '';
  let user2Id = null;
  let createdItemId = null;
  let user2ItemId = null;
  let savedOutfitId = null;

  beforeAll(async () => {
    await initDatabaseConnection();

    // Login user 1 (student@stylesense.ai)
    const res1 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@stylesense.ai', password: 'Student@123' });
    user1Token = res1.body.token;
    user1Id = res1.body.user.id;

    // Login user 2 (professional@stylesense.ai)
    const res2 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'professional@stylesense.ai', password: 'Professional@123' });
    user2Token = res2.body.token;
    user2Id = res2.body.user.id;
  });

  // --- 1. Creating a wardrobe item ---
  it('Requirement 1: Authenticated user can create a valid wardrobe item', async () => {
    const res = await request(app)
      .post('/api/wardrobe')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Fine Ribbed Knit Mockneck',
        category: 'tops',
        color: 'Ivory',
        style: 'minimalist',
        occasion: 'office',
        size: 'M',
        brand: 'Arket',
        purchase_price: 85.00,
        image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Fine Ribbed Knit Mockneck');
    expect(res.body.data.category).toBe('tops');
    expect(res.body.data.user_id).toBe(user1Id);
    expect(res.body.data.wears_count).toBe(0);
    createdItemId = res.body.data.id;
  });

  // --- 2. Rejecting invalid wardrobe data ---
  it('Requirement 2: Rejects invalid wardrobe item data (missing name, invalid category)', async () => {
    // Missing name
    const resNoName = await request(app)
      .post('/api/wardrobe')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        category: 'tops',
        color: 'Ivory'
      });
    expect(resNoName.status).toBe(400);
    expect(resNoName.body.success).toBe(false);

    // Invalid category
    const resInvalidCat = await request(app)
      .post('/api/wardrobe')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Space Suit',
        category: 'futuristic_spacesuit',
        color: 'Silver'
      });
    expect(resInvalidCat.status).toBe(400);
    expect(resInvalidCat.body.success).toBe(false);
  });

  // --- 3. Preventing access to another user's wardrobe ---
  it("Requirement 3: Enforces ownership and prevents accessing or modifying another user's item", async () => {
    // Create an item as user 2
    const createRes = await request(app)
      .post('/api/wardrobe')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        name: 'Italian Leather Trench',
        category: 'outerwear',
        color: 'Burgundy',
        style: 'chic',
        occasion: 'formal',
        size: 'M',
        purchase_price: 350.00
      });
    expect(createRes.status).toBe(201);
    user2ItemId = createRes.body.data.id;

    // User 1 attempts to fetch User 2's item
    const getRes = await request(app)
      .get(`/api/wardrobe/${user2ItemId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(getRes.status).toBe(403);
    expect(getRes.body.success).toBe(false);

    // User 1 attempts to update User 2's item
    const updateRes = await request(app)
      .put(`/api/wardrobe/${user2ItemId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ name: 'Hacked Item Name' });
    expect(updateRes.status).toBe(403);

    // User 1 attempts to delete User 2's item
    const deleteRes = await request(app)
      .delete(`/api/wardrobe/${user2ItemId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(deleteRes.status).toBe(403);
  });

  // --- 4. Editing and deleting an item ---
  it('Requirement 4: Owner can successfully edit and delete their own wardrobe item', async () => {
    // Edit item
    const updateRes = await request(app)
      .put(`/api/wardrobe/${createdItemId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Updated Merino Knit Mockneck',
        purchase_price: 90.00
      });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe('Updated Merino Knit Mockneck');
    expect(updateRes.body.data.purchase_price).toBe(90.00);

    // Delete item
    const deleteRes = await request(app)
      .delete(`/api/wardrobe/${createdItemId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // Confirm deletion
    const verifyRes = await request(app)
      .get(`/api/wardrobe/${createdItemId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(verifyRes.status).toBe(404);
  });

  // --- 5. Recording item usage ---
  it('Requirement 5: Recording wear increments wear count and creates wear log', async () => {
    // Seeded item 1 belongs to user 1
    const wearRes = await request(app)
      .post('/api/wardrobe/1/wear')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        occasion_worn: 'interview',
        notes: 'Tech presentation'
      });

    expect(wearRes.status).toBe(200);
    expect(wearRes.body.success).toBe(true);
    expect(wearRes.body.data.item.wears_count).toBeGreaterThan(0);
    expect(wearRes.body.data.wearLog.occasion_worn).toBe('interview');
  });

  // --- 6. Calculating cost per wear correctly ---
  it('Requirement 6: Calculates cost per wear correctly for valid price and wear count', () => {
    const result = calculateCostPerWear(150.00, 10);
    expect(result.status).toBe('calculated');
    expect(result.costPerWear).toBe(15.00);

    const result2 = calculateCostPerWear(195.00, 48);
    expect(result2.status).toBe('calculated');
    expect(result2.costPerWear).toBe(4.06);
  });

  // --- 7. Handling zero wears and missing prices ---
  it('Requirement 7: Handles zero wears and missing prices safely without division by zero', () => {
    // 0 wears with price
    const zeroWears = calculateCostPerWear(200.00, 0);
    expect(zeroWears.status).toBe('never_worn');
    expect(zeroWears.costPerWear).toBeNull();
    expect(zeroWears.purchasePrice).toBe(200.00);

    // Missing price with wears
    const missingPrice = calculateCostPerWear(null, 15);
    expect(missingPrice.status).toBe('missing_price');
    expect(missingPrice.costPerWear).toBeNull();

    // Undefined both
    const undefinedBoth = calculateCostPerWear(undefined, 0);
    expect(undefinedBoth.status).toBe('missing_price');
  });

  // --- 8. Generating valid outfit category combinations ---
  it('Requirement 8: Generates complete outfit combinations matching occasion templates', async () => {
    const res = await request(app)
      .post('/api/planner/generate')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        occasion: 'interview',
        preferred_aesthetic: 'classic',
        mode: 'wardrobe_only'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.occasion).toBe('interview');
    expect(res.body.data.slots).toBeDefined();
    expect(res.body.data.slots.top).toBeDefined();
    expect(res.body.data.slots.bottom).toBeDefined();
  });

  // --- 9. Ranking compatible outfits deterministically ---
  it('Requirement 9: Scores and ranks outfit compatibility deterministically', () => {
    const mockWardrobe = [
      { id: 101, category: 'tops', color: 'White', style: 'classic', occasion: 'interview', wears_count: 5 },
      { id: 102, category: 'bottoms', color: 'Charcoal', style: 'classic', occasion: 'interview', wears_count: 5 },
      { id: 103, category: 'shoes', color: 'Brown', style: 'classic', occasion: 'interview', wears_count: 5 },
      { id: 104, category: 'tops', color: 'Neon Yellow', style: 'streetwear', occasion: 'party', wears_count: 1 }
    ];

    const plan1 = generateOutfitPlan({
      occasion: 'interview',
      preferredAesthetic: 'classic',
      preferredColors: ['white', 'charcoal'],
      mode: 'wardrobe_only',
      wardrobeItems: mockWardrobe
    });

    const plan2 = generateOutfitPlan({
      occasion: 'interview',
      preferredAesthetic: 'classic',
      preferredColors: ['white', 'charcoal'],
      mode: 'wardrobe_only',
      wardrobeItems: mockWardrobe
    });

    // Deterministic repeatability
    expect(plan1.compatibilityScore).toBe(plan2.compatibilityScore);
    expect(plan1.slots.top.item.id).toBe(101); // Picks classic interview white top over party top
    expect(plan1.compatibilityScore).toBeGreaterThan(70);
  });

  // --- 10. Respecting budget when recommending new products ---
  it('Requirement 10: Respects budget constraint when including store products in wardrobe_and_store mode', async () => {
    const budgetLimit = 120.00;
    const res = await request(app)
      .post('/api/planner/generate')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        occasion: 'casual',
        budget: budgetLimit,
        mode: 'wardrobe_and_store'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalStoreCost).toBeLessThanOrEqual(budgetLimit);
  });

  // --- 11. Saving and retrieving an outfit ---
  it('Requirement 11: Saves and retrieves named outfits with item associations', async () => {
    const saveRes = await request(app)
      .post('/api/planner/save')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Autumn Campus Layering',
        occasion: 'college',
        notes: 'Cozy knit with selvedge denim',
        items: [
          { slot_name: 'top', item_type: 'wardrobe', wardrobe_item_id: 3, isOwned: true },
          { slot_name: 'bottom', item_type: 'wardrobe', wardrobe_item_id: 4, isOwned: true },
          { slot_name: 'shoes', item_type: 'wardrobe', wardrobe_item_id: 9, isOwned: true }
        ]
      });

    expect(saveRes.status).toBe(201);
    expect(saveRes.body.success).toBe(true);
    savedOutfitId = saveRes.body.data.id;

    // Retrieve saved outfits
    const listRes = await request(app)
      .get('/api/planner/saved')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThan(0);
    const found = listRes.body.data.find(o => o.name === 'Autumn Campus Layering');
    expect(found).toBeDefined();
    expect(found.items.length).toBe(3);
  });

  // --- 12. Comparing a product with actual wardrobe items ---
  it('Requirement 12: Buy-or-Reuse advisor compares candidate store product against user wardrobe', async () => {
    // Seeded store product 1 is 'Merino Wool Mockneck Sweater' (tops)
    // User 1 already owns 'Merino Wool Mockneck Knit' (tops, ivory)
    const res = await request(app)
      .post('/api/advisor/compare')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ product_id: 1 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.verdict).toBeDefined();
    // Since user 1 owns similar top, verdict should advise creating similar look or complements
    expect(['create_similar_look', 'complements_wardrobe', 'adds_new_category']).toContain(res.body.data.verdict);
    expect(res.body.data.headline).toBeDefined();
    expect(res.body.data.suggestedOutfit).toBeDefined();
  });

  // --- 13. Generating wardrobe-gap suggestions from stored data ---
  it('Requirement 13: Generates wardrobe gap suggestions based on actual missing categories or occasions', async () => {
    const res = await request(app)
      .get('/api/wardrobe/gaps')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      expect(res.body.data[0].reason).toBeDefined();
      expect(res.body.data[0].explanation).toBeDefined();
    }
  });

  // --- 14. Rejecting unauthenticated requests ---
  it('Requirement 14: Protects wardrobe endpoints and rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/wardrobe');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);

    const resPlanner = await request(app).post('/api/planner/generate').send({});
    expect(resPlanner.status).toBe(401);
  });

  // --- 15. Preserving existing shopping, cart, wishlist, and order functionality ---
  it('Requirement 15: Existing e-commerce, recommendations, catalog, cart, and orders remain fully operational', async () => {
    // 1. Catalog intact
    const catRes = await request(app).get('/api/products');
    expect(catRes.status).toBe(200);
    expect(catRes.body.meta.total).toBe(52);
    expect(catRes.body.data.length).toBeGreaterThan(0);

    // 2. 100-pt Recommendation engine intact
    const recRes = await request(app)
      .post('/api/recommendations')
      .send({
        style: 'minimalist',
        colors: ['ivory', 'charcoal'],
        budget: 200,
        occasion: 'college'
      });
    expect(recRes.status).toBe(200);
    expect(recRes.body.data.length).toBeGreaterThan(0);
    expect(recRes.body.data[0].recommendationScore).toBeGreaterThan(0);

    // 3. Cart intact
    const cartRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${user1Token}`);
    expect(cartRes.status).toBe(200);

    // 4. Wishlist intact
    const wishRes = await request(app)
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${user1Token}`);
    expect(wishRes.status).toBe(200);
  });
});
