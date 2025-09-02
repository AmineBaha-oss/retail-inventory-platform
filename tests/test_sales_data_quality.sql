-- Test for sales data quality
select *
from {{ ref('stg_sales_daily') }}
where qty_sold < 0
   or revenue < 0
   or date > current_date
   or date < '2020-01-01'
