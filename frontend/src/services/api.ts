// frontend/src/services/api.ts
import axios, { AxiosError } from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export const paths = {
  // auth & realtime are versioned on the backend
  auth: (p = "") => `/api/v1/auth${p}`,
  realtime: (p = "") => `/api/v1/realtime${p}`,
  // most domain resources are at root (inventory, products, suppliers, stores, purchase-orders)
  root: (p = "") => `/api${p}`,
};

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT from Zustand/localStorage (key "auth-storage")
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (raw) {
      const { state } = JSON.parse(raw);
      const token: string | undefined = state?.token ?? state?.accessToken;
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    /* no-op */
  }
  return config;
});

// Handle 401s and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth-storage");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Standardize error shapes
export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

export function toApiError(err: unknown): ApiError {
  const ax = err as AxiosError<any>;
  if (ax?.isAxiosError) {
    return {
      status: ax.response?.status ?? 0,
      message:
        (ax.response?.data?.message as string) ||
        (ax.response?.data?.error as string) ||
        ax.message,
      details: ax.response?.data,
    };
  }
  return { status: 0, message: (err as Error)?.message ?? "Unknown error" };
}

// Example typed helpers (use as you migrate screens)
export const InventoryApi = {
  list: () => api.get(paths.root("/inventory")),
  byStore: (storeId: string | number) =>
    api.get(paths.root(`/inventory/store/${storeId}`)),
  updateQuantity: (id: string | number, quantity: number) =>
    api.put(paths.root(`/inventory/${id}/quantity`), { quantity }),
  lowStock: () => api.get(paths.root("/inventory/low-stock")),
  critical: () => api.get(paths.root("/inventory/critical")),
};

export const SuppliersApi = {
  list: () => api.get(paths.root("/suppliers")),
  get: (id: string | number) => api.get(paths.root(`/suppliers/${id}`)),
  create: (body: unknown) => api.post(paths.root("/suppliers"), body),
  update: (id: string | number, body: unknown) =>
    api.put(paths.root(`/suppliers/${id}`), body),
  remove: (id: string | number) => api.delete(paths.root(`/suppliers/${id}`)),
};

export const ProductsApi = {
  list: () => api.get(paths.root("/products")),
  create: (body: unknown) => api.post(paths.root("/products"), body),
  // add other methods as needed
};

export const StoresApi = {
  list: () => api.get(paths.root("/stores")),
  create: (body: unknown) => api.post(paths.root("/stores"), body),
};

export const PurchaseOrdersApi = {
  list: () => api.get(paths.root("/purchase-orders")),
  get: (id: string | number) => api.get(paths.root(`/purchase-orders/${id}`)),
  create: (body: unknown) => api.post(paths.root("/purchase-orders"), body),
  update: (id: string | number, body: unknown) =>
    api.put(paths.root(`/purchase-orders/${id}`), body),
  remove: (id: string | number) =>
    api.delete(paths.root(`/purchase-orders/${id}`)),
};

export const AuthApi = {
  login: (body: { email: string; password: string }) =>
    api.post(paths.auth("/login"), body),
  register: (body: { email: string; password: string }) =>
    api.post(paths.auth("/register"), body),
  refresh: (body: { refreshToken: string }) =>
    api.post(paths.auth("/refresh"), body),
};

// Forecasting API (ML API on port 8000) - separate instance
const ML_API_BASE_URL = "http://localhost:8000";
const mlApi = axios.create({
  baseURL: ML_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const ForecastingApi = {
  trainModel: (data: any) => mlApi.post("/api/v1/forecasting/train", data),
  generateForecast: (data: any) =>
    mlApi.post("/api/v1/forecasting/generate", data),
  listModels: () => mlApi.get("/api/v1/forecasting/models"),
  getPerformance: (productId: string, storeId?: string) => {
    const url = storeId
      ? `/api/v1/forecasting/${productId}/performance?store_id=${storeId}`
      : `/api/v1/forecasting/${productId}/performance`;
    return mlApi.get(url);
  },
};

// Legacy exports for backward compatibility during migration
export const storeAPI = StoresApi;
export const inventoryAPI = InventoryApi;
export const purchaseOrderAPI = PurchaseOrdersApi;
export const supplierAPI = SuppliersApi;
export const productAPI = ProductsApi;
export const forecastingAPI = ForecastingApi;

export default api;