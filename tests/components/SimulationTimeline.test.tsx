/**
 * NASA-FLAME: Component Tests for SimulationTimeline
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SimulationTimeline } from "../../visualization/components/SimulationTimeline/SimulationTimeline.tsx";
import { SimulationTimeSeriesPoint } from "../../visualization/types/index.ts";

const mockTimeSeries: SimulationTimeSeriesPoint[] = [
  { time_s: 0.0, flame_radius_mm: 0.0, max_temperature_k: 300, burning_rate_mg_s: 0.0, soot_fraction: 0.0 },
  { time_s: 1.0, flame_radius_mm: 4.5, max_temperature_k: 1450, burning_rate_mg_s: 1.0, soot_fraction: 0.1e-6 },
  { time_s: 2.0, flame_radius_mm: 5.2, max_temperature_k: 1520, burning_rate_mg_s: 1.2, soot_fraction: 0.15e-6 },
  { time_s: 3.0, flame_radius_mm: 5.2, max_temperature_k: 1520, burning_rate_mg_s: 1.2, soot_fraction: 0.15e-6 },
];

describe("SimulationTimeline Component", () => {
  it("renders timeline header, timestamp and sparkline labels", () => {
    const onTimeChange = vi.fn();
    render(
      <SimulationTimeline
        timeSeries={mockTimeSeries}
        currentTime={1.0}
        onTimeChange={onTimeChange}
      />
    );

    expect(screen.getByText("SIMULATION TIMELINE")).toBeInTheDocument();
    expect(screen.getByText("t = 1.00s / 3.0s")).toBeInTheDocument();
    expect(screen.getByText("T_max")).toBeInTheDocument();
    expect(screen.getByText("Radius")).toBeInTheDocument();
    expect(screen.getByText("Burn Rate")).toBeInTheDocument();
    expect(screen.getByText("Soot Frac")).toBeInTheDocument();
  });

  it("calls onTimeChange when slider value changes", () => {
    const onTimeChange = vi.fn();
    render(
      <SimulationTimeline
        timeSeries={mockTimeSeries}
        currentTime={1.0}
        onTimeChange={onTimeChange}
      />
    );

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "2.5" } });
    expect(onTimeChange).toHaveBeenCalledWith(2.5);
  });

  it("handles play/pause toggle button click", () => {
    const onTogglePlay = vi.fn();
    render(
      <SimulationTimeline
        timeSeries={mockTimeSeries}
        currentTime={1.0}
        isPlaying={false}
        onTimeChange={() => {}}
        onTogglePlay={onTogglePlay}
      />
    );

    const playBtn = screen.getByRole("button", { name: "PLAY" });
    fireEvent.click(playBtn);
    expect(onTogglePlay).toHaveBeenCalledTimes(1);
  });

  it("displays extinction marker if flame quenches", () => {
    render(
      <SimulationTimeline
        timeSeries={mockTimeSeries}
        currentTime={1.0}
        extinctionTime={2.0}
        onTimeChange={() => {}}
      />
    );

    expect(screen.getByText("Extinction")).toBeInTheDocument();
  });

  it("renders EmptyState when timeSeries is empty", () => {
    render(<SimulationTimeline timeSeries={[]} currentTime={0} onTimeChange={() => {}} />);
    expect(screen.getByText("No Simulation Timeline Data")).toBeInTheDocument();
  });
});
