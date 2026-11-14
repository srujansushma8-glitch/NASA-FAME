/**
 * NASA-FLAME: Component Tests for FlameGeometryViewer
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FlameGeometryViewer } from "../../visualization/components/FlameGeometryViewer/FlameGeometryViewer.tsx";
import { SimulationResponseData } from "../../visualization/types/index.ts";

const mock0gData: SimulationResponseData = {
  id: "SIM-GEO-0G",
  experiment_id: "EXP-0G",
  status: "COMPLETED",
  gravity_level_g: 0.0,
  flame_shape: "SPHERICAL",
  flame_radius_mm: 7.0,
  flame_height_mm: 14.0,
  max_temperature_k: 1520.0,
};

const mock1gData: SimulationResponseData = {
  id: "SIM-GEO-1G",
  experiment_id: "EXP-1G",
  status: "COMPLETED",
  gravity_level_g: 1.0,
  flame_shape: "TEARDROP",
  flame_radius_mm: 4.5,
  flame_height_mm: 16.0,
  max_temperature_k: 1760.0,
};

describe("FlameGeometryViewer Component", () => {
  it("renders geometry header with aspect ratio", () => {
    render(<FlameGeometryViewer simulationData={mock0gData} />);
    expect(screen.getByText("FLAME GEOMETRY & MORPHOLOGY")).toBeInTheDocument();
    expect(screen.getByText(/Aspect Ratio: 1/i)).toBeInTheDocument();
  });

  it("displays 0g spherical flame markers and dimensions", () => {
    render(<FlameGeometryViewer simulationData={mock0gData} burnerDiameterMm={4.0} />);
    expect(screen.getByText("MICROGRAVITY (0g)")).toBeInTheDocument();
    expect(screen.getByText(/Burke-Schumann Sphere/i)).toBeInTheDocument();
    expect(screen.getByText(/TERRESTRIAL BASELINE \(1.0g\)/i)).toBeInTheDocument();
  });

  it("toggles dimensions and soot zone buttons", () => {
    render(<FlameGeometryViewer simulationData={mock0gData} />);
    const dimBtn = screen.getByRole("button", { name: /Dimensions ON/i });
    const sootBtn = screen.getByRole("button", { name: /Soot Zone ON/i });

    fireEvent.click(dimBtn);
    expect(screen.getByRole("button", { name: /Dimensions OFF/i })).toBeInTheDocument();

    fireEvent.click(sootBtn);
    expect(screen.getByRole("button", { name: /Soot Zone OFF/i })).toBeInTheDocument();
  });

  it("renders 1g buoyant teardrop plume representation", () => {
    render(<FlameGeometryViewer simulationData={mock1gData} />);
    expect(screen.getByText("GRAVITY (1.00g)")).toBeInTheDocument();
    expect(screen.getByText(/Buoyant Teardrop Plume/i)).toBeInTheDocument();
  });

  it("renders EmptyState when simulationData is null", () => {
    render(<FlameGeometryViewer simulationData={null} />);
    expect(screen.getByText("No Flame Geometry Data")).toBeInTheDocument();
  });
});
