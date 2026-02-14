from sqlalchemy import Column, Integer, Float, Date, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    PARTIAL = "partial"

class PaymentMethod(str, enum.Enum):
    BANK_TRANSFER = "bank_transfer"
    CHECK = "check"
    CASH = "cash"
    ONLINE = "online"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    lease_id = Column(Integer, ForeignKey("leases.id"), nullable=False)

    amount_due = Column(Float, nullable=False)
    amount_paid = Column(Float, default=0.0)
    due_date = Column(Date, nullable=False)
    payment_date = Column(Date)

    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    payment_method = Column(Enum(PaymentMethod))

    transaction_reference = Column(String)
    late_fee = Column(Float, default=0.0)
    notes = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    lease = relationship("Lease", back_populates="payments")
