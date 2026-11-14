/**
 * NASA-FLAME: Component Tests for TemperatureDistributionChart
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TemperatureDistributionChart } from "../../visualization/components/TemperatureDistributionChart/TemperatureDistributionChart.tsx";
import { SimulationResponseData } from "../../visualization/types/index.ts";

const mockSimulationWithGrid: SimulationResponseData = {
  id: "SIM-TEMP-001",
  experiment_id: "EXP-001",
  status: "COMPLETED",
  gravity_level_g: 0.0,
  flame_shape: "SPHERICAL",
  flame_radius_mm: 5.0,
  flame_height_mm: 10.0,
  max_temperature_k: 1515.0,
  time_series: [
    { time_s: 0.0, flame_radius_mm: 0.0, max_temperature_k: 300, burning_rate_mg_s: 0.0, soot_fraction: 0.0 },
    { time_s: 1.0, flame_radius_mm: 4.8, max_temperature_k: 1515, burning_rate_mg_s: 1.2, soot_fraction: 0.2e-6 },
  ],
  spatial_scalar_field: {
    grid_x: [-10, 0, 10],
    grid_y: [-10, 0, 10],
    temperature_matrix: [
      [300, 500, 300],
      [500, 1515, 500],
      [300, 500, 300],
    ],
  },
};

const mockFailedSimulation: SimulationResponseData = {
  id: "SIM-FAIL-001",
  experiment_id: "EXP-FAIL",
  status: "FAILED",
  gravity_level_g: 1.0,
  flame_shape: "EXTINGUISHED",
  error_message: "Extinction occurred due to low oxidizer concentration (<13% O2).",
};

describe("TemperatureDistributionChart Component", () => {
  it("renders header with peak temperature and tabs", () => {
    render(<TemperatureDistributionChart simulationData={mockSimulationWithGrid} />);
    expect(screen.getByText("TEMPERATURE ANALYSIS")).toBeInTheDocument();
    expect(screen.getByText(/Peak: 1515.0 K/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2D Contour" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Radial T(r)" })).toBeInTheDocument();
  });

  it("switches to Radial T(r) tab and displays radial profile", () => {
    render(<TemperatureDistributionChart simulationData={mockSimulationWithGrid} />);
    const radialTab = screen.getByRole("button", { name: "Radial T(r)" });
    fireEvent.click(radialTab);

    expect(screen.getByText(/Radial Temperature Profile T\(r\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Reaction Zone/i)).toBeInTheDocument();
  });

  it("switches to Temporal T(t) tab and displays time evolution", () => {
    render(<TemperatureDistributionChart simulationData={mockSimulationWithGrid} />);
    const temporalTab = screen.getByRole("button", { name: "Temporal T(t)" });
    fireEvent.click(temporalTab);

    expect(screen.getByText(/Peak Flame Temperature Evolution T_max\(t\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Elapsed Simulation Time/i)).toBeInTheDocument();
  });

  it("switches to 0g vs 1g Comparison tab and displays physics differences", () => {
    render(<TemperatureDistributionChart simulationData={mockSimulationWithGrid} />);
    const cmpTab = screen.getByRole("button", { name: "0g vs 1g Comparison" });
    fireEvent.click(cmpTab);

    expect(screen.getByText("MICROGRAVITY (0g)")).toBeInTheDocument();
    expect(screen.getByText("TERRESTRIAL GRAVITY (1g)")).toBeInTheDocument();
    expect(screen.getByText(/Key Scientific Finding:/i)).toBeInTheDocument();
  });

  it("renders EmptyState when simulationData is null or undefined", () => {
    render(<TemperatureDistributionChart simulationData={null} />);
    expect(screen.getByText("No Temperature Distribution Data")).toBeInTheDocument();
  });

  it("renders ErrorState when simulation has failed", () => {
    render(<TemperatureDistributionChart simulationData={mockFailedSimulation} />);
    expect(screen.getByText("Simulation Execution Failed")).toBeInTheDocument();
    expect(screen.getByText(/Extinction occurred due to low oxidizer/i)).toBeInTheDocument();
  });
});
