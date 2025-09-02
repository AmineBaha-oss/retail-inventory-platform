-- Test for forecast data quality
select *
from {{ ref('stg_forecasts_daily') }}
where p50 < 0
   or p90 < 0
   or p90 < p50
   or date > current_date + interval '365 days'
   or date < '2020-01-01'
