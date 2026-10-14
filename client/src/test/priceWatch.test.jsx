import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Wishlist from '../pages/Wishlist';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { BrowserRouter } from 'react-router-dom';
import * as apiModule from '../services/api';

describe('Part 6: Smart Wishlist & Price Watch Frontend Tests', () => {
  const mockWishlistItems = [
    {
      id: 1,
      name: 'Structured Linen Trench',
      slug: 'structured-linen-trench',
      category_name: 'outerwear',
      price: 6800,
      image_url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600',
      collection_name: 'Autumn Tailoring',
      target_price: 7000,
      is_target_met: true,
      price_difference: 200,
      price_trend: 'dropped',
      notes: 'Key autumn layering staple',
      variants: [{ id: 101, size: 'M', color: 'Beige', stock_quantity: 5 }]
    },
    {
      id: 2,
      name: 'Merino Wool Mockneck',
      slug: 'merino-wool-mockneck',
      category_name: 'tops',
      price: 4200,
      image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
      collection_name: 'All Saved Pieces',
      target_price: 3800,
      is_target_met: false,
      price_difference: -400,
      price_trend: 'stable',
      notes: '',
      variants: [{ id: 102, size: 'S', color: 'Ivory', stock_quantity: 8 }]
    }
  ];

  const mockCollections = [
    { id: 1, name: 'All Saved Pieces', item_count: 2 },
    { id: 2, name: 'Autumn Tailoring', item_count: 1 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('stylesense_token', 'test-token');
    localStorage.setItem('stylesense_guest_wishlist', JSON.stringify(mockWishlistItems));

    vi.spyOn(apiModule.api, 'getMe').mockResolvedValue({
      success: true,
      user: { id: 2, name: 'Priya Sharma', email: 'student@stylesense.ai' }
    });

    vi.spyOn(apiModule.api, 'getWishlist').mockResolvedValue({
      success: true,
      data: mockWishlistItems
    });

    vi.spyOn(apiModule.api, 'getWishlistCollections').mockResolvedValue({
      success: true,
      data: mockCollections
    });

    vi.spyOn(apiModule.api, 'getWishlistNotifications').mockResolvedValue({
      success: true,
      data: [
        {
          id: 1,
          type: 'target_price_met',
          title: 'Target Price Alert Met!',
          message: 'Structured Linen Trench is now ₹6,800, matching your alert of ₹7,000.',
          is_read: false
        }
      ]
    });

    vi.spyOn(apiModule.api, 'updatePriceWatch').mockResolvedValue({
      success: true,
      message: 'Price watch alert configured successfully.'
    });
  });

  const renderWithProviders = (ui) => {
    return render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                {ui}
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );
  };

  it('1. Renders the Wishlist page with collections tabs and wishlisted pieces', async () => {
    renderWithProviders(<Wishlist />);

    expect(await screen.findByRole('heading', { name: /Saved Wishlist & Price Atelier/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Collection/i })).toBeInTheDocument();
    expect(await screen.findByText(/Structured Linen Trench/i)).toBeInTheDocument();
  });

  it('2. Displays Target Price Alert Met banner when items drop below target price', async () => {
    renderWithProviders(<Wishlist />);

    expect(await screen.findByRole('heading', { name: /Target Price Alert Met!/i })).toBeInTheDocument();
    expect(screen.getByText(/Save up to/i)).toBeInTheDocument();
  });

  it('3. Opens Price Watch modal and allows setting new target alert', async () => {
    renderWithProviders(<Wishlist />);

    expect(await screen.findByText(/Structured Linen Trench/i)).toBeInTheDocument();

    // Click Price Watch on the card
    const priceWatchButtons = screen.getAllByRole('button', { name: /Price Watch/i });
    fireEvent.click(priceWatchButtons[0]);

    expect(await screen.findByRole('heading', { name: /Set Target Price Alert/i })).toBeInTheDocument();
    expect(screen.getByText(/Current Garment Price/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Set Price Alert/i })).toBeInTheDocument();
  });
});
