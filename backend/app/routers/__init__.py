from .auth import router as auth_router
from .warehouses import router as warehouses_router
from .tenants import router as tenants_router
from .leases import router as leases_router
from .payments import router as payments_router
from .maintenance import router as maintenance_router

__all__ = [
    "auth_router",
    "warehouses_router",
    "tenants_router",
    "leases_router",
    "payments_router",
    "maintenance_router"
]
