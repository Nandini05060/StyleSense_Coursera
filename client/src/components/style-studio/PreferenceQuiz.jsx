import React from 'react';
import { Sparkles, RefreshCcw, Check } from 'lucide-react';
import Button from '../common/Button';
import { formatINR } from '../../utils/formatCurrency';

export default function PreferenceQuiz({
  preferences,
  onChange,
  onSubmit,
  onReset,
  loading = false,
}) {
  const occasions = [
    { id: 'casual', label: 'Casual Daywear', desc: 'Relaxed weekends & effortless day-to-day styling' },
    { id: 'college', label: 'College / Campus', desc: 'Casual knits, breathable cottons & comfortable layers' },
    { id: 'office', label: 'Office & Workwear', desc: 'Structured tailoring, sharp trousers & elegant coats' },
    { id: 'party', label: 'Evening & Party', desc: 'Fluid silks, velvet accents & statement silhouettes' },
    { id: 'festive', label: 'Festive / Formal', desc: 'Refined celebration pieces & evening luxury' },
  ];

  const styles = [
    { id: 'minimalist', label: 'Minimalist', desc: 'Clean geometric lines, monochromatic neutrals, understated luxury' },
    { id: 'streetwear', label: 'Streetwear', desc: 'Modern boxy silhouettes, relaxed outerwear & statement pieces' },
    { id: 'classic', label: 'Classic Elegance', desc: 'Timeless trench coats, polo knits & tailored trousers' },
    { id: 'chic', label: 'Modern Chic', desc: 'Sculptural necklines, bias skirts & contemporary tailoring' },
  ];

  const colorOptions = [
    { name: 'ivory', hex: '#F7F4F0', border: true },
    { name: 'charcoal', hex: '#191817', border: false },
    { name: 'burgundy', hex: '#762D3D', border: false },
    { name: 'beige', hex: '#E5DED5', border: false },
    { name: 'black', hex: '#000000', border: false },
    { name: 'olive', hex: '#556B2F', border: false },
    { name: 'camel', hex: '#C19A6B', border: false },
    { name: 'navy', hex: '#1B263B', border: false },
    { name: 'white', hex: '#FFFFFF', border: true },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const categories = [
    { id: 'all', label: 'All Departments' },
    { id: 'tops', label: 'Tops & Knits' },
    { id: 'bottoms', label: 'Tailored Bottoms' },
    { id: 'dresses', label: 'Dresses & Silks' },
    { id: 'outerwear', label: 'Outerwear & Coats' },
    { id: 'shoes', label: 'Footwear' },
    { id: 'accessories', label: 'Accessories' },
  ];

  const toggleColor = (colorName) => {
    const current = preferences.preferred_colors || [];
    if (current.includes(colorName)) {
      onChange({ ...preferences, preferred_colors: current.filter(c => c !== colorName) });
    } else {
      onChange({ ...preferences, preferred_colors: [...current, colorName] });
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="bg-white border border-taupe-light/70 p-6 sm:p-10 lg:p-12 space-y-10"
    >
      {/* Consultation Step Indicator */}
      <div className="flex items-center justify-between pb-4 border-b border-taupe-light/70">
        <div>
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-taupe font-semibold block">
            FASHION CONSULTATION
          </span>
          <h3 className="font-serif text-2xl text-charcoal font-light mt-0.5">
            Your Personal Wardrobe Profile
          </h3>
        </div>
        <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-burgundy font-semibold">
          100-Point Audit
        </span>
      </div>

      {/* Step 1: Occasion */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal block">
            Step 1 • Target Occasion
          </label>
          <span className="text-[10px] font-sans text-taupe-muted uppercase tracking-wider">Weight: 30 Pts</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {occasions.map((occ) => {
            const selected = preferences.occasion === occ.id;
            return (
              <button
                type="button"
                key={occ.id}
                onClick={() => onChange({ ...preferences, occasion: occ.id })}
                className={`p-4 text-left border transition-all ${
                  selected
                    ? 'border-burgundy bg-burgundy/5'
                    : 'border-taupe-light/80 hover:border-charcoal bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-sans font-semibold uppercase tracking-wider ${selected ? 'text-burgundy' : 'text-charcoal'}`}>
                    {occ.label}
                  </span>
                  {selected && <Check className="w-3.5 h-3.5 text-burgundy" />}
                </div>
                <p className="text-[11px] font-sans text-taupe-dark mt-1 font-light leading-relaxed">{occ.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Style Aesthetic */}
      <div className="space-y-3 pt-6 border-t border-taupe-light/70">
        <div className="flex items-baseline justify-between">
          <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal block">
            Step 2 • Personal Aesthetic
          </label>
          <span className="text-[10px] font-sans text-taupe-muted uppercase tracking-wider">Weight: 25 Pts</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {styles.map((st) => {
            const selected = preferences.style === st.id;
            return (
              <button
                type="button"
                key={st.id}
                onClick={() => onChange({ ...preferences, style: st.id })}
                className={`p-4 text-left border transition-all ${
                  selected
                    ? 'border-burgundy bg-burgundy/5'
                    : 'border-taupe-light/80 hover:border-charcoal bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-sans font-semibold uppercase tracking-wider ${selected ? 'text-burgundy' : 'text-charcoal'}`}>
                    {st.label}
                  </span>
                  {selected && <Check className="w-3.5 h-3.5 text-burgundy" />}
                </div>
                <p className="text-[11px] font-sans text-taupe-dark mt-1 font-light leading-relaxed">{st.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Color Palette & Step 4: Size */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-taupe-light/70">
        {/* Color Palette */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal block">
              Step 3 • Preferred Palette
            </label>
            <span className="text-[10px] font-sans text-taupe-muted uppercase tracking-wider">Weight: 20 Pts</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((c) => {
              const isSelected = (preferences.preferred_colors || []).includes(c.name);
              return (
                <button
                  type="button"
                  key={c.name}
                  onClick={() => toggleColor(c.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-sans capitalize transition-all ${
                    isSelected
                      ? 'border-burgundy bg-burgundy text-white'
                      : 'border-taupe-light/80 bg-white text-charcoal hover:border-charcoal'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred Size */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal block">
              Step 4 • Preferred Size
            </label>
            <span className="text-[10px] font-sans text-taupe-muted uppercase tracking-wider">Inventory Filter</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...preferences, preferred_size: 'all' })}
              className={`px-3.5 py-1.5 text-xs font-sans uppercase border transition-all ${
                preferences.preferred_size === 'all' || !preferences.preferred_size
                  ? 'border-charcoal bg-charcoal text-white font-medium'
                  : 'border-taupe-light/80 bg-white text-charcoal hover:border-charcoal'
              }`}
            >
              Any Size
            </button>
            {sizes.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => onChange({ ...preferences, preferred_size: s })}
                className={`w-11 h-9 flex items-center justify-center text-xs font-sans uppercase border transition-all ${
                  preferences.preferred_size === s
                    ? 'border-burgundy bg-burgundy text-white font-medium'
                    : 'border-taupe-light/80 bg-white text-charcoal hover:border-charcoal'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 5: Budget & Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-taupe-light/70">
        {/* Budget Maximum */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal block">
              Step 5 • Maximum Budget
            </label>
            <span className="font-sans text-sm font-medium text-burgundy">
              {formatINR(preferences.budget_max || 250)}
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="350"
            step="10"
            value={preferences.budget_max || 250}
            onChange={(e) => onChange({ ...preferences, budget_max: parseInt(e.target.value, 10) })}
            className="w-full accent-charcoal cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-taupe-muted font-sans">
            <span>{formatINR(30)}</span>
            <span>{formatINR(180)}</span>
            <span>{formatINR(350)}+</span>
          </div>
        </div>

        {/* Optional Category */}
        <div className="space-y-2">
          <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal block">
            Category Focus (Optional)
          </label>
          <select
            value={preferences.category || 'all'}
            onChange={(e) => onChange({ ...preferences, category: e.target.value })}
            className="w-full bg-white border border-taupe-light/80 px-3.5 py-2 text-xs font-sans focus:outline-none focus:border-charcoal cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="pt-6 border-t border-taupe-light/70 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onReset}
          className="text-[10px] font-sans font-medium uppercase tracking-[0.16em] text-taupe hover:text-charcoal transition-colors flex items-center gap-1.5"
        >
          <RefreshCcw className="w-3 h-3" />
          <span>Reset to Default Preferences</span>
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto editorial-btn-primary px-8 py-3.5 text-xs font-semibold tracking-[0.2em] uppercase flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-burgundy-200" />
          <span>Run StyleSense Recommendation Engine</span>
        </button>
      </div>
    </form>
  );
}
