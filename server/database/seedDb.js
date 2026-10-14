import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { config } from '../src/config/env.js';
import { categoriesData, productsData } from './mockData.js';

async function seedDatabase() {
  console.log('======================================================');
  console.log('  StyleSense AI — Database Seeder (50+ Products)');
  console.log('======================================================');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
    });

    console.log(`Connected to database '${config.db.database}'`);

    // 1. Seed Demo Accounts
    console.log('Seeding demo accounts...');
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const studentHash = await bcrypt.hash('Student@123', 10);
    const proHash = await bcrypt.hash('Professional@123', 10);

    const demoUsers = [
      { name: 'StyleSense Admin', email: 'admin@stylesense.ai', password_hash: adminHash, role: 'admin' },
      { name: 'Priya Sharma (Student)', email: 'student@stylesense.ai', password_hash: studentHash, role: 'customer' },
      { name: 'Nandini Verma (Professional)', email: 'professional@stylesense.ai', password_hash: proHash, role: 'customer' }
    ];

    for (const u of demoUsers) {
      await connection.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role), password_hash = VALUES(password_hash)`,
        [u.name, u.email, u.password_hash, u.role]
      );
    }

    // Retrieve user IDs
    const [userRows] = await connection.query('SELECT id, email FROM users');
    const userMap = {};
    userRows.forEach(u => { userMap[u.email] = u.id; });

    // Seed User Preferences
    if (userMap['student@stylesense.ai']) {
      await connection.query(
        `INSERT INTO user_preferences (user_id, preferred_style, preferred_colors, preferred_size, budget_min, budget_max, preferred_occasion)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE preferred_style = VALUES(preferred_style), preferred_colors = VALUES(preferred_colors)`,
        [
          userMap['student@stylesense.ai'],
          'minimalist',
          JSON.stringify(['ivory', 'charcoal', 'beige']),
          'S',
          25.00,
          100.00,
          'college'
        ]
      );
    }

    if (userMap['professional@stylesense.ai']) {
      await connection.query(
        `INSERT INTO user_preferences (user_id, preferred_style, preferred_colors, preferred_size, budget_min, budget_max, preferred_occasion)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE preferred_style = VALUES(preferred_style), preferred_colors = VALUES(preferred_colors)`,
        [
          userMap['professional@stylesense.ai'],
          'chic',
          JSON.stringify(['burgundy', 'charcoal', 'ivory']),
          'M',
          50.00,
          250.00,
          'office'
        ]
      );
    }

    // 2. Seed Categories
    console.log('Seeding categories...');
    const catMap = {};
    for (const c of categoriesData) {
      const [res] = await connection.query(
        `INSERT INTO categories (name, slug, description, image_url)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), image_url = VALUES(image_url)`,
        [c.name, c.slug, c.description, c.image_url]
      );
      // Fetch category ID
      const [cRows] = await connection.query('SELECT id FROM categories WHERE slug = ?', [c.slug]);
      if (cRows.length > 0) catMap[c.slug] = cRows[0].id;
    }

    // 3. Seed Products & Variants
    console.log(`Seeding ${productsData.length} fashion products and inventory variants...`);
    let variantCount = 0;

    for (const p of productsData) {
      const categoryId = catMap[p.categorySlug] || 1;
      await connection.query(
        `INSERT INTO products (category_id, name, slug, description, price, image_url, secondary_image_url, style_tags, occasion_tags, colors, featured, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           category_id = VALUES(category_id),
           price = VALUES(price),
           description = VALUES(description),
           image_url = VALUES(image_url),
           secondary_image_url = VALUES(secondary_image_url),
           style_tags = VALUES(style_tags),
           occasion_tags = VALUES(occasion_tags),
           colors = VALUES(colors),
           featured = VALUES(featured)`,
        [
          categoryId,
          p.name,
          p.slug,
          p.description,
          p.price,
          p.image_url,
          p.secondary_image_url || null,
          JSON.stringify(p.style_tags),
          JSON.stringify(p.occasion_tags),
          JSON.stringify(p.colors),
          p.featured ? 1 : 0,
          1
        ]
      );

      const [pRows] = await connection.query('SELECT id FROM products WHERE slug = ?', [p.slug]);
      const productId = pRows[0].id;

      if (p.variants && p.variants.length > 0) {
        for (const v of p.variants) {
          const sku = `SKU-${productId}-${v.size}-${v.color}`.toUpperCase().replace(/\s+/g, '-');
          await connection.query(
            `INSERT INTO product_variants (product_id, size, color, stock_quantity, sku)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE stock_quantity = VALUES(stock_quantity)`,
            [productId, v.size, v.color, v.stock_quantity, sku]
          );
          variantCount++;
        }
      }
    }

    console.log('✅ Seeding completed successfully!');
    console.log(`Total Products seeded: ${productsData.length}`);
    console.log(`Total Variants seeded: ${variantCount}`);
    console.log('\n--- Demo Accounts Available ---');
    console.log('Admin:        admin@stylesense.ai        / Admin@123');
    console.log('Student:      student@stylesense.ai      / Student@123');
    console.log('Professional: professional@stylesense.ai / Professional@123');
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seedDatabase();
