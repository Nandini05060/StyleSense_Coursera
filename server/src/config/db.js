import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { config } from './env.js';
import { categoriesData, productsData } from '../../database/mockData.js';

let pool = null;
let isMySQLConnected = false;
let dbStatusMessage = '';

// In-Memory Relational Fallback Store
const memoryStore = {
  users: [],
  user_preferences: [],
  categories: [],
  products: [],
  product_variants: [],
  wishlists: [],
  carts: [],
  cart_items: [],
  orders: [],
  order_items: [],
  wardrobe_items: [],
  saved_outfits: [],
  saved_outfit_items: [],
  wardrobe_wear_logs: [],
  dismissed_gap_suggestions: [],
  user_style_profiles: [],
  nextId: {
    users: 1,
    user_preferences: 1,
    categories: 1,
    products: 1,
    product_variants: 1,
    wishlists: 1,
    carts: 1,
    cart_items: 1,
    orders: 1,
    order_items: 1,
    wardrobe_items: 1,
    saved_outfits: 1,
    saved_outfit_items: 1,
    wardrobe_wear_logs: 1,
    dismissed_gap_suggestions: 1,
    user_style_profiles: 1,
  }
};

/**
 * Initialize Memory Store with Demo Data
 */
async function initMemoryStore() {
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const studentHash = await bcrypt.hash('Student@123', 10);
  const proHash = await bcrypt.hash('Professional@123', 10);

  memoryStore.users = [
    { id: 1, name: 'StyleSense Admin', email: 'admin@stylesense.ai', password_hash: adminHash, role: 'admin', created_at: new Date() },
    { id: 2, name: 'Priya Sharma (Student)', email: 'student@stylesense.ai', password_hash: studentHash, role: 'customer', created_at: new Date() },
    { id: 3, name: 'Nandini Verma (Professional)', email: 'professional@stylesense.ai', password_hash: proHash, role: 'customer', created_at: new Date() },
  ];
  memoryStore.nextId.users = 4;

  memoryStore.user_preferences = [
    {
      id: 1,
      user_id: 2,
      preferred_style: 'minimalist',
      preferred_colors: ['ivory', 'charcoal', 'beige'],
      preferred_size: 'S',
      budget_min: 25.00,
      budget_max: 100.00,
      preferred_occasion: 'college',
      updated_at: new Date()
    },
    {
      id: 2,
      user_id: 3,
      preferred_style: 'chic',
      preferred_colors: ['burgundy', 'charcoal', 'ivory'],
      preferred_size: 'M',
      budget_min: 50.00,
      budget_max: 250.00,
      preferred_occasion: 'office',
      updated_at: new Date()
    }
  ];
  memoryStore.nextId.user_preferences = 3;

  // Extended Style Profiles
  memoryStore.user_style_profiles = [
    {
      id: 1,
      user_id: 2,
      preferred_aesthetics: ['minimalist', 'classic'],
      preferred_colors: ['ivory', 'charcoal', 'beige', 'navy'],
      favorite_categories: ['tops', 'bottoms', 'shoes'],
      preferred_occasions: ['college', 'casual', 'interview'],
      budget_min: 25.00,
      budget_max: 120.00,
      lifestyle_tags: ['University Student', 'Commuter', 'Coffee Shop Study'],
      notes: 'Values versatile capsule wardrobe essentials that transition from classes to internships.',
      updated_at: new Date()
    },
    {
      id: 2,
      user_id: 3,
      preferred_aesthetics: ['chic', 'minimalist'],
      preferred_colors: ['burgundy', 'charcoal', 'ivory', 'black'],
      favorite_categories: ['outerwear', 'tops', 'dresses'],
      preferred_occasions: ['office', 'formal', 'party'],
      budget_min: 50.00,
      budget_max: 300.00,
      lifestyle_tags: ['Tech Professional', 'Client Meetings', 'Evening Dinners'],
      notes: 'Focuses on structured silhouettes, luxury fabrics, and understated elegance.',
      updated_at: new Date()
    }
  ];
  memoryStore.nextId.user_style_profiles = 3;

  // Seed Realistic Digital Wardrobe for Priya (User 2)
  const initialWardrobeUser2 = [
    {
      id: 1,
      user_id: 2,
      name: 'Crisp White Poplin Shirt',
      category: 'tops',
      color: 'White',
      style: 'minimalist',
      occasion: 'office',
      size: 'M',
      brand: 'Everlane',
      purchase_price: 68.00,
      wears_count: 14,
      is_favorite: true,
      image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 90 * 86400000),
      updated_at: new Date()
    },
    {
      id: 2,
      user_id: 2,
      name: 'Heavyweight Boxy Charcoal Tee',
      category: 'tops',
      color: 'Charcoal',
      style: 'streetwear',
      occasion: 'casual',
      size: 'M',
      brand: 'Uniqlo U',
      purchase_price: 24.00,
      wears_count: 32,
      is_favorite: true,
      image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 120 * 86400000),
      updated_at: new Date()
    },
    {
      id: 3,
      user_id: 2,
      name: 'Merino Wool Mockneck Knit',
      category: 'tops',
      color: 'Ivory',
      style: 'minimalist',
      occasion: 'college',
      size: 'M',
      brand: 'Arket',
      purchase_price: 110.00,
      wears_count: 18,
      is_favorite: true,
      image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 60 * 86400000),
      updated_at: new Date()
    },
    {
      id: 4,
      user_id: 2,
      name: 'Straight-Leg Raw Selvedge Denim',
      category: 'bottoms',
      color: 'Navy',
      style: 'classic',
      occasion: 'casual',
      size: '30',
      brand: 'A.P.C.',
      purchase_price: 145.00,
      wears_count: 38,
      is_favorite: true,
      image_url: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=600&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 150 * 86400000),
      updated_at: new Date()
    },
    {
      id: 5,
      user_id: 2,
      name: 'Pleated Charcoal Tailored Trousers',
      category: 'bottoms',
      color: 'Charcoal',
      style: 'minimalist',
      occasion: 'interview',
      size: '30',
      brand: 'COS',
      purchase_price: 95.00,
      wears_count: 9,
      is_favorite: false,
      image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 75 * 86400000),
      updated_at: new Date()
    },
    {
      id: 6,
      user_id: 2,
      name: 'Relaxed Tapered Linen Pants',
      category: 'bottoms',
      color: 'Beige',
      style: 'minimalist',
      occasion: 'college',
      size: '30',
      brand: 'Muji',
      purchase_price: 58.00,
      wears_count: 5,
      is_favorite: false,
      image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 45 * 86400000),
      updated_at: new Date()
    },
    {
      id: 7,
      user_id: 2,
      name: 'Italian Wool Navy Tailored Blazer',
      category: 'outerwear',
      color: 'Navy',
      style: 'classic',
      occasion: 'interview',
      size: 'M',
      brand: 'SuitSupply',
      purchase_price: 240.00,
      wears_count: 7,
      is_favorite: true,
      image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 100 * 86400000),
      updated_at: new Date()
    },
    {
      id: 8,
      user_id: 2,
      name: 'Oversized Khaki Double-Breasted Trench',
      category: 'outerwear',
      color: 'Beige',
      style: 'classic',
      occasion: 'travel',
      size: 'M',
      brand: 'Mango',
      purchase_price: 180.00,
      wears_count: 2,
      is_favorite: false,
      image_url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 95 * 86400000), // Owned 95 days, only 2 wears => underused highlight!
      updated_at: new Date()
    },
    {
      id: 9,
      user_id: 2,
      name: 'Clean White Leather Court Sneakers',
      category: 'shoes',
      color: 'White',
      style: 'minimalist',
      occasion: 'college',
      size: '41',
      brand: 'Common Projects',
      purchase_price: 195.00,
      wears_count: 48,
      is_favorite: true,
      image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 180 * 86400000),
      updated_at: new Date()
    },
    {
      id: 10,
      user_id: 2,
      name: 'Cognac Leather Penny Loafers',
      category: 'shoes',
      color: 'Brown',
      style: 'classic',
      occasion: 'office',
      size: '41',
      brand: 'G.H. Bass',
      purchase_price: 135.00,
      wears_count: 11,
      is_favorite: false,
      image_url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 110 * 86400000),
      updated_at: new Date()
    },
    {
      id: 11,
      user_id: 2,
      name: 'Vegetable-Tanned Saddle Leather Belt',
      category: 'accessories',
      color: 'Brown',
      style: 'classic',
      occasion: 'office',
      size: '32',
      brand: 'Tanner Goods',
      purchase_price: 45.00,
      wears_count: 36,
      is_favorite: false,
      image_url: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 140 * 86400000),
      updated_at: new Date()
    },
    {
      id: 12,
      user_id: 2,
      name: 'Silk Knit Burgundy Tie',
      category: 'accessories',
      color: 'Burgundy',
      style: 'chic',
      occasion: 'formal',
      size: 'One Size',
      brand: "Drake's",
      purchase_price: 75.00,
      wears_count: 0, // Zero wear demo!
      is_favorite: false,
      image_url: 'https://images.unsplash.com/photo-1589756823695-278bc923f962?w=600&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 40 * 86400000),
      updated_at: new Date()
    }
  ];

  memoryStore.wardrobe_items = [...initialWardrobeUser2];
  memoryStore.nextId.wardrobe_items = 13;

  // Initial Saved Outfit for User 2
  memoryStore.saved_outfits = [
    {
      id: 1,
      user_id: 2,
      name: 'Campus Smart Minimalist',
      occasion: 'college',
      notes: 'Everyday campus rotation: merino knit + raw selvedge denim + court sneakers.',
      created_at: new Date(Date.now() - 14 * 86400000),
      updated_at: new Date()
    },
    {
      id: 2,
      user_id: 2,
      name: 'Tech Interview Polished',
      occasion: 'interview',
      notes: 'Classic navy blazer over crisp white shirt and tailored charcoal trousers.',
      created_at: new Date(Date.now() - 7 * 86400000),
      updated_at: new Date()
    }
  ];
  memoryStore.nextId.saved_outfits = 3;

  memoryStore.saved_outfit_items = [
    { id: 1, outfit_id: 1, item_type: 'wardrobe', wardrobe_item_id: 3, product_id: null, variant_id: null, slot_name: 'top' },
    { id: 2, outfit_id: 1, item_type: 'wardrobe', wardrobe_item_id: 4, product_id: null, variant_id: null, slot_name: 'bottom' },
    { id: 3, outfit_id: 1, item_type: 'wardrobe', wardrobe_item_id: 9, product_id: null, variant_id: null, slot_name: 'shoes' },

    { id: 4, outfit_id: 2, item_type: 'wardrobe', wardrobe_item_id: 1, product_id: null, variant_id: null, slot_name: 'top' },
    { id: 5, outfit_id: 2, item_type: 'wardrobe', wardrobe_item_id: 5, product_id: null, variant_id: null, slot_name: 'bottom' },
    { id: 6, outfit_id: 2, item_type: 'wardrobe', wardrobe_item_id: 7, product_id: null, variant_id: null, slot_name: 'outerwear' },
    { id: 7, outfit_id: 2, item_type: 'wardrobe', wardrobe_item_id: 10, product_id: null, variant_id: null, slot_name: 'shoes' }
  ];
  memoryStore.nextId.saved_outfit_items = 8;

  // Initial Wear Logs for Priya
  memoryStore.wardrobe_wear_logs = [
    { id: 1, wardrobe_item_id: 1, user_id: 2, worn_date: '2026-10-10', occasion_worn: 'interview', notes: 'Mock technical interview', created_at: new Date() },
    { id: 2, wardrobe_item_id: 2, user_id: 2, worn_date: '2026-10-12', occasion_worn: 'casual', notes: 'Library study session', created_at: new Date() },
    { id: 3, wardrobe_item_id: 4, user_id: 2, worn_date: '2026-10-12', occasion_worn: 'casual', notes: 'Library study session', created_at: new Date() },
    { id: 4, wardrobe_item_id: 9, user_id: 2, worn_date: '2026-10-13', occasion_worn: 'college', notes: 'Campus commute', created_at: new Date() }
  ];
  memoryStore.nextId.wardrobe_wear_logs = 5;

  memoryStore.categories = categoriesData.map((c, i) => ({
    id: i + 1,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image_url: c.image_url,
    created_at: new Date()
  }));
  memoryStore.nextId.categories = categoriesData.length + 1;

  let vId = 1;
  let pId = 1;
  for (const p of productsData) {
    const cat = memoryStore.categories.find(c => c.slug === p.categorySlug) || memoryStore.categories[0];
    const newProduct = {
      id: pId,
      category_id: cat.id,
      category_name: cat.name,
      category_slug: cat.slug,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: parseFloat(p.price),
      image_url: p.image_url,
      secondary_image_url: p.secondary_image_url || null,
      style_tags: p.style_tags,
      occasion_tags: p.occasion_tags,
      colors: p.colors,
      featured: !!p.featured,
      active: true,
      created_at: new Date()
    };
    memoryStore.products.push(newProduct);

    if (p.variants) {
      for (const v of p.variants) {
        memoryStore.product_variants.push({
          id: vId++,
          product_id: pId,
          size: v.size,
          color: v.color,
          stock_quantity: v.stock_quantity,
          sku: `SKU-${pId}-${v.size}-${v.color}`.toUpperCase().replace(/\s+/g, '-')
        });
      }
    }
    pId++;
  }
  memoryStore.nextId.products = pId;
  memoryStore.nextId.product_variants = vId;
}

