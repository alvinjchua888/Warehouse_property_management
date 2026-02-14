from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.lease import LeaseCreate, LeaseUpdate, LeaseResponse
from ..models.lease import Lease, LeaseStatus
from ..models.warehouse import Warehouse, WarehouseStatus
from ..models.tenant import Tenant
from ..models.user import User
from ..utils.auth import get_current_user

router = APIRouter(prefix="/leases", tags=["Leases"])

@router.post("/", response_model=LeaseResponse, status_code=status.HTTP_201_CREATED)
def create_lease(
    lease: LeaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new lease agreement."""
    # Verify warehouse exists
    warehouse = db.query(Warehouse).filter(Warehouse.id == lease.warehouse_id).first()
    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warehouse not found"
        )

    # Verify tenant exists
    tenant = db.query(Tenant).filter(Tenant.id == lease.tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )

    # Check if warehouse is already occupied
    active_lease = db.query(Lease).filter(
        Lease.warehouse_id == lease.warehouse_id,
        Lease.status == LeaseStatus.ACTIVE
    ).first()
    if active_lease:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Warehouse is already occupied"
        )

    db_lease = Lease(**lease.model_dump())
    db.add(db_lease)

    # Update warehouse status to occupied
    warehouse.status = WarehouseStatus.OCCUPIED

    db.commit()
    db.refresh(db_lease)
    return db_lease

@router.get("/", response_model=List[LeaseResponse])
def list_leases(
    skip: int = 0,
    limit: int = 100,
    status: LeaseStatus = None,
    warehouse_id: int = None,
    tenant_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all leases with optional filtering."""
    query = db.query(Lease)
    if status:
        query = query.filter(Lease.status == status)
    if warehouse_id:
        query = query.filter(Lease.warehouse_id == warehouse_id)
    if tenant_id:
        query = query.filter(Lease.tenant_id == tenant_id)

    leases = query.offset(skip).limit(limit).all()
    return leases

@router.get("/{lease_id}", response_model=LeaseResponse)
def get_lease(
    lease_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific lease by ID."""
    lease = db.query(Lease).filter(Lease.id == lease_id).first()
    if not lease:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lease not found"
        )
    return lease

@router.put("/{lease_id}", response_model=LeaseResponse)
def update_lease(
    lease_id: int,
    lease_update: LeaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a lease."""
    lease = db.query(Lease).filter(Lease.id == lease_id).first()
    if not lease:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lease not found"
        )

    update_data = lease_update.model_dump(exclude_unset=True)

    # If status is being updated to terminated or expired, update warehouse status
    if "status" in update_data and update_data["status"] in [LeaseStatus.TERMINATED, LeaseStatus.EXPIRED]:
        warehouse = db.query(Warehouse).filter(Warehouse.id == lease.warehouse_id).first()
        if warehouse:
            warehouse.status = WarehouseStatus.VACANT

    for field, value in update_data.items():
        setattr(lease, field, value)

    db.commit()
    db.refresh(lease)
    return lease

@router.delete("/{lease_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lease(
    lease_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a lease."""
    lease = db.query(Lease).filter(Lease.id == lease_id).first()
    if not lease:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lease not found"
        )

    # Update warehouse status to vacant
    warehouse = db.query(Warehouse).filter(Warehouse.id == lease.warehouse_id).first()
    if warehouse:
        warehouse.status = WarehouseStatus.VACANT

    db.delete(lease)
    db.commit()
    return None
