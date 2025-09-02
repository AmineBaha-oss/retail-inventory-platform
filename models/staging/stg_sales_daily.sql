-- Staging model for daily sales data from TimescaleDB hypertable
{{ config(materialized='view') }}

select
    store_id,
    sku,
    date,
    qty_sold,
    revenue,
    created_at,
    updated_at
from {{ source('raw', 'sales_daily') }}

-- Add data quality tests
where date >= '2020-01-01'  -- Filter out very old data
  and qty_sold >= 0         -- Ensure non-negative quantities
  and revenue >= 0          -- Ensure non-negative revenue
