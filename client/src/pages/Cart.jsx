import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Truck, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/common/EmptyState';
import { formatINR } from '../utils/formatCurrency';

export default function Cart() {
  const { cart, updateQuantity, removeItem, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const items = cart.items || [];
  const hasItems = items.length > 0;
  const freeShippingThreshold = 150;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - cart.subtotal);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Editorial Header */}
      <div className="pb-6 border-b border-taupe-light/70 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-taupe font-semibold block">
            REVIEW SELECTION
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-light mt-1">Shopping Bag</h1>
          <p className="text-xs text-taupe-dark mt-1 font-sans font-light">
            {cart.itemCount} {cart.itemCount === 1 ? 'garment' : 'garments'} awaiting checkout
          </p>
        </div>

        {hasItems && (
          <Link
            to="/shop"
            className="text-xs font-sans font-medium uppercase tracking-[0.16em] text-charcoal hover:text-burgundy flex items-center gap-1.5 transition-colors"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {!hasItems ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Bag is Empty"
          description="You haven't added any garments to your bag yet. Explore our curated collections or consult the AI Stylist."
          actionLabel="Explore Collections"
          onAction={() => navigate('/shop')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free Shipping Progress Alert */}
            <div className="p-4 bg-white border border-taupe-light/70 text-xs font-sans flex items-center gap-3">
              <Truck className="w-4 h-4 text-burgundy shrink-0" />
              <div className="flex-1">
                {amountToFreeShipping > 0 ? (
                  <span>
                    Add <strong className="text-burgundy font-medium">{formatINR(amountToFreeShipping)}</strong> more to qualify for <strong>Complimentary Insured Shipping</strong>.
                  </span>
                ) : (
                  <span className="text-emerald-800 font-medium">
                    ✓ Your order qualifies for Complimentary Insured Shipping!
                  </span>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="bg-white border border-taupe-light/70 divide-y divide-taupe-light/60">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between">
                  {/* Image & Basic Details */}
                  <div className="flex items-center gap-4">
                    <Link to={`/product/${item.slug || item.product_id}`} className="w-20 h-24 sm:w-24 sm:h-28 bg-ivory shrink-0 border border-taupe-light/70 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </Link>

                    <div className="space-y-1">
                      <h3 className="font-serif text-base text-charcoal font-normal hover:text-burgundy transition-colors">
                        <Link to={`/product/${item.slug || item.product_id}`}>
                          {item.name}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-3 text-xs font-sans text-taupe">
                        <span>Size: <strong className="text-charcoal uppercase font-medium">{item.size}</strong></span>
                        <span>•</span>
                        <span>Color: <strong className="text-charcoal capitalize font-medium">{item.color}</strong></span>
                      </div>
                      <div className="text-xs font-sans">
                        {item.in_stock ? (
                          <span className="text-emerald-800 text-[11px] font-medium">In Stock</span>
                        ) : (
                          <span className="text-red-600 font-medium flex items-center gap-1 text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Sold Out</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper & Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-taupe-light/50">
                    {/* Stepper */}
                    <div className="flex items-center border border-taupe-light/80 bg-white h-9 px-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 text-center font-bold text-charcoal hover:text-burgundy"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-sans font-medium text-charcoal">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 text-center font-bold text-charcoal hover:text-burgundy"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right min-w-[80px]">
                      <span className="font-sans text-sm font-medium text-charcoal block">
                        {formatINR(item.line_total)}
                      </span>
                      <span className="text-[10px] font-sans text-taupe-muted block">
                        {formatINR(item.unit_price)} ea
                      </span>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-taupe-muted hover:text-burgundy transition-colors"
                      title="Remove from bag"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 bg-white border border-taupe-light/70 p-6 sm:p-8 space-y-6">
            <h3 className="font-serif text-xl text-charcoal font-light pb-4 border-b border-taupe-light/70">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs font-sans">
              <div className="flex justify-between text-taupe-dark">
                <span>Subtotal ({cart.itemCount} items)</span>
                <span className="font-medium text-charcoal text-sm">{formatINR(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-taupe-dark">
                <span>Estimated Shipping</span>
                <span className="font-medium text-charcoal text-sm">
                  {cart.shippingFee === 0 ? 'COMPLIMENTARY' : formatINR(cart.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-taupe-dark">
                <span>Estimated Tax (8%)</span>
                <span className="font-medium text-charcoal text-sm">{formatINR(cart.taxAmount)}</span>
              </div>

              <div className="pt-3 border-t border-taupe-light/70 flex justify-between items-baseline">
                <span className="font-medium text-xs uppercase tracking-wider text-charcoal">Estimated Total</span>
                <span className="font-sans text-xl font-semibold text-charcoal">{formatINR(cart.total)}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/checkout"
                className="w-full editorial-btn-primary block text-center py-3.5 text-xs font-semibold tracking-[0.2em] uppercase"
              >
                Proceed to Checkout
              </Link>
            </div>

            <div className="text-[10px] text-taupe-muted space-y-1.5 pt-2 text-center font-sans">
              <p>✓ All pieces verified in atelier inventory</p>
              <p>✓ Simulated checkout with atomic transaction</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
