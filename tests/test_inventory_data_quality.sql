-- Test for inventory data quality
select *
from {{ ref('stg_inventory_positions') }}
where on_hand < 0
   or allocated < 0
   or on_order < 0
   or allocated > on_hand
