from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import (
    auth_router,
    warehouses_router,
    tenants_router,
    leases_router,
    payments_router,
    maintenance_router
)

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(warehouses_router, prefix="/api")
app.include_router(tenants_router, prefix="/api")
app.include_router(leases_router, prefix="/api")
app.include_router(payments_router, prefix="/api")
app.include_router(maintenance_router, prefix="/api")

@app.get("/")
def root():
    """Root endpoint."""
    return {"message": "Welcome to Warehouse Rental Management API"}

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
