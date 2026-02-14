from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.maintenance import MaintenanceRequestCreate, MaintenanceRequestUpdate, MaintenanceRequestResponse
from ..models.maintenance import MaintenanceRequest, MaintenanceStatus, MaintenancePriority
from ..models.warehouse import Warehouse
from ..models.user import User
from ..utils.auth import get_current_user

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

@router.post("/", response_model=MaintenanceRequestResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance_request(
    request: MaintenanceRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new maintenance request."""
    # Verify warehouse exists
    warehouse = db.query(Warehouse).filter(Warehouse.id == request.warehouse_id).first()
    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warehouse not found"
        )

    db_request = MaintenanceRequest(**request.model_dump())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.get("/", response_model=List[MaintenanceRequestResponse])
def list_maintenance_requests(
    skip: int = 0,
    limit: int = 100,
    status: MaintenanceStatus = None,
    priority: MaintenancePriority = None,
    warehouse_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all maintenance requests with optional filtering."""
    query = db.query(MaintenanceRequest)
    if status:
        query = query.filter(MaintenanceRequest.status == status)
    if priority:
        query = query.filter(MaintenanceRequest.priority == priority)
    if warehouse_id:
        query = query.filter(MaintenanceRequest.warehouse_id == warehouse_id)

    requests = query.offset(skip).limit(limit).all()
    return requests

@router.get("/{request_id}", response_model=MaintenanceRequestResponse)
def get_maintenance_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific maintenance request by ID."""
    request = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found"
        )
    return request

@router.put("/{request_id}", response_model=MaintenanceRequestResponse)
def update_maintenance_request(
    request_id: int,
    request_update: MaintenanceRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a maintenance request."""
    request = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found"
        )

    update_data = request_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(request, field, value)

    db.commit()
    db.refresh(request)
    return request

@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_maintenance_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a maintenance request."""
    request = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found"
        )

    db.delete(request)
    db.commit()
    return None
