"""
Forecasting endpoints using Prophet-based probabilistic forecasting.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
import pandas as pd
from datetime import datetime, timedelta
import logging

from models.database import get_db
from models.schemas import ForecastRequest, ForecastResponse
from core.forecasting.models import ProphetForecaster, EnsembleForecaster

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize forecaster instances
prophet_forecaster = ProphetForecaster()
ensemble_forecaster = EnsembleForecaster()


@router.post("/train", response_model=Dict[str, Any])
async def train_forecasting_model(
    request: Dict[str, Any],
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Train forecasting model for a product/store combination.
    
    Expected request format:
    {
        "product_id": "string",
        "store_id": "string",  # optional
        "sales_data": [
            {"date": "2024-01-01", "quantity_sold": 10},
            {"date": "2024-01-02", "quantity_sold": 15}
        ]
    }
    """
    try:
        product_id = request.get("product_id")
        store_id = request.get("store_id")
        sales_data = request.get("sales_data", [])
        
        if not product_id or not sales_data:
            raise HTTPException(status_code=400, detail="product_id and sales_data are required")
        
        # Convert to DataFrame
        df = pd.DataFrame(sales_data)
        df['date'] = pd.to_datetime(df['date'])
        
        # Train model
        training_result = prophet_forecaster.train(df, product_id, store_id)
        
        logger.info(f"Model training completed for product {product_id}, store {store_id}")
        return {
            "status": "success",
            "message": "Model trained successfully",
            "training_result": training_result
        }
        
    except Exception as e:
        logger.error(f"Error training model: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


@router.post("/generate", response_model=Dict[str, Any])
async def generate_forecast(
    request: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """
    Generate probabilistic forecast with P50/P90 quantiles.
    
    Expected request format:
    {
        "product_id": "string",
        "store_id": "string",  # optional
        "horizon_days": 30,
        "include_components": true
    }
    """
    try:
        product_id = request.get("product_id")
        store_id = request.get("store_id")
        horizon_days = request.get("horizon_days", 30)
        include_components = request.get("include_components", True)
        
        if not product_id:
            raise HTTPException(status_code=400, detail="product_id is required")
        
        # Check if model exists
        model_key = f"{product_id}_{store_id}" if store_id else product_id
        if model_key not in prophet_forecaster.models:
            raise HTTPException(
                status_code=404, 
                detail=f"No trained model found for product {product_id}. Train the model first."
            )
        
        # Generate forecast
        forecast_result = prophet_forecaster.forecast(
            product_id, 
            horizon_days, 
            store_id, 
            include_components
        )
        
        return {
            "status": "success",
            "forecast": forecast_result
        }
        
    except Exception as e:
        logger.error(f"Error generating forecast: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {str(e)}")


@router.post("/generate-ensemble", response_model=Dict[str, Any])
async def generate_ensemble_forecast(
    request: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """Generate ensemble forecast using multiple models."""
    try:
        product_id = request.get("product_id")
        store_id = request.get("store_id")
        horizon_days = request.get("horizon_days", 30)
        
        if not product_id:
            raise HTTPException(status_code=400, detail="product_id is required")
        
        # Generate ensemble forecast
        ensemble_result = ensemble_forecaster.forecast_ensemble(
            product_id, 
            horizon_days, 
            store_id
        )
        
        return {
            "status": "success",
            "ensemble_forecast": ensemble_result
        }
        
    except Exception as e:
        logger.error(f"Error generating ensemble forecast: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ensemble forecast failed: {str(e)}")


@router.get("/{product_id}/performance")
async def get_forecast_performance(
    product_id: str,
    store_id: str = None,
    db: AsyncSession = Depends(get_db)
):
    """Get forecast performance metrics for a specific product/store."""
    try:
        model_key = f"{product_id}_{store_id}" if store_id else product_id
        
        if model_key not in prophet_forecaster.performance_metrics:
            raise HTTPException(
                status_code=404, 
                detail=f"No performance metrics found for {model_key}"
            )
        
        performance = prophet_forecaster.get_model_performance(product_id, store_id)
        
        return {
            "product_id": product_id,
            "store_id": store_id,
            "performance_metrics": performance,
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting performance metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get performance metrics: {str(e)}")


@router.post("/{product_id}/update")
async def update_forecasting_model(
    product_id: str,
    request: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """
    Update existing forecasting model with new data.
    
    Expected request format:
    {
        "store_id": "string",  # optional
        "new_sales_data": [
            {"date": "2024-01-15", "quantity_sold": 12}
        ]
    }
    """
    try:
        store_id = request.get("store_id")
        new_sales_data = request.get("new_sales_data", [])
        
        if not new_sales_data:
            raise HTTPException(status_code=400, detail="new_sales_data is required")
        
        # Convert to DataFrame
        df = pd.DataFrame(new_sales_data)
        df['date'] = pd.to_datetime(df['date'])
        
        # Update model
        update_result = prophet_forecaster.update_model(product_id, df, store_id)
        
        return {
            "status": "success",
            "message": "Model updated successfully",
            "update_result": update_result
        }
        
    except Exception as e:
        logger.error(f"Error updating model: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Model update failed: {str(e)}")


@router.get("/models")
async def list_trained_models():
    """List all trained forecasting models."""
    try:
        models = []
        for model_key in prophet_forecaster.models.keys():
            if '_' in model_key:
                product_id, store_id = model_key.rsplit('_', 1)
            else:
                product_id, store_id = model_key, None
            
            models.append({
                "product_id": product_id,
                "store_id": store_id,
                "model_key": model_key,
                "has_performance_metrics": model_key in prophet_forecaster.performance_metrics
            })
        
        return {
            "total_models": len(models),
            "models": models
        }
        
    except Exception as e:
        logger.error(f"Error listing models: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list models: {str(e)}")


@router.delete("/{product_id}")
async def delete_forecasting_model(
    product_id: str,
    store_id: str = None,
    db: AsyncSession = Depends(get_db)
):
    """Delete a trained forecasting model."""
    try:
        model_key = f"{product_id}_{store_id}" if store_id else product_id
        
        if model_key not in prophet_forecaster.models:
            raise HTTPException(
                status_code=404, 
                detail=f"No model found for {model_key}"
            )
        
        # Remove model and performance metrics
        del prophet_forecaster.models[model_key]
        if model_key in prophet_forecaster.performance_metrics:
            del prophet_forecaster.performance_metrics[model_key]
        
        return {
            "status": "success",
            "message": f"Model {model_key} deleted successfully"
        }
        
    except Exception as e:
        logger.error(f"Error deleting model: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete model: {str(e)}")
