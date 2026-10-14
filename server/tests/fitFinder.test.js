import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { initDatabaseConnection } from '../src/config/db.js';

describe('Part 4: Fit Finder & Size Intelligence API', () => {
  let authToken = '';

  beforeAll(async () => {
    await initDatabaseConnection();

    // Authenticate as Priya (User 2 - Student)
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@stylesense.ai', password: 'Student@123' });

    expect(loginRes.status).toBe(200);
    authToken = loginRes.body.token || (loginRes.headers['set-cookie']?.[0] || '');
  });

  it('1. GET /api/fit/charts returns sizing charts across categories', async () => {
    const res = await request(app).get('/api/fit/charts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('tops');
    expect(res.body.data).toHaveProperty('bottoms');
    expect(res.body.data).toHaveProperty('dresses');
    expect(res.body.data).toHaveProperty('outerwear');
    expect(res.body.data).toHaveProperty('shoes');
  });

  it('2. GET /api/fit/charts/bottoms returns specific bottoms size chart', async () => {
    const res = await request(app).get('/api/fit/charts/bottoms');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category).toBe('bottoms');
    expect(Array.isArray(res.body.data.chart)).toBe(true);
    expect(res.body.data.chart.length).toBeGreaterThan(0);
    expect(res.body.data.chart[0]).toHaveProperty('waist_min');
  });

  it('3. POST /api/fit/evaluate produces "Good data match" with dimension comparison diffs', async () => {
    const res = await request(app)
      .post('/api/fit/evaluate')
      .send({
        category: 'tops',
        chest: 38,
        waist: 31,
        preferred_fit: 'regular',
        measurement_unit: 'in'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.match_level).toBe('Good data match');
    expect(res.body.data.recommended_size).toBe('M');
    expect(res.body.data.confidence_score).toBeGreaterThanOrEqual(90);
    expect(res.body.data.fit_narrative).toContain('chest measurement');
    expect(Array.isArray(res.body.data.dimension_comparisons)).toBe(true);
    expect(res.body.data.dimension_comparisons.length).toBeGreaterThan(0);
    expect(res.body.data.dimension_comparisons[0]).toHaveProperty('difference');
  });

  it('4. POST /api/fit/evaluate adjusts size for "oversized" preferred fit', async () => {
    const res = await request(app)
      .post('/api/fit/evaluate')
      .send({
        category: 'tops',
        chest: 38,
        waist: 31,
        preferred_fit: 'oversized',
        measurement_unit: 'in'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.match_level).toBe('Good data match');
    // M stepped up to L for oversized silhouette
    expect(res.body.data.recommended_size).toBe('L');
    expect(res.body.data.preferred_fit).toBe('oversized');
  });

  it('5. POST /api/fit/evaluate produces "Partial data match" with usual brand sizes only', async () => {
    const res = await request(app)
      .post('/api/fit/evaluate')
      .send({
        category: 'tops',
        usual_brand_sizes: { Zara: 'S', 'H&M': 'S' },
        preferred_fit: 'regular'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.match_level).toBe('Partial data match');
    expect(res.body.data.recommended_size).toBe('S');
  });

  it('6. POST /api/fit/evaluate handles "Insufficient data" cleanly', async () => {
    const res = await request(app)
      .post('/api/fit/evaluate')
      .send({
        category: 'tops'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.match_level).toBe('Insufficient data');
    expect(res.body.data.confidence_score).toBeLessThan(50);
  });

  it('7. GET /api/fit/preferences returns saved user fit profile', async () => {
    const res = await request(app)
      .get('/api/fit/preferences')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('chest');
    expect(res.body.data).toHaveProperty('waist');
    expect(res.body.data).toHaveProperty('preferred_fit');
  });

  it('8. PUT /api/fit/preferences persists updated measurements', async () => {
    const updatePayload = {
      height: 169,
      height_unit: 'cm',
      weight: 59,
      weight_unit: 'kg',
      chest: 36.5,
      waist: 29.0,
      hips: 37.5,
      foot_length: 9.8,
      measurement_unit: 'in',
      shoe_size: 'UK 6',
      shoe_size_system: 'UK',
      preferred_fit: 'relaxed',
      usual_brand_sizes: { Zara: 'M', Mango: 'M' },
      notes: 'Updated tailored fit notes.'
    };

    const res = await request(app)
      .put('/api/fit/preferences')
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.chest).toBe(36.5);
    expect(res.body.data.preferred_fit).toBe('relaxed');

    // Verify GET retrieves updated state
    const verifyRes = await request(app)
      .get('/api/fit/preferences')
      .set('Authorization', `Bearer ${authToken}`);

    expect(verifyRes.body.data.chest).toBe(36.5);
    expect(verifyRes.body.data.preferred_fit).toBe('relaxed');
  });
});
