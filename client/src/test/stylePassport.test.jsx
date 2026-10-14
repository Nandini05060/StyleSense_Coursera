import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StylePassport from '../pages/StylePassport';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { BrowserRouter } from 'react-router-dom';
import * as apiModule from '../services/api';

describe('StyleSense AI — Style Passport Frontend Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.spyOn(apiModule.api, 'getStyleProfile').mockResolvedValue({
      success: true,
      data: {
        preferred_aesthetics: ['minimalist', 'classic'],
        preferred_colors: ['ivory', 'charcoal', 'navy'],
        favorite_categories: ['tops', 'bottoms'],
        preferred_occasions: ['casual', 'office'],
        budget_min: 0,
        budget_max: 250,
        lifestyle_tags: ['Capsule Wardrobe', 'Timeless Essentials'],
        notes: 'Tailored neutral silhouettes with high utility.'
      }
    });

    vi.spyOn(apiModule.api, 'getSavedOutfits').mockResolvedValue({
      success: true,
      data: [
        {
          id: 1,
          name: 'Editorial Autumn Gallery Walk',
          occasion: 'casual',
          items: [{ id: 101, slot_name: 'top' }]
        }
      ]
    });

    vi.spyOn(apiModule.api, 'getRecommendations').mockResolvedValue({
      success: true,
      data: {
        recommendations: []
      }
    });

    vi.spyOn(apiModule.api, 'getProducts').mockResolvedValue({
      success: true,
      data: {
        products: []
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

  it('Requirement 1: Renders Style Passport editorial dossier with magazine header', async () => {
    renderWithProviders(<StylePassport />);

    expect(screen.getAllByText(/The Style Passport/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Dossier Privé/i)).toBeInTheDocument();
    expect(screen.getByText(/Edit Style Preferences/i)).toBeInTheDocument();
  });

  it('Requirement 2: Displays aesthetic alignment, signature palette, and wardrobe categories', async () => {
    renderWithProviders(<StylePassport />);

    expect(screen.getByText(/Design Language & Form/i)).toBeInTheDocument();
    expect(screen.getByText(/Signature Color Palette/i)).toBeInTheDocument();
    expect(screen.getByText(/Occasions & Foundational Categories/i)).toBeInTheDocument();
    expect(screen.getByText(/Target Budget Ceiling/i)).toBeInTheDocument();
  });

  it('Requirement 3: Toggling edit mode reveals editable form controls and persist button', async () => {
    renderWithProviders(<StylePassport />);

    const editBtn = screen.getByText(/Edit Style Preferences/i);
    fireEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getByText(/Persist Dossier/i)).toBeInTheDocument();
    });
  });
});
