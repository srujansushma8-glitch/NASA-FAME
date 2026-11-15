"""FastAPI Application Entry Point for NASA-FLAME: Flame in Freefall.

Configures CORS, global exception handlers, OpenAPI metadata, lifecycle events,
and modular routers connecting Frontend, AI Engine, Simulation, and Database.
"""

from contextlib import asynccontextmanager
import logging
import sys
from pathlib import Path
from fastapi import FastAPI, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

# Path configuration for robust imports across various execution roots
current_file = Path(__file__).resolve()
backend_dir = current_file.parent.parent  # backend/
repo_root = backend_dir.parent           # repo root
for p in [str(backend_dir), str(repo_root)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from backend.app.api.router import api_router, health_router
from backend.app.core.config import settings
from backend.app.core.database import init_db
from backend.app.core.exceptions import (
    NASAFlameException,
    http_exception_handler,
    nasa_flame_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("nasa_flame.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle events: initializes database and services on startup."""
    logger.info("Initializing NASA-FLAME Backend Services...")
    init_db()
    try:
        from database.seeds.seed_experiments import seed_database
        seed_database()
        logger.info("Database verification and NASA seed check complete.")
    except Exception as seed_err:
        logger.warning(f"Seed verification notice: {seed_err}")
    logger.info(
        f"NASA-FLAME Backend started successfully in {settings.APP_ENV} mode "
        f"using {'SQLite' if settings.is_sqlite else 'PostgreSQL'}."
    )
    yield
    logger.info("Shutting down NASA-FLAME Backend Services.")


# FastAPI Application Instance
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description=(
        "NASA-FLAME: Flame in Freefall API.\n\n"
        "Connects frontend visualization, AI combustion diagnostics, "
        "and microgravity simulation engines to model droplet and gas "
        "flames across variable gravitational fields (0g to 1g)."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure Cross-Origin Resource Sharing (CORS)
# Supports localhost, Vercel deployments (*.vercel.app), and Render domains (*.onrender.com)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.onrender\.com|http://localhost:.*|http://127\.0\.0\.1:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Centralized Exception Handlers
app.add_exception_handler(NASAFlameException, nasa_flame_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

# Mount Routes
# Direct /health for load balancers / cloud health probes
app.include_router(health_router)
# Modular API routers (/api/experiments, /api/simulations, /api/analysis, /api/health)
app.include_router(api_router)


@app.get("/", tags=["Root"])
def root_status():
    """Root entrypoint providing service discovery links."""
    return {
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "environment": settings.APP_ENV,
        "documentation": "/docs",
        "redoc": "/redoc",
        "health": "/health",
        "api_base": "/api",
    }

