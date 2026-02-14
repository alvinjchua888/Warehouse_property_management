from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from ..models.lease import PaymentFrequency, LeaseStatus

class LeaseBase(BaseModel):
    warehouse_id: int
    tenant_id: int
    start_date: date
    end_date: date
    rental_amount: float
    payment_frequency: PaymentFrequency = PaymentFrequency.MONTHLY
    security_deposit: float = 0.0
    late_fee_percentage: float = 5.0
    grace_period_days: int = 5
    terms_and_conditions: Optional[str] = None
    notes: Optional[str] = None

class LeaseCreate(LeaseBase):
    pass

class LeaseUpdate(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    rental_amount: Optional[float] = None
    payment_frequency: Optional[PaymentFrequency] = None
    security_deposit: Optional[float] = None
    late_fee_percentage: Optional[float] = None
    grace_period_days: Optional[int] = None
    status: Optional[LeaseStatus] = None
    terms_and_conditions: Optional[str] = None
    notes: Optional[str] = None

class LeaseResponse(LeaseBase):
    id: int
    status: LeaseStatus
    created_at: datetime

    class Config:
        from_attributes = True
