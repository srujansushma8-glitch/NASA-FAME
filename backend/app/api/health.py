"""Health monitoring endpoint for NASA-FLAME backend."""

from datetime import datetime, timezone
import time
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.database import check_database_connection, get_db
from backend.app.schemas.common import HealthResponse

router = APIRouter(tags=["Health & Diagnostics"])

START_TIME = time.time()


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Service Health Check",
    description="Returns current service status, database connectivity, and uptime metrics.",
)
def get_health_status() -> HealthResponse:
    """Performs deep health check verifying database and application subsystems."""
    db_health = check_database_connection()
    is_healthy = db_health.get("status") == "connected"
    overall_status = "healthy" if is_healthy else "degraded"

    return HealthResponse(
        status=overall_status,
        service="nasa-flame-backend",
        version=settings.VERSION,
        environment=settings.APP_ENV,
        database=db_health,
        timestamp=datetime.now(timezone.utc),
        uptime_seconds=round(time.time() - START_TIME, 2),
    )

