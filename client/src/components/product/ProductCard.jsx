import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/formatCurrency';

export default function ProductCard({
  product,
  showScore = false,
  score,
  matchExplanation,
  className = '',
}) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const saved = isWishlisted(product.id);
  const displayScore = score ?? product.recommendationScore ?? product.matchPercentage;
  const explanation = matchExplanation ?? product.matchExplanation;

  // Fallback high fashion image
  const fallbackImg = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80';
  const mainImage = imageError ? fallbackImg : (product.image_url || fallbackImg);
  const secondaryImage = product.secondary_image_url || mainImage;
  const productLink = `/product/${product.slug || product.id}`;

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      className={`group relative flex flex-col bg-white border border-taupe-light/70 transition-all duration-300 hover:border-charcoal hover:shadow-subtle ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with 3:4 aspect ratio */}
      <Link to={productLink} className="relative block aspect-[3/4] overflow-hidden bg-ivory">
        <img
          src={isHovered && product.secondary_image_url ? secondaryImage : mainImage}
          alt={product.name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />

        {/* Match Percentage Badge (Style Studio Results) */}
        {showScore && displayScore !== undefined && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-burgundy text-white font-sans text-[10px] font-semibold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-burgundy-200" />
              {displayScore}% Match
            </span>
          </div>
        )}

        {/* Category tag */}
        {product.category_name && !showScore && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex px-2 py-0.5 bg-white/90 backdrop-blur-sm text-charcoal font-sans text-[9px] uppercase font-medium tracking-[0.18em] border border-taupe-light/70">
              {product.category_name}
            </span>
          </div>
        )}

        {/* Wishlist Button: Minimal & elegant */}
        <button
          onClick={handleToggleWishlist}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-10 ${
            saved
              ? 'bg-burgundy text-white shadow-sm'
              : 'bg-white/85 text-charcoal hover:bg-white hover:text-burgundy'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
        </button>

        {/* Subtle "VIEW ITEM" action on hover for desktop */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-charcoal/60 via-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center">
          <span className="w-full py-2 bg-white/95 text-charcoal text-[10px] font-sans font-semibold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-1.5 shadow-sm group-hover:bg-burgundy group-hover:text-white">
            <span>View Item</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </Link>

      {/* Product Information beneath the image */}
      <div className="p-4 flex flex-col justify-between flex-1 space-y-2">
        <div>
          {/* Subtle style labels */}
          {product.style_tags && product.style_tags.length > 0 && (
            <div className="text-[10px] font-sans uppercase tracking-[0.16em] text-taupe mb-1 line-clamp-1">
              {product.style_tags.slice(0, 2).join(' • ')}
            </div>
          )}

          {/* Product Name */}
          <h3 className="font-serif text-base text-charcoal font-normal leading-snug line-clamp-1 group-hover:text-burgundy transition-colors">
            <Link to={productLink}>
              {product.name}
            </Link>
          </h3>

          {/* AI Match Explanation (Style Studio) */}
          {explanation && (
            <p className="font-sans text-[11px] text-burgundy-800 bg-burgundy-50/60 p-2 mt-2 border-l-2 border-burgundy leading-relaxed">
              {explanation}
            </p>
          )}
        </div>

        {/* Price & Stock info */}
        <div className="pt-2 border-t border-taupe-light/50 flex items-baseline justify-between">
          <span className="font-sans text-sm font-medium text-charcoal tracking-tight">
            {formatINR(product.price)}
          </span>
          <span className="text-[10px] font-sans text-taupe-muted uppercase tracking-[0.14em]">
            {product.variants?.length ? `${product.variants.length} Sizes` : 'Available'}
          </span>
        </div>
      </div>
    </div>
  );
}
