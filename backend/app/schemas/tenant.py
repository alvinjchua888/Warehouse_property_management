from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class TenantBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    business_name: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    notes: Optional[str] = None

class TenantCreate(TenantBase):
    pass

class TenantUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    business_name: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None

class TenantResponse(TenantBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
