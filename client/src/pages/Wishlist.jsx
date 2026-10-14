import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  TrendingDown,
  Bell,
  Check,
  Plus,
  Folder,
  Tag,
  Clock,
  Sparkles,
  AlertCircle,
  X,
  History
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { formatINR } from '../utils/formatCurrency';

export default function Wishlist() {
  const { wishlist, removeFromWishlist, refreshWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  const [activeCollection, setActiveCollection] = useState('All Saved Pieces');
  const [collections, setCollections] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingCollections, setLoadingCollections] = useState(false);

  // Price Watch Modal State
  const [priceWatchModalItem, setPriceWatchModalItem] = useState(null);
  const [targetPriceInput, setTargetPriceInput] = useState('');
  const [targetNotesInput, setTargetNotesInput] = useState('');
  const [savingPriceWatch, setSavingPriceWatch] = useState(false);

  // New Collection Modal State
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creatingCollection, setCreatingCollection] = useState(false);

  // Price History Modal State
  const [priceHistoryItem, setPriceHistoryItem] = useState(null);
  const [priceHistoryData, setPriceHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadCollections();
      loadNotifications();
    }
  }, [isAuthenticated]);

  const loadCollections = async () => {
    try {
      setLoadingCollections(true);
      const res = await api.getWishlistCollections();
      if (res.success && res.data) {
        setCollections(res.data);
      }
    } catch (err) {
      console.warn('Failed to load collections:', err);
    } finally {
      setLoadingCollections(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await api.getWishlistNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.warn('Mark read error:', err);
    }
  };

  // Filter items by active collection
  const filteredItems = activeCollection === 'All Saved Pieces'
    ? wishlist
    : wishlist.filter(item => (item.collection_name || 'All Saved Pieces') === activeCollection);

  // Target met items for highlight banner
  const targetMetItems = wishlist.filter(item => item.is_target_met);

  const handleMoveToCart = async (product) => {
    const variants = product.variants || [];
    const availableVariant = variants.find(v => v.stock_quantity > 0) || variants[0];

    if (!availableVariant || availableVariant.stock_quantity <= 0) {
      showToast('This item is currently out of stock.', 'error');
      return;
    }

    await addToCart(availableVariant.id, 1, {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image_url: product.image_url,
      size: availableVariant.size,
      color: availableVariant.color,
      stock: availableVariant.stock_quantity,
    });

    await removeFromWishlist(product.id);
    showToast('Moved piece from Wishlist to Shopping Bag.', 'success');
  };

  const handleOpenPriceWatchModal = (item) => {
    setPriceWatchModalItem(item);
    setTargetPriceInput(item.target_price ? String(item.target_price) : String(Math.round(item.price * 0.9)));
    setTargetNotesInput(item.notes || '');
  };

  const handleSavePriceWatch = async (e) => {
    e.preventDefault();
    if (!priceWatchModalItem) return;

    try {
      setSavingPriceWatch(true);
      const res = await api.updatePriceWatch(priceWatchModalItem.id, {
        target_price: parseFloat(targetPriceInput),
        notes: targetNotesInput.trim()
      });

      if (res.success) {
        showToast(`Price watch set at ${formatINR(parseFloat(targetPriceInput))}`, 'success');
        setPriceWatchModalItem(null);
        refreshWishlist();
        loadNotifications();
      } else {
        showToast(res.message || 'Failed to set price alert.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error saving price watch.', 'error');
    } finally {
      setSavingPriceWatch(false);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    try {
      setCreatingCollection(true);
      const res = await api.createWishlistCollection({ name: newCollectionName.trim() });
      if (res.success) {
        showToast(`Collection "${newCollectionName.trim()}" created.`, 'success');
        setNewCollectionName('');
        setShowNewCollectionModal(false);
        loadCollections();
      } else {
        showToast(res.message || 'Failed to create collection.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Collection creation error.', 'error');
    } finally {
      setCreatingCollection(false);
    }
  };

  const handleMoveCollection = async (productId, targetCollection) => {
    try {
      const res = await api.updateWishlistCollection(productId, targetCollection);
      if (res.success) {
        showToast(`Moved to "${targetCollection}".`, 'success');
        refreshWishlist();
        loadCollections();
      }
    } catch (err) {
      showToast(err.message || 'Failed to move collection.', 'error');
    }
  };

  const handleOpenPriceHistory = async (product) => {
    setPriceHistoryItem(product);
    try {
      setLoadingHistory(true);
      const res = await api.getProductPriceHistory(product.id);
      if (res.success && res.data) {
        setPriceHistoryData(res.data);
      }
    } catch (err) {
      console.warn('History error:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Editorial Header */}
      <div className="pb-6 border-b border-taupe-light flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-burgundy font-semibold flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              Personal Archive
            </span>
            <span className="text-taupe-muted text-xs">•</span>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-taupe">
              Smart Price Watch
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-charcoal font-light tracking-tight leading-tight">
            Saved Wishlist & Price Atelier
          </h1>
          <p className="text-xs sm:text-sm text-taupe-dark max-w-xl font-light leading-relaxed">
            Curate private garment folders, set intelligent target price watchpoints in INR, and track market value changes in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications Button */}
          {notifications.length > 0 && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex items-center gap-2 relative"
              >
                <Bell className="w-3.5 h-3.5 text-burgundy" />
                <span>Price Alerts</span>
                {unreadNotifCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-burgundy text-white text-[9px] flex items-center justify-center font-bold">
                    {unreadNotifCount}
                  </span>
                )}
              </Button>

              {/* Slide-down notifications menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-taupe-light shadow-2xl p-4 z-40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-taupe-light/60 pb-2">
                    <span className="text-[10px] font-sans uppercase tracking-[0.16em] text-charcoal font-semibold">
                      Price Drop Alerts ({notifications.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="text-taupe hover:text-charcoal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkNotificationRead(n.id)}
                        className={`p-3 border text-xs font-sans transition-colors cursor-pointer ${
                          n.is_read
                            ? 'bg-ivory/50 border-taupe-light/60 text-taupe'
                            : 'bg-emerald-50/70 border-emerald-200 text-charcoal font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-emerald-900">{n.title}</span>
                          {!n.is_read && (
                            <span className="text-[9px] bg-emerald-800 text-white px-1.5 py-0.2 uppercase font-medium">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-taupe-dark mt-1 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Link to="/shop">
            <Button variant="outline" size="sm">
              Discover Catalog
            </Button>
          </Link>
        </div>
      </div>

      {/* Target Price Reached Banner */}
      {targetMetItems.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-emerald-950 font-medium">
                Target Price Alert Met!
              </h3>
              <p className="text-xs font-sans text-emerald-900 leading-relaxed">
                {targetMetItems.length} {targetMetItems.length === 1 ? 'piece is' : 'pieces are'} currently at or below your calibrated target price alert.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-sans font-semibold text-emerald-900 bg-white px-3 py-1.5 border border-emerald-300">
              Save up to {formatINR(Math.max(...targetMetItems.map(i => i.price_difference || 0)))}
            </span>
          </div>
        </div>
      )}

      {/* Named Collections Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-taupe-light/80 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {collections.map((col) => {
            const isActive = activeCollection === col.name;
            const count = col.name === 'All Saved Pieces'
              ? wishlist.length
              : wishlist.filter(w => (w.collection_name || 'All Saved Pieces') === col.name).length;

            return (
              <button
                type="button"
                key={col.id || col.name}
                onClick={() => setActiveCollection(col.name)}
                className={`px-3.5 py-1.5 text-xs font-sans uppercase tracking-[0.14em] border transition-all flex items-center gap-2 ${
                  isActive
                    ? 'border-charcoal bg-charcoal text-white font-medium shadow-sm'
                    : 'border-taupe-light/80 bg-white text-charcoal hover:border-charcoal'
                }`}
              >
                <span>{col.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-sm ${
                  isActive ? 'bg-white/20 text-white' : 'bg-ivory text-taupe'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNewCollectionModal(true)}
          className="flex items-center gap-1.5 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Collection</span>
        </Button>
      </div>

      {/* Main Wishlist Product Grid */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={activeCollection === 'All Saved Pieces' ? 'Your Wishlist is Empty' : `No Pieces in "${activeCollection}"`}
          description="Save editorial pieces you love as you browse the catalog or configure target price drop watches."
          actionLabel="Discover Collection"
          onAction={() => window.location.href = '/shop'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const isTargetMet = item.is_target_met;
            const hasTargetPrice = item.target_price !== null && item.target_price !== undefined;

            return (
              <div
                key={item.id}
                className={`group bg-white border flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative ${
                  isTargetMet ? 'border-emerald-500/60 ring-1 ring-emerald-500/30' : 'border-taupe-light'
                }`}
              >
                {/* Product Image & Badges */}
                <Link to={`/product/${item.slug || item.id}`} className="relative aspect-[3/4] overflow-hidden bg-ivory block">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromWishlist(item.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/90 text-charcoal hover:text-red-700 hover:bg-white transition-colors rounded-full shadow-sm z-10"
                    title="Remove from wishlist"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Price Trend Badge */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {item.price_trend === 'dropped' && (
                      <span className="bg-charcoal text-white text-[9px] font-sans uppercase font-medium px-2 py-0.5 tracking-[0.14em] flex items-center gap-1 shadow-sm">
                        <TrendingDown className="w-2.5 h-2.5 text-emerald-400" /> Price Dropped
                      </span>
                    )}
                    {item.price_trend === 'lowest' && (
                      <span className="bg-emerald-800 text-white text-[9px] font-sans uppercase font-medium px-2 py-0.5 tracking-[0.14em] flex items-center gap-1 shadow-sm">
                        ★ Lowest Price
                      </span>
                    )}
                  </div>

                  {/* Target Met Highlight Tag */}
                  {isTargetMet && (
                    <div className="absolute bottom-2 left-2 right-2 bg-emerald-900/90 backdrop-blur-sm text-white px-2.5 py-1 text-[10px] font-sans uppercase tracking-[0.14em] font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-300" /> Target Met
                      </span>
                      <span>Save {formatINR(item.price_difference)}</span>
                    </div>
                  )}
                </Link>

                {/* Garment Details & Price Watch */}
                <div className="p-4 flex flex-col justify-between flex-1 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-taupe font-semibold block">
                        {item.category_name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenPriceHistory(item)}
                        className="text-taupe hover:text-charcoal p-1"
                        title="View Price History"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="font-serif text-lg font-light text-charcoal line-clamp-1 group-hover:text-burgundy transition-colors">
                      <Link to={`/product/${item.slug || item.id}`}>{item.name}</Link>
                    </h3>

                    {/* Price & Target Difference */}
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="font-sans text-base font-semibold text-charcoal">
                        {formatINR(item.price)}
                      </span>

                      {hasTargetPrice ? (
                        <span className={`text-[11px] font-sans font-medium px-2 py-0.5 border ${
                          isTargetMet
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}>
                          {isTargetMet
                            ? `Save ${formatINR(item.price_difference)}`
                            : `Target ${formatINR(item.target_price)}`}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenPriceWatchModal(item)}
                          className="text-[11px] font-sans text-burgundy hover:underline flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          Set Alert
                        </button>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-[11px] font-sans text-taupe-dark italic bg-ivory/60 p-2 border border-taupe-light/50 truncate">
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions & Collection Selector */}
                  <div className="space-y-2 pt-2 border-t border-taupe-light/60">
                    <div className="flex items-center justify-between text-[11px] font-sans">
                      <span className="text-taupe">Collection:</span>
                      <select
                        value={item.collection_name || 'All Saved Pieces'}
                        onChange={(e) => handleMoveCollection(item.id, e.target.value)}
                        className="text-[11px] font-sans bg-ivory border border-taupe-light/80 px-2 py-0.5 focus:outline-none"
                      >
                        {collections.map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenPriceWatchModal(item)}
                        className="text-[11px] py-1.5 px-2"
                      >
                        Price Watch
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleMoveToCart(item)}
                        className="text-[11px] py-1.5 px-2 flex items-center justify-center gap-1"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Move to Bag</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Price Watch Modal */}
      {priceWatchModalItem && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-ivory border border-taupe-light max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-taupe-light/70 pb-4">
              <div>
                <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-burgundy font-semibold">
                  Intelligent Price Watch
                </span>
                <h2 className="font-serif text-2xl text-charcoal font-light mt-0.5">
                  Set Target Price Alert
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPriceWatchModalItem(null)}
                className="p-1 text-taupe hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePriceWatch} className="space-y-4">
              <div className="bg-white p-3.5 border border-taupe-light space-y-1">
                <span className="text-[10px] font-sans uppercase tracking-[0.1em] text-taupe block">
                  Current Garment Price
                </span>
                <span className="font-sans text-xl font-medium text-charcoal">
                  {formatINR(priceWatchModalItem.price)}
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-sans uppercase tracking-[0.14em] text-taupe font-semibold mb-1">
                  Target Alert Price (₹ INR) *
                </label>
                <input
                  type="number"
                  step="50"
                  required
                  value={targetPriceInput}
                  onChange={(e) => setTargetPriceInput(e.target.value)}
                  className="w-full text-sm font-sans px-3.5 py-2.5 border border-taupe-light bg-white focus:border-charcoal focus:outline-none"
                />
                <span className="text-[11px] font-sans text-taupe-muted mt-1 block">
                  You will receive an in-app alert when this garment reaches or drops below this price.
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-sans uppercase tracking-[0.14em] text-taupe font-semibold mb-1">
                  Personal Purchase Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Purchase for autumn capsule"
                  value={targetNotesInput}
                  onChange={(e) => setTargetNotesInput(e.target.value)}
                  className="w-full text-xs font-sans px-3.5 py-2.5 border border-taupe-light bg-white focus:border-charcoal focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-taupe-light/70">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setPriceWatchModalItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={savingPriceWatch}
                >
                  {savingPriceWatch ? 'Saving...' : 'Set Price Alert'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Collection Modal */}
      {showNewCollectionModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-ivory border border-taupe-light max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-taupe-light/70 pb-4">
              <div>
                <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-burgundy font-semibold">
                  Archive Organization
                </span>
                <h2 className="font-serif text-2xl text-charcoal font-light mt-0.5">
                  Create Collection Folder
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowNewCollectionModal(false)}
                className="p-1 text-taupe hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-[10px] font-sans uppercase tracking-[0.14em] text-taupe font-semibold mb-1">
                  Collection Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Vacation, Statement Coats"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full text-xs font-sans px-3.5 py-2.5 border border-taupe-light bg-white focus:border-charcoal focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-taupe-light/70">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setShowNewCollectionModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={creatingCollection}
                >
                  {creatingCollection ? 'Creating...' : 'Create Collection'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Price History Timeline Modal */}
      {priceHistoryItem && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-ivory border border-taupe-light max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-taupe-light/70 pb-4">
              <div>
                <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-burgundy font-semibold">
                  Market Trend Intelligence
                </span>
                <h2 className="font-serif text-2xl text-charcoal font-light mt-0.5">
                  Price History Timeline
                </h2>
                <p className="text-xs font-sans text-taupe mt-1">
                  {priceHistoryItem.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPriceHistoryItem(null)}
                className="p-1 text-taupe hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingHistory ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : priceHistoryData.length === 0 ? (
              <p className="text-xs font-sans text-taupe text-center py-6">
                Current price ({formatINR(priceHistoryItem.price)}) is the baseline initial catalog price.
              </p>
            ) : (
              <div className="space-y-3">
                <span className="text-[10px] font-sans uppercase tracking-[0.14em] text-taupe font-semibold block">
                  Recorded Price Points
                </span>
                <div className="border border-taupe-light divide-y divide-taupe-light/60 bg-white">
                  {priceHistoryData.map((ph, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs font-sans">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-taupe" />
                        <span className="text-taupe-dark">
                          {new Date(ph.recorded_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <span className="font-semibold text-charcoal">
                        {formatINR(ph.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPriceHistoryItem(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
