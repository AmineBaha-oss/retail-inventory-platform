"""
Inventory management endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
import logging

from models.database import get_db
from models.schemas import InventoryItem, InventoryUpdate
from core.optimization.reorder_engine import ReorderPointEngine, ReorderPointConfig
from core.forecasting.models import ProphetForecaster

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize engines
reorder_engine = ReorderPointEngine()
prophet_forecaster = ProphetForecaster()


@router.get("/", response_model=List[InventoryItem])
async def get_inventory(db: AsyncSession = Depends(get_db)):
    """Get all inventory items."""
    # Mock implementation - replace with actual database query
    mock_inventory = [
        InventoryItem(
            id="inv_001",
            product_id="prod_001",
            store_id="store_001",
            quantity=150,
            reorder_point=100,
            safety_stock=50,
            unit_cost=25.99,
            last_updated="2024-01-15T10:00:00Z"
        ),
        InventoryItem(
            id="inv_002",
            product_id="prod_002",
            store_id="store_001",
            quantity=75,
            reorder_point=120,
            safety_stock=60,
            unit_cost=15.50,
            last_updated="2024-01-15T10:00:00Z"
        )
    ]
    return mock_inventory


@router.get("/{item_id}", response_model=InventoryItem)
async def get_inventory_item(item_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific inventory item."""
    # Mock implementation - replace with actual database query
    mock_item = InventoryItem(
        id=item_id,
        product_id="prod_001",
        store_id="store_001",
        quantity=150,
        reorder_point=100,
        safety_stock=50,
        unit_cost=25.99,
        last_updated="2024-01-15T10:00:00Z"
    )
    return mock_item


