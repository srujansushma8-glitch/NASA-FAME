"""Tests for Experiment CRUD, validations, and query filtering."""

import pytest
from fastapi.testclient import TestClient


def test_create_experiment_success(client: TestClient, sample_experiment_payload: dict):
    """Tests successful experiment creation with full parameters and metadata."""
    response = client.post("/api/experiments", json=sample_experiment_payload)
    assert response.status_code == 201
    data = response.json()

    assert "id" in data
    assert data["name"] == sample_experiment_payload["name"]
    assert data["fuel_type"] == "Methane"
    assert data["gravity_level_g"] == 0.0
    assert data["status"] == "DRAFT"
    assert data["metadata"]["investigator"] == "Dr. Test Scientist"
    assert "microgravity" in data["metadata"]["tags"]
    assert "created_at" in data
    assert "updated_at" in data


def test_get_experiment_by_id(client: TestClient, sample_experiment_payload: dict):
    """Tests retrieving an experiment by its unique ID."""
    created = client.post("/api/experiments", json=sample_experiment_payload).json()
    exp_id = created["id"]

    response = client.get(f"/api/experiments/{exp_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == exp_id
    assert data["name"] == sample_experiment_payload["name"]


def test_get_nonexistent_experiment_returns_404(client: TestClient):
    """Verifies that requesting an unknown experiment ID returns 404."""
    response = client.get("/api/experiments/non-existent-uuid")
    assert response.status_code == 404
    data = response.json()
    assert data["error"]["code"] == "RESOURCE_NOT_FOUND"


def test_list_experiments_pagination(client: TestClient, sample_experiment_payload: dict):
    """Tests listing experiments with pagination."""
    # Create 3 experiments
    for i in range(3):
        payload = sample_experiment_payload.copy()
        payload["name"] = f"Experiment #{i+1}"
        client.post("/api/experiments", json=payload)

    response = client.get("/api/experiments?page=1&page_size=2")
    assert response.status_code == 200
    data = response.json()

    assert data["total"] == 3
    assert data["page"] == 1
    assert data["page_size"] == 2
    assert len(data["items"]) == 2


def test_list_experiments_filters(client: TestClient, sample_experiment_payload: dict):
    """Tests filtering experiments by gravity level and fuel type."""
    # Microgravity methane
    exp1 = sample_experiment_payload.copy()
    exp1["name"] = "0g Methane"
    exp1["fuel_type"] = "Methane"
    exp1["gravity_level_g"] = 0.0
    client.post("/api/experiments", json=exp1)

    # Earth gravity propane
    exp2 = sample_experiment_payload.copy()
    exp2["name"] = "1g Propane"
    exp2["fuel_type"] = "Propane"
    exp2["gravity_level_g"] = 1.0
    client.post("/api/experiments", json=exp2)

    # Filter by fuel_type=Propane
    resp_fuel = client.get("/api/experiments?fuel_type=Propane")
    assert resp_fuel.status_code == 200
    assert resp_fuel.json()["total"] == 1
    assert resp_fuel.json()["items"][0]["fuel_type"] == "Propane"

    # Filter by max_gravity=0.5
    resp_grav = client.get("/api/experiments?max_gravity=0.5")
    assert resp_grav.status_code == 200
    assert resp_grav.json()["total"] == 1
    assert resp_grav.json()["items"][0]["gravity_level_g"] == 0.0


def test_update_experiment(client: TestClient, sample_experiment_payload: dict):
    """Tests updating experiment parameters."""
    created = client.post("/api/experiments", json=sample_experiment_payload).json()
    exp_id = created["id"]

    update_payload = {
        "name": "Updated Microgravity Methane Flame",
        "pressure_atm": 2.5,
        "status": "RUNNING",
    }
    response = client.put(f"/api/experiments/{exp_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()

    assert data["name"] == "Updated Microgravity Methane Flame"
    assert data["pressure_atm"] == 2.5
    assert data["status"] == "RUNNING"


def test_delete_experiment(client: TestClient, sample_experiment_payload: dict):
    """Tests deleting an experiment removes it from the database."""
    created = client.post("/api/experiments", json=sample_experiment_payload).json()
    exp_id = created["id"]

    del_resp = client.delete(f"/api/experiments/{exp_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["deleted"] is True

    # Subsequent retrieval should return 404
    get_resp = client.get(f"/api/experiments/{exp_id}")
    assert get_resp.status_code == 404


def test_validation_error_invalid_parameters(client: TestClient, sample_experiment_payload: dict):
    """Verifies that invalid physics inputs (e.g. pressure <= 0 or oxygen > 100) are rejected with 422."""
    invalid_payload = sample_experiment_payload.copy()
    invalid_payload["pressure_atm"] = -1.0  # Invalid pressure

    response = client.post("/api/experiments", json=invalid_payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "REQUEST_VALIDATION_ERROR"

