import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MixMatchStudio from '../pages/MixMatchStudio';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { BrowserRouter } from 'react-router-dom';
import * as apiModule from '../services/api';

describe('StyleSense AI — Mix & Match Studio Frontend Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock API responses
    vi.spyOn(apiModule.api, 'getProducts').mockResolvedValue({
      success: true,
      data: {
        products: [
          {
            id: 1,
            name: 'Merino Wool Mockneck Sweater',
            category_slug: 'tops',
            price: 89.00,
            color: 'ivory',
            style_tags: ['minimalist'],
            occasion_tags: ['casual'],
            variants: [{ id: 101, stock_quantity: 5, size: 'M', color: 'Ivory' }]
          },
          {
            id: 2,
            name: 'Pleated Wide-Leg Trousers',
            category_slug: 'bottoms',
            price: 115.00,
            color: 'charcoal',
            style_tags: ['classic'],
            occasion_tags: ['office'],
            variants: [{ id: 102, stock_quantity: 4, size: 'L', color: 'Charcoal' }]
          }
        ]
      }
    });

    vi.spyOn(apiModule.api, 'getWardrobeItems').mockResolvedValue({
      success: true,
      data: [
        {
          id: 501,
          name: 'Crisp White Poplin Shirt',
          category: 'tops',
          color: 'white',
          style: 'minimalist',
          purchase_price: 65.00
        }
      ]
    });

    vi.spyOn(apiModule.api, 'getSavedOutfits').mockResolvedValue({
      success: true,
      data: []
    });

    vi.spyOn(apiModule.api, 'evaluateOutfit').mockResolvedValue({
      success: true,
      data: {
        score: 92,
        level: 'Exceptional Editorial Harmony',
        breakdown: { occasionScore: 28, styleScore: 24, colorScore: 22, silhouetteScore: 18 },
        explanations: ['100% of pieces harmonize effortlessly for casual settings.'],
        totalPurchasablePrice: 89.00,
        ownedItemsCount: 0,
        purchasableItemsCount: 1,
        hasSilhouetteWarning: false
      }
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

  it('Requirement 1: Renders Mix & Match Atelier workspace with composition canvas', async () => {
    renderWithProviders(<MixMatchStudio />);

    expect(screen.getByText(/Mix & Match Atelier/i)).toBeInTheDocument();
    expect(screen.getByText(/Outfit Composition Canvas/i)).toBeInTheDocument();
    expect(screen.getByText(/Saved Looks/i)).toBeInTheDocument();
    expect(screen.getByText(/Reset/i)).toBeInTheDocument();
  });

  it('Requirement 2: Displays silhouette category slots (Top, Bottom, Dress, Footwear, Outerwear, Accessory)', async () => {
    renderWithProviders(<MixMatchStudio />);

    expect(screen.getAllByText(/Top/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bottom/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Dress/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Footwear/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Outerwear/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Accessory/i).length).toBeGreaterThan(0);
  });

  it('Requirement 3: Allows selecting a candidate item and updating canvas slot', async () => {
    renderWithProviders(<MixMatchStudio />);

    // Wait for product candidate to appear
    await waitFor(() => {
      expect(screen.getByText(/Merino Wool Mockneck Sweater/i)).toBeInTheDocument();
    });

    // Click on Select Piece for the top
    const selectButtons = screen.getAllByText(/Select Piece/i);
    expect(selectButtons.length).toBeGreaterThan(0);
    fireEvent.click(selectButtons[0]);

    // Check that candidate was selected
    await waitFor(() => {
      expect(screen.getAllByText(/Merino Wool Mockneck Sweater/i).length).toBeGreaterThan(1);
    });
  });
});
