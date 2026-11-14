"""Main API router combining all sub-routers for NASA-FLAME."""

from fastapi import APIRouter
from backend.app.api.health import router as health_router
from backend.app.api.experiments import router as experiments_router
from backend.app.api.simulations import router as simulations_router
from backend.app.api.analysis import router as analysis_router

api_router = APIRouter(prefix="/api")

# Subrouters
api_router.include_router(experiments_router)
api_router.include_router(simulations_router)
api_router.include_router(analysis_router)
api_router.include_router(health_router)

__all__ = ["api_router", "health_router"]

