import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Wardrobe from '../pages/Wardrobe';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import * as apiModule from '../services/api';

describe('Part 7: Wardrobe Impact Insights & Cost-Per-Wear Analytics Frontend Tests', () => {
  const mockAnalyticsData = {
    totalItems: 6,
    savedOutfitsCount: 3,
    itemsWithPriceRecorded: 5,
    totalInvestment: 28500,
    totalWearsRecorded: 34,
    averageCostPerWear: 838.24,
    mostWornItems: [
      {
        id: 101,
        name: 'Structured Ivory Blazer',
        category: 'outerwear',
        image_url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600',
        wears_count: 12,
        purchase_price: 6500,
        cost_per_wear: 541.67,
        cost_per_wear_display: '₹541.67'
      },
      {
        id: 102,
        name: 'Organic Cotton Oxford Shirt',
        category: 'tops',
        image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
        wears_count: 9,
        purchase_price: 2499,
        cost_per_wear: 277.67,
        cost_per_wear_display: '₹277.67'
      }
    ],
    underusedItems: [
      {
        id: 201,
        name: 'Silk Crepe Evening Gown',
        category: 'dresses',
        image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
        wears_count: 0,
        purchase_price: 8900,
        daysOwned: 45,
        cost_per_wear_display: 'Not worn yet',
        reason: 'Not worn yet since adding to closet'
      },
      {
        id: 202,
        name: 'Tailored Wool Overcoat',
        category: 'outerwear',
        image_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600',
        wears_count: 1,
        purchase_price: 12000,
        daysOwned: 60,
        cost_per_wear_display: '₹12,000.00',
        reason: 'Only worn 1 time across 60 days'
      }
    ],
    underusedRule: 'Items with 0 logged wears or owned 30+ days with 2 or fewer recorded wears.',
    categoryDistribution: [
      { category: 'outerwear', count: 2, percentage: 33, investment: 18500 },
      { category: 'tops', count: 3, percentage: 50, investment: 6500 },
      { category: 'dresses', count: 1, percentage: 17, investment: 8900 }
    ],
    colorDistribution: [
      { color: 'ivory', count: 2, percentage: 33 },
      { color: 'navy', count: 2, percentage: 33 },
      { color: 'black', count: 2, percentage: 33 }
    ],
    occasionCoverage: [
      { occasion: 'office', count: 4, percentage: 67 },
      { occasion: 'casual', count: 2, percentage: 33 }
    ],
    monthlyWearTrends: [
      { month: '2026-08', label: 'Aug 2026', wears: 8 },
      { month: '2026-09', label: 'Sep 2026', wears: 14 },
      { month: '2026-10', label: 'Oct 2026', wears: 12 }
    ],
    budgetComparison: {
      plannedBudget: 35000,
      actualInvestment: 28500,
      remainingBudget: 6500,
      utilizationPercentage: 81,
      status: 'within_budget'
    },
    status: 'complete'
  };

  const mockItems = [
    {
      id: 101,
      name: 'Structured Ivory Blazer',
      category: 'outerwear',
      color: 'Ivory',
      style: 'classic',
      occasion: 'office',
      size: 'M',
      brand: 'Zara',
      purchase_price: 6500,
      wears_count: 12,
      is_favorite: true,
      image_url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('stylesense_token', 'test-jwt-token');

    vi.spyOn(apiModule.api, 'getMe').mockResolvedValue({
      success: true,
      user: { id: 2, name: 'Priya Sharma', email: 'student@stylesense.ai' }
    });

    vi.spyOn(apiModule.api, 'getWardrobeItems').mockResolvedValue({
      success: true,
      data: mockItems
    });

    vi.spyOn(apiModule.api, 'getWardrobeAnalytics').mockResolvedValue({
      success: true,
      data: mockAnalyticsData
    });

    vi.spyOn(apiModule.api, 'getWardrobeGaps').mockResolvedValue({
      success: true,
      data: []
    });

    vi.spyOn(apiModule.api, 'getSavedOutfits').mockResolvedValue({
      success: true,
      data: []
    });
  });

  const renderWardrobe = () =>
    render(
      <MemoryRouter initialEntries={['/wardrobe']}>
        <ToastProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <Wardrobe />
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );

  it('1. Renders the Cost-Per-Wear Tracker tab and navigation badges', async () => {
    renderWardrobe();

    expect(await screen.findByText(/My Digital Wardrobe/i)).toBeInTheDocument();

    const analyticsTab = screen.getByRole('button', { name: /Cost-Per-Wear Tracker/i });
    expect(analyticsTab).toBeInTheDocument();

    fireEvent.click(analyticsTab);

    // Verify Rule Documentation & Formula Header
    expect(await screen.findByText(/How StyleSense AI Calculates Cost-Per-Wear & Identifies Underused Items/i)).toBeInTheDocument();
  });

  it('2. Displays Seasonal Budget Stewardship & planned vs actual comparison in INR', async () => {
    renderWardrobe();

    expect(await screen.findByText(/My Digital Wardrobe/i)).toBeInTheDocument();
    const analyticsTab = screen.getByRole('button', { name: /Cost-Per-Wear Tracker/i });
    fireEvent.click(analyticsTab);

    // Financial Stewardship section
    expect(await screen.findByText(/Financial Stewardship/i)).toBeInTheDocument();
    expect(screen.getByText(/Planned Shopping Budget vs. Recorded Closet Investment/i)).toBeInTheDocument();
    expect(screen.getByText(/Planned Seasonal Budget/i)).toBeInTheDocument();
    expect(screen.getByText(/Recorded Closet Spend/i)).toBeInTheDocument();
    expect(screen.getByText(/Budget Utilization/i)).toBeInTheDocument();

    // Verify 81% Progress to Budget Cap & within budget badge
    expect(screen.getAllByText(/81%/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Within Planned Budget/i)).toBeInTheDocument();
  });

  it('3. Renders Monthly Wear Trends section with month labels and wear activity', async () => {
    renderWardrobe();

    expect(await screen.findByText(/My Digital Wardrobe/i)).toBeInTheDocument();
    const analyticsTab = screen.getByRole('button', { name: /Cost-Per-Wear Tracker/i });
    fireEvent.click(analyticsTab);

    expect(await screen.findByText(/Monthly Wear Trends/i)).toBeInTheDocument();
    expect(screen.getByText(/Historical Utility/i)).toBeInTheDocument();

    // Verify monthly trend data points
    expect(screen.getByText(/Aug 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Sep 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Oct 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/14 wears logged/i)).toBeInTheDocument();
  });

  it('4. Displays Highest Utility Pieces and Underused Clothing Pieces with zero-wear handling', async () => {
    renderWardrobe();

    expect(await screen.findByText(/My Digital Wardrobe/i)).toBeInTheDocument();
    const analyticsTab = screen.getByRole('button', { name: /Cost-Per-Wear Tracker/i });
    fireEvent.click(analyticsTab);

    // Highest utility section
    expect(await screen.findByText(/Highest Utility Pieces/i)).toBeInTheDocument();
    expect(screen.getByText(/Structured Ivory Blazer/i)).toBeInTheDocument();
    expect(screen.getAllByText(/12 wears/i).length).toBeGreaterThan(0);

    // Underused garments section
    expect(screen.getByText(/Underused Clothing Pieces/i)).toBeInTheDocument();
    expect(screen.getByText(/Silk Crepe Evening Gown/i)).toBeInTheDocument();
    expect(screen.getByText(/Not worn yet since adding to closet/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Not worn yet/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Needs Restyling/i)).toBeInTheDocument();
  });

  it('5. Displays Category Investment Distribution and breakdown', async () => {
    renderWardrobe();

    expect(await screen.findByText(/My Digital Wardrobe/i)).toBeInTheDocument();
    const analyticsTab = screen.getByRole('button', { name: /Cost-Per-Wear Tracker/i });
    fireEvent.click(analyticsTab);

    expect(await screen.findByText(/Category Investment & Distribution/i)).toBeInTheDocument();
    expect(screen.getByText(/Color Palette Balance/i)).toBeInTheDocument();
    expect(screen.getAllByText(/outerwear/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/tops/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/dresses/i).length).toBeGreaterThan(0);
  });
});
