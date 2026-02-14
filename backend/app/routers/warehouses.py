from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.warehouse import WarehouseCreate, WarehouseUpdate, WarehouseResponse
from ..models.warehouse import Warehouse, WarehouseStatus
from ..models.user import User
from ..utils.auth import get_current_user

router = APIRouter(prefix="/warehouses", tags=["Warehouses"])

@router.post("/", response_model=WarehouseResponse, status_code=status.HTTP_201_CREATED)
def create_warehouse(
    warehouse: WarehouseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new warehouse unit."""
    # Check if unit number already exists
    existing = db.query(Warehouse).filter(Warehouse.unit_number == warehouse.unit_number).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unit number already exists"
        )

    db_warehouse = Warehouse(**warehouse.model_dump())
    db.add(db_warehouse)
    db.commit()
    db.refresh(db_warehouse)
    return db_warehouse

@router.get("/", response_model=List[WarehouseResponse])
def list_warehouses(
    skip: int = 0,
    limit: int = 100,
    status: WarehouseStatus = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all warehouse units with optional filtering."""
    query = db.query(Warehouse)
    if status:
        query = query.filter(Warehouse.status == status)
    warehouses = query.offset(skip).limit(limit).all()
    return warehouses

@router.get("/{warehouse_id}", response_model=WarehouseResponse)
def get_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific warehouse unit by ID."""
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warehouse not found"
        )
    return warehouse

@router.put("/{warehouse_id}", response_model=WarehouseResponse)
def update_warehouse(
    warehouse_id: int,
    warehouse_update: WarehouseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a warehouse unit."""
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warehouse not found"
        )

    update_data = warehouse_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(warehouse, field, value)

    db.commit()
    db.refresh(warehouse)
    return warehouse

@router.delete("/{warehouse_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a warehouse unit."""
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warehouse not found"
        )

    db.delete(warehouse)
    db.commit()
    return None
