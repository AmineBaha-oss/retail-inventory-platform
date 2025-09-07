import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import {
  Store,
  StoreCreateRequest,
  StoreUpdateRequest,
  Supplier,
  SupplierCreateRequest,
  SupplierUpdateRequest,
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
  Inventory,
  InventoryCreateRequest,
  InventoryUpdateRequest,
  InventoryQuantityUpdateRequest,
  PurchaseOrder,
  PurchaseOrderCreateRequest,
  PurchaseOrderUpdateRequest,
  PaginatedResponse,
} from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token and cache busting
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("auth-storage")
    ? JSON.parse(localStorage.getItem("auth-storage")!).token
    : null;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add cache busting timestamp to all requests
  if (config.params) {
    config.params._t = Date.now();
  } else {
    config.params = { _t: Date.now() };
  }

  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("auth-storage");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Store API - Updated for our Spring Boot backend
export const storeAPI = {
  getAll: (params?: any): Promise<AxiosResponse<PaginatedResponse<Store>>> =>
    api.get("/stores", { params }),
  getById: (id: string): Promise<AxiosResponse<Store>> =>
    api.get(`/stores/${id}`),
  create: (data: StoreCreateRequest): Promise<AxiosResponse<Store>> =>
    api.post("/stores", data),
  update: (
    id: string,
    data: StoreUpdateRequest
  ): Promise<AxiosResponse<Store>> => api.put(`/stores/${id}`, data),
  delete: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/stores/${id}`),
  getByCode: (code: string): Promise<AxiosResponse<Store>> =>
    api.get(`/stores/code/${code}`),
};

// Inventory API - Updated for our Spring Boot backend
export const inventoryAPI = {
  getAll: (
    params?: any
  ): Promise<AxiosResponse<PaginatedResponse<Inventory>>> =>
    api.get("/inventory", { params }),
  getById: (id: string): Promise<AxiosResponse<Inventory>> =>
    api.get(`/inventory/${id}`),
  getByStore: (storeId: string): Promise<AxiosResponse<Inventory[]>> =>
    api.get(`/inventory/store/${storeId}`),
  getByProduct: (productId: string): Promise<AxiosResponse<Inventory[]>> =>
    api.get(`/inventory/product/${productId}`),
  create: (data: InventoryCreateRequest): Promise<AxiosResponse<Inventory>> =>
    api.post("/inventory", data),
  update: (
    id: string,
    data: InventoryUpdateRequest
  ): Promise<AxiosResponse<Inventory>> => api.put(`/inventory/${id}`, data),
  updateQuantity: (
    id: string,
    data: InventoryQuantityUpdateRequest
  ): Promise<AxiosResponse<Inventory>> =>
    api.patch(`/inventory/${id}/quantity`, data),
  getLowStock: (threshold?: number): Promise<AxiosResponse<Inventory[]>> =>
    api.get("/inventory/low-stock", { params: { threshold } }),
  delete: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/inventory/${id}`),
};

// Purchase Orders API - Updated for our Spring Boot backend
export const purchaseOrderAPI = {
  getAll: (
    params?: any
  ): Promise<AxiosResponse<PaginatedResponse<PurchaseOrder>>> =>
    api.get("/purchase-orders", { params }),
  getById: (id: string): Promise<AxiosResponse<PurchaseOrder>> =>
    api.get(`/purchase-orders/${id}`),
  getByPoNumber: (poNumber: string): Promise<AxiosResponse<PurchaseOrder>> =>
    api.get(`/purchase-orders/po-number/${poNumber}`),
  create: (
    data: PurchaseOrderCreateRequest
  ): Promise<AxiosResponse<PurchaseOrder>> =>
    api.post("/purchase-orders", data),
  update: (
    id: string,
    data: PurchaseOrderUpdateRequest
  ): Promise<AxiosResponse<PurchaseOrder>> =>
    api.put(`/purchase-orders/${id}`, data),
  updateStatus: (
    id: string,
    status: string,
    approvedBy?: string
  ): Promise<AxiosResponse<PurchaseOrder>> =>
    api.patch(`/purchase-orders/${id}/status`, null, {
      params: { status, approvedBy },
    }),
  delete: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/purchase-orders/${id}`),
};

// Suppliers API - Updated for our Spring Boot backend
export const supplierAPI = {
  getAll: (params?: any): Promise<AxiosResponse<PaginatedResponse<Supplier>>> =>
    api.get("/suppliers", { params }),
  getById: (id: string): Promise<AxiosResponse<Supplier>> =>
    api.get(`/suppliers/${id}`),
  getByCode: (code: string): Promise<AxiosResponse<Supplier>> =>
    api.get(`/suppliers/code/${code}`),
  create: (data: SupplierCreateRequest): Promise<AxiosResponse<Supplier>> =>
    api.post("/suppliers", data),
  update: (
    id: string,
    data: SupplierUpdateRequest
  ): Promise<AxiosResponse<Supplier>> => api.put(`/suppliers/${id}`, data),
  delete: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/suppliers/${id}`),
};

