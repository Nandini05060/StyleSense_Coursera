import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Sliders,
  Save,
  RotateCcw,
  Check,
  ShieldCheck,
  Info,
  Layers,
  Heart,
  ShoppingBag,
  Clock,
  ArrowRight,
  Palette,
  Compass,
  FileText,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProductCard from '../components/product/ProductCard';
import { formatINR } from '../utils/formatCurrency';

const AESTHETIC_CHOICES = [
  { id: 'minimalist', label: 'Minimalist', desc: 'Clean geometric lines, monochrome neutrals, understated luxury' },
  { id: 'classic', label: 'Classic Elegance', desc: 'Timeless trench coats, polo knits, tailored silhouettes' },
  { id: 'chic', label: 'Contemporary Chic', desc: 'Sculptural necklines, bias skirts, modern tailoring' },
  { id: 'streetwear', label: 'Refined Streetwear', desc: 'Modern boxy silhouettes, relaxed outerwear, premium cottons' }
];

const COLOR_PALETTE = [
  { id: 'ivory', label: 'Ivory', hex: '#F7F4F0', border: true },
  { id: 'charcoal', label: 'Charcoal', hex: '#191817' },
  { id: 'burgundy', label: 'Burgundy', hex: '#762D3D' },
  { id: 'beige', label: 'Beige', hex: '#E5DED5' },
  { id: 'black', label: 'Black', hex: '#000000' },
  { id: 'olive', label: 'Olive', hex: '#556B2F' },
  { id: 'camel', label: 'Camel', hex: '#C19A6B' },
  { id: 'navy', label: 'Navy', hex: '#1B263B' },
  { id: 'white', label: 'Pure White', hex: '#FFFFFF', border: true }
];

const OCCASION_CHOICES = [
  { id: 'casual', label: 'Casual Daywear' },
  { id: 'college', label: 'Campus / University' },
  { id: 'office', label: 'Office & Workwear' },
  { id: 'party', label: 'Evening & Cocktail' },
  { id: 'festive', label: 'Formal / Celebration' }
];

const CATEGORY_CHOICES = [
  { id: 'tops', label: 'Tops & Knits' },
  { id: 'bottoms', label: 'Tailored Bottoms' },
  { id: 'dresses', label: 'Dresses' },
  { id: 'outerwear', label: 'Outerwear' },
  { id: 'shoes', label: 'Footwear' },
  { id: 'accessories', label: 'Accessories' }
];

