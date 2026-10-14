import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check, Shield, Truck, RefreshCw, AlertCircle, ArrowLeft, Ruler } from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import ImageGallery from '../components/product/ImageGallery';
import ProductGrid from '../components/product/ProductGrid';
import Button from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import BuyOrReuseAdvisor from '../components/wardrobe/BuyOrReuseAdvisor';
import FitAssistantModal from '../components/fit/FitAssistantModal';
import { formatINR } from '../utils/formatCurrency';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToBag, setAddingToBag] = useState(false);
  const [showFitAssistant, setShowFitAssistant] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getProductById(id);
        if (res.success && res.data) {
          setProduct(res.data);
          // Set initial color and size if available
          const variants = res.data.variants || [];
          if (variants.length > 0) {
            const firstInStock = variants.find(v => v.stock_quantity > 0) || variants[0];
            setSelectedColor(firstInStock.color);
            setSelectedSize(firstInStock.size);
          }
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
        <Skeleton className="w-full aspect-[3/4]" />
        <div className="space-y-6">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-burgundy mx-auto" />
        <h2 className="editorial-heading text-2xl">Garment Unavailable</h2>
        <p className="text-sm text-taupe">{error || 'This product does not exist in our catalog.'}</p>
        <Link to="/shop">
          <Button variant="primary">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  const variants = product.variants || [];
  const availableColors = [...new Set(variants.map(v => v.color))];
  const availableSizes = [...new Set(variants.map(v => v.size))];

  // Current active variant based on selected size and color
  const activeVariant = variants.find(
    v => v.size.toLowerCase() === selectedSize.toLowerCase() &&
         v.color.toLowerCase() === selectedColor.toLowerCase()
  ) || variants.find(v => v.size.toLowerCase() === selectedSize.toLowerCase()) || variants[0];

  const currentStock = activeVariant ? activeVariant.stock_quantity : 0;
  const isOutOfStock = currentStock <= 0;
  const isSaved = isWishlisted(product.id);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      showToast('Please select your preferred size.', 'error');
      return;
    }
    if (!activeVariant) {
      showToast('Please choose an available variant.', 'error');
      return;
    }
    if (isOutOfStock) {
      showToast('Selected variant is currently sold out.', 'error');
      return;
    }

    setAddingToBag(true);
    await addToCart(activeVariant.id, quantity, {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image_url: product.image_url,
      size: activeVariant.size,
      color: activeVariant.color,
      stock: currentStock,
    });
    setAddingToBag(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Back button */}
      <div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-taupe-dark hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Collection</span>
        </Link>
      </div>

      {/* Main product editorial showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7">
          <ImageGallery
            images={[product.image_url, product.secondary_image_url].filter(Boolean)}
            productName={product.name}
          />
        </div>

        {/* Right Column: Garment Information & Commerce Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-taupe font-semibold">
                {product.category_name}
              </span>
              {product.featured && (
                <span className="text-[9px] bg-charcoal text-white px-2 py-0.5 font-sans uppercase font-medium tracking-[0.16em]">
                  Curated
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-light tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="mt-2 flex items-baseline gap-4">
              <span className="font-sans text-2xl font-medium text-charcoal">
                {formatINR(product.price)}
              </span>
              <span className="text-[11px] font-sans text-taupe-muted">
                Includes all applicable taxes
              </span>
            </div>
          </div>

          <p className="font-sans text-xs sm:text-sm text-taupe-dark leading-relaxed font-light border-y border-taupe-light/70 py-4">
            {product.description}
          </p>

          {/* Color Selector */}
          {availableColors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal">
                  Color: <span className="font-normal text-taupe capitalize">{selectedColor}</span>
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => {
                  const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                  return (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3.5 py-1.5 text-xs font-sans capitalize border transition-all ${
                        isSelected
                          ? 'border-charcoal bg-charcoal text-white font-medium'
                          : 'border-taupe-light/80 bg-white text-charcoal hover:border-charcoal'
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector with Live Stock Warnings */}
          {availableSizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal">
                  Size: <span className="font-normal text-taupe">{selectedSize || 'Choose Size'}</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFitAssistant(true)}
                    className="text-[11px] font-sans font-medium text-burgundy hover:text-burgundy-dark underline underline-offset-2 flex items-center gap-1 transition-colors"
                  >
                    <Ruler className="w-3 h-3" />
                    Find My Size / Fit Assistant
                  </button>
                  {/* Live Stock Notification */}
                  <span className="text-[11px] font-sans">
                    {isOutOfStock ? (
                      <span className="text-burgundy font-medium">Sold Out</span>
                    ) : currentStock <= 5 ? (
                      <span className="text-burgundy font-medium">Only {currentStock} remaining</span>
                    ) : (
                      <span className="text-taupe-dark">In Stock ({currentStock} available)</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => {
                  const sizeVariant = variants.find(
                    v => v.size.toLowerCase() === size.toLowerCase() &&
                         (selectedColor ? v.color.toLowerCase() === selectedColor.toLowerCase() : true)
                  );
                  const inStock = sizeVariant && sizeVariant.stock_quantity > 0;
                  const isSelected = selectedSize.toLowerCase() === size.toLowerCase();

                  return (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] h-10 px-3 text-xs font-sans uppercase border transition-all relative ${
                        isSelected
                          ? 'border-burgundy bg-burgundy text-white font-medium'
                          : inStock
                          ? 'border-taupe-light/80 bg-white text-charcoal hover:border-charcoal'
                          : 'border-taupe-light/50 bg-ivory text-taupe-muted line-through cursor-not-allowed opacity-60'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity and Primary Commerce CTA */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-taupe-light/80 bg-white h-12 px-2">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="w-7 text-center text-sm font-semibold text-charcoal hover:text-burgundy disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-8 text-center font-sans text-xs font-medium text-charcoal">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= currentStock}
                  onClick={() => setQuantity(prev => Math.min(currentStock, prev + 1))}
                  className="w-7 text-center text-sm font-semibold text-charcoal hover:text-burgundy disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Bag Button: Charcoal background, white text, burgundy hover state */}
              <button
                type="button"
                disabled={isOutOfStock || addingToBag}
                onClick={handleAddToCart}
                className="flex-1 h-12 bg-charcoal hover:bg-burgundy text-white text-xs font-sans font-semibold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out in Selected Size' : 'Add to Shopping Bag'}</span>
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                className={`h-12 w-12 border flex items-center justify-center transition-colors ${
                  isSaved
                    ? 'border-burgundy bg-burgundy text-white'
                    : 'border-taupe-light/80 bg-white text-charcoal hover:border-burgundy hover:text-burgundy'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Smart Buy-or-Reuse Wardrobe Advisor Integration */}
          <div className="pt-2">
            <BuyOrReuseAdvisor product={product} />
          </div>

          {/* Editorial Service Highlights */}
          <div className="pt-6 border-t border-taupe-light/70 space-y-3 text-xs text-taupe-dark font-sans">
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-burgundy shrink-0" />
              <span>Complimentary insured shipping on orders over ₹10,000</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-burgundy shrink-0" />
              <span>100% authentic materials verified by StyleSense quality standards</span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-burgundy shrink-0" />
              <span>Complimentary 30-day returns and exchanges on unworn garments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {product.related && product.related.length > 0 && (
        <section className="pt-16 border-t border-taupe-light/70">
          <div className="mb-8">
            <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-taupe font-semibold block">
              COMPLETE THE LOOK
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal mt-1">
              You May Also Appreciate
            </h2>
          </div>
          <ProductGrid products={product.related} />
        </section>
      )}

      {/* Fit Assistant Modal */}
      <FitAssistantModal
        isOpen={showFitAssistant}
        onClose={() => setShowFitAssistant(false)}
        product={product}
        currentSelectedSize={selectedSize}
        onSelectSize={(newSize) => {
          setSelectedSize(newSize);
          showToast(`Selected size ${newSize} for ${product.name}.`, 'success');
        }}
      />
    </div>
  );
}
