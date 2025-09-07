// API Response Types - Matching Backend DTOs

// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Store Types
export interface Store extends BaseEntity {
  code: string;
  name: string;
  manager?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isActive: boolean;
  // API response fields
  active?: boolean;
  status?: string;
  productCount?: number;
  timezone?: string;
}

export interface StoreCreateRequest {
  code: string;
  name: string;
  manager?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isActive?: boolean;
}

export interface StoreUpdateRequest {
  name?: string;
  manager?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isActive?: boolean;
}

// Supplier Types
export interface Supplier extends BaseEntity {
  code: string;
  name: string;
  category?: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isActive: boolean;
  leadTimeDays?: number;
  minimumOrderValue?: number;
  paymentTerms?: string;
  // API response fields
  status?: string;
  minOrderQuantity?: number;
  minOrderValue?: number;
}

export interface SupplierCreateRequest {
  code: string;
  name: string;
  category?: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isActive?: boolean;
  leadTimeDays?: number;
  minimumOrderValue?: number;
  paymentTerms?: string;
}

export interface SupplierUpdateRequest {
  name?: string;
  category?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isActive?: boolean;
  leadTimeDays?: number;
  minimumOrderValue?: number;
  paymentTerms?: string;
}

// Product Types
export type ProductStatus = "ACTIVE" | "INACTIVE" | "DISCONTINUED";

export interface Product extends BaseEntity {
  sku?: string; // Optional - auto-generated if not provided
  name: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  description?: string;
  unitCost?: number;
  unitPrice?: number;
  casePackSize?: number;
  supplierId?: string;
  supplierName?: string;
  status: ProductStatus;
}

export interface ProductCreateRequest {
  sku?: string; // Optional - auto-generated if not provided
  name: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  description?: string;
  unitCost?: number;
  unitPrice?: number;
  casePackSize?: number;
  supplierId: string;
  status?: ProductStatus;
}

export interface ProductUpdateRequest {
  name?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  description?: string;
  unitCost?: number;
  unitPrice?: number;
  casePackSize?: number;
  supplierId?: string;
  status?: ProductStatus;
}

// Inventory Types
export interface Inventory extends BaseEntity {
  storeId: string;
  storeCode?: string;
  storeName?: string;
  productId: string;
  productSku?: string;
  productName?: string;
  quantityOnHand: number;
  reservedQuantity?: number;
  reorderLevel?: number;
  maxStockLevel?: number;
  unitCost?: number;
  totalValue?: number;
  lastUpdated: string;
}

export interface InventoryCreateRequest {
  storeId: string;
  productId: string;
  quantityOnHand: number;
  reservedQuantity?: number;
  reorderLevel?: number;
  maxStockLevel?: number;
  unitCost?: number;
}

export interface InventoryUpdateRequest {
  quantityOnHand?: number;
  reservedQuantity?: number;
  reorderLevel?: number;
  maxStockLevel?: number;
  unitCost?: number;
}

export interface InventoryQuantityUpdateRequest {
  quantityOnHand: number;
  reservedQuantity?: number;
}

// Purchase Order Types
export type PurchaseOrderStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "PROCESSING"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED"
  | "REJECTED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface PurchaseOrder extends BaseEntity {
  poNumber?: string; // Optional - auto-generated if not provided
  supplierId?: string;
  supplierName?: string;
  storeId?: string;
  storeName?: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  taxAmount?: number;
  shippingAmount?: number;
  orderDate?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  sentAt?: string;
  receivedAt?: string;
  priority: Priority;
  notes?: string;
  itemCount?: number;
}

export interface PurchaseOrderCreateRequest {
  poNumber?: string; // Optional - auto-generated if not provided
  supplierId: string;
  storeId: string;
  status?: PurchaseOrderStatus;
  taxAmount?: number;
  shippingAmount?: number;
  orderDate?: string;
  expectedDeliveryDate?: string;
  createdBy?: string;
  priority?: Priority;
  notes?: string;
}

export interface PurchaseOrderUpdateRequest {
  status?: PurchaseOrderStatus;
  taxAmount?: number;
  shippingAmount?: number;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  approvedBy?: string;
  approvedAt?: string;
  priority?: Priority;
  notes?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Error Types
export interface ApiError {
  message: string;
  status: number;
  details?: string;
  timestamp?: string;
}

// Dashboard Types (for future use)
export interface DashboardKPIs {
  totalStores: number;
  totalProducts: number;
  totalInventoryValue: number;
  lowStockItems: number;
  pendingPurchaseOrders: number;
  activeSuppliers: number;
}
