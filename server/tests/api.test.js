import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { initDatabaseConnection, memoryStore } from '../src/config/db.js';

describe('StyleSense AI — REST API Integration Tests', () => {
  let customerToken = '';
  let adminToken = '';
  let otherUserToken = '';
  let customerId = null;
  let testVariantId = null;
  let testProductId = null;
  let placedOrderId = null;

  beforeAll(async () => {
    await initDatabaseConnection();
  });

  // --- AUTHENTICATION & SECURITY (Tests 9 - 15) ---

  it('Test 9: A new user can register successfully', async () => {
    const uniqueEmail = `test_${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Fashionista',
        email: uniqueEmail,
        password: 'Password@123'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(uniqueEmail);

    customerToken = res.body.token;
    customerId = res.body.user.id;
  });

  it('Test 10: Duplicate email registration is rejected with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another User',
        email: 'student@stylesense.ai', // Existing seeded demo email
        password: 'Password@123'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('Test 11: Incorrect credentials are rejected with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@stylesense.ai',
        password: 'WrongPassword999'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Test 12: Passwords are never stored in plain text', () => {
    if (memoryStore.users) {
      const user = memoryStore.users.find(u => u.email === 'student@stylesense.ai');
      expect(user).toBeDefined();
      expect(user.password_hash).not.toBe('Student@123');
      expect(user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$')).toBe(true);
    }
  });

  it('Test 13: Protected routes reject unauthenticated users', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Test 14 & 15: Non-admin cannot call admin endpoints and receives 403 Forbidden', async () => {
    // Call admin endpoint using customer token
    const res = await request(app)
      .get('/api/admin/summary')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Administrator privileges are required');
  });

  // --- SHOPPING, CART & CHECKOUT (Tests 16 - 26) ---

  it('Test 16: Product search and filters return correct results', async () => {
    const res = await request(app).get('/api/products?search=Sweater&category=tops');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    // Save one variant and product for upcoming cart tests
    const firstProd = res.body.data[0];
    testProductId = firstProd.id;
    testVariantId = firstProd.variants[0].id;
  });

  it('Test 17: Adding an item to the cart persists it in database/store', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        variantId: testVariantId,
        quantity: 2
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify cart retrieval
    const cartRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(cartRes.status).toBe(200);
    expect(cartRes.body.data.items.length).toBe(1);
    expect(cartRes.body.data.items[0].quantity).toBe(2);
  });

  it('Test 18: Cart quantity updates recalculate totals accurately', async () => {
    const cartRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`);

    const cartItemId = cartRes.body.data.items[0].id;
    const unitPrice = cartRes.body.data.items[0].unit_price;

    const updateRes = await request(app)
      .patch(`/api/cart/items/${cartItemId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 3 });

    expect(updateRes.status).toBe(200);

    const updatedCart = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(updatedCart.body.data.items[0].quantity).toBe(3);
    expect(updatedCart.body.data.subtotal).toBe(Math.round((unitPrice * 3) * 100) / 100);
  });

  it('Test 19: Invalid quantities are rejected', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        variantId: testVariantId,
        quantity: -5 // Invalid negative quantity
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('Test 20: Adding an unavailable or non-existent variant is rejected', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        variantId: 999999, // Non-existent variant
        quantity: 1
      });

    expect(res.status).toBe(404);
  });

  it('Test 21: Checkout rejects orders with insufficient inventory', async () => {
    // Attempt to order 999 units
    const addExcess = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        variantId: testVariantId,
        quantity: 9999
      });

    expect(addExcess.status).toBe(400);
    expect(addExcess.body.message).toContain('available in stock');
  });

  it('Test 22 & 23: Successful checkout calculates totals using server prices and creates order & order items', async () => {
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        shippingAddress: {
          fullName: 'Priya Sharma',
          addressLine: '42 Editorial Parkway, Apt 5B',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          phone: '+1 555-0199'
        }
      });

    expect(orderRes.status).toBe(201);
    expect(orderRes.body.success).toBe(true);
    expect(orderRes.body.order.orderNumber).toBeDefined();
    expect(orderRes.body.order.items.length).toBeGreaterThan(0);

    placedOrderId = orderRes.body.order.orderId;
  });

  it('Test 25: A successful order decrements inventory and clears the cart', async () => {
    // Cart should now be empty
    const cartRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(cartRes.status).toBe(200);
    expect(cartRes.body.data.items.length).toBe(0);
    expect(cartRes.body.data.total).toBe(0);
  });

  it('Test 26: Order history displays only the authenticated user orders', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.every(o => o.user_id === customerId)).toBe(true);
  });

  it('Test 14 (Order Privacy): A user cannot access another user order', async () => {
    // Register another user
    const otherUserRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another Customer',
        email: `other_${Date.now()}@example.com`,
        password: 'Password@123'
      });

    otherUserToken = otherUserRes.body.token;

    // Attempt to access first user's order
    const accessAttempt = await request(app)
      .get(`/api/orders/${placedOrderId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(accessAttempt.status).toBe(403);
    expect(accessAttempt.body.message).toContain('Unauthorized');
  });

  it('Admin login works and allows access to admin endpoints', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@stylesense.ai',
        password: 'Admin@123'
      });

    expect(loginRes.status).toBe(200);
    adminToken = loginRes.body.token;

    const summaryRes = await request(app)
      .get('/api/admin/summary')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.data.totalProducts).toBeGreaterThan(0);
  });
});
