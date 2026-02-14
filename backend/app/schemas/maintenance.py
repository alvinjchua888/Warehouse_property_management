from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from ..models.maintenance import MaintenancePriority, MaintenanceStatus, MaintenanceCategory

class MaintenanceRequestBase(BaseModel):
    warehouse_id: int
    title: str
    description: str
    category: MaintenanceCategory = MaintenanceCategory.OTHER
    priority: MaintenancePriority = MaintenancePriority.MEDIUM

class MaintenanceRequestCreate(MaintenanceRequestBase):
    pass

class MaintenanceRequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[MaintenanceCategory] = None
    priority: Optional[MaintenancePriority] = None
    status: Optional[MaintenanceStatus] = None
    assigned_to: Optional[str] = None
    estimated_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None

class MaintenanceRequestResponse(MaintenanceRequestBase):
    id: int
    status: MaintenanceStatus
    assigned_to: Optional[str]
    estimated_cost: float
    actual_cost: float
    reported_at: datetime
    completed_at: Optional[datetime]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
