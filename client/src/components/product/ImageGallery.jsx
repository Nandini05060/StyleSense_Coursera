import React, { useState } from 'react';

export default function ImageGallery({ images = [], productName = 'Product' }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hasError, setHasError] = useState({});

  const validImages = images.filter(Boolean);
  const activeImage = validImages[selectedIndex] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80';

  const handleImageError = (idx) => {
    setHasError(prev => ({ ...prev, [idx]: true }));
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[580px] pb-2 md:pb-0 scrollbar-none">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 overflow-hidden border transition-all ${
                selectedIndex === idx
                  ? 'border-burgundy ring-1 ring-burgundy'
                  : 'border-taupe-light hover:border-taupe'
              }`}
              aria-label={`Select product image ${idx + 1}`}
            >
              <img
                src={hasError[idx] ? 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=200&q=80' : img}
                alt={`${productName} thumbnail ${idx + 1}`}
                onError={() => handleImageError(idx)}
                className="w-full h-full object-cover object-top"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Large Image */}
      <div className="relative flex-1 aspect-[3/4] bg-ivory overflow-hidden border border-taupe-light/60 group">
        <img
          src={activeImage}
          alt={productName}
          onError={() => handleImageError(selectedIndex)}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-sans font-bold uppercase tracking-widest text-charcoal border border-taupe-light/50">
          Editorial Close-Up
        </div>
      </div>
    </div>
  );
}
