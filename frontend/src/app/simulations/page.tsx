"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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
  Radio,
  SlidersHorizontal,
  Box,
  Eye,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { Experiment, SimulationResponse } from "@/types";
import { FlameVisualizer } from "@/components/visualization/FlameVisualizer";
import { TemperatureHeatmap } from "@/components/visualization/TemperatureHeatmap";
import { MetricTimeSeriesChart } from "@/components/visualization/MetricTimeSeriesChart";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState, LoadingSpinner } from "@/components/ui/EmptyState";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Dynamic import for Three.js 3D Viewer to prevent SSR issues
const Flame3DViewer = dynamic(
  () =>
    import("@/visualization/components/Flame3DViewer/Flame3DViewer").then(
      (m) => m.Flame3DViewer
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[520px] w-full flex flex-col items-center justify-center gap-3 bg-ink-surface rounded-lg border border-stone-border font-mono text-xs text-cobalt">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-cobalt border-t-transparent" />
        <span>Initializing Three.js WebGL Combustion Canvas...</span>
      </div>
    ),
  }
);

export default function SimulationsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExperimentId, setSelectedExperimentId] = useState<string>("");
  const [simulations, setSimulations] = useState<SimulationResponse[]>([]);
  const [activeSimulation, setActiveSimulation] = useState<SimulationResponse | null>(null);

  // View mode tab: "3d" | "2d" | "heatmap" | "timeseries"
  const [viewMode, setViewMode] = useState<"3d" | "2d" | "heatmap" | "timeseries">("3d");

  // Comparison State
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [comparisonSim, setComparisonSim] = useState<SimulationResponse | null>(null);

  // Live Simulation Interactive Parameters
  const [simGravity, setSimGravity] = useState<number>(0.0);
  const [simOxygen, setSimOxygen] = useState<number>(21.0);
  const [simPressure, setSimPressure] = useState<number>(1.0);
  const [simFlowRate, setSimFlowRate] = useState<number>(15.0);
  const [simFuel, setSimFuel] = useState<string>("Methane");
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [solveError, setSolveError] = useState<string | null>(null);

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
        setSimGravity(res.items[0].gravity_level_g);
        setSimOxygen(res.items[0].oxygen_percentage);
        setSimPressure(res.items[0].pressure_atm);
        setSimFlowRate(res.items[0].fuel_flow_rate_sccm || 15.0);
        setSimFuel(res.items[0].fuel_type);
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

    const matched = experiments.find((e) => e.id === selectedExperimentId);
    if (matched) {
      setSimGravity(matched.gravity_level_g);
      setSimOxygen(matched.oxygen_percentage);
      setSimPressure(matched.pressure_atm);
      setSimFlowRate(matched.fuel_flow_rate_sccm || 15.0);
      setSimFuel(matched.fuel_type);
    }

    let mounted = true;
    api
      .listSimulationsForExperiment(selectedExperimentId)
      .then(async (sims) => {
        if (!mounted) return;
        if (sims.length > 0) {
          setSimulations(sims);
          setActiveSimulation(sims[0]);
        } else {
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

  // When comparison mode is turned on, auto-pick a complementary simulation
  useEffect(() => {
    if (compareMode && !comparisonSim && experiments.length > 1) {
      const otherExp =
        experiments.find((e) =>
          (activeSimulation?.gravity_level_g ?? 0) <= 0.05
            ? e.gravity_level_g >= 0.6
            : e.gravity_level_g <= 0.05
        ) || experiments[1];

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

  // Interactive Live Solver Execution
  const handleExecuteLiveSimulation = async () => {
    setIsSolving(true);
    setSolveError(null);
    try {
      const result = await api.runSimulation({
        experiment_id: selectedExperimentId || undefined,
        parameters: {
          gravity_level_g: simGravity,
          duration_s: 10.0,
          time_step_s: 0.1,
          grid_resolution: 64,
          radiation_model: true,
        },
      });
      setActiveSimulation(result);
      setSimulations((prev) => [result, ...prev]);
    } catch (err: unknown) {
      setSolveError(
        err instanceof Error ? err.message : "Numerical solver execution failed"
      );
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-ink text-stone py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8 relative">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-border/60">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cobalt/15 border border-cobalt/40 text-stone-light font-mono text-[10px] tracking-widest uppercase">
                  <Play className="h-3 w-3 text-cobalt" />
                  Numerical Simulation Lab
                </span>
                <span className="rounded bg-ink-surface px-2.5 py-1 text-[10px] font-mono text-stone-dim border border-stone-border/40">
                  Navier-Stokes + Energy Equations
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-stone-light mt-3 tracking-tight uppercase">
                Combustion Simulation Lab
              </h1>
              <p className="text-xs sm:text-sm text-stone mt-1 max-w-2xl font-sans">
                Interactive 3D Three.js volumetric flame dynamics, spatial thermal heatmaps, and transient extinction tracking.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCompareMode(!compareMode)}
                className={`flex items-center gap-2 rounded border px-4 py-2 text-xs font-mono font-medium transition-all ${
                  compareMode
                    ? "bg-cobalt text-white border-cobalt shadow-[0_0_15px_rgba(43,75,255,0.4)] font-bold"
                    : "bg-ink-surface text-stone border-stone-border hover:bg-ink-elevated"
                }`}
              >
                <GitCompare className="h-4 w-4" />
                <span>{compareMode ? "Exit Compare Mode" : "Side-by-Side Gravity Compare"}</span>
              </button>
            </div>
          </div>

          {/* Real-time Interactive Simulation Control Panel */}
          <div className="p-6 rounded-lg bg-ink-surface border border-stone-border/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-border/60 pb-3">
              <div className="flex items-center gap-2 font-mono text-xs text-stone-light font-bold">
                <SlidersHorizontal className="h-4 w-4 text-cobalt" />
                <span className="uppercase tracking-wider">Live Combustion Parameter Tuning</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSimGravity(0.0)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono border transition-colors ${
                    simGravity === 0.0
                      ? "bg-cobalt/20 text-white border-cobalt font-bold"
                      : "bg-ink text-stone-dim border-stone-border hover:text-stone"
                  }`}
                >
                  0.0g Microgravity
                </button>
                <button
                  type="button"
                  onClick={() => setSimGravity(0.166)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono border transition-colors ${
                    Math.abs(simGravity - 0.166) < 0.01
                      ? "bg-cobalt/20 text-white border-cobalt font-bold"
                      : "bg-ink text-stone-dim border-stone-border hover:text-stone"
                  }`}
                >
                  0.166g Moon
                </button>
                <button
                  type="button"
                  onClick={() => setSimGravity(0.38)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono border transition-colors ${
                    Math.abs(simGravity - 0.38) < 0.01
                      ? "bg-cobalt/20 text-white border-cobalt font-bold"
                      : "bg-ink text-stone-dim border-stone-border hover:text-stone"
                  }`}
                >
                  0.38g Mars
                </button>
                <button
                  type="button"
                  onClick={() => setSimGravity(1.0)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono border transition-colors ${
                    simGravity === 1.0
                      ? "bg-flame/20 text-stone-light border-flame font-bold"
                      : "bg-ink text-stone-dim border-stone-border hover:text-stone"
                  }`}
                >
                  1.0g Earth
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Gravity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-stone-dim uppercase">Gravity:</span>
                  <span className="text-cobalt font-bold">{simGravity.toFixed(3)} g</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.01"
                  value={simGravity}
                  onChange={(e) => setSimGravity(parseFloat(e.target.value))}
                  className="w-full accent-[#2B4BFF] cursor-pointer"
                />
              </div>

              {/* Oxygen Concentration */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-stone-dim uppercase">Ambient O₂:</span>
                  <span className="text-stone-light font-bold">{simOxygen.toFixed(1)} %</span>
                </div>
                <input
                  type="range"
                  min="15.0"
                  max="40.0"
                  step="0.5"
                  value={simOxygen}
                  onChange={(e) => setSimOxygen(parseFloat(e.target.value))}
                  className="w-full accent-[#2B4BFF] cursor-pointer"
                />
              </div>

              {/* Fuel Selection */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-stone-dim uppercase">Fuel Species:</span>
                </div>
                <select
                  value={simFuel}
                  onChange={(e) => setSimFuel(e.target.value)}
                  className="w-full rounded bg-ink border border-stone-border px-2.5 py-1.5 text-xs font-mono text-stone-light focus:outline-none focus:border-cobalt"
                >
                  <option value="Methane" className="bg-ink text-white">Methane (CH₄)</option>
                  <option value="Propane" className="bg-ink text-white">Propane (C₃H₈)</option>
                  <option value="Ethylene" className="bg-ink text-white">Ethylene (C₂H₄)</option>
                  <option value="Heptane" className="bg-ink text-white">n-Heptane (C₇H₁₆)</option>
                  <option value="Hydrogen" className="bg-ink text-white">Hydrogen (H₂)</option>
                </select>
              </div>

              {/* Pressure & Flow Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-stone-dim uppercase">Pressure / Flow:</span>
                  <span className="text-stone-light font-bold">{simPressure.toFixed(1)} atm · {simFlowRate} sccm</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.2"
                    max="10.0"
                    step="0.1"
                    value={simPressure}
                    onChange={(e) => setSimPressure(parseFloat(e.target.value) || 1.0)}
                    className="w-1/2 rounded bg-ink border border-stone-border px-2 py-1 text-xs font-mono text-stone-light"
                  />
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={simFlowRate}
                    onChange={(e) => setSimFlowRate(parseFloat(e.target.value) || 15.0)}
                    className="w-1/2 rounded bg-ink border border-stone-border px-2 py-1 text-xs font-mono text-stone-light"
                  />
                </div>
              </div>

              {/* Run Simulation CTA */}
              <div className="flex items-end">
                <button
                  type="button"
                  disabled={isSolving}
                  onClick={handleExecuteLiveSimulation}
                  className="w-full flex items-center justify-center gap-2 rounded bg-cobalt hover:bg-cobalt-hover disabled:bg-ink-surface disabled:text-stone-muted py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(43,75,255,0.35)] transition-all"
                >
                  {isSolving ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Solving...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Start Simulation</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {solveError && (
              <div className="p-3.5 rounded bg-ink border border-flame/60 text-xs font-mono text-stone-light flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-flame" />
                <span>{solveError}</span>
              </div>
            )}
          </div>

          {/* Experiment Target Selector Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-ink-surface p-5 rounded-lg border border-stone-border">
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-xs font-mono text-cobalt mb-1.5 uppercase tracking-widest font-semibold">
                Target Reference Dataset:
              </label>
              <select
                value={selectedExperimentId}
                onChange={(e) => setSelectedExperimentId(e.target.value)}
                className="w-full sm:max-w-md rounded bg-ink border border-stone-border px-3.5 py-2 text-xs font-mono text-stone-light focus:outline-none focus:border-cobalt transition-all"
              >
                {experiments.map((exp) => (
                  <option key={exp.id} value={exp.id} className="bg-ink text-white">
                    {exp.name} ({exp.gravity_level_g.toFixed(3)}g - {exp.fuel_type})
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Tabs */}
            <div className="flex items-center gap-1.5 bg-ink p-1 rounded border border-stone-border/60 font-mono text-xs">
              <button
                type="button"
                onClick={() => setViewMode("3d")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                  viewMode === "3d"
                    ? "bg-cobalt text-white font-bold shadow-[0_0_12px_rgba(43,75,255,0.35)]"
                    : "text-stone-dim hover:text-white"
                }`}
              >
                <Box className="h-3.5 w-3.5" />
                <span>3D Three.js</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("2d")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                  viewMode === "2d"
                    ? "bg-cobalt text-white font-bold shadow-[0_0_12px_rgba(43,75,255,0.35)]"
                    : "text-stone-dim hover:text-white"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>2D Isotherms</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("heatmap")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                  viewMode === "heatmap"
                    ? "bg-cobalt text-white font-bold shadow-[0_0_12px_rgba(43,75,255,0.35)]"
                    : "text-stone-dim hover:text-white"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Heatmap</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("timeseries")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                  viewMode === "timeseries"
                    ? "bg-cobalt text-white font-bold shadow-[0_0_12px_rgba(43,75,255,0.35)]"
                    : "text-stone-dim hover:text-white"
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Time Series</span>
              </button>
            </div>
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
              description="No simulation runs found for the selected experiment. Launch one above."
              actionLabel="Launch in Workspace"
              onAction={() =>
                (window.location.href = `/workspace?experimentId=${selectedExperimentId}`)
              }
            />
          ) : compareMode && comparisonSim ? (
            /* =========================================================================
               SIDE-BY-SIDE GRAVITY COMPARATOR MODE
               ========================================================================= */
            <div className="space-y-6">
              <div className="rounded-lg border border-cobalt/40 bg-ink-surface p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono">
                <div className="flex items-center gap-2 text-stone-light font-bold">
                  <GitCompare className="h-4 w-4 text-cobalt" />
                  <span className="uppercase tracking-wider">
                    Side-by-Side Gravity Regime Comparison Active
                  </span>
                </div>
                <div className="text-stone">
                  Comparing{" "}
                  <span className="text-white font-bold bg-ink px-2 py-0.5 rounded border border-stone-border">
                    {activeSimulation.gravity_level_g.toFixed(3)}g
                  </span>{" "}
                  vs{" "}
                  <span className="text-flame font-bold bg-ink px-2 py-0.5 rounded border border-stone-border">
                    {comparisonSim.gravity_level_g.toFixed(3)}g
                  </span>
                </div>
              </div>

              {/* Comparative Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg border border-stone-border bg-ink-surface p-5 text-xs font-mono">
                  <div className="text-stone-dim uppercase tracking-wider text-[10px]">
                    Peak Temp Difference
                  </div>
                  <div className="text-2xl font-bold font-display text-white mt-1.5">
                    {Math.abs(
                      (activeSimulation.max_temperature_k || 0) -
                        (comparisonSim.max_temperature_k || 0)
                    ).toFixed(1)}{" "}
                    K
                  </div>
                  <div className="text-[10px] text-stone-muted mt-1 font-sans">
                    {(activeSimulation.max_temperature_k || 0) >
                    (comparisonSim.max_temperature_k || 0)
                      ? "Higher in Primary"
                      : "Higher in Comparison"}
                  </div>
                </div>

                <div className="rounded-lg border border-stone-border bg-ink-surface p-5 text-xs font-mono">
                  <div className="text-stone-dim uppercase tracking-wider text-[10px]">
                    Radius Delta
                  </div>
                  <div className="text-2xl font-bold font-display text-cobalt mt-1.5">
                    {Math.abs(
                      (activeSimulation.flame_radius_mm || 0) -
                        (comparisonSim.flame_radius_mm || 0)
                    ).toFixed(2)}{" "}
                    mm
                  </div>
                  <div className="text-[10px] text-stone-muted mt-1 font-sans">
                    0g exhibits wider spherical envelope
                  </div>
                </div>

                <div className="rounded-lg border border-stone-border bg-ink-surface p-5 text-xs font-mono">
                  <div className="text-stone-dim uppercase tracking-wider text-[10px]">
                    Burn Rate Delta
                  </div>
                  <div className="text-2xl font-bold font-display text-stone-light mt-1.5">
                    {Math.abs(
                      (activeSimulation.burn_rate_mg_s || 0) -
                        (comparisonSim.burn_rate_mg_s || 0)
                    ).toFixed(2)}{" "}
                    mg/s
                  </div>
                  <div className="text-[10px] text-stone-muted mt-1 font-sans">
                    Convection boosts terrestrial burn rate
                  </div>
                </div>

                <div className="rounded-lg border border-stone-border bg-ink-surface p-5 text-xs font-mono">
                  <div className="text-stone-dim uppercase tracking-wider text-[10px]">
                    Morphology Regimes
                  </div>
                  <div className="text-sm font-bold font-display text-stone-light mt-2 truncate">
                    {activeSimulation.flame_shape} vs {comparisonSim.flame_shape}
                  </div>
                  <div className="text-[10px] text-stone-muted mt-1 font-sans">
                    Spherical diffusion vs Convective plume
                  </div>
                </div>
              </div>

              {/* Side-by-side Flame Visualizers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between font-mono text-xs text-cobalt pb-2 border-b border-stone-border/60">
                    <span className="uppercase tracking-widest font-bold">
                      CONDITION A: PRIMARY RUN ({activeSimulation.gravity_level_g.toFixed(3)}g)
                    </span>
                  </div>
                  <Flame3DViewer
                    simulationData={activeSimulation as any}
                    gravityLevel={activeSimulation.gravity_level_g}
                    fuelName={simFuel}
                    height={460}
                  />
                  <TemperatureHeatmap
                    scalarField={activeSimulation.spatial_scalar_field}
                    title="2D Spatial Temperature (Run A)"
                    maxTempK={activeSimulation.max_temperature_k}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between font-mono text-xs text-flame pb-2 border-b border-stone-border/60">
                    <span className="uppercase tracking-widest font-bold">
                      CONDITION B: COMPARISON RUN ({comparisonSim.gravity_level_g.toFixed(3)}g)
                    </span>
                  </div>
                  <Flame3DViewer
                    simulationData={comparisonSim as any}
                    gravityLevel={comparisonSim.gravity_level_g}
                    fuelName={comparisonSim.gravity_level_g >= 0.6 ? "Methane Plume" : "Microgravity Fuel"}
                    height={460}
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
                  subtitle={
                    activeSimulation.gravity_level_g <= 0.05
                      ? "ISS 0g Freefall"
                      : activeSimulation.gravity_level_g < 0.6
                      ? "Partial Gravity"
                      : "Earth Plume"
                  }
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

              {/* Main Visualization Display depending on viewMode */}
              {viewMode === "3d" && (
                <div className="rounded-lg border border-stone-border bg-ink-surface p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-border/60">
                    <div className="flex items-center gap-2">
                      <Box className="h-4 w-4 text-cobalt" />
                      <span className="font-mono text-xs font-bold text-stone-light uppercase tracking-wider">
                        Interactive Three.js 3D Volumetric Chamber Visualization
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-stone-dim">
                      Rotate: Click &amp; Drag · Zoom: Wheel · Presets Available
                    </span>
                  </div>
                  <Flame3DViewer
                    simulationData={activeSimulation as any}
                    gravityLevel={activeSimulation.gravity_level_g}
                    fuelName={simFuel}
                    height={520}
                  />
                </div>
              )}

              {viewMode === "2d" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-12">
                    <FlameVisualizer
                      shape={activeSimulation.flame_shape}
                      gravity={activeSimulation.gravity_level_g}
                      flameRadiusMm={activeSimulation.flame_radius_mm}
                      flameHeightMm={activeSimulation.flame_height_mm}
                      maxTemperatureK={activeSimulation.max_temperature_k}
                      sootFraction={activeSimulation.soot_volume_fraction}
                      title="Flame Morphology &amp; Scientific Isotherms"
                    />
                  </div>
                </div>
              )}

              {viewMode === "heatmap" && (
                <div className="rounded-lg border border-stone-border bg-ink-surface p-6 space-y-4">
                  <TemperatureHeatmap
                    scalarField={activeSimulation.spatial_scalar_field}
                    title="2D Spatial Thermal Distribution Heatmap"
                    maxTempK={activeSimulation.max_temperature_k}
                  />
                </div>
              )}

              {viewMode === "timeseries" && (
                <div className="rounded-lg border border-stone-border bg-ink-surface p-6 space-y-4">
                  <MetricTimeSeriesChart
                    data={activeSimulation.time_series}
                    title="Combustion Temporal Trajectory (Discrete Time-Series Points)"
                  />
                </div>
              )}

              {/* Scientific Measurement Panels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="rounded-lg border border-stone-border bg-ink-surface p-5 space-y-2 text-xs font-mono">
                  <div className="text-cobalt font-bold uppercase tracking-wider">
                    Fluid Dynamic Velocity
                  </div>
                  <p className="text-stone font-sans leading-relaxed">
                    {activeSimulation.gravity_level_g <= 0.05
                      ? "Thermal buoyant velocity u_buoy ≈ 0.00 m/s. Mass transport is governed purely by Fickian molecular diffusion kinetics without convective vortex flicker."
                      : `Buoyant updraft acceleration u_buoy ≈ ${(
                          Math.sqrt(
                            2 *
                              9.81 *
                              activeSimulation.gravity_level_g *
                              ((activeSimulation.flame_height_mm || 20) / 1000) *
                              (((activeSimulation.max_temperature_k || 2000) - 298) /
                                (activeSimulation.max_temperature_k || 2000))
                          )
                        ).toFixed(2)} m/s, accelerating hot gases upwards.`}
                  </p>
                </div>

                <div className="rounded-lg border border-stone-border bg-ink-surface p-5 space-y-2 text-xs font-mono">
                  <div className="text-flame font-bold uppercase tracking-wider">
                    Soot Shell &amp; Radiation
                  </div>
                  <p className="text-stone font-sans leading-relaxed">
                    {activeSimulation.gravity_level_g <= 0.05
                      ? "Soot volume fraction peaks in outer spherical boundary shell. Absence of buoyant sweep permits radiative heat loss to exceed kinetic release if flow is reduced."
                      : "Continuous buoyant convection extracts soot particles into the thermal exhaust plume, reducing local shell radiative trapping."}
                  </p>
                </div>

                <div className="rounded-lg border border-stone-border bg-ink-surface p-5 space-y-2 text-xs font-mono">
                  <div className="text-stone-light font-bold uppercase tracking-wider">
                    Extinction Assessment
                  </div>
                  <p className="text-stone font-sans leading-relaxed">
                    {activeSimulation.extinction_time_s
                      ? `Radiative extinction observed at t = ${activeSimulation.extinction_time_s.toFixed(1)} s due to heat dissipation.`
                      : "Quasi-steady combustion envelope sustained without quench threshold breach under active flow rate."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
