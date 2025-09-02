-- Forecast accuracy metrics
{{ config(materialized='table') }}

with forecast_vs_actual as (
    select
        f.store_id,
        f.sku,
        f.date,
        f.p50 as forecast_p50,
        f.p90 as forecast_p90,
        s.qty_sold as actual_sales,
        abs(f.p50 - s.qty_sold) as p50_error,
        abs(f.p90 - s.qty_sold) as p90_error,
        case 
            when s.qty_sold = 0 then 0
            else abs(f.p50 - s.qty_sold) / s.qty_sold 
        end as p50_mape,
        case 
            when s.qty_sold = 0 then 0
            else abs(f.p90 - s.qty_sold) / s.qty_sold 
        end as p90_mape
    from {{ ref('stg_forecasts_daily') }} f
    inner join {{ ref('stg_sales_daily') }} s 
        on f.store_id = s.store_id 
        and f.sku = s.sku 
        and f.date = s.date
    where f.date >= current_date - interval '30 days'  -- Last 30 days
),

accuracy_summary as (
    select
        store_id,
        sku,
        count(*) as forecast_periods,
        avg(p50_error) as avg_p50_error,
        avg(p90_error) as avg_p90_error,
        avg(p50_mape) as avg_p50_mape,
        avg(p90_mape) as avg_p90_mape,
        (1 - avg(p50_mape)) as p50_accuracy,
        (1 - avg(p90_mape)) as p90_accuracy
    from forecast_vs_actual
    group by store_id, sku
)

select
    a.store_id,
    s.store_name,
    a.sku,
    p.product_name,
    a.forecast_periods,
    a.avg_p50_error,
    a.avg_p90_error,
    a.avg_p50_mape,
    a.avg_p90_mape,
    a.p50_accuracy,
    a.p90_accuracy,
    current_timestamp as calculated_at
from accuracy_summary a
left join {{ ref('dim_stores') }} s on a.store_id = s.store_id
left join {{ ref('dim_products') }} p on a.sku = p.sku
