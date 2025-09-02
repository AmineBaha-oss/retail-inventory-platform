-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create sales_daily hypertable for time-series data
CREATE TABLE IF NOT EXISTS sales_daily (
    store_id VARCHAR(255) NOT NULL,
    sku VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    qty_sold DECIMAL(10,2),
    revenue DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(store_id, sku, date)
);

-- Create hypertable for sales_daily
SELECT create_hypertable('sales_daily', 'date', if_not_exists => TRUE);

-- Create forecasts_daily hypertable
CREATE TABLE IF NOT EXISTS forecasts_daily (
    store_id VARCHAR(255) NOT NULL,
    sku VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    p50 DECIMAL(10,2),
    p90 DECIMAL(10,2),
    model_version VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(store_id, sku, date)
);

-- Create hypertable for forecasts_daily
SELECT create_hypertable('forecasts_daily', 'date', if_not_exists => TRUE);

-- Create inventory_positions table
CREATE TABLE IF NOT EXISTS inventory_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id VARCHAR(255) NOT NULL,
    sku VARCHAR(255) NOT NULL,
    on_hand DECIMAL(10,2) NOT NULL DEFAULT 0,
    allocated DECIMAL(10,2) NOT NULL DEFAULT 0,
    on_order DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, sku)
);

-- Create audit_events table for tracking changes
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(255) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payload JSONB
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_daily_store_sku ON sales_daily(store_id, sku);
CREATE INDEX IF NOT EXISTS idx_forecasts_daily_store_sku ON forecasts_daily(store_id, sku);
CREATE INDEX IF NOT EXISTS idx_inventory_positions_store_sku ON inventory_positions(store_id, sku);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON audit_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON audit_events(timestamp);
