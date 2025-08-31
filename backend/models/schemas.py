"""
Pydantic schemas for API requests and responses.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from enum import Enum


# Enums
class UserRole(str, Enum):
    BUYER = "buyer"
    PLANNER = "planner"
    APPROVER = "approver"
    ADMIN = "admin"


class POStatus(str, Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    SENT = "sent"
    RECEIVED = "received"
    CANCELLED = "cancelled"


class TransactionType(str, Enum):
    SALE = "sale"
    RETURN = "return"
    ADJUSTMENT = "adjustment"


# Base schemas
class BaseSchema(BaseModel):
    """Base schema with common fields."""
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }


# User schemas
class UserBase(BaseSchema):
    email: str = Field(..., description="User email address")
    username: str = Field(..., description="Username")
    full_name: Optional[str] = Field(None, description="Full name")
    role: UserRole = Field(UserRole.BUYER, description="User role")


class UserCreate(UserBase):
    password: str = Field(..., description="Plain text password", min_length=8)


class UserUpdate(BaseSchema):
    email: Optional[str] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


# Store schemas
class StoreBase(BaseSchema):
    name: str = Field(..., description="Store name")
    code: str = Field(..., description="Store code")
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    timezone: str = Field("UTC", description="Store timezone")


class StoreCreate(StoreBase):
    pass


class StoreUpdate(BaseSchema):
    name: Optional[str] = None
    code: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    timezone: Optional[str] = None


class StoreResponse(StoreBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


# Supplier schemas
class SupplierBase(BaseSchema):
    name: str = Field(..., description="Supplier name")
    code: str = Field(..., description="Supplier code")
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    lead_time_days: int = Field(7, description="Average lead time in days")
    lead_time_variance_days: int = Field(2, description="Lead time variance in days")
    payment_terms: Optional[str] = None


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseSchema):
    name: Optional[str] = None
    code: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    lead_time_days: Optional[int] = None
    lead_time_variance_days: Optional[int] = None
    payment_terms: Optional[str] = None


class SupplierResponse(SupplierBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


# Product schemas
class ProductBase(BaseSchema):
    sku: str = Field(..., description="Product SKU")
    name: str = Field(..., description="Product name")
    description: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    unit_cost: Optional[float] = Field(None, ge=0, description="Unit cost")
    unit_price: Optional[float] = Field(None, ge=0, description="Unit price")
    case_pack_size: int = Field(1, ge=1, description="Case pack size")
    min_order_quantity: int = Field(1, ge=1, description="Minimum order quantity")
    supplier_id: str = Field(..., description="Supplier ID")


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseSchema):
    sku: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    unit_cost: Optional[float] = None
    unit_cost: Optional[float] = None
    case_pack_size: Optional[int] = None
    min_order_quantity: Optional[int] = None
    supplier_id: Optional[str] = None


class ProductResponse(ProductBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


# Inventory schemas
class InventoryBase(BaseSchema):
    store_id: str = Field(..., description="Store ID")
    product_id: str = Field(..., description="Product ID")
    quantity_on_hand: int = Field(0, ge=0, description="Quantity on hand")
    quantity_committed: int = Field(0, ge=0, description="Committed quantity")
    quantity_available: int = Field(0, ge=0, description="Available quantity")
    reorder_point: int = Field(0, ge=0, description="Reorder point")
    safety_stock: int = Field(0, ge=0, description="Safety stock level")
    max_stock: int = Field(0, ge=0, description="Maximum stock level")


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(BaseSchema):
    quantity_on_hand: Optional[int] = None
    quantity_committed: Optional[int] = None
    quantity_available: Optional[int] = None
    reorder_point: Optional[int] = None
    safety_stock: Optional[int] = None
    max_stock: Optional[int] = None


class InventoryResponse(InventoryBase):
    id: str
    last_updated: datetime


# Sales transaction schemas
class SalesTransactionBase(BaseSchema):
    store_id: str = Field(..., description="Store ID")
    product_id: str = Field(..., description="Product ID")
    transaction_date: datetime = Field(..., description="Transaction date")
    quantity_sold: int = Field(..., gt=0, description="Quantity sold")
    unit_price: float = Field(..., gt=0, description="Unit price")
    total_amount: float = Field(..., gt=0, description="Total amount")
    customer_id: Optional[str] = None
    transaction_type: TransactionType = Field(TransactionType.SALE, description="Transaction type")


class SalesTransactionCreate(SalesTransactionBase):
    pass


class SalesTransactionResponse(SalesTransactionBase):
    id: str
    created_at: datetime


# Forecast schemas
class ForecastBase(BaseSchema):
    store_id: str = Field(..., description="Store ID")
    product_id: str = Field(..., description="Product ID")
    forecast_date: date = Field(..., description="Forecast date")
    forecast_horizon_days: int = Field(..., gt=0, description="Forecast horizon in days")
    forecasted_quantity: float = Field(..., description="Forecasted quantity")
    confidence_lower: Optional[float] = Field(None, description="Lower confidence bound")
    confidence_upper: Optional[float] = Field(None, description="Upper confidence bound")
    confidence_level: float = Field(0.95, description="Confidence level")
    model_version: Optional[str] = None
    accuracy_metrics: Optional[Dict[str, Any]] = None


class ForecastCreate(ForecastBase):
    pass


class ForecastResponse(ForecastBase):
    id: str
    created_at: datetime


# Purchase order schemas
class PurchaseOrderBase(BaseSchema):
    supplier_id: str = Field(..., description="Supplier ID")
    store_id: str = Field(..., description="Store ID")
    expected_delivery_date: Optional[datetime] = None


class PurchaseOrderCreate(PurchaseOrderBase):
    pass


class PurchaseOrderUpdate(BaseSchema):
    status: Optional[POStatus] = None
    expected_delivery_date: Optional[datetime] = None


class PurchaseOrderResponse(PurchaseOrderBase):
    id: str
    po_number: str
    status: POStatus
    total_amount: float
    created_by: str
    approved_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# Purchase order item schemas
class PurchaseOrderItemBase(BaseSchema):
    product_id: str = Field(..., description="Product ID")
    quantity_ordered: int = Field(..., gt=0, description="Quantity ordered")
    unit_cost: float = Field(..., gt=0, description="Unit cost")
    notes: Optional[str] = None


class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass


class PurchaseOrderItemResponse(PurchaseOrderItemBase):
    id: str
    purchase_order_id: str
    total_cost: float


# Authentication schemas
class Token(BaseSchema):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseSchema):
    username: Optional[str] = None


# API response schemas
class PaginatedResponse(BaseSchema):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int


class ErrorResponse(BaseSchema):
    detail: str
    error_code: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Forecasting request schemas
class ForecastRequest(BaseSchema):
    store_ids: List[str] = Field(..., description="Store IDs to forecast")
    product_ids: List[str] = Field(..., description="Product IDs to forecast")
    horizon_days: int = Field(90, ge=1, le=365, description="Forecast horizon in days")
    confidence_level: float = Field(0.95, ge=0.5, le=0.99, description="Confidence level")


class ScenarioRequest(BaseSchema):
    scenario_name: str = Field(..., description="Scenario name")
    store_ids: List[str] = Field(..., description="Store IDs")
    product_ids: List[str] = Field(..., description="Product IDs")
    demand_multiplier: float = Field(1.0, description="Demand multiplier")
    lead_time_adjustment_days: int = Field(0, description="Lead time adjustment in days")
    promo_start_date: Optional[date] = None
    promo_end_date: Optional[date] = None
    promo_uplift_percent: float = Field(0.0, ge=0, description="Promotional uplift percentage")
