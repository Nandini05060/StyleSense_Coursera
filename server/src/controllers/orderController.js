import { query, transaction, memoryStore } from '../config/db.js';

/**
 * Place a new order with atomic transaction, inventory decrement, and historical snapshots
 */
export async function createOrder(req, res, next) {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentDetails } = req.body;

    // 1. Validate shipping address fields
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine ||
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required (Full Name, Address Line, City, State, Postal Code).'
      });
    }

    // Run order placement inside database transaction
    const orderResult = await transaction(async (client) => {
      // 2. Fetch user's cart and items
      let cartItems = [];
      let cartId = null;

      if (memoryStore.carts) {
        const cart = memoryStore.carts.find(c => c.user_id === userId);
        if (!cart) throw new Error('Shopping cart not found.');
        cartId = cart.id;
        const rawItems = memoryStore.cart_items.filter(ci => ci.cart_id === cart.id);
        if (rawItems.length === 0) throw new Error('Your cart is empty. Add items before checking out.');

        cartItems = rawItems.map(item => {
          const variant = memoryStore.product_variants.find(v => v.id === item.variant_id);
          if (!variant) throw new Error(`Variant #${item.variant_id} is no longer available.`);
          const product = memoryStore.products.find(p => p.id === variant.product_id);
          if (!product) throw new Error(`Product for variant #${item.variant_id} not found.`);

          return {
            cart_item_id: item.id,
            variant_id: variant.id,
            product_id: product.id,
            name: product.name,
            image_url: product.image_url,
            size: variant.size,
            color: variant.color,
            stock_quantity: variant.stock_quantity,
            price: parseFloat(product.price),
            quantity: item.quantity,
          };
        });
      } else {
        // MySQL flow with SELECT FOR UPDATE row locking
        const [cart] = await client.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
        if (!cart) throw new Error('Shopping cart not found.');
        cartId = cart.id;

        const items = await client.query(`
          SELECT
            ci.id as cart_item_id,
            ci.variant_id,
            ci.quantity,
            pv.size,
            pv.color,
            pv.stock_quantity,
            p.id as product_id,
            p.name,
            p.image_url,
            p.price
          FROM cart_items ci
          JOIN product_variants pv ON ci.variant_id = pv.id
          JOIN products p ON pv.product_id = p.id
          WHERE ci.cart_id = ?
          FOR UPDATE
        `, [cartId]);

        if (items.length === 0) throw new Error('Your cart is empty. Add items before checking out.');
        cartItems = items.map(i => ({ ...i, price: parseFloat(i.price) }));
      }

      // 3. Revalidate live stock & verify no overselling
      for (const item of cartItems) {
        if (item.stock_quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for "${item.name}" (${item.size} / ${item.color}). Only ${item.stock_quantity} available, but you requested ${item.quantity}.`
          );
        }
      }

      // 4. Server-side authoritative price calculation
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const roundedSubtotal = Math.round(subtotal * 100) / 100;
      const shippingFee = roundedSubtotal > 150 ? 0.00 : 12.00;
      const taxAmount = Math.round((roundedSubtotal * 0.08) * 100) / 100;
      const totalAmount = Math.round((roundedSubtotal + shippingFee + taxAmount) * 100) / 100;

      // 5. Generate unique order number
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const orderNumber = `STY-${new Date().getFullYear()}-${randomSuffix}`;

      // 6. Create Order and snapshot items
      let createdOrderId = null;

      if (memoryStore.orders) {
        createdOrderId = memoryStore.nextId.orders++;
        const newOrder = {
          id: createdOrderId,
          user_id: userId,
          order_number: orderNumber,
          subtotal: roundedSubtotal,
          shipping_fee: shippingFee,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          payment_method: 'Simulated Card Payment (Academic Demo)',
          payment_status: 'completed',
          status: 'processing',
          created_at: new Date(),
          updated_at: new Date()
        };
        memoryStore.orders.push(newOrder);

        // Deduct stock & create snapshots
        for (const item of cartItems) {
          const variant = memoryStore.product_variants.find(v => v.id === item.variant_id);
          variant.stock_quantity -= item.quantity;

          memoryStore.order_items.push({
            id: memoryStore.nextId.order_items++,
            order_id: createdOrderId,
            variant_id: item.variant_id,
            product_id: item.product_id,
            product_name_snapshot: item.name,
            product_image_snapshot: item.image_url,
            size_snapshot: item.size,
            color_snapshot: item.color,
            unit_price: item.price,
            quantity: item.quantity,
            created_at: new Date()
          });
        }

        // Clear cart items
        memoryStore.cart_items = memoryStore.cart_items.filter(ci => ci.cart_id !== cartId);
      } else {
        // MySQL inserts and updates
        const orderInsert = await client.query(`
          INSERT INTO orders (
            user_id, order_number, total_amount, subtotal, shipping_fee, tax_amount,
            shipping_address, payment_method, payment_status, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          userId,
          orderNumber,
          totalAmount,
          roundedSubtotal,
          shippingFee,
          taxAmount,
          JSON.stringify(shippingAddress),
          'Simulated Card Payment (Academic Demo)',
          'completed',
          'processing'
        ]);

        createdOrderId = orderInsert.insertId;

        for (const item of cartItems) {
          // Decrement variant stock
          await client.query(
            'UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ?',
            [item.quantity, item.variant_id]
          );

          // Insert order item snapshot
          await client.query(`
            INSERT INTO order_items (
              order_id, variant_id, product_id, product_name_snapshot,
              product_image_snapshot, size_snapshot, color_snapshot, unit_price, quantity
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            createdOrderId,
            item.variant_id,
            item.product_id,
            item.name,
            item.image_url,
            item.size,
            item.color,
            item.price,
            item.quantity
          ]);
        }

        // Clear cart
        await client.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
      }

      return {
        orderId: createdOrderId,
        orderNumber,
        subtotal: roundedSubtotal,
        shippingFee,
        taxAmount,
        totalAmount,
        itemCount: cartItems.reduce((s, i) => s + i.quantity, 0),
        items: cartItems.map(i => ({
          name: i.name,
          size: i.size,
          color: i.color,
          unit_price: i.price,
          quantity: i.quantity,
          line_total: Math.round((i.price * i.quantity) * 100) / 100
        }))
      };
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully! (Simulated payment verified - no real money was charged)',
      order: orderResult
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to place order.'
    });
  }
}

/**
 * Get current user's order history
 */
export async function getOrders(req, res, next) {
  try {
    const userId = req.user.id;

    if (memoryStore.orders) {
      const userOrders = memoryStore.orders
        .filter(o => o.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      const ordersWithItems = userOrders.map(order => {
        const items = memoryStore.order_items.filter(oi => oi.order_id === order.id);
        return {
          ...order,
          items
        };
      });

      return res.status(200).json({
        success: true,
        data: ordersWithItems
      });
    }

    const orders = await query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const orderIds = orders.map(o => o.id);
    let items = [];
    if (orderIds.length > 0) {
      items = await query(
        `SELECT * FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')})`,
        orderIds
      );
    }

    const formattedOrders = orders.map(o => ({
      ...o,
      shipping_address: typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : o.shipping_address,
      items: items.filter(i => i.order_id === o.id)
    }));

    return res.status(200).json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get individual order details by ID
 */
export async function getOrderById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (memoryStore.orders) {
      const order = memoryStore.orders.find(o => o.id === parsedId || o.order_number === id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

      // Ownership or admin check
      if (order.user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
      }

      const items = memoryStore.order_items.filter(oi => oi.order_id === order.id);
      return res.status(200).json({
        success: true,
        data: { ...order, items }
      });
    }

    const [order] = await query('SELECT * FROM orders WHERE id = ? OR order_number = ?', [parsedId || 0, id]);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (order.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
    }

    const items = await query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);

    return res.status(200).json({
      success: true,
      data: {
        ...order,
        shipping_address: typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address,
        items
      }
    });
  } catch (error) {
    next(error);
  }
}
