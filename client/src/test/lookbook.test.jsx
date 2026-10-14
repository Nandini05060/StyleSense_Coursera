import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Lookbook from '../pages/Lookbook';
import SharedLookbook from '../pages/SharedLookbook';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import * as apiModule from '../services/api';

describe('Part 5: Personal Lookbook & Capsule Builder Frontend Tests', () => {
  const mockLookbooks = [
    {
      id: 1,
      title: 'Autumn Minimalist Capsule',
      description: 'Curated rotation of high-utility neutral essentials.',
      theme: 'Minimalist Architecture',
      cover_image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
      is_public: true,
      share_token: 'autumn-capsule-7a91bf',
      outfit_count: 2,
      outfits: [
        {
          id: 101,
          name: 'Campus Smart Minimalist',
          occasion: 'college',
          curator_note: 'Daily rotation: Merino mockneck knit with selvedge denim.',
          items: [
            {
              id: 1,
              name: 'Merino Mockneck Knit',
              brand: 'Arket',
              price: 110,
              slot_name: 'top',
              image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600'
            }
          ]
        }
      ]
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.spyOn(apiModule.api, 'getLookbooks').mockResolvedValue({
      success: true,
      data: mockLookbooks
    });

    vi.spyOn(apiModule.api, 'getSavedOutfits').mockResolvedValue({
      success: true,
      data: [
        { id: 101, name: 'Campus Smart Minimalist', occasion: 'college' }
      ]
    });

    vi.spyOn(apiModule.api, 'getLookbookById').mockResolvedValue({
      success: true,
      data: mockLookbooks[0]
    });

    vi.spyOn(apiModule.api, 'getSharedLookbook').mockResolvedValue({
      success: true,
      data: {
        ...mockLookbooks[0],
        curator_name: 'Priya Sharma'
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

  it('1. Renders the Lookbook atelier with collections shelf and action button', async () => {
    renderWithProviders(<Lookbook />);

    expect(await screen.findByRole('heading', { name: /Personal Lookbook Atelier/i })).toBeInTheDocument();
    expect(screen.getByText(/Your Curated Collections/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Curate New Lookbook/i })).toBeInTheDocument();
    expect((await screen.findAllByText(/Autumn Minimalist Capsule/i)).length).toBeGreaterThan(0);
  });

  it('2. Displays ensemble spreads, curator notes, and garment slot cards', async () => {
    renderWithProviders(<Lookbook />);

    expect((await screen.findAllByText(/Campus Smart Minimalist/i)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Merino Mockneck Knit/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Arket/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Print Portfolio/i })).toBeInTheDocument();
  });

  it('3. Renders public SharedLookbook page with curator attribution and cover manifesto', async () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <SharedLookbook />
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText(/Curated by/i)).toBeInTheDocument();
    expect(screen.getByText(/Priya Sharma/i)).toBeInTheDocument();
    expect(screen.getByText(/Curated Capsule Collection/i)).toBeInTheDocument();
  });
});
