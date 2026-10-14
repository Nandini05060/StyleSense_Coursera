import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { formatINR } from '../utils/formatCurrency';

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleMoveToCart = async (product) => {
    const variants = product.variants || [];
    const availableVariant = variants.find(v => v.stock_quantity > 0) || variants[0];

    if (!availableVariant || availableVariant.stock_quantity <= 0) {
      showToast('This item is currently out of stock.', 'error');
      return;
    }

    await addToCart(availableVariant.id, 1, {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image_url: product.image_url,
      size: availableVariant.size,
      color: availableVariant.color,
      stock: availableVariant.stock_quantity,
    });

    await removeFromWishlist(product.id);
    showToast('Moved piece from Wishlist to Shopping Bag.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Editorial Header */}
      <div className="pb-6 border-b border-taupe-light flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="editorial-subheading">Personal Archive</span>
          <h1 className="editorial-heading text-3xl sm:text-4xl mt-1">Saved Wishlist</h1>
          <p className="text-xs text-taupe-muted mt-1 font-sans">
            {wishlist.length} {wishlist.length === 1 ? 'garment' : 'garments'} curated in your personal archive
          </p>
        </div>

        {wishlist.length > 0 && (
          <Link to="/shop">
            <Button variant="outline" size="sm">
              Explore More Pieces
            </Button>
          </Link>
        )}
      </div>

      {wishlist.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Save editorial pieces you love as you browse the catalog or consult your personal AI Stylist."
          actionLabel="Discover Collection"
          onAction={() => window.location.href = '/shop'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="group bg-white border border-taupe-light flex flex-col justify-between overflow-hidden shadow-subtle hover:shadow-editorial transition-all"
            >
              <Link to={`/product/${item.slug || item.id}`} className="relative aspect-[3/4] overflow-hidden bg-ivory block">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFromWishlist(item.id);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/90 text-charcoal hover:text-red-700 hover:bg-white transition-colors rounded-full shadow-sm"
                  title="Remove from wishlist"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Link>

              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-serif text-base font-medium text-charcoal line-clamp-1 group-hover:text-burgundy transition-colors">
                    <Link to={`/product/${item.slug || item.id}`}>{item.name}</Link>
                  </h3>
                  <p className="font-sans text-sm font-semibold text-charcoal mt-1">
                    {formatINR(item.price)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-taupe-light/60">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={ShoppingBag}
                    onClick={() => handleMoveToCart(item)}
                    className="w-full"
                  >
                    Move to Bag
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
