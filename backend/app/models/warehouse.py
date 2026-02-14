from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum

class WarehouseStatus(str, enum.Enum):
    VACANT = "vacant"
    OCCUPIED = "occupied"
    MAINTENANCE = "maintenance"

class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    unit_number = Column(String, unique=True, index=True, nullable=False)
    location = Column(String, nullable=False)
    size_sqft = Column(Float, nullable=False)
    rental_rate = Column(Float, nullable=False)  # Monthly rent
    status = Column(Enum(WarehouseStatus), default=WarehouseStatus.VACANT, nullable=False)
    amenities = Column(Text)  # JSON or comma-separated list
    description = Column(Text)
    floor_plan_url = Column(String)  # URL to floor plan image
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    leases = relationship("Lease", back_populates="warehouse")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="warehouse")
