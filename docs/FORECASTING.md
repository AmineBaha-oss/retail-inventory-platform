# Forecasting Guide - ML Forecasting Implementation

This guide covers the machine learning forecasting capabilities of the Retail Inventory Platform, including model implementation, configuration, and best practices.

## Table of Contents

- [Overview](#overview)
- [Forecasting Models](#forecasting-models)
- [Data Requirements](#data-requirements)
- [Model Configuration](#model-configuration)
- [Forecast Generation](#forecast-generation)
- [Model Evaluation](#model-evaluation)
- [API Usage](#api-usage)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The Retail Inventory Platform uses advanced machine learning algorithms to predict demand for products across multiple stores. The forecasting system is built on Python with FastAPI and integrates with the main Spring Boot application.

### Key Features

- **Multiple ML Models**: ARIMA, Exponential Smoothing, Prophet, and custom models
- **Probabilistic Forecasts**: Confidence intervals and uncertainty quantification
- **Multi-level Forecasting**: Store, product, and category-level predictions
- **Seasonal Analysis**: Automatic seasonal pattern detection
- **Promotional Impact**: Account for sales and promotional events
- **Real-time Updates**: Continuous model retraining and forecast updates

## Forecasting Models

### ARIMA (AutoRegressive Integrated Moving Average)

ARIMA is a classical time series forecasting method that works well for stationary data.

#### Model Components

- **AR (AutoRegressive)**: Uses past values to predict future values
- **I (Integrated)**: Differencing to make data stationary
- **MA (Moving Average)**: Uses past forecast errors

#### Configuration

```python
# ARIMA model configuration
arima_config = {
    "order": (1, 1, 1),  # (p, d, q) parameters
    "seasonal_order": (1, 1, 1, 12),  # Seasonal parameters
    "trend": "c",  # Constant trend
    "method": "css-ml"  # Maximum likelihood estimation
}
```

#### When to Use ARIMA

- **Stationary Data**: Data with consistent patterns
- **Short-term Forecasts**: 1-12 weeks ahead
- **Seasonal Patterns**: Clear seasonal cycles
- **Limited Data**: Works with smaller datasets

### Exponential Smoothing

Exponential smoothing methods are effective for data with trends and seasonality.

#### Holt-Winters Method

```python
# Triple exponential smoothing configuration
holt_winters_config = {
    "trend": "add",  # Additive trend
    "seasonal": "add",  # Additive seasonality
    "seasonal_periods": 12,  # Monthly seasonality
    "smoothing_level": 0.2,
    "smoothing_trend": 0.1,
    "smoothing_seasonal": 0.1
}
```

#### When to Use Exponential Smoothing

- **Trending Data**: Data with clear trends
- **Seasonal Data**: Regular seasonal patterns
- **Medium-term Forecasts**: 1-6 months ahead
- **Robust Performance**: Good default choice

### Prophet

Prophet is Facebook's forecasting tool designed for business time series.

#### Configuration

```python
prophet_config = {
    "growth": "linear",  # Linear or logistic growth
    "seasonality_mode": "additive",  # Additive or multiplicative
    "yearly_seasonality": True,
    "weekly_seasonality": True,
    "daily_seasonality": False,
    "holidays": "auto",  # Automatic holiday detection
    "changepoint_prior_scale": 0.05,
    "seasonality_prior_scale": 10.0
}
```

#### When to Use Prophet

- **Business Data**: Designed for business time series
- **Holiday Effects**: Automatic holiday detection
- **Missing Data**: Handles missing values well
- **Long-term Forecasts**: 3-12 months ahead

### Custom Models

The platform supports custom machine learning models for specific business needs.

#### Neural Network Models

```python
# LSTM configuration for deep learning
lstm_config = {
    "sequence_length": 30,  # Input sequence length
    "hidden_units": 50,  # LSTM hidden units
    "dropout": 0.2,  # Dropout rate
    "epochs": 100,  # Training epochs
    "batch_size": 32,  # Batch size
    "validation_split": 0.2  # Validation data split
}
```

## Data Requirements

### Historical Data

#### Minimum Requirements

- **Time Series Length**: At least 2 years of historical data
- **Data Frequency**: Daily or weekly data points
- **Data Quality**: Complete data with minimal gaps
- **Seasonal Coverage**: At least 2 complete seasonal cycles

#### Data Quality Standards

- **Completeness**: < 5% missing data
- **Accuracy**: < 2% data errors
- **Consistency**: Consistent data collection methods
- **Timeliness**: Data updated within 24 hours

### Data Sources

#### Sales Data

```sql
-- Sales data structure
CREATE TABLE sales_daily (
    date DATE NOT NULL,
    store_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity_sold INTEGER NOT NULL,
    revenue DECIMAL(10,2) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    promotion_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Inventory Data

```sql
-- Inventory data structure
CREATE TABLE inventory_positions (
    store_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity_on_hand INTEGER NOT NULL,
    quantity_committed INTEGER DEFAULT 0,
    quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_committed),
    reorder_point INTEGER NOT NULL,
    safety_stock INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### External Factors

- **Weather Data**: Temperature, precipitation, events
- **Economic Indicators**: GDP, inflation, consumer confidence
- **Competitor Data**: Market share, pricing
- **Promotional Data**: Sales events, marketing campaigns

## Model Configuration

### Model Selection

The system automatically selects the best model based on data characteristics:

```python
def select_best_model(historical_data):
    """
    Automatically select the best forecasting model
    based on data characteristics and performance
    """
    # Check data characteristics
    if has_seasonality(historical_data):
        if has_trend(historical_data):
            return "prophet"  # Best for seasonal + trend
        else:
            return "exponential_smoothing"  # Seasonal only
    elif has_trend(historical_data):
        return "arima"  # Trend only
    else:
        return "simple_average"  # No pattern
```

### Parameter Tuning

#### Grid Search

```python
# ARIMA parameter grid search
arima_params = {
    'p': range(0, 3),
    'd': range(0, 2),
    'q': range(0, 3),
    'seasonal_p': range(0, 2),
    'seasonal_d': range(0, 2),
    'seasonal_q': range(0, 2)
}

# Find best parameters using AIC
best_params = grid_search_arima(data, arima_params)
```

#### Bayesian Optimization

```python
# Bayesian optimization for hyperparameter tuning
from skopt import gp_minimize
from skopt.space import Real, Integer

space = [
    Integer(1, 10, name='hidden_units'),
    Real(0.1, 0.9, name='dropout_rate'),
    Integer(10, 100, name='sequence_length')
]

result = gp_minimize(objective_function, space, n_calls=50)
```

### Model Validation

#### Time Series Cross-Validation

```python
def time_series_cv(model, data, n_splits=5):
    """
    Time series cross-validation to evaluate model performance
    """
    tscv = TimeSeriesSplit(n_splits=n_splits)
    scores = []

    for train_idx, test_idx in tscv.split(data):
        train_data = data[train_idx]
        test_data = data[test_idx]

        model.fit(train_data)
        predictions = model.predict(len(test_data))
        score = calculate_accuracy(predictions, test_data)
        scores.append(score)

    return np.mean(scores), np.std(scores)
```

## Forecast Generation

### API Endpoints

#### Generate Forecasts

```http
POST /api/forecasting/generate
Content-Type: application/json

{
    "store_id": "uuid",
    "product_id": "uuid",
    "forecast_horizon": 30,
    "model_type": "auto",
    "include_confidence": true,
    "promotional_events": [
        {
            "date": "2024-12-25",
            "impact": 1.5,
            "duration": 7
        }
    ]
}
```

#### Response Format

```json
{
  "forecast_id": "uuid",
  "store_id": "uuid",
  "product_id": "uuid",
  "model_used": "prophet",
  "forecast_horizon": 30,
  "generated_at": "2024-01-15T10:30:00Z",
  "forecasts": [
    {
      "date": "2024-01-16",
      "predicted_demand": 45.2,
      "confidence_lower": 38.1,
      "confidence_upper": 52.3,
      "probability": 0.95
    }
  ],
  "model_metrics": {
    "mape": 12.5,
    "rmse": 8.3,
    "mae": 6.1,
    "r2": 0.85
  }
}
```

### Batch Processing

#### Bulk Forecast Generation

```python
# Generate forecasts for multiple products
async def generate_bulk_forecasts(store_id, product_ids, horizon=30):
    """
    Generate forecasts for multiple products in parallel
    """
    tasks = []
    for product_id in product_ids:
        task = generate_forecast(store_id, product_id, horizon)
        tasks.append(task)

    results = await asyncio.gather(*tasks)
    return results
```

#### Scheduled Forecast Updates

```python
# Celery task for scheduled forecast updates
@celery.task
def update_forecasts_daily():
    """
    Daily task to update all active forecasts
    """
    active_products = get_active_products()
    for product in active_products:
        generate_forecast.delay(
            product.store_id,
            product.product_id,
            horizon=30
        )
```

## Model Evaluation

### Accuracy Metrics

#### Mean Absolute Percentage Error (MAPE)

```python
def calculate_mape(actual, predicted):
    """
    Calculate MAPE for forecast accuracy
    """
    return np.mean(np.abs((actual - predicted) / actual)) * 100
```

#### Root Mean Square Error (RMSE)

```python
def calculate_rmse(actual, predicted):
    """
    Calculate RMSE for forecast accuracy
    """
    return np.sqrt(np.mean((actual - predicted) ** 2))
```

#### Mean Absolute Error (MAE)

```python
def calculate_mae(actual, predicted):
    """
    Calculate MAE for forecast accuracy
    """
    return np.mean(np.abs(actual - predicted))
```

### Model Comparison

#### AIC/BIC Criteria

```python
def compare_models_aic(models, data):
    """
    Compare models using AIC/BIC criteria
    """
    results = {}
    for name, model in models.items():
        model.fit(data)
        aic = model.aic()
        bic = model.bic()
        results[name] = {'aic': aic, 'bic': bic}

    return results
```

#### Forecast Accuracy Tracking

```python
def track_forecast_accuracy(forecast_id, actual_demand):
    """
    Track forecast accuracy over time
    """
    forecast = get_forecast(forecast_id)
    accuracy_metrics = calculate_accuracy_metrics(
        forecast.predictions,
        actual_demand
    )

    update_forecast_metrics(forecast_id, accuracy_metrics)
    return accuracy_metrics
```

## API Usage

### Python Client

```python
from retail_inventory_client import ForecastingClient

# Initialize client
client = ForecastingClient(
    base_url="http://localhost:8000",
    api_key="your-api-key"
)

# Generate forecast
forecast = client.generate_forecast(
    store_id="store-uuid",
    product_id="product-uuid",
    horizon=30,
    model_type="prophet"
)

# Get forecast results
predictions = forecast.get_predictions()
confidence_intervals = forecast.get_confidence_intervals()
```

### JavaScript Client

```javascript
import { ForecastingAPI } from "./forecasting-api";

// Initialize API client
const forecastingAPI = new ForecastingAPI({
  baseURL: "http://localhost:8000",
  apiKey: "your-api-key",
});

// Generate forecast
const forecast = await forecastingAPI.generateForecast({
  storeId: "store-uuid",
  productId: "product-uuid",
  horizon: 30,
  modelType: "prophet",
});

// Process results
const predictions = forecast.predictions;
const confidenceIntervals = forecast.confidenceIntervals;
```

### cURL Examples

#### Generate Forecast

```bash
curl -X POST "http://localhost:8000/api/forecasting/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "store_id": "store-uuid",
    "product_id": "product-uuid",
    "forecast_horizon": 30,
    "model_type": "auto"
  }'
```

#### Get Forecast Results

```bash
curl -X GET "http://localhost:8000/api/forecasting/forecast/{forecast_id}" \
  -H "Authorization: Bearer your-token"
```

## Best Practices

### Data Preparation

1. **Data Cleaning**

   - Remove outliers and anomalies
   - Handle missing values appropriately
   - Ensure consistent data formats

2. **Feature Engineering**

   - Create relevant features (day of week, month, etc.)
   - Include external factors (weather, holidays)
   - Normalize data when necessary

3. **Data Validation**
   - Verify data quality and completeness
   - Check for data drift and changes
   - Validate business logic constraints

### Model Selection

1. **Start Simple**

   - Begin with simple models (moving average, exponential smoothing)
   - Gradually increase complexity as needed
   - Validate improvements with cross-validation

2. **Consider Business Context**

   - Choose models appropriate for your business
   - Consider interpretability requirements
   - Balance accuracy with computational cost

3. **Ensemble Methods**
   - Combine multiple models for better accuracy
   - Use different models for different time horizons
   - Implement model averaging or stacking

### Performance Optimization

1. **Model Caching**

   - Cache trained models for reuse
   - Implement model versioning
   - Use incremental learning when possible

2. **Parallel Processing**

   - Generate forecasts in parallel
   - Use distributed computing for large datasets
   - Implement async processing for real-time updates

3. **Resource Management**
   - Monitor memory and CPU usage
   - Implement resource limits
   - Use efficient data structures

### Monitoring and Maintenance

1. **Model Performance Monitoring**

   - Track forecast accuracy over time
   - Monitor for model drift and degradation
   - Set up alerts for performance issues

2. **Regular Retraining**

   - Retrain models with new data
   - Update model parameters
   - Validate model performance

3. **A/B Testing**
   - Test new models against existing ones
   - Measure business impact of model changes
   - Implement gradual rollouts

## Troubleshooting

### Common Issues

#### Poor Forecast Accuracy

**Symptoms:**

- High MAPE values (>20%)
- Large confidence intervals
- Inconsistent predictions

**Solutions:**

1. **Check Data Quality**

   ```python
   # Validate data quality
   def validate_data_quality(data):
       missing_pct = data.isnull().sum() / len(data) * 100
       if missing_pct > 5:
           raise ValueError(f"Too much missing data: {missing_pct}%")
   ```

2. **Increase Historical Data**

   - Ensure at least 2 years of data
   - Include complete seasonal cycles
   - Verify data consistency

3. **Try Different Models**
   - Test multiple model types
   - Use ensemble methods
   - Consider external factors

#### Model Training Failures

**Symptoms:**

- Training errors or timeouts
- Convergence issues
- Memory errors

**Solutions:**

1. **Reduce Data Size**

   ```python
   # Sample data for initial testing
   sample_data = data.sample(frac=0.1)
   model.fit(sample_data)
   ```

2. **Adjust Model Parameters**

   - Reduce model complexity
   - Increase regularization
   - Use simpler algorithms

3. **Optimize Resources**
   - Increase memory allocation
   - Use distributed computing
   - Implement data streaming

#### Slow Forecast Generation

**Symptoms:**

- Long response times
- Timeout errors
- Resource exhaustion

**Solutions:**

1. **Implement Caching**

   ```python
   from functools import lru_cache

   @lru_cache(maxsize=1000)
   def get_cached_forecast(store_id, product_id, horizon):
       return generate_forecast(store_id, product_id, horizon)
   ```

2. **Use Async Processing**

   ```python
   async def generate_forecast_async(store_id, product_id, horizon):
       # Async forecast generation
       result = await asyncio.to_thread(
           generate_forecast, store_id, product_id, horizon
       )
       return result
   ```

3. **Optimize Database Queries**
   - Use efficient queries
   - Implement proper indexing
   - Cache frequently accessed data

### Debugging Tools

#### Model Diagnostics

```python
def diagnose_model(model, data):
    """
    Comprehensive model diagnostics
    """
    # Check residuals
    residuals = model.resid
    plot_residuals(residuals)

    # Check autocorrelation
    autocorr = calculate_autocorrelation(residuals)
    plot_autocorrelation(autocorr)

    # Check normality
    normality_test = shapiro(residuals)
    print(f"Normality test p-value: {normality_test.pvalue}")
```

#### Performance Profiling

```python
import cProfile

def profile_forecast_generation():
    """
    Profile forecast generation performance
    """
    cProfile.run('generate_forecast(store_id, product_id, horizon)')
```

### Getting Help

1. **Documentation**: Check API documentation and user guides
2. **Logs**: Review application logs for error details
3. **Support**: Contact technical support for complex issues
4. **Community**: Join user community forums
5. **Training**: Attend training sessions and workshops

---

_This forecasting guide is regularly updated. Check for the latest version and new features._
