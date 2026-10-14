import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  ShoppingBag,
  RefreshCw,
  BookmarkPlus,
  ArrowRight,
  Shuffle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  DollarSign
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/formatCurrency';

const OCCASIONS = [
  { id: 'college', name: 'College', desc: 'Campus daily & study sessions' },
  { id: 'office', name: 'Office', desc: 'Business casual & work meetings' },
  { id: 'interview', name: 'Interview', desc: 'Professional formal & confident impression' },
  { id: 'casual', name: 'Casual Outing', desc: 'Relaxed weekends & coffee runs' },
  { id: 'party', name: 'Party', desc: 'Night out & social gatherings' },
  { id: 'festive', name: 'Festive Event', desc: 'Celebrations & textured elegance' },
  { id: 'formal', name: 'Formal Event', desc: 'Evening galas & black-tie' },
  { id: 'travel', name: 'Travel', desc: 'Versatile layers & comfort in transit' },
];

const AESTHETICS = ['minimalist', 'classic', 'chic', 'streetwear', 'relaxed'];

const COLOR_OPTIONS = ['Ivory', 'Charcoal', 'Burgundy', 'Navy', 'Beige', 'Black', 'White', 'Olive'];

export default function OutfitPlanner() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Inputs
  const [selectedOccasion, setSelectedOccasion] = useState('office');
  const [selectedAesthetic, setSelectedAesthetic] = useState('minimalist');
  const [selectedColors, setSelectedColors] = useState(['Ivory', 'Charcoal']);
  const [budget, setBudget] = useState(200);
  const [mode, setMode] = useState('wardrobe_only'); // 'wardrobe_only' | 'wardrobe_and_store'

  // Generated Plan State
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  // Slot Replace Modal State
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [replacingSlot, setReplacingSlot] = useState(null);
  const [slotAlternatives, setSlotAlternatives] = useState({ wardrobeAlternatives: [], storeAlternatives: [] });
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);

  // Save Outfit Modal State
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [outfitNotes, setOutfitNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      handleGenerate();
    }
  }, [isAuthenticated, selectedOccasion, mode]);

  const toggleColor = (c) => {
    if (selectedColors.includes(c)) {
      if (selectedColors.length > 1) {
        setSelectedColors(selectedColors.filter(x => x !== c));
      }
    } else {
      setSelectedColors([...selectedColors, c]);
    }
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to plan outfits using your wardrobe.', 'info');
      return;
    }

    setLoading(true);
    try {
      const res = await api.generateOutfitPlan({
        occasion: selectedOccasion,
        preferred_aesthetic: selectedAesthetic,
        preferred_colors: selectedColors,
        budget: parseFloat(budget) || 200,
        mode
      });

      if (res && res.success) {
        setPlan(res.data);
      }
    } catch (err) {
      console.error('Failed to generate outfit plan:', err);
      showToast('Unable to generate outfit for this combination.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReplace = async (slotName, currentItem) => {
    setReplacingSlot({ slotName, currentItem });
    setReplaceModalOpen(true);
    setLoadingAlternatives(true);

    try {
      const res = await api.getSlotAlternatives({
        slot: slotName,
        currentItemId: currentItem.id,
        occasion: selectedOccasion
      });
      if (res && res.success) {
        setSlotAlternatives(res.data);
      }
    } catch (err) {
      showToast('Could not fetch alternative pieces.', 'error');
    } finally {
      setLoadingAlternatives(false);
    }
  };

  const handleApplyReplacement = (newPiece, isOwned) => {
    if (!plan || !replacingSlot) return;

    const updatedSlots = { ...plan.slots };
    updatedSlots[replacingSlot.slotName] = {
      slot: replacingSlot.slotName,
      isOwned,
      score: 85,
      item: {
        id: newPiece.id,
        product_id: isOwned ? null : newPiece.id,
        name: newPiece.name,
        category: newPiece.category || replacingSlot.slotName,
        color: newPiece.color || (Array.isArray(newPiece.colors) ? newPiece.colors[0] : 'Neutral'),
        style: newPiece.style || 'classic',
        price: Number(newPiece.price || newPiece.purchase_price || 0),
        image_url: newPiece.image_url,
        isStoreProduct: !isOwned
      }
    };

    // Recalculate totals
    const entries = Object.values(updatedSlots);
    const storeCost = entries
      .filter(s => !s.isOwned)
      .reduce((acc, curr) => acc + (Number(curr.item.price) || 0), 0);

    setPlan({
      ...plan,
      slots: updatedSlots,
      totalStoreCost: Number(storeCost.toFixed(2)),
      ownedCount: entries.filter(s => s.isOwned).length,
      purchaseCount: entries.filter(s => !s.isOwned).length,
      explanation: `Updated outfit with custom ${replacingSlot.slotName} selection (${newPiece.name}).`
    });

    setReplaceModalOpen(false);
    showToast(`Swapped ${replacingSlot.slotName} with ${newPiece.name}`, 'success');
  };

  const openSaveModal = () => {
    if (!plan) return;
    const occLabel = OCCASIONS.find(o => o.id === selectedOccasion)?.name || selectedOccasion;
    setOutfitName(`${occLabel} ${selectedAesthetic.charAt(0).toUpperCase() + selectedAesthetic.slice(1)} Ensemble`);
    setOutfitNotes(`Curated for ${occLabel} occasions.`);
    setSaveModalOpen(true);
  };

  const handleSaveOutfit = async (e) => {
    e.preventDefault();
    if (!outfitName.trim()) {
      showToast('Please provide a name for this outfit.', 'error');
      return;
    }

    setSaving(true);
    try {
      const itemsPayload = Object.entries(plan.slots).map(([slotName, slotObj]) => ({
        slot_name: slotName,
        item_type: slotObj.isOwned ? 'wardrobe' : 'store_product',
        wardrobe_item_id: slotObj.isOwned ? slotObj.item.id : null,
        product_id: !slotObj.isOwned ? (slotObj.item.product_id || slotObj.item.id) : null,
        isOwned: slotObj.isOwned
      }));

      const res = await api.saveOutfit({
        name: outfitName.trim(),
        occasion: selectedOccasion,
        notes: outfitNotes.trim(),
        items: itemsPayload
      });

      if (res && res.success) {
        showToast('Outfit saved to your collection!', 'success');
        setSaveModalOpen(false);
      }
    } catch (err) {
      showToast(err.message || 'Could not save outfit.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="bg-ivory min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="bg-white border border-taupe-light/80 p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-burgundy bg-burgundy/10 px-2 py-0.5">
                  Deterministic Rule-Based Styling
                </span>
                <span className="text-xs text-taupe font-sans">• Occasion Compatibility Engine</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal tracking-tight">
                Occasion-to-Outfit Planner
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-taupe font-sans max-w-2xl leading-relaxed">
                Select your occasion, preferred aesthetic, and mode. StyleSense AI composes harmonized outfit templates, gives honest compatibility explanations, and lets you replace any item.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/wardrobe"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-charcoal hover:text-burgundy border border-taupe-light px-4 py-2 transition-colors"
              >
                <Layers className="w-4 h-4 text-taupe" />
                <span>My Wardrobe</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2-Column Studio Grid: Controls on Left, Live Outfit on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Controls Panel */}
          <div className="lg:col-span-5 bg-white border border-taupe-light/80 p-6 space-y-6 shadow-sm">
            {/* 1. Mode Toggle: Wardrobe Only vs Wardrobe + Store */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-taupe mb-2">
                Styling Source Mode
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                <button
                  type="button"
                  onClick={() => setMode('wardrobe_only')}
                  className={`py-2.5 px-3 border text-left flex flex-col transition-all ${
                    mode === 'wardrobe_only'
                      ? 'bg-charcoal text-white border-charcoal shadow-sm'
                      : 'bg-ivory/60 text-charcoal border-taupe-light/70 hover:border-charcoal'
                  }`}
                >
                  <span className="font-bold uppercase tracking-wider text-[11px]">100% Wardrobe</span>
                  <span className={`text-[10px] ${mode === 'wardrobe_only' ? 'text-ivory/80' : 'text-taupe'}`}>
                    Use pieces you already own
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('wardrobe_and_store')}
                  className={`py-2.5 px-3 border text-left flex flex-col transition-all ${
                    mode === 'wardrobe_and_store'
                      ? 'bg-burgundy text-white border-burgundy shadow-sm'
                      : 'bg-ivory/60 text-charcoal border-taupe-light/70 hover:border-burgundy'
                  }`}
                >
                  <span className="font-bold uppercase tracking-wider text-[11px]">Wardrobe + Store</span>
                  <span className={`text-[10px] ${mode === 'wardrobe_and_store' ? 'text-white/80' : 'text-taupe'}`}>
                    Blend owned with store catalog
                  </span>
                </button>
              </div>
            </div>

            {/* 2. Occasion Selector (8 Occasions) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-taupe mb-2">
                Target Occasion ({OCCASIONS.length})
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {OCCASIONS.map(occ => (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => setSelectedOccasion(occ.id)}
                    className={`p-2.5 border text-left transition-all ${
                      selectedOccasion === occ.id
                        ? 'border-charcoal bg-charcoal/5 font-semibold text-charcoal'
                        : 'border-taupe-light/60 hover:border-taupe text-charcoal/80'
                    }`}
                  >
                    <span className="block text-xs font-medium">{occ.name}</span>
                    <span className="text-[10px] text-taupe block truncate">{occ.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Preferred Aesthetic */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-taupe mb-2">
                Preferred Aesthetic
              </label>
              <div className="flex flex-wrap gap-2 text-xs">
                {AESTHETICS.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setSelectedAesthetic(a)}
                    className={`px-3 py-1.5 border uppercase tracking-wider text-[11px] transition-colors ${
                      selectedAesthetic === a
                        ? 'bg-charcoal text-white border-charcoal'
                        : 'bg-ivory/50 text-charcoal border-taupe-light/70 hover:border-charcoal'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Preferred Colors Palette */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-taupe mb-2">
                Color Palette Preferences
              </label>
              <div className="flex flex-wrap gap-2 text-xs">
                {COLOR_OPTIONS.map(c => {
                  const isSelected = selectedColors.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleColor(c)}
                      className={`px-2.5 py-1 text-[11px] border transition-colors ${
                        isSelected
                          ? 'bg-burgundy text-white border-burgundy font-semibold'
                          : 'bg-ivory/50 text-charcoal border-taupe-light/70 hover:border-burgundy'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Optional Budget (When Store mode enabled) */}
            {mode === 'wardrobe_and_store' && (
              <div className="p-4 bg-ivory/70 border border-taupe-light/70 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-charcoal">
                    Store Purchase Budget:
                  </span>
                  <span className="font-serif text-sm font-bold text-burgundy">{formatINR(budget)}</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="500"
                  step="25"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full accent-burgundy cursor-pointer"
                />
                <span className="text-[10px] text-taupe block mt-1">
                  StyleSense AI guarantees recommended store pieces will not exceed this limit.
                </span>
              </div>
            )}

            {/* Regenerate Trigger Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 bg-charcoal hover:bg-burgundy text-white text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Curating Ensemble...' : 'Generate Suggestions'}</span>
            </button>
          </div>

          {/* RIGHT COLUMN: Outfit Display & Collage */}
          <div className="lg:col-span-7 space-y-6">
            {loading ? (
              <div className="bg-white border border-taupe-light/80 p-12 text-center animate-pulse">
                <Sparkles className="w-10 h-10 text-burgundy mx-auto mb-3 animate-spin" />
                <h3 className="font-serif text-xl text-charcoal">Evaluating Compatibility Rules...</h3>
                <p className="text-xs text-taupe mt-1">Matching silhouette templates, palette harmonies, and occasion criteria.</p>
              </div>
            ) : !plan || Object.keys(plan.slots || {}).length === 0 ? (
              <div className="bg-white border border-taupe-light/80 p-12 text-center">
                <Layers className="w-12 h-12 text-taupe mx-auto mb-3" />
                <h3 className="font-serif text-xl text-charcoal">No Outfit Generated Yet</h3>
                <p className="text-xs text-taupe max-w-md mx-auto mt-1 mb-6">
                  {mode === 'wardrobe_only'
                    ? 'Your wardrobe has few items matching this occasion. Switch to "Wardrobe + Store" mode or add pieces to your closet.'
                    : 'Click "Generate Suggestions" to build a fresh ensemble.'}
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setMode('wardrobe_and_store')}
                    className="bg-burgundy text-white text-xs uppercase tracking-wider font-semibold px-4 py-2"
                  >
                    Enable Store Pieces
                  </button>
                  <Link
                    to="/wardrobe"
                    className="border border-taupe-light text-charcoal text-xs uppercase tracking-wider font-semibold px-4 py-2"
                  >
                    Add Wardrobe Piece
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-taupe-light/80 p-6 sm:p-8 shadow-sm">
                {/* Outfit Header: Name, Score, Occasion, Save */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-taupe-light/60 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] uppercase tracking-widest font-bold bg-charcoal text-white px-2 py-0.5">
                        {plan.occasionLabel}
                      </span>
                      <span className="text-xs text-taupe font-sans capitalize">• {plan.aesthetic} Aesthetic</span>
                    </div>
                    <h3 className="font-serif text-2xl text-charcoal font-medium">
                      {plan.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-taupe">Synergy:</span>
                        <span className="font-serif text-lg font-bold text-burgundy">{plan.compatibilityScore}%</span>
                      </div>
                      <span className="text-[10px] text-taupe block">Deterministic Match</span>
                    </div>

                    <button
                      onClick={openSaveModal}
                      className="inline-flex items-center gap-1.5 bg-charcoal hover:bg-burgundy text-white text-xs uppercase tracking-wider font-semibold px-4 py-2 transition-colors"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>Save Outfit</span>
                    </button>
                  </div>
                </div>

                {/* Explanation Card */}
                <div className="my-4 p-4 bg-ivory/70 border border-taupe-light/60 text-xs font-sans leading-relaxed">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-burgundy flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-charcoal">Why StyleSense Curated This: </span>
                      <span className="text-taupe">{plan.explanation}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Summary Pill Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-taupe-light/50 text-xs font-sans">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-charcoal font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                      <span>{plan.ownedCount} Owned from Closet</span>
                    </span>
                    {plan.purchaseCount > 0 && (
                      <span className="flex items-center gap-1.5 text-burgundy font-semibold">
                        <span className="w-2 h-2 rounded-full bg-burgundy inline-block" />
                        <span>{plan.purchaseCount} to Purchase ({formatINR(plan.totalStoreCost)})</span>
                      </span>
                    )}
                  </div>

                  {/* Color Palette Display */}
                  {plan.colorPalette?.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-taupe uppercase tracking-wider">Palette:</span>
                      <div className="flex items-center gap-1">
                        {plan.colorPalette.map(col => (
                          <span
                            key={col}
                            className="text-[9px] uppercase tracking-wider bg-ivory px-1.5 py-0.5 border border-taupe-light text-charcoal capitalize"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Item Slots Grid Collage */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(plan.slots).map(([slotName, slotObj]) => {
                    const item = slotObj.item;
                    return (
                      <div
                        key={slotName}
                        className={`p-3.5 border flex flex-col justify-between transition-all ${
                          slotObj.isOwned
                            ? 'bg-ivory/40 border-taupe-light/70'
                            : 'bg-white border-burgundy/40 ring-1 ring-burgundy/20'
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Image Box */}
                          <div className="w-20 h-24 bg-taupe-light/20 flex-shrink-0 overflow-hidden relative">
                            {item.image_url && !imageErrors[`slot-${slotName}`] ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                onError={() => handleImageError(`slot-${slotName}`)}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-taupe">
                                <Layers className="w-6 h-6" />
                              </div>
                            )}

                            <span
                              className={`absolute bottom-0 inset-x-0 text-[8px] font-bold py-0.5 uppercase tracking-wider text-center text-white ${
                                slotObj.isOwned ? 'bg-charcoal/90' : 'bg-burgundy'
                              }`}
                            >
                              {slotObj.isOwned ? 'In Closet' : 'Store'}
                            </span>
                          </div>

                          {/* Item Meta */}
                          <div className="min-w-0 flex-1 flex flex-col justify-between">
                            <div>
                              <span className="text-[9px] uppercase tracking-widest font-bold text-taupe block">
                                Slot: {slotName}
                              </span>
                              <h4 className="font-serif text-sm font-semibold text-charcoal truncate mt-0.5" title={item.name}>
                                {item.name}
                              </h4>
                              <p className="text-[10px] text-taupe capitalize">
                                {item.color} • {item.style}
                              </p>
                            </div>

                            <div className="mt-2 flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-charcoal">
                                {slotObj.isOwned
                                  ? (item.purchase_price ? `Owned (${formatINR(item.purchase_price)})` : 'Owned')
                                  : formatINR(item.price)}
                              </span>
                              <span className="text-[9px] text-taupe uppercase">
                                Match: {slotObj.score}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Replace / Swap Button */}
                        <div className="mt-3 pt-2.5 border-t border-taupe-light/50 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenReplace(slotName, item)}
                            className="text-[10px] font-bold uppercase tracking-wider text-burgundy hover:text-charcoal inline-flex items-center gap-1 transition-colors"
                          >
                            <Shuffle className="w-3 h-3" />
                            <span>Replace Piece</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL: REPLACE ITEM IN SLOT --- */}
      {replaceModalOpen && replacingSlot && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full p-6 sm:p-8 border border-taupe-light shadow-editorial relative max-h-[85vh] overflow-y-auto my-8">
            <button
              onClick={() => setReplaceModalOpen(false)}
              className="absolute top-4 right-4 text-taupe hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl text-charcoal mb-1 capitalize">
              Replace {replacingSlot.slotName}
            </h3>
            <p className="text-xs text-taupe mb-6 font-sans">
              Choose an alternative piece from your closet or available store products to customize this outfit.
            </p>

            {loadingAlternatives ? (
              <div className="py-12 text-center text-taupe text-xs">Loading compatible alternatives...</div>
            ) : (
              <div className="space-y-6">
                {/* Closet Alternatives */}
                <div>
                  <h4 className="text-[11px] uppercase tracking-wider font-bold text-charcoal mb-3">
                    From Your Digital Closet ({slotAlternatives.wardrobeAlternatives?.length || 0})
                  </h4>
                  {slotAlternatives.wardrobeAlternatives?.length === 0 ? (
                    <p className="text-xs text-taupe italic bg-ivory p-3">No other compatible items in your closet for this slot.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {slotAlternatives.wardrobeAlternatives.map(item => (
                        <div
                          key={item.id}
                          onClick={() => handleApplyReplacement(item, true)}
                          className="flex items-center gap-3 p-2.5 bg-ivory/60 border border-taupe-light/70 hover:border-charcoal cursor-pointer transition-all"
                        >
                          <div className="w-12 h-14 bg-taupe-light/30 overflow-hidden flex-shrink-0">
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-charcoal truncate">{item.name}</p>
                            <p className="text-[10px] text-taupe capitalize">{item.color} • {item.style}</p>
                            <span className="text-[9px] uppercase tracking-wider text-burgundy font-bold mt-1 block">
                              Select Owned
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Store Alternatives */}
                {slotAlternatives.storeAlternatives?.length > 0 && (
                  <div>
                    <h4 className="text-[11px] uppercase tracking-wider font-bold text-charcoal mb-3">
                      From Store Catalog ({slotAlternatives.storeAlternatives.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {slotAlternatives.storeAlternatives.map(item => (
                        <div
                          key={item.id}
                          onClick={() => handleApplyReplacement(item, false)}
                          className="flex items-center gap-3 p-2.5 bg-white border border-burgundy/40 hover:border-burgundy cursor-pointer transition-all"
                        >
                          <div className="w-12 h-14 bg-taupe-light/30 overflow-hidden flex-shrink-0">
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-charcoal truncate">{item.name}</p>
                            <p className="text-[10px] text-taupe">{formatINR(item.price)}</p>
                            <span className="text-[9px] uppercase tracking-wider text-charcoal font-bold mt-1 block">
                              Select Store Piece
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL: SAVE OUTFIT --- */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 border border-taupe-light shadow-editorial relative">
            <button
              onClick={() => setSaveModalOpen(false)}
              className="absolute top-4 right-4 text-taupe hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl text-charcoal mb-1">Save Outfit to Collection</h3>
            <p className="text-xs text-taupe mb-4 font-sans">
              Save this look to easily revisit and wear again in the future.
            </p>

            <form onSubmit={handleSaveOutfit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-taupe mb-1">
                  Outfit Name *
                </label>
                <input
                  type="text"
                  required
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                  className="w-full bg-ivory px-3 py-2 border border-taupe-light focus:outline-none focus:border-burgundy text-charcoal"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-taupe mb-1">
                  Occasion
                </label>
                <input
                  type="text"
                  disabled
                  value={plan?.occasionLabel || selectedOccasion}
                  className="w-full bg-taupe-light/20 px-3 py-2 border border-taupe-light text-taupe cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-taupe mb-1">
                  Notes / Styling Cues
                </label>
                <textarea
                  rows={2}
                  value={outfitNotes}
                  onChange={(e) => setOutfitNotes(e.target.value)}
                  className="w-full bg-ivory px-3 py-2 border border-taupe-light focus:outline-none focus:border-burgundy text-charcoal"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-taupe-light/50">
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="px-4 py-2 border border-taupe-light text-charcoal text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-charcoal hover:bg-burgundy text-white text-xs uppercase tracking-wider font-semibold transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Confirm & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
