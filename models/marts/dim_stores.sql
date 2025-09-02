-- Dimension table for stores
{{ config(materialized='table') }}

select
    id as store_id,
    code as store_code,
    name as store_name,
    address,
    city,
    country,
    timezone,
    status as store_status,
    created_at,
    updated_at
from {{ source('raw', 'stores') }}
