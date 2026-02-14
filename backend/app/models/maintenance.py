from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum

class MaintenancePriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class MaintenanceStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class MaintenanceCategory(str, enum.Enum):
    ELECTRICAL = "electrical"
    PLUMBING = "plumbing"
    STRUCTURAL = "structural"
    CLEANING = "cleaning"
    HVAC = "hvac"
    OTHER = "other"

class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(MaintenanceCategory), default=MaintenanceCategory.OTHER, nullable=False)
    priority = Column(Enum(MaintenancePriority), default=MaintenancePriority.MEDIUM, nullable=False)
    status = Column(Enum(MaintenanceStatus), default=MaintenanceStatus.SUBMITTED, nullable=False)

    assigned_to = Column(String)  # Name or ID of maintenance staff/vendor
    estimated_cost = Column(Float, default=0.0)
    actual_cost = Column(Float, default=0.0)

    reported_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True))
    notes = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    warehouse = relationship("Warehouse", back_populates="maintenance_requests")
