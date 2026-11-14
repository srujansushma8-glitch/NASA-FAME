"""Tests for Simulation Engine integration, execution, and output verification."""

import pytest
from fastapi.testclient import TestClient


def test_run_simulation_microgravity_spherical(client: TestClient, sample_experiment_payload: dict):
    """Verifies that running a simulation under 0g produces a spherical diffusion flame."""
    exp = client.post("/api/experiments", json=sample_experiment_payload).json()
    exp_id = exp["id"]

    sim_req = {
        "experiment_id": exp_id,
        "parameters": {
            "gravity_level_g": 0.0,
            "duration_s": 5.0,
            "time_step_s": 0.5,
            "grid_resolution": 32,
        },
    }

    response = client.post("/api/simulations/run", json=sim_req)
    assert response.status_code == 201
    data = response.json()

    assert data["experiment_id"] == exp_id
    assert data["status"] == "COMPLETED"
    assert data["gravity_level_g"] == 0.0
    assert data["flame_shape"] == "SPHERICAL"
    assert data["flame_radius_mm"] > 0
    assert data["max_temperature_k"] > 1000
    assert len(data["time_series"]) > 0
    assert data["spatial_scalar_field"] is not None
    assert "temperature_matrix" in data["spatial_scalar_field"]


def test_run_simulation_earth_gravity_teardrop(client: TestClient, sample_experiment_payload: dict):
    """Verifies that running a simulation under 1g produces a buoyant teardrop flame."""
    earth_exp = sample_experiment_payload.copy()
    earth_exp["gravity_level_g"] = 1.0
    exp = client.post("/api/experiments", json=earth_exp).json()

    sim_req = {
        "experiment_id": exp["id"],
        "parameters": {
            "gravity_level_g": 1.0,
            "duration_s": 5.0,
            "time_step_s": 0.5,
        },
    }

    response = client.post("/api/simulations/run", json=sim_req)
    assert response.status_code == 201
    data = response.json()

    assert data["flame_shape"] == "TEARDROP"
    assert data["flame_height_mm"] > data["flame_radius_mm"] * 2.0


def test_get_simulation_by_id(client: TestClient, sample_experiment_payload: dict):
    """Tests retrieving simulation result by ID."""
    exp = client.post("/api/experiments", json=sample_experiment_payload).json()
    sim = client.post("/api/simulations/run", json={"experiment_id": exp["id"]}).json()
    sim_id = sim["id"]

    response = client.get(f"/api/simulations/{sim_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sim_id
    assert data["experiment_id"] == exp["id"]


def test_list_simulations_for_experiment(client: TestClient, sample_experiment_payload: dict):
    """Tests listing all simulations associated with an experiment."""
    exp = client.post("/api/experiments", json=sample_experiment_payload).json()
    exp_id = exp["id"]

    # Run 2 simulations
    client.post("/api/simulations/run", json={"experiment_id": exp_id})
    client.post("/api/simulations/run", json={"experiment_id": exp_id})

    response = client.get(f"/api/simulations/experiment/{exp_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_run_simulation_adhoc_config(client: TestClient):
    """Tests running simulation with on-the-fly ad-hoc parameters without prior experiment."""
    sim_req = {
        "adhoc_config": {
            "name": "Adhoc Hydrogen Zero-G",
            "fuel_type": "Hydrogen",
            "gravity_level_g": 0.0,
            "oxygen_percentage": 25.0,
        },
        "parameters": {
            "duration_s": 4.0,
        },
    }

    response = client.post("/api/simulations/run", json=sim_req)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert data["flame_shape"] == "SPHERICAL"


def test_simulation_nonexistent_experiment_404(client: TestClient):
    """Verifies that referencing a non-existent experiment returns 404."""
    response = client.post("/api/simulations/run", json={"experiment_id": "non-existent-id"})
    assert response.status_code == 404

