import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Sliders,
  Layers,
  Sparkles,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Discover', path: '/' },
    { name: 'Clothing', path: '/shop' },
    { name: 'Mix & Match', path: '/mix-match' },
    { name: 'Accessories', path: '/shop?category=accessories' },
    { name: 'Style Studio', path: '/style-studio', highlight: true },
    { name: 'My Wardrobe', path: '/wardrobe' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F7F4F0]/95 backdrop-blur-md border-b border-[#D7D0C8]/70 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Mobile hamburger button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-charcoal hover:text-burgundy transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 stroke-[1.5]" /> : <Menu className="w-5 h-5 stroke-[1.5]" />}
            </button>
          </div>

          {/* Left: Refined Typographic Wordmark */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="group flex flex-col items-start">
              <span className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-charcoal group-hover:text-burgundy transition-colors leading-none">
                StyleSense
              </span>
              <span className="font-sans text-[7.5px] uppercase tracking-[0.32em] text-taupe mt-1 font-semibold">
                WARDROBE INTELLIGENCE
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 xl:space-x-9">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `relative py-1 text-[11px] font-sans font-medium uppercase tracking-[0.18em] transition-colors ${
                    isActive
                      ? 'text-burgundy font-semibold'
                      : 'text-charcoal/80 hover:text-charcoal'
                  }`
                }
              >
                {({ isActive }) => (
                  <span className="flex items-center gap-1.5">
                    {link.name}
                    {isActive && (
                      <span className="absolute -bottom-1.5 left-0 right-0 h-[1.5px] bg-burgundy" />
                    )}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Icons: Understated Search, Wishlist, Cart, Account */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search trigger */}
            <Link
              to="/shop"
              className="p-2 text-charcoal/80 hover:text-burgundy transition-colors"
              title="Search Catalog"
              aria-label="Search Catalog"
            >
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.5]" />
            </Link>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2 text-charcoal/80 hover:text-burgundy transition-colors"
              title="Saved Items"
              aria-label={`Wishlist with ${wishlistCount} items`}
            >
              <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.5]" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-burgundy text-white text-[9px] font-semibold w-3.5 h-3.5 rounded-full flex items-center justify-center font-sans">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-charcoal/80 hover:text-burgundy transition-colors"
              title="Shopping Bag"
              aria-label={`Shopping bag with ${cartCount} items`}
            >
              <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-charcoal text-white text-[9px] font-semibold w-3.5 h-3.5 rounded-full flex items-center justify-center font-sans">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 p-2 text-charcoal/80 hover:text-burgundy transition-colors"
                    aria-expanded={userMenuOpen}
                    aria-label="User Account Menu"
                  >
                    <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.5]" />
                    <span className="hidden xl:inline text-[11px] font-sans font-medium tracking-wider max-w-[90px] truncate text-charcoal">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white border border-[#D7D0C8] shadow-editorial py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-[#D7D0C8]/50">
                        <p className="text-xs font-semibold text-charcoal truncate">{user.name}</p>
                        <p className="text-[10px] text-taupe truncate font-sans">{user.email}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-xs text-burgundy font-semibold hover:bg-ivory transition-colors uppercase tracking-wider"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Admin Panel</span>
                        </Link>
                      )}

                      <Link
                        to="/account"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-charcoal hover:bg-ivory transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-taupe" />
                        <span>Account & Orders</span>
                      </Link>

                      <Link
                        to="/wardrobe"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-charcoal hover:bg-ivory transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5 text-taupe" />
                        <span>My Digital Wardrobe</span>
                      </Link>

                      <Link
                        to="/outfit-planner"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-charcoal hover:bg-ivory transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5 text-burgundy" />
                        <span>Outfit Planner</span>
                      </Link>

                      <Link
                        to="/style-studio"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-charcoal hover:bg-ivory transition-colors"
                      >
                        <Sliders className="w-3.5 h-3.5 text-taupe" />
                        <span>Style Profile</span>
                      </Link>

                      <div className="border-t border-[#D7D0C8]/50 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-700 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Link
                    to="/login"
                    className="text-[11px] font-sans font-medium uppercase tracking-[0.16em] text-charcoal hover:text-burgundy transition-colors px-2 py-1"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:inline-flex text-[11px] font-sans font-medium uppercase tracking-[0.16em] bg-charcoal text-white hover:bg-burgundy px-3.5 py-1.5 transition-colors"
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#F7F4F0] border-b border-[#D7D0C8] px-5 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-sans font-medium uppercase tracking-[0.18em] text-charcoal hover:text-burgundy"
            >
              Discover
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-sans font-medium uppercase tracking-[0.18em] text-charcoal hover:text-burgundy"
            >
              Clothing
            </Link>
            <Link
              to="/shop?category=accessories"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-sans font-medium uppercase tracking-[0.18em] text-charcoal hover:text-burgundy"
            >
              Accessories
            </Link>
            <Link
              to="/style-studio"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-sans font-medium uppercase tracking-[0.18em] text-burgundy font-semibold"
            >
              Style Studio
            </Link>
            <Link
              to="/wardrobe"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-sans font-medium uppercase tracking-[0.18em] text-charcoal hover:text-burgundy"
            >
              My Wardrobe
            </Link>
            <Link
              to="/outfit-planner"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-sans font-medium uppercase tracking-[0.18em] text-charcoal hover:text-burgundy"
            >
              Outfit Planner
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-sans font-semibold uppercase tracking-[0.18em] text-burgundy"
              >
                Admin Panel
              </Link>
            )}
            <Link
              to="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-sans font-medium uppercase tracking-[0.18em] text-charcoal hover:text-burgundy"
            >
              Account & Orders
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
