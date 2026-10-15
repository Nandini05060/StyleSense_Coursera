import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  Sparkles,
  Plus,
  Search,
  Filter,
  Heart,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  Upload,
  Link as LinkIcon,
  X,
  Eye,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/formatCurrency';

const CATEGORIES = [
  { slug: 'all', name: 'All Pieces' },
  { slug: 'tops', name: 'Tops & Knits' },
  { slug: 'bottoms', name: 'Trousers & Denim' },
  { slug: 'outerwear', name: 'Blazers & Coats' },
  { slug: 'dresses', name: 'Dresses' },
  { slug: 'shoes', name: 'Footwear' },
  { slug: 'accessories', name: 'Accessories' }
];

const OCCASIONS = [
  'casual',
  'college',
  'office',
  'interview',
  'party',
  'festive',
  'formal',
  'travel'
];

const STYLES = ['minimalist', 'classic', 'chic', 'streetwear', 'relaxed'];

export default function Wardrobe() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Active Tab: 'collection' | 'analytics' | 'gaps' | 'outfits'
  const [activeTab, setActiveTab] = useState('collection');

  // Wardrobe Items State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedOccasion, setSelectedOccasion] = useState('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Analytics & Gaps State
  const [analytics, setAnalytics] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [savedOutfits, setSavedOutfits] = useState([]);

  // Modals State
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  // Add / Edit Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('tops');
  const [formColor, setFormColor] = useState('White');
  const [formStyle, setFormStyle] = useState('minimalist');
  const [formOccasion, setFormOccasion] = useState('casual');
  const [formSize, setFormSize] = useState('M');
  const [formBrand, setFormBrand] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formWearsCount, setFormWearsCount] = useState(0);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' | 'file'
  const [submitting, setSubmitting] = useState(false);

  // Wear Log Modal State
  const [wearModalItem, setWearModalItem] = useState(null);
  const [wearOccasion, setWearOccasion] = useState('casual');
  const [wearNotes, setWearNotes] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadWardrobeData();
  }, [isAuthenticated, selectedCategory, selectedColor, selectedOccasion, onlyFavorites, sortBy, search]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAnalyticsAndGaps();
      loadSavedOutfits();
    }
  }, [isAuthenticated]);

  const loadWardrobeData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedColor !== 'all') params.color = selectedColor;
      if (selectedOccasion !== 'all') params.occasion = selectedOccasion;
      if (onlyFavorites) params.is_favorite = true;
      if (search.trim()) params.search = search.trim();
      if (sortBy) params.sort = sortBy;

      const res = await api.getWardrobeItems(params);
      if (res && res.success) {
        setItems(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching wardrobe items:', err);
      showToast('Could not load wardrobe items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyticsAndGaps = async () => {
    try {
      const [analyticsRes, gapsRes] = await Promise.all([
        api.getWardrobeAnalytics(),
        api.getWardrobeGaps()
      ]);
      if (analyticsRes?.success) setAnalytics(analyticsRes.data);
      if (gapsRes?.success) setGaps(gapsRes.data);
    } catch (err) {
      console.warn('Analytics or gaps loading error:', err);
    }
  };

  const loadSavedOutfits = async () => {
    try {
      const res = await api.getSavedOutfits();
      if (res?.success) setSavedOutfits(res.data || []);
    } catch (err) {
      console.warn('Saved outfits error:', err);
    }
  };

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const handleToggleFavorite = async (itemId, e) => {
    e.stopPropagation();
    try {
      const res = await api.toggleWardrobeFavorite(itemId);
      if (res && res.success) {
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, is_favorite: res.data.is_favorite } : item));
        showToast(res.message || 'Favorite updated', 'success');
      }
    } catch (err) {
      showToast('Error updating favorite', 'error');
    }
  };

  const openWearModal = (item, e) => {
    e.stopPropagation();
    setWearModalItem(item);
    setWearOccasion(item.occasion || 'casual');
    setWearNotes('');
  };

  const submitWearLog = async () => {
    if (!wearModalItem) return;
    try {
      const res = await api.recordItemWear(wearModalItem.id, {
        occasion_worn: wearOccasion,
        notes: wearNotes
      });
      if (res && res.success) {
        showToast(`Recorded wear for ${wearModalItem.name}!`, 'success');
        setItems(prev => prev.map(item => item.id === wearModalItem.id ? res.data.item : item));
        setWearModalItem(null);
        loadAnalyticsAndGaps();
      }
    } catch (err) {
      showToast('Failed to record wear.', 'error');
    }
  };

  const handleDeleteItem = async (itemId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this wardrobe item?')) return;
    try {
      const res = await api.deleteWardrobeItem(itemId);
      if (res && res.success) {
        showToast('Wardrobe piece deleted.', 'success');
        setItems(prev => prev.filter(i => i.id !== itemId));
        loadAnalyticsAndGaps();
        if (viewingItem?.id === itemId) setViewingItem(null);
      }
    } catch (err) {
      showToast('Could not delete item.', 'error');
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('tops');
    setFormColor('White');
    setFormStyle('minimalist');
    setFormOccasion('casual');
    setFormSize('M');
    setFormBrand('');
    setFormPrice('');
    setFormWearsCount(0);
    setFormImageUrl('');
    setUploadFile(null);
    setUploadMode('url');
    setAddItemModalOpen(true);
  };

  const openEditModal = (item, e) => {
    if (e) e.stopPropagation();
    setEditingItem(item);
    setFormName(item.name || '');
    setFormCategory(item.category || 'tops');
    setFormColor(item.color || 'White');
    setFormStyle(item.style || 'minimalist');
    setFormOccasion(item.occasion || 'casual');
    setFormSize(item.size || 'M');
    setFormBrand(item.brand || '');
    setFormPrice(item.purchase_price !== null && item.purchase_price !== undefined ? String(item.purchase_price) : '');
    setFormWearsCount(item.wears_count !== undefined && item.wears_count !== null ? Number(item.wears_count) : 0);
    setFormImageUrl(item.image_url || '');
    setUploadFile(null);
    setUploadMode('url');
    setAddItemModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please enter an item name.', 'error');
      return;
    }

    setSubmitting(true);
    let finalImageUrl = formImageUrl.trim();

    try {
      // If user uploaded a local image file, send to secure upload endpoint
      if (uploadMode === 'file' && uploadFile) {
        const formData = new FormData();
        formData.append('image', uploadFile);
        const uploadRes = await api.uploadWardrobeImage(formData);
        if (uploadRes?.success && uploadRes.imageUrl) {
          finalImageUrl = uploadRes.imageUrl;
        }
      }

      if (!finalImageUrl) {
        finalImageUrl = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80';
      }

      const payload = {
        name: formName.trim(),
        category: formCategory,
        color: formColor.trim(),
        style: formStyle,
        occasion: formOccasion,
        size: formSize.trim(),
        brand: formBrand.trim() || null,
        purchase_price: formPrice !== '' ? parseFloat(formPrice) : null,
        wears_count: Math.max(0, parseInt(formWearsCount, 10) || 0),
        image_url: finalImageUrl
      };

      if (editingItem) {
        const res = await api.updateWardrobeItem(editingItem.id, payload);
        if (res && res.success) {
          showToast('Wardrobe item updated.', 'success');
          setItems(prev => prev.map(i => i.id === editingItem.id ? res.data : i));
          if (viewingItem?.id === editingItem.id) setViewingItem(res.data);
        }
      } else {
        const res = await api.createWardrobeItem(payload);
        if (res && res.success) {
          showToast('Added to your digital wardrobe!', 'success');
          setItems(prev => [res.data, ...prev]);
        }
      }

      setAddItemModalOpen(false);
      loadAnalyticsAndGaps();
    } catch (err) {
      showToast(err.message || 'Failed to save wardrobe item.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismissGap = async (gapKey) => {
    try {
      await api.dismissWardrobeGap(gapKey);
      setGaps(prev => prev.filter(g => g.key !== gapKey));
      showToast('Suggestion dismissed.', 'success');
    } catch (err) {
      showToast('Could not dismiss suggestion.', 'error');
    }
  };

  const handleDeleteSavedOutfit = async (outfitId) => {
    if (!window.confirm('Delete this saved outfit?')) return;
    try {
      await api.deleteSavedOutfit(outfitId);
      setSavedOutfits(prev => prev.filter(o => o.id !== outfitId));
      showToast('Outfit removed.', 'success');
    } catch (err) {
      showToast('Could not delete outfit.', 'error');
    }
  };

  return (
    <div className="bg-ivory min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Editorial Header & Stats Strip */}
        <div className="bg-white border border-taupe-light/80 p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-taupe-light/60">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-burgundy bg-burgundy/10 px-2 py-0.5">
                  Digital Wardrobe Intelligence
                </span>
                <span className="text-xs text-taupe font-sans">• Authenticated Ownership</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal tracking-tight">
                My Digital Wardrobe
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-taupe font-sans max-w-2xl leading-relaxed">
                Catalog your clothes, track cost-per-wear utility, discover wardrobe gaps, and style what you already own before purchasing new products.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 bg-charcoal hover:bg-burgundy text-white text-xs uppercase tracking-widest font-semibold px-4 py-2.5 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Wardrobe Piece</span>
              </button>
              <Link
                to="/outfit-planner"
                className="inline-flex items-center gap-2 bg-ivory hover:bg-taupe-light/50 text-charcoal border border-taupe-light text-xs uppercase tracking-widest font-semibold px-4 py-2.5 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-burgundy" />
                <span>Plan Outfits</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          {analytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
              <div className="border-l-2 border-burgundy pl-4">
                <span className="text-[10px] uppercase tracking-widest text-taupe block font-sans">Total Closet Pieces</span>
                <span className="font-serif text-2xl font-semibold text-charcoal">{analytics.totalItems}</span>
              </div>
              <div className="border-l-2 border-charcoal pl-4">
                <span className="text-[10px] uppercase tracking-widest text-taupe block font-sans">Logged Investment</span>
                <span className="font-serif text-2xl font-semibold text-charcoal">
                  {formatINR(analytics.totalInvestment || 0)}
                </span>
              </div>
              <div className="border-l-2 border-burgundy pl-4">
                <span className="text-[10px] uppercase tracking-widest text-taupe block font-sans">Avg Cost Per Wear</span>
                <span className="font-serif text-2xl font-semibold text-charcoal">
                  {analytics.averageCostPerWear !== null ? `${formatINR(analytics.averageCostPerWear)}` : '—'}
                </span>
              </div>
              <div className="border-l-2 border-taupe pl-4">
                <span className="text-[10px] uppercase tracking-widest text-taupe block font-sans">Identified Gaps</span>
                <span className="font-serif text-2xl font-semibold text-burgundy">{gaps.length}</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-taupe-light/80 mb-6 space-x-6 sm:space-x-8 overflow-x-auto text-xs font-sans uppercase tracking-widest font-semibold">
          <button
            onClick={() => setActiveTab('collection')}
            className={`pb-3 relative transition-colors whitespace-nowrap ${
              activeTab === 'collection' ? 'text-burgundy' : 'text-taupe hover:text-charcoal'
            }`}
          >
            Closet Collection ({items.length})
            {activeTab === 'collection' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-burgundy" />}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 relative transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'analytics' ? 'text-burgundy' : 'text-taupe hover:text-charcoal'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Cost-Per-Wear Tracker</span>
            {activeTab === 'analytics' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-burgundy" />}
          </button>
          <button
            onClick={() => setActiveTab('gaps')}
            className={`pb-3 relative transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'gaps' ? 'text-burgundy' : 'text-taupe hover:text-charcoal'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-burgundy" />
            <span>Wardrobe Gap Finder ({gaps.length})</span>
            {activeTab === 'gaps' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-burgundy" />}
          </button>
          <button
            onClick={() => setActiveTab('outfits')}
            className={`pb-3 relative transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'outfits' ? 'text-burgundy' : 'text-taupe hover:text-charcoal'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Saved Outfits ({savedOutfits.length})</span>
            {activeTab === 'outfits' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-burgundy" />}
          </button>
        </div>

        {/* TAB 1: CLOSET COLLECTION */}
        {activeTab === 'collection' && (
          <div>
            {/* Filter and Search Bar */}
            <div className="bg-white border border-taupe-light/70 p-4 mb-6 space-y-4">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`px-3 py-1.5 text-xs font-sans uppercase tracking-wider whitespace-nowrap border transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-charcoal text-white border-charcoal'
                        : 'bg-ivory/60 text-charcoal border-taupe-light/60 hover:border-charcoal'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Sub-Filters: Search, Occasion, Color, Favorites, Sort */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-taupe-light/50 text-xs">
                {/* Search input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-taupe absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search closet..."
                    className="w-full bg-ivory pl-8 pr-3 py-2 text-xs border border-taupe-light/70 focus:outline-none focus:border-burgundy text-charcoal"
                  />
                </div>

                {/* Occasion filter */}
                <div>
                  <select
                    value={selectedOccasion}
                    onChange={(e) => setSelectedOccasion(e.target.value)}
                    className="w-full bg-ivory px-3 py-2 text-xs border border-taupe-light/70 focus:outline-none focus:border-burgundy text-charcoal uppercase tracking-wider"
                  >
                    <option value="all">All Occasions</option>
                    {OCCASIONS.map(occ => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>

                {/* Favorites filter */}
                <div className="flex items-center">
                  <button
                    onClick={() => setOnlyFavorites(!onlyFavorites)}
                    className={`w-full py-2 px-3 text-xs border flex items-center justify-center gap-2 uppercase tracking-wider font-semibold transition-colors ${
                      onlyFavorites
                        ? 'bg-burgundy text-white border-burgundy'
                        : 'bg-ivory text-charcoal border-taupe-light/70 hover:border-burgundy'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white' : ''}`} />
                    <span>Favorites Only</span>
                  </button>
                </div>

                {/* Sort selection */}
                <div className="sm:col-span-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-ivory px-3 py-2 text-xs border border-taupe-light/70 focus:outline-none focus:border-burgundy text-charcoal uppercase tracking-wider"
                  >
                    <option value="newest">Sort: Newly Added</option>
                    <option value="wears_desc">Sort: Most Worn First</option>
                    <option value="wears_asc">Sort: Least Worn First (Underused)</option>
                    <option value="price_desc">Sort: Highest Investment</option>
                    <option value="price_asc">Sort: Lowest Price</option>
                    <option value="name_asc">Sort: Name (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Wardrobe Items Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="bg-white border border-taupe-light/60 aspect-[3/4]" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white border border-taupe-light/80 p-12 text-center my-6">
                <Layers className="w-12 h-12 text-taupe-light mx-auto mb-3" />
                <h3 className="font-serif text-xl text-charcoal mb-1">Your Digital Wardrobe is Ready</h3>
                <p className="text-xs text-taupe font-sans max-w-md mx-auto mb-6">
                  {search || selectedCategory !== 'all' || onlyFavorites
                    ? 'No clothing items match your current search and filters. Try clearing your filters.'
                    : 'Start by cataloging your everyday staples. Once added, StyleSense AI will calculate your cost per wear and suggest outfits.'}
                </p>
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 bg-charcoal hover:bg-burgundy text-white text-xs uppercase tracking-widest font-semibold px-5 py-2.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Clothing Item</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map((item) => {
                  const cpw = item.cpw || {};
                  return (
                    <div
                      key={item.id}
                      onClick={() => setViewingItem(item)}
                      className="group bg-white border border-taupe-light/70 hover:border-charcoal transition-all duration-200 cursor-pointer flex flex-col shadow-sm"
                    >
                      {/* Image Frame */}
                      <div className="relative aspect-[3/4] bg-taupe-light/20 overflow-hidden">
                        {!imageErrors[item.id] ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            onError={() => handleImageError(item.id)}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-ivory text-taupe">
                            <Layers className="w-8 h-8" />
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                          <span className="text-[9px] uppercase tracking-widest font-bold bg-charcoal/90 text-white px-2 py-0.5">
                            {item.category}
                          </span>
                        </div>

                        {/* Favorite button */}
                        <button
                          onClick={(e) => handleToggleFavorite(item.id, e)}
                          className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 hover:bg-white text-charcoal hover:text-burgundy transition-colors rounded-none shadow-sm"
                          title={item.is_favorite ? 'Remove Favorite' : 'Add to Favorites'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${item.is_favorite ? 'fill-burgundy text-burgundy' : ''}`} />
                        </button>

                        {/* Cost Per Wear Badge on bottom */}
                        <div className="absolute bottom-0 inset-x-0 bg-charcoal/85 backdrop-blur-sm text-ivory px-3 py-1.5 flex items-center justify-between text-[10px]">
                          <span>
                            {cpw.status === 'calculated'
                              ? `${formatINR(cpw.costPerWear)} / wear`
                              : cpw.status === 'never_worn'
                              ? 'Not worn yet'
                              : 'Price not logged'}
                          </span>
                          <span className="text-white/80 uppercase tracking-widest text-[9px]">
                            {item.wears_count || 0} wear{item.wears_count === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>

                      {/* Item Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-taupe uppercase tracking-wider mb-1">
                            <span>{item.brand || 'Wardrobe Staple'}</span>
                            <span>{item.size || 'M'}</span>
                          </div>
                          <h4 className="font-serif text-sm font-medium text-charcoal truncate" title={item.name}>
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-taupe font-sans mt-0.5 capitalize">
                            {item.color} • {item.style} • {item.occasion}
                          </p>
                        </div>

                        {/* Action buttons footer */}
                        <div className="mt-4 pt-3 border-t border-taupe-light/50 flex items-center justify-between">
                          <button
                            onClick={(e) => openWearModal(item, e)}
                            className="inline-flex items-center gap-1 text-[10px] font-sans font-bold uppercase tracking-wider text-burgundy hover:text-charcoal transition-colors bg-burgundy/10 px-2 py-1"
                            title="Log a wear"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Log Wear</span>
                          </button>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => openEditModal(item, e)}
                              className="p-1.5 text-taupe hover:text-charcoal transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteItem(item.id, e)}
                              className="p-1.5 text-taupe hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COST-PER-WEAR TRACKER & ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {analytics ? (
              <>
                {/* Rule Documentation & Explanatory Box */}
                <div className="bg-white border-l-4 border-burgundy p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <h3 className="font-serif text-lg text-charcoal font-medium">
                      How StyleSense AI Calculates Cost-Per-Wear & Identifies Underused Items
                    </h3>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-burgundy bg-burgundy/10 px-2.5 py-1 self-start sm:self-auto">
                      Deterministic Formula
                    </span>
                  </div>
                  <div className="text-xs text-taupe font-sans leading-relaxed space-y-2">
                    <p>
                      <strong className="text-charcoal font-semibold">Cost Per Wear Formula:</strong>{' '}
                      <span className="font-mono bg-ivory px-2 py-0.5 border border-taupe-light text-charcoal">
                        Cost per Wear = Purchase Price / Recorded Number of Wears
                      </span>
                      . If the wear count is zero, the garment displays <strong className="text-charcoal font-semibold">"Not worn yet"</strong> instead of dividing by zero.
                    </p>
                    <p>
                      <strong className="text-charcoal font-semibold">Underused Garment Rule:</strong> Any garment owned for <strong className="text-charcoal font-semibold">30 or more days</strong> with <strong className="text-charcoal font-semibold">2 or fewer logged wears</strong>, or never worn since adding to your wardrobe. Users can correct or update usage records at any time by clicking <span className="text-burgundy font-semibold">"Update Wears"</span>.
                    </p>
                  </div>
                </div>

                {/* Planned Shopping Budget vs Actual Recorded Purchases */}
                <div className="bg-white border border-taupe-light/70 p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-taupe-light/60 mb-6 gap-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-burgundy font-bold block mb-0.5">
                        Financial Stewardship
                      </span>
                      <h4 className="font-serif text-lg font-semibold text-charcoal">
                        Planned Shopping Budget vs. Recorded Closet Investment
                      </h4>
                    </div>
                    {analytics.budgetComparison?.plannedBudget && (
                      <span
                        className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 self-start sm:self-auto border ${
                          analytics.budgetComparison.status === 'within_budget'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}
                      >
                        {analytics.budgetComparison.status === 'within_budget'
                          ? `Within Planned Budget (Remaining: ${formatINR(Math.max(0, analytics.budgetComparison.remainingBudget))})`
                          : `Budget Exceeded by ${formatINR(Math.abs(analytics.budgetComparison.remainingBudget))}`}
                      </span>
                    )}
                  </div>

                  {analytics.budgetComparison?.plannedBudget ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="p-4 bg-ivory/60 border border-taupe-light/50">
                          <span className="text-[10px] uppercase tracking-widest text-taupe block font-sans">
                            Planned Seasonal Budget
                          </span>
                          <span className="font-serif text-2xl font-bold text-charcoal mt-1 block">
                            {formatINR(analytics.budgetComparison.plannedBudget)}
                          </span>
                          <span className="text-[10px] text-taupe font-sans mt-0.5 block">Configured in Style Passport</span>
                        </div>
                        <div className="p-4 bg-ivory/60 border border-taupe-light/50">
                          <span className="text-[10px] uppercase tracking-widest text-taupe block font-sans">
                            Recorded Closet Spend
                          </span>
                          <span className="font-serif text-2xl font-bold text-charcoal mt-1 block">
                            {formatINR(analytics.budgetComparison.actualInvestment)}
                          </span>
                          <span className="text-[10px] text-taupe font-sans mt-0.5 block">Across logged garment prices</span>
                        </div>
                        <div className="p-4 bg-ivory/60 border border-taupe-light/50">
                          <span className="text-[10px] uppercase tracking-widest text-taupe block font-sans">
                            Budget Utilization
                          </span>
                          <span className="font-serif text-2xl font-bold text-burgundy mt-1 block">
                            {analytics.budgetComparison.utilizationPercentage || 0}%
                          </span>
                          <span className="text-[10px] text-taupe font-sans mt-0.5 block">Of allocated seasonal ceiling</span>
                        </div>
                      </div>

                      {/* Thin Editorial Progress Bar */}
                      <div>
                        <div className="flex justify-between text-[11px] text-taupe mb-1 font-sans">
                          <span>Progress to Budget Cap</span>
                          <span>{analytics.budgetComparison.utilizationPercentage || 0}%</span>
                        </div>
                        <div className="w-full bg-ivory h-2.5 overflow-hidden border border-taupe-light/50">
                          <div
                            className={`h-full transition-all duration-500 ${
                              analytics.budgetComparison.status === 'within_budget' ? 'bg-burgundy' : 'bg-red-700'
                            }`}
                            style={{ width: `${Math.min(100, analytics.budgetComparison.utilizationPercentage || 0)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-ivory/50 border border-taupe-light/60 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-charcoal">No seasonal budget configured in your Style Passport.</p>
                        <p className="text-[11px] text-taupe mt-0.5">
                          Set a planned seasonal clothing budget to unlock real-time financial tracking against closet acquisitions.
                        </p>
                      </div>
                      <Link
                        to="/style-passport"
                        className="inline-flex items-center gap-1.5 bg-charcoal hover:bg-burgundy text-white text-xs uppercase tracking-widest font-semibold px-4 py-2 transition-colors whitespace-nowrap"
                      >
                        <span>Set Budget in Passport</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Monthly Wear Trends */}
                <div className="bg-white border border-taupe-light/70 p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-taupe-light/60 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-burgundy" />
                      <h4 className="font-serif text-base font-semibold text-charcoal">Monthly Wear Trends</h4>
                    </div>
                    <span className="text-[10px] text-taupe uppercase tracking-wider">Historical Utility</span>
                  </div>

                  {analytics.monthlyWearTrends && analytics.monthlyWearTrends.length > 0 ? (
                    <div className="space-y-4">
                      {(() => {
                        const maxWears = Math.max(...analytics.monthlyWearTrends.map(m => m.wears), 1);
                        return analytics.monthlyWearTrends.map(item => (
                          <div key={item.month}>
                            <div className="flex justify-between text-xs text-charcoal mb-1">
                              <span className="font-medium">{item.label}</span>
                              <span className="font-mono text-taupe font-semibold">
                                {item.wears} wear{item.wears === 1 ? '' : 's'} logged
                              </span>
                            </div>
                            <div className="w-full bg-ivory h-2.5 overflow-hidden border border-taupe-light/40">
                              <div
                                className="bg-burgundy h-full transition-all duration-500"
                                style={{ width: `${Math.round((item.wears / maxWears) * 100)}%` }}
                              />
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  ) : (
                    <p className="text-xs text-taupe py-6 text-center font-sans">
                      No monthly wear activity recorded yet. As you record wears with the "Log Wear" button, monthly frequency trends will be charted here.
                    </p>
                  )}
                </div>

                {/* 2-Column Grid: Most Worn vs Underused */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Most Frequently Worn */}
                  <div className="bg-white border border-taupe-light/70 p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-taupe-light/60 mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-700" />
                        <h4 className="font-serif text-base font-semibold text-charcoal">Highest Utility Pieces</h4>
                      </div>
                      <span className="text-[10px] text-taupe uppercase tracking-wider">Top 5 by Wears</span>
                    </div>

                    {analytics.mostWornItems?.length === 0 ? (
                      <p className="text-xs text-taupe py-6 text-center">No wear history recorded yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {analytics.mostWornItems.map((item, idx) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-ivory/50 border border-taupe-light/50">
                            <div className="flex items-center gap-3">
                              <span className="font-serif text-sm font-bold text-taupe w-4">#{idx + 1}</span>
                              <div className="w-10 h-12 bg-taupe-light/30 overflow-hidden flex-shrink-0">
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-charcoal truncate max-w-[180px]">{item.name}</p>
                                <p className="text-[10px] text-taupe capitalize">{item.category}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-emerald-800">
                                {item.cost_per_wear ? `${formatINR(item.cost_per_wear)}/wear` : 'Not worn yet'}
                              </span>
                              <span className="text-[10px] text-taupe block">{item.wears_count} wears</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Underused Garments */}
                  <div className="bg-white border border-taupe-light/70 p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-taupe-light/60 mb-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-burgundy" />
                        <h4 className="font-serif text-base font-semibold text-charcoal">Underused Clothing Pieces</h4>
                      </div>
                      <span className="text-[10px] text-burgundy uppercase tracking-wider font-semibold">Needs Restyling</span>
                    </div>

                    {analytics.underusedItems?.length === 0 ? (
                      <p className="text-xs text-taupe py-6 text-center">All your items are being actively worn!</p>
                    ) : (
                      <div className="space-y-3">
                        {analytics.underusedItems.map((item) => (
                          <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-ivory/50 border border-taupe-light/50 gap-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-12 bg-taupe-light/30 overflow-hidden flex-shrink-0">
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-charcoal truncate max-w-[180px]">{item.name}</p>
                                <p className="text-[10px] text-burgundy font-medium">{item.reason}</p>
                                <span className="text-[9px] text-taupe font-mono">
                                  Cost: {item.cost_per_wear_display || (item.wears_count === 0 ? 'Not worn yet' : '—')}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <button
                                onClick={(e) => openEditModal(item, e)}
                                className="text-[10px] uppercase tracking-wider font-semibold text-taupe hover:text-charcoal border border-taupe-light px-2 py-1 bg-white"
                                title="Update usage record"
                              >
                                Update Wears
                              </button>
                              <button
                                onClick={() => navigate('/outfit-planner')}
                                className="text-[10px] uppercase tracking-wider font-bold text-charcoal hover:text-burgundy bg-burgundy/10 px-2.5 py-1"
                              >
                                Style Piece
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Category & Color Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white border border-taupe-light/70 p-6 shadow-sm">
                    <h4 className="font-serif text-base font-semibold text-charcoal mb-4">
                      Category Investment & Distribution
                    </h4>
                    <div className="space-y-3">
                      {analytics.categoryDistribution?.map((cat) => (
                        <div key={cat.category}>
                          <div className="flex justify-between text-xs text-charcoal mb-1">
                            <span className="capitalize font-medium">{cat.category}</span>
                            <span className="font-mono text-taupe">
                              {cat.count} items ({cat.percentage}%) • {formatINR(cat.investment || 0)}
                            </span>
                          </div>
                          <div className="w-full bg-ivory h-2 overflow-hidden border border-taupe-light/40">
                            <div className="bg-charcoal h-full" style={{ width: `${cat.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-taupe-light/70 p-6 shadow-sm">
                    <h4 className="font-serif text-base font-semibold text-charcoal mb-4">Color Palette Balance</h4>
                    <div className="space-y-3">
                      {analytics.colorDistribution?.map((col) => (
                        <div key={col.color}>
                          <div className="flex justify-between text-xs text-charcoal mb-1">
                            <span className="capitalize">{col.color}</span>
                            <span className="font-mono text-taupe">{col.count} items ({col.percentage}%)</span>
                          </div>
                          <div className="w-full bg-ivory h-2 overflow-hidden border border-taupe-light/40">
                            <div className="bg-burgundy h-full" style={{ width: `${col.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-8 text-center text-taupe">Loading analytics...</div>
            )}
          </div>
        )}

        {/* TAB 3: WARDROBE GAP FINDER */}
        {activeTab === 'gaps' && (
          <div className="space-y-6">
            <div className="bg-white border-l-4 border-charcoal p-6 shadow-sm">
              <h3 className="font-serif text-lg text-charcoal font-medium mb-1">
                Transparent Capsule Gap Identification
              </h3>
              <p className="text-xs text-taupe font-sans leading-relaxed">
                StyleSense AI analyzes category and occasion balances in your actual digital wardrobe to suggest strategic additions.
                Gaps are non-mandatory suggestions. You may dismiss any suggestion or explore matching store items.
              </p>
            </div>

            {gaps.length === 0 ? (
              <div className="bg-white border border-taupe-light/70 p-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto mb-2" />
                <h4 className="font-serif text-xl text-charcoal">Balanced Capsule Achieved</h4>
                <p className="text-xs text-taupe mt-1">Your wardrobe currently contains versatile coverage across tops, bottoms, outerwear, and footwear.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {gaps.map((gap) => (
                  <div key={gap.key} className="bg-white border border-taupe-light/80 p-6 flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[9px] uppercase tracking-widest font-bold bg-burgundy/10 text-burgundy px-2 py-0.5">
                          {gap.importance} Priority
                        </span>
                        <button
                          onClick={() => handleDismissGap(gap.key)}
                          className="text-[10px] text-taupe hover:text-charcoal uppercase tracking-wider"
                        >
                          Dismiss
                        </button>
                      </div>

                      <h4 className="font-serif text-lg font-medium text-charcoal mb-1">
                        {gap.title}
                      </h4>
                      <p className="text-xs text-charcoal font-semibold mb-2">
                        {gap.reason}
                      </p>
                      <p className="text-xs text-taupe leading-relaxed font-sans mb-4">
                        {gap.explanation}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-taupe-light/50 flex items-center justify-between">
                      <span className="text-[10px] text-taupe uppercase tracking-wider">
                        Suggested Category: {gap.category}
                      </span>
                      <Link
                        to={`/shop?category=${gap.recommendedSearch || gap.category}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-burgundy hover:text-charcoal transition-colors"
                      >
                        <span>{gap.actionLabel || 'Shop Matching Pieces'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SAVED OUTFITS */}
        {activeTab === 'outfits' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white border border-taupe-light/80 p-4">
              <div>
                <h3 className="font-serif text-base font-semibold text-charcoal">Your Saved Outfits</h3>
                <p className="text-xs text-taupe">Named outfit combinations saved from your wardrobe and Outfit Planner.</p>
              </div>
              <Link
                to="/outfit-planner"
                className="bg-charcoal hover:bg-burgundy text-white text-xs uppercase tracking-widest font-semibold px-4 py-2 transition-colors"
              >
                Plan New Outfit
              </Link>
            </div>

            {savedOutfits.length === 0 ? (
              <div className="bg-white border border-taupe-light/70 p-12 text-center">
                <Layers className="w-10 h-10 text-taupe-light mx-auto mb-2" />
                <h4 className="font-serif text-lg text-charcoal">No Saved Outfits Yet</h4>
                <p className="text-xs text-taupe mt-1 mb-4">Use the Occasion-to-Outfit Planner to curate and save your favorite looks.</p>
                <Link
                  to="/outfit-planner"
                  className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold text-burgundy hover:underline"
                >
                  <span>Go to Outfit Planner</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedOutfits.map((outfit) => (
                  <div key={outfit.id} className="bg-white border border-taupe-light/80 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-taupe-light/50">
                      <div>
                        <h4 className="font-serif text-base font-semibold text-charcoal">{outfit.name}</h4>
                        <span className="text-[10px] text-taupe uppercase tracking-wider capitalize">
                          Occasion: {outfit.occasion}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteSavedOutfit(outfit.id)}
                        className="text-taupe hover:text-red-600 p-1"
                        title="Delete outfit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {outfit.notes && (
                      <p className="text-xs text-taupe italic mb-3 font-sans">"{outfit.notes}"</p>
                    )}

                    {/* Items Grid Collage */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {outfit.items?.map((it, idx) => (
                        <div key={idx} className="bg-ivory/60 p-1.5 border border-taupe-light/50 text-center">
                          <div className="aspect-[3/4] bg-taupe-light/20 overflow-hidden mb-1">
                            {it.item?.image_url || it.item?.wardrobe_image ? (
                              <img
                                src={it.item.image_url || it.item.wardrobe_image}
                                alt={it.item.name || 'Outfit piece'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-taupe text-[10px]">
                                {it.slot_name}
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] uppercase tracking-wider block text-charcoal font-semibold truncate">
                            {it.item?.name || it.item?.wardrobe_name || it.slot_name}
                          </span>
                          <span className="text-[8px] text-taupe uppercase">
                            {it.isOwned ? 'Owned' : 'Store'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL 1: ADD / EDIT WARDROBE ITEM --- */}
      {addItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 border border-taupe-light shadow-editorial relative my-8 animate-in fade-in duration-200">
            <button
              onClick={() => setAddItemModalOpen(false)}
              className="absolute top-4 right-4 text-taupe hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl text-charcoal mb-1">
              {editingItem ? 'Edit Wardrobe Piece' : 'Add New Clothing Piece'}
            </h3>
            <p className="text-xs text-taupe mb-6 font-sans">
              Provide garment metadata to calculate cost per wear and power outfit compatibility.
            </p>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs font-sans">
              {/* Garment Name */}
              <div>
                <label className="block uppercase tracking-wider text-taupe text-[10px] font-bold mb-1">
                  Garment Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Crisp White Poplin Shirt"
                  className="w-full bg-ivory px-3 py-2 border border-taupe-light focus:outline-none focus:border-burgundy text-charcoal"
                />
              </div>

              {/* Category & Color */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-taupe text-[10px] font-bold mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-ivory px-3 py-2 border border-taupe-light focus:outline-none focus:border-burgundy text-charcoal uppercase tracking-wider"
                  >
                    <option value="tops">Tops</option>
                    <option value="bottoms">Bottoms</option>
                    <option value="outerwear">Outerwear</option>
                    <option value="dresses">Dresses</option>
                    <option value="shoes">Shoes</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-taupe text-[10px] font-bold mb-1">
                    Color *
                  </label>
                  <input
                    type="text"
                    required
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    placeholder="e.g. Ivory, Charcoal, Navy"
                    className="w-full bg-ivory px-3 py-2 border border-taupe-light focus:outline-none focus:border-burgundy text-charcoal"
                  />
                </div>
              </div>

              {/* Style & Occasion */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-taupe text-[10px] font-bold mb-1">
                    Style Aesthetic *
                  </label>
                  <select
                    value={formStyle}
                    onChange={(e) => setFormStyle(e.target.value)}
                    className="w-full bg-ivory px-3 py-2 border border-taupe-light focus:outline-none focus:border-burgundy text-charcoal uppercase tracking-wider"
                  >
                    {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-taupe text-[10px] font-bold mb-1">
                    Primary Occasion *
                  </label>
                  <select
                    value={formOccasion}
                    onChange={(e) => setFormOccasion(e.target.value)}
                    className="w-full bg-ivory px-3 py-2 border border-taupe-light focus:outline-none focus:border-burgundy text-charcoal uppercase tracking-wider"
                  >
                    {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              {/* Size, Brand, Price & Recorded Wears */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-taupe text-[10px] font-bold mb-1">
                    Size
                  </label>
                  <input
                    type="text"
                    value={formSize}
                    onChange={(e) => setFormSize(e.target.value)}
                    placeholder="e.g. M, 30"
                    className="w-full bg-ivory px-3 py-2 border border-taupe-light focus:outline-none focus:border-burgundy text-charcoal"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-taupe text-[10px] font-bold mb-1">
                    Brand (Optional)
                  </label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="e.g. COS, Everlane"
                    className="w-full bg-ivory px-3 py-2 border border-taupe-light focus:outline-none focus:border-burgundy text-charcoal"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-taupe text-[10px] font-bold mb-1">
                    Purchase Price (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="e.g. 5200"
                    className="w-full bg-ivory px-3 py-2 border border-taupe-light focus:outline-none focus:border-burgundy text-charcoal"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-taupe text-[10px] font-bold mb-1">
                    Recorded Wears
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formWearsCount}
                    onChange={(e) => setFormWearsCount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-ivory px-3 py-2 border border-taupe-light focus:outline-none focus:border-burgundy text-charcoal font-semibold"
                  />
                </div>
              </div>

              {/* Image Input: Switch between URL or File Upload */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block uppercase tracking-wider text-taupe text-[10px] font-bold">
                    Garment Image
                  </label>
                  <div className="flex items-center gap-3 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={`uppercase tracking-wider font-semibold ${uploadMode === 'url' ? 'text-burgundy underline' : 'text-taupe'}`}
                    >
                      Image URL
                    </button>
                    <span className="text-taupe">|</span>
                    <button
                      type="button"
                      onClick={() => setUploadMode('file')}
                      className={`uppercase tracking-wider font-semibold ${uploadMode === 'file' ? 'text-burgundy underline' : 'text-taupe'}`}
                    >
                      Upload File
                    </button>
                  </div>
                </div>

                {uploadMode === 'url' ? (
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-ivory px-3 py-2 border border-taupe-light focus:outline-none focus:border-burgundy text-charcoal text-xs"
                  />
                ) : (
                  <div className="border-2 border-dashed border-taupe-light/80 p-4 text-center bg-ivory/40">
                    <input
                      type="file"
                      id="wardrobe-file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={(e) => setUploadFile(e.target.files[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor="wardrobe-file" className="cursor-pointer block text-xs text-charcoal">
                      <Upload className="w-5 h-5 text-taupe mx-auto mb-1" />
                      <span className="font-semibold text-burgundy">Click to browse image</span>
                      <span className="text-taupe text-[10px] block mt-0.5">JPEG, PNG, WEBP up to 5MB</span>
                    </label>
                    {uploadFile && (
                      <p className="mt-2 text-[10px] text-emerald-800 font-bold truncate">
                        Selected: {uploadFile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-taupe-light/50">
                <button
                  type="button"
                  onClick={() => setAddItemModalOpen(false)}
                  className="px-4 py-2 border border-taupe-light text-charcoal text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-charcoal hover:bg-burgundy text-white text-xs uppercase tracking-wider font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Add to Closet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: LOG WEAR EVENT --- */}
      {wearModalItem && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 border border-taupe-light shadow-editorial relative">
            <button
              onClick={() => setWearModalItem(null)}
              className="absolute top-4 right-4 text-taupe hover:text-charcoal"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-xl text-charcoal mb-1">Record Wear Event</h3>
            <p className="text-xs text-taupe mb-4">
              Recording wears improves your cost-per-wear accuracy.
            </p>

            <div className="flex items-center gap-3 p-2.5 bg-ivory border border-taupe-light mb-4">
              <div className="w-10 h-12 bg-taupe-light/30 flex-shrink-0 overflow-hidden">
                <img src={wearModalItem.image_url} alt={wearModalItem.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-charcoal truncate">{wearModalItem.name}</p>
                <p className="text-[10px] text-taupe">Currently worn: {wearModalItem.wears_count || 0} times</p>
              </div>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-[10px] font-bold text-taupe uppercase tracking-wider mb-1">
                  Occasion Worn
                </label>
                <select
                  value={wearOccasion}
                  onChange={(e) => setWearOccasion(e.target.value)}
                  className="w-full bg-ivory px-3 py-2 border border-taupe-light text-xs text-charcoal uppercase tracking-wider"
                >
                  {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-taupe uppercase tracking-wider mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={wearNotes}
                  onChange={(e) => setWearNotes(e.target.value)}
                  placeholder="e.g. Campus presentation"
                  className="w-full bg-ivory px-3 py-2 border border-taupe-light text-xs text-charcoal"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  onClick={() => setWearModalItem(null)}
                  className="px-3 py-1.5 border border-taupe-light text-charcoal text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={submitWearLog}
                  className="px-4 py-1.5 bg-burgundy hover:bg-charcoal text-white text-xs uppercase tracking-wider font-semibold transition-colors"
                >
                  Confirm Wear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: VIEW ITEM DETAIL DRAWER --- */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full p-6 sm:p-8 border border-taupe-light shadow-editorial relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingItem(null)}
              className="absolute top-4 right-4 text-taupe hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Garment Image */}
              <div className="aspect-[3/4] bg-taupe-light/20 overflow-hidden relative">
                <img
                  src={viewingItem.image_url}
                  alt={viewingItem.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Garment Meta & CPW Breakdown */}
              <div className="flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-bold bg-charcoal text-white px-2 py-0.5">
                    {viewingItem.category}
                  </span>
                  <h3 className="font-serif text-2xl text-charcoal font-medium mt-2">
                    {viewingItem.name}
                  </h3>
                  <p className="text-xs text-taupe capitalize mt-1">
                    {viewingItem.brand ? `${viewingItem.brand} • ` : ''}{viewingItem.color} • {viewingItem.style}
                  </p>

                  {/* Cost-Per-Wear Card */}
                  <div className="mt-4 p-3 bg-ivory border border-taupe-light text-xs font-sans space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-taupe uppercase text-[10px]">Purchase Price:</span>
                      <span className="font-semibold text-charcoal">
                        {viewingItem.purchase_price ? formatINR(viewingItem.purchase_price) : 'Not recorded'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-taupe uppercase text-[10px]">Total Wears:</span>
                      <span className="font-semibold text-charcoal">{viewingItem.wears_count || 0}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-taupe-light/60">
                      <span className="text-burgundy uppercase font-bold text-[10px]">Cost Per Wear:</span>
                      <span className="font-bold text-burgundy text-sm">
                        {viewingItem.cpw?.status === 'calculated'
                          ? formatINR(viewingItem.cpw.costPerWear)
                          : viewingItem.cpw?.status === 'never_worn'
                          ? 'Not worn yet'
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-taupe-light/50 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      setViewingItem(null);
                      openWearModal(viewingItem, e);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-burgundy hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Wear Event</span>
                  </button>

                  <button
                    onClick={(e) => {
                      setViewingItem(null);
                      openEditModal(viewingItem, e);
                    }}
                    className="text-xs uppercase tracking-wider text-taupe hover:text-charcoal underline"
                  >
                    Edit Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
