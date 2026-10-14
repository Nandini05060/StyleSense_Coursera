import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Check, Save, Ruler, ArrowRight, Info, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const CATEGORIES = [
  { key: 'tops', label: 'Tops & Shirts', icon: '👔' },
  { key: 'bottoms', label: 'Trousers & Denim', icon: '👖' },
  { key: 'dresses', label: 'Dresses & Tailoring', icon: '👗' },
  { key: 'outerwear', label: 'Coats & Blazers', icon: '🧥' },
  { key: 'shoes', label: 'Footwear & Boots', icon: '👞' },
];

export default function FitFinder() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('tops');

  // Body profile state
  const [unit, setUnit] = useState('in'); // 'in' or 'cm'
  const [height, setHeight] = useState('170');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [weight, setWeight] = useState('65');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [chest, setChest] = useState('38');
  const [waist, setWaist] = useState('31');
  const [hips, setHips] = useState('39');
  const [footLength, setFootLength] = useState('10.0');
  const [shoeSize, setShoeSize] = useState('UK 7');
  const [shoeSizeSystem, setShoeSizeSystem] = useState('UK');
  const [preferredFit, setPreferredFit] = useState('regular');
  const [usualBrandSizes, setUsualBrandSizes] = useState({
    Zara: 'M',
    'H&M': 'M',
    Uniqlo: 'M',
    Nike: 'UK 7',
    "Levi's": '31',
  });
  const [notes, setNotes] = useState('');

  // Evaluation result state per active category
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.getFitPreferences();
        if (res.success && res.data) {
          const p = res.data;
          setUnit(p.measurement_unit || 'in');
          if (p.height) setHeight(String(p.height));
          if (p.height_unit) setHeightUnit(p.height_unit);
          if (p.weight) setWeight(String(p.weight));
          if (p.weight_unit) setWeightUnit(p.weight_unit);
          if (p.chest) setChest(String(p.chest));
          if (p.waist) setWaist(String(p.waist));
          if (p.hips) setHips(String(p.hips));
          if (p.foot_length) setFootLength(String(p.foot_length));
          if (p.shoe_size) setShoeSize(p.shoe_size);
          if (p.shoe_size_system) setShoeSizeSystem(p.shoe_size_system);
          if (p.preferred_fit) setPreferredFit(p.preferred_fit);
          if (p.usual_brand_sizes && Object.keys(p.usual_brand_sizes).length > 0) {
            setUsualBrandSizes(prev => ({ ...prev, ...p.usual_brand_sizes }));
          }
          if (p.notes) setNotes(p.notes);

          // Evaluate fit for initial category
          runEvaluation('tops', p);
        }
      } catch (err) {
        console.warn('Could not load preferences:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const runEvaluation = async (categoryKey, profileOverride = null) => {
    try {
      setEvaluating(true);
      const res = await api.evaluateFit({
        category: categoryKey,
        chest: profileOverride?.chest ? parseFloat(profileOverride.chest) : (chest ? parseFloat(chest) : null),
        waist: profileOverride?.waist ? parseFloat(profileOverride.waist) : (waist ? parseFloat(waist) : null),
        hips: profileOverride?.hips ? parseFloat(profileOverride.hips) : (hips ? parseFloat(hips) : null),
        foot_length: profileOverride?.foot_length ? parseFloat(profileOverride.foot_length) : (footLength ? parseFloat(footLength) : null),
        shoe_size: profileOverride?.shoe_size || shoeSize,
        shoe_size_system: profileOverride?.shoe_size_system || shoeSizeSystem,
        preferred_fit: profileOverride?.preferred_fit || preferredFit,
        usual_brand_sizes: profileOverride?.usual_brand_sizes || usualBrandSizes,
        measurement_unit: profileOverride?.measurement_unit || unit,
      });

      if (res.success) {
        setEvaluation(res.data);
      }
    } catch (err) {
      console.warn('Evaluation failed:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleCategorySwitch = (catKey) => {
    setActiveCategory(catKey);
    runEvaluation(catKey);
  };

  const handleUnitToggle = (newUnit) => {
    if (newUnit === unit) return;
    setUnit(newUnit);
    if (newUnit === 'cm') {
      if (chest) setChest((parseFloat(chest) * 2.54).toFixed(1));
      if (waist) setWaist((parseFloat(waist) * 2.54).toFixed(1));
      if (hips) setHips((parseFloat(hips) * 2.54).toFixed(1));
      if (footLength) setFootLength((parseFloat(footLength) * 2.54).toFixed(1));
    } else {
      if (chest) setChest((parseFloat(chest) / 2.54).toFixed(1));
      if (waist) setWaist((parseFloat(waist) / 2.54).toFixed(1));
      if (hips) setHips((parseFloat(hips) / 2.54).toFixed(1));
      if (footLength) setFootLength((parseFloat(footLength) / 2.54).toFixed(1));
    }
  };

  const handleBrandSizeChange = (brand, val) => {
    setUsualBrandSizes(prev => ({
      ...prev,
      [brand]: val
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const payload = {
        height: height ? parseFloat(height) : null,
        height_unit: heightUnit,
        weight: weight ? parseFloat(weight) : null,
        weight_unit: weightUnit,
        chest: chest ? parseFloat(chest) : null,
        waist: waist ? parseFloat(waist) : null,
        hips: hips ? parseFloat(hips) : null,
        foot_length: footLength ? parseFloat(footLength) : null,
        measurement_unit: unit,
        shoe_size: shoeSize,
        shoe_size_system: shoeSizeSystem,
        preferred_fit: preferredFit,
        usual_brand_sizes: usualBrandSizes,
        notes,
      };

      const res = await api.updateFitPreferences(payload);
      if (res.success) {
        showToast('Fit profile saved to your account.', 'success');
        runEvaluation(activeCategory, payload);
      } else {
        showToast(res.message || 'Failed to save profile.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to persist fit preferences.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const matchBadgeColor =
    evaluation?.match_level === 'Good data match'
      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
      : evaluation?.match_level === 'Partial data match'
      ? 'bg-amber-50 text-amber-900 border-amber-200'
      : 'bg-taupe-light/50 text-charcoal border-taupe-light';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Editorial Header */}
      <div className="border-b border-taupe-light/80 pb-8 space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-burgundy font-semibold">
            Bespoke Sizing Intelligence
          </span>
          <span className="text-taupe-muted text-xs">•</span>
          <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-taupe">
            Precision Pattern Matching
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl text-charcoal font-light tracking-tight leading-tight">
          Fit Finder & Size Atelier
        </h1>
        <p className="font-sans text-xs sm:text-sm text-taupe-dark max-w-2xl font-light leading-relaxed">
          Calibrate your body measurements once. StyleSense dynamically maps your proportions across luxury silhouettes, tailoring cuts, and European footwear lasts with zero ambiguity.
        </p>
      </div>

      {/* Main 2-Column Split: Calibration Form (Left) & Sizing Dossier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Body Profile & Calibration */}
        <div className="lg:col-span-5 bg-white border border-taupe-light p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-taupe-light/60 pb-4">
            <h2 className="font-serif text-xl sm:text-2xl text-charcoal font-light">
              Your Proportions
            </h2>
            {/* Unit switch */}
            <div className="flex items-center gap-1 bg-ivory-warm p-1 border border-taupe-light/70">
              <button
                type="button"
                onClick={() => handleUnitToggle('in')}
                className={`px-3 py-1 text-xs font-sans font-medium transition-colors ${
                  unit === 'in' ? 'bg-charcoal text-white' : 'text-taupe hover:text-charcoal'
                }`}
              >
                Inches
              </button>
              <button
                type="button"
                onClick={() => handleUnitToggle('cm')}
                className={`px-3 py-1 text-xs font-sans font-medium transition-colors ${
                  unit === 'cm' ? 'bg-charcoal text-white' : 'text-taupe hover:text-charcoal'
                }`}
              >
                CM
              </button>
            </div>
          </div>

          {/* Primary Body Measurements */}
          <div className="space-y-4">
            <span className="text-[10px] font-sans uppercase tracking-[0.16em] text-taupe font-semibold block">
              Core Body Dimensions ({unit})
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-sans uppercase tracking-[0.12em] text-taupe mb-1">
                  Chest / Bust
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                  className="w-full text-xs font-sans px-3 py-2 border border-taupe-light bg-ivory/40 focus:bg-white focus:border-charcoal focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-sans uppercase tracking-[0.12em] text-taupe mb-1">
                  Waist
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  className="w-full text-xs font-sans px-3 py-2 border border-taupe-light bg-ivory/40 focus:bg-white focus:border-charcoal focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-sans uppercase tracking-[0.12em] text-taupe mb-1">
                  Hips
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={hips}
                  onChange={(e) => setHips(e.target.value)}
                  className="w-full text-xs font-sans px-3 py-2 border border-taupe-light bg-ivory/40 focus:bg-white focus:border-charcoal focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-sans uppercase tracking-[0.12em] text-taupe mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full text-xs font-sans px-3 py-2 border border-taupe-light bg-ivory/40 focus:bg-white focus:border-charcoal focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-sans uppercase tracking-[0.12em] text-taupe mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full text-xs font-sans px-3 py-2 border border-taupe-light bg-ivory/40 focus:bg-white focus:border-charcoal focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footwear Metrics */}
          <div className="space-y-4 pt-2 border-t border-taupe-light/60">
            <span className="text-[10px] font-sans uppercase tracking-[0.16em] text-taupe font-semibold block">
              Footwear Dimensions
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-sans uppercase tracking-[0.12em] text-taupe mb-1">
                  Foot Length ({unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={footLength}
                  onChange={(e) => setFootLength(e.target.value)}
                  className="w-full text-xs font-sans px-3 py-2 border border-taupe-light bg-ivory/40 focus:bg-white focus:border-charcoal focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-sans uppercase tracking-[0.12em] text-taupe mb-1">
                  Usual Shoe Size
                </label>
                <select
                  value={shoeSize}
                  onChange={(e) => setShoeSize(e.target.value)}
                  className="w-full text-xs font-sans px-3 py-2 border border-taupe-light bg-ivory/40 focus:bg-white focus:border-charcoal focus:outline-none"
                >
                  <option value="UK 5">UK 5 (EU 39 / US 6.5)</option>
                  <option value="UK 6">UK 6 (EU 40 / US 7)</option>
                  <option value="UK 7">UK 7 (EU 41 / US 8)</option>
                  <option value="UK 8">UK 8 (EU 42 / US 9)</option>
                  <option value="UK 9">UK 9 (EU 43 / US 10)</option>
                  <option value="UK 10">UK 10 (EU 44 / US 11)</option>
                  <option value="UK 11">UK 11 (EU 45 / US 12)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preferred Drape / Silhouette */}
          <div className="space-y-3 pt-2 border-t border-taupe-light/60">
            <span className="text-[10px] font-sans uppercase tracking-[0.16em] text-taupe font-semibold block">
              Silhouette Drape Preference
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'tight', title: 'Tight / Fitted', desc: 'Contoured tailoring' },
                { id: 'regular', title: 'Regular / Classic', desc: 'Balanced comfortable ease' },
                { id: 'relaxed', title: 'Relaxed / Easy', desc: 'Generous fluid lines' },
                { id: 'oversized', title: 'Oversized / Editorial', desc: 'Deliberate boxy volume' },
              ].map((fit) => (
                <button
                  type="button"
                  key={fit.id}
                  onClick={() => setPreferredFit(fit.id)}
                  className={`p-3 text-left border transition-all ${
                    preferredFit === fit.id
                      ? 'border-burgundy bg-burgundy/5 ring-1 ring-burgundy'
                      : 'border-taupe-light/70 bg-white hover:border-charcoal'
                  }`}
                >
                  <span className="block text-xs font-sans font-medium text-charcoal">
                    {fit.title}
                  </span>
                  <span className="block text-[10px] font-sans text-taupe mt-0.5">
                    {fit.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Brand Benchmarks */}
          <div className="space-y-3 pt-2 border-t border-taupe-light/60">
            <span className="text-[10px] font-sans uppercase tracking-[0.16em] text-taupe font-semibold block">
              Usual Sizing in Benchmark Brands
            </span>
            <div className="grid grid-cols-3 gap-2">
              {['Zara', 'H&M', 'Uniqlo', 'Nike', "Levi's"].map((b) => (
                <div key={b}>
                  <label className="block text-[10px] font-sans text-taupe mb-0.5">{b}</label>
                  <input
                    type="text"
                    value={usualBrandSizes[b] || ''}
                    onChange={(e) => handleBrandSizeChange(b, e.target.value)}
                    placeholder="e.g. M / 32"
                    className="w-full text-xs font-sans px-2.5 py-1.5 border border-taupe-light bg-ivory/30 focus:bg-white focus:border-charcoal focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => runEvaluation(activeCategory)}
              disabled={evaluating}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
              <span>Recalculate</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </Button>
          </div>
        </div>

        {/* Right Column: Dynamic Category Sizing Dossier */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-taupe-light/80 pb-3">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.key;
              return (
                <button
                  type="button"
                  key={cat.key}
                  onClick={() => handleCategorySwitch(cat.key)}
                  className={`px-4 py-2 text-xs font-sans uppercase tracking-[0.16em] border transition-all flex items-center gap-2 ${
                    isActive
                      ? 'border-charcoal bg-charcoal text-white font-medium shadow-sm'
                      : 'border-taupe-light/80 bg-white text-charcoal hover:border-charcoal'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Evaluation Verdict Hero Card */}
          {evaluation && (
            <div className="bg-white border border-taupe-light p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-taupe-light/60 pb-6">
                <div>
                  <span className="text-[10px] font-sans uppercase tracking-[0.24em] text-burgundy font-semibold">
                    Optimal Pattern Recommendation
                  </span>
                  <div className="flex items-baseline gap-4 mt-1">
                    <span className="font-serif text-5xl text-charcoal font-semibold tracking-tight">
                      {evaluation.recommended_size}
                    </span>
                    <span className="text-xs font-sans uppercase tracking-[0.14em] text-taupe">
                      {CATEGORIES.find(c => c.key === activeCategory)?.label}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans uppercase tracking-[0.16em] font-semibold border ${matchBadgeColor}`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {evaluation.match_level}
                  </span>
                  <span className="text-[11px] font-sans text-taupe mt-1.5">
                    Confidence Score: {evaluation.confidence_score}%
                  </span>
                </div>
              </div>

              {/* Transparent Narrative Explanation */}
              <div className="space-y-2">
                <span className="text-[10px] font-sans uppercase tracking-[0.16em] text-taupe font-semibold block">
                  Tailoring & Fit Assessment
                </span>
                <p className="font-sans text-sm text-charcoal font-light leading-relaxed">
                  {evaluation.fit_narrative}
                </p>
                {evaluation.fit_advice && (
                  <p className="font-sans text-xs text-taupe-dark italic bg-ivory-warm/70 p-3 border border-taupe-light/60">
                    "{evaluation.fit_advice}"
                  </p>
                )}
              </div>

              {/* Dimension Differences */}
              {evaluation.dimension_comparisons?.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-sans uppercase tracking-[0.16em] text-taupe font-semibold block">
                    Calculated Room vs Garment Spec
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {evaluation.dimension_comparisons.map((dim, idx) => (
                      <div
                        key={idx}
                        className="bg-ivory border border-taupe-light/80 p-3 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-sans text-xs font-medium text-charcoal block">
                            {dim.dimension}
                          </span>
                          <span className="font-sans text-[11px] text-taupe">
                            Body: {dim.user_value} • Pattern: {dim.recommended_spec}
                          </span>
                        </div>
                        <span className="text-xs font-sans font-medium text-burgundy bg-burgundy/5 px-2 py-1 border border-burgundy/15">
                          {dim.difference}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizing Chart Table for Category */}
              {evaluation.size_chart && evaluation.size_chart.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-taupe-light/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans uppercase tracking-[0.16em] text-taupe font-semibold">
                      Complete Pattern Chart ({unit})
                    </span>
                    <span className="text-[10px] font-sans text-burgundy font-medium">
                      ★ Highlighted row: Your recommended size
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-taupe-light/80">
                    <table className="w-full text-left border-collapse text-xs font-sans">
                      <thead>
                        <tr className="bg-ivory-warm border-b border-taupe-light/80 text-[10px] uppercase tracking-[0.12em] text-taupe font-semibold">
                          <th className="py-2.5 px-3">Size</th>
                          {Object.keys(evaluation.size_chart[0])
                            .filter(k => k !== 'size')
                            .map(k => (
                              <th key={k} className="py-2.5 px-3 capitalize">
                                {k.replace(/_/g, ' ')}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-taupe-light/60 bg-white">
                        {evaluation.size_chart.map((row, idx) => {
                          const isRecommended = row.size === evaluation.recommended_size;
                          return (
                            <tr
                              key={idx}
                              className={`transition-colors ${
                                isRecommended
                                  ? 'bg-burgundy/5 font-semibold text-charcoal'
                                  : 'hover:bg-ivory/50 text-taupe-dark'
                              }`}
                            >
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-1.5">
                                  <span>{row.size}</span>
                                  {isRecommended && (
                                    <span className="text-[9px] bg-burgundy text-white px-1.5 py-0.2 uppercase font-medium">
                                      Match
                                    </span>
                                  )}
                                </div>
                              </td>
                              {Object.keys(row)
                                .filter(k => k !== 'size')
                                .map(k => (
                                  <td key={k} className="py-2.5 px-3">
                                    {row[k]}
                                  </td>
                                ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
