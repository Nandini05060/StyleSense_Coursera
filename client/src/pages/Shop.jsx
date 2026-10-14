import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, X, SlidersHorizontal, ArrowUpDown, RefreshCcw, ChevronRight, Check } from 'lucide-react';
import { api } from '../services/api';
import ProductGrid from '../components/product/ProductGrid';
import { formatINR } from '../utils/formatCurrency';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state initialized from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedOccasion, setSelectedOccasion] = useState(searchParams.get('occasion') || 'all');
  const [selectedStyle, setSelectedStyle] = useState(searchParams.get('style') || 'all');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') || 'all');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || 'all');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Available filter options
  const occasionOptions = [
    { id: 'all', label: 'All Occasions' },
    { id: 'casual', label: 'Casual Daywear' },
    { id: 'college', label: 'Campus & Everyday' },
    { id: 'office', label: 'Office & Workwear' },
    { id: 'party', label: 'Evening & Party' },
    { id: 'festive', label: 'Celebration & Festive' },
  ];

  const styleOptions = [
    { id: 'all', label: 'All Aesthetics' },
    { id: 'minimalist', label: 'Minimalist' },
    { id: 'streetwear', label: 'Streetwear' },
    { id: 'classic', label: 'Classic Tailoring' },
    { id: 'chic', label: 'Contemporary Chic' },
  ];

  const sizeOptions = ['all', 'XS', 'S', 'M', 'L', 'XL'];

  const colorOptions = [
    { name: 'all', label: 'All Tones', hex: '#FFFFFF' },
    { name: 'ivory', label: 'Ivory', hex: '#F7F4F0' },
    { name: 'charcoal', label: 'Charcoal', hex: '#191817' },
    { name: 'burgundy', label: 'Burgundy', hex: '#762D3D' },
    { name: 'beige', label: 'Beige', hex: '#E5DED5' },
    { name: 'black', label: 'Black', hex: '#000000' },
    { name: 'olive', label: 'Olive', hex: '#556B2F' },
    { name: 'camel', label: 'Camel', hex: '#C19A6B' },
    { name: 'navy', label: 'Navy', hex: '#1B263B' },
    { name: 'white', label: 'Pure White', hex: '#FFFFFF' },
  ];

  // Visual category tiles images
  const categoryTiles = [
    { slug: 'all', name: 'All Pieces', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=300&q=80' },
    { slug: 'tops', name: 'Tops & Knits', img: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=300&q=80' },
    { slug: 'bottoms', name: 'Tailored Bottoms', img: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=300&q=80' },
    { slug: 'dresses', name: 'Dresses', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=300&q=80' },
    { slug: 'outerwear', name: 'Outerwear', img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=300&q=80' },
    { slug: 'shoes', name: 'Footwear', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=300&q=80' },
    { slug: 'accessories', name: 'Accessories', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80' },
  ];

  // Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.getCategories();
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch products whenever filters or page change
  const fetchFilteredProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        occasion: selectedOccasion !== 'all' ? selectedOccasion : undefined,
        style: selectedStyle !== 'all' ? selectedStyle : undefined,
        size: selectedSize !== 'all' ? selectedSize : undefined,
        color: selectedColor !== 'all' ? selectedColor : undefined,
        maxPrice: maxPrice || undefined,
        sort: sortBy,
        page: currentPage,
        limit: 12,
      };

      const res = await api.getProducts(params);
      if (res.success) {
        let items = res.data;
        if (inStockOnly) {
          items = items.filter(p => !p.variants || p.variants.some(v => v.stock_quantity > 0));
        }
        setProducts(items);
        setMeta(res.meta || { total: items.length, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to fetch filtered products:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedOccasion, selectedStyle, selectedSize, selectedColor, maxPrice, inStockOnly, sortBy, currentPage]);

  useEffect(() => {
    fetchFilteredProducts();
  }, [fetchFilteredProducts]);

  // Sync to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedOccasion !== 'all') params.set('occasion', selectedOccasion);
    if (selectedStyle !== 'all') params.set('style', selectedStyle);
    if (selectedSize !== 'all') params.set('size', selectedSize);
    if (selectedColor !== 'all') params.set('color', selectedColor);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (inStockOnly) params.set('inStock', 'true');
    if (sortBy !== 'featured') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, selectedOccasion, selectedStyle, selectedSize, selectedColor, maxPrice, inStockOnly, sortBy, currentPage, setSearchParams]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedOccasion('all');
    setSelectedStyle('all');
    setSelectedSize('all');
    setSelectedColor('all');
    setMaxPrice('');
    setInStockOnly(false);
    setSortBy('featured');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedOccasion !== 'all' ||
    selectedStyle !== 'all' || selectedSize !== 'all' || selectedColor !== 'all' || maxPrice || inStockOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* 1. TOP AREA (Editorial Header following second reference) */}
      <div className="space-y-4 pb-6 border-b border-taupe-light/70">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-[10px] font-sans uppercase tracking-[0.2em] text-taupe-muted">
          <Link to="/" className="hover:text-charcoal transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-charcoal font-medium">Catalog</span>
          {selectedCategory !== 'all' && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-burgundy capitalize font-medium">{selectedCategory}</span>
            </>
          )}
        </nav>

        {/* Collection identifier & Large Serif Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.28em] text-taupe font-semibold block">
              AUTUMN / WINTER 2026
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-charcoal font-light tracking-tight mt-1">
              THE COLLECTION
            </h1>
            <p className="font-sans text-xs sm:text-sm text-taupe-dark max-w-xl font-light mt-2 leading-relaxed">
              Timeless silhouettes crafted in merino wool, pure silk, and structured cotton. Showing {meta.total} considered garments.
            </p>
          </div>

          {/* Search bar & Mobile filter button */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <input
                type="text"
                placeholder="Search collection..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-taupe-light/80 px-3.5 py-2 text-xs font-sans placeholder-taupe-muted focus:outline-none focus:border-charcoal transition-colors pr-9"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-taupe hover:text-charcoal"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-taupe-muted pointer-events-none" />
              )}
            </div>

            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-1.5 px-4 py-2 bg-charcoal text-white text-xs font-sans font-medium uppercase tracking-[0.14em]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Horizontal Row of Visual Category Tiles */}
        <div className="pt-4 flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
          {categoryTiles.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  setCurrentPage(1);
                }}
                className={`group flex items-center gap-2.5 px-3 py-2 border shrink-0 transition-all ${
                  isActive
                    ? 'border-charcoal bg-charcoal text-white'
                    : 'border-taupe-light/80 bg-white text-charcoal hover:border-charcoal'
                }`}
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-ivory shrink-0">
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-sans font-medium tracking-wide">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CATALOG LAYOUT: LEFT SIDEBAR + MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10 items-start">
        {/* Left Sidebar Filters */}
        <aside
          className={`lg:block ${
            mobileFilterOpen ? 'block' : 'hidden'
          } lg:col-span-1 space-y-6 bg-white lg:bg-transparent p-6 lg:p-0 border lg:border-none border-taupe-light`}
        >
          {/* Header of Filters */}
          <div className="flex items-center justify-between pb-3 border-b border-taupe-light/70">
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal">
              Filters
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[10px] font-sans font-medium uppercase tracking-[0.16em] text-burgundy hover:underline flex items-center gap-1"
              >
                <RefreshCcw className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* Department / Category */}
          <div className="space-y-2">
            <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-taupe block">
              Department
            </label>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }}
                className={`w-full text-left px-2.5 py-1.5 text-xs font-sans transition-colors flex items-center justify-between ${
                  selectedCategory === 'all'
                    ? 'bg-charcoal text-white font-medium'
                    : 'text-charcoal hover:bg-ivory'
                }`}
              >
                <span>All Departments</span>
              </button>
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => { setSelectedCategory(c.slug); setCurrentPage(1); }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs font-sans transition-colors flex items-center justify-between ${
                    selectedCategory === c.slug
                      ? 'bg-charcoal text-white font-medium'
                      : 'text-charcoal hover:bg-ivory'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className={`text-[10px] ${selectedCategory === c.slug ? 'text-ivory/80' : 'text-taupe-muted'}`}>
                    {c.productCount}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter (in INR) */}
          <div className="space-y-2.5 pt-3 border-t border-taupe-light/70">
            <div className="flex items-center justify-between">
              <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-taupe block">
                Price Ceiling
              </label>
              <span className="text-xs font-medium font-sans text-burgundy">
                {maxPrice ? formatINR(maxPrice) : 'All Prices'}
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="350"
              step="10"
              value={maxPrice || 350}
              onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
              className="w-full accent-charcoal cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-taupe-muted font-sans">
              <span>{formatINR(30)}</span>
              <span>{formatINR(180)}</span>
              <span>{formatINR(350)}+</span>
            </div>
          </div>

          {/* Clothing Size Filter */}
          <div className="space-y-2 pt-3 border-t border-taupe-light/70">
            <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-taupe block">
              Size
            </label>
            <div className="flex flex-wrap gap-1.5">
              {sizeOptions.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => { setSelectedSize(s); setCurrentPage(1); }}
                  className={`min-w-[36px] px-2 py-1 text-xs font-sans uppercase border transition-all ${
                    selectedSize === s
                      ? 'border-charcoal bg-charcoal text-white font-medium'
                      : 'border-taupe-light/80 bg-white text-charcoal hover:border-charcoal'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Palette Color Tone */}
          <div className="space-y-2 pt-3 border-t border-taupe-light/70">
            <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-taupe block">
              Color Tone
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {colorOptions.map((c) => {
                const isSelected = selectedColor === c.name;
                return (
                  <button
                    type="button"
                    key={c.name}
                    onClick={() => { setSelectedColor(c.name); setCurrentPage(1); }}
                    className={`flex items-center gap-2 px-2 py-1.5 text-xs font-sans text-left border transition-all ${
                      isSelected
                        ? 'border-burgundy bg-burgundy/5 text-burgundy font-medium'
                        : 'border-taupe-light/60 bg-white text-charcoal hover:border-taupe'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-taupe-light shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Occasion */}
          <div className="space-y-2 pt-3 border-t border-taupe-light/70">
            <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-taupe block">
              Occasion
            </label>
            <div className="space-y-1">
              {occasionOptions.map((occ) => (
                <button
                  type="button"
                  key={occ.id}
                  onClick={() => { setSelectedOccasion(occ.id); setCurrentPage(1); }}
                  className={`w-full text-left px-2 py-1 text-xs font-sans flex items-center justify-between transition-colors ${
                    selectedOccasion === occ.id
                      ? 'text-burgundy font-semibold'
                      : 'text-taupe-dark hover:text-charcoal'
                  }`}
                >
                  <span>{occ.label}</span>
                  {selectedOccasion === occ.id && <Check className="w-3 h-3 text-burgundy" />}
                </button>
              ))}
            </div>
          </div>

          {/* Style Aesthetic */}
          <div className="space-y-2 pt-3 border-t border-taupe-light/70">
            <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-taupe block">
              Aesthetic
            </label>
            <div className="space-y-1">
              {styleOptions.map((st) => (
                <button
                  type="button"
                  key={st.id}
                  onClick={() => { setSelectedStyle(st.id); setCurrentPage(1); }}
                  className={`w-full text-left px-2 py-1 text-xs font-sans flex items-center justify-between transition-colors ${
                    selectedStyle === st.id
                      ? 'text-burgundy font-semibold'
                      : 'text-taupe-dark hover:text-charcoal'
                  }`}
                >
                  <span>{st.label}</span>
                  {selectedStyle === st.id && <Check className="w-3 h-3 text-burgundy" />}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div className="pt-3 border-t border-taupe-light/70 flex items-center justify-between">
            <label htmlFor="instock-toggle" className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-taupe cursor-pointer">
              In Stock Only
            </label>
            <input
              id="instock-toggle"
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => {
                setInStockOnly(e.target.checked);
                setCurrentPage(1);
              }}
              className="accent-charcoal cursor-pointer w-4 h-4"
            />
          </div>
        </aside>

        {/* Main Catalog View: Sorting Bar + Product Grid */}
        <main className="lg:col-span-3 space-y-6">
          {/* Active Filter Indicators & Sort selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-taupe-light/70">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-sans uppercase tracking-[0.18em] text-taupe font-semibold">
                Filter:
              </span>
              {selectedCategory !== 'all' && (
                <span className="text-[10px] bg-ivory border border-taupe-light px-2 py-0.5 capitalize flex items-center gap-1 font-sans text-charcoal">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-burgundy">×</button>
                </span>
              )}
              {selectedOccasion !== 'all' && (
                <span className="text-[10px] bg-ivory border border-taupe-light px-2 py-0.5 capitalize flex items-center gap-1 font-sans text-charcoal">
                  {selectedOccasion}
                  <button onClick={() => setSelectedOccasion('all')} className="hover:text-burgundy">×</button>
                </span>
              )}
              {selectedStyle !== 'all' && (
                <span className="text-[10px] bg-ivory border border-taupe-light px-2 py-0.5 capitalize flex items-center gap-1 font-sans text-charcoal">
                  {selectedStyle}
                  <button onClick={() => setSelectedStyle('all')} className="hover:text-burgundy">×</button>
                </span>
              )}
              {selectedSize !== 'all' && (
                <span className="text-[10px] bg-ivory border border-taupe-light px-2 py-0.5 uppercase flex items-center gap-1 font-sans text-charcoal">
                  Size {selectedSize}
                  <button onClick={() => setSelectedSize('all')} className="hover:text-burgundy">×</button>
                </span>
              )}
              {selectedColor !== 'all' && (
                <span className="text-[10px] bg-ivory border border-taupe-light px-2 py-0.5 capitalize flex items-center gap-1 font-sans text-charcoal">
                  {selectedColor}
                  <button onClick={() => setSelectedColor('all')} className="hover:text-burgundy">×</button>
                </span>
              )}
              {!hasActiveFilters && (
                <span className="text-xs text-taupe-muted font-sans font-light">All Products</span>
              )}
            </div>

            {/* Sorting selector */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <label htmlFor="sort-select" className="text-[10px] font-sans uppercase tracking-[0.18em] text-taupe font-semibold shrink-0 flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" />
                <span>Sort:</span>
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="bg-white border border-taupe-light text-xs font-sans px-3 py-1.5 focus:outline-none focus:border-charcoal cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">New Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <ProductGrid
            products={products}
            loading={loading}
            onResetFilters={handleResetFilters}
          />

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="pt-8 border-t border-taupe-light/70 flex items-center justify-center gap-3">
              <button
                disabled={currentPage <= 1}
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 border border-taupe-light text-[11px] font-sans font-medium uppercase tracking-[0.16em] bg-white hover:bg-charcoal hover:text-white disabled:opacity-40 transition-colors"
              >
                Previous
              </button>

              <span className="px-4 py-2 text-xs font-sans text-charcoal font-medium">
                {currentPage} of {meta.totalPages}
              </span>

              <button
                disabled={currentPage >= meta.totalPages}
                onClick={() => {
                  setCurrentPage(prev => Math.min(meta.totalPages, prev + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 border border-taupe-light text-[11px] font-sans font-medium uppercase tracking-[0.16em] bg-white hover:bg-charcoal hover:text-white disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
