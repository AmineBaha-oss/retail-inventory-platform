-- Inventory performance metrics
{{ config(materialized='table') }}

with inventory_summary as (
    select
        store_id,
        sku,
        on_hand,
        allocated,
        on_order,
        (on_hand + on_order - allocated) as available_stock,
        updated_at
    from {{ ref('stg_inventory_positions') }}
),

low_stock_items as (
    select
        store_id,
        count(*) as low_stock_count
    from inventory_summary
    where available_stock < 10  -- Define low stock threshold
    group by store_id
),

total_inventory_value as (
    select
        i.store_id,
        sum(i.on_hand * p.unit_cost) as total_value
    from inventory_summary i
    left join {{ ref('dim_products') }} p on i.sku = p.sku
    group by i.store_id
)

select
    i.store_id,
    s.store_name,
    count(*) as total_skus,
    sum(i.on_hand) as total_on_hand,
    sum(i.allocated) as total_allocated,
    sum(i.on_order) as total_on_order,
    sum(i.available_stock) as total_available,
    lsi.low_stock_count,
    tiv.total_value,
    current_timestamp as calculated_at
from inventory_summary i
left join {{ ref('dim_stores') }} s on i.store_id = s.store_id
left join low_stock_items lsi on i.store_id = lsi.store_id
left join total_inventory_value tiv on i.store_id = tiv.store_id
group by i.store_id, s.store_name, lsi.low_stock_count, tiv.total_value
