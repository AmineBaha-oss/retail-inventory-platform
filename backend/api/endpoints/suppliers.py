"""
Supplier endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime

from models.database import get_db
from models.schemas import SupplierResponse

router = APIRouter()

@router.get("/", response_model=List[SupplierResponse])
async def get_suppliers(db: AsyncSession = Depends(get_db)):
    """Get all suppliers."""
    # Mock supplier data
    return [
        SupplierResponse(
            id="supp_1",
            name="ABC Suppliers",
            code="ABC",
            contact_email="contact@abcsuppliers.com",
            contact_phone="+1-555-0123",
            address="123 Supplier St, City, State 12345",
            lead_time_days=7,
            lead_time_variance_days=2,
            payment_terms="Net 30",
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        ),
        SupplierResponse(
            id="supp_2",
            name="XYZ Manufacturing",
            code="XYZ",
            contact_email="orders@xyzmanufacturing.com",
            contact_phone="+1-555-0456",
            address="456 Factory Ave, City, State 12345",
            lead_time_days=14,
            lead_time_variance_days=3,
            payment_terms="Net 45",
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    ]
