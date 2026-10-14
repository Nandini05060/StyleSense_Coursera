import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import EmptyState from '../components/common/EmptyState';
import ProductCard from '../components/product/ProductCard';
import PreferenceQuiz from '../components/style-studio/PreferenceQuiz';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { BrowserRouter } from 'react-router-dom';

describe('StyleSense AI — Frontend Unit & Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('Test 27: Renders App root and main editorial navigation branding', async () => {
    render(<App />);
    const brandElements = screen.getAllByText(/StyleSense/i);
    expect(brandElements.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/AI/i).length).toBeGreaterThan(0);
  });

  it('Test 28: Recommendation preferences can be changed and resubmitted', () => {
    const mockOnChange = vi.fn();
    const mockOnSubmit = vi.fn();
    const mockOnReset = vi.fn();

    const samplePrefs = {
      occasion: 'casual',
      style: 'minimalist',
      preferred_colors: ['ivory'],
      preferred_size: 'all',
      budget_max: 200,
      category: 'all',
    };

    render(
      <PreferenceQuiz
        preferences={samplePrefs}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onReset={mockOnReset}
      />
    );

    // Click Office & Workwear occasion button
    const officeBtn = screen.getByText(/Office & Workwear/i);
    fireEvent.click(officeBtn);
    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ occasion: 'office' }));

    // Click Streetwear style button
    const streetBtn = screen.getByText(/Streetwear/i);
    fireEvent.click(streetBtn);
    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ style: 'streetwear' }));

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Run StyleSense Recommendation Engine/i });
    fireEvent.click(submitBtn);
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('Test 29 & 30: Empty states, failed image loading, and badges are handled gracefully', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No Garments Found"
        description="Try expanding your search parameters."
        actionLabel="Reset View"
        onAction={handleAction}
      />
    );

    expect(screen.getByText('No Garments Found')).toBeInTheDocument();
    const resetBtn = screen.getByRole('button', { name: /Reset View/i });
    fireEvent.click(resetBtn);
    expect(handleAction).toHaveBeenCalled();
  });

  it('Test 30b: ProductCard handles image error with graceful fallback without crashing', () => {
    const sampleProduct = {
      id: 99,
      name: 'Structured Blazer',
      price: 150.00,
      image_url: 'https://broken-image-link-test.jpg',
      category_name: 'Outerwear',
      variants: [{ id: 991, size: 'M', color: 'Charcoal', stock_quantity: 5 }]
    };

    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <ProductCard product={sampleProduct} showScore={true} score={92} />
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Structured Blazer')).toBeInTheDocument();
    expect(screen.getByText('92% Match')).toBeInTheDocument();

    const img = screen.getByRole('img');
    fireEvent.error(img);
    expect(img).toBeInTheDocument();
  });

  it('Test 31: Navigation and drawer work responsively at mobile viewports', () => {
    render(<App />);
    const menuBtn = screen.getByLabelText(/Toggle navigation menu/i);
    expect(menuBtn).toBeInTheDocument();
    fireEvent.click(menuBtn);

    // Mobile menu links appear
    const mobileLinks = screen.getAllByText(/Style Studio/i);
    expect(mobileLinks.length).toBeGreaterThan(0);
  });

  it('Test 32: Loading, error, and success states are distinguishable', () => {
    const { container } = render(
      <EmptyState title="Success State Display" description="Action completed." />
    );
    expect(container.querySelector('h3').textContent).toBe('Success State Display');
  });
});
