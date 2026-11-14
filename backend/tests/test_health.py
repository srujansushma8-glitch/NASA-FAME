"""Tests for Health Check and Root Service Discovery."""

import pytest
from fastapi.testclient import TestClient


def test_health_endpoint(client: TestClient):
    """Verifies /health returns 200 OK and valid database status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "healthy"
    assert data["service"] == "nasa-flame-backend"
    assert "version" in data
    assert "uptime_seconds" in data
    assert data["database"]["status"] == "connected"


def test_api_health_endpoint(client: TestClient):
    """Verifies /api/health also returns 200 OK."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_root_discovery_endpoint(client: TestClient):
    """Verifies root endpoint returns service links."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["documentation"] == "/docs"
    assert data["health"] == "/health"
    assert data["api_base"] == "/api"

