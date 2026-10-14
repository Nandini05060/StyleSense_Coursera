import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import StyleStudio from './pages/StyleStudio';
import OutfitBuilder from './pages/OutfitBuilder';
import MixMatchStudio from './pages/MixMatchStudio';
import StylePassport from './pages/StylePassport';
import FitFinder from './pages/FitFinder';
import Wardrobe from './pages/Wardrobe';
import OutfitPlanner from './pages/OutfitPlanner';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col bg-ivory text-charcoal selection:bg-burgundy selection:text-white">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/style-studio" element={<StyleStudio />} />
                    <Route path="/style-passport" element={<StylePassport />} />
                    <Route path="/mix-match" element={<MixMatchStudio />} />
                    <Route path="/fit-finder" element={<FitFinder />} />
                    <Route path="/wardrobe" element={<Wardrobe />} />
                    <Route path="/outfit-planner" element={<OutfitPlanner />} />
                    <Route path="/outfit-builder" element={<OutfitBuilder />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
