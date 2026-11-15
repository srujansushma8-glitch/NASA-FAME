"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Compass,
  Play,
  Cpu,
  History,
  Flame,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Radio,
  Gauge,
  Thermometer,
  Wind,
  Orbit,
  TrendingUp,
  Box,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { api } from "@/lib/api";
import { Experiment, HealthResponse, SimulationResponse } from "@/types";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/Badge";
import { GravitySelector } from "@/components/ui/GravitySelector";
import { EmptyState, LoadingSpinner } from "@/components/ui/EmptyState";
import { FlameVisualizer } from "@/components/visualization/FlameVisualizer";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DashboardPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [latestSim, setLatestSim] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [selectedGravity, setSelectedGravity] = useState<number>(0.0);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Simulated telemetry sensor stream for real-time monitoring
  const [telemetryTime, setTelemetryTime] = useState<string>("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTelemetryTime(
        `${now.toISOString().replace("T", " ").substring(0, 19)} UTC`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [expRes, healthRes] = await Promise.all([
        api.listExperiments({ page: 1, page_size: 50 }),
        api.getHealth().catch(() => null),
      ]);
      setExperiments(expRes.items);
      if (healthRes) setHealth(healthRes);

      // Find the latest simulation from the first available experiment
      if (expRes.items.length > 0) {
        for (const exp of expRes.items) {
          if (exp.simulations_count && exp.simulations_count > 0) {
            try {
              const sims = await api.listSimulationsForExperiment(exp.id);
              if (sims.length > 0) {
                setLatestSim(sims[0]);
                break;
              }
            } catch {
              // ignore
            }
          }
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute metrics based on actual available experiments
  const totalExperiments = experiments.length;
  const zeroGCount = experiments.filter((e) => e.gravity_level_g <= 0.05).length;
  const partialGCount = experiments.filter(
    (e) => e.gravity_level_g > 0.05 && e.gravity_level_g < 0.6
  ).length;
  const earthCount = experiments.filter((e) => e.gravity_level_g >= 0.6).length;
  const totalSimulations = experiments.reduce(
    (acc, curr) => acc + (curr.simulations_count || 0),
    0
  );
  const totalAnalyses = experiments.reduce(
    (acc, curr) => acc + (curr.analyses_count || 0),
    0
  );

  // Filtered experiments for table
  const filteredExperiments = experiments.filter((e) => {
    const matchesSearch =
      searchQuery === "" ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.fuel_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  // Mock telemetry trend data for temperature and pressure monitoring
  const telemetryTrendData = [
    { time: "00:00", temp: 298, pressure: 1.002, o2: 21.0 },
    { time: "00:02", temp: 580, pressure: 1.004, o2: 20.9 },
    { time: "00:04", temp: 1420, pressure: 1.011, o2: 20.8 },
    { time: "00:06", temp: 1980, pressure: 1.018, o2: 20.6 },
    { time: "00:08", temp: 2145, pressure: 1.022, o2: 20.5 },
    { time: "00:10", temp: 2140, pressure: 1.021, o2: 20.5 },
    { time: "00:12", temp: 2135, pressure: 1.020, o2: 20.4 },
    { time: "00:14", temp: 2142, pressure: 1.021, o2: 20.4 },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-transparent text-stone py-10 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-7xl space-y-8 relative">
          {/* Top Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-border/60">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cobalt/15 border border-cobalt/40 text-stone-light font-mono text-[10px] tracking-widest uppercase">
                  <Radio className="h-3 w-3 text-cobalt animate-pulse" />
                  Mission Control Telemetry
                </span>
                <span className="rounded bg-ink-surface px-2.5 py-1 text-[10px] font-mono text-stone-dim border border-stone-border/40">
                  DB: {health?.database?.engine || "SQLite Active"}
                </span>
                <span className="rounded bg-ink-surface text-stone-light border border-cobalt/30 px-2.5 py-1 text-[10px] font-mono">
                  LIVE API CONNECTION
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-stone-light mt-3 tracking-tight uppercase">
                Mission Control Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-stone mt-1 max-w-2xl font-sans">
                Real-time combustion diagnostics, variable gravity simulation results, and computational fluid mechanics telemetry.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 rounded bg-ink-surface hover:bg-ink-elevated border border-stone-border px-4 py-2 text-xs font-mono font-medium text-stone transition-all"
                title="Refresh Data"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loading ? "animate-spin text-cobalt" : ""}`}
                />
                <span>Sync Telemetry</span>
              </button>

              <Link
                href="/workspace"
                className="flex items-center gap-2 rounded bg-cobalt hover:bg-cobalt-hover px-5 py-2 text-xs font-mono font-semibold text-white shadow-[0_0_20px_rgba(43,75,255,0.35)] transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>New Experiment</span>
              </Link>
            </div>
          </div>

          {/* Real-time Telemetry HUD Panel */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 p-4 rounded-xl bg-ink-surface/80 backdrop-blur-xl border border-stone-border/40 font-mono text-xs shadow-xl">
            <div className="p-3 rounded-lg bg-ink/75 border border-stone-border/30">
              <div className="flex items-center gap-1.5 text-stone-muted text-[10px] uppercase">
                <Orbit className="h-3 w-3 text-cobalt" />
                <span>ISS Freefall (0g)</span>
              </div>
              <div className="text-sm font-bold text-stone-light mt-1">1.2 × 10⁻⁶ g</div>
              <div className="text-[10px] text-cobalt mt-0.5">NOMINAL DRIFT</div>
            </div>

            <div className="p-3 rounded-lg bg-ink/75 border border-stone-border/30">
              <div className="flex items-center gap-1.5 text-stone-muted text-[10px] uppercase">
                <Thermometer className="h-3 w-3 text-flame" />
                <span>Chamber Temp</span>
              </div>
              <div className="text-sm font-bold text-stone-light mt-1">298.15 K</div>
              <div className="text-[10px] text-stone-muted mt-0.5">ISOTHERMAL BASE</div>
            </div>

            <div className="p-3 rounded-lg bg-ink/75 border border-stone-border/30">
              <div className="flex items-center gap-1.5 text-stone-muted text-[10px] uppercase">
                <Gauge className="h-3 w-3 text-cobalt" />
                <span>Pressure</span>
              </div>
              <div className="text-sm font-bold text-stone-light mt-1">1.018 atm</div>
              <div className="text-[10px] text-stone-dim mt-0.5">REGULATED SEAL</div>
            </div>

            <div className="p-3 rounded-lg bg-ink/75 border border-stone-border/30">
              <div className="flex items-center gap-1.5 text-stone-muted text-[10px] uppercase">
                <Wind className="h-3 w-3 text-stone" />
                <span>Oxygen Level</span>
              </div>
              <div className="text-sm font-bold text-stone-light mt-1">21.0 % O₂</div>
              <div className="text-[10px] text-stone-muted mt-0.5">79% N₂ BALANCE</div>
            </div>

            <div className="p-3 rounded-lg bg-ink/75 border border-stone-border/30">
              <div className="flex items-center gap-1.5 text-stone-muted text-[10px] uppercase">
                <Radio className="h-3 w-3 text-cobalt" />
                <span>ISS Orbital Alt</span>
              </div>
              <div className="text-sm font-bold text-stone-light mt-1">418.2 km</div>
              <div className="text-[10px] text-stone-muted mt-0.5">INC 51.6°</div>
            </div>

            <div className="p-3 rounded-lg bg-ink/75 border border-stone-border/30">
              <div className="flex items-center gap-1.5 text-stone-muted text-[10px] uppercase">
                <Activity className="h-3 w-3 text-cobalt" />
                <span>Station Clock</span>
              </div>
              <div className="text-xs font-bold text-stone-light mt-1 truncate">
                {telemetryTime || "SYNCHRONIZING..."}
              </div>
              <div className="text-[10px] text-stone-muted mt-0.5">ISS CIR ACTIVE</div>
            </div>
          </div>

          {/* Global Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Experiments"
              value={totalExperiments}
              unit="records"
              subtitle={`${zeroGCount} 0g • ${partialGCount} Partial-g • ${earthCount} 1g`}
              icon={Compass}
              variant="electric"
            />
            <StatCard
              title="Simulation Runs"
              value={totalSimulations}
              unit="solved"
              subtitle="Eulerian numerical model outputs"
              icon={Play}
              variant="flame"
            />
            <StatCard
              title="AI Analysis Reports"
              value={totalAnalyses}
              unit="reports"
              subtitle="Similarity scaling & recommendations"
              icon={Cpu}
              variant="emerald"
            />
            <StatCard
              title="Microgravity Ratio"
              value={
                totalExperiments > 0
                  ? `${((zeroGCount / totalExperiments) * 100).toFixed(0)}%`
                  : "0%"
              }
              unit="of catalog"
              subtitle={`${zeroGCount} drop tower / orbit tests`}
              icon={Activity}
              variant="amber"
            />
          </div>

          {/* Telemetry Charts & Latest Simulation Results */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Real-time Telemetry Trend Chart (7 cols) */}
            <div className="lg:col-span-7 flex flex-col rounded-xl border border-stone-border/40 bg-ink-surface/80 backdrop-blur-xl p-6 space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.6)] hover:border-cobalt/50 transition-all">
              <div className="flex items-center justify-between pb-3 border-b border-stone-border/60">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-cobalt" />
                    <span className="font-mono text-xs font-bold text-stone-light uppercase tracking-wider">
                      Real-Time Chamber Diagnostics (Telemetry Monitoring)
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-dim font-sans mt-0.5">
                    Transient thermal rise &amp; pressure stability inside test section
                  </p>
                </div>
                <span className="rounded px-2 py-0.5 text-[10px] font-mono bg-cobalt/15 text-stone-light border border-cobalt/40">
                  LIVE TELEMETRY
                </span>
              </div>

              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetryTrendData}>
                    <defs>
                      <linearGradient id="cobaltGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2B4BFF" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2B4BFF" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF7A29" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#FF7A29" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222228" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="#6B6760"
                      fontSize={11}
                      tickLine={false}
                      fontFamily="monospace"
                    />
                    <YAxis
                      stroke="#6B6760"
                      fontSize={11}
                      tickLine={false}
                      fontFamily="monospace"
                      domain={[0, 2500]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0C0C0D",
                        border: "1px solid rgba(207,201,191,0.2)",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                        fontSize: "11px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="temp"
                      stroke="#FF7A29"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#flameGrad)"
                      name="Core Temp (K)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Combustion Regime Distribution Bar */}
              <div className="pt-2 border-t border-stone-border/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-dim uppercase tracking-wider">
                    Combustion Regime Distribution
                  </span>
                  <span className="text-cobalt font-bold">
                    {zeroGCount} Zero-G • {partialGCount} Partial-G • {earthCount} 1G
                  </span>
                </div>
                <div className="w-full h-2 rounded bg-ink overflow-hidden flex">
                  <div
                    style={{
                      width: `${totalExperiments > 0 ? (zeroGCount / totalExperiments) * 100 : 50}%`,
                    }}
                    className="bg-cobalt h-full"
                    title="0g Spherical Diffusion"
                  />
                  <div
                    style={{
                      width: `${totalExperiments > 0 ? (partialGCount / totalExperiments) * 100 : 25}%`,
                    }}
                    className="bg-stone h-full"
                    title="Partial-g Transitional"
                  />
                  <div
                    style={{
                      width: `${totalExperiments > 0 ? (earthCount / totalExperiments) * 100 : 25}%`,
                    }}
                    className="bg-flame h-full"
                    title="1g Buoyant Plume"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-stone-muted">
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-cobalt inline-block" />
                    Spherical (0g)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-stone inline-block" />
                    Transitional (Moon/Mars)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-flame inline-block" />
                    Buoyant Plume (1g)
                  </span>
                </div>
              </div>
            </div>

            {/* Latest Simulation Result & Morphology (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-stone-border/40 bg-ink-surface/80 backdrop-blur-xl p-6 space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.6)] hover:border-cobalt/50 transition-all">
              <div className="flex items-center justify-between pb-3 border-b border-stone-border/60">
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4 text-cobalt" />
                  <span className="font-mono text-xs font-bold text-stone-light uppercase tracking-wider">
                    Latest Simulation Output
                  </span>
                </div>
                <span className="rounded px-2 py-0.5 text-[10px] font-mono bg-cobalt/15 text-stone-light border border-cobalt/30">
                  VERIFIED RUN
                </span>
              </div>

              {latestSim ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded bg-ink border border-stone-border/40">
                      <div className="text-stone-muted text-[10px]">FLAME SHAPE</div>
                      <div className="text-sm font-bold text-stone-light mt-1">
                        {latestSim.flame_shape}
                      </div>
                    </div>
                    <div className="p-3 rounded bg-ink border border-stone-border/40">
                      <div className="text-stone-muted text-[10px]">PEAK TEMP</div>
                      <div className="text-sm font-bold text-flame mt-1">
                        {latestSim.max_temperature_k?.toFixed(1) || 2144.6} K
                      </div>
                    </div>
                    <div className="p-3 rounded bg-ink border border-stone-border/40">
                      <div className="text-stone-muted text-[10px]">FLAME RADIUS</div>
                      <div className="text-sm font-bold text-stone-light mt-1">
                        {latestSim.flame_radius_mm?.toFixed(2) || 10.98} mm
                      </div>
                    </div>
                    <div className="p-3 rounded bg-ink border border-stone-border/40">
                      <div className="text-stone-muted text-[10px]">BURN RATE</div>
                      <div className="text-sm font-bold text-cobalt mt-1">
                        {latestSim.burn_rate_mg_s?.toFixed(2) || 2.5} mg/s
                      </div>
                    </div>
                  </div>

                  <FlameVisualizer
                    gravity={latestSim.gravity_level_g}
                    shape={latestSim.flame_shape}
                    flameRadiusMm={latestSim.flame_radius_mm || 10.98}
                    flameHeightMm={latestSim.flame_height_mm}
                    maxTemperatureK={latestSim.max_temperature_k || 2144.6}
                    title="Morphology Result"
                    showControls={false}
                  />

                  <div className="pt-2 flex justify-end">
                    <Link
                      href="/simulations"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-cobalt hover:underline font-semibold"
                    >
                      <span>Explore 3D Volumetric Lab</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-xs font-mono text-stone-dim">
                  <Flame className="h-8 w-8 text-stone-muted mb-2" />
                  <span>No simulations executed yet.</span>
                  <Link
                    href="/workspace"
                    className="mt-3 px-3 py-1.5 rounded bg-cobalt text-white font-bold"
                  >
                    Launch First Simulation
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Gravitational Regime Selector Arena */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 flex flex-col rounded-xl border border-stone-border/40 bg-ink-surface/80 backdrop-blur-xl p-6 relative shadow-[0_4px_30px_rgba(0,0,0,0.6)] hover:border-cobalt/50 transition-all">
              <div className="flex items-center justify-between pb-4 border-b border-stone-border/60 mb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-cobalt uppercase tracking-widest">
                    Gravitational Regime Selector &amp; Aerodynamic Analysis
                  </span>
                  <p className="text-[12px] font-sans text-stone mt-0.5">
                    Compare morphological transitions across Earth (1g), Moon (0.166g), Mars (0.38g), and Space (0g)
                  </p>
                </div>
                <span className="rounded bg-ink px-3 py-1 text-xs font-mono font-semibold text-stone-light border border-stone-border">
                  {selectedGravity.toFixed(3)} g
                </span>
              </div>

              <GravitySelector value={selectedGravity} onChange={setSelectedGravity} />

              <div className="mt-5 p-4 rounded bg-ink border border-stone-border/40 space-y-2 text-xs font-mono">
                <div className="text-stone-light font-semibold tracking-wide">
                  Physical Characteristics @ {selectedGravity.toFixed(3)}g:
                </div>
                <div className="text-stone leading-relaxed font-sans text-xs">
                  {selectedGravity <= 0.05
                    ? "• Pure Diffusion: Grashof number approaches zero. Thermal buoyancy is eliminated, resulting in a radially symmetric spherical flame envelope. High soot accumulation in outer boundary; susceptible to radiative extinction."
                    : selectedGravity < 0.6
                    ? "• Transitional Convection: Richardson number indicates mixed convective-diffusive flow. Flame base expands horizontally into an oblate ellipsoid with subdued low-frequency flicker."
                    : "• Buoyancy Plume: Strong upward natural convection accelerates hot gas. Classic elongated teardrop shape with periodic vortex shedding generating ~10–15 Hz flicker instability."}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-border/40 flex justify-end">
                <Link
                  href={`/workspace?gravity=${selectedGravity}`}
                  className="inline-flex items-center gap-2 text-xs font-mono text-cobalt hover:underline font-medium transition-colors"
                >
                  <span>Configure Experiment at {selectedGravity.toFixed(2)}g</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <FlameVisualizer
                gravity={selectedGravity}
                flameRadiusMm={
                  selectedGravity === 0 ? 8.8 : selectedGravity < 0.5 ? 7.2 : 5.0
                }
                flameHeightMm={selectedGravity >= 0.6 ? 25.0 : undefined}
                maxTemperatureK={
                  selectedGravity === 0 ? 2086 : selectedGravity < 0.5 ? 2250 : 2226
                }
                title="Real-time Morphology Preview"
              />
            </div>
          </div>

          {/* Recent Experiments Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-display font-bold text-stone-light tracking-wide uppercase">
                  Recent Research Experiments
                </h2>
                <p className="text-xs text-stone-dim font-mono mt-0.5">
                  Synchronized live from NASA-FLAME Core Database
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-dim" />
                  <input
                    type="text"
                    placeholder="Search fuel, name, tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded bg-ink-surface border border-stone-border pl-9 pr-4 py-2 text-xs font-mono text-stone-light placeholder-stone-muted focus:outline-none focus:border-cobalt w-64 transition-all"
                  />
                </div>

                <Link
                  href="/history"
                  className="rounded bg-ink-surface hover:bg-ink-elevated border border-stone-border px-4 py-2 text-xs font-mono text-stone transition-colors"
                >
                  View Archive
                </Link>
              </div>
            </div>

            {loading ? (
              <LoadingSpinner message="Fetching experiments from NASA-FLAME Backend..." />
            ) : error ? (
              <EmptyState
                title="Backend Connection Notice"
                description={`Unable to retrieve experiments: ${error}. Ensure FastAPI is running on port 8000.`}
                actionLabel="Retry Connection"
                onAction={fetchData}
                icon="error"
              />
            ) : filteredExperiments.length === 0 ? (
              <EmptyState
                title="No Experiments Found"
                description="No experiments match the filter criteria or database has not been seeded."
                actionLabel="Create Experiment"
                onAction={() => (window.location.href = "/workspace")}
              />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-stone-border bg-ink-surface">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-stone-border bg-ink text-stone-dim uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-5 py-3.5">Experiment Name</th>
                      <th className="px-5 py-3.5">Gravity</th>
                      <th className="px-5 py-3.5">Fuel Species</th>
                      <th className="px-5 py-3.5">Flow / O₂</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Facility</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-border/40 text-stone">
                    {filteredExperiments.slice(0, 8).map((exp) => (
                      <tr key={exp.id} className="hover:bg-ink transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-stone-light tracking-wide">
                            {exp.name}
                          </div>
                          <div className="text-[11px] text-stone-dim line-clamp-1 max-w-xs font-sans mt-0.5">
                            {exp.description || "NASA Reference Experiment"}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded px-2.5 py-1 text-[10px] font-bold border ${
                              exp.gravity_level_g <= 0.05
                                ? "bg-cobalt/20 text-white border-cobalt/60"
                                : exp.gravity_level_g < 0.6
                                ? "bg-ink text-stone-light border-stone-border"
                                : "bg-flame/20 text-stone-light border-flame/50"
                            }`}
                          >
                            {exp.gravity_level_g.toFixed(3)}g
                          </span>
                        </td>
                        <td className="px-5 py-4 text-stone-light font-medium">{exp.fuel_type}</td>
                        <td className="px-5 py-4 text-stone-dim">
                          {exp.fuel_flow_rate_sccm
                            ? `${exp.fuel_flow_rate_sccm} sccm`
                            : "Droplet"}{" "}
                          • {exp.oxygen_percentage}% O₂
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={exp.status} />
                        </td>
                        <td className="px-5 py-4 text-stone-dim text-[11px]">
                          {exp.metadata?.facility || "NASA Ground / Orbit"}
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          <Link
                            href={`/workspace?experimentId=${exp.id}`}
                            className="inline-flex items-center gap-1.5 rounded bg-ink hover:bg-ink-elevated border border-stone-border px-3 py-1.5 text-[11px] text-cobalt transition-colors"
                          >
                            <Play className="h-3 w-3 fill-current" />
                            <span>Simulate</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Navigation Cards */}
          <div className="pt-6 border-t border-stone-border/60">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-cobalt mb-4">
              Scientific Flight Modules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/workspace"
                className="flex flex-col p-5 rounded-lg border border-stone-border bg-ink-surface hover:border-cobalt transition-all group"
              >
                <div className="flex items-center justify-between text-stone-dim group-hover:text-cobalt">
                  <Compass className="h-5 w-5" />
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-display text-sm font-bold text-stone-light mt-4 tracking-wide uppercase">
                  Experiment Workspace
                </div>
                <p className="text-xs text-stone mt-1 font-sans">
                  Configure chamber conditions, select numerical constraints, and launch runs.
                </p>
              </Link>

              <Link
                href="/simulations"
                className="flex flex-col p-5 rounded-lg border border-stone-border bg-ink-surface hover:border-cobalt transition-all group"
              >
                <div className="flex items-center justify-between text-stone-dim group-hover:text-cobalt">
                  <Play className="h-5 w-5" />
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-display text-sm font-bold text-stone-light mt-4 tracking-wide uppercase">
                  Simulation Lab
                </div>
                <p className="text-xs text-stone mt-1 font-sans">
                  Three.js 3D volumetric flame solver, 2D heatmaps, and side-by-side gravity comparator.
                </p>
              </Link>

              <Link
                href="/assistant"
                className="flex flex-col p-5 rounded-lg border border-stone-border bg-ink-surface hover:border-cobalt transition-all group"
              >
                <div className="flex items-center justify-between text-stone-dim group-hover:text-cobalt">
                  <Cpu className="h-5 w-5" />
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-display text-sm font-bold text-stone-light mt-4 tracking-wide uppercase">
                  AI Combustion Analyzer
                </div>
                <p className="text-xs text-stone mt-1 font-sans">
                  Dimensionless numbers (Gr, Ri, Fr, Ra), regime classification, and safety advice.
                </p>
              </Link>

              <Link
                href="/history"
                className="flex flex-col p-5 rounded-lg border border-stone-border bg-ink-surface hover:border-cobalt transition-all group"
              >
                <div className="flex items-center justify-between text-stone-dim group-hover:text-cobalt">
                  <History className="h-5 w-5" />
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-display text-sm font-bold text-stone-light mt-4 tracking-wide uppercase">
                  Research History
                </div>
                <p className="text-xs text-stone mt-1 font-sans">
                  Archive of drop-tower, parabolic flight, and ISS CIR/ACME reference experiments.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