// Products API - New for our Spring Boot backend
export const productAPI = {
  getAll: (params?: any): Promise<AxiosResponse<Product[]>> =>
    api.get("/products", { params }),
  getById: (id: string): Promise<AxiosResponse<Product>> =>
    api.get(`/products/${id}`),
  getBySku: (sku: string): Promise<AxiosResponse<Product>> =>
    api.get(`/products/sku/${sku}`),
  getBySupplier: (supplierId: string): Promise<AxiosResponse<Product[]>> =>
    api.get(`/products/supplier/${supplierId}`),
  search: (
    query: string,
    params?: any
  ): Promise<AxiosResponse<PaginatedResponse<Product>>> =>
    api.get("/products/search", { params: { query, ...params } }),
  getCategories: (): Promise<AxiosResponse<string[]>> =>
    api.get("/products/categories"),
  getSubcategories: (category: string): Promise<AxiosResponse<string[]>> =>
    api.get(`/products/categories/${category}/subcategories`),
  getBrands: (): Promise<AxiosResponse<string[]>> =>
    api.get("/products/brands"),
  create: (data: ProductCreateRequest): Promise<AxiosResponse<Product>> =>
    api.post("/products", data),
  update: (
    id: string,
    data: ProductUpdateRequest
  ): Promise<AxiosResponse<Product>> => api.put(`/products/${id}`, data),
  updateStatus: (id: string, status: string): Promise<AxiosResponse<Product>> =>
    api.patch(`/products/${id}/status`, null, { params: { status } }),
  delete: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/products/${id}`),
};

// Forecasting API
export const forecastingAPI = {
  getForecast: (storeId: string, productId: string) =>
    api.get(`/api/v1/forecasting/${storeId}/${productId}`),
  generateForecast: (storeId: string) =>
    api.post(`/api/v1/forecasting/${storeId}/generate`),
  getForecastHistory: (storeId: string) =>
    api.get(`/api/v1/forecasting/${storeId}/history`),
  getKPIs: () => api.get("/api/v1/forecasting/dashboard/kpis"),
  createScenario: (data: any) =>
    api.post("/api/v1/forecasting/scenarios", data),
  runScenario: (scenarioId: string) =>
    api.post(`/api/v1/forecasting/scenarios/${scenarioId}/run`),
  trainModel: (data: any) => api.post("/api/v1/forecasting/train", data),
  generateForecastModel: (data: any) =>
    api.post("/api/v1/forecasting/generate", data),
  listModels: () => api.get("/api/v1/forecasting/models"),
};

// Dashboard API
export const dashboardAPI = {
  getKPIs: () => api.get("/api/v1/dashboard/kpis"),
  getAtRiskItems: () => api.get("/api/v1/dashboard/at-risk"),
  getOpenPOs: () => api.get("/api/v1/dashboard/open-pos"),
  getRecentActivity: () => api.get("/api/v1/dashboard/recent-activity"),
};

// Export functions
export const exportAPI = {
  exportInventory: (params?: any) =>
    api.get("/api/v1/export/inventory", {
      params,
      responseType: "blob",
    }),
  exportForecast: (storeId: string) =>
    api.get(`/api/v1/export/forecast/${storeId}`, {
      responseType: "blob",
    }),
  exportPurchaseOrders: (params?: any) =>
    api.get("/api/v1/export/purchase-orders", {
      params,
      responseType: "blob",
    }),
};

export default api;