export default function StylePassport() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    preferred_aesthetics: ['minimalist', 'classic'],
    preferred_colors: ['ivory', 'charcoal', 'navy'],
    favorite_categories: ['tops', 'bottoms'],
    preferred_occasions: ['casual', 'office'],
    budget_min: 0,
    budget_max: 250,
    lifestyle_tags: ['Capsule Wardrobe', 'Timeless Essentials'],
    notes: 'Focus on versatile silhouettes, high cost-per-wear utility, and neutral foundations.'
  });

  const [savedOutfits, setSavedOutfits] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load User Style Profile, Saved Outfits & Recommended Products
  useEffect(() => {
    async function loadPassportData() {
      try {
        setLoading(true);
        if (isAuthenticated) {
          const profileRes = await api.getStyleProfile();
          if (profileRes?.data) {
            setProfile(profileRes.data);
          }

          const outfitsRes = await api.getSavedOutfits();
          if (outfitsRes?.data) {
            setSavedOutfits(outfitsRes.data.slice(0, 4));
          }
        }

        // Fetch curated recommended pieces
        const recRes = await api.getRecommendations({ limit: 4 });
        if (recRes?.data?.recommendations) {
          setRecommendedProducts(recRes.data.recommendations.map(r => r.product));
        } else {
          const prodRes = await api.getProducts({ limit: 4 });
          if (prodRes?.data?.products) {
            setRecommendedProducts(prodRes.data.products);
          }
        }
      } catch (err) {
        console.error('Failed to load Style Passport data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPassportData();
  }, [isAuthenticated]);

  // Toggle item in profile arrays
  const toggleItem = (key, item) => {
    setProfile(prev => {
      const currentList = prev[key] || [];
      const updated = currentList.includes(item)
        ? currentList.filter(x => x !== item)
        : [...currentList, item];
      return { ...prev, [key]: updated };
    });
  };

  // Save Profile Changes
  const handleSaveProfile = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to save persistent changes to your Style Passport.', 'info');
      navigate('/login?redirect=/style-passport');
      return;
    }

    try {
      setSaving(true);
      await api.updateStyleProfile(profile);
      setEditing(false);
      showToast('Style Passport dossier updated and persisted successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to update style passport', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Reset to Baseline
  const handleResetProfile = async () => {
    if (!isAuthenticated) {
      setProfile({
        preferred_aesthetics: ['minimalist', 'classic'],
        preferred_colors: ['ivory', 'charcoal', 'navy'],
        favorite_categories: ['tops', 'bottoms'],
        preferred_occasions: ['casual', 'office'],
        budget_min: 0,
        budget_max: 250,
        lifestyle_tags: ['Capsule Wardrobe', 'Timeless Essentials'],
        notes: 'Focus on versatile silhouettes, high cost-per-wear utility, and neutral foundations.'
      });
      showToast('Reset passport to default baseline.');
      return;
    }

    try {
      setSaving(true);
      const res = await api.resetStyleProfile();
      if (res?.data) {
        setProfile(res.data);
      }
      setEditing(false);
      showToast('Reset your Style Passport to default editorial baseline.');
    } catch (err) {
      showToast(err.message || 'Failed to reset profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Derived Dossier Summary
  const editorialSummary = `${user?.name || 'Guest Connoisseur'} maintains a curated style philosophy anchored in ${
    profile.preferred_aesthetics?.join(' & ') || 'timeless minimalism'
  }, frequently tailored for ${
    profile.preferred_occasions?.join(' and ') || 'everyday'
  } settings with a target price ceiling of ${formatINR(profile.budget_max || 250)}.`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 font-sans">
      {/* Magazine Cover Header */}
      <div className="pb-8 border-b border-taupe-light flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-sans text-taupe uppercase tracking-[0.3em] mb-2 font-semibold">
            <span>Dossier Privé</span>
            <span>•</span>
            <span className="text-burgundy">Wardrobe Intelligence Issue No. 04</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-charcoal font-light tracking-tight">
            The Style Passport
          </h1>
          <p className="font-serif italic text-base sm:text-lg text-taupe-dark mt-2 max-w-2xl">
            "{editorialSummary}"
          </p>
        </div>

        {/* Global Passport Actions */}
        <div className="flex items-center gap-3">
          {editing ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </Button>
              <Button variant="outline" size="sm" icon={RotateCcw} onClick={handleResetProfile} disabled={saving}>
                Reset
              </Button>
              <Button variant="burgundy" size="sm" icon={Save} loading={saving} onClick={handleSaveProfile}>
                Persist Dossier
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" icon={RotateCcw} onClick={handleResetProfile}>
                Reset
              </Button>
              <Button variant="burgundy" size="sm" icon={Sliders} onClick={() => setEditing(true)}>
                Edit Style Preferences
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Guest Notice if unauthenticated */}
      {!isAuthenticated && (
        <div className="p-4 bg-ivory border border-taupe-light flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-sans text-taupe-dark">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-burgundy shrink-0" />
            <span>
              You are exploring the Style Passport in preview mode. Create a member account to permanently save your custom palette and synchronize across devices.
            </span>
          </div>
          <Link to="/register?redirect=/style-passport">
            <Button variant="primary" size="sm">
              Create Account
            </Button>
          </Link>
        </div>
      )}

      {/* Section 1: Aesthetic & Signature Palette (Magazine Editorial Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Card: Curated Aesthetics & Philosophy (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-taupe-light p-6 sm:p-8 space-y-6 shadow-subtle">
          <div className="pb-4 border-b border-taupe-light/70 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-burgundy block">
                Chapter 01 • Aesthetic Alignment
              </span>
              <h2 className="font-serif text-2xl font-medium text-charcoal mt-0.5">
                Design Language & Form
              </h2>
            </div>
            <Compass className="w-5 h-5 text-taupe stroke-[1.5]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AESTHETIC_CHOICES.map(a => {
              const isSelected = profile.preferred_aesthetics?.includes(a.id);
              return (
                <div
                  key={a.id}
                  onClick={() => editing && toggleItem('preferred_aesthetics', a.id)}
                  className={`p-4 border transition-all ${
                    isSelected
                      ? 'border-charcoal bg-ivory-50/70 ring-1 ring-charcoal'
                      : 'border-taupe-light/60 bg-white'
                  } ${editing ? 'cursor-pointer hover:border-charcoal' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-serif text-base font-semibold text-charcoal">{a.label}</span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-charcoal text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-taupe-dark font-sans leading-relaxed">{a.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Editorial Notes */}
          <div className="pt-4 border-t border-taupe-light/50 space-y-2">
            <span className="text-[10px] font-sans uppercase tracking-widest font-bold text-taupe block">
              Personal Styling Philosophy
            </span>
            {editing ? (
              <textarea
                value={profile.notes || ''}
                onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
                rows={2}
                className="w-full p-2.5 bg-ivory border border-taupe-light text-xs font-sans text-charcoal focus:border-charcoal focus:outline-none"
                placeholder="Describe your tailoring nuances, drape preferences, or daily style notes..."
              />
            ) : (
              <p className="text-xs text-taupe-dark font-sans italic bg-ivory p-3 border border-taupe-light/60 leading-relaxed">
                "{profile.notes || 'Versatile silhouettes and high cost-per-wear utility.'}"
              </p>
            )}
          </div>
        </div>

        {/* Right Card: Signature Color Swatches & Budget (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-taupe-light p-6 sm:p-8 space-y-6 shadow-subtle">
          <div className="pb-4 border-b border-taupe-light/70 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-burgundy block">
                Chapter 02 • Chromatic Identity
              </span>
              <h2 className="font-serif text-2xl font-medium text-charcoal mt-0.5">
                Signature Color Palette
              </h2>
            </div>
            <Palette className="w-5 h-5 text-taupe stroke-[1.5]" />
          </div>

          {/* Swatches */}
          <div>
            <span className="text-[10px] font-sans uppercase tracking-wider text-taupe block mb-3 font-semibold">
              Selected Color DNA ({profile.preferred_colors?.length || 0} Tones)
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {COLOR_PALETTE.map(c => {
                const isSelected = profile.preferred_colors?.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => editing && toggleItem('preferred_colors', c.id)}
                    className={`p-2 border flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-burgundy ring-1 ring-burgundy bg-burgundy-50/20'
                        : 'border-taupe-light/70 bg-white'
                    } ${editing ? 'cursor-pointer hover:border-charcoal' : ''}`}
                  >
                    <span
                      className="w-7 h-7 rounded-full shadow-inner border border-taupe-light/80 block"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[11px] font-sans font-medium text-charcoal capitalize">
                      {c.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Budget Range Ceiling */}
          <div className="pt-4 border-t border-taupe-light/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans uppercase tracking-wider text-taupe font-semibold">
                Target Budget Ceiling
              </span>
              <span className="font-serif text-lg font-bold text-burgundy">
                {formatINR(profile.budget_max || 250)}
              </span>
            </div>

            {editing ? (
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={profile.budget_max || 250}
                onChange={(e) => setProfile({ ...profile, budget_max: parseFloat(e.target.value) })}
                className="w-full accent-burgundy cursor-pointer"
              />
            ) : (
              <div className="w-full bg-ivory h-2 border border-taupe-light overflow-hidden">
                <div
                  className="bg-burgundy h-full transition-all"
                  style={{ width: `${Math.min(100, ((profile.budget_max || 250) / 500) * 100)}%` }}
                />
              </div>
            )}
            <p className="text-[10px] text-taupe font-sans">
              Algorithms prioritize pieces within your specified budget ceiling while evaluating wardrobe synergy.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Occasions & Core Wardrobe Categories */}
      <div className="bg-white border border-taupe-light p-6 sm:p-8 space-y-6 shadow-subtle">
        <div className="pb-4 border-b border-taupe-light/70 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-burgundy block">
              Chapter 03 • Functional Wardrobe DNA
            </span>
            <h2 className="font-serif text-2xl font-medium text-charcoal mt-0.5">
              Occasions & Foundational Categories
            </h2>
          </div>
          <Layers className="w-5 h-5 text-taupe stroke-[1.5]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Frequent Occasions */}
          <div>
            <span className="text-[10px] font-sans uppercase tracking-wider text-taupe block mb-3 font-semibold">
              Frequent Occasion Settings
            </span>
            <div className="flex flex-wrap gap-2">
              {OCCASION_CHOICES.map(occ => {
                const isSelected = profile.preferred_occasions?.includes(occ.id);
                return (
                  <button
                    key={occ.id}
                    type="button"
                    disabled={!editing}
                    onClick={() => toggleItem('preferred_occasions', occ.id)}
                    className={`px-3.5 py-1.5 text-xs font-sans font-semibold border transition-all ${
                      isSelected
                        ? 'border-charcoal bg-charcoal text-white'
                        : 'border-taupe-light/70 bg-ivory text-charcoal hover:border-taupe'
                    } ${editing ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {occ.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Categories */}
          <div>
            <span className="text-[10px] font-sans uppercase tracking-wider text-taupe block mb-3 font-semibold">
              Priority Wardrobe Categories
            </span>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_CHOICES.map(cat => {
                const isSelected = profile.favorite_categories?.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    disabled={!editing}
                    onClick={() => toggleItem('favorite_categories', cat.id)}
                    className={`px-3.5 py-1.5 text-xs font-sans font-semibold border transition-all ${
                      isSelected
                        ? 'border-burgundy bg-burgundy text-white'
                        : 'border-taupe-light/70 bg-ivory text-charcoal hover:border-taupe'
                    } ${editing ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Explainability Trust Badge */}
        <div className="mt-4 pt-4 border-t border-taupe-light/50 flex items-start gap-3 text-xs font-sans text-taupe-dark">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-charcoal">Deterministic Intelligence: </strong>
            Your style passport attributes directly weigh recommendation algorithms in Style Studio, Outfit Planner, and Mix & Match. We never infer sensitive personal characteristics, demographic data, or unconsented metrics.
          </div>
        </div>
      </div>

      {/* Section 3: Saved Ensembles Showcase */}
      {savedOutfits.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-end justify-between border-b border-taupe-light pb-3">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-burgundy block">
                Chapter 04 • Curated Looks Archive
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-charcoal">
                Saved Ensembles
              </h2>
            </div>
            <Link to="/mix-match" className="text-xs font-sans font-semibold uppercase tracking-wider text-burgundy hover:underline flex items-center gap-1">
              <span>Compose in Mix & Match</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {savedOutfits.map(outfit => (
              <div key={outfit.id} className="bg-white border border-taupe-light p-4 flex flex-col justify-between shadow-subtle hover:border-charcoal transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" size="sm">{outfit.occasion || 'Casual'}</Badge>
                    <span className="text-[10px] text-taupe font-mono">{outfit.items?.length || 0} Pieces</span>
                  </div>
                  <h4 className="font-serif text-base font-semibold text-charcoal line-clamp-1">{outfit.name}</h4>
                  {outfit.notes && (
                    <p className="text-xs text-taupe-dark italic font-serif mt-1 line-clamp-2">"{outfit.notes}"</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-taupe-light/60">
                  <Link to="/mix-match">
                    <Button variant="outline" size="sm" className="w-full">
                      Open in Studio
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Personalized Curated Atelier Recommendations */}
      <div className="space-y-4">
        <div className="flex items-end justify-between border-b border-taupe-light pb-3">
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-burgundy block">
              Chapter 05 • Curated Atelier Selections
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-charcoal">
              Recommended for Your Dossier
            </h2>
          </div>
          <Link to="/shop" className="text-xs font-sans font-semibold uppercase tracking-wider text-burgundy hover:underline flex items-center gap-1">
            <span>Explore Entire Collection</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedProducts.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    </div>
  );
}
