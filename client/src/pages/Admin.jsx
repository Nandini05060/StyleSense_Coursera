import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Package,
  AlertTriangle,
  Plus,
  Edit2,
  Power,
  RefreshCw,
  ShoppingBag,
  DollarSign,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Metrics
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs: 'catalog' | 'orders'
  const [activeTab, setActiveTab] = useState('catalog');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Add Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category_id: 1,
    description: '',
    price: '',
    image_url: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80',
    style_tags: 'minimalist, classic',
    occasion_tags: 'office, casual',
    colors: 'charcoal, ivory',
    featured: false,
  });

  // Edit Product Form State
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    category_id: 1,
    description: '',
    active: true,
  });

  // Live variant stock edit state
  const [editingStockVariantId, setEditingStockVariantId] = useState(null);
  const [stockInputVal, setStockInputVal] = useState('');

  // Protect route
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      showToast('Access restricted to verified administrators.', 'error');
      navigate('/login?redirect=/admin');
    }
  }, [user, isAdmin, authLoading, navigate, showToast]);

  const loadAdminData = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const [sumRes, prodRes, ordRes, catRes] = await Promise.all([
        api.getAdminSummary(),
        api.getProducts({ limit: 100, includeInactive: true }),
        api.getAllOrders(),
        api.getCategories()
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (prodRes.success) setProducts(prodRes.data);
      if (ordRes.success) setOrders(ordRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (err) {
      showToast(err.message || 'Failed to load administrative data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, showToast]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // Handle Add Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newProduct.name,
        category_id: parseInt(newProduct.category_id, 10),
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        image_url: newProduct.image_url,
        style_tags: newProduct.style_tags.split(',').map(s => s.trim().toLowerCase()),
        occasion_tags: newProduct.occasion_tags.split(',').map(o => o.trim().toLowerCase()),
        colors: newProduct.colors.split(',').map(c => c.trim().toLowerCase()),
        featured: newProduct.featured,
      };

      const res = await api.createProduct(payload);
      if (res.success) {
        showToast('Product added to catalog successfully!');
        setIsAddModalOpen(false);
        setNewProduct({
          name: '',
          category_id: 1,
          description: '',
          price: '',
          image_url: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80',
          style_tags: 'minimalist, classic',
          occasion_tags: 'office, casual',
          colors: 'charcoal, ivory',
          featured: false,
        });
        await loadAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create product.', 'error');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (prod) => {
    setSelectedProduct(prod);
    setEditForm({
      name: prod.name,
      price: prod.price,
      category_id: prod.category_id,
      description: prod.description,
      active: prod.active,
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      const res = await api.updateProduct(selectedProduct.id, {
        name: editForm.name,
        price: parseFloat(editForm.price),
        category_id: parseInt(editForm.category_id, 10),
        description: editForm.description,
        active: editForm.active,
      });
      if (res.success) {
        showToast('Product updated successfully.');
        setIsEditModalOpen(false);
        await loadAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Could not update product.', 'error');
    }
  };

  // Toggle Active
  const handleToggleActive = async (productId) => {
    try {
      const res = await api.toggleProductActive(productId);
      if (res.success) {
        showToast(res.message);
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, active: res.active } : p));
      }
    } catch (err) {
      showToast(err.message || 'Failed to toggle product status.', 'error');
    }
  };

  // Update Variant Stock
  const handleSaveStock = async (variantId) => {
    const qty = parseInt(stockInputVal, 10);
    if (isNaN(qty) || qty < 0) {
      showToast('Please enter a valid stock quantity.', 'error');
      return;
    }
    try {
      const res = await api.updateVariantStock(variantId, qty);
      if (res.success) {
        showToast(`Stock updated to ${qty} units.`);
        setEditingStockVariantId(null);
        await loadAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Could not update stock.', 'error');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        showToast(res.message);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update order status.', 'error');
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans text-sm text-taupe">
        Verifying administrator authorization...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="pb-6 border-b border-taupe-light flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="editorial-subheading text-burgundy">Administrator Portal</span>
            <span className="text-[10px] bg-charcoal text-white px-2 py-0.5 font-bold uppercase tracking-wider">
              Server Verified
            </span>
          </div>
          <h1 className="editorial-heading text-3xl sm:text-4xl mt-1">Catalog & Operations Control</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadAdminData}>
            Refresh
          </Button>
          <Button variant="burgundy" size="sm" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            Add New Garment
          </Button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-taupe-light p-5 shadow-subtle">
            <span className="text-[10px] font-sans uppercase font-bold tracking-widest text-taupe block">
              Total Garments
            </span>
            <span className="font-serif text-3xl font-bold text-charcoal mt-1 block">
              {summary.totalProducts}
            </span>
            <span className="text-xs text-emerald-700 font-sans mt-0.5 block">
              {summary.activeProducts} Active in Store
            </span>
          </div>

          <div className="bg-white border border-taupe-light p-5 shadow-subtle">
            <span className="text-[10px] font-sans uppercase font-bold tracking-widest text-taupe block">
              Customer Orders
            </span>
            <span className="font-serif text-3xl font-bold text-charcoal mt-1 block">
              {summary.totalOrders}
            </span>
            <span className="text-xs text-taupe-dark font-sans mt-0.5 block">
              Atomic Transacted
            </span>
          </div>

          <div className="bg-white border border-taupe-light p-5 shadow-subtle">
            <span className="text-[10px] font-sans uppercase font-bold tracking-widest text-taupe block">
              Total Revenue
            </span>
            <span className="font-serif text-3xl font-bold text-charcoal mt-1 block">
              ${summary.totalRevenue?.toFixed(2)}
            </span>
            <span className="text-xs text-taupe-dark font-sans mt-0.5 block">
              Simulated Sandbox
            </span>
          </div>

          <div className="bg-white border border-taupe-light p-5 shadow-subtle">
            <span className="text-[10px] font-sans uppercase font-bold tracking-widest text-taupe block">
              Low Stock Alerts
            </span>
            <span className="font-serif text-3xl font-bold text-burgundy mt-1 block">
              {summary.lowStockCount}
            </span>
            <span className="text-xs text-burgundy font-sans mt-0.5 block">
              Variants below 5 units
            </span>
          </div>
        </div>
      )}

      {/* Operations Navigation Tabs */}
      <div className="flex border-b border-taupe-light gap-8 text-xs font-sans font-semibold uppercase tracking-widest">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'catalog' ? 'text-burgundy' : 'text-taupe hover:text-charcoal'
          }`}
        >
          <span>Catalog Inventory ({products.length})</span>
          {activeTab === 'catalog' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-burgundy" />}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'orders' ? 'text-burgundy' : 'text-taupe hover:text-charcoal'
          }`}
        >
          <span>Customer Orders ({orders.length})</span>
          {activeTab === 'orders' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-burgundy" />}
        </button>
      </div>

      {/* Tab 1: Catalog Management */}
      {activeTab === 'catalog' && (
        <div className="bg-white border border-taupe-light shadow-subtle overflow-x-auto">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead>
              <tr className="bg-ivory border-b border-taupe-light text-taupe uppercase text-[10px] tracking-wider">
                <th className="p-4">Piece</th>
                <th className="p-4">Department</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock Breakdown</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-taupe-light/50">
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-ivory-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        className="w-10 h-12 object-cover object-top border border-taupe-light"
                      />
                      <div>
                        <span className="font-semibold text-charcoal font-serif text-sm block">
                          {prod.name}
                        </span>
                        <span className="text-[10px] text-taupe">ID #{prod.id} • {prod.slug}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-charcoal capitalize">
                    {prod.category_name}
                  </td>

                  <td className="p-4 font-serif font-semibold text-charcoal text-sm">
                    ${parseFloat(prod.price).toFixed(2)}
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {prod.variants?.map((v) => (
                        <div
                          key={v.id}
                          className={`px-2 py-0.5 border text-[10px] flex items-center gap-1.5 ${
                            v.stock_quantity < 5
                              ? 'border-burgundy-300 bg-burgundy-50 text-burgundy-800 font-semibold'
                              : 'border-taupe-light bg-ivory text-charcoal'
                          }`}
                        >
                          <span>{v.size} ({v.color}):</span>
                          {editingStockVariantId === v.id ? (
                            <div className="inline-flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                value={stockInputVal}
                                onChange={(e) => setStockInputVal(e.target.value)}
                                className="w-12 px-1 border border-charcoal text-center text-[10px]"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveStock(v.id)}
                                className="text-emerald-700 font-bold hover:underline"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingStockVariantId(v.id);
                                setStockInputVal(v.stock_quantity.toString());
                              }}
                              className="font-bold hover:underline"
                              title="Click to update inventory count"
                            >
                              {v.stock_quantity}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="p-4">
                    {prod.active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="warning">Deactivated</Badge>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1.5 text-taupe hover:text-charcoal border border-taupe-light hover:border-charcoal transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(prod.id)}
                        className={`p-1.5 border transition-colors ${
                          prod.active
                            ? 'text-red-700 border-red-200 hover:bg-red-50'
                            : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                        }`}
                        title={prod.active ? 'Deactivate product' : 'Activate product'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Orders Management */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-taupe-light shadow-subtle overflow-x-auto">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead>
              <tr className="bg-ivory border-b border-taupe-light text-taupe uppercase text-[10px] tracking-wider">
                <th className="p-4">Order Ref</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-taupe-light/50">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-ivory-50/50 transition-colors">
                  <td className="p-4">
                    <span className="font-mono font-semibold text-charcoal">{ord.order_number}</span>
                    <span className="text-[10px] text-taupe block">{ord.items?.length || 0} pieces</span>
                  </td>

                  <td className="p-4">
                    <span className="font-semibold text-charcoal block">{ord.customer_name || 'Customer'}</span>
                    <span className="text-[11px] text-taupe">{ord.customer_email}</span>
                  </td>

                  <td className="p-4 font-serif font-bold text-charcoal text-sm">
                    ${parseFloat(ord.total_amount).toFixed(2)}
                  </td>

                  <td className="p-4 text-taupe">
                    {new Date(ord.created_at).toLocaleDateString()}
                  </td>

                  <td className="p-4">
                    <select
                      value={ord.status}
                      onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                      className="bg-white border border-taupe-border text-xs px-2.5 py-1 font-semibold uppercase cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Garment"
        subtitle="Catalog Management"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <Input
            label="Garment Name"
            required
            placeholder="e.g. Double-Faced Cashmere Coat"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="editorial-subheading block mb-1">Department</label>
              <select
                value={newProduct.category_id}
                onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                className="editorial-input"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <Input
              label="Price ($ USD)"
              type="number"
              step="0.01"
              required
              placeholder="120.00"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            />
          </div>

          <Input
            label="Image URL"
            required
            value={newProduct.image_url}
            onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
          />

          <div className="space-y-1">
            <label className="editorial-subheading block mb-1">Description</label>
            <textarea
              rows={3}
              className="editorial-input"
              placeholder="Material origin, hand-feel, and tailoring..."
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Style Tags"
              placeholder="minimalist, classic"
              value={newProduct.style_tags}
              onChange={(e) => setNewProduct({ ...newProduct, style_tags: e.target.value })}
            />
            <Input
              label="Occasion Tags"
              placeholder="office, casual"
              value={newProduct.occasion_tags}
              onChange={(e) => setNewProduct({ ...newProduct, occasion_tags: e.target.value })}
            />
            <Input
              label="Colors"
              placeholder="charcoal, ivory"
              value={newProduct.colors}
              onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-taupe-light">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="burgundy" size="sm">
              Save Garment to Catalog
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Garment"
        subtitle="Catalog Management"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleUpdateProduct} className="space-y-4">
          <Input
            label="Garment Name"
            required
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="editorial-subheading block mb-1">Department</label>
              <select
                value={editForm.category_id}
                onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                className="editorial-input"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <Input
              label="Price ($ USD)"
              type="number"
              step="0.01"
              required
              value={editForm.price}
              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="editorial-subheading block mb-1">Description</label>
            <textarea
              rows={3}
              className="editorial-input"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-taupe-light">
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="burgundy" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
