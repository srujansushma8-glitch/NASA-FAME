"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Play,
  Layers,
  ArrowRight,
  RefreshCw,
  GitCompare,
  TrendingUp,
  Maximize2,
  Activity,
  Flame,
} from "lucide-react";
import { api } from "@/lib/api";
import { Experiment, SimulationResponse } from "@/types";
import { FlameVisualizer } from "@/components/visualization/FlameVisualizer";
import { TemperatureHeatmap } from "@/components/visualization/TemperatureHeatmap";
import { MetricTimeSeriesChart } from "@/components/visualization/MetricTimeSeriesChart";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState, LoadingSpinner } from "@/components/ui/EmptyState";

export default function SimulationsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExperimentId, setSelectedExperimentId] = useState<string>("");
  const [simulations, setSimulations] = useState<SimulationResponse[]>([]);
  const [activeSimulation, setActiveSimulation] = useState<SimulationResponse | null>(null);

  // Comparison State
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [comparisonSim, setComparisonSim] = useState<SimulationResponse | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load experiments
  const loadExperiments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listExperiments({ page: 1, page_size: 50 });
      setExperiments(res.items);
      if (res.items.length > 0) {
        setSelectedExperimentId(res.items[0].id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load simulation experiments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiments();
  }, []);

  // When selected experiment changes, fetch its simulations
  useEffect(() => {
    if (!selectedExperimentId) return;

    let mounted = true;
    api
      .listSimulationsForExperiment(selectedExperimentId)
      .then(async (sims) => {
        if (!mounted) return;
        if (sims.length > 0) {
          setSimulations(sims);
          setActiveSimulation(sims[0]);
        } else {
          // If no simulations exist yet for this experiment, trigger one automatically so results display!
          try {
            const newSim = await api.runSimulation({
              experiment_id: selectedExperimentId,
            });
            if (mounted) {
              setSimulations([newSim]);
              setActiveSimulation(newSim);
            }
          } catch (e) {
            if (mounted) {
              setSimulations([]);
              setActiveSimulation(null);
            }
          }
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error("Error fetching simulations", err);
          setSimulations([]);
          setActiveSimulation(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, [selectedExperimentId]);

  // When comparison mode is turned on, auto-pick a complementary simulation (e.g., if active is 0g, pick 1g baseline)
  useEffect(() => {
    if (compareMode && !comparisonSim && experiments.length > 1) {
      const otherExp =
        experiments.find((e) => (activeSimulation?.gravity_level_g ?? 0) <= 0.05 ? e.gravity_level_g >= 0.6 : e.gravity_level_g <= 0.05) ||
        experiments[1];

      if (otherExp) {
        api.listSimulationsForExperiment(otherExp.id).then(async (sims) => {
          if (sims.length > 0) {
            setComparisonSim(sims[0]);
          } else {
            const newSim = await api.runSimulation({ experiment_id: otherExp.id });
            setComparisonSim(newSim);
          }
        });
      }
    }
  }, [compareMode, activeSimulation, experiments]);

  const activeExp = experiments.find((e) => e.id === selectedExperimentId);

  return (
    <div className="flex-1 bg-[#080B12] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-flame-400 uppercase tracking-widest">
                Member 4 Numerical Engine &bull; Physics Outputs
              </span>
              <span className="rounded bg-flame-950/60 px-2 py-0.5 text-[10px] font-mono text-flame-300 border border-flame-700/40">
                Eulerian Grid &bull; d&sup2;-law &bull; Burke-Schumann
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Simulation Results &amp; Gravity Comparator
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Quantitative flame morphology metrics, 2D thermal field heatmaps, and transient curves.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-mono font-medium border transition-colors ${
                compareMode
                  ? "bg-electric text-white border-electric shadow-md shadow-electric/25"
                  : "bg-charcoal-700 text-slate-200 border-border hover:bg-charcoal-600"
              }`}
            >
              <GitCompare className="h-4 w-4" />
              <span>{compareMode ? "Exit Comparator" : "Compare Gravity Regimes"}</span>
            </button>

            <Link
              href="/workspace"
              className="flex items-center gap-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-border px-3.5 py-2 text-xs font-mono font-medium text-slate-200 transition-colors"
            >
              <Play className="h-3.5 w-3.5" />
              <span>New Simulation</span>
            </Link>
          </div>
        </div>

        {/* Experiment Selector Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-charcoal-800/60 p-4 rounded-xl border border-border/80">
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Select Primary Target Experiment:
            </label>
            <select
              value={selectedExperimentId}
              onChange={(e) => setSelectedExperimentId(e.target.value)}
              className="w-full sm:max-w-md rounded-lg bg-charcoal-900 border border-border px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-electric"
            >
              {experiments.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.name} ({exp.gravity_level_g.toFixed(3)}g - {exp.fuel_type})
                </option>
              ))}
            </select>
          </div>

          {activeExp && (
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-300">
              <span className="bg-charcoal-900 px-2.5 py-1 rounded border border-border">
                Fuel: <strong className="text-white">{activeExp.fuel_type}</strong>
              </span>
              <span className="bg-charcoal-900 px-2.5 py-1 rounded border border-border">
                Gravity: <strong className="text-electric-400">{activeExp.gravity_level_g.toFixed(3)}g</strong>
              </span>
              <span className="bg-charcoal-900 px-2.5 py-1 rounded border border-border">
                O₂: <strong className="text-white">{activeExp.oxygen_percentage}%</strong>
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <LoadingSpinner message="Loading simulation results..." />
        ) : error ? (
          <EmptyState
            title="Unable to Load Simulation Data"
            description={error}
            actionLabel="Retry"
            onAction={loadExperiments}
            icon="error"
          />
        ) : !activeSimulation ? (
          <EmptyState
            title="No Simulation Results Available"
            description="No simulation runs found for the selected experiment. Launch one in the workspace."
            actionLabel="Launch in Workspace"
            onAction={() => (window.location.href = `/workspace?experimentId=${selectedExperimentId}`)}
          />
        ) : compareMode && comparisonSim ? (
          /* =========================================================================
             SIDE-BY-SIDE GRAVITY COMPARATOR MODE
             ========================================================================= */
          <div className="space-y-6">
            <div className="rounded-xl border border-electric/40 bg-electric-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-electric-400 font-bold">
                <GitCompare className="h-4 w-4" />
                <span>Side-by-Side Gravity Regime Comparison Active</span>
              </div>
              <div className="text-slate-300">
                Comparing{" "}
                <span className="text-white font-bold">{activeSimulation.gravity_level_g.toFixed(3)}g</span> vs{" "}
                <span className="text-flame-400 font-bold">
                  {comparisonSim.gravity_level_g.toFixed(3)}g
                </span>
              </div>
            </div>

            {/* Comparative Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border bg-[#090D16] p-4 text-xs font-mono">
                <div className="text-slate-400">Peak Temp Difference</div>
                <div className="text-xl font-bold text-white mt-1">
                  {Math.abs(
                    (activeSimulation.max_temperature_k || 0) -
                      (comparisonSim.max_temperature_k || 0)
                  ).toFixed(1)}{" "}
                  K
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {(activeSimulation.max_temperature_k || 0) >
                  (comparisonSim.max_temperature_k || 0)
                    ? "Higher in Primary"
                    : "Higher in Comparison"}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-[#090D16] p-4 text-xs font-mono">
                <div className="text-slate-400">Radius Delta</div>
                <div className="text-xl font-bold text-electric-400 mt-1">
                  {Math.abs(
                    (activeSimulation.flame_radius_mm || 0) -
                      (comparisonSim.flame_radius_mm || 0)
                  ).toFixed(2)}{" "}
                  mm
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  0g exhibits wider spherical envelope
                </div>
              </div>

              <div className="rounded-xl border border-border bg-[#090D16] p-4 text-xs font-mono">
                <div className="text-slate-400">Burn Rate Delta</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  {Math.abs(
                    (activeSimulation.burn_rate_mg_s || 0) -
                      (comparisonSim.burn_rate_mg_s || 0)
                  ).toFixed(2)}{" "}
                  mg/s
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Convection boosts terrestrial burn rate
                </div>
              </div>

              <div className="rounded-xl border border-border bg-[#090D16] p-4 text-xs font-mono">
                <div className="text-slate-400">Morphology Regimes</div>
                <div className="text-sm font-bold text-amber-400 mt-1">
                  {activeSimulation.flame_shape} vs {comparisonSim.flame_shape}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Spherical diffusion vs Convective plume
                </div>
              </div>
            </div>

            {/* Side-by-side Flame Visualizers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono text-xs text-electric-400 pb-2 border-b border-border">
                  <span>CONDITION A: PRIMARY RUN</span>
                  <span>{activeSimulation.gravity_level_g.toFixed(3)}g</span>
                </div>
                <FlameVisualizer
                  shape={activeSimulation.flame_shape}
                  gravity={activeSimulation.gravity_level_g}
                  flameRadiusMm={activeSimulation.flame_radius_mm}
                  flameHeightMm={activeSimulation.flame_height_mm}
                  maxTemperatureK={activeSimulation.max_temperature_k}
                  sootFraction={activeSimulation.soot_volume_fraction}
                  title={`Run A: ${activeSimulation.flame_shape}`}
                />
                <TemperatureHeatmap
                  scalarField={activeSimulation.spatial_scalar_field}
                  title="2D Spatial Temperature (Run A)"
                  maxTempK={activeSimulation.max_temperature_k}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono text-xs text-flame-400 pb-2 border-b border-border">
                  <span>CONDITION B: COMPARISON RUN</span>
                  <span>{comparisonSim.gravity_level_g.toFixed(3)}g</span>
                </div>
                <FlameVisualizer
                  shape={comparisonSim.flame_shape}
                  gravity={comparisonSim.gravity_level_g}
                  flameRadiusMm={comparisonSim.flame_radius_mm}
                  flameHeightMm={comparisonSim.flame_height_mm}
                  maxTemperatureK={comparisonSim.max_temperature_k}
                  sootFraction={comparisonSim.soot_volume_fraction}
                  title={`Run B: ${comparisonSim.flame_shape}`}
                />
                <TemperatureHeatmap
                  scalarField={comparisonSim.spatial_scalar_field}
                  title="2D Spatial Temperature (Run B)"
                  maxTempK={comparisonSim.max_temperature_k}
                />
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             STANDARD SINGLE SIMULATION DRILLDOWN VIEW
             ========================================================================= */
          <div className="space-y-6">
            {/* Primary Scalar Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard
                title="Gravity Field"
                value={`${activeSimulation.gravity_level_g.toFixed(3)}`}
                unit="g"
                subtitle={activeSimulation.gravity_level_g <= 0.05 ? "ISS 0g Freefall" : "Earth Plume"}
                variant="electric"
              />
              <StatCard
                title="Flame Shape"
                value={activeSimulation.flame_shape}
                subtitle="Reaction zone morphology"
                variant="slate"
              />
              <StatCard
                title="Peak Temp"
                value={activeSimulation.max_temperature_k?.toFixed(0) || "—"}
                unit="K"
                subtitle="Maximum thermal core"
                variant="flame"
              />
              <StatCard
                title="Flame Radius"
                value={activeSimulation.flame_radius_mm?.toFixed(2) || "—"}
                unit="mm"
                subtitle="Radial reaction front"
                variant="emerald"
              />
              <StatCard
                title="Mass Burn Rate"
                value={activeSimulation.burn_rate_mg_s?.toFixed(2) || "—"}
                unit="mg/s"
                subtitle="Fuel consumption rate"
                variant="amber"
              />
              <StatCard
                title="Soot Volume"
                value={
                  activeSimulation.soot_volume_fraction
                    ? `${(activeSimulation.soot_volume_fraction * 1e6).toFixed(1)}`
                    : "—"
                }
                unit="ppm"
                subtitle="Particulate concentration"
                variant="slate"
              />
            </div>

            {/* 2D Heatmap & Flame Visualizer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <FlameVisualizer
                  shape={activeSimulation.flame_shape}
                  gravity={activeSimulation.gravity_level_g}
                  flameRadiusMm={activeSimulation.flame_radius_mm}
                  flameHeightMm={activeSimulation.flame_height_mm}
                  maxTemperatureK={activeSimulation.max_temperature_k}
                  sootFraction={activeSimulation.soot_volume_fraction}
                  title="Flame Morphology & Geometry"
                />
              </div>

              <div className="lg:col-span-6">
                <TemperatureHeatmap
                  scalarField={activeSimulation.spatial_scalar_field}
                  title="2D Spatial Temperature Field"
                  maxTempK={activeSimulation.max_temperature_k}
                />
              </div>
            </div>

            {/* Transient Temporal Trajectory Chart */}
            <MetricTimeSeriesChart
              data={activeSimulation.time_series}
              title="Combustion Temporal Trajectory (Discrete Time-Series)"
            />
          </div>
        )}
      </div>
    </div>
  );
}

