"""
Forecasting endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import pandas as pd
from datetime import datetime, timedelta

from models.database import get_db
from models.schemas import ForecastRequest, ForecastResponse
from core.forecasting.models import ProbabilisticForecaster

router = APIRouter()

@router.post("/generate", response_model=List[ForecastResponse])
async def generate_forecast(
    request: ForecastRequest,
    db: AsyncSession = Depends(get_db)
):
    """Generate demand forecasts for specified products and stores."""
    # Mock implementation - replace with actual forecasting logic
    forecasts = []
    
    for product_id in request.product_ids:
        for store_id in request.store_ids:
            # Generate mock forecast data
            forecast_dates = []
            forecasted_quantities = []
            
            for i in range(request.horizon_days):
                date = datetime.now() + timedelta(days=i)
                forecast_dates.append(date.date())
                # Simple mock forecast with some randomness
                forecasted_quantities.append(max(0, 10 + (i % 7) * 2))
            
            forecast = ForecastResponse(
                id=f"forecast_{product_id}_{store_id}",
                store_id=store_id,
                product_id=product_id,
                forecast_date=forecast_dates[0],
                forecast_horizon_days=request.horizon_days,
                forecasted_quantity=sum(forecasted_quantities) / len(forecasted_quantities),
                confidence_lower=sum(forecasted_quantities) / len(forecasted_quantities) * 0.8,
                confidence_upper=sum(forecasted_quantities) / len(forecasted_quantities) * 1.2,
                confidence_level=request.confidence_level,
                model_version="1.0.0",
                accuracy_metrics={"mae": 2.5, "mape": 15.2},
                created_at=datetime.utcnow()
            )
            forecasts.append(forecast)
    
    return forecasts

@router.get("/{product_id}/accuracy")
async def get_forecast_accuracy(
    product_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get forecast accuracy metrics for a specific product."""
    # Mock accuracy data
    return {
        "product_id": product_id,
        "mae": 2.5,
        "mape": 15.2,
        "rmse": 3.1,
        "r2": 0.85,
        "last_updated": datetime.utcnow().isoformat()
    }
