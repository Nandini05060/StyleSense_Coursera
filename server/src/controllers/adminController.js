import { query, memoryStore } from '../config/db.js';

/**
 * Get catalog and order metrics summary for Admin Dashboard
 */
export async function getAdminSummary(req, res, next) {
  try {
    let products = [];
    let variants = [];
    let orders = [];

    if (memoryStore.products) {
      products = memoryStore.products;
      variants = memoryStore.product_variants;
      orders = memoryStore.orders;
    } else {
      products = await query('SELECT * FROM products');
      variants = await query('SELECT * FROM product_variants');
      orders = await query('SELECT * FROM orders');
    }

    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.active).length;
    const lowStockVariants = variants.filter(v => v.stock_quantity < 5);
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        lowStockCount: lowStockVariants.length,
        recentOrders: orders.slice(-5).reverse(),
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new product with variants
 */
export async function createProduct(req, res, next) {
  try {
    const {
      name,
      category_id,
      description,
      price,
      image_url,
      secondary_image_url,
      style_tags = [],
      occasion_tags = [],
      colors = [],
      featured = false,
      variants = []
    } = req.body;

    if (!name || !price || !category_id || !image_url) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, category, and image URL are required.'
      });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
    const parsedPrice = parseFloat(price);

    if (memoryStore.products) {
      const cat = memoryStore.categories.find(c => c.id === parseInt(category_id, 10)) || memoryStore.categories[0];
      const newProd = {
        id: memoryStore.nextId.products++,
        category_id: cat.id,
        category_name: cat.name,
        category_slug: cat.slug,
        name,
        slug,
        description: description || '',
        price: parsedPrice,
        image_url,
        secondary_image_url: secondary_image_url || null,
        style_tags: Array.isArray(style_tags) ? style_tags : [style_tags],
        occasion_tags: Array.isArray(occasion_tags) ? occasion_tags : [occasion_tags],
        colors: Array.isArray(colors) ? colors : [colors],
        featured: Boolean(featured),
        active: true,
        created_at: new Date()
      };
      memoryStore.products.push(newProd);

      const createdVariants = [];
      const defaultSizes = variants.length > 0 ? variants : [
        { size: 'S', color: colors[0] || 'Charcoal', stock_quantity: 10 },
        { size: 'M', color: colors[0] || 'Charcoal', stock_quantity: 15 },
        { size: 'L', color: colors[0] || 'Charcoal', stock_quantity: 10 }
      ];

      for (const v of defaultSizes) {
        const newV = {
          id: memoryStore.nextId.product_variants++,
          product_id: newProd.id,
          size: v.size,
          color: v.color,
          stock_quantity: parseInt(v.stock_quantity, 10) || 0,
          sku: `SKU-${newProd.id}-${v.size}-${v.color}`.toUpperCase().replace(/\s+/g, '-')
        };
        memoryStore.product_variants.push(newV);
        createdVariants.push(newV);
      }

      return res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        data: { ...newProd, variants: createdVariants }
      });
    }

    // MySQL flow
    const result = await query(`
      INSERT INTO products (
        category_id, name, slug, description, price, image_url, secondary_image_url,
        style_tags, occasion_tags, colors, featured, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      category_id,
      name,
      slug,
      description || '',
      parsedPrice,
      image_url,
      secondary_image_url || null,
      JSON.stringify(Array.isArray(style_tags) ? style_tags : [style_tags]),
      JSON.stringify(Array.isArray(occasion_tags) ? occasion_tags : [occasion_tags]),
      JSON.stringify(Array.isArray(colors) ? colors : [colors]),
      featured ? 1 : 0
    ]);

    const newProdId = result.insertId;
    const defaultSizes = variants.length > 0 ? variants : [
      { size: 'S', color: colors[0] || 'Charcoal', stock_quantity: 10 },
      { size: 'M', color: colors[0] || 'Charcoal', stock_quantity: 15 },
      { size: 'L', color: colors[0] || 'Charcoal', stock_quantity: 10 }
    ];

    for (const v of defaultSizes) {
      const sku = `SKU-${newProdId}-${v.size}-${v.color}`.toUpperCase().replace(/\s+/g, '-');
      await query(`
        INSERT INTO product_variants (product_id, size, color, stock_quantity, sku)
        VALUES (?, ?, ?, ?, ?)
      `, [newProdId, v.size, v.color, parseInt(v.stock_quantity, 10) || 0, sku]);
    }

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: { id: newProdId, name, slug, price: parsedPrice }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Edit existing product
 */
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, price, description, category_id, image_url, featured, active } = req.body;
    const pId = parseInt(id, 10);

    if (memoryStore.products) {
      const prod = memoryStore.products.find(p => p.id === pId);
      if (!prod) return res.status(404).json({ success: false, message: 'Product not found.' });

      if (name) prod.name = name;
      if (price) prod.price = parseFloat(price);
      if (description !== undefined) prod.description = description;
      if (category_id) {
        prod.category_id = parseInt(category_id, 10);
        const cat = memoryStore.categories.find(c => c.id === prod.category_id);
        if (cat) {
          prod.category_name = cat.name;
          prod.category_slug = cat.slug;
        }
      }
      if (image_url) prod.image_url = image_url;
      if (featured !== undefined) prod.featured = Boolean(featured);
      if (active !== undefined) prod.active = Boolean(active);

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully.',
        data: prod
      });
    }

    await query(`
      UPDATE products SET
        name = COALESCE(?, name),
        price = COALESCE(?, price),
        description = COALESCE(?, description),
        category_id = COALESCE(?, category_id),
        image_url = COALESCE(?, image_url),
        featured = COALESCE(?, featured),
        active = COALESCE(?, active)
      WHERE id = ?
    `, [
      name || null,
      price ? parseFloat(price) : null,
      description !== undefined ? description : null,
      category_id || null,
      image_url || null,
      featured !== undefined ? (featured ? 1 : 0) : null,
      active !== undefined ? (active ? 1 : 0) : null,
      pId
    ]);

    return res.status(200).json({ success: true, message: 'Product updated successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle product active status (Deactivate / Reactivate)
 */
export async function toggleProductActive(req, res, next) {
  try {
    const { id } = req.params;
    const pId = parseInt(id, 10);

    if (memoryStore.products) {
      const prod = memoryStore.products.find(p => p.id === pId);
      if (!prod) return res.status(404).json({ success: false, message: 'Product not found.' });
      prod.active = !prod.active;
      return res.status(200).json({
        success: true,
        message: `Product is now ${prod.active ? 'active' : 'deactivated'}.`,
        active: prod.active
      });
    }

    const [prod] = await query('SELECT active FROM products WHERE id = ?', [pId]);
    if (!prod) return res.status(404).json({ success: false, message: 'Product not found.' });

    const nextState = prod.active ? 0 : 1;
    await query('UPDATE products SET active = ? WHERE id = ?', [nextState, pId]);

    return res.status(200).json({
      success: true,
      message: `Product is now ${nextState ? 'active' : 'deactivated'}.`,
      active: !!nextState
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update stock for a specific variant
 */
export async function updateVariantStock(req, res, next) {
  try {
    const { id } = req.params;
    const { stock_quantity } = req.body;
    const vId = parseInt(id, 10);
    const newQty = parseInt(stock_quantity, 10);

    if (isNaN(newQty) || newQty < 0) {
      return res.status(400).json({ success: false, message: 'Valid non-negative stock quantity required.' });
    }

    if (memoryStore.product_variants) {
      const variant = memoryStore.product_variants.find(v => v.id === vId);
      if (!variant) return res.status(404).json({ success: false, message: 'Variant not found.' });
      variant.stock_quantity = newQty;
      return res.status(200).json({
        success: true,
        message: `Stock updated to ${newQty} units.`,
        data: variant
      });
    }

    await query('UPDATE product_variants SET stock_quantity = ? WHERE id = ?', [newQty, vId]);

    return res.status(200).json({
      success: true,
      message: `Stock updated to ${newQty} units.`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all customer orders for admin
 */
export async function getAllOrders(req, res, next) {
  try {
    if (memoryStore.orders) {
      const ordersWithDetails = memoryStore.orders
        .map(order => {
          const user = memoryStore.users.find(u => u.id === order.user_id);
          const items = memoryStore.order_items.filter(oi => oi.order_id === order.id);
          return {
            ...order,
            customer_name: user ? user.name : 'Unknown User',
            customer_email: user ? user.email : '',
            items
          };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return res.status(200).json({
        success: true,
        data: ordersWithDetails
      });
    }

    const orders = await query(`
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    const orderIds = orders.map(o => o.id);
    let items = [];
    if (orderIds.length > 0) {
      items = await query(
        `SELECT * FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')})`,
        orderIds
      );
    }

    const formatted = orders.map(o => ({
      ...o,
      shipping_address: typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : o.shipping_address,
      items: items.filter(i => i.order_id === o.id)
    }));

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const oId = parseInt(id, 10);

    const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowed.join(', ')}`
      });
    }

    if (memoryStore.orders) {
      const order = memoryStore.orders.find(o => o.id === oId);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
      order.status = status;
      order.updated_at = new Date();
      return res.status(200).json({
        success: true,
        message: `Order status updated to '${status}'.`,
        data: order
      });
    }

    await query('UPDATE orders SET status = ? WHERE id = ?', [status, oId]);

    return res.status(200).json({
      success: true,
      message: `Order status updated to '${status}'.`
    });
  } catch (error) {
    next(error);
  }
}
