import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { initDatabaseConnection } from '../src/config/db.js';
import { evaluateOutfitCompatibility } from '../src/services/outfitService.js';

describe('StyleSense AI — Mix & Match Studio & Compatibility Engine Tests', () => {
  let user1Token = '';
  let user1Id = null;
  let user2Token = '';
  let user2Id = null;
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

  // 1. Compatibility Service: Deterministic Scoring
  it('Requirement 1: evaluateOutfitCompatibility computes deterministic scores & breakdown', () => {
    const mockItems = [
      {
        id: 1,
        name: 'Merino Wool Mockneck Sweater',
        category: 'tops',
        color: 'ivory',
        style_tags: ['minimalist', 'classic'],
        occasion_tags: ['casual', 'office'],
        price: 89.00,
        isOwned: false
      },
      {
        id: 2,
        name: 'Pleated Wide-Leg Trousers',
        category: 'bottoms',
        color: 'charcoal',
        style_tags: ['minimalist', 'classic'],
        occasion_tags: ['casual', 'office'],
        price: 115.00,
        isOwned: true // User owns this!
      },
      {
        id: 3,
        name: 'Minimalist Clean Leather Sneakers',
        category: 'shoes',
        color: 'white',
        style_tags: ['minimalist', 'casual'],
        occasion_tags: ['casual'],
        price: 110.00,
        isOwned: false
      }
    ];

    const result = evaluateOutfitCompatibility(mockItems, { targetOccasion: 'casual', targetStyle: 'minimalist' });

    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.breakdown.occasionScore).toBeGreaterThan(0);
    expect(result.breakdown.styleScore).toBeGreaterThan(0);
    expect(result.breakdown.colorScore).toBeGreaterThan(0);
    expect(result.breakdown.silhouetteScore).toBe(20); // Top + Bottom (15) + Shoes (5)
    expect(result.explanations.length).toBeGreaterThan(0);
  });

  // 2. Compatibility Service: Total Price Only Charges For Store Products
  it('Requirement 2: Calculates total price for purchasable store items and excludes owned pieces', () => {
    const mockItems = [
      { id: 10, name: 'Store Top', category: 'tops', price: 90.00, isOwned: false },
      { id: 20, name: 'Wardrobe Bottom', category: 'bottoms', purchase_price: 120.00, isOwned: true },
      { id: 30, name: 'Store Shoes', category: 'shoes', price: 150.00, isOwned: false }
    ];

    const result = evaluateOutfitCompatibility(mockItems);

    // Purchasable total should be 90 + 150 = 240, NOT including the 120 wardrobe piece
    expect(result.totalPurchasablePrice).toBe(240.00);
    expect(result.ownedItemsCount).toBe(1);
    expect(result.purchasableItemsCount).toBe(2);
  });

  // 3. Silhouette Warning: Flags Dress + Bottom Conflict
  it('Requirement 3: Flags silhouette advisory when dress and bottom are simultaneously selected', () => {
    const conflictingItems = [
      { id: 1, name: 'Silk Slip Dress', category: 'dresses', color: 'burgundy', isOwned: false },
      { id: 2, name: 'Trousers', category: 'bottoms', color: 'charcoal', isOwned: false }
    ];

    const result = evaluateOutfitCompatibility(conflictingItems);
    expect(result.hasSilhouetteWarning).toBe(true);
    expect(result.explanations.some(e => e.includes('Silhouette advisory'))).toBe(true);
  });

  // 4. API Endpoint: POST /api/outfits/evaluate
  it('Requirement 4: POST /api/outfits/evaluate returns compatibility evaluation JSON', async () => {
    const res = await request(app)
      .post('/api/outfits/evaluate')
      .send({
        items: [
          { name: 'Oversized Poplin Shirt', category: 'tops', color: 'white', style: 'minimalist', occasion: 'office', price: 68.00, isOwned: false },
          { name: 'Tailored Wool Trousers', category: 'bottoms', color: 'charcoal', style: 'classic', occasion: 'office', price: 140.00, isOwned: true }
        ],
        targetOccasion: 'office',
        targetStyle: 'classic'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.score).toBeDefined();
    expect(res.body.data.totalPurchasablePrice).toBe(68.00);
    expect(res.body.data.ownedItemsCount).toBe(1);
  });

  // 5. Saving an Outfit via POST /api/planner/save
  it('Requirement 5: Authenticated user can save a custom mix & match outfit', async () => {
    const res = await request(app)
      .post('/api/planner/save')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Gallery Opening Ensemble',
        occasion: 'party',
        notes: 'Monochrome charcoal with subtle burgundy accent.',
        items: [
          { slot_name: 'top', item_type: 'store_product', product_id: 1, isOwned: false },
          { slot_name: 'shoes', item_type: 'wardrobe', wardrobe_item_id: 1, isOwned: true }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Gallery Opening Ensemble');
    savedOutfitId = res.body.data.id;
  });

  // 6. Retrieving the saved outfit by ID
  it('Requirement 6: User can retrieve their saved outfit by ID with populated items', async () => {
    const res = await request(app)
      .get(`/api/planner/saved/${savedOutfitId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(savedOutfitId);
    expect(res.body.data.name).toBe('Gallery Opening Ensemble');
    expect(res.body.data.items).toBeDefined();
    expect(res.body.data.items.length).toBe(2);
  });

  // 7. Updating and Renaming Saved Outfit via PUT /api/planner/saved/:id
  it('Requirement 7: User can rename and update their saved outfit', async () => {
    const res = await request(app)
      .put(`/api/planner/saved/${savedOutfitId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Gallery Opening Ensemble (Evening Edition)',
        notes: 'Updated with velvet clutch accessory.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify update persisted
    const checkRes = await request(app)
      .get(`/api/planner/saved/${savedOutfitId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(checkRes.body.data.name).toBe('Gallery Opening Ensemble (Evening Edition)');
    expect(checkRes.body.data.notes).toBe('Updated with velvet clutch accessory.');
  });

  // 8. Ownership Protection: User 2 cannot access or update User 1's outfit
  it('Requirement 8: Prevents unauthorized user from viewing or modifying another user outfit', async () => {
    // User 2 trying to get User 1's outfit
    const getRes = await request(app)
      .get(`/api/planner/saved/${savedOutfitId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(getRes.status).toBe(403);

    // User 2 trying to update User 1's outfit
    const putRes = await request(app)
      .put(`/api/planner/saved/${savedOutfitId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ name: 'Hacked Name' });

    expect(putRes.status).toBe(403);
  });

  // 9. Deleting the saved outfit
  it('Requirement 9: User can delete their own saved outfit', async () => {
    const delRes = await request(app)
      .delete(`/api/planner/saved/${savedOutfitId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(delRes.status).toBe(200);

    // Confirm it is gone
    const checkRes = await request(app)
      .get(`/api/planner/saved/${savedOutfitId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(checkRes.status).toBe(404);
  });
});