@router.put("/{item_id}", response_model=InventoryItem)
async def update_inventory(
    item_id: str,
    update: InventoryUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update inventory item."""
    # Mock implementation - replace with actual database update
    mock_item = InventoryItem(
        id=item_id,
        product_id="prod_001",
        store_id="store_001",
        quantity=update.quantity,
        reorder_point=update.reorder_point or 100,
        safety_stock=update.safety_stock or 50,
        unit_cost=update.unit_cost or 25.99,
        last_updated="2024-01-15T10:00:00Z"
    )
    return mock_item


@router.post("/reorder-recommendations", response_model=List[Dict[str, Any]])
async def get_reorder_recommendations(
    request: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """
    Get reorder recommendations for inventory items.
    
    Expected request format:
    {
        "inventory_items": [
            {
                "product_id": "prod_001",
                "store_id": "store_001",
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
    """
    try:
        inventory_items = request.get("inventory_items", [])
        config_data = request.get("config", {})
        
        if not inventory_items:
            raise HTTPException(status_code=400, detail="inventory_items is required")
        
        # Create reorder configuration
        config = ReorderPointConfig(
            service_level=config_data.get("service_level", 0.95),
            lead_time_days=config_data.get("lead_time_days", 7),
            lead_time_std_days=config_data.get("lead_time_std_days", 2.0),
            min_order_quantity=config_data.get("min_order_quantity", 1),
            case_pack_size=config_data.get("case_pack_size", 1),
            budget_cap=config_data.get("budget_cap")
        )
        
        # Get forecasts for all products
        forecast_data = {}
        for item in inventory_items:
            product_id = item["product_id"]
            store_id = item.get("store_id")
            
            # Check if we have a trained model
            model_key = f"{product_id}_{store_id}" if store_id else product_id
            
            if model_key in prophet_forecaster.models:
                try:
                    # Generate 30-day forecast for reorder calculations
                    forecast = prophet_forecaster.forecast(
                        product_id, 
                        30,  # 30 days should cover most lead times
                        store_id,
                        include_components=False
                    )
                    
                    # Extract P90 forecasts for reorder calculations
                    if 'p90_forecast' in forecast:
                        forecast_data[product_id] = forecast['p90_forecast']
                    else:
                        # Fallback to P50 if P90 not available
                        forecast_data[product_id] = forecast.get('p50_forecast', [])
                        
                except Exception as e:
                    logger.warning(f"Failed to get forecast for {product_id}: {str(e)}")
                    # Use mock forecast data as fallback
                    forecast_data[product_id] = [10] * 30  # Mock 30 days of demand
            else:
                logger.warning(f"No trained model for {product_id}, using mock data")
                # Use mock forecast data
                forecast_data[product_id] = [10] * 30  # Mock 30 days of demand
        
        # Generate reorder recommendations
        recommendations = reorder_engine.batch_reorder_recommendations(
            inventory_items,
            forecast_data,
            {item["product_id"]: config for item in inventory_items}
        )
        
        # Convert to serializable format
        result = []
        for rec in recommendations:
            result.append({
                "product_id": rec.product_id,
                "store_id": rec.store_id,
                "current_inventory": rec.current_inventory,
                "reorder_point": rec.reorder_point,
                "reorder_quantity": rec.reorder_quantity,
                "safety_stock": rec.safety_stock,
                "demand_during_lt": rec.demand_during_lt,
                "lead_time_days": rec.lead_time_days,
                "service_level": rec.service_level,
                "total_cost": rec.total_cost,
                "urgency": rec.urgency,
                "recommendation_date": rec.recommendation_date.isoformat(),
                "reasoning": rec.reasoning
            })
        
        return result
        
    except Exception as e:
        logger.error(f"Error generating reorder recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")


@router.post("/reorder-points/calculate", response_model=Dict[str, Any])
async def calculate_reorder_points(
    request: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """
    Calculate reorder points for specific products.
    
    Expected request format:
    {
        "product_id": "prod_001",
        "store_id": "store_001",
        "current_inventory": 75,
        "unit_cost": 25.99,
        "config": {
            "service_level": 0.95,
            "lead_time_days": 7,
            "lead_time_std_days": 2.0
        }
    }
    """
    try:
        product_id = request.get("product_id")
        store_id = request.get("store_id")
        current_inventory = request.get("current_inventory", 0)
        unit_cost = request.get("unit_cost", 0.0)
        config_data = request.get("config", {})
        
        if not product_id:
            raise HTTPException(status_code=400, detail="product_id is required")
        
        # Create configuration
        config = ReorderPointConfig(
            service_level=config_data.get("service_level", 0.95),
            lead_time_days=config_data.get("lead_time_days", 7),
            lead_time_std_days=config_data.get("lead_time_std_days", 2.0),
            min_order_quantity=config_data.get("min_order_quantity", 1),
            case_pack_size=config_data.get("case_pack_size", 1)
        )
        
        # Get forecast data
        model_key = f"{product_id}_{store_id}" if store_id else product_id
        
        if model_key not in prophet_forecaster.models:
            raise HTTPException(
                status_code=404,
                detail=f"No trained model found for {product_id}. Train the model first."
            )
        
        # Generate forecast
        forecast = prophet_forecaster.forecast(
            product_id,
            30,  # 30 days for reorder calculations
            store_id,
            include_components=False
        )
        
        # Extract P90 forecasts
        daily_forecasts = forecast.get('p90_forecast', forecast.get('p50_forecast', []))
        
        if not daily_forecasts:
            raise HTTPException(
                status_code=500,
                detail="No forecast data available"
            )
        
        # Generate reorder recommendation
        recommendation = reorder_engine.generate_reorder_recommendation(
            product_id=product_id,
            store_id=store_id,
            current_inventory=current_inventory,
            daily_forecasts=daily_forecasts,
            unit_cost=unit_cost,
            config=config
        )
        
        return {
            "status": "success",
            "recommendation": {
                "product_id": recommendation.product_id,
                "store_id": recommendation.store_id,
                "current_inventory": recommendation.current_inventory,
                "reorder_point": recommendation.reorder_point,
                "reorder_quantity": recommendation.reorder_quantity,
                "safety_stock": recommendation.safety_stock,
                "demand_during_lt": recommendation.demand_during_lt,
                "lead_time_days": recommendation.lead_time_days,
                "service_level": recommendation.service_level,
                "total_cost": recommendation.total_cost,
                "urgency": recommendation.urgency,
                "recommendation_date": recommendation.recommendation_date.isoformat(),
                "reasoning": recommendation.reasoning
            }
        }
        
    except Exception as e:
        logger.error(f"Error calculating reorder points: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Calculation failed: {str(e)}")


@router.get("/reorder-points/{product_id}")
async def get_reorder_point(
    product_id: str,
    store_id: str = None,
    db: AsyncSession = Depends(get_db)
):
    """Get current reorder point for a product."""
    # Mock implementation - replace with actual database query
    return {
        "product_id": product_id,
        "store_id": store_id,
        "reorder_point": 100,
        "safety_stock": 50,
        "current_inventory": 75,
        "last_updated": "2024-01-15T10:00:00Z"
    }
