import { query, memoryStore } from '../config/db.js';

/**
 * Calculate cart financial summary (server-authoritative)
 */
function calculateCartTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const roundedSubtotal = Math.round(subtotal * 100) / 100;

  // Free standard shipping over $150, else $12.00
  const shippingFee = roundedSubtotal > 150 || roundedSubtotal === 0 ? 0.00 : 12.00;
  // 8% tax calculation
  const taxAmount = Math.round((roundedSubtotal * 0.08) * 100) / 100;
  const total = Math.round((roundedSubtotal + shippingFee + taxAmount) * 100) / 100;

  return {
    subtotal: roundedSubtotal,
    shippingFee,
    taxAmount,
    total,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
  };
}

/**
 * Get user's cart
 */
export async function getCart(req, res, next) {
  try {
    const userId = req.user.id;

    if (memoryStore.carts) {
      let cart = memoryStore.carts.find(c => c.user_id === userId);
      if (!cart) {
        cart = { id: memoryStore.nextId.carts++, user_id: userId, created_at: new Date(), updated_at: new Date() };
        memoryStore.carts.push(cart);
      }

      const cartItems = memoryStore.cart_items.filter(ci => ci.cart_id === cart.id);
      const detailedItems = cartItems.map(item => {
        const variant = memoryStore.product_variants.find(v => v.id === item.variant_id);
        const product = variant ? memoryStore.products.find(p => p.id === variant.product_id) : null;
        const availableStock = variant ? variant.stock_quantity : 0;
        const unitPrice = product ? parseFloat(product.price) : 0;

        return {
          id: item.id,
          cart_id: item.cart_id,
          variant_id: item.variant_id,
          product_id: product ? product.id : null,
          name: product ? product.name : 'Unknown Item',
          slug: product ? product.slug : '',
          image_url: product ? product.image_url : '',
          size: variant ? variant.size : '',
          color: variant ? variant.color : '',
          unit_price: unitPrice,
          quantity: item.quantity,
          available_stock: availableStock,
          in_stock: availableStock >= item.quantity,
          line_total: Math.round((unitPrice * item.quantity) * 100) / 100
        };
      });

      const totals = calculateCartTotals(detailedItems);

      return res.status(200).json({
        success: true,
        data: {
          id: cart.id,
          items: detailedItems,
          ...totals
        }
      });
    }

    // MySQL flow
    let [cart] = await query('SELECT * FROM carts WHERE user_id = ?', [userId]);
    if (!cart) {
      const resInsert = await query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
      cart = { id: resInsert.insertId, user_id: userId };
    }

    const items = await query(`
      SELECT
        ci.id,
        ci.cart_id,
        ci.variant_id,
        ci.quantity,
        pv.size,
        pv.color,
        pv.stock_quantity as available_stock,
        p.id as product_id,
        p.name,
        p.slug,
        p.price as unit_price,
        p.image_url
      FROM cart_items ci
      JOIN product_variants pv ON ci.variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE ci.cart_id = ?
      ORDER BY ci.created_at ASC
    `, [cart.id]);

    const formattedItems = items.map(item => ({
      ...item,
      unit_price: parseFloat(item.unit_price),
      in_stock: item.available_stock >= item.quantity,
      line_total: Math.round((parseFloat(item.unit_price) * item.quantity) * 100) / 100
    }));

    const totals = calculateCartTotals(formattedItems);

    return res.status(200).json({
      success: true,
      data: {
        id: cart.id,
        items: formattedItems,
        ...totals
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Add item to cart
 */
export async function addToCart(req, res, next) {
  try {
    const userId = req.user.id;
    const { variantId, quantity = 1 } = req.body;

    const parsedVariantId = parseInt(variantId, 10);
    const parsedQty = parseInt(quantity, 10);

    if (!parsedVariantId || isNaN(parsedVariantId)) {
      return res.status(400).json({ success: false, message: 'Valid variant ID is required.' });
    }
    if (!parsedQty || parsedQty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer.' });
    }

    if (memoryStore.carts) {
      let cart = memoryStore.carts.find(c => c.user_id === userId);
      if (!cart) {
        cart = { id: memoryStore.nextId.carts++, user_id: userId, created_at: new Date(), updated_at: new Date() };
        memoryStore.carts.push(cart);
      }

      const variant = memoryStore.product_variants.find(v => v.id === parsedVariantId);
      if (!variant) {
        return res.status(404).json({ success: false, message: 'Selected variant not found.' });
      }

      const existingItem = memoryStore.cart_items.find(
        ci => ci.cart_id === cart.id && ci.variant_id === parsedVariantId
      );

      const targetQty = existingItem ? existingItem.quantity + parsedQty : parsedQty;

      if (variant.stock_quantity < targetQty) {
        return res.status(400).json({
          success: false,
          message: `Only ${variant.stock_quantity} units available in stock.`
        });
      }

      if (existingItem) {
        existingItem.quantity = targetQty;
        existingItem.updated_at = new Date();
      } else {
        memoryStore.cart_items.push({
          id: memoryStore.nextId.cart_items++,
          cart_id: cart.id,
          variant_id: parsedVariantId,
          quantity: parsedQty,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Item added to your shopping bag.'
      });
    }

    // MySQL flow
    let [cart] = await query('SELECT * FROM carts WHERE user_id = ?', [userId]);
    if (!cart) {
      const resInsert = await query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
      cart = { id: resInsert.insertId, user_id: userId };
    }

    const [variant] = await query('SELECT * FROM product_variants WHERE id = ?', [parsedVariantId]);
    if (!variant) {
      return res.status(404).json({ success: false, message: 'Selected variant not found.' });
    }

    const [existing] = await query(
      'SELECT * FROM cart_items WHERE cart_id = ? AND variant_id = ?',
      [cart.id, parsedVariantId]
    );

    const targetQty = existing ? existing.quantity + parsedQty : parsedQty;
    if (variant.stock_quantity < targetQty) {
      return res.status(400).json({
        success: false,
        message: `Only ${variant.stock_quantity} units available in stock.`
      });
    }

    if (existing) {
      await query('UPDATE cart_items SET quantity = ? WHERE id = ?', [targetQty, existing.id]);
    } else {
      await query(
        'INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES (?, ?, ?)',
        [cart.id, parsedVariantId, parsedQty]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Item added to your shopping bag.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(req, res, next) {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const parsedItemId = parseInt(itemId, 10);
    const parsedQty = parseInt(quantity, 10);

    if (isNaN(parsedQty) || parsedQty < 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a non-negative integer.' });
    }

    if (memoryStore.carts) {
      const cart = memoryStore.carts.find(c => c.user_id === userId);
      if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

      const itemIdx = memoryStore.cart_items.findIndex(ci => ci.id === parsedItemId && ci.cart_id === cart.id);
      if (itemIdx === -1) return res.status(404).json({ success: false, message: 'Item not found in your cart.' });

      if (parsedQty === 0) {
        memoryStore.cart_items.splice(itemIdx, 1);
        return res.status(200).json({ success: true, message: 'Item removed from cart.' });
      }

      const item = memoryStore.cart_items[itemIdx];
      const variant = memoryStore.product_variants.find(v => v.id === item.variant_id);

      if (variant && variant.stock_quantity < parsedQty) {
        return res.status(400).json({
          success: false,
          message: `Cannot increase quantity. Only ${variant.stock_quantity} units are in stock.`
        });
      }

      item.quantity = parsedQty;
      item.updated_at = new Date();
      return res.status(200).json({ success: true, message: 'Cart updated successfully.' });
    }

    // MySQL flow
    const [cart] = await query('SELECT id FROM carts WHERE user_id = ?', [userId]);
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

    const [item] = await query(
      `SELECT ci.*, pv.stock_quantity
       FROM cart_items ci
       JOIN product_variants pv ON ci.variant_id = pv.id
       WHERE ci.id = ? AND ci.cart_id = ?`,
      [parsedItemId, cart.id]
    );

    if (!item) return res.status(404).json({ success: false, message: 'Item not found in your cart.' });

    if (parsedQty === 0) {
      await query('DELETE FROM cart_items WHERE id = ?', [parsedItemId]);
      return res.status(200).json({ success: true, message: 'Item removed from cart.' });
    }

    if (item.stock_quantity < parsedQty) {
      return res.status(400).json({
        success: false,
        message: `Cannot increase quantity. Only ${item.stock_quantity} units are in stock.`
      });
    }

    await query('UPDATE cart_items SET quantity = ? WHERE id = ?', [parsedQty, parsedItemId]);

    return res.status(200).json({ success: true, message: 'Cart updated successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Remove item from cart
 */
export async function removeCartItem(req, res, next) {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const parsedItemId = parseInt(itemId, 10);

    if (memoryStore.carts) {
      const cart = memoryStore.carts.find(c => c.user_id === userId);
      if (cart) {
        memoryStore.cart_items = memoryStore.cart_items.filter(
          ci => !(ci.id === parsedItemId && ci.cart_id === cart.id)
        );
      }
      return res.status(200).json({ success: true, message: 'Item removed from cart.' });
    }

    const [cart] = await query('SELECT id FROM carts WHERE user_id = ?', [userId]);
    if (cart) {
      await query('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [parsedItemId, cart.id]);
    }

    return res.status(200).json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    next(error);
  }
}
