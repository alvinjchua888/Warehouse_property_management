from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum

class PaymentFrequency(str, enum.Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUALLY = "annually"

class LeaseStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    TERMINATED = "terminated"

class Lease(Base):
    __tablename__ = "leases"

    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    rental_amount = Column(Float, nullable=False)
    payment_frequency = Column(Enum(PaymentFrequency), default=PaymentFrequency.MONTHLY, nullable=False)
    security_deposit = Column(Float, default=0.0)
    late_fee_percentage = Column(Float, default=5.0)  # Percentage per month
    grace_period_days = Column(Integer, default=5)

    status = Column(Enum(LeaseStatus), default=LeaseStatus.ACTIVE, nullable=False)
    terms_and_conditions = Column(Text)
    notes = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    warehouse = relationship("Warehouse", back_populates="leases")
    tenant = relationship("Tenant", back_populates="leases")
    payments = relationship("Payment", back_populates="lease")
