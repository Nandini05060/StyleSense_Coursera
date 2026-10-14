import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FitFinder from '../pages/FitFinder';
import FitAssistantModal from '../components/fit/FitAssistantModal';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { BrowserRouter } from 'react-router-dom';
import * as apiModule from '../services/api';

describe('Part 4: Fit Finder & Size Intelligence Frontend Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.spyOn(apiModule.api, 'getFitPreferences').mockResolvedValue({
      success: true,
      data: {
        chest: 38,
        waist: 31,
        hips: 39,
        foot_length: 10.0,
        shoe_size: 'UK 7',
        shoe_size_system: 'UK',
        preferred_fit: 'regular',
        measurement_unit: 'in',
        usual_brand_sizes: { Zara: 'M', 'H&M': 'M' },
        notes: ''
      }
    });

    vi.spyOn(apiModule.api, 'evaluateFit').mockResolvedValue({
      success: true,
      data: {
        category: 'tops',
        match_level: 'Good data match',
        confidence_score: 94,
        recommended_size: 'M',
        preferred_fit: 'regular',
        measurement_unit: 'in',
        fit_narrative: 'Your chest measurement (38.0 in) fits comfortably within M (38-40 in).',
        fit_advice: 'Structured shoulders with balanced ease through the torso.',
        dimension_comparisons: [
          {
            dimension: 'Chest',
            user_value: '38.0 in',
            recommended_spec: '38-40 in',
            difference: '+1.0 in ease',
            status: 'optimal'
          }
        ],
        size_chart: [
          { size: 'S', chest_min: 36, chest_max: 38 },
          { size: 'M', chest_min: 38, chest_max: 40 },
          { size: 'L', chest_min: 40, chest_max: 42 }
        ],
        is_in_stock: true,
      }
    });

    vi.spyOn(apiModule.api, 'updateFitPreferences').mockResolvedValue({
      success: true,
      message: 'Fit preferences updated successfully.',
      data: {
        chest: 38,
        waist: 31
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

  it('1. Renders the Fit Finder atelier page with body measurements and drape options', async () => {
    renderWithProviders(<FitFinder />);

    expect(await screen.findByRole('heading', { name: /Fit Finder & Size Atelier/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Your Proportions/i })).toBeInTheDocument();
    expect(screen.getByText(/Core Body Dimensions/i)).toBeInTheDocument();
    expect(screen.getByText(/Regular \/ Classic/i)).toBeInTheDocument();
    expect(screen.getByText(/Save Profile/i)).toBeInTheDocument();
  });

  it('2. Evaluates and displays transparent sizing verdict with match quality indicator', async () => {
    renderWithProviders(<FitFinder />);

    // Check for match quality pill and recommended size
    expect(await screen.findByText(/Good data match/i)).toBeInTheDocument();
    expect(screen.getByText(/Your chest measurement \(38.0 in\) fits comfortably/i)).toBeInTheDocument();
    expect(screen.getByText(/\+1.0 in ease/i)).toBeInTheDocument();
  });

  it('3. Renders FitAssistantModal with product context and triggers onSelectSize', async () => {
    const handleSelectSize = vi.fn();
    const handleClose = vi.fn();

    const mockProduct = {
      id: 1,
      name: 'Structured Linen Trench',
      category_name: 'outerwear',
      variants: [{ size: 'M', stock_quantity: 4 }]
    };

    renderWithProviders(
      <FitAssistantModal
        isOpen={true}
        onClose={handleClose}
        product={mockProduct}
        currentSelectedSize=""
        onSelectSize={handleSelectSize}
      />
    );

    expect(await screen.findByText(/Garment Fit Assistant/i)).toBeInTheDocument();
    expect(screen.getByText(/Evaluating fit for/i)).toBeInTheDocument();
    expect(screen.getByText(/Good data match/i)).toBeInTheDocument();

    // Click Apply Size button
    const applyButton = screen.getByRole('button', { name: /Apply Size M/i });
    expect(applyButton).toBeInTheDocument();
    fireEvent.click(applyButton);

    expect(handleSelectSize).toHaveBeenCalledWith('M');
    expect(handleClose).toHaveBeenCalled();
  });
});
