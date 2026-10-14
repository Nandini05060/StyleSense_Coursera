const API_BASE = typeof window !== 'undefined' && window.location && window.location.origin && !window.location.origin.includes('localhost:3000') && !window.location.origin.startsWith('null')
  ? `${window.location.origin}/api`
  : 'http://localhost:5000/api';

/**
 * Universal fetch wrapper with token injection and error handling
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('stylesense_token');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    credentials: 'include', // Support HttpOnly cookies
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),

  // Products & Categories
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return request(`/products?${query.toString()}`);
  },
  getProductById: (id) => request(`/products/${id}`),
  getCategories: () => request('/categories'),

  // Recommendations & Outfits
  getRecommendations: (body) => request('/recommendations', { method: 'POST', body: JSON.stringify(body) }),
  getOutfit: (body) => request('/outfits', { method: 'POST', body: JSON.stringify(body) }),
  replaceOutfitSlot: (body) => request('/outfits/replace', { method: 'POST', body: JSON.stringify(body) }),

  // Preferences
  getPreferences: () => request('/preferences'),
  updatePreferences: (body) => request('/preferences', { method: 'PUT', body: JSON.stringify(body) }),

  // Wishlist
  getWishlist: () => request('/wishlist'),
  addToWishlist: (productId) => request('/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),
  removeFromWishlist: (productId) => request(`/wishlist/${productId}`, { method: 'DELETE' }),

  // Cart
  getCart: () => request('/cart'),
  addToCart: (variantId, quantity = 1) => request('/cart/items', { method: 'POST', body: JSON.stringify({ variantId, quantity }) }),
  updateCartItem: (itemId, quantity) => request(`/cart/items/${itemId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
  removeCartItem: (itemId) => request(`/cart/items/${itemId}`, { method: 'DELETE' }),

  // Orders
  createOrder: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getOrders: () => request('/orders'),
  getOrderById: (id) => request(`/orders/${id}`),

  // Digital Wardrobe
  getWardrobeItems: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return request(`/wardrobe?${query.toString()}`);
  },
  getWardrobeItemById: (id) => request(`/wardrobe/${id}`),
  createWardrobeItem: (body) => request('/wardrobe', { method: 'POST', body: JSON.stringify(body) }),
  updateWardrobeItem: (id, body) => request(`/wardrobe/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteWardrobeItem: (id) => request(`/wardrobe/${id}`, { method: 'DELETE' }),
  recordItemWear: (id, body = {}) => request(`/wardrobe/${id}/wear`, { method: 'POST', body: JSON.stringify(body) }),
  toggleWardrobeFavorite: (id) => request(`/wardrobe/${id}/favorite`, { method: 'PATCH' }),
  uploadWardrobeImage: (formData) => request('/wardrobe/upload', { method: 'POST', body: formData }),
  getWardrobeAnalytics: () => request('/wardrobe/analytics'),
  getWardrobeGaps: () => request('/wardrobe/gaps'),
  dismissWardrobeGap: (gap_key) => request('/wardrobe/gaps/dismiss', { method: 'POST', body: JSON.stringify({ gap_key }) }),

  // Occasion-to-Outfit Planner & Mix & Match
  generateOutfitPlan: (body) => request('/planner/generate', { method: 'POST', body: JSON.stringify(body) }),
  saveOutfit: (body) => request('/planner/save', { method: 'POST', body: JSON.stringify(body) }),
  getSavedOutfits: () => request('/planner/saved'),
  getSavedOutfitById: (id) => request(`/planner/saved/${id}`),
  updateSavedOutfit: (id, body) => request(`/planner/saved/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteSavedOutfit: (id) => request(`/planner/saved/${id}`, { method: 'DELETE' }),
  getSlotAlternatives: (body) => request('/planner/alternatives', { method: 'POST', body: JSON.stringify(body) }),
  evaluateOutfit: (body) => request('/outfits/evaluate', { method: 'POST', body: JSON.stringify(body) }),

  // Smart Buy-or-Reuse Advisor
  compareWithWardrobe: (body) => request('/advisor/compare', { method: 'POST', body: JSON.stringify(body) }),

  // Style Profile
  getStyleProfile: () => request('/preferences/profile'),
  updateStyleProfile: (body) => request('/preferences/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Admin
  getAdminSummary: () => request('/admin/summary'),
  createProduct: (body) => request('/admin/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id, body) => request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  toggleProductActive: (id) => request(`/admin/products/${id}/toggle`, { method: 'PATCH' }),
  updateVariantStock: (id, stock_quantity) => request(`/admin/variants/${id}/stock`, { method: 'PATCH', body: JSON.stringify({ stock_quantity }) }),
  getAllOrders: () => request('/admin/orders'),
  updateOrderStatus: (id, status) => request(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