/**
 * Initialize Connection
 */
export async function initDatabaseConnection() {
  try {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true,
    });

    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();

    isMySQLConnected = true;
    dbStatusMessage = `Connected to MySQL database '${config.db.database}' at ${config.db.host}:${config.db.port}`;
    console.log(`[Database] ✅ ${dbStatusMessage}`);
  } catch (error) {
    isMySQLConnected = false;
    dbStatusMessage = `MySQL connection failed: ${error.message}`;
    console.warn(`[Database Advisory] ⚠️ ${dbStatusMessage}`);
    console.warn('[Database Advisory] Initializing in-memory relational store with 52 fashion products and demo users.');
    console.warn('[Database Advisory] To connect your local MySQL server:');
    console.warn('  1. Ensure MySQL80 is running');
    console.warn('  2. Verify DB_PASSWORD in server/.env');
    console.warn('  3. Run: npm run db:init && npm run db:seed\n');
    await initMemoryStore();
  }
}

/**
 * Execute parameterized query
 */
export async function query(sql, params = []) {
  if (isMySQLConnected && pool) {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (err) {
      throw err;
    }
  }

  // Fallback to memory store handler
  return executeMemoryQuery(sql, params);
}

/**
 * Transaction runner
 */
export async function transaction(callback) {
  if (isMySQLConnected && pool) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const client = {
        query: async (sql, params = []) => {
          const [res] = await conn.execute(sql, params);
          return res;
        }
      };
      const result = await callback(client);
      await conn.commit();
      return result;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  // Memory transaction simulation with snapshot rollback
  const snapshot = JSON.stringify(memoryStore);
  try {
    const memoryClient = {
      query: async (sql, params) => executeMemoryQuery(sql, params)
    };
    const result = await callback(memoryClient);
    return result;
  } catch (err) {
    const restored = JSON.parse(snapshot);
    Object.assign(memoryStore, restored);
    throw err;
  }
}

