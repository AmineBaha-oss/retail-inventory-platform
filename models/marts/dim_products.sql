-- Dimension table for products
{{ config(materialized='table') }}

select
    p.id as product_id,
    p.sku,
    p.name as product_name,
    p.category,
    p.brand,
    p.unit_cost,
    p.unit_price,
    p.case_pack_size,
    p.status as product_status,
    s.name as supplier_name,
    s.lead_time_days,
    p.created_at,
    p.updated_at
from {{ source('raw', 'products') }} p
left join {{ source('raw', 'suppliers') }} s on p.supplier_id = s.id
