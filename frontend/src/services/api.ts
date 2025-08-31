import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage') 
    ? JSON.parse(localStorage.getItem('auth-storage')!).token 
    : null;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Store API
export const storeAPI = {
  getAll: (params?: any) => api.get('/v1/stores', { params }),
  getById: (id: string) => api.get(`/v1/stores/${id}`),
  create: (data: any) => api.post('/v1/stores', data),
  update: (id: string, data: any) => api.put(`/v1/stores/${id}`, data),
  delete: (id: string) => api.delete(`/v1/stores/${id}`),
  getAnalytics: (id: string) => api.get(`/v1/stores/${id}/analytics`),
};

// Inventory API (placeholder - implement when backend is ready)
export const inventoryAPI = {
  getAll: (params?: any) => api.get('/v1/inventory', { params }),
  getByStore: (storeId: string) => api.get(`/v1/inventory/store/${storeId}`),
  updateQuantity: (id: string, quantity: number) => api.put(`/v1/inventory/${id}/quantity`, { quantity }),
  getLowStock: () => api.get('/v1/inventory/low-stock'),
  getCritical: () => api.get('/v1/inventory/critical'),
};

// Purchase Orders API (placeholder - implement when backend is ready)
export const purchaseOrderAPI = {
  getAll: (params?: any) => api.get('/v1/purchase-orders', { params }),
  getById: (id: string) => api.get(`/v1/purchase-orders/${id}`),
  create: (data: any) => api.post('/v1/purchase-orders', data),
  update: (id: string, data: any) => api.put(`/v1/purchase-orders/${id}`, data),
  approve: (id: string) => api.post(`/v1/purchase-orders/${id}/approve`),
  reject: (id: string, reason: string) => api.post(`/v1/purchase-orders/${id}/reject`, { reason }),
};

// Suppliers API (placeholder - implement when backend is ready)
export const supplierAPI = {
  getAll: (params?: any) => api.get('/v1/suppliers', { params }),
  getById: (id: string) => api.get(`/v1/suppliers/${id}`),
  create: (data: any) => api.post('/v1/suppliers', data),
  update: (id: string, data: any) => api.put(`/v1/suppliers/${id}`, data),
  delete: (id: string) => api.delete(`/v1/suppliers/${id}`),
};

// Forecasting API (placeholder - implement when backend is ready)
export const forecastingAPI = {
  getForecast: (storeId: string, productId: string) => api.get(`/v1/forecasting/${storeId}/${productId}`),
  generateForecast: (storeId: string) => api.post(`/v1/forecasting/${storeId}/generate`),
  getForecastHistory: (storeId: string) => api.get(`/v1/forecasting/${storeId}/history`),
};

// Dashboard API
export const dashboardAPI = {
  getKPIs: () => api.get('/v1/dashboard/kpis'),
  getAtRiskItems: () => api.get('/v1/dashboard/at-risk'),
  getOpenPOs: () => api.get('/v1/dashboard/open-pos'),
  getRecentActivity: () => api.get('/v1/dashboard/recent-activity'),
};

// Export functions
export const exportAPI = {
  exportInventory: (params?: any) => api.get('/v1/export/inventory', { 
    params, 
    responseType: 'blob' 
  }),
  exportForecast: (storeId: string) => api.get(`/v1/export/forecast/${storeId}`, { 
    responseType: 'blob' 
  }),
  exportPurchaseOrders: (params?: any) => api.get('/v1/export/purchase-orders', { 
    params, 
    responseType: 'blob' 
  }),
};

export default api;
