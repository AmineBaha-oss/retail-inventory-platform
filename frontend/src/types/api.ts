// API types aligned with Spring Boot backend DTOs

export type InventoryItem = {
  id: string;
  storeId: string;
  storeCode: string;
  storeName: string;
  productId: string;
  productSku: string;
  productName: string;
  quantityOnHand: number;
  quantityOnOrder: number;
  quantityReserved: number;
  quantityAvailable: number;
  costPerUnit: number;
  reorderPoint?: number;
  maxStockLevel?: number;
  lastCountDate?: string;
  recordedAt: string;
  createdAt: string;
  adjustmentReason?: string;
  version: number;
};

export type Supplier = {
  id: string;
  name: string;
  code: string;
  category?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  city?: string;
  leadTimeDays: number;
  leadTimeVarianceDays?: number;
  minOrderQuantity?: number;
  minOrderValue?: number;
  paymentTerms?: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Store = {
  id: string;
  code: string;
  name: string;
  manager?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  timezone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  costPrice: number;
  retailPrice: number;
  weight?: number;
  dimensions?: string;
  barcode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseOrder = {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  storeId: string;
  storeName: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "SENT" | "RECEIVED" | "CANCELLED";
  totalAmount: number;
  currency: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  notes?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type PurchaseOrderItem = {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
};

export type User = {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role: "buyer" | "planner" | "approver" | "admin";
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
};

// Auth DTOs
export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

// API Response wrappers
export type PagedResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
};

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
};

// Request DTOs
export type CreateSupplierRequest = {
  name: string;
  code: string;
  category?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  city?: string;
  leadTimeDays: number;
  leadTimeVarianceDays?: number;
  minOrderQuantity?: number;
  minOrderValue?: number;
  paymentTerms?: string;
};

export type UpdateSupplierRequest = Partial<CreateSupplierRequest>;

export type CreateStoreRequest = {
  code: string;
  name: string;
  manager?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  timezone?: string;
};

export type UpdateStoreRequest = Partial<CreateStoreRequest>;

export type CreateProductRequest = {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  costPrice: number;
  retailPrice: number;
  weight?: number;
  dimensions?: string;
  barcode?: string;
};

export type UpdateProductRequest = Partial<CreateProductRequest>;

export type CreateInventoryRequest = {
  storeId: string;
  productId: string;
  quantityOnHand: number;
  quantityOnOrder?: number;
  reorderPoint?: number;
  maxStockLevel?: number;
  costPerUnit: number;
};

export type UpdateInventoryQuantityRequest = {
  quantity: number;
  reason?: string;
};

// Forecasting types (ML API)
export type ForecastRequest = {
  productId: string;
  storeId?: string;
  horizonDays?: number;
  includeComponents?: boolean;
};

export type ForecastResponse = {
  productId: string;
  storeId?: string;
  forecast: ForecastPoint[];
  components?: ForecastComponents;
  modelVersion: string;
  generatedAt: string;
};

export type ForecastPoint = {
  date: string;
  p50: number;
  p90: number;
  trend?: number;
  seasonal?: number;
};

export type ForecastComponents = {
  trend: number[];
  seasonal: number[];
  weekly: number[];
  yearly: number[];
};

// Dashboard types
export type DashboardKPIs = {
  totalProducts: number;
  totalStores: number;
  lowStockItems: number;
  criticalStockItems: number;
  pendingPurchaseOrders: number;
  totalInventoryValue: number;
  averageForecastAccuracy: number;
  lastUpdated: string;
};

export type StockAlert = {
  id: string;
  type: "LOW_STOCK" | "CRITICAL_STOCK" | "OVERSTOCK";
  productId: string;
  productName: string;
  productSku: string;
  storeId: string;
  storeName: string;
  currentQuantity: number;
  reorderPoint: number;
  maxStockLevel: number;
  daysUntilStockout?: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  createdAt: string;
};
