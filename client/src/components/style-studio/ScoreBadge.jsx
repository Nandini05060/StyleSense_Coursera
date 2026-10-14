import React from 'react';
import { Sparkles, Check, X, AlertTriangle } from 'lucide-react';

export default function ScoreBadge({ score, matchDetails = null, compact = false }) {
  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-burgundy text-white text-xs font-bold uppercase tracking-wider">
        <Sparkles className="w-3 h-3 text-burgundy-200" />
        <span>{score}% Match</span>
      </span>
    );
  }

  const rubricItems = matchDetails ? [
    { label: 'Occasion Fit', points: matchDetails.occasion?.points ?? 0, max: 30, matched: matchDetails.occasion?.matched },
    { label: 'Style Aesthetic', points: matchDetails.style?.points ?? 0, max: 25, matched: matchDetails.style?.matched },
    { label: 'Color Palette', points: matchDetails.color?.points ?? 0, max: 20, matched: matchDetails.color?.matched },
    { label: 'Budget Fit', points: matchDetails.budget?.points ?? 0, max: 15, matched: matchDetails.budget?.matched || (matchDetails.budget?.points > 0) },
    { label: 'Category Focus', points: matchDetails.category?.points ?? 0, max: 10, matched: matchDetails.category?.matched },
  ] : [];

  return (
    <div className="bg-ivory border border-taupe-light p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="editorial-subheading">AI Recommendation Score</span>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-burgundy text-white text-sm font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{score} / 100</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-taupe-light/70 h-2 overflow-hidden">
        <div
          className="bg-burgundy h-full transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>

      {/* Detailed rubric point breakdown */}
      {matchDetails && (
        <div className="pt-2 border-t border-taupe-light/60 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          {rubricItems.map((item, i) => (
            <div key={i} className="bg-white p-2 border border-taupe-light/40 flex flex-col items-center justify-center">
              <span className="text-[10px] text-taupe-muted uppercase font-sans tracking-wider block">
                {item.label}
              </span>
              <span className={`text-xs font-bold font-sans mt-0.5 ${item.points > 0 ? 'text-charcoal' : 'text-taupe-muted'}`}>
                +{item.points} <span className="text-[10px] text-taupe font-normal">/ {item.max}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
