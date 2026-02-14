from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from ..models.warehouse import WarehouseStatus

class WarehouseBase(BaseModel):
    unit_number: str
    location: str
    size_sqft: float
    rental_rate: float
    amenities: Optional[str] = None
    description: Optional[str] = None
    floor_plan_url: Optional[str] = None

class WarehouseCreate(WarehouseBase):
    status: WarehouseStatus = WarehouseStatus.VACANT

class WarehouseUpdate(BaseModel):
    unit_number: Optional[str] = None
    location: Optional[str] = None
    size_sqft: Optional[float] = None
    rental_rate: Optional[float] = None
    status: Optional[WarehouseStatus] = None
    amenities: Optional[str] = None
    description: Optional[str] = None
    floor_plan_url: Optional[str] = None

class WarehouseResponse(WarehouseBase):
    id: int
    status: WarehouseStatus
    created_at: datetime

    class Config:
        from_attributes = True
