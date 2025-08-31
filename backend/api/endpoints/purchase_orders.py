from datetime import timedelta
"""
Purchase order endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime

from models.database import get_db
from models.schemas import PurchaseOrderResponse, PurchaseOrderCreate

router = APIRouter()

@router.get("/", response_model=List[PurchaseOrderResponse])
async def get_purchase_orders(db: AsyncSession = Depends(get_db)):
    """Get all purchase orders."""
    # Mock PO data
    return [
        PurchaseOrderResponse(
            id="po_1",
            po_number="PO-2024-001",
            supplier_id="supp_1",
            store_id="store_1",
            status="pending_approval",
            total_amount=2500.00,
            expected_delivery_date=datetime.now() + timedelta(days=14),
            created_by="user_1",
            approved_by=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    ]

@router.post("/", response_model=PurchaseOrderResponse)
async def create_purchase_order(
    po: PurchaseOrderCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new purchase order."""
    # Mock creation
    return PurchaseOrderResponse(
        id="po_new",
        po_number="PO-2024-002",
        supplier_id=po.supplier_id,
        store_id=po.store_id,
        status="draft",
        total_amount=0.00,
        expected_delivery_date=po.expected_delivery_date,
        created_by="user_1",
        approved_by=None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
