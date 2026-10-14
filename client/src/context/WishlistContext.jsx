import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      const saved = localStorage.getItem('stylesense_guest_wishlist');
      setWishlist(saved ? JSON.parse(saved) : []);
      return;
    }

    try {
      setLoading(true);
      const res = await api.getWishlist();
      if (res.success && res.data) {
        setWishlist(res.data);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isWishlisted = useCallback((productId) => {
    return wishlist.some(item => item.id === productId || item.product_id === productId);
  }, [wishlist]);

  const toggleWishlist = async (product) => {
    const pId = product.id;
    const exists = isWishlisted(pId);

    if (!isAuthenticated) {
      let updated = [];
      if (exists) {
        updated = wishlist.filter(item => item.id !== pId);
        showToast('Removed from wishlist');
      } else {
        updated = [...wishlist, product];
        showToast('Added to your wishlist');
      }
      setWishlist(updated);
      localStorage.setItem('stylesense_guest_wishlist', JSON.stringify(updated));
      return;
    }

    try {
      if (exists) {
        await api.removeFromWishlist(pId);
        setWishlist(prev => prev.filter(item => item.id !== pId && item.product_id !== pId));
        showToast('Removed from wishlist');
      } else {
        await api.addToWishlist(pId);
        setWishlist(prev => [...prev, product]);
        showToast('Saved to your wishlist');
      }
    } catch (err) {
      showToast(err.message || 'Could not update wishlist', 'error');
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) {
      const updated = wishlist.filter(item => item.id !== productId);
      setWishlist(updated);
      localStorage.setItem('stylesense_guest_wishlist', JSON.stringify(updated));
      showToast('Removed from wishlist');
      return;
    }

    try {
      await api.removeFromWishlist(productId);
      setWishlist(prev => prev.filter(item => item.id !== productId && item.product_id !== productId));
      showToast('Removed from wishlist');
    } catch (err) {
      showToast(err.message || 'Could not remove item', 'error');
    }
  };

  const value = {
    wishlist,
    itemCount: wishlist.length,
    loading,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
    refreshWishlist: fetchWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
