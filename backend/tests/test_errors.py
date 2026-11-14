"""Tests for Centralized Error Handling and Structured Error Envelopes."""

import pytest
from fastapi.testclient import TestClient


def test_404_structured_error(client: TestClient):
    """Verifies that 404 responses conform to the standard error contract."""
    response = client.get("/api/experiments/unknown-id-12345")
    assert response.status_code == 404
    data = response.json()

    assert "error" in data
    assert data["error"]["code"] == "RESOURCE_NOT_FOUND"
    assert "not found" in data["error"]["message"].lower()
    assert data["status"] == 404
    assert "timestamp" in data
    assert data["path"] == "/api/experiments/unknown-id-12345"


def test_422_structured_validation_error(client: TestClient):
    """Verifies that 422 responses return structured details."""
    response = client.post("/api/experiments", json={"name": ""})  # Missing required fields
    assert response.status_code == 422
    data = response.json()

    assert "error" in data
    assert data["error"]["code"] == "REQUEST_VALIDATION_ERROR"
    assert data["status"] == 422
    assert isinstance(data["error"]["details"], list)


def test_not_found_route(client: TestClient):
    """Verifies that unmatched routes return standard 404 error envelope."""
    response = client.get("/api/unknown-route")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert data["status"] == 404

