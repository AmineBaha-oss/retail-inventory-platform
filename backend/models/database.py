"""
Database models and configuration.
"""

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Optional
import uuid

from core.config import settings

# Database engine - using SQLite for development simplicity
DATABASE_URL = "sqlite+aiosqlite:///./retail_inventory.db"

# Create async engine for SQLite
engine = create_async_engine(
    DATABASE_URL,
    echo=settings.DEBUG,
    connect_args={"check_same_thread": False}
)

# Session factory
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for models
Base = declarative_base()

# Metadata
metadata = MetaData()


class User(Base):
    """User model for authentication and authorization."""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="buyer")  # buyer, planner, approver, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class Store(Base):
    """Store/location model."""
    __tablename__ = "stores"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)
    address = Column(Text)
    city = Column(String)
    state = Column(String)
    country = Column(String)
    postal_code = Column(String)
    timezone = Column(String, default="UTC")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class Supplier(Base):
    """Supplier/vendor model."""
    __tablename__ = "suppliers"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)
    contact_email = Column(String)
    contact_phone = Column(String)
    address = Column(Text)
    lead_time_days = Column(Integer, default=7)
    lead_time_variance_days = Column(Integer, default=2)
    payment_terms = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class Product(Base):
    """Product/SKU model."""
    __tablename__ = "products"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sku = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    brand = Column(String)
    unit_cost = Column(Float)
    unit_price = Column(Float)
    case_pack_size = Column(Integer, default=1)
    min_order_quantity = Column(Integer, default=1)
    supplier_id = Column(String, ForeignKey("suppliers.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    supplier = relationship("Supplier", backref="products")


class Inventory(Base):
    """Inventory levels by store and product."""
    __tablename__ = "inventory"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    store_id = Column(String, ForeignKey("stores.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    quantity_on_hand = Column(Integer, default=0)
    quantity_committed = Column(Integer, default=0)
    quantity_available = Column(Integer, default=0)
    reorder_point = Column(Integer, default=0)
    safety_stock = Column(Integer, default=0)
    max_stock = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    store = relationship("Store", backref="inventory")
    product = relationship("Product", backref="inventory")


class SalesTransaction(Base):
    """Sales transaction history."""
    __tablename__ = "sales_transactions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    store_id = Column(String, ForeignKey("stores.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    transaction_date = Column(DateTime, nullable=False)
    quantity_sold = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    customer_id = Column(String)
    transaction_type = Column(String, default="sale")  # sale, return, adjustment
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    store = relationship("Store", backref="sales_transactions")
    product = relationship("Product", backref="sales_transactions")


class Forecast(Base):
    """Demand forecasts by product, store, and date."""
    __tablename__ = "forecasts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    store_id = Column(String, ForeignKey("stores.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    forecast_date = Column(DateTime, nullable=False)
    forecast_horizon_days = Column(Integer, nullable=False)
    forecasted_quantity = Column(Float, nullable=False)
    confidence_lower = Column(Float)
    confidence_upper = Column(Float)
    confidence_level = Column(Float, default=0.95)
    model_version = Column(String)
    accuracy_metrics = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    store = relationship("Store", backref="forecasts")
    product = relationship("Product", backref="forecasts")


class PurchaseOrder(Base):
    """Purchase order model."""
    __tablename__ = "purchase_orders"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    po_number = Column(String, unique=True, nullable=False)
    supplier_id = Column(String, ForeignKey("suppliers.id"), nullable=False)
    store_id = Column(String, ForeignKey("stores.id"), nullable=False)
    status = Column(String, default="draft")  # draft, pending_approval, approved, sent, received
    total_amount = Column(Float, default=0.0)
    expected_delivery_date = Column(DateTime)
    created_by = Column(String, ForeignKey("users.id"))
    approved_by = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    supplier = relationship("Supplier", backref="purchase_orders")
    store = relationship("Store", backref="purchase_orders")
    created_by_user = relationship("User", foreign_keys=[created_by])
    approved_by_user = relationship("User", foreign_keys=[approved_by])


class PurchaseOrderItem(Base):
    """Individual items in a purchase order."""
    __tablename__ = "purchase_order_items"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    purchase_order_id = Column(String, ForeignKey("purchase_orders.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    quantity_ordered = Column(Integer, default=0)
    unit_cost = Column(Float, default=0.0)
    total_cost = Column(Float, default=0.0)
    notes = Column(Text)
    
    # Relationships
    purchase_order = relationship("PurchaseOrder", backref="items")
    product = relationship("Product", backref="purchase_order_items")


# Database dependency
async def get_db():
    """Database session dependency."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
