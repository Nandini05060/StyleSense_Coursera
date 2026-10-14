import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    shippingFee: 0,
    taxAmount: 0,
    total: 0,
    itemCount: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      // Guest cart from localStorage
      const saved = localStorage.getItem('stylesense_guest_cart');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const subtotal = parsed.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0);
          const shippingFee = subtotal > 150 || subtotal === 0 ? 0 : 12;
          const taxAmount = Math.round(subtotal * 0.08 * 100) / 100;
          setCart({
            items: parsed,
            subtotal,
            shippingFee,
            taxAmount,
            total: Math.round((subtotal + shippingFee + taxAmount) * 100) / 100,
            itemCount: parsed.reduce((sum, i) => sum + i.quantity, 0)
          });
        } catch (e) {
          localStorage.removeItem('stylesense_guest_cart');
        }
      } else {
        setCart({ items: [], subtotal: 0, shippingFee: 0, taxAmount: 0, total: 0, itemCount: 0 });
      }
      return;
    }

    try {
      setLoading(true);
      const res = await api.getCart();
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Failed to load shopping cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, user]);

  const addToCart = async (variantId, quantity = 1, itemPreview = null) => {
    if (!variantId) {
      showToast('Please select a size and color variant.', 'error');
      return { success: false };
    }

    if (!isAuthenticated) {
      // Guest mode storage
      const saved = localStorage.getItem('stylesense_guest_cart');
      let currentItems = saved ? JSON.parse(saved) : [];
      const existingIdx = currentItems.findIndex(i => i.variant_id === variantId);

      if (existingIdx >= 0) {
        currentItems[existingIdx].quantity += quantity;
      } else if (itemPreview) {
        currentItems.push({
          id: Date.now(),
          variant_id: variantId,
          product_id: itemPreview.id,
          name: itemPreview.name,
          slug: itemPreview.slug,
          image_url: itemPreview.image_url,
          size: itemPreview.size,
          color: itemPreview.color,
          unit_price: parseFloat(itemPreview.price),
          quantity,
          available_stock: itemPreview.stock || 10,
          in_stock: true,
          line_total: Math.round((parseFloat(itemPreview.price) * quantity) * 100) / 100
        });
      }

      localStorage.setItem('stylesense_guest_cart', JSON.stringify(currentItems));
      fetchCart();
      showToast('Item added to shopping bag.');
      return { success: true };
    }

    try {
      const res = await api.addToCart(variantId, quantity);
      if (res.success) {
        showToast(res.message || 'Added to shopping bag.');
        await fetchCart();
        return { success: true };
      }
      showToast(res.message, 'error');
      return { success: false, message: res.message };
    } catch (err) {
      showToast(err.message || 'Could not add to cart.', 'error');
      return { success: false, message: err.message };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!isAuthenticated) {
      const saved = localStorage.getItem('stylesense_guest_cart');
      let currentItems = saved ? JSON.parse(saved) : [];
      if (quantity <= 0) {
        currentItems = currentItems.filter(i => i.id !== itemId);
      } else {
        const item = currentItems.find(i => i.id === itemId);
        if (item) item.quantity = quantity;
      }
      localStorage.setItem('stylesense_guest_cart', JSON.stringify(currentItems));
      fetchCart();
      return;
    }

    try {
      const res = await api.updateCartItem(itemId, quantity);
      if (res.success) {
        await fetchCart();
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      showToast(err.message || 'Could not update quantity.', 'error');
    }
  };

  const removeItem = async (itemId) => {
    if (!isAuthenticated) {
      const saved = localStorage.getItem('stylesense_guest_cart');
      let currentItems = saved ? JSON.parse(saved) : [];
      currentItems = currentItems.filter(i => i.id !== itemId);
      localStorage.setItem('stylesense_guest_cart', JSON.stringify(currentItems));
      fetchCart();
      showToast('Item removed from shopping bag.');
      return;
    }

    try {
      const res = await api.removeCartItem(itemId);
      if (res.success) {
        showToast('Item removed from shopping bag.');
        await fetchCart();
      }
    } catch (err) {
      showToast(err.message || 'Could not remove item.', 'error');
    }
  };

  const clearCart = () => {
    localStorage.removeItem('stylesense_guest_cart');
    setCart({ items: [], subtotal: 0, shippingFee: 0, taxAmount: 0, total: 0, itemCount: 0 });
  };

  const value = {
    cart,
    itemCount: cart.itemCount || 0,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
