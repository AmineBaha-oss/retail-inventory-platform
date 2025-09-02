-- Staging model for inventory positions
{{ config(materialized='view') }}

select
    id,
    store_id,
    sku,
    on_hand,
    allocated,
    on_order,
    created_at,
    updated_at
from {{ source('raw', 'inventory_positions') }}

-- Add data quality tests
where on_hand >= 0          -- Ensure non-negative on hand
  and allocated >= 0        -- Ensure non-negative allocated
  and on_order >= 0         -- Ensure non-negative on order
