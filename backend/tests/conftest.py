"""Pytest test configuration, database fixtures, and TestClient setup."""

import sys
from pathlib import Path
from typing import Generator
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

# Ensure backend and root are in python path
current_file = Path(__file__).resolve()
backend_dir = current_file.parent.parent  # backend/
repo_root = backend_dir.parent           # repo root
for p in [str(backend_dir), str(repo_root)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from backend.app.core.database import Base, get_db
from backend.app.main import app

# Isolated In-Memory SQLite Engine for Pytest
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """Provides a fresh database session for each test function."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """TestClient fixture with dependency override for the database session."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_experiment_payload() -> dict:
    """Standardized test experiment payload."""
    return {
        "name": "Microgravity Methane Test Flame",
        "description": "Validation test for spherical diffusion flame at zero gravity.",
        "fuel_type": "Methane",
        "fuel_flow_rate_sccm": 15.0,
        "oxidizer": "Air (21% O2, 79% N2)",
        "oxygen_percentage": 21.0,
        "pressure_atm": 1.0,
        "ambient_temperature_k": 298.15,
        "gravity_level_g": 0.0,
        "burner_diameter_mm": 6.0,
        "chamber_volume_liters": 50.0,
        "metadata": {
            "investigator": "Dr. Test Scientist",
            "facility": "ISS CIR / ACME",
            "tags": ["unit-test", "microgravity", "methane"],
            "notes": "Initial calibration run.",
        },
    }

