import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { initDatabaseConnection } from '../src/config/db.js';

describe('Part 5: Personal Lookbook & Capsule Builder API', () => {
  let authToken = '';
  let createdLookbookId = null;
  let sharedToken = '';

  beforeAll(async () => {
    await initDatabaseConnection();

    // Authenticate as Priya (User 2)
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@stylesense.ai', password: 'Student@123' });

    expect(loginRes.status).toBe(200);
    authToken = loginRes.body.token;
  });

  it('1. GET /api/lookbooks returns list of user lookbooks with outfit counts', async () => {
    const res = await request(app)
      .get('/api/lookbooks')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('title');
    expect(res.body.data[0]).toHaveProperty('share_token');
    expect(res.body.data[0]).toHaveProperty('outfit_count');
  });

  it('2. GET /api/lookbooks/:id returns populated lookbook with outfit garments', async () => {
    const res = await request(app)
      .get('/api/lookbooks/1')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(1);
    expect(Array.isArray(res.body.data.outfits)).toBe(true);
    expect(res.body.data.outfits.length).toBeGreaterThan(0);
    expect(res.body.data.outfits[0]).toHaveProperty('items');
    expect(res.body.data.outfits[0].items.length).toBeGreaterThan(0);
  });

  it('3. POST /api/lookbooks creates a new lookbook with unique share_token', async () => {
    const payload = {
      title: 'Milan Fashion Week Capsule',
      description: 'Structured tailoring and high-contrast minimalism for runway presentations.',
      theme: 'Editorial Modernist',
      cover_image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1000&auto=format&fit=crop&q=80',
      is_public: true,
      outfit_ids: [1, 2]
    };

    const res = await request(app)
      .post('/api/lookbooks')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Milan Fashion Week Capsule');
    expect(res.body.data.share_token).toBeDefined();
    expect(res.body.data.outfit_count).toBe(2);

    createdLookbookId = res.body.data.id;
    sharedToken = res.body.data.share_token;
  });

  it('4. GET /api/lookbooks/shared/:token allows public read-only access without login', async () => {
    const res = await request(app).get(`/api/lookbooks/shared/${sharedToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Milan Fashion Week Capsule');
    expect(res.body.data.curator_name).toBeDefined();
    expect(Array.isArray(res.body.data.outfits)).toBe(true);
  });

  it('5. PUT /api/lookbooks/:id updates lookbook metadata and privacy', async () => {
    const res = await request(app)
      .put(`/api/lookbooks/${createdLookbookId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Milan Runway Exclusive (Private)',
        is_public: false
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Milan Runway Exclusive (Private)');
    expect(res.body.data.is_public).toBe(false);
  });

  it('6. GET /api/lookbooks/shared/:token rejects private lookbooks with 403', async () => {
    const res = await request(app).get(`/api/lookbooks/shared/${sharedToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('private');
  });

  it('7. DELETE /api/lookbooks/:id deletes the lookbook', async () => {
    const res = await request(app)
      .delete(`/api/lookbooks/${createdLookbookId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify deletion
    const verifyRes = await request(app)
      .get(`/api/lookbooks/${createdLookbookId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(verifyRes.status).toBe(404);
  });
});