/**
 * Memory Store Query Parser / Executor for simulation
 */
function executeMemoryQuery(sql, params = []) {
  const cleanSql = sql.trim();
  const lower = cleanSql.toLowerCase();

  // 1. Single product by ID or slug
  if (lower.includes('from products') && (lower.includes('where p.id =') || lower.includes('where id =') || lower.includes('where p.slug ='))) {
    const idParam = params[0];
    const p = memoryStore.products.find(x => String(x.id) === String(idParam) || x.slug === idParam);
    if (!p) return [];
    const cat = memoryStore.categories.find(c => c.id === p.category_id);
    const variants = memoryStore.product_variants.filter(v => v.product_id === p.id);
    return [{
      ...p,
      category_name: cat?.name || 'Fashion',
      category_slug: cat?.slug || 'tops',
      variants,
      total_stock: variants.reduce((s, v) => s + v.stock_quantity, 0)
    }];
  }

  // 2. SELECT products (all or active)
  if (lower.includes('from products')) {
    let prods = [...memoryStore.products];
    if (!lower.includes('all') && !lower.includes('includeinactive')) {
      prods = prods.filter(p => p.active);
    }
    return prods.map(p => {
      const cat = memoryStore.categories.find(c => c.id === p.category_id);
      const variants = memoryStore.product_variants.filter(v => v.product_id === p.id);
      return {
        ...p,
        category_name: cat?.name || 'Fashion',
        category_slug: cat?.slug || 'tops',
        variants,
        total_stock: variants.reduce((s, v) => s + v.stock_quantity, 0)
      };
    });
  }

  // 3. Categories
  if (lower.includes('from categories')) {
    return [...memoryStore.categories];
  }

  // 4. Users by email
  if (lower.includes('from users') && lower.includes('email =')) {
    const email = params[0]?.toLowerCase();
    const u = memoryStore.users.find(x => x.email.toLowerCase() === email);
    return u ? [u] : [];
  }

  // 5. Users by ID
  if (lower.includes('from users') && lower.includes('id =')) {
    const id = parseInt(params[0], 10);
    const u = memoryStore.users.find(x => x.id === id);
    return u ? [u] : [];
  }

  // 6. Users all
  if (lower.includes('from users')) {
    return [...memoryStore.users];
  }

  // 7. Orders
  if (lower.includes('from orders')) {
    return [...memoryStore.orders];
  }

  // 8. Order items
  if (lower.includes('from order_items')) {
    return [...memoryStore.order_items];
  }

  // Default fallback mock response
  return [];
}

export function getDatabaseStatus() {
  return {
    isMySQLConnected,
    mode: isMySQLConnected ? 'MySQL 8.0' : 'In-Memory Relational Store (Fallback)',
    message: dbStatusMessage,
    stats: {
      products: memoryStore.products.length,
      categories: memoryStore.categories.length,
      users: memoryStore.users.length,
      wardrobeItems: memoryStore.wardrobe_items?.length || 0,
      savedOutfits: memoryStore.saved_outfits?.length || 0,
    }
  };
}

export { memoryStore };
