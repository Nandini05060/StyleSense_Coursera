import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Sparkles, AlertCircle, ArrowLeft, Globe, Lock, Share2, Layers } from 'lucide-react';
import { api } from '../services/api';
import { formatINR } from '../utils/formatCurrency';
import Button from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';

export default function SharedLookbook() {
  const { token } = useParams();
  const [lookbook, setLookbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchShared() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getSharedLookbook(token);
        if (res.success && res.data) {
          setLookbook(res.data);
        } else {
          setError(res.message || 'Lookbook not available.');
        }
      } catch (err) {
        setError(err.message || 'This lookbook could not be retrieved.');
      } finally {
        setLoading(false);
      }
    }
    fetchShared();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [token]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !lookbook) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-burgundy mx-auto" />
        <h2 className="font-serif text-3xl text-charcoal font-light">Lookbook Unavailable</h2>
        <p className="font-sans text-xs text-taupe max-w-sm mx-auto leading-relaxed">
          {error || 'This curated capsule may be private or has been unlisted by its curator.'}
        </p>
        <Link to="/">
          <Button variant="primary" size="sm" className="mt-2">
            Explore StyleSense AI
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      {/* Top Editorial Bar */}
      <div className="border-b border-taupe-light/70 bg-white/60 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-serif text-xl font-light text-charcoal group-hover:text-burgundy transition-colors">
              StyleSense
            </span>
            <span className="font-sans text-[8px] uppercase tracking-[0.24em] text-taupe font-semibold">
              EDITORIAL
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-sans uppercase tracking-[0.16em] text-taupe">
              Curated Capsule Collection
            </span>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Curate Yours
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
        {/* Magazine Cover Hero Banner */}
        <div className="relative aspect-[16/7] w-full bg-charcoal overflow-hidden shadow-lg border border-taupe-light">
          <img
            src={lookbook.cover_image_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80'}
            alt={lookbook.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />

          <div className="absolute bottom-6 sm:bottom-12 left-6 sm:left-12 right-6 sm:right-12 text-white space-y-3">
            <div className="flex items-center gap-3">
              <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-sans uppercase tracking-[0.2em] font-medium border border-white/30">
                {lookbook.theme || 'Editorial Capsule'}
              </span>
              <span className="text-xs font-sans text-white/70">
                Curated by <span className="text-white font-medium">{lookbook.curator_name}</span>
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white leading-tight">
              {lookbook.title}
            </h1>

            {lookbook.description && (
              <p className="font-sans text-xs sm:text-sm text-white/90 max-w-2xl font-light leading-relaxed">
                {lookbook.description}
              </p>
            )}
          </div>
        </div>

        {/* Curated Ensembles Spread */}
        <div className="space-y-8">
          <div className="border-b border-taupe-light/70 pb-4 flex items-center justify-between">
            <span className="text-[10px] font-sans uppercase tracking-[0.24em] text-burgundy font-semibold flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              Signature Ensembles ({lookbook.outfits?.length || 0})
            </span>
            <span className="text-xs font-sans text-taupe">
              All garments curated from StyleSense AI catalog & personal atelier
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {lookbook.outfits?.map((outfit, idx) => (
              <div
                key={outfit.id || idx}
                className="bg-white border border-taupe-light p-6 sm:p-8 space-y-6 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-burgundy font-semibold">
                      Ensemble {idx + 1} • {outfit.occasion}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl text-charcoal font-light">
                    {outfit.name}
                  </h3>
                  {outfit.curator_note && (
                    <p className="font-sans text-xs text-taupe-dark italic bg-ivory-warm/60 p-3.5 border border-taupe-light/60 leading-relaxed">
                      "{outfit.curator_note}"
                    </p>
                  )}
                </div>

                {/* Garment Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {outfit.items?.map((item) => (
                    <div
                      key={item.id}
                      className="bg-ivory border border-taupe-light/70 p-2.5 space-y-2 flex flex-col justify-between text-xs font-sans group"
                    >
                      <div className="aspect-square w-full bg-white overflow-hidden relative">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <span className="absolute bottom-1 left-1 bg-charcoal/80 text-white text-[8px] font-sans uppercase px-1.5 py-0.5 tracking-[0.14em]">
                          {item.slot_name}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-taupe block uppercase tracking-[0.1em] truncate">
                          {item.brand}
                        </span>
                        <span className="font-medium text-charcoal block line-clamp-1">
                          {item.name}
                        </span>
                        <span className="text-xs text-charcoal font-semibold block pt-0.5">
                          {formatINR(item.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Manifesto & CTA */}
        <div className="bg-charcoal text-white p-8 sm:p-12 text-center space-y-4 border border-taupe-dark">
          <span className="text-[10px] font-sans uppercase tracking-[0.28em] text-burgundy-light font-semibold block">
            Digital Wardrobe Intelligence
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-light">
            Craft Your Own Fashion Portfolio
          </h2>
          <p className="font-sans text-xs sm:text-sm text-white/70 max-w-lg mx-auto font-light leading-relaxed">
            StyleSense AI pairs your physical digital wardrobe with intelligent recommendations, rule-based compatibility scoring, and bespoke capsule curation.
          </p>
          <div className="pt-2">
            <Link to="/register">
              <Button variant="primary" size="md">
                Get Started on StyleSense
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
