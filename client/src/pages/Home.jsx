import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Layers, Sliders, Check } from 'lucide-react';
import { api } from '../services/api';
import ProductGrid from '../components/product/ProductGrid';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const prodRes = await api.getProducts({ sort: 'featured', limit: 6 });
        if (prodRes.success) setFeaturedProducts(prodRes.data);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-24 sm:space-y-32 pb-24">
      {/* 1. EDITORIAL HERO (Closely following first reference image) */}
      <section className="relative bg-[#E5DED5] overflow-hidden min-h-[75vh] lg:min-h-[82vh] flex items-center border-b border-taupe-light/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Typography & CTAs */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 z-10">
              <div className="inline-block">
                <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-taupe-dark font-semibold">
                  THE NEW SEASON — 2026
                </span>
              </div>

              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-light text-charcoal leading-[0.98] tracking-tight">
                STYLE,<br />
                <span className="italic font-normal">REIMAGINED.</span>
              </h1>

              <p className="font-sans text-sm sm:text-base text-charcoal/80 leading-relaxed max-w-lg font-light">
                Discover pieces that reflect your style. Build better outfits from what you own, and shop with intention.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
                <Link
                  to="/shop"
                  className="editorial-btn-primary text-center px-8 py-3.5 text-xs font-semibold tracking-[0.2em] uppercase"
                >
                  EXPLORE THE COLLECTION
                </Link>
                <Link
                  to="/style-studio"
                  className="inline-flex items-center justify-center gap-2 text-xs font-sans font-semibold uppercase tracking-[0.18em] text-charcoal hover:text-burgundy transition-colors py-2"
                >
                  <span>DISCOVER YOUR STYLE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: High Fashion Center-Right Photography */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="relative mx-auto max-w-md lg:max-w-none aspect-[3/4] overflow-hidden bg-ivory border border-taupe-light shadow-subtle">
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85"
                  alt="StyleSense Editorial Campaign"
                  className="w-full h-full object-cover object-top transition-transform duration-1000 ease-out hover:scale-[1.02]"
                />
                {/* Subtle caption badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 border border-taupe-light/70 flex items-center justify-between">
                  <span className="font-serif text-xs text-charcoal italic">Atelier Series 01</span>
                  <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-burgundy font-semibold">
                    100% CONSIDERED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION A: SHOP THE COLLECTION (Asymmetrical editorial category layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-taupe-light/70">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-taupe font-semibold block">
              CURATED DEPARTMENTS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal mt-1 tracking-tight">
              Shop the Collection
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-sans font-medium uppercase tracking-[0.16em] text-charcoal hover:text-burgundy transition-colors mt-3 sm:mt-0 flex items-center gap-1.5"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Asymmetrical 4-Category Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Clothing - Tall Hero Block (5 cols) */}
          <Link
            to="/shop?category=clothing"
            className="group relative md:col-span-5 aspect-[4/5] bg-ivory overflow-hidden border border-taupe-light/70 flex flex-col justify-end p-6"
          >
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85"
              alt="Clothing Collection"
              className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
            <div className="relative z-10 text-white space-y-1">
              <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-ivory/80">Department 01</span>
              <h3 className="font-serif text-2xl sm:text-3xl font-light">Clothing</h3>
              <p className="font-sans text-xs text-ivory/90 font-light pt-1">
                Structured blazers, tailoring, and foundational outerwear.
              </p>
            </div>
          </Link>

          {/* Right Column Grid: Dresses, Tops & Bottoms, Accessories (7 cols) */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Dresses */}
            <Link
              to="/shop?category=dresses"
              className="group relative aspect-[3/4] bg-ivory overflow-hidden border border-taupe-light/70 flex flex-col justify-end p-5"
            >
              <img
                src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=85"
                alt="Dresses Collection"
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
              <div className="relative z-10 text-white space-y-1">
                <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-ivory/80">Department 02</span>
                <h3 className="font-serif text-xl sm:text-2xl font-light">Dresses</h3>
                <span className="text-[10px] font-sans text-ivory/80 tracking-wider block">Fluid Silks & Linen</span>
              </div>
            </Link>

            {/* Tops & Bottoms */}
            <Link
              to="/shop?category=tops"
              className="group relative aspect-[3/4] bg-ivory overflow-hidden border border-taupe-light/70 flex flex-col justify-end p-5"
            >
              <img
                src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=85"
                alt="Tops & Bottoms Collection"
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
              <div className="relative z-10 text-white space-y-1">
                <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-ivory/80">Department 03</span>
                <h3 className="font-serif text-xl sm:text-2xl font-light">Tops & Bottoms</h3>
                <span className="text-[10px] font-sans text-ivory/80 tracking-wider block">Merino Knits & Pleats</span>
              </div>
            </Link>

            {/* Accessories - Spanning 2 cols on tablet/desktop */}
            <Link
              to="/shop?category=accessories"
              className="group relative sm:col-span-2 aspect-[16/7] bg-ivory overflow-hidden border border-taupe-light/70 flex flex-col justify-end p-5"
            >
              <img
                src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85"
                alt="Accessories Collection"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/20 to-transparent" />
              <div className="relative z-10 text-white flex items-end justify-between">
                <div>
                  <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-ivory/80">Department 04</span>
                  <h3 className="font-serif text-xl sm:text-2xl font-light">Accessories & Footwear</h3>
                  <span className="text-[11px] font-sans text-ivory/80 tracking-wider block">Full-grain leather, scarves & jewelry</span>
                </div>
                <span className="text-xs font-sans uppercase tracking-[0.2em] font-semibold text-ivory group-hover:text-burgundy-200 transition-colors hidden sm:block">
                  Discover →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. SECTION B: THE STYLE EDIT (Curated Product Collection with INR prices) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-taupe-light/70">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-taupe font-semibold block">
              SEASONAL SELECTION
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal mt-1 tracking-tight">
              The Style Edit
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-sans font-medium uppercase tracking-[0.16em] text-charcoal hover:text-burgundy transition-colors mt-3 sm:mt-0 flex items-center gap-1.5"
          >
            <span>View All Pieces</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} loading={loading} />
      </section>

      {/* 4. SECTION C: INTRODUCE STYLE STUDIO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#E5DED5] border border-taupe-light/70 p-8 sm:p-14 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Visual Column */}
            <div className="lg:col-span-5 relative aspect-[4/5] bg-ivory overflow-hidden border border-taupe-light shadow-subtle">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85"
                alt="Style Studio Editorial"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 border border-taupe-light/70">
                <div className="flex items-center justify-between text-[10px] font-sans font-bold uppercase tracking-[0.18em] text-burgundy mb-1">
                  <span>95% MATCH</span>
                  <span>TRANSPARENT SCORING</span>
                </div>
                <p className="font-serif text-xs text-charcoal italic leading-relaxed">
                  “Matches your minimalist aesthetic, office occasion, and warm ivory palette within your budget.”
                </p>
              </div>
            </div>

            {/* Typography Column */}
            <div className="lg:col-span-7 space-y-6">
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-burgundy font-semibold block">
                RULE-BASED STYLING ENGINE
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-charcoal leading-[1.08] tracking-tight">
                LESS GUESSWORK.<br />
                <span className="italic font-normal">MORE PERSONAL STYLE.</span>
              </h2>
              <p className="font-sans text-sm sm:text-base text-charcoal/80 leading-relaxed font-light max-w-xl">
                Find pieces that fit your preferences, discover combinations, and make every purchase more considered.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/80 p-3.5 border border-taupe-light/60">
                  <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-taupe font-semibold block">Aesthetic Alignment</span>
                  <span className="font-serif text-sm text-charcoal mt-1 block">Minimalist, Classic, Streetwear</span>
                </div>
                <div className="bg-white/80 p-3.5 border border-taupe-light/60">
                  <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-taupe font-semibold block">Deterministic Rubric</span>
                  <span className="font-serif text-sm text-charcoal mt-1 block">100-Point Transparent Audit</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/style-studio"
                  className="editorial-btn-primary inline-block px-8 py-3.5 text-xs font-semibold tracking-[0.2em] uppercase"
                >
                  FIND YOUR STYLE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION D: YOUR WARDROBE, REIMAGINED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-taupe-light/70 bg-white p-8 sm:p-14 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Typography Column */}
            <div className="lg:col-span-7 space-y-6">
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-taupe font-semibold block">
                WARDROBE INTELLIGENCE
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-charcoal leading-[1.08] tracking-tight">
                MORE OUTFITS.<br />
                <span className="italic font-normal">FEWER UNWORN PIECES.</span>
              </h2>
              <p className="font-sans text-sm sm:text-base text-charcoal/80 leading-relaxed font-light max-w-xl">
                Organize your digital wardrobe, create versatile outfit combinations, track clothing usage and cost-per-wear, and compare new purchases against items you already own before buying.
              </p>

              <div className="space-y-2.5 pt-2 font-sans text-xs text-charcoal/90">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-burgundy rounded-full" />
                  <span>Smart Buy-or-Reuse Advisor checks for duplicate silhouettes before checkout</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-burgundy rounded-full" />
                  <span>Cost-per-wear analytics revealing your most versatile investments</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-burgundy rounded-full" />
                  <span>Wardrobe Gap Detector identifying missing foundational pieces</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/wardrobe"
                  className="editorial-btn-primary inline-block px-8 py-3.5 text-xs font-semibold tracking-[0.2em] uppercase"
                >
                  EXPLORE YOUR WARDROBE
                </Link>
              </div>
            </div>

            {/* Collage Visual */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] bg-ivory border border-taupe-light/70 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80"
                  alt="Tailored trench"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[3/4] bg-ivory border border-taupe-light/70 overflow-hidden mt-6">
                <img
                  src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80"
                  alt="Leather footwear"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
