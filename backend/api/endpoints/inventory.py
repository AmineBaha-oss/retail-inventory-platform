"""
Inventory endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime

from models.database import get_db
from models.schemas import InventoryResponse

router = APIRouter()

@router.get("/", response_model=List[InventoryResponse])
async def get_inventory(db: AsyncSession = Depends(get_db)):
    """Get all inventory levels."""
    # Mock inventory data
    return [
        InventoryResponse(
            id="inv_1",
            store_id="store_1",
            product_id="prod_1",
            quantity_on_hand=150,
            quantity_committed=25,
            quantity_available=125,
            reorder_point=50,
            safety_stock=30,
            max_stock=200,
            last_updated=datetime.utcnow()
        ),
        InventoryResponse(
            id="inv_2",
            store_id="store_1",
            product_id="prod_2",
            quantity_on_hand=75,
            quantity_committed=10,
            quantity_available=65,
            reorder_point=40,
            safety_stock=25,
            max_stock=150,
            last_updated=datetime.utcnow()
        )
    ]

@router.get("/risk-alerts")
async def get_risk_alerts(db: AsyncSession = Depends(get_db)):
    """Get inventory risk alerts."""
    return {
        "stockout_risk": [
            {"product_id": "prod_3", "store_id": "store_1", "days_until_stockout": 3},
            {"product_id": "prod_4", "store_id": "store_2", "days_until_stockout": 5}
        ],
        "overstock_risk": [
            {"product_id": "prod_5", "store_id": "store_1", "excess_quantity": 50},
            {"product_id": "prod_6", "store_id": "store_2", "excess_quantity": 75}
        ]
    }
