/**
 * NASA-FLAME: Component Tests for ExperimentResultPanel
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExperimentResultPanel } from "../../visualization/components/ExperimentResultPanel/ExperimentResultPanel.tsx";
import {
  ExperimentMetadata,
  SimulationResponseData,
  AIAnalysisSummary,
  DimensionlessNumbers,
} from "../../visualization/types/index.ts";

const mockExperiment: ExperimentMetadata = {
  id: "EXP-ISS-001",
  title: "ACME CFI Laminar Coflow Methane Flame",
  fuel_type: "Methane",
  oxidizer: "O2/N2",
  oxygen_percentage: 21.0,
  pressure_atm: 1.0,
  ambient_temperature_k: 298.15,
  burner_diameter_mm: 4.2,
  gravity_level_g: 0.00001,
  provenance: {
    dataOrigin: "EXPERIMENTAL_MEASURED",
    facilityOrMission: "ISS Combustion Integrated Rack",
    citation: "NASA TM-107386",
  },
};

const mockSimulation: SimulationResponseData = {
  id: "SIM-001",
  experiment_id: "EXP-ISS-001",
  status: "COMPLETED",
  gravity_level_g: 0.00001,
  flame_shape: "SPHERICAL",
  flame_radius_mm: 6.4,
  max_temperature_k: 1512.0,
  burn_rate_mg_s: 1.25,
  soot_volume_fraction: 0.18e-6,
};

const mockAnalysis: AIAnalysisSummary = {
  id: "ANL-001",
  summary: "Combustion is strictly diffusion-controlled with zero buoyant convective flux.",
  regime_classification: "Diffusive Spherical Quiescent",
  confidence_score: 0.98,
  scientific_findings: [
    "Absence of buoyant vortex shedding confirmed (flicker = 0 Hz).",
    "Radially symmetric boundary layer extends outward beyond 12mm.",
  ],
  recommendations: ["Maintain minimum 15% O2 to avoid radiative extinction."],
};

const mockDimensionless: DimensionlessNumbers = {
  grashof_number: 0.0,
  richardson_number: 0.0,
  froude_number: 999.0,
  rayleigh_number: 0.0,
};

describe("ExperimentResultPanel Component", () => {
  it("renders experiment title, fuel type, and microgravity badge", () => {
    render(
      <ExperimentResultPanel
        experiment={mockExperiment}
        simulation={mockSimulation}
        analysis={mockAnalysis}
        dimensionlessNumbers={mockDimensionless}
      />
    );

    expect(screen.getByText("ACME CFI Laminar Coflow Methane Flame")).toBeInTheDocument();
    expect(screen.getByText("MICROGRAVITY (0g)")).toBeInTheDocument();
    expect(screen.getByText("Methane")).toBeInTheDocument();
  });

  it("renders quantitative telemetry cards with error bounds", () => {
    render(
      <ExperimentResultPanel
        experiment={mockExperiment}
        simulation={mockSimulation}
      />
    );

    expect(screen.getByText("1512.0 K")).toBeInTheDocument();
    expect(screen.getByText("Uncertainty: ±25 K")).toBeInTheDocument();
    expect(screen.getByText("6.40 mm")).toBeInTheDocument();
    expect(screen.getByText("1.25 mg/s")).toBeInTheDocument();
  });

  it("renders AI diagnostic summary and regime verdict", () => {
    render(
      <ExperimentResultPanel
        experiment={mockExperiment}
        simulation={mockSimulation}
        analysis={mockAnalysis}
      />
    );

    expect(screen.getByText("AI COMBUSTION DIAGNOSTICS & REGIME VERDICT")).toBeInTheDocument();
    expect(screen.getByText("Diffusive Spherical Quiescent")).toBeInTheDocument();
    expect(screen.getByText("Confidence: 98%")).toBeInTheDocument();
    expect(screen.getByText(/Absence of buoyant vortex shedding confirmed/i)).toBeInTheDocument();
  });

  it("handles export data button click", () => {
    const onExport = vi.fn();
    render(
      <ExperimentResultPanel
        experiment={mockExperiment}
        simulation={mockSimulation}
        onExportData={onExport}
      />
    );

    const exportBtn = screen.getByRole("button", { name: "Export JSON" });
    fireEvent.click(exportBtn);
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it("renders EmptyState when experiment and simulation are null", () => {
    render(<ExperimentResultPanel experiment={null} simulation={null} />);
    expect(screen.getByText("No Experiment Results Loaded")).toBeInTheDocument();
  });

  it("renders ErrorState when simulation has failed", () => {
    const failedSim: SimulationResponseData = {
      id: "SIM-ERR",
      experiment_id: "EXP-ERR",
      status: "FAILED",
      gravity_level_g: 0.0,
      flame_shape: "EXTINGUISHED",
      error_message: "Flame quenched due to radiative heat loss exceeding chemical heat release.",
    };
    render(<ExperimentResultPanel experiment={mockExperiment} simulation={failedSim} />);
    expect(screen.getByText("Simulation Execution Halted")).toBeInTheDocument();
    expect(screen.getByText(/Flame quenched due to radiative heat loss/i)).toBeInTheDocument();
  });
});
