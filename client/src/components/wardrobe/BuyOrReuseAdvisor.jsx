import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  RefreshCw,
  Layers,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Tag,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/formatCurrency';

export default function BuyOrReuseAdvisor({ product, compact = false, onSelectExistingOutfit }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    if (!product || !product.id) return;
    loadComparison();
  }, [product?.id, isAuthenticated]);

  const loadComparison = async () => {
    setLoading(true);
    try {
      const res = await api.compareWithWardrobe({ product_id: product.id });
      if (res && res.success) {
        setComparison(res.data);
      }
    } catch (err) {
      // Graceful fallback for offline / network glitches
      console.warn('Advisor comparison failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  if (!product) return null;

  if (loading) {
    return (
      <div className="bg-white border border-taupe-light/70 p-6 rounded-none animate-pulse">
        <div className="h-4 bg-taupe-light/40 w-1/3 mb-3" />
        <div className="h-6 bg-taupe-light/30 w-3/4 mb-4" />
        <div className="h-20 bg-taupe-light/20 w-full" />
      </div>
    );
  }

  if (!comparison) {
    return null;
  }

  const {
    verdict,
    headline,
    advice,
    closestItems = [],
    suggestedOutfit = [],
    wardrobeItemCount = 0
  } = comparison;

  // Verdict style helpers
  const getBadgeStyle = () => {
    switch (verdict) {
      case 'create_similar_look':
        return 'bg-burgundy text-white';
      case 'complements_wardrobe':
        return 'bg-charcoal text-white';
      case 'adds_new_category':
        return 'bg-emerald-800 text-white';
      case 'limited_data':
      default:
        return 'bg-taupe/20 text-charcoal';
    }
  };

  return (
    <div className={`bg-white border border-taupe-light/80 p-5 sm:p-6 shadow-sm transition-all duration-200 ${compact ? 'text-xs' : ''}`}>
      {/* Header Badge & Title */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-taupe-light/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-burgundy" />
          <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-burgundy">
            Smart Buy-or-Reuse Advisor
          </span>
        </div>
        <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-none ${getBadgeStyle()}`}>
          {verdict === 'create_similar_look' && 'Reuse First Recommendation'}
          {verdict === 'complements_wardrobe' && 'Wardrobe Synergy High'}
          {verdict === 'adds_new_category' && 'Category Expansion'}
          {verdict === 'limited_data' && 'Wardrobe Data Notice'}
        </span>
      </div>

      {/* Main Headline & Contextual Advice */}
      <div className="mt-3">
        <h4 className="font-serif text-base sm:text-lg font-medium text-charcoal">
          {headline}
        </h4>
        <p className="mt-1 text-xs text-taupe leading-relaxed font-sans">
          {advice}
        </p>
      </div>

      {/* Comparison View */}
      {verdict === 'create_similar_look' && closestItems.length > 0 && (
        <div className="mt-4 bg-ivory/60 p-4 border border-taupe-light/50">
          <div className="flex items-center justify-between text-[11px] font-sans font-semibold text-charcoal mb-3">
            <span>Piece You Already Own in Your Closet:</span>
            <span className="text-[10px] text-burgundy uppercase tracking-wider font-bold">100% Owned</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            {/* The Item they already own */}
            {closestItems.slice(0, 1).map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-white p-2.5 border border-taupe-light/70">
                <div className="w-14 h-16 bg-taupe-light/30 flex-shrink-0 overflow-hidden relative">
                  {!imageErrors[item.id] ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      onError={() => handleImageError(item.id)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-taupe">
                      <Layers className="w-5 h-5" />
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 bg-burgundy text-white text-[8px] font-bold px-1">
                    OWNED
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-charcoal truncate">{item.name}</p>
                  <p className="text-[10px] text-taupe capitalize">{item.color} • {item.style} • {item.wears_count || 0} wears</p>
                  <p className="text-[10px] text-burgundy font-medium mt-0.5">
                    {item.purchase_price ? `Logged: ${formatINR(item.purchase_price)}` : 'In Wardrobe'}
                  </p>
                </div>
              </div>
            ))}

            {/* Compare prompt */}
            <div className="text-xs text-taupe space-y-1 sm:pl-2">
              <p className="font-semibold text-charcoal">StyleSense Insight:</p>
              <p className="text-[11px] leading-tight">
                Instead of spending {formatINR(product.price)} on a new {product.name}, you can pair your owned item with matching trousers or denim to achieve this exact look.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Outfit Pairing with Existing Items */}
      {suggestedOutfit && suggestedOutfit.length > 1 && (
        <div className="mt-4 pt-3 border-t border-taupe-light/60">
          <div className="flex items-center justify-between text-[11px] font-sans font-semibold text-charcoal mb-2">
            <span>Coordinated Look with Your Wardrobe:</span>
            <span className="text-[10px] text-taupe uppercase tracking-wider">
              {suggestedOutfit.filter(s => s.isOwned).length} owned pieces paired
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {suggestedOutfit.map((slotItem, idx) => (
              <div
                key={idx}
                className={`p-2 border text-center ${
                  slotItem.isOwned
                    ? 'bg-ivory/50 border-taupe-light/60'
                    : 'bg-white border-burgundy/40 ring-1 ring-burgundy/20'
                }`}
              >
                <div className="w-full aspect-[4/5] bg-taupe-light/20 overflow-hidden mb-1.5 relative">
                  {slotItem.item?.image_url && !imageErrors[`outfit-${idx}`] ? (
                    <img
                      src={slotItem.item.image_url}
                      alt={slotItem.item.name}
                      onError={() => handleImageError(`outfit-${idx}`)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-taupe">
                      <Layers className="w-5 h-5" />
                    </div>
                  )}
                  <span
                    className={`absolute bottom-0 inset-x-0 text-[8px] font-bold py-0.5 uppercase tracking-wider text-white ${
                      slotItem.isOwned ? 'bg-charcoal/80' : 'bg-burgundy'
                    }`}
                  >
                    {slotItem.isOwned ? 'Your Closet' : 'This Product'}
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-charcoal truncate" title={slotItem.item?.name}>
                  {slotItem.item?.name}
                </p>
                <p className="text-[9px] text-taupe capitalize truncate">
                  {slotItem.slot}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Limited Data Notice */}
      {verdict === 'limited_data' && (
        <div className="mt-3 bg-ivory/80 p-3 border border-taupe-light/60 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-taupe flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-charcoal">
            <span className="font-semibold">Want more tailored recommendations?</span> You have {wardrobeItemCount} items in your digital wardrobe. Adding 3-5 of your daily staples unlocks automatic buy-vs-reuse comparisons.
            <div className="mt-1.5">
              <Link
                to="/wardrobe"
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-burgundy hover:underline"
              >
                <span>Open Digital Wardrobe</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Action Footnotes & Choice Affirmation */}
      <div className="mt-4 pt-3 border-t border-taupe-light/50 flex flex-wrap items-center justify-between gap-2 text-[10px] text-taupe font-sans">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>StyleSense prioritizes mindful styling without restricting your shopping choices.</span>
        </div>
        <Link
          to="/outfit-planner"
          className="text-burgundy font-semibold hover:underline flex items-center gap-1 uppercase tracking-wider text-[9px]"
        >
          <span>Test in Outfit Planner</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
