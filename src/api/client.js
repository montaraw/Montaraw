const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Automatically ensure clean URL with /api suffix
const cleanBase = rawUrl.replace(/\/+$/, '');
const API_BASE_URL = cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`;

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Attach token if present
  const customerToken = localStorage.getItem('montaraw_customer_token');
  const adminToken = localStorage.getItem('montaraw_admin_token');
  const token = options.isAdmin ? adminToken : (customerToken || adminToken);

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (error) {
    console.warn(`[API Client] Error on ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },
  getProductById: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data), isAdmin: true }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data), isAdmin: true }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE', isAdmin: true }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data), isAdmin: true }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data), isAdmin: true }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE', isAdmin: true }),

  // Banners
  getBanners: () => request('/banners'),
  createBanner: (data) => request('/banners', { method: 'POST', body: JSON.stringify(data), isAdmin: true }),
  updateBanner: (id, data) => request(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(data), isAdmin: true }),
  deleteBanner: (id) => request(`/banners/${id}`, { method: 'DELETE', isAdmin: true }),

  // Orders
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  trackOrder: (query) => request(`/orders/track/${encodeURIComponent(query)}`),
  getMyOrders: () => request('/orders/my-orders'),
  getAdminOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/orders/admin${query ? `?${query}` : ''}`, { isAdmin: true });
  },
  updateOrderStatus: (id, status, trackingNumber) =>
    request(`/orders/admin/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, trackingNumber }),
      isAdmin: true,
    }),

  // Auth
  registerCustomer: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  loginCustomer: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  loginAdmin: (email, password) =>
    request('/auth/admin-login', { method: 'POST', body: JSON.stringify({ email, password }), isAdmin: true }),
  getMe: () => request('/auth/me'),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Coupons
  validateCoupon: (code, subtotal) => request(`/coupons/validate?code=${encodeURIComponent(code)}&subtotal=${subtotal}`),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data), isAdmin: true }),

  // Cloudinary Image Upload
  uploadImage: async (fileOrBase64, folder = 'montaraw_atelier/products') => {
    const adminToken = localStorage.getItem('montaraw_admin_token');
    
    // If it's a File object, send as multipart/form-data
    if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
      const formData = new FormData();
      formData.append('file', fileOrBase64);
      formData.append('folder', folder);

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Image upload failed.');
      return data;
    }

    // If it's base64 string
    return request('/upload', {
      method: 'POST',
      body: JSON.stringify({ image: fileOrBase64, folder }),
      isAdmin: true,
    });
  },

  // Recent Searches (Database)
  getRecentSearches: () => request('/search/recent'),
  saveRecentSearch: (query) => request('/search/recent', { method: 'POST', body: JSON.stringify({ query }) }),
  deleteRecentSearch: (query) => request(`/search/recent/${encodeURIComponent(query)}`, { method: 'DELETE' }),
  clearRecentSearches: () => request('/search/recent', { method: 'DELETE' }),
};
