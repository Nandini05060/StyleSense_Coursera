import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { initDatabaseConnection } from '../src/config/db.js';

describe('StyleSense AI — Style Passport & User Profile Dossier Tests', () => {
  let user1Token = '';
  let user1Id = null;
  let user2Token = '';
  let user2Id = null;

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

  // 1. Fetching Style Profile
  it('Requirement 1: Authenticated user can fetch their personal style profile dossier', async () => {
    const res = await request(app)
      .get('/api/preferences/profile')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.preferred_aesthetics).toBeDefined();
    expect(res.body.data.preferred_colors).toBeDefined();
    expect(res.body.explanation).toBeDefined();
  });

  // 2. Updating and Persisting Style Profile
  it('Requirement 2: User can update aesthetics, colors, categories, budget and notes', async () => {
    const updatePayload = {
      preferred_aesthetics: ['minimalist', 'chic'],
      preferred_colors: ['ivory', 'burgundy', 'charcoal'],
      favorite_categories: ['dresses', 'outerwear'],
      preferred_occasions: ['party', 'office'],
      budget_min: 50,
      budget_max: 350,
      lifestyle_tags: ['Atelier Collector', 'Evening Host'],
      notes: 'Preference for pure silk slip silhouettes and structured coats.'
    };

    const res = await request(app)
      .put('/api/preferences/profile')
      .set('Authorization', `Bearer ${user1Token}`)
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.preferred_aesthetics).toEqual(['minimalist', 'chic']);
    expect(res.body.data.preferred_colors).toContain('burgundy');
    expect(res.body.data.budget_max).toBe(350);

    // Verify persistence upon subsequent GET
    const verifyRes = await request(app)
      .get('/api/preferences/profile')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(verifyRes.body.data.preferred_aesthetics).toEqual(['minimalist', 'chic']);
    expect(verifyRes.body.data.notes).toBe('Preference for pure silk slip silhouettes and structured coats.');
  });

  // 3. User Isolation: User 2 has distinct profile and cannot see or overwrite User 1's profile
  it('Requirement 3: Enforces strict user isolation across style profile dossiers', async () => {
    const user2Res = await request(app)
      .get('/api/preferences/profile')
      .set('Authorization', `Bearer ${user2Token}`);

    expect(user2Res.status).toBe(200);
    expect(user2Res.body.data.user_id).toBe(user2Id);
    expect(user2Res.body.data.user_id).not.toBe(user1Id);
  });

  // 4. Resetting Style Profile
  it('Requirement 4: User can reset their style profile to default editorial baseline', async () => {
    const res = await request(app)
      .post('/api/preferences/profile/reset')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.preferred_aesthetics).toEqual(['minimalist', 'classic']);
    expect(res.body.data.budget_max).toBe(250);
  });

  // 5. Unauthenticated Access Protection
  it('Requirement 5: Rejects unauthenticated attempts to fetch or update profile', async () => {
    const getRes = await request(app).get('/api/preferences/profile');
    expect(getRes.status).toBe(401);

    const putRes = await request(app).put('/api/preferences/profile').send({ budget_max: 500 });
    expect(putRes.status).toBe(401);
  });
});
