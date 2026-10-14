import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { initDatabaseConnection } from '../src/config/db.js';

describe('Part 6: Smart Wishlist & Price Watch API', () => {
  let authToken = '';

  beforeAll(async () => {
    await initDatabaseConnection();

    // Authenticate as Priya (User 2)
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@stylesense.ai', password: 'Student@123' });

    expect(loginRes.status).toBe(200);
    authToken = loginRes.body.token;
  });

  it('1. GET /api/wishlist returns wishlisted items with collections and target price fields', async () => {
    const res = await request(app)
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('collection_name');
    expect(res.body.data[0]).toHaveProperty('target_price');
    expect(res.body.data[0]).toHaveProperty('price_trend');
  });

  it('2. GET /api/wishlist/collections returns user collections with item counts', async () => {
    const res = await request(app)
      .get('/api/wishlist/collections')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const names = res.body.data.map(c => c.name);
    expect(names).toContain('All Saved Pieces');
    expect(names).toContain('Autumn Tailoring');
  });

  it('3. POST /api/wishlist/collections creates a new named collection', async () => {
    const res = await request(app)
      .post('/api/wishlist/collections')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Monochrome Winter Outerwear',
        description: 'Heavyweight wool overcoats and trenches',
        icon: 'feather'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Monochrome Winter Outerwear');
  });

  it('4. PUT /api/wishlist/:productId/price-watch configures target price alert', async () => {
    const res = await request(app)
      .put('/api/wishlist/1/price-watch')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        target_price: 6000.00,
        notes: 'Target updated: waiting for seasonal markdowns.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.target_price).toBe(6000.00);
  });

  it('5. PUT /api/wishlist/:productId/collection reassigns item to new collection', async () => {
    const res = await request(app)
      .put('/api/wishlist/1/collection')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        collection_name: 'Monochrome Winter Outerwear'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.collection_name).toBe('Monochrome Winter Outerwear');
  });

  it('6. GET /api/wishlist/notifications returns price drop alerts', async () => {
    const res = await request(app)
      .get('/api/wishlist/notifications')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].type).toBe('target_price_met');
  });

  it('7. PATCH /api/wishlist/notifications/:id/read marks notification as read', async () => {
    const res = await request(app)
      .patch('/api/wishlist/notifications/1/read')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('8. GET /api/wishlist/price-history/:productId returns chronological price points', async () => {
    const res = await request(app)
      .get('/api/wishlist/price-history/1')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('price');
  });

  it('9. DELETE /api/wishlist/collections/:name deletes collection and moves items to default', async () => {
    const res = await request(app)
      .delete('/api/wishlist/collections/Monochrome Winter Outerwear')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify item 1 is now in 'All Saved Pieces'
    const listRes = await request(app)
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${authToken}`);

    const item1 = listRes.body.data.find(x => x.id === 1);
    expect(item1?.collection_name).toBe('All Saved Pieces');
  });
});
