import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShoppingBag,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  FolderHeart,
  Layers,
  ArrowRight,
  ShieldCheck,
  Tag,
  Search,
  ExternalLink,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { formatINR } from '../utils/formatCurrency';

const SLOTS = [
  { id: 'top', label: 'Top', category: 'tops', defaultPrompt: 'Select a blouse, shirt, or knit' },
  { id: 'bottom', label: 'Bottom', category: 'bottoms', defaultPrompt: 'Select trousers, denim, or skirt' },
  { id: 'dress', label: 'Dress', category: 'dresses', defaultPrompt: 'Select a full-length silhouette' },
  { id: 'shoes', label: 'Footwear', category: 'shoes', defaultPrompt: 'Select boots, heels, or loafers' },
  { id: 'outerwear', label: 'Outerwear', category: 'outerwear', defaultPrompt: 'Select a blazer or coat' },
  { id: 'accessories', label: 'Accessory', category: 'accessories', defaultPrompt: 'Select a bag, scarf, or jewelry' }
];

export default function MixMatchStudio() {
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Selected Outfit Slots: { top: item, bottom: item, dress: item, shoes: item, outerwear: item, accessories: item }
  const [selectedItems, setSelectedItems] = useState({});
  const [activeSlot, setActiveSlot] = useState('top');
  const [itemSource, setItemSource] = useState('all'); // 'all' | 'store' | 'wardrobe'

  // Catalog and Wardrobe Data
  const [storeProducts, setStoreProducts] = useState([]);
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Compatibility State
  const [compatibility, setCompatibility] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [targetOccasion, setTargetOccasion] = useState('casual');
  const [targetStyle, setTargetStyle] = useState('minimalist');

  // Save / Manage Outfits State
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [savedOutfitsDrawer, setSavedOutfitsDrawer] = useState(false);
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [currentEditingOutfitId, setCurrentEditingOutfitId] = useState(null);
  const [outfitForm, setOutfitForm] = useState({ name: '', occasion: 'casual', notes: '' });
  const [savingOutfit, setSavingOutfit] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Load Catalog and Wardrobe Items
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true);
        const prodRes = await api.getProducts({ limit: 60 });
        if (prodRes?.data?.products) {
          setStoreProducts(prodRes.data.products);
        }

        if (isAuthenticated) {
          const wRes = await api.getWardrobeItems();
          if (wRes?.data) {
            setWardrobeItems(wRes.data.map(w => ({ ...w, isOwned: true, item_type: 'wardrobe' })));
          }
          const savedRes = await api.getSavedOutfits();
          if (savedRes?.data) {
            setSavedOutfits(savedRes.data);
          }
        }
      } catch (err) {
        console.error('Failed to load Mix & Match data:', err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, [isAuthenticated]);

  // Evaluate Compatibility whenever selected items change
  useEffect(() => {
    const currentItemsArray = Object.entries(selectedItems)
      .filter(([_, item]) => item !== null && item !== undefined)
      .map(([slot, item]) => ({ ...item, slot }));

    if (currentItemsArray.length === 0) {
      setCompatibility(null);
      return;
    }

    async function runEval() {
      try {
        setEvaluating(true);
        const res = await api.evaluateOutfit({
          items: currentItemsArray,
          targetOccasion,
          targetStyle
        });
        if (res.success && res.data) {
          setCompatibility(res.data);
        }
      } catch (err) {
        console.error('Compatibility calculation error:', err);
      } finally {
        setEvaluating(false);
      }
    }

    const timer = setTimeout(runEval, 200);
    return () => clearTimeout(timer);
  }, [selectedItems, targetOccasion, targetStyle]);

  // Available Candidates for the Active Slot
  const slotCandidates = useMemo(() => {
    const slotDef = SLOTS.find(s => s.id === activeSlot);
    if (!slotDef) return [];

    let pool = [];

    // Store products
    if (itemSource === 'all' || itemSource === 'store') {
      const filteredStore = storeProducts.filter(p => {
        const catSlug = (p.category_slug || p.categorySlug || p.category?.slug || '').toLowerCase();
        return catSlug.includes(slotDef.category);
      }).map(p => ({
        ...p,
        isOwned: false,
        item_type: 'store_product',
        displayCategory: slotDef.label
      }));
      pool.push(...filteredStore);
    }

    // Wardrobe items
    if (isAuthenticated && (itemSource === 'all' || itemSource === 'wardrobe')) {
      const filteredWardrobe = wardrobeItems.filter(w => {
        const cat = (w.category || '').toLowerCase();
        return cat === slotDef.category || (slotDef.category === 'shoes' && cat === 'footwear');
      }).map(w => ({
        ...w,
        isOwned: true,
        item_type: 'wardrobe',
        displayCategory: slotDef.label
      }));
      pool.push(...filteredWardrobe);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pool = pool.filter(item =>
        (item.name || '').toLowerCase().includes(q) ||
        (item.color || '').toLowerCase().includes(q) ||
        (item.style || '').toLowerCase().includes(q)
      );
    }

    return pool;
  }, [activeSlot, itemSource, storeProducts, wardrobeItems, searchQuery, isAuthenticated]);

  // Handle Slot Selection
  const handleSelectItem = (item) => {
    setSelectedItems(prev => {
      const updated = { ...prev, [activeSlot]: item };

      // Mutual exclusivity check: if dress is selected, clear top and bottom
      if (activeSlot === 'dress' && item) {
        delete updated.top;
        delete updated.bottom;
      } else if ((activeSlot === 'top' || activeSlot === 'bottom') && item) {
        delete updated.dress;
      }

      return updated;
    });
    showToast(`Added ${item.name} to ${SLOTS.find(s => s.id === activeSlot)?.label}.`);
  };

  const handleRemoveSlot = (slotId) => {
    setSelectedItems(prev => {
      const updated = { ...prev };
      delete updated[slotId];
      return updated;
    });
  };

  const handleResetOutfit = () => {
    setSelectedItems({});
    setCurrentEditingOutfitId(null);
    setCompatibility(null);
    showToast('Reset outfit composition board.');
  };

  // Price Calculation: Only Store Products
  const priceStats = useMemo(() => {
    let purchasableTotal = 0;
    let ownedSavedTotal = 0;
    let storeItemCount = 0;
    let ownedItemCount = 0;

    Object.values(selectedItems).forEach(item => {
      if (!item) return;
      if (item.isOwned) {
        ownedItemCount++;
        ownedSavedTotal += parseFloat(item.purchase_price || item.price || 0);
      } else {
        storeItemCount++;
        purchasableTotal += parseFloat(item.price || 0);
      }
    });

    return {
      purchasableTotal,
      ownedSavedTotal,
      storeItemCount,
      ownedItemCount,
      totalItems: storeItemCount + ownedItemCount
    };
  }, [selectedItems]);

  // Add Complete Outfit to Shopping Bag
  const handleAddOutfitToBag = async () => {
    const purchasableItems = Object.entries(selectedItems)
      .filter(([_, item]) => item && !item.isOwned)
      .map(([slot, item]) => ({ slot, ...item }));

    if (purchasableItems.length === 0) {
      showToast('All items in this look are already in your wardrobe! Nothing to purchase.', 'info');
      return;
    }

    try {
      setAddingToCart(true);
      let addedCount = 0;

      for (const item of purchasableItems) {
        const variants = item.variants || [];
        const inStockVariant = variants.find(v => v.stock_quantity > 0) || variants[0];

        if (!inStockVariant || inStockVariant.stock_quantity <= 0) {
          showToast(`"${item.name}" is currently sold out and was skipped.`, 'warning');
          continue;
        }

        await addToCart(inStockVariant.id, 1, {
          id: item.id,
          name: item.name,
          slug: item.slug,
          price: item.price,
          image_url: item.image_url,
          size: inStockVariant.size,
          color: inStockVariant.color,
          stock: inStockVariant.stock_quantity
        });
        addedCount++;
      }

      if (addedCount > 0) {
        showToast(`Added ${addedCount} purchasable outfit pieces to your Shopping Bag!`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to add items to bag', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  // Save Outfit
  const handleSaveOutfitSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to save your personal outfit archive.', 'info');
      navigate('/login?redirect=/mix-match');
      return;
    }

    const itemsPayload = Object.entries(selectedItems).map(([slot_name, item]) => ({
      slot_name,
      item_type: item.isOwned ? 'wardrobe' : 'store_product',
      wardrobe_item_id: item.isOwned ? item.id : null,
      product_id: !item.isOwned ? item.id : null,
      variant_id: item.variants?.[0]?.id || null,
      isOwned: item.isOwned
    }));

    if (itemsPayload.length === 0) {
      showToast('Please select at least one garment before saving.', 'error');
      return;
    }

    try {
      setSavingOutfit(true);
      if (currentEditingOutfitId) {
        // Update existing outfit
        await api.updateSavedOutfit(currentEditingOutfitId, {
          name: outfitForm.name,
          occasion: outfitForm.occasion,
          notes: outfitForm.notes,
          items: itemsPayload
        });
        showToast(`Updated saved outfit: "${outfitForm.name}".`);
      } else {
        // Create new outfit
        await api.saveOutfit({
          name: outfitForm.name,
          occasion: outfitForm.occasion,
          notes: outfitForm.notes,
          items: itemsPayload
        });
        showToast(`Saved look "${outfitForm.name}" to your archive!`);
      }

      // Refresh saved outfits
      const res = await api.getSavedOutfits();
      if (res.data) setSavedOutfits(res.data);
      setSaveModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to save outfit', 'error');
    } finally {
      setSavingOutfit(false);
    }
  };

  // Reopen Saved Outfit
  const handleLoadSavedOutfit = (outfit) => {
    const loadedSlots = {};
    if (Array.isArray(outfit.items)) {
      outfit.items.forEach(oi => {
        const slotKey = (oi.slot_name || '').toLowerCase();
        if (oi.item) {
          loadedSlots[slotKey] = {
            ...oi.item,
            isOwned: oi.isOwned || oi.item_type === 'wardrobe',
            item_type: oi.item_type
          };
        }
      });
    }

    setSelectedItems(loadedSlots);
    setCurrentEditingOutfitId(outfit.id);
    setOutfitForm({
      name: outfit.name,
      occasion: outfit.occasion || 'casual',
      notes: outfit.notes || ''
    });
    setSavedOutfitsDrawer(false);
    showToast(`Loaded "${outfit.name}" onto your Mix & Match canvas.`);
  };

  // Delete Saved Outfit
  const handleDeleteSavedOutfit = async (id, name) => {
    try {
      await api.deleteSavedOutfit(id);
      setSavedOutfits(prev => prev.filter(o => o.id !== id));
      if (currentEditingOutfitId === id) {
        setCurrentEditingOutfitId(null);
      }
      showToast(`Deleted "${name}" from saved outfits.`);
    } catch (err) {
      showToast(err.message || 'Failed to delete outfit', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Top Editorial Breadcrumbs & Header */}
      <div className="pb-6 border-b border-taupe-light flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-sans text-taupe uppercase tracking-widest mb-1">
            <Link to="/" className="hover:text-charcoal transition-colors">Home</Link>
            <span>/</span>
            <span className="text-burgundy font-semibold">Mix & Match Studio</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-light">
            Mix & Match Atelier
          </h1>
          <p className="text-xs sm:text-sm text-taupe-muted mt-1 max-w-2xl font-light">
            Compose bespoke looks combining new boutique collections with pieces you already own. Audit aesthetic cohesion and purchasable totals in real time.
          </p>
        </div>

        {/* Global Studio Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={FolderHeart}
            onClick={() => setSavedOutfitsDrawer(true)}
          >
            Saved Looks ({savedOutfits.length})
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={handleResetOutfit}
            disabled={priceStats.totalItems === 0}
          >
            Reset
          </Button>

          <Button
            variant="burgundy"
            size="sm"
            icon={Save}
            onClick={() => {
              if (priceStats.totalItems === 0) {
                showToast('Please select at least one garment to save.', 'info');
                return;
              }
              if (!currentEditingOutfitId && !outfitForm.name) {
                setOutfitForm(prev => ({ ...prev, name: `Ensemble #${savedOutfits.length + 1}` }));
              }
              setSaveModalOpen(true);
            }}
          >
            {currentEditingOutfitId ? 'Update Look' : 'Save Ensemble'}
          </Button>
        </div>
      </div>

      {/* Main Studio Workspace: 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Central Flat-Lay Preview Board & Compatibility Audit */}
        <div className="lg:col-span-7 space-y-6">
          {/* Flat-Lay Outfit Canvas */}
          <div className="bg-white border border-taupe-light p-6 shadow-subtle relative">
            <div className="flex items-center justify-between pb-4 border-b border-taupe-light/70 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-burgundy" />
                <span className="font-serif text-lg font-medium text-charcoal">
                  Outfit Composition Canvas
                </span>
                {currentEditingOutfitId && (
                  <Badge variant="burgundy" size="sm">
                    Editing: {outfitForm.name}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-taupe font-mono">
                {priceStats.totalItems} / 5 Silhouette Slots
              </span>
            </div>

            {/* Canvas Layout: Layered Flat-Lay Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 min-h-[380px]">
              {SLOTS.map(slot => {
                const item = selectedItems[slot.id];
                const isActive = activeSlot === slot.id;
                const isDressDisabled = slot.id === 'dress' && (selectedItems.top || selectedItems.bottom);
                const isTopBottomDisabled = (slot.id === 'top' || slot.id === 'bottom') && selectedItems.dress;

                return (
                  <div
                    key={slot.id}
                    onClick={() => {
                      if (!isDressDisabled && !isTopBottomDisabled) {
                        setActiveSlot(slot.id);
                      }
                    }}
                    className={`group relative border transition-all p-3 flex flex-col justify-between cursor-pointer ${
                      isActive
                        ? 'border-burgundy ring-2 ring-burgundy/20 bg-burgundy-50/20'
                        : item
                          ? 'border-taupe-light hover:border-charcoal bg-white'
                          : 'border-dashed border-taupe-light/80 hover:border-taupe bg-ivory/50'
                    } ${isDressDisabled || isTopBottomDisabled ? 'opacity-40 pointer-events-none' : ''}`}
                  >
                    {/* Slot Header Label */}
                    <div className="flex items-center justify-between text-[11px] font-sans font-semibold mb-2">
                      <span className={`uppercase tracking-wider ${isActive ? 'text-burgundy' : 'text-taupe'}`}>
                        {slot.label}
                      </span>
                      {item?.isOwned && (
                        <span className="text-[9px] bg-taupe/20 text-charcoal px-1.5 py-0.5 rounded font-mono">
                          OWNED
                        </span>
                      )}
                    </div>

                    {/* Slot Content: Image or Empty Placeholder */}
                    {item ? (
                      <div className="space-y-2 flex-1 flex flex-col justify-between">
                        <div className="relative aspect-[3/4] bg-ivory overflow-hidden border border-taupe-light/60">
                          <img
                            src={item.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80'}
                            alt={item.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80';
                            }}
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveSlot(slot.id);
                            }}
                            className="absolute top-2 right-2 p-1 bg-white/90 text-charcoal hover:text-red-700 hover:bg-white rounded-full shadow-sm"
                            title="Remove from look"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <p className="font-serif text-xs font-medium text-charcoal line-clamp-1">{item.name}</p>
                          <div className="flex items-center justify-between text-[11px] mt-1 font-sans">
                            {item.isOwned ? (
                              <span className="text-emerald-700 font-semibold">Your Closet (₹0)</span>
                            ) : (
                              <span className="font-semibold text-charcoal">{formatINR(item.price)}</span>
                            )}
                            <span className="text-taupe capitalize">{item.color}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-6 px-2">
                        <div className="w-10 h-10 rounded-full bg-ivory border border-taupe-light flex items-center justify-center text-taupe mb-2 group-hover:border-charcoal group-hover:text-charcoal transition-colors">
                          <Plus className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] text-taupe-dark font-sans leading-tight">
                          {isDressDisabled
                            ? 'Top/Bottom chosen'
                            : isTopBottomDisabled
                              ? 'Dress silhouette active'
                              : slot.defaultPrompt}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mutual Exclusivity Advisory */}
            {(selectedItems.top || selectedItems.bottom) && !selectedItems.dress && (
              <p className="text-[11px] text-taupe-muted font-sans mt-3 text-center">
                <Info className="w-3.5 h-3.5 inline mr-1 text-burgundy" />
                Two-piece foundation active (Top & Bottom). Dress slot is automatically reserved.
              </p>
            )}
            {selectedItems.dress && (
              <p className="text-[11px] text-taupe-muted font-sans mt-3 text-center">
                <Info className="w-3.5 h-3.5 inline mr-1 text-burgundy" />
                One-piece silhouette active (Dress). Top & Bottom slots are automatically bypassed.
              </p>
            )}
          </div>

          {/* Compatibility Engine & Cohesion Score Audit */}
          {compatibility && (
            <div className="bg-white border border-taupe-light p-6 shadow-subtle space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-taupe-light/70 gap-3">
                <div>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-burgundy block">
                    Deterministic Cohesion Engine
                  </span>
                  <h3 className="font-serif text-xl font-medium text-charcoal">
                    Outfit Harmony: {compatibility.level}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-serif text-3xl font-light text-charcoal">
                      {compatibility.score}%
                    </span>
                    <span className="text-[10px] font-sans uppercase tracking-wider text-taupe block">
                      Compatibility
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans">
                <div className="p-3 bg-ivory border border-taupe-light/60">
                  <span className="text-[10px] uppercase tracking-wider text-taupe block mb-1">Occasion (30 pts)</span>
                  <p className="font-serif font-bold text-sm text-charcoal">{compatibility.breakdown.occasionScore} / 30</p>
                </div>
                <div className="p-3 bg-ivory border border-taupe-light/60">
                  <span className="text-[10px] uppercase tracking-wider text-taupe block mb-1">Aesthetic (25 pts)</span>
                  <p className="font-serif font-bold text-sm text-charcoal">{compatibility.breakdown.styleScore} / 25</p>
                </div>
                <div className="p-3 bg-ivory border border-taupe-light/60">
                  <span className="text-[10px] uppercase tracking-wider text-taupe block mb-1">Palette (25 pts)</span>
                  <p className="font-serif font-bold text-sm text-charcoal">{compatibility.breakdown.colorScore} / 25</p>
                </div>
                <div className="p-3 bg-ivory border border-taupe-light/60">
                  <span className="text-[10px] uppercase tracking-wider text-taupe block mb-1">Silhouette (20 pts)</span>
                  <p className="font-serif font-bold text-sm text-charcoal">{compatibility.breakdown.silhouetteScore} / 20</p>
                </div>
              </div>

              {/* Explanations List */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-sans uppercase tracking-widest font-semibold text-taupe block">
                  Editorial Audit Rationales:
                </span>
                <ul className="space-y-1 text-xs text-taupe-dark list-disc list-inside">
                  {compatibility.explanations?.map((exp, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {exp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Pricing & Cart Action Bar */}
          <div className="bg-white border border-taupe-light p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-sans uppercase tracking-widest text-taupe block">
                Total Purchasable Cost ({priceStats.storeItemCount} new pieces)
              </span>
              <div className="flex items-baseline gap-3 mt-0.5">
                <span className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
                  {formatINR(priceStats.purchasableTotal)}
                </span>
                {priceStats.ownedSavedTotal > 0 && (
                  <span className="text-xs font-sans text-emerald-700 font-semibold">
                    Saved {formatINR(priceStats.ownedSavedTotal)} from wardrobe
                  </span>
                )}
              </div>
            </div>

            <Button
              variant="burgundy"
              size="lg"
              icon={ShoppingBag}
              loading={addingToCart}
              onClick={handleAddOutfitToBag}
              disabled={priceStats.storeItemCount === 0}
            >
              Add Look to Bag ({formatINR(priceStats.purchasableTotal)})
            </Button>
          </div>
        </div>

        {/* Right Column (5 cols): Product Selection Palette (Store + Wardrobe) */}
        <div className="lg:col-span-5 bg-white border border-taupe-light p-6 shadow-subtle space-y-6">
          {/* Slot Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-burgundy">
                Active Category Slot
              </span>
              <span className="text-xs text-taupe font-mono">
                {slotCandidates.length} options
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {SLOTS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSlot(s.id)}
                  className={`py-2 px-2 text-xs font-sans font-semibold uppercase tracking-wider border transition-colors ${
                    activeSlot === s.id
                      ? 'border-charcoal bg-charcoal text-white'
                      : 'border-taupe-light/70 bg-ivory text-charcoal hover:border-taupe'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Source Filter: Store vs Wardrobe */}
          <div className="pt-2 border-t border-taupe-light/60 flex items-center justify-between gap-2">
            <div className="flex gap-1">
              <button
                onClick={() => setItemSource('all')}
                className={`px-3 py-1 text-[11px] font-sans font-semibold border ${
                  itemSource === 'all'
                    ? 'border-burgundy bg-burgundy text-white'
                    : 'border-taupe-light bg-ivory text-charcoal hover:border-taupe'
                }`}
              >
                All Sources
              </button>
              <button
                onClick={() => setItemSource('store')}
                className={`px-3 py-1 text-[11px] font-sans font-semibold border ${
                  itemSource === 'store'
                    ? 'border-burgundy bg-burgundy text-white'
                    : 'border-taupe-light bg-ivory text-charcoal hover:border-taupe'
                }`}
              >
                Boutique Catalog
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => setItemSource('wardrobe')}
                  className={`px-3 py-1 text-[11px] font-sans font-semibold border ${
                    itemSource === 'wardrobe'
                      ? 'border-burgundy bg-burgundy text-white'
                      : 'border-taupe-light bg-ivory text-charcoal hover:border-taupe'
                  }`}
                >
                  My Wardrobe ({wardrobeItems.length})
                </button>
              )}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-taupe absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search in ${SLOTS.find(s => s.id === activeSlot)?.label}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-ivory border border-taupe-light text-xs font-sans text-charcoal placeholder:text-taupe focus:border-charcoal focus:outline-none"
            />
          </div>

          {/* Candidate Grid */}
          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {loadingData ? (
              <div className="text-center py-12 text-xs text-taupe">
                Loading atelier pieces...
              </div>
            ) : slotCandidates.length === 0 ? (
              <div className="text-center py-12 text-xs text-taupe space-y-2">
                <p>No compatible items found for this slot.</p>
                {itemSource === 'wardrobe' && (
                  <Link to="/wardrobe" className="text-burgundy font-semibold hover:underline block text-[11px]">
                    + Add items to your Digital Wardrobe
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {slotCandidates.map(candidate => {
                  const isSelected = selectedItems[activeSlot]?.id === candidate.id &&
                    selectedItems[activeSlot]?.isOwned === candidate.isOwned;

                  return (
                    <div
                      key={`${candidate.isOwned ? 'w' : 's'}-${candidate.id}`}
                      onClick={() => handleSelectItem(candidate)}
                      className={`group border p-2 flex flex-col justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-burgundy bg-burgundy-50/30 ring-1 ring-burgundy'
                          : 'border-taupe-light hover:border-charcoal bg-white'
                      }`}
                    >
                      <div className="aspect-[3/4] overflow-hidden bg-ivory relative mb-2">
                        <img
                          src={candidate.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80'}
                          alt={candidate.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80';
                          }}
                          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                        />
                        {candidate.isOwned && (
                          <span className="absolute top-1.5 left-1.5 bg-charcoal text-white text-[9px] font-mono px-1.5 py-0.5 uppercase tracking-wider">
                            OWNED
                          </span>
                        )}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-burgundy text-white p-1 rounded-full shadow-sm">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-serif text-xs font-medium text-charcoal line-clamp-1 group-hover:text-burgundy transition-colors">
                          {candidate.name}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] font-sans">
                          {candidate.isOwned ? (
                            <span className="text-emerald-700 font-semibold">Your Closet</span>
                          ) : (
                            <span className="font-semibold text-charcoal">{formatINR(candidate.price)}</span>
                          )}
                          <span className="text-[10px] text-taupe capitalize">{candidate.color}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`mt-2 w-full py-1 text-[10px] font-sans font-semibold uppercase tracking-wider border transition-colors ${
                          isSelected
                            ? 'border-burgundy bg-burgundy text-white'
                            : 'border-taupe-light text-charcoal hover:border-charcoal'
                        }`}
                      >
                        {isSelected ? 'Active Slot' : 'Select Piece'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Outfit Modal */}
      <Modal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title={currentEditingOutfitId ? 'Update Saved Ensemble' : 'Save Ensemble to Archive'}
        subtitle="Mix & Match Wardrobe Intelligence"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveOutfitSubmit} className="space-y-4">
          <Input
            label="Ensemble Title"
            required
            value={outfitForm.name}
            onChange={(e) => setOutfitForm({ ...outfitForm, name: e.target.value })}
            placeholder="e.g. Editorial Autumn Gallery Walk"
          />

          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-taupe block mb-1">
              Primary Occasion
            </label>
            <select
              value={outfitForm.occasion}
              onChange={(e) => setOutfitForm({ ...outfitForm, occasion: e.target.value })}
              className="w-full px-3 py-2 bg-ivory border border-taupe-light text-xs font-sans text-charcoal focus:border-charcoal focus:outline-none"
            >
              <option value="casual">Casual Daywear</option>
              <option value="college">College / Campus</option>
              <option value="office">Office & Workwear</option>
              <option value="party">Evening & Party</option>
              <option value="festive">Festive / Formal</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-taupe block mb-1">
              Styling Notes (Optional)
            </label>
            <textarea
              value={outfitForm.notes}
              onChange={(e) => setOutfitForm({ ...outfitForm, notes: e.target.value })}
              placeholder="Add personal styling advice, layer sequence, or accessory pairings..."
              rows={3}
              className="w-full px-3 py-2 bg-ivory border border-taupe-light text-xs font-sans text-charcoal focus:border-charcoal focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="burgundy" size="sm" type="submit" loading={savingOutfit}>
              {currentEditingOutfitId ? 'Save Changes' : 'Confirm Archive'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Saved Looks Drawer / Modal */}
      <Modal
        isOpen={savedOutfitsDrawer}
        onClose={() => setSavedOutfitsDrawer(false)}
        title="Saved Outfits Archive"
        subtitle={`Authenticated User: ${user?.name || 'Curated Looks'}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {savedOutfits.length === 0 ? (
            <div className="text-center py-12 text-xs text-taupe space-y-2">
              <FolderHeart className="w-8 h-8 mx-auto text-taupe-muted stroke-1" />
              <p>You have not saved any custom ensembles yet.</p>
              <p className="text-[11px] text-taupe-muted">
                Compose outfits on the canvas and click "Save Ensemble" to build your private lookbook.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedOutfits.map(outfit => (
                <div
                  key={outfit.id}
                  className="p-4 border border-taupe-light bg-ivory flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-charcoal transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-base font-semibold text-charcoal">{outfit.name}</h4>
                      <Badge variant="outline" size="sm">{outfit.occasion || 'Casual'}</Badge>
                    </div>
                    <p className="text-xs text-taupe font-sans">
                      {outfit.items?.length || 0} pieces • Created {new Date(outfit.created_at).toLocaleDateString()}
                    </p>
                    {outfit.notes && (
                      <p className="text-[11px] text-taupe-dark italic font-serif">"{outfit.notes}"</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleLoadSavedOutfit(outfit)}
                    >
                      Load into Canvas
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSavedOutfit(outfit.id, outfit.name)}
                      className="p-2 text-taupe hover:text-red-700 transition-colors"
                      title="Delete outfit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
