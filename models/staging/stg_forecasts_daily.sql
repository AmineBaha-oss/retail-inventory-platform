-- Staging model for daily forecasts from TimescaleDB hypertable
{{ config(materialized='view') }}

select
    store_id,
    sku,
    date,
    p50,
    p90,
    model_version,
    created_at,
    updated_at
from {{ source('raw', 'forecasts_daily') }}

-- Add data quality tests
where date >= '2020-01-01'  -- Filter out very old data
  and p50 >= 0              -- Ensure non-negative P50 forecasts
  and p90 >= 0              -- Ensure non-negative P90 forecasts
  and p90 >= p50            -- Ensure P90 >= P50
