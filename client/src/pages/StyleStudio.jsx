import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Sliders,
  Info,
  ShieldCheck,
  ArrowRight,
  RefreshCcw,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PreferenceQuiz from '../components/style-studio/PreferenceQuiz';
import ProductGrid from '../components/product/ProductGrid';
import Button from '../components/common/Button';
import { formatINR } from '../utils/formatCurrency';

const AESTHETIC_OPTIONS = ['minimalist', 'classic', 'chic', 'streetwear', 'relaxed'];
const OCCASION_OPTIONS = ['casual', 'college', 'office', 'interview', 'party', 'festive', 'formal', 'travel'];
const COLOR_OPTIONS = ['ivory', 'charcoal', 'burgundy', 'navy', 'beige', 'black', 'white', 'olive'];
const CATEGORY_OPTIONS = ['tops', 'bottoms', 'outerwear', 'dresses', 'shoes', 'accessories'];
const LIFESTYLE_OPTIONS = ['University Student', 'Urban Professional', 'Commuter', 'Remote Worker', 'Coffee Shop Study', 'Evening Dinners'];

export default function StyleStudio() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const defaultPreferences = {
    occasion: 'casual',
    style: 'minimalist',
    preferred_colors: ['ivory', 'charcoal', 'beige'],
    preferred_size: 'all',
    budget_max: 200,
    category: 'all',
  };

  const [preferences, setPreferences] = useState(defaultPreferences);
  const [recommendations, setRecommendations] = useState([]);
  const [rubricMeta, setRubricMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Extended Personal Style Profile State
  const [profileLoading, setProfileLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [styleProfile, setStyleProfile] = useState({
    preferred_aesthetics: ['minimalist', 'classic'],
    preferred_colors: ['ivory', 'charcoal'],
    favorite_categories: ['tops', 'bottoms'],
    preferred_occasions: ['casual', 'college'],
    budget_min: 25,
    budget_max: 200,
    lifestyle_tags: ['University Student', 'Commuter'],
    notes: 'Focuses on versatile neutral capsule wardrobe staples.'
  });

  // Load style profile if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await api.getStyleProfile();
      if (res && res.success && res.data) {
        setStyleProfile({
          preferred_aesthetics: res.data.preferred_aesthetics || ['minimalist'],
          preferred_colors: res.data.preferred_colors || ['ivory', 'charcoal'],
          favorite_categories: res.data.favorite_categories || ['tops', 'bottoms'],
          preferred_occasions: res.data.preferred_occasions || ['casual'],
          budget_min: res.data.budget_min || 25,
          budget_max: res.data.budget_max || 200,
          lifestyle_tags: res.data.lifestyle_tags || ['Urban Professional'],
          notes: res.data.notes || ''
        });
      }
    } catch (err) {
      console.warn('Could not fetch style profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await api.updateStyleProfile(styleProfile);
      if (res && res.success) {
        showToast('Personal Style Profile updated successfully!', 'success');
        setEditingProfile(false);
        // Automatically sync with recommendations
        runRecommendations({
          ...preferences,
          style: styleProfile.preferred_aesthetics[0] || 'minimalist',
          preferred_colors: styleProfile.preferred_colors,
          budget_max: styleProfile.budget_max
        });
      }
    } catch (err) {
      showToast('Failed to save style profile.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const toggleProfileItem = (field, value) => {
    setStyleProfile(prev => {
      const arr = prev[field] || [];
      const updated = arr.includes(value)
        ? (arr.length > 1 ? arr.filter(x => x !== value) : arr)
        : [...arr, value];
      return { ...prev, [field]: updated };
    });
  };

  const runRecommendations = async (customPrefs = null) => {
    const prefsToSubmit = customPrefs || preferences;
    try {
      setLoading(true);
      const res = await api.getRecommendations(prefsToSubmit);
      if (res.success) {
        setRecommendations(res.data);
        setRubricMeta(res.meta);
        setHasSubmitted(true);
      }
    } catch (err) {
      showToast(err.message || 'Failed to generate recommendations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Run on mount once
  useEffect(() => {
    runRecommendations(defaultPreferences);
  }, []);

  const handleReset = () => {
    setPreferences(defaultPreferences);
    runRecommendations(defaultPreferences);
    showToast('Preferences reset to default values.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Editorial Header */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-block">
          <span className="font-sans text-[10px] uppercase tracking-[0.28em] text-taupe font-semibold block">
            WARDROBE INTELLIGENCE
          </span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-charcoal font-light tracking-tight">
          The Style Studio
        </h1>

        <p className="font-sans text-xs sm:text-sm text-taupe-dark leading-relaxed font-light max-w-2xl">
          A personal fashion consultation powered by transparent wardrobe scoring. Auditing silhouette, aesthetic harmony, signature palette, and budget fit across our entire atelier collection.
        </p>

        {/* Audit explanation badge */}
        <div className="bg-white border border-taupe-light/70 p-4 text-xs font-sans text-taupe-dark flex items-start gap-3">
          <Info className="w-4 h-4 text-burgundy shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-charcoal">Transparent Scoring Rubric: </span>
            Deterministic rubric evaluating Occasion (30 pts), Aesthetic (25 pts), Color Harmony (20 pts), Budget (15 pts), and Department (10 pts). Every recommendation provides an explainable audit.
          </div>
        </div>
      </div>

      {/* FEATURE 6: PERSONAL STYLE PROFILE CARD */}
      <section className="bg-white border border-taupe-light/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-taupe-light/60 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-charcoal text-white flex items-center justify-center font-serif text-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-burgundy block">
                Feature 6 • Visual Identity
              </span>
              <h2 className="font-serif text-2xl text-charcoal font-medium">
                Personal Style Profile
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {editingProfile ? (
              <button
                onClick={handleSaveProfile}
                disabled={profileLoading}
                className="inline-flex items-center gap-1.5 bg-burgundy hover:bg-charcoal text-white text-xs uppercase tracking-wider font-semibold px-4 py-2 transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{profileLoading ? 'Saving...' : 'Save Profile'}</span>
              </button>
            ) : (
              <button
                onClick={() => setEditingProfile(true)}
                className="inline-flex items-center gap-1.5 bg-ivory hover:bg-taupe-light/40 border border-taupe-light text-charcoal text-xs uppercase tracking-wider font-semibold px-4 py-2 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-taupe" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
          {/* Column 1: Aesthetics & Colors */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-taupe block mb-1.5">
                Preferred Aesthetics
              </label>
              <div className="flex flex-wrap gap-1.5">
                {editingProfile ? (
                  AESTHETIC_OPTIONS.map(a => (
                    <button
                      key={a}
                      onClick={() => toggleProfileItem('preferred_aesthetics', a)}
                      className={`px-2.5 py-1 text-[11px] border capitalize transition-colors ${
                        styleProfile.preferred_aesthetics?.includes(a)
                          ? 'bg-charcoal text-white border-charcoal'
                          : 'bg-ivory text-charcoal border-taupe-light/60'
                      }`}
                    >
                      {a}
                    </button>
                  ))
                ) : (
                  styleProfile.preferred_aesthetics?.map(a => (
                    <span key={a} className="px-2.5 py-1 bg-ivory border border-taupe-light/70 text-charcoal capitalize text-[11px]">
                      {a}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-taupe block mb-1.5">
                Signature Color Palette
              </label>
              <div className="flex flex-wrap gap-1.5">
                {editingProfile ? (
                  COLOR_OPTIONS.map(c => (
                    <button
                      key={c}
                      onClick={() => toggleProfileItem('preferred_colors', c)}
                      className={`px-2.5 py-1 text-[11px] border capitalize transition-colors ${
                        styleProfile.preferred_colors?.includes(c)
                          ? 'bg-burgundy text-white border-burgundy'
                          : 'bg-ivory text-charcoal border-taupe-light/60'
                      }`}
                    >
                      {c}
                    </button>
                  ))
                ) : (
                  styleProfile.preferred_colors?.map(c => (
                    <span key={c} className="px-2.5 py-1 bg-burgundy/10 border border-burgundy/30 text-burgundy capitalize text-[11px] font-medium">
                      {c}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Categories & Occasions */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-taupe block mb-1.5">
                Core Wardrobe Categories
              </label>
              <div className="flex flex-wrap gap-1.5">
                {editingProfile ? (
                  CATEGORY_OPTIONS.map(cat => (
                    <button
                      key={cat}
                      onClick={() => toggleProfileItem('favorite_categories', cat)}
                      className={`px-2.5 py-1 text-[11px] border capitalize transition-colors ${
                        styleProfile.favorite_categories?.includes(cat)
                          ? 'bg-charcoal text-white border-charcoal'
                          : 'bg-ivory text-charcoal border-taupe-light/60'
                      }`}
                    >
                      {cat}
                    </button>
                  ))
                ) : (
                  styleProfile.favorite_categories?.map(cat => (
                    <span key={cat} className="px-2.5 py-1 bg-ivory border border-taupe-light/70 text-charcoal capitalize text-[11px]">
                      {cat}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-taupe block mb-1.5">
                Frequent Occasions
              </label>
              <div className="flex flex-wrap gap-1.5">
                {editingProfile ? (
                  OCCASION_OPTIONS.map(occ => (
                    <button
                      key={occ}
                      onClick={() => toggleProfileItem('preferred_occasions', occ)}
                      className={`px-2.5 py-1 text-[11px] border capitalize transition-colors ${
                        styleProfile.preferred_occasions?.includes(occ)
                          ? 'bg-charcoal text-white border-charcoal'
                          : 'bg-ivory text-charcoal border-taupe-light/60'
                      }`}
                    >
                      {occ}
                    </button>
                  ))
                ) : (
                  styleProfile.preferred_occasions?.map(occ => (
                    <span key={occ} className="px-2.5 py-1 bg-ivory border border-taupe-light/70 text-charcoal capitalize text-[11px]">
                      {occ}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Column 3: Lifestyle & Budget */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-taupe block mb-1.5">
                Target Budget Range: <span className="font-serif font-bold text-charcoal">{formatINR(styleProfile.budget_max)}</span>
              </label>
              {editingProfile ? (
                <input
                  type="range"
                  min="25"
                  max="350"
                  step="25"
                  value={styleProfile.budget_max}
                  onChange={(e) => setStyleProfile({ ...styleProfile, budget_max: parseFloat(e.target.value) })}
                  className="w-full accent-burgundy"
                />
              ) : (
                <div className="w-full bg-ivory h-2 border border-taupe-light overflow-hidden">
                  <div className="bg-burgundy h-full" style={{ width: `${Math.min(100, (styleProfile.budget_max / 350) * 100)}%` }} />
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-taupe block mb-1.5">
                Lifestyle Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {editingProfile ? (
                  LIFESTYLE_OPTIONS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleProfileItem('lifestyle_tags', tag)}
                      className={`px-2 py-0.5 text-[10px] border transition-colors ${
                        styleProfile.lifestyle_tags?.includes(tag)
                          ? 'bg-charcoal text-white border-charcoal'
                          : 'bg-ivory text-charcoal border-taupe-light/60'
                      }`}
                    >
                      {tag}
                    </button>
                  ))
                ) : (
                  styleProfile.lifestyle_tags?.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-ivory border border-taupe-light/70 text-charcoal text-[10px]">
                      {tag}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Explainability footnote */}
        <div className="mt-6 pt-4 border-t border-taupe-light/50 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-taupe gap-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Profile attributes directly weigh scoring algorithms in Style Studio & Outfit Planner.</span>
          </div>
          <Link
            to="/wardrobe"
            className="text-burgundy font-semibold hover:underline inline-flex items-center gap-1 uppercase tracking-wider text-[10px]"
          >
            <span>View Wardrobe Usage</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </section>

      {/* Interactive Preference Questionnaire Form */}
      <section>
        <PreferenceQuiz
          preferences={preferences}
          onChange={setPreferences}
          onSubmit={() => runRecommendations()}
          onReset={handleReset}
          loading={loading}
        />
      </section>

      {/* Recommended Results Section */}
      <section className="space-y-8 pt-8 border-t border-taupe-light">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="editorial-subheading">Personalized Recommendations</span>
            <h2 className="editorial-heading text-2xl sm:text-3xl mt-1">
              Top Matches for Your Aesthetic
            </h2>
            <p className="text-xs text-taupe-muted font-sans mt-1">
              Ranked in descending order of rule-based score with verified in-stock variants.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCcw}
              onClick={() => runRecommendations()}
              disabled={loading}
            >
              Re-Score Catalog
            </Button>
          </div>
        </div>

        {/* Recommended Products Grid with Match Percentage & Explanation */}
        <ProductGrid
          products={recommendations}
          loading={loading}
          showScore={true}
          emptyTitle="No exact matches found for this specific combination"
          emptyDescription="Try expanding your maximum budget or selecting 'Any Size' to reveal compatible pieces."
          onResetFilters={handleReset}
        />
      </section>
    </div>
  );
}
