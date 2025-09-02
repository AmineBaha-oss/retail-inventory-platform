-- Fact table for daily sales with dimensions
{{ config(materialized='table') }}

select
    s.store_id,
    s.sku,
    s.date,
    s.qty_sold,
    s.revenue,
    p.product_id,
    p.product_name,
    p.category,
    p.brand,
    p.unit_cost,
    p.unit_price,
    st.store_name,
    st.store_code,
    st.city,
    st.country,
    s.created_at,
    s.updated_at
from {{ ref('stg_sales_daily') }} s
left join {{ ref('dim_products') }} p on s.sku = p.sku
left join {{ ref('dim_stores') }} st on s.store_id = st.store_id
