# Retail Inventory Platform - Backend

Intelligent demand forecasting and automated PO generation for multi-store retailers using Prophet-based probabilistic forecasting.

## 🚀 New Features (v2.0)

### Prophet-Based Probabilistic Forecasting

- **P50/P90 Quantiles**: Generate forecasts with confidence intervals for better inventory planning
- **Seasonality Modeling**: Automatic detection of weekly, monthly, quarterly, and yearly patterns
- **Holiday Effects**: Built-in US holiday calendar integration
- **Cross-Validation**: Automatic model performance evaluation with MAE, MAPE, RMSE metrics
- **Model Updates**: Incremental training with new data

### Intelligent Reorder Point Engine

- **P90 Lead Time Demand**: Uses 90th percentile forecasts for conservative inventory planning
- **Safety Stock Calculation**: Dynamic safety stock based on demand and lead time variability
- **Case Pack Optimization**: Respects minimum order quantities and case pack sizes
- **Budget Constraints**: Automatic reorder quantity adjustment within budget limits
- **Urgency Classification**: Critical/High/Medium/Low priority recommendations

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Sales Data    │───▶│  Prophet Model   │───▶│ P50/P90/P95     │
│   (Historical)  │    │   Training       │    │   Forecasts     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Reorder Config  │───▶│ Reorder Engine   │───▶│ Recommendations  │
│ (Service Level, │    │ (Safety Stock,   │    │ (Quantity,      │
│  Lead Time)     │    │  Reorder Point)  │    │  Urgency)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📊 API Endpoints

### Forecasting

#### Train Model

```http
POST /api/v1/forecasting/train
Content-Type: application/json

{
  "product_id": "PROD_001",
  "store_id": "STORE_001",
  "sales_data": [
    {"date": "2024-01-01", "quantity_sold": 10},
    {"date": "2024-01-02", "quantity_sold": 15}
  ]
}
```

#### Generate Forecast

```http
POST /api/v1/forecasting/generate
Content-Type: application/json

{
  "product_id": "PROD_001",
  "store_id": "STORE_001",
  "horizon_days": 30,
  "include_components": true
}
```

#### Get Model Performance

```http
GET /api/v1/forecasting/PROD_001/performance?store_id=STORE_001
```

### Inventory & Reorder Points

#### Get Reorder Recommendations

```http
POST /api/v1/inventory/reorder-recommendations
Content-Type: application/json

{
  "inventory_items": [
    {
      "product_id": "PROD_001",
      "store_id": "STORE_001",
      "current_inventory": 75,
      "unit_cost": 25.99
    }
  ],
  "config": {
    "service_level": 0.95,
    "lead_time_days": 7,
    "lead_time_std_days": 2.0,
    "min_order_quantity": 1,
    "case_pack_size": 1
  }
}
```

#### Calculate Reorder Points

```http
POST /api/v1/inventory/reorder-points/calculate
Content-Type: application/json

{
  "product_id": "PROD_001",
  "store_id": "STORE_001",
  "current_inventory": 75,
  "unit_cost": 25.99,
  "config": {
    "service_level": 0.95,
    "lead_time_days": 7,
    "lead_time_std_days": 2.0
  }
}
```

## 🔧 Configuration

### Prophet Forecaster

```python
from core.forecasting.models import ProphetForecaster

forecaster = ProphetForecaster(
    confidence_level=0.95,           # 95% confidence intervals
    seasonality_mode='multiplicative', # Multiplicative seasonality
    changepoint_prior_scale=0.05,    # Flexibility of trend changes
    seasonality_prior_scale=10.0     # Strength of seasonality
)
```

### Reorder Engine

```python
from core.optimization.reorder_engine import ReorderPointConfig

config = ReorderPointConfig(
    service_level=0.95,        # 95% service level
    lead_time_days=7,          # Expected lead time
    lead_time_std_days=2.0,    # Lead time variability
    min_order_quantity=1,      # Minimum order size
    case_pack_size=1,          # Case pack size
    budget_cap=1000.0          # Optional budget constraint
)
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
cd backend
python test_forecasting.py
```

This will test:

- Prophet model training and forecasting
- Reorder point calculations
- Integration between forecasting and reorder engines

## 📈 Example Usage

### 1. Train a Forecasting Model

```python
from core.forecasting.models import ProphetForecaster
import pandas as pd

# Initialize forecaster
forecaster = ProphetForecaster()

# Load historical sales data
sales_data = pd.read_csv('sales_history.csv')

# Train model
result = forecaster.train(sales_data, "PROD_001", "STORE_001")
print(f"Model trained with MAE: {result['performance_metrics']['mae']:.2f}")
```

### 2. Generate Forecasts

```python
# Generate 30-day forecast
forecast = forecaster.forecast("PROD_001", 30, "STORE_001")

# Access different quantiles
p50_forecast = forecast['p50_forecast']  # Median forecast
p90_forecast = forecast['p90_forecast']  # 90th percentile
p95_forecast = forecast['p95_forecast']  # 95th percentile
```

### 3. Calculate Reorder Points

```python
from core.optimization.reorder_engine import ReorderPointEngine, ReorderPointConfig

# Initialize reorder engine
config = ReorderPointConfig(
    service_level=0.95,
    lead_time_days=7,
    lead_time_std_days=2.0
)
engine = ReorderPointEngine(config)

# Generate reorder recommendation
recommendation = engine.generate_reorder_recommendation(
    "PROD_001",
    "STORE_001",
    current_inventory=75,
    daily_forecasts=p90_forecast,  # Use P90 forecasts
    unit_cost=25.99,
    config=config
)

print(f"Reorder point: {recommendation.reorder_point}")
print(f"Reorder quantity: {recommendation.reorder_quantity}")
print(f"Urgency: {recommendation.urgency}")
```

## 🔍 Key Benefits

1. **Probabilistic Forecasting**: P50/P90 quantiles provide better uncertainty quantification
2. **Automatic Seasonality**: Prophet handles complex seasonal patterns automatically
3. **Conservative Planning**: P90-based reorder points reduce stockout risk
4. **Performance Metrics**: Cross-validation provides model accuracy insights
5. **Flexible Configuration**: Customizable service levels, lead times, and constraints

## 🚧 Next Steps

- [ ] Integrate with TimescaleDB for time-series storage
- [ ] Add Shopify/Lightspeed webhook ingestion
- [ ] Implement PO approval workflow
- [ ] Add real-time dashboard with SSE/WebSockets
- [ ] Migrate frontend to Next.js + Tailwind + shadcn/ui

## 📚 Dependencies

- **FastAPI**: Modern web framework
- **Prophet**: Facebook's forecasting library
- **Pandas**: Data manipulation
- **NumPy**: Numerical computing
- **TimescaleDB**: Time-series database (PostgreSQL extension)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
