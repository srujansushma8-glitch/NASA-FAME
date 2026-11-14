"""Tests for AI Analysis Engine integration and scientific explanations."""

import pytest
from fastapi.testclient import TestClient


def test_run_analysis_microgravity_regime(client: TestClient, sample_experiment_payload: dict):
    """Verifies AI analysis detects Diffusive Spherical Microgravity regime under 0g."""
    exp = client.post("/api/experiments", json=sample_experiment_payload).json()
    sim = client.post("/api/simulations/run", json={"experiment_id": exp["id"]}).json()

    analysis_req = {
        "experiment_id": exp["id"],
        "simulation_id": sim["id"],
        "analysis_focus": "full",
    }

    response = client.post("/api/analysis/run", json=analysis_req)
    assert response.status_code == 201
    data = response.json()

    assert data["experiment_id"] == exp["id"]
    assert data["simulation_id"] == sim["id"]
    assert data["status"] == "COMPLETED"
    assert "Diffusive Spherical" in data["regime_classification"]
    assert len(data["scientific_findings"]) > 0
    assert len(data["recommendations"]) > 0
    assert data["confidence_score"] > 0.8

    # Dimensionless numbers
    dim = data["dimensionless_numbers"]
    assert dim is not None
    assert dim["grashof_number"] == 0.0  # Zero gravity implies Gr = 0
    assert dim["richardson_number"] == 0.0


def test_run_analysis_earth_regime(client: TestClient, sample_experiment_payload: dict):
    """Verifies AI analysis detects Buoyant Convective Plume regime under 1g."""
    earth_exp = sample_experiment_payload.copy()
    earth_exp["gravity_level_g"] = 1.0
    exp = client.post("/api/experiments", json=earth_exp).json()
    sim = client.post(
        "/api/simulations/run",
        json={"experiment_id": exp["id"], "parameters": {"gravity_level_g": 1.0}},
    ).json()

    analysis_req = {
        "experiment_id": exp["id"],
        "simulation_id": sim["id"],
    }

    response = client.post("/api/analysis/run", json=analysis_req)
    assert response.status_code == 201
    data = response.json()

    assert "Buoyant" in data["regime_classification"]
    assert data["dimensionless_numbers"]["grashof_number"] > 0.0
    assert data["dimensionless_numbers"]["richardson_number"] > 0.0


def test_get_analysis_by_id(client: TestClient, sample_experiment_payload: dict):
    """Tests retrieving AI analysis result by ID."""
    exp = client.post("/api/experiments", json=sample_experiment_payload).json()
    ana = client.post("/api/analysis/run", json={"experiment_id": exp["id"]}).json()
    ana_id = ana["id"]

    response = client.get(f"/api/analysis/{ana_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == ana_id
    assert data["experiment_id"] == exp["id"]


def test_list_analyses_for_experiment(client: TestClient, sample_experiment_payload: dict):
    """Tests listing all AI analyses associated with an experiment."""
    exp = client.post("/api/experiments", json=sample_experiment_payload).json()
    exp_id = exp["id"]

    client.post("/api/analysis/run", json={"experiment_id": exp_id})
    client.post("/api/analysis/run", json={"experiment_id": exp_id})

    response = client.get(f"/api/analysis/experiment/{exp_id}")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_analysis_nonexistent_simulation_404(client: TestClient):
    """Verifies 404 is returned when an invalid simulation ID is provided."""
    response = client.post("/api/analysis/run", json={"simulation_id": "non-existent-sim-id"})
    assert response.status_code == 404

