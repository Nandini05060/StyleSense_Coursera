import React from 'react';
import { RefreshCw, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/formatCurrency';

export default function OutfitSlotCard({
  slot,
  product,
  onReplace,
}) {
  const { addToCart } = useCart();

  if (!product) {
    return (
      <div className="bg-white border border-dashed border-taupe-border/80 p-6 flex flex-col items-center justify-center text-center aspect-[3/4]">
        <span className="editorial-subheading mb-2">{slot}</span>
        <p className="text-xs text-taupe-muted">No compatible item selected for this slot.</p>
        <button
          type="button"
          onClick={onReplace}
          className="mt-4 text-xs font-sans font-semibold uppercase tracking-wider text-burgundy hover:underline"
        >
          Select an Item
        </button>
      </div>
    );
  }

  const handleAddSlotToCart = async () => {
    const variants = product.variants || [];
    const available = variants.find(v => v.stock_quantity > 0) || variants[0];
    if (available) {
      await addToCart(available.id, 1, {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image_url: product.image_url,
        size: available.size,
        color: available.color,
        stock: available.stock_quantity
      });
    }
  };

  return (
    <div className="bg-white border border-taupe-light flex flex-col justify-between overflow-hidden group shadow-sm hover:border-taupe transition-all duration-300">
      {/* Slot header */}
      <div className="px-4 py-2.5 bg-ivory-50 border-b border-taupe-light/60 flex items-center justify-between">
        <span className="editorial-subheading">{slot}</span>
        <button
          type="button"
          onClick={onReplace}
          className="text-[11px] font-sans font-semibold uppercase tracking-wider text-burgundy hover:text-burgundy-800 transition-colors flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Replace</span>
        </button>
      </div>

      {/* Image */}
      <div className="relative aspect-[3/4] bg-ivory overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <h4 className="font-serif text-sm font-medium text-charcoal line-clamp-1">
            {product.name}
          </h4>
          <p className="font-sans text-xs font-semibold text-charcoal mt-1">
            {formatINR(product.price)}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddSlotToCart}
          className="mt-3 w-full py-2 bg-ivory hover:bg-charcoal hover:text-white text-charcoal border border-taupe-border text-[11px] font-sans font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="w-3 h-3" />
          <span>Add Piece</span>
        </button>
      </div>
    </div>
  );
}
