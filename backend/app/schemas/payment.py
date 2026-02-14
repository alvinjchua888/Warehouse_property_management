from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from ..models.payment import PaymentStatus, PaymentMethod

class PaymentBase(BaseModel):
    lease_id: int
    amount_due: float
    due_date: date

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    amount_paid: Optional[float] = None
    payment_date: Optional[date] = None
    status: Optional[PaymentStatus] = None
    payment_method: Optional[PaymentMethod] = None
    transaction_reference: Optional[str] = None
    late_fee: Optional[float] = None
    notes: Optional[str] = None

class PaymentResponse(PaymentBase):
    id: int
    amount_paid: float
    payment_date: Optional[date]
    status: PaymentStatus
    payment_method: Optional[PaymentMethod]
    transaction_reference: Optional[str]
    late_fee: float
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
