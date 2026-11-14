"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, Layers, Activity, ArrowRight, Sparkles, SlidersHorizontal, Flame } from "lucide-react";
import { FlameVisualizer } from "@/components/visualization/FlameVisualizer";
import { TemperatureHeatmap } from "@/components/visualization/TemperatureHeatmap";
import { MetricTimeSeriesChart } from "@/components/visualization/MetricTimeSeriesChart";
import { SimulationScalarField, SimulationTimeSeriesPoint } from "@/types";

export function CombustionVisualizerPreview() {
  const [activeTab, setActiveTab] = useState<"morphology" | "heatmap" | "timeseries">("morphology");
  const [previewGravity, setPreviewGravity] = useState<number>(0.0);

  // Generate synthetic 2D contour field for preview if none provided
  const generatePreviewField = (g: number): SimulationScalarField => {
    const res = 24;
    const span = 25.0;
    const step = (2 * span) / (res - 1);
    const grid_x: number[] = [];
    const grid_y: number[] = [];
    for (let i = 0; i < res; i++) {
      grid_x.push(Math.round((-span + i * step) * 10) / 10);
      grid_y.push(Math.round((-span + i * step) * 10) / 10);
    }

    const isZero = g === 0;
    const r_f = isZero ? 10.5 : 6.0;
    const t_peak = isZero ? 2086.0 : 2226.0;
    const t_amb = 298.15;

    const matrix: number[][] = [];
    for (const y of grid_y) {
      const row: number[] = [];
      for (const x of grid_x) {
        let temp: number;
        if (isZero) {
          const dist = Math.sqrt(x * x + y * y);
          temp = t_amb + (t_peak - t_amb) * Math.exp(-Math.pow(dist - r_f, 2) / 36);
        } else {
          const dist_x = Math.abs(x);
          const dist_y = y - 7.0;
          temp =
            t_amb +
            (t_peak - t_amb) *
              Math.exp(-((dist_x * dist_x) / 30 + (dist_y * dist_y) / 90));
        }
        row.push(Math.round(temp));
      }
      matrix.push(row);
    }

    return { grid_x, grid_y, temperature_matrix: matrix };
  };

  // Generate sample time-series trajectory
  const generatePreviewTimeSeries = (g: number): SimulationTimeSeriesPoint[] => {
    const points: SimulationTimeSeriesPoint[] = [];
    const isZero = g === 0;
    const peakR = isZero ? 10.5 : 5.8;
    const peakT = isZero ? 2086 : 2226;

    for (let s = 0; s <= 20; s++) {
      const t = Math.round(s * 0.25 * 10) / 10;
      const trans = 1.0 - Math.exp(-t / 0.5);
      points.push({
        time_s: t,
        flame_radius_mm: Math.round(peakR * trans * 10) / 10,
        max_temperature_k: Math.round(298 + (peakT - 298) * trans),
        burning_rate_mg_s: Math.round((isZero ? 1.2 : 2.1) * trans * 10) / 10,
        soot_fraction: 1.5e-6 * trans,
      });
    }
    return points;
  };

  const previewField = generatePreviewField(previewGravity);
  const previewTimeSeries = generatePreviewTimeSeries(previewGravity);

  return (
    <section className="relative py-20 sm:py-28 border-b border-border bg-[#06080E]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric-950/40 px-3.5 py-1 text-xs font-mono text-electric-400">
              <Eye className="h-3.5 w-3.5" />
              <span>INTERACTIVE THERMOGRAPHY &amp; CONTOURS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
              Scientific Visualization Suite
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
              Explore multi-dimensional combustion diagnostics: inspect stoichiometric boundary isotherms, probe 2D Eulerian
              temperature matrices, and track discrete transient combustion kinetics.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-charcoal-800/80 border border-border">
            {[
              { id: "morphology", label: "Geometry & Isotherms" },
              { id: "heatmap", label: "2D Thermal Grid" },
              { id: "timeseries", label: "Reaction Trajectory" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-electric text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visualizer Display Box */}
        <div className="rounded-2xl glass-panel-glow p-6 sm:p-8">
          {/* Quick Gravity Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-border">
            <div className="flex items-center gap-2 font-mono text-xs">
              <SlidersHorizontal className="h-4 w-4 text-electric-400" />
              <span className="text-slate-400">ACTIVE GRAVITY CONDITION:</span>
              <span className="text-white font-bold">{previewGravity.toFixed(2)}g</span>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              {[0.0, 0.166, 0.38, 1.0].map((gVal) => (
                <button
                  key={gVal}
                  onClick={() => setPreviewGravity(gVal)}
                  className={`px-2.5 py-1 rounded border transition-colors ${
                    previewGravity === gVal
                      ? "bg-electric-950 text-electric-400 border-electric/40 font-bold"
                      : "bg-charcoal-800 text-slate-400 border-border hover:text-white"
                  }`}
                >
                  {gVal}g
                </button>
              ))}
            </div>
          </div>

          {/* Main Visualizer Views */}
          {activeTab === "morphology" && (
            <FlameVisualizer
              gravity={previewGravity}
              flameRadiusMm={previewGravity === 0 ? 10.5 : previewGravity < 0.5 ? 8.2 : 5.8}
              flameHeightMm={previewGravity >= 0.5 ? 28.0 : undefined}
              maxTemperatureK={previewGravity === 0 ? 2086 : 2226}
              title={`Stoichiometric Flame Boundary (${previewGravity}g)`}
              showControls={true}
            />
          )}

          {activeTab === "heatmap" && (
            <div className="space-y-4">
              <TemperatureHeatmap
                scalarField={previewField}
                title={`2D Eulerian Blackbody Temperature Matrix (${previewGravity}g)`}
              />
              <p className="text-xs font-mono text-slate-400">
                PROBE INTERACTION: Hover over grid points on the canvas to inspect local temperature (Kelvin) across the Eulerian domain.
              </p>
            </div>
          )}

          {activeTab === "timeseries" && (
            <MetricTimeSeriesChart
              data={previewTimeSeries}
              title={`Transient Ignition & Steady-State Kinetics (${previewGravity}g)`}
            />
          )}

          <div className="mt-8 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
            <span className="text-slate-400">
              MEMBER 4 INTEGRATION: Dynamic numerical solver outputs conforming to NASA-FLAME data contracts.
            </span>
            <Link
              href="/simulations"
              className="inline-flex items-center gap-1.5 text-electric-400 hover:text-electric-300 font-semibold"
            >
              <span>Launch Full Simulation Suite</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

