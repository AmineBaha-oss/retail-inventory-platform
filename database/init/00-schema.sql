-- Base schema for core domain entities required before data load
-- Generated to allow PostgreSQL init scripts to load test data without relying on Hibernate create.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    manager VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    timezone VARCHAR(100),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    status VARCHAR(20),
    lead_time_days INT,
    min_order_quantity INT,
    min_order_value NUMERIC(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    brand VARCHAR(100),
    description TEXT,
    unit_cost NUMERIC(10,2),
    unit_price NUMERIC(10,2),
    case_pack_size INT,
    supplier_id UUID REFERENCES suppliers(id),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recorded_at TIMESTAMP NOT NULL,
    store_id UUID NOT NULL REFERENCES stores(id),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity_on_hand NUMERIC(10,2) NOT NULL,
    quantity_on_order NUMERIC(10,2) DEFAULT 0,
    quantity_reserved NUMERIC(10,2) DEFAULT 0,
    reorder_point INT,
    max_stock_level INT,
    cost_per_unit NUMERIC(10,2),
    last_count_date DATE,
    adjustment_reason TEXT,
    idempotency_key VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    store_id UUID NOT NULL REFERENCES stores(id),
    status VARCHAR(50),
    total_amount NUMERIC(12,2) DEFAULT 0,
    tax_amount NUMERIC(12,2) DEFAULT 0,
    shipping_amount NUMERIC(12,2) DEFAULT 0,
    order_date DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    sent_at TIMESTAMP,
    received_at TIMESTAMP,
    priority VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity_ordered INT NOT NULL,
    quantity_received INT DEFAULT 0,
    unit_cost NUMERIC(10,2) NOT NULL,
    total_cost NUMERIC(12,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
