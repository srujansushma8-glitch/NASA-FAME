"""Database session, engine configuration, and health verification."""

import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

# Engine configuration depending on backend DB (Postgres vs SQLite development fallback)
connect_args = {}
engine_kwargs = {}

if settings.is_sqlite:
    connect_args["check_same_thread"] = False
else:
    engine_kwargs.update(
        {
            "pool_size": 10,
            "max_overflow": 20,
            "pool_pre_ping": True,
        }
    )

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    **engine_kwargs,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for yielding database session with automated cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database_connection() -> dict:
    """Verifies active connectivity to the database and returns health metadata."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "status": "connected",
            "dialect": engine.dialect.name,
            "database_url_masked": (
                settings.DATABASE_URL.split("@")[-1]
                if "@" in settings.DATABASE_URL
                else settings.DATABASE_URL
            ),
        }
    except Exception as exc:
        logger.error(f"Database health check failed: {exc}")
        return {
            "status": "disconnected",
            "dialect": engine.dialect.name,
            "error": str(exc),
        }


def init_db() -> None:
    """Creates all database tables defined in the SQLAlchemy models."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as exc:
        logger.error(f"Failed to initialize database tables: {exc}")
        raise

