-- Migration to convert VARCHAR IDs to UUID for existing tables
-- This fixes the schema mismatch between entities (UUID) and existing tables (VARCHAR)

-- 1) Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Convert existing tables to use UUID for store_id columns
-- Note: Only converting tables that actually exist from V1 migration

-- Convert inventory_positions table
ALTER TABLE IF EXISTS inventory_positions ALTER COLUMN store_id TYPE uuid USING store_id::uuid;

-- Convert sales_daily table  
ALTER TABLE IF EXISTS sales_daily ALTER COLUMN store_id TYPE uuid USING store_id::uuid;

-- Convert forecasts_daily table
ALTER TABLE IF EXISTS forecasts_daily ALTER COLUMN store_id TYPE uuid USING store_id::uuid;

-- Note: audit_events.entity_id should remain VARCHAR as it can reference various entity types

-- 3) Set DB-side UUID defaults for new rows (only for existing tables)
ALTER TABLE inventory_positions ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE audit_events ALTER COLUMN id SET DEFAULT gen_random_uuid();
