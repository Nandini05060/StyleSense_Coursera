import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Sparkles, Check, AlertCircle, Info, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import Button from '../common/Button';

export default function FitAssistantModal({
  isOpen,
  onClose,
  product,
  currentSelectedSize,
  onSelectSize,
}) {
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState('in'); // 'in' or 'cm'
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [preferredFit, setPreferredFit] = useState('regular');
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState(null);

  // Fetch saved preferences on modal open
  useEffect(() => {
    if (!isOpen) return;

    async function loadSavedProfile() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getFitPreferences();
        if (res.success && res.data) {
          const profile = res.data;
          setUnit(profile.measurement_unit || 'in');
          if (profile.chest) setChest(profile.chest);
          if (profile.waist) setWaist(profile.waist);
          if (profile.hips) setHips(profile.hips);
          if (profile.preferred_fit) setPreferredFit(profile.preferred_fit);

          // Trigger initial evaluation
          const evalRes = await api.evaluateFit({
            product_id: product?.id,
            category: product?.category_name,
            chest: profile.chest,
            waist: profile.waist,
            hips: profile.hips,
            preferred_fit: profile.preferred_fit || 'regular',
            measurement_unit: profile.measurement_unit || 'in'
          });

          if (evalRes.success) {
            setEvaluation(evalRes.data);
          }
        }
      } catch (err) {
        console.warn('Could not load fit profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSavedProfile();
  }, [isOpen, product]);

  const handleRecalculate = async (overrideFit = null, overrideUnit = null) => {
    try {
      setLoading(true);
      setError(null);
      const activeUnit = overrideUnit || unit;
      const activeFit = overrideFit || preferredFit;

      const evalRes = await api.evaluateFit({
        product_id: product?.id,
        category: product?.category_name,
        chest: chest ? parseFloat(chest) : null,
        waist: waist ? parseFloat(waist) : null,
        hips: hips ? parseFloat(hips) : null,
        preferred_fit: activeFit,
        measurement_unit: activeUnit,
      });

      if (evalRes.success) {
        setEvaluation(evalRes.data);
      } else {
        setError('Unable to evaluate size at this time.');
      }
    } catch (err) {
      setError(err.message || 'Evaluation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnitToggle = (newUnit) => {
    if (newUnit === unit) return;
    setUnit(newUnit);
    // Convert values
    if (newUnit === 'cm') {
      if (chest) setChest((parseFloat(chest) * 2.54).toFixed(1));
      if (waist) setWaist((parseFloat(waist) * 2.54).toFixed(1));
      if (hips) setHips((parseFloat(hips) * 2.54).toFixed(1));
    } else {
      if (chest) setChest((parseFloat(chest) / 2.54).toFixed(1));
      if (waist) setWaist((parseFloat(waist) / 2.54).toFixed(1));
      if (hips) setHips((parseFloat(hips) / 2.54).toFixed(1));
    }
    handleRecalculate(preferredFit, newUnit);
  };

  const handleFitChange = (fit) => {
    setPreferredFit(fit);
    handleRecalculate(fit, unit);
  };

  const handleApplyRecommendedSize = () => {
    if (evaluation?.recommended_size) {
      onSelectSize(evaluation.recommended_size);
      onClose();
    }
  };

  if (!isOpen) return null;

  const matchBadgeColor =
    evaluation?.match_level === 'Good data match'
      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
      : evaluation?.match_level === 'Partial data match'
      ? 'bg-amber-50 text-amber-900 border-amber-200'
      : 'bg-taupe-light/50 text-charcoal border-taupe-light';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fit-assistant-title"
    >
      <div className="relative bg-ivory border border-taupe-light max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-taupe-light/70 pb-4">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-burgundy font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Sizing Intelligence
            </span>
            <h2 id="fit-assistant-title" className="font-serif text-2xl sm:text-3xl text-charcoal font-light mt-1">
              Garment Fit Assistant
            </h2>
            {product && (
              <p className="font-sans text-xs text-taupe mt-0.5">
                Evaluating fit for <span className="font-medium text-charcoal">{product.name}</span> ({product.category_name})
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-taupe hover:text-charcoal transition-colors rounded-sm"
            aria-label="Close fit assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Units & Quick Body Measurements Input */}
        <div className="bg-white border border-taupe-light/80 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[10px] uppercase tracking-[0.16em] text-charcoal font-semibold">
              Your Measurements
            </span>
            <div className="flex items-center gap-1 bg-ivory-warm p-0.5 border border-taupe-light/70">
              <button
                type="button"
                onClick={() => handleUnitToggle('in')}
                className={`px-2.5 py-1 text-[11px] font-sans font-medium transition-colors ${
                  unit === 'in' ? 'bg-charcoal text-white' : 'text-taupe hover:text-charcoal'
                }`}
              >
                Inches
              </button>
              <button
                type="button"
                onClick={() => handleUnitToggle('cm')}
                className={`px-2.5 py-1 text-[11px] font-sans font-medium transition-colors ${
                  unit === 'cm' ? 'bg-charcoal text-white' : 'text-taupe hover:text-charcoal'
                }`}
              >
                Centimeters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-[0.12em] text-taupe mb-1">
                Chest / Bust ({unit})
              </label>
              <input
                type="number"
                step="0.5"
                placeholder={unit === 'in' ? '38.0' : '96.5'}
                value={chest}
                onChange={(e) => setChest(e.target.value)}
                onBlur={() => handleRecalculate()}
                className="w-full text-xs font-sans px-3 py-2 border border-taupe-light bg-ivory/50 focus:bg-white focus:border-charcoal focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-[0.12em] text-taupe mb-1">
                Waist ({unit})
              </label>
              <input
                type="number"
                step="0.5"
                placeholder={unit === 'in' ? '31.0' : '78.5'}
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                onBlur={() => handleRecalculate()}
                className="w-full text-xs font-sans px-3 py-2 border border-taupe-light bg-ivory/50 focus:bg-white focus:border-charcoal focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-[0.12em] text-taupe mb-1">
                Hips ({unit})
              </label>
              <input
                type="number"
                step="0.5"
                placeholder={unit === 'in' ? '39.0' : '99.0'}
                value={hips}
                onChange={(e) => setHips(e.target.value)}
                onBlur={() => handleRecalculate()}
                className="w-full text-xs font-sans px-3 py-2 border border-taupe-light bg-ivory/50 focus:bg-white focus:border-charcoal focus:outline-none"
              />
            </div>
          </div>

          {/* Preferred Fit Toggle */}
          <div className="space-y-1.5 pt-1">
            <span className="block text-[10px] font-sans uppercase tracking-[0.14em] text-taupe">
              Silhouette Drape Preference
            </span>
            <div className="grid grid-cols-4 gap-2">
              {['tight', 'regular', 'relaxed', 'oversized'].map((fit) => (
                <button
                  type="button"
                  key={fit}
                  onClick={() => handleFitChange(fit)}
                  className={`py-1.5 px-2 text-[11px] font-sans capitalize border text-center transition-all ${
                    preferredFit === fit
                      ? 'border-burgundy bg-burgundy text-white font-medium shadow-sm'
                      : 'border-taupe-light/80 bg-white text-taupe-dark hover:border-charcoal'
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Evaluation Result Showcase */}
        {evaluation && (
          <div className="bg-ivory-warm/60 border border-taupe-light p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-taupe-light/60 pb-4">
              <div>
                <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-taupe">
                  Recommended Size
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="font-serif text-4xl text-charcoal font-semibold tracking-tight">
                    {evaluation.recommended_size}
                  </span>
                  {evaluation.is_in_stock ? (
                    <span className="text-xs font-sans text-emerald-800 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> In Stock
                    </span>
                  ) : (
                    <span className="text-xs font-sans text-burgundy font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Currently Sold Out
                    </span>
                  )}
                </div>
              </div>

              {/* Match Quality Badge */}
              <div className="flex flex-col sm:items-end">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-sans uppercase tracking-[0.14em] font-semibold border ${matchBadgeColor}`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {evaluation.match_level}
                </span>
                <span className="text-[10px] font-sans text-taupe mt-1">
                  Confidence Score: {evaluation.confidence_score}%
                </span>
              </div>
            </div>

            {/* Transparent Narrative Explanation */}
            <p className="font-sans text-xs text-charcoal leading-relaxed font-light">
              {evaluation.fit_narrative}
            </p>

            {/* Transparent Dimension Comparison Details */}
            {evaluation.dimension_comparisons?.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-sans uppercase tracking-[0.16em] text-taupe font-semibold">
                  Dimension Comparison vs Pattern Spec
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {evaluation.dimension_comparisons.map((dim, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-taupe-light/70 p-2.5 flex items-center justify-between text-xs font-sans"
                    >
                      <div>
                        <span className="font-medium text-charcoal block">{dim.dimension}</span>
                        <span className="text-[11px] text-taupe">
                          Body: {dim.user_value} | Spec: {dim.recommended_spec}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-burgundy px-1.5 py-0.5 bg-burgundy/5 border border-burgundy/15">
                        {dim.difference}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {evaluation.fit_advice && (
              <div className="text-[11px] font-sans text-taupe-dark flex items-start gap-1.5 bg-white/70 p-2.5 border border-taupe-light/60">
                <Info className="w-4 h-4 text-burgundy shrink-0 mt-0.5" />
                <span>{evaluation.fit_advice}</span>
              </div>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Link
            to="/fit-finder"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-sans text-taupe-dark hover:text-burgundy transition-colors uppercase tracking-[0.14em]"
          >
            <span>Calibrate Full Fit Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={onClose} className="w-1/2 sm:w-auto">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApplyRecommendedSize}
              disabled={!evaluation?.recommended_size || !evaluation?.is_in_stock}
              className="w-1/2 sm:w-auto"
            >
              Apply Size {evaluation?.recommended_size || ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
