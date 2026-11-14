/**
 * NASA-FLAME: Component Tests for GravityComparisonChart
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GravityComparisonChart } from "../../visualization/components/GravityComparisonChart/GravityComparisonChart.tsx";
import { GravityComparisonData, DimensionlessNumbers } from "../../visualization/types/index.ts";

const mockComparisonData: GravityComparisonData = {
  comparison_id: "CMP-001",
  fuel_or_configuration: "Methane Coflow Burner",
  data_origin: "EXPERIMENTAL_MEASURED",
  metrics: [
    {
      metric_name: "Flame Aspect Ratio (L/W)",
      value_1g: 3.2,
      value_microgravity: 0.95,
      unit: "ratio",
      absolute_difference: -2.25,
      percentage_change: -70.3,
      direction: "DECREASED",
      physical_driver: "Loss of buoyant convective acceleration prevents vertical elongation, yielding a spherical flame.",
    },
    {
      metric_name: "Peak Temperature",
      value_1g: 1750.0,
      value_microgravity: 1510.0,
      unit: "K",
      absolute_difference: -240.0,
      percentage_change: -13.7,
      direction: "DECREASED",
      physical_driver: "Diffusion limits oxidizer transport rate and enhanced spherical radiative heat loss cools the flame zone.",
    },
    {
      metric_name: "Flicker Frequency",
      value_1g: 11.5,
      value_microgravity: 0.0,
      unit: "Hz",
      absolute_difference: -11.5,
      percentage_change: -100.0,
      direction: "DECREASED",
      physical_driver: "Kelvin-Helmholtz buoyant vortex shedding is eliminated in zero gravity.",
    },
  ],
  summary_of_differences: ["Flames are spherical, flicker-free, and cooler in microgravity."],
  key_physical_mechanisms: ["Burke-Schumann molecular diffusion", "Absence of buoyant draft"],
  scientific_conclusions: "Microgravity combustion is diffusion-controlled.",
  limitations: ["Quiescent ambient assumption"],
};

const mockDimensionless: DimensionlessNumbers = {
  grashof_number: 1.2e5,
  richardson_number: 8.5,
  froude_number: 0.45,
  rayleigh_number: 8.6e4,
};

describe("GravityComparisonChart Component", () => {
  it("renders header and comparison metrics", () => {
    render(<GravityComparisonChart comparisonData={mockComparisonData} dimensionlessNumbers={mockDimensionless} />);
    expect(screen.getByText("TERRESTRIAL (1g) vs MICROGRAVITY (0g) COMPARISON")).toBeInTheDocument();
    expect(screen.getByText("Methane Coflow Burner")).toBeInTheDocument();
    expect(screen.getByText("Flame Aspect Ratio (L/W)")).toBeInTheDocument();
    expect(screen.getByText("Peak Temperature")).toBeInTheDocument();
  });

  it("displays delta percentage changes", () => {
    render(<GravityComparisonChart comparisonData={mockComparisonData} />);
    expect(screen.getByText("-70.3%")).toBeInTheDocument();
    expect(screen.getByText("-13.7%")).toBeInTheDocument();
    expect(screen.getByText("-100.0%")).toBeInTheDocument();
  });

  it("expands physical mechanism on metric click", () => {
    render(<GravityComparisonChart comparisonData={mockComparisonData} />);
    const aspectMetric = screen.getByText("Flame Aspect Ratio (L/W)");
    fireEvent.click(aspectMetric);

    expect(screen.getByText(/Physical Mechanism:/i)).toBeInTheDocument();
    expect(screen.getByText(/Loss of buoyant convective acceleration/i)).toBeInTheDocument();
  });

  it("displays dimensionless fluid dynamic groups", () => {
    render(<GravityComparisonChart comparisonData={mockComparisonData} dimensionlessNumbers={mockDimensionless} />);
    expect(screen.getByText("Grashof (Gr)")).toBeInTheDocument();
    expect(screen.getByText("Richardson (Ri)")).toBeInTheDocument();
    expect(screen.getByText("8.50")).toBeInTheDocument();
  });

  it("renders EmptyState when comparison data is empty", () => {
    render(<GravityComparisonChart comparisonData={null} />);
    expect(screen.getByText("No Gravity Comparison Data")).toBeInTheDocument();
  });
});
