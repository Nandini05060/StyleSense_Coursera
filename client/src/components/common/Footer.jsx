import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-ivory border-t border-taupe-light/70 text-charcoal pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-taupe-light/50">
          {/* Brand Wordmark & Descriptor */}
          <div className="md:col-span-4 space-y-3">
            <Link to="/" className="inline-block">
              <span className="font-serif text-2xl sm:text-3xl tracking-tight text-charcoal block">
                StyleSense
              </span>
              <span className="font-sans text-[9px] uppercase tracking-[0.32em] text-taupe block font-medium mt-0.5">
                WARDROBE INTELLIGENCE
              </span>
            </Link>
            <p className="font-sans text-xs text-taupe-muted max-w-sm leading-relaxed pt-2">
              An editorial fashion boutique powered by transparent wardrobe intelligence. Scoring every piece out of 100 to help you build a considered, timeless collection.
            </p>
          </div>

          {/* Shop */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal">
              Collection
            </h4>
            <ul className="space-y-2 text-xs font-sans text-taupe-dark">
              <li><Link to="/shop" className="hover:text-burgundy transition-colors">All Pieces</Link></li>
              <li><Link to="/shop?category=clothing" className="hover:text-burgundy transition-colors">Clothing</Link></li>
              <li><Link to="/shop?category=dresses" className="hover:text-burgundy transition-colors">Dresses</Link></li>
              <li><Link to="/shop?category=tops" className="hover:text-burgundy transition-colors">Tops & Knits</Link></li>
              <li><Link to="/shop?category=bottoms" className="hover:text-burgundy transition-colors">Bottoms</Link></li>
              <li><Link to="/shop?category=accessories" className="hover:text-burgundy transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* Wardrobe Intelligence */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal">
              Intelligence
            </h4>
            <ul className="space-y-2 text-xs font-sans text-taupe-dark">
              <li><Link to="/style-studio" className="hover:text-burgundy transition-colors">Style Studio</Link></li>
              <li><Link to="/wardrobe" className="hover:text-burgundy transition-colors">Digital Wardrobe</Link></li>
              <li><Link to="/outfit-planner" className="hover:text-burgundy transition-colors">Outfit Planner</Link></li>
              <li><Link to="/wishlist" className="hover:text-burgundy transition-colors">Saved Wishlist</Link></li>
            </ul>
          </div>

          {/* Account & Orders */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal">
              Account
            </h4>
            <ul className="space-y-2 text-xs font-sans text-taupe-dark">
              <li><Link to="/profile" className="hover:text-burgundy transition-colors">My Profile</Link></li>
              <li><Link to="/orders" className="hover:text-burgundy transition-colors">Orders</Link></li>
              <li><Link to="/cart" className="hover:text-burgundy transition-colors">Shopping Bag</Link></li>
              <li><Link to="/admin" className="hover:text-burgundy transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Policies & Info */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal">
              Boutique
            </h4>
            <ul className="space-y-2 text-xs font-sans text-taupe-dark">
              <li><span className="text-taupe-muted">Complimentary Express Shipping</span></li>
              <li><span className="text-taupe-muted">30-Day Thoughtful Returns</span></li>
              <li><span className="text-taupe-muted">Curated Atelier In Mumbai & Paris</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Restrained copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-taupe-muted gap-4">
          <p>© 2026 StyleSense. Wardrobe Intelligence. All rights reserved.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <Link to="/privacy" className="hover:text-charcoal transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-charcoal transition-colors">Terms of Service</Link>
            <span className="text-taupe-light">|</span>
            <span className="text-taupe">Editorial Palette: Warm Ivory & Burgundy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
