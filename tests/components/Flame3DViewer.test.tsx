/**
 * NASA-FLAME: Component Tests for Flame3DViewer
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Flame3DViewer } from "../../visualization/components/Flame3DViewer/Flame3DViewer.tsx";
import { SimulationResponseData } from "../../visualization/types/index.ts";

const mock0gSimulation: SimulationResponseData = {
  id: "SIM-0G-001",
  experiment_id: "EXP-0G-001",
  status: "COMPLETED",
  gravity_level_g: 0.00001,
  flame_shape: "SPHERICAL",
  flame_radius_mm: 6.5,
  flame_height_mm: 13.0,
  max_temperature_k: 1510.0,
  burn_rate_mg_s: 1.2,
  soot_volume_fraction: 0.15e-6,
  extinction_time_s: null,
  time_series: [
    { time_s: 0.0, flame_radius_mm: 0.0, max_temperature_k: 300, burning_rate_mg_s: 0.0, soot_fraction: 0.0 },
    { time_s: 1.0, flame_radius_mm: 6.0, max_temperature_k: 1500, burning_rate_mg_s: 1.1, soot_fraction: 0.14e-6 },
    { time_s: 2.0, flame_radius_mm: 6.5, max_temperature_k: 1510, burning_rate_mg_s: 1.2, soot_fraction: 0.15e-6 },
  ],
  provenance: {
    dataOrigin: "EXPERIMENTAL_MEASURED",
    facilityOrMission: "ISS Combustion Integrated Rack",
    citation: "NASA TM-107386",
  },
};

const mock1gSimulation: SimulationResponseData = {
  id: "SIM-1G-001",
  experiment_id: "EXP-1G-001",
  status: "COMPLETED",
  gravity_level_g: 1.0,
  flame_shape: "TEARDROP",
  flame_radius_mm: 4.8,
  flame_height_mm: 15.2,
  max_temperature_k: 1750.0,
  burn_rate_mg_s: 45.0,
  soot_volume_fraction: 1.0e-6,
  provenance: {
    dataOrigin: "VISUALIZATION_MODEL",
  },
};

describe("Flame3DViewer Component", () => {
  it("renders the 3D viewport header and title", () => {
    render(<Flame3DViewer simulationData={mock0gSimulation} />);
    expect(screen.getByText("FLAME 3D VIEWPORT")).toBeInTheDocument();
    expect(screen.getByText(/0g Spherical/i)).toBeInTheDocument();
  });

  it("displays correct scientific HUD metrics for 0g microgravity (0.00 Hz flicker)", () => {
    render(<Flame3DViewer simulationData={mock0gSimulation} />);
    expect(screen.getByText("0.00 Hz (Steady)")).toBeInTheDocument();
    expect(screen.getByText(/T_peak:/i)).toBeInTheDocument();
    expect(screen.getByText(/r_flame:/i)).toBeInTheDocument();
  });

  it("displays flicker frequency and draft velocity for 1g terrestrial gravity", () => {
    render(<Flame3DViewer simulationData={mock1gSimulation} />);
    expect(screen.getByText(/u_draft:/i)).toBeInTheDocument();
    expect(screen.queryByText("0.00 Hz (Steady)")).not.toBeInTheDocument();
  });

  it("displays provenance badge correctly for empirical vs procedural models", () => {
    const { unmount } = render(<Flame3DViewer simulationData={mock0gSimulation} />);
    expect(screen.getByText("NASA EMPIRICAL DATA")).toBeInTheDocument();
    unmount();

    render(<Flame3DViewer simulationData={mock1gSimulation} />);
    expect(screen.getByText("VISUALIZATION MODEL")).toBeInTheDocument();
  });

  it("handles camera preset button clicks", () => {
    render(<Flame3DViewer simulationData={mock0gSimulation} />);
    const sideBtn = screen.getByRole("button", { name: "side" });
    const topBtn = screen.getByRole("button", { name: "top" });
    const resetBtn = screen.getByRole("button", { name: "Reset" });

    fireEvent.click(sideBtn);
    fireEvent.click(topBtn);
    fireEvent.click(resetBtn);
  });

  it("toggles play and pause controls", () => {
    render(<Flame3DViewer simulationData={mock0gSimulation} />);
    const pauseBtn = screen.getByRole("button", { name: "Pause" });
    fireEvent.click(pauseBtn);
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("renders cleanly with null simulation data", () => {
    render(<Flame3DViewer simulationData={null} />);
    expect(screen.getByText("FLAME 3D VIEWPORT")).toBeInTheDocument();
  });
});
