import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Share2,
  Printer,
  Trash2,
  Edit3,
  ExternalLink,
  Lock,
  Globe,
  Sparkles,
  ShoppingBag,
  Layers,
  ArrowRight,
  Check,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/formatCurrency';
import Button from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';

export default function Lookbook() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [lookbooks, setLookbooks] = useState([]);
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [selectedLookbook, setSelectedLookbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTheme, setFormTheme] = useState('Minimalist Capsule');
  const [formCoverImage, setFormCoverImage] = useState('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=80');
  const [formIsPublic, setFormIsPublic] = useState(true);
  const [formOutfitIds, setFormOutfitIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lbRes, ofRes] = await Promise.all([
        api.getLookbooks(),
        api.getSavedOutfits()
      ]);

      if (lbRes.success && lbRes.data) {
        setLookbooks(lbRes.data);
        if (lbRes.data.length > 0 && !selectedLookbook) {
          // Load full detail of first lookbook
          loadLookbookDetail(lbRes.data[0].id);
        }
      }
      if (ofRes.success && ofRes.data) {
        setSavedOutfits(ofRes.data);
      }
    } catch (err) {
      console.warn('Failed to load lookbooks:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLookbookDetail = async (id) => {
    try {
      const res = await api.getLookbookById(id);
      if (res.success && res.data) {
        setSelectedLookbook(res.data);
      }
    } catch (err) {
      showToast('Failed to load lookbook details.', 'error');
    }
  };

  const handleCopyShareLink = (token) => {
    const url = `${window.location.origin}/lookbook/shared/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(true);
    showToast('Public lookbook link copied to clipboard.', 'success');
    setTimeout(() => setCopiedToken(false), 3000);
  };

  const handlePrintPortfolio = () => {
    window.print();
  };

  const handleOpenCreate = () => {
    setFormTitle('');
    setFormDescription('');
    setFormTheme('Contemporary Minimalist');
    setFormCoverImage('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=80');
    setFormIsPublic(true);
    setFormOutfitIds(savedOutfits.map(o => o.id));
    setShowCreateModal(true);
  };

  const handleOpenEdit = (lb) => {
    setFormTitle(lb.title);
    setFormDescription(lb.description || '');
    setFormTheme(lb.theme || 'Contemporary Minimalist');
    setFormCoverImage(lb.cover_image_url || '');
    setFormIsPublic(lb.is_public !== false);
    setFormOutfitIds(lb.outfits ? lb.outfits.map(o => o.id) : []);
    setShowEditModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Please enter a lookbook title.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createLookbook({
        title: formTitle.trim(),
        description: formDescription.trim(),
        theme: formTheme.trim(),
        cover_image_url: formCoverImage.trim(),
        is_public: formIsPublic,
        outfit_ids: formOutfitIds
      });

      if (res.success) {
        showToast('Lookbook curated successfully.', 'success');
        setShowCreateModal(false);
        await fetchData();
        if (res.data?.id) loadLookbookDetail(res.data.id);
      } else {
        showToast(res.message || 'Failed to create lookbook.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Creation failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLookbook) return;

    try {
      setSubmitting(true);
      const res = await api.updateLookbook(selectedLookbook.id, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        theme: formTheme.trim(),
        cover_image_url: formCoverImage.trim(),
        is_public: formIsPublic,
        outfit_ids: formOutfitIds
      });

      if (res.success) {
        showToast('Lookbook updated successfully.', 'success');
        setShowEditModal(false);
        await fetchData();
        loadLookbookDetail(selectedLookbook.id);
      } else {
        showToast(res.message || 'Failed to update lookbook.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Update failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLookbook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lookbook?')) return;

    try {
      const res = await api.deleteLookbook(id);
      if (res.success) {
        showToast('Lookbook deleted.', 'success');
        setSelectedLookbook(null);
        await fetchData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete lookbook.', 'error');
    }
  };

  const toggleOutfitSelection = (ofId) => {
    setFormOutfitIds(prev =>
      prev.includes(ofId) ? prev.filter(x => x !== ofId) : [...prev, ofId]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-taupe-light/80 pb-8 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-burgundy font-semibold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Editorial Capsules
            </span>
            <span className="text-taupe-muted text-xs">•</span>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-taupe">
              Personal Fashion Portfolio
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-charcoal font-light tracking-tight leading-tight">
            Personal Lookbook Atelier
          </h1>
          <p className="font-sans text-xs sm:text-sm text-taupe-dark max-w-2xl font-light leading-relaxed">
            Curate signature ensembles into themed editorial lookbooks. Share private or unlisted capsules with clients, stylists, and peers, or export high-res portfolio sheets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Curate New Lookbook</span>
          </Button>
        </div>
      </div>

      {/* Lookbooks Shelf / Horizontal Switcher */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-taupe font-semibold">
            Your Curated Collections ({lookbooks.length})
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <Skeleton key={n} className="aspect-[4/5] w-full" />
            ))}
          </div>
        ) : lookbooks.length === 0 ? (
          <div className="bg-white border border-dashed border-taupe-light p-12 text-center space-y-4">
            <BookOpen className="w-10 h-10 text-taupe-muted mx-auto" />
            <h3 className="font-serif text-xl text-charcoal">No Lookbooks Curated Yet</h3>
            <p className="font-sans text-xs text-taupe max-w-md mx-auto">
              Combine your saved outfits into editorial lookbooks for seasonal capsules, travel wardrobes, or client presentations.
            </p>
            <Button variant="primary" size="sm" onClick={handleOpenCreate}>
              Curate First Lookbook
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lookbooks.map((lb) => {
              const isSelected = selectedLookbook?.id === lb.id;
              return (
                <div
                  key={lb.id}
                  onClick={() => loadLookbookDetail(lb.id)}
                  className={`group cursor-pointer bg-white border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-charcoal ring-2 ring-charcoal/20 shadow-md'
                      : 'border-taupe-light/80 hover:border-charcoal shadow-sm'
                  }`}
                >
                  {/* Cover image */}
                  <div className="aspect-[4/3] w-full bg-ivory overflow-hidden relative">
                    <img
                      src={lb.cover_image_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80'}
                      alt={lb.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                    
                    {/* Privacy Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className={`px-2 py-0.5 text-[9px] font-sans uppercase font-medium tracking-[0.14em] flex items-center gap-1 ${
                        lb.is_public ? 'bg-white/90 text-charcoal backdrop-blur-sm' : 'bg-charcoal text-white'
                      }`}>
                        {lb.is_public ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                        {lb.is_public ? 'Public' : 'Private'}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <span className="font-sans text-[9px] uppercase tracking-[0.2em] opacity-80 block">
                        {lb.theme || 'Editorial Capsule'}
                      </span>
                      <h3 className="font-serif text-lg font-light truncate">
                        {lb.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card footer details */}
                  <div className="p-3.5 bg-white border-t border-taupe-light/60 flex items-center justify-between text-xs font-sans">
                    <span className="text-taupe">
                      {lb.outfit_count || (lb.outfits?.length || 0)} Ensembles
                    </span>
                    <span className="text-burgundy font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Lookbook Inspector & Editorial Showcase */}
      {selectedLookbook && (
        <section className="bg-white border border-taupe-light p-6 sm:p-10 space-y-8 shadow-sm">
          {/* Header Banner & Metadata */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-taupe-light/70 pb-8">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-burgundy font-semibold">
                  {selectedLookbook.theme || 'Lookbook Dossier'}
                </span>
                <span className="text-taupe-muted">•</span>
                <span className="font-sans text-[10px] uppercase tracking-[0.16em] text-taupe flex items-center gap-1">
                  {selectedLookbook.is_public ? <Globe className="w-3 h-3 text-emerald-700" /> : <Lock className="w-3 h-3" />}
                  {selectedLookbook.is_public ? 'Public Capsule' : 'Private Archive'}
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-light">
                {selectedLookbook.title}
              </h2>
              {selectedLookbook.description && (
                <p className="font-sans text-xs sm:text-sm text-taupe-dark font-light leading-relaxed pt-1">
                  {selectedLookbook.description}
                </p>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {selectedLookbook.is_public && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyShareLink(selectedLookbook.share_token)}
                  className="flex items-center gap-1.5"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedToken ? 'Link Copied!' : 'Share Lookbook'}</span>
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintPortfolio}
                className="flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Portfolio</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEdit(selectedLookbook)}
                className="flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Button>

              <button
                type="button"
                onClick={() => handleDeleteLookbook(selectedLookbook.id)}
                className="p-2 text-taupe hover:text-red-700 transition-colors border border-taupe-light/70"
                title="Delete Lookbook"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Ensembles Grid within this Lookbook */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-taupe font-semibold">
                Curated Ensembles ({selectedLookbook.outfits?.length || 0})
              </span>
            </div>

            {(!selectedLookbook.outfits || selectedLookbook.outfits.length === 0) ? (
              <div className="bg-ivory border border-dashed border-taupe-light p-8 text-center space-y-2">
                <Layers className="w-8 h-8 text-taupe-muted mx-auto" />
                <p className="font-sans text-xs text-taupe">No outfits added to this lookbook yet.</p>
                <Button variant="outline" size="sm" onClick={() => handleOpenEdit(selectedLookbook)}>
                  Add Outfits to Capsule
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {selectedLookbook.outfits.map((outfit, idx) => (
                  <div
                    key={outfit.id || idx}
                    className="bg-ivory/60 border border-taupe-light p-6 space-y-5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-burgundy font-semibold">
                          Look {idx + 1} • {outfit.occasion || 'Everyday'}
                        </span>
                      </div>
                      <h3 className="font-serif text-2xl text-charcoal font-light">
                        {outfit.name}
                      </h3>
                      {outfit.curator_note && (
                        <p className="font-sans text-xs text-taupe-dark italic bg-white p-3 border border-taupe-light/60 leading-relaxed">
                          "{outfit.curator_note}"
                        </p>
                      )}
                    </div>

                    {/* Outfit Slot Garment Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {outfit.items?.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white border border-taupe-light/70 p-2.5 space-y-2 flex flex-col justify-between text-xs font-sans group/item"
                        >
                          <div className="aspect-square w-full bg-ivory overflow-hidden relative">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform group-hover/item:scale-105"
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
            )}
          </div>
        </section>
      )}

      {/* Create / Edit Lookbook Modal */}
      {(showCreateModal || showEditModal) && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-ivory border border-taupe-light max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-taupe-light/70 pb-4">
              <div>
                <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-burgundy font-semibold">
                  Curatorial Studio
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-charcoal font-light mt-1">
                  {showCreateModal ? 'Curate New Lookbook' : 'Edit Lookbook Capsule'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                className="p-1 text-taupe hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={showCreateModal ? handleCreateSubmit : handleEditSubmit} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-[0.14em] text-taupe mb-1 font-semibold">
                    Lookbook Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paris Autumn Essentials, Tech Executive Capsule"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full text-xs font-sans px-3.5 py-2.5 border border-taupe-light bg-white focus:border-charcoal focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-[0.14em] text-taupe mb-1 font-semibold">
                      Editorial Theme
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Minimalist Architecture, Monochrome Noir"
                      value={formTheme}
                      onChange={(e) => setFormTheme(e.target.value)}
                      className="w-full text-xs font-sans px-3.5 py-2.5 border border-taupe-light bg-white focus:border-charcoal focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans uppercase tracking-[0.14em] text-taupe mb-1 font-semibold">
                      Access & Privacy
                    </label>
                    <select
                      value={formIsPublic ? 'public' : 'private'}
                      onChange={(e) => setFormIsPublic(e.target.value === 'public')}
                      className="w-full text-xs font-sans px-3.5 py-2.5 border border-taupe-light bg-white focus:border-charcoal focus:outline-none"
                    >
                      <option value="public">Public (Shareable Link Enabled)</option>
                      <option value="private">Private (Only You Can View)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-[0.14em] text-taupe mb-1 font-semibold">
                    Cover Photography URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formCoverImage}
                    onChange={(e) => setFormCoverImage(e.target.value)}
                    className="w-full text-xs font-sans px-3.5 py-2.5 border border-taupe-light bg-white focus:border-charcoal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-[0.14em] text-taupe mb-1 font-semibold">
                    Curatorial Manifesto / Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the intention, occasion, and aesthetic harmony of this collection..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full text-xs font-sans px-3.5 py-2.5 border border-taupe-light bg-white focus:border-charcoal focus:outline-none resize-none"
                  />
                </div>

                {/* Outfit Selector Checklist */}
                <div className="space-y-2 pt-2 border-t border-taupe-light/60">
                  <label className="block text-[10px] font-sans uppercase tracking-[0.14em] text-taupe font-semibold">
                    Include Outfits ({formOutfitIds.length} selected)
                  </label>
                  {savedOutfits.length === 0 ? (
                    <p className="text-xs text-taupe">No saved outfits available in your wardrobe yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {savedOutfits.map(of => {
                        const isChecked = formOutfitIds.includes(of.id);
                        return (
                          <div
                            key={of.id}
                            onClick={() => toggleOutfitSelection(of.id)}
                            className={`p-2.5 border text-xs font-sans cursor-pointer flex items-center justify-between transition-colors ${
                              isChecked
                                ? 'border-burgundy bg-burgundy/5 text-charcoal'
                                : 'border-taupe-light/80 bg-white text-taupe-dark hover:border-charcoal'
                            }`}
                          >
                            <span className="font-medium truncate">{of.name}</span>
                            <span className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${
                              isChecked ? 'bg-burgundy border-burgundy text-white' : 'border-taupe-light'
                            }`}>
                              {isChecked && <Check className="w-3 h-3" />}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-taupe-light/70">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : showCreateModal ? 'Curate Capsule' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
