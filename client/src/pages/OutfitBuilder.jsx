import React, { useState, useEffect } from 'react';
import { Layers, Sparkles, RefreshCw, ShoppingBag, Info, AlertTriangle, Check } from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import OutfitSlotCard from '../components/outfit/OutfitSlotCard';
import ReplacementModal from '../components/outfit/ReplacementModal';
import Button from '../components/common/Button';
import { formatINR } from '../utils/formatCurrency';

export default function OutfitBuilder() {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [style, setStyle] = useState('minimalist');
  const [occasion, setOccasion] = useState('casual');
  const [budgetMax, setBudgetMax] = useState(350);
  const [useDress, setUseDress] = useState(false);

  const [outfit, setOutfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingAll, setAddingAll] = useState(false);

  // Replacement modal state
  const [replacementModalOpen, setReplacementModalOpen] = useState(false);
  const [activeSlotName, setActiveSlotName] = useState('');
  const [slotReplacements, setSlotReplacements] = useState([]);
  const [currentSlotProductId, setCurrentSlotProductId] = useState(null);

  const fetchOutfit = async () => {
    try {
      setLoading(true);
      const res = await api.getOutfit({
        style,
        occasion,
        budget_max: budgetMax,
        useDress
      });
      if (res.success && res.data) {
        setOutfit(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to generate outfit.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutfit();
  }, [style, occasion, budgetMax, useDress]);

  const handleOpenReplace = async (slotItem) => {
    try {
      setActiveSlotName(slotItem.slot);
      setCurrentSlotProductId(slotItem.product?.id);
      const res = await api.replaceOutfitSlot({
        slotName: slotItem.slot,
        style,
        occasion
      });
      if (res.success) {
        setSlotReplacements(res.data);
        setReplacementModalOpen(true);
      }
    } catch (err) {
      showToast('Could not load replacement options.', 'error');
    }
  };

  const handleSelectReplacement = (newProduct) => {
    if (!outfit) return;

    const updatedSlots = outfit.slots.map(s => {
      if (s.slot === activeSlotName) {
        return { ...s, product: newProduct };
      }
      return s;
    });

    const newTotal = updatedSlots.reduce((sum, item) => sum + parseFloat(item.product.price), 0);
    const roundedTotal = Math.round(newTotal * 100) / 100;

    setOutfit({
      ...outfit,
      slots: updatedSlots,
      totalPrice: roundedTotal,
      withinBudget: budgetMax ? roundedTotal <= budgetMax : true,
    });

    showToast(`Updated ${activeSlotName} with ${newProduct.name}.`);
  };

  const handleAddAllToCart = async () => {
    if (!outfit || !outfit.slots.length) return;
    setAddingAll(true);

    try {
      let addedCount = 0;
      for (const slotItem of outfit.slots) {
        const prod = slotItem.product;
        const variants = prod.variants || [];
        const inStockVar = variants.find(v => v.stock_quantity > 0) || variants[0];
        if (inStockVar) {
          await addToCart(inStockVar.id, 1, {
            id: prod.id,
            name: prod.name,
            slug: prod.slug,
            price: prod.price,
            image_url: prod.image_url,
            size: inStockVar.size,
            color: inStockVar.color,
            stock: inStockVar.stock_quantity,
          });
          addedCount++;
        }
      }
      showToast(`Added ${addedCount} outfit pieces to your shopping bag!`);
    } catch (err) {
      showToast('Failed to add all items to shopping bag.', 'error');
    } finally {
      setAddingAll(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Editorial Header */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-burgundy/10 text-burgundy text-xs font-sans uppercase font-bold tracking-widest border border-burgundy/20">
          <Layers className="w-3.5 h-3.5" />
          <span>Modular Coordination Engine</span>
        </div>

        <h1 className="editorial-heading text-3xl sm:text-5xl">
          The Outfit Builder
        </h1>

        <p className="font-sans text-sm sm:text-base text-taupe-dark leading-relaxed font-light">
          Coordinate harmonious garments into complete ensembles. Adjust style aesthetics, occasions, and budgets with real-time recalculation of total cost and piece compatibility.
        </p>
      </div>

      {/* Control Panel: Style, Occasion, Budget, Dress toggle */}
      <div className="bg-white border border-taupe-light p-6 sm:p-8 shadow-editorial grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label className="editorial-subheading block mb-2">Style Aesthetic</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="editorial-input bg-white cursor-pointer capitalize"
          >
            <option value="minimalist">Minimalist</option>
            <option value="streetwear">Streetwear</option>
            <option value="classic">Classic</option>
            <option value="chic">Chic</option>
          </select>
        </div>

        <div>
          <label className="editorial-subheading block mb-2">Target Occasion</label>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="editorial-input bg-white cursor-pointer capitalize"
          >
            <option value="casual">Casual Daywear</option>
            <option value="college">College / University</option>
            <option value="office">Office / Work</option>
            <option value="party">Party / Evening</option>
            <option value="festive">Festive / Formal</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="editorial-subheading">Target Budget</label>
            <span className="font-sans text-xs font-bold text-burgundy">{formatINR(budgetMax)}</span>
          </div>
          <input
            type="range"
            min="100"
            max="600"
            step="25"
            value={budgetMax}
            onChange={(e) => setBudgetMax(parseInt(e.target.value, 10))}
            className="w-full accent-burgundy cursor-pointer mt-2"
          />
        </div>

        <div>
          <label className="editorial-subheading block mb-2">Base Silhouette</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setUseDress(false)}
              className={`flex-1 py-2.5 text-xs font-sans font-semibold uppercase tracking-wider border transition-all ${
                !useDress
                  ? 'border-charcoal bg-charcoal text-white'
                  : 'border-taupe-light bg-white text-charcoal hover:border-taupe'
              }`}
            >
              Top & Bottom
            </button>
            <button
              type="button"
              onClick={() => setUseDress(true)}
              className={`flex-1 py-2.5 text-xs font-sans font-semibold uppercase tracking-wider border transition-all ${
                useDress
                  ? 'border-charcoal bg-charcoal text-white'
                  : 'border-taupe-light bg-white text-charcoal hover:border-taupe'
              }`}
            >
              One-Piece Dress
            </button>
          </div>
        </div>
      </div>

      {/* Outfit Slots Showcase */}
      {outfit && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-ivory border border-taupe-light">
            <div>
              <span className="editorial-subheading">Cohesion Assessment</span>
              <p className="font-serif text-base text-charcoal mt-0.5">
                {outfit.cohesion?.harmonyDescription}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-[10px] font-sans uppercase tracking-widest text-taupe block">
                  Total Outfit Cost
                </span>
                <span className={`font-serif text-2xl font-bold ${outfit.withinBudget ? 'text-charcoal' : 'text-red-700'}`}>
                  {formatINR(outfit.totalPrice)}
                </span>
              </div>

              <Button
                variant="burgundy"
                size="md"
                loading={addingAll}
                onClick={handleAddAllToCart}
                icon={ShoppingBag}
              >
                Add Complete Look
              </Button>
            </div>
          </div>

          {/* Slot Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {outfit.slots.map((slotItem) => (
              <OutfitSlotCard
                key={slotItem.slot}
                slot={slotItem.slot}
                product={slotItem.product}
                onReplace={() => handleOpenReplace(slotItem)}
              />
            ))}
          </div>

          {/* Academic Transparency Disclaimer Note */}
          <div className="p-4 bg-white border border-taupe-light/70 text-xs text-taupe flex items-start gap-3 leading-relaxed">
            <Info className="w-4 h-4 text-burgundy shrink-0 mt-0.5" />
            <p>
              <strong className="text-charcoal">Design & Algorithmic Notice: </strong>
              {outfit.disclaimer} Individual pieces can be replaced above to fit your specific styling preferences.
            </p>
          </div>
        </section>
      )}

      {/* Replacement Modal */}
      <ReplacementModal
        isOpen={replacementModalOpen}
        onClose={() => setReplacementModalOpen(false)}
        slotName={activeSlotName}
        items={slotReplacements}
        currentProductId={currentSlotProductId}
        onSelectItem={handleSelectReplacement}
      />
    </div>
  );
}
