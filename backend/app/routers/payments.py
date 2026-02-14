from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from ..database import get_db
from ..schemas.payment import PaymentCreate, PaymentUpdate, PaymentResponse
from ..models.payment import Payment, PaymentStatus
from ..models.lease import Lease
from ..models.user import User
from ..utils.auth import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new payment record."""
    # Verify lease exists
    lease = db.query(Lease).filter(Lease.id == payment.lease_id).first()
    if not lease:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lease not found"
        )

    db_payment = Payment(**payment.model_dump())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.get("/", response_model=List[PaymentResponse])
def list_payments(
    skip: int = 0,
    limit: int = 100,
    status: PaymentStatus = None,
    lease_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all payments with optional filtering."""
    query = db.query(Payment)
    if status:
        query = query.filter(Payment.status == status)
    if lease_id:
        query = query.filter(Payment.lease_id == lease_id)

    payments = query.offset(skip).limit(limit).all()
    return payments

@router.get("/overdue", response_model=List[PaymentResponse])
def list_overdue_payments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all overdue payments."""
    today = date.today()
    payments = db.query(Payment).filter(
        Payment.status.in_([PaymentStatus.PENDING, PaymentStatus.PARTIAL]),
        Payment.due_date < today
    ).offset(skip).limit(limit).all()
    return payments

@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific payment by ID."""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    return payment

@router.put("/{payment_id}", response_model=PaymentResponse)
def update_payment(
    payment_id: int,
    payment_update: PaymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a payment record."""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )

    update_data = payment_update.model_dump(exclude_unset=True)

    # Auto-update status based on amount paid
    if "amount_paid" in update_data:
        if update_data["amount_paid"] >= payment.amount_due:
            update_data["status"] = PaymentStatus.PAID
        elif update_data["amount_paid"] > 0:
            update_data["status"] = PaymentStatus.PARTIAL
        else:
            # Check if overdue
            if payment.due_date < date.today():
                update_data["status"] = PaymentStatus.OVERDUE
            else:
                update_data["status"] = PaymentStatus.PENDING

    for field, value in update_data.items():
        setattr(payment, field, value)

    db.commit()
    db.refresh(payment)
    return payment

@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a payment record."""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )

    db.delete(payment)
    db.commit()
    return None
