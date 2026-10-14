import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Package, Sliders, LogOut, Heart, Clock, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { formatINR } from '../utils/formatCurrency';

export default function Account() {
  const { user, isAuthenticated, loading: authLoading, logout, updateUserPreferences } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'preferences'

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/account');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    async function fetchOrders() {
      if (!isAuthenticated) return;
      try {
        setLoadingOrders(true);
        const res = await api.getOrders();
        if (res.success && res.data) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error('Failed to load order history:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchOrders();
  }, [isAuthenticated]);

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'shipped':
        return <Badge variant="charcoal">Shipped</Badge>;
      case 'processing':
        return <Badge variant="score">Processing</Badge>;
      case 'cancelled':
        return <Badge variant="warning">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  if (authLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans text-sm text-taupe">
        Loading account details...
      </div>
    );
  }

  const prefs = user.preferences || {};
  const prefColors = Array.isArray(prefs.preferred_colors)
    ? prefs.preferred_colors
    : (typeof prefs.preferred_colors === 'string' ? JSON.parse(prefs.preferred_colors || '[]') : []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Profile summary */}
      <div className="pb-6 border-b border-taupe-light flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="editorial-subheading">Member Dashboard</span>
          <h1 className="editorial-heading text-3xl sm:text-4xl mt-1">{user.name}</h1>
          <p className="text-xs text-taupe font-sans mt-0.5">{user.email} • Role: {user.role}</p>
        </div>

        <div className="flex items-center gap-3">
          {user.role === 'admin' && (
            <Link to="/admin">
              <Button variant="outline" size="sm">
                Admin Panel
              </Button>
            </Link>
          )}
          <Button variant="secondary" size="sm" icon={LogOut} onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-taupe-light gap-8 text-xs font-sans font-semibold uppercase tracking-widest">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'orders' ? 'text-burgundy' : 'text-taupe hover:text-charcoal'
          }`}
        >
          <span>Order History ({orders.length})</span>
          {activeTab === 'orders' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-burgundy" />}
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'preferences' ? 'text-burgundy' : 'text-taupe hover:text-charcoal'
          }`}
        >
          <span>Saved Style Preferences</span>
          {activeTab === 'preferences' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-burgundy" />}
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="p-8 text-center text-xs font-sans text-taupe">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-dashed border-taupe-border p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-taupe mx-auto" />
              <h3 className="editorial-heading text-lg">No Orders Yet</h3>
              <p className="text-xs text-taupe font-sans">
                You haven't placed any orders yet. Discover personalized pieces in our Style Studio.
              </p>
              <Link to="/style-studio" className="inline-block pt-2">
                <Button variant="burgundy" size="sm">
                  Visit Style Studio
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div key={order.id} className="bg-white border border-taupe-light overflow-hidden shadow-subtle">
                    {/* Order summary row */}
                    <div
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-ivory-50/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-semibold text-charcoal">{order.order_number}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-taupe font-sans">
                          Placed on {formattedDate} • {order.items?.length || 0} pieces
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="text-right">
                          <span className="text-[10px] font-sans uppercase tracking-wider text-taupe block">Total Amount</span>
                          <span className="font-serif text-lg font-bold text-charcoal">{formatINR(order.total_amount)}</span>
                        </div>
                        <div className="text-taupe">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable item snapshots */}
                    {isExpanded && (
                      <div className="p-6 bg-ivory-50/40 border-t border-taupe-light/70 space-y-4">
                        <h4 className="editorial-subheading">Purchased Items Snapshot</h4>
                        <div className="divide-y divide-taupe-light/50">
                          {order.items?.map((item) => (
                            <div key={item.id} className="py-3 flex items-center justify-between text-xs font-sans">
                              <div className="flex items-center gap-3">
                                {item.product_image_snapshot && (
                                  <img
                                    src={item.product_image_snapshot}
                                    alt={item.product_name_snapshot}
                                    className="w-12 h-14 object-cover object-top border border-taupe-light"
                                  />
                                )}
                                <div>
                                  <p className="font-semibold text-charcoal">{item.product_name_snapshot}</p>
                                  <p className="text-[11px] text-taupe">
                                    Size: {item.size_snapshot} • Color: {item.color_snapshot} • Qty: {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <span className="font-serif font-medium text-charcoal">
                                {formatINR(parseFloat(item.unit_price) * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Delivery address */}
                        {order.shipping_address && (
                          <div className="pt-3 border-t border-taupe-light text-xs font-sans text-taupe">
                            <span className="font-semibold text-charcoal block mb-0.5">Delivery Address:</span>
                            <span>
                              {order.shipping_address.fullName}, {order.shipping_address.addressLine}, {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postalCode}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Preferences */}
      {activeTab === 'preferences' && (
        <div className="bg-white border border-taupe-light p-6 sm:p-8 space-y-6 shadow-editorial max-w-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-taupe-light">
            <h3 className="editorial-heading text-xl">Saved Style Profile</h3>
            <Link to="/style-studio">
              <Button variant="outline" size="sm" icon={Sliders}>
                Edit in Style Studio
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 text-xs font-sans">
            <div>
              <span className="editorial-subheading block mb-1">Occasion</span>
              <p className="text-sm font-semibold capitalize text-charcoal">{prefs.preferred_occasion || 'Casual'}</p>
            </div>
            <div>
              <span className="editorial-subheading block mb-1">Style Aesthetic</span>
              <p className="text-sm font-semibold capitalize text-charcoal">{prefs.preferred_style || 'Minimalist'}</p>
            </div>
            <div>
              <span className="editorial-subheading block mb-1">Preferred Size</span>
              <p className="text-sm font-semibold uppercase text-charcoal">{prefs.preferred_size || 'M'}</p>
            </div>
            <div>
              <span className="editorial-subheading block mb-1">Target Budget Range</span>
              <p className="text-sm font-semibold text-charcoal">
                {formatINR(prefs.budget_min || 0)} - {formatINR(prefs.budget_max || 300)}
              </p>
            </div>
            <div className="col-span-2">
              <span className="editorial-subheading block mb-2">Preferred Palette</span>
              <div className="flex flex-wrap gap-2">
                {prefColors.map((color, i) => (
                  <span key={i} className="px-3 py-1 bg-ivory border border-taupe-light capitalize text-xs text-charcoal">
                    {color}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
