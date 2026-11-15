"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Play,
  Cpu,
  Trash2,
  GitCompare,
  Eye,
  CheckCircle2,
  Layers,
  ChevronRight,
  X,
  Radio,
  Archive,
} from "lucide-react";
import { api } from "@/lib/api";
import { Experiment } from "@/types";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState, LoadingSpinner } from "@/components/ui/EmptyState";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function HistoryPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [fuelFilter, setFuelFilter] = useState<string>("");
  const [gravityFilter, setGravityFilter] = useState<string>("");

  // Comparison Matrix Selection
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  // Detail Modal
  const [selectedExpDetail, setSelectedExpDetail] = useState<Experiment | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listExperiments({
        page: 1,
        page_size: 100,
        fuel_type: fuelFilter || undefined,
        search: searchQuery || undefined,
      });
      setExperiments(res.items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load experiment history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [fuelFilter]);

  // Handle Delete
  const handleDeleteExperiment = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" and all associated simulations?`)) {
      return;
    }
    try {
      await api.deleteExperiment(id);
      setExperiments((prev) => prev.filter((e) => e.id !== id));
      setSelectedForCompare((prev) => prev.filter((i) => i !== id));
    } catch (err) {
      alert("Failed to delete experiment");
    }
  };

  // Toggle selection for comparison
  const toggleSelectForCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((i) => i !== id));
    } else {
      if (selectedForCompare.length >= 4) {
        alert("You can compare up to 4 experiments at once.");
        return;
      }
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  // Filter experiments locally by gravity if selected
  const filteredList = experiments.filter((exp) => {
    if (gravityFilter === "zero_g" && exp.gravity_level_g > 0.05) return false;
    if (
      gravityFilter === "partial_g" &&
      (exp.gravity_level_g <= 0.05 || exp.gravity_level_g >= 0.6)
    )
      return false;
    if (gravityFilter === "earth" && exp.gravity_level_g < 0.6) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = exp.name.toLowerCase().includes(q);
      const matchFuel = exp.fuel_type.toLowerCase().includes(q);
      const matchFacility = exp.metadata?.facility?.toLowerCase().includes(q);
      if (!matchName && !matchFuel && !matchFacility) return false;
    }

    return true;
  });

  const compareList = experiments.filter((e) => selectedForCompare.includes(e.id));

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-ink text-stone py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8 relative">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-border/60">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cobalt/15 border border-cobalt/40 text-stone-light font-mono text-[10px] tracking-widest uppercase">
                  <Archive className="h-3 w-3 text-cobalt" />
                  Mission Archive Registry
                </span>
                <span className="rounded bg-ink-surface px-2.5 py-1 text-[10px] font-mono text-stone-dim border border-stone-border/40">
                  {experiments.length} Total Telemetry Records
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-stone-light mt-3 tracking-tight uppercase">
                Experiment History &amp; Matrix Comparison
              </h1>
              <p className="text-xs sm:text-sm text-stone mt-1 max-w-2xl font-sans">
                Browse historical flight and ground combustion archives, inspect physical boundary conditions, and cross-compare multi-gravity datasets.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {selectedForCompare.length >= 2 && (
                <button
                  onClick={() => setShowCompareModal(true)}
                  className="flex items-center gap-2 rounded bg-cobalt hover:bg-cobalt-hover px-4 py-2 text-xs font-mono font-semibold text-white shadow-[0_0_20px_rgba(43,75,255,0.35)] transition-all"
                >
                  <GitCompare className="h-4 w-4" />
                  <span>Compare Matrix ({selectedForCompare.length})</span>
                </button>
              )}

              <button
                onClick={fetchHistory}
                disabled={loading}
                className="flex items-center gap-2 rounded bg-ink-surface hover:bg-ink-elevated border border-stone-border px-4 py-2 text-xs font-mono font-medium text-stone transition-all"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-cobalt" : ""}`} />
                <span>Refresh Logs</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-ink-surface p-5 rounded-lg border border-stone-border">
            <div className="flex-1 w-full md:w-auto relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-dim" />
              <input
                type="text"
                placeholder="Search by experiment title, fuel species, facility..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded bg-ink border border-stone-border pl-10 pr-4 py-2 text-xs font-mono text-stone-light placeholder-stone-muted focus:outline-none focus:border-cobalt transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Fuel filter */}
              <select
                value={fuelFilter}
                onChange={(e) => setFuelFilter(e.target.value)}
                className="rounded bg-ink border border-stone-border px-3.5 py-2 text-xs font-mono text-stone-light focus:outline-none focus:border-cobalt transition-all"
              >
                <option value="" className="bg-ink text-white">All Fuel Species</option>
                <option value="Methane" className="bg-ink text-white">Methane (CH₄)</option>
                <option value="Propane" className="bg-ink text-white">Propane (C₃H₈)</option>
                <option value="Heptane" className="bg-ink text-white">Heptane (C₇H₁₆)</option>
                <option value="Hydrogen" className="bg-ink text-white">Hydrogen (H₂)</option>
              </select>

              {/* Gravity filter */}
              <select
                value={gravityFilter}
                onChange={(e) => setGravityFilter(e.target.value)}
                className="rounded bg-ink border border-stone-border px-3.5 py-2 text-xs font-mono text-stone-light focus:outline-none focus:border-cobalt transition-all"
              >
                <option value="" className="bg-ink text-white">All Gravity Regimes</option>
                <option value="zero_g" className="bg-ink text-white">0g Microgravity (ISS / Drop Tower)</option>
                <option value="partial_g" className="bg-ink text-white">Partial Gravity (Lunar / Mars)</option>
                <option value="earth" className="bg-ink text-white">1.0g Earth Terrestrial</option>
              </select>
            </div>
          </div>

          {/* History Table */}
          {loading ? (
            <LoadingSpinner message="Querying experiment database..." />
          ) : error ? (
            <EmptyState
              title="Database Connection Error"
              description={error}
              actionLabel="Retry"
              onAction={fetchHistory}
              icon="error"
            />
          ) : filteredList.length === 0 ? (
            <EmptyState
              title="No Matching Experiments"
              description="No experiment records match your active search or gravity filters."
              actionLabel="Reset Filters"
              onAction={() => {
                setSearchQuery("");
                setFuelFilter("");
                setGravityFilter("");
              }}
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-stone-border bg-ink-surface">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-stone-border bg-ink text-stone-dim uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5 w-12 text-center">Select</th>
                    <th className="px-5 py-3.5">Experiment Title</th>
                    <th className="px-5 py-3.5">Gravity Field</th>
                    <th className="px-5 py-3.5">Fuel / Flow</th>
                    <th className="px-5 py-3.5">Chamber Conditions</th>
                    <th className="px-5 py-3.5">Runs / AI</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-border/40 text-stone">
                  {filteredList.map((exp) => {
                    const isChecked = selectedForCompare.includes(exp.id);
                    return (
                      <tr
                        key={exp.id}
                        className={`hover:bg-ink transition-colors ${
                          isChecked ? "bg-cobalt/10" : ""
                        }`}
                      >
                        <td className="px-5 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectForCompare(exp.id)}
                            className="rounded accent-[#2B4BFF] h-4 w-4 bg-ink border-stone-border"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedExpDetail(exp)}
                            className="font-semibold text-stone-light hover:text-cobalt text-left transition-colors tracking-wide"
                          >
                            {exp.name}
                          </button>
                          <div className="text-[11px] text-stone-dim line-clamp-1 max-w-sm font-sans mt-0.5">
                            {exp.description || exp.metadata?.facility || "NASA Combustion Test"}
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
                        <td className="px-5 py-4">
                          <span className="text-stone-light font-medium">{exp.fuel_type}</span>
                          <div className="text-[11px] text-stone-dim">
                            {exp.fuel_flow_rate_sccm ? `${exp.fuel_flow_rate_sccm} sccm` : "Droplet"}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-stone">
                          <div>
                            {exp.pressure_atm} atm • {exp.oxygen_percentage}% O₂
                          </div>
                          <div className="text-[11px] text-stone-dim">
                            {exp.ambient_temperature_k} K • Ø{" "}
                            {exp.burner_diameter_mm || exp.initial_droplet_diameter_mm || 6.35}mm
                          </div>
                        </td>
                        <td className="px-5 py-4 text-stone">
                          <div className="flex items-center gap-2">
                            <span className="text-flame font-semibold">{exp.simulations_count || 0} sim</span>
                            <span>•</span>
                            <span className="text-cobalt font-semibold">{exp.analyses_count || 0} AI</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={exp.status} />
                        </td>
                        <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedExpDetail(exp)}
                            title="View Details"
                            className="p-1.5 rounded bg-ink hover:bg-ink-elevated text-stone-dim hover:text-white transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/workspace?experimentId=${exp.id}`}
                            title="Run in Workspace"
                            className="inline-flex p-1.5 rounded bg-ink hover:bg-ink-elevated text-cobalt transition-colors"
                          >
                            <Play className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteExperiment(exp.id, exp.name)}
                            title="Delete Experiment"
                            className="p-1.5 rounded bg-ink hover:bg-flame/20 text-stone-muted hover:text-flame transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Experiment Detail Modal */}
          {selectedExpDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
              <div className="w-full max-w-2xl rounded-lg border border-stone-border bg-ink-surface p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-border/60">
                  <div>
                    <h3 className="font-display text-base font-bold text-stone-light uppercase tracking-wide">
                      {selectedExpDetail.name}
                    </h3>
                    <p className="text-xs text-stone-dim font-mono mt-0.5">
                      ID: {selectedExpDetail.id} • Created: {new Date(selectedExpDetail.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedExpDetail(null)}
                    className="rounded p-1.5 text-stone-dim hover:bg-ink hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3.5 rounded bg-ink border border-stone-border/40">
                    <span className="text-stone-dim text-[10px] uppercase tracking-wider">Gravity Level</span>
                    <div className="text-cobalt font-bold text-sm mt-1">
                      {selectedExpDetail.gravity_level_g.toFixed(3)} g
                    </div>
                  </div>
                  <div className="p-3.5 rounded bg-ink border border-stone-border/40">
                    <span className="text-stone-dim text-[10px] uppercase tracking-wider">Fuel Species</span>
                    <div className="text-stone-light font-bold text-sm mt-1">
                      {selectedExpDetail.fuel_type}
                    </div>
                  </div>
                  <div className="p-3.5 rounded bg-ink border border-stone-border/40">
                    <span className="text-stone-dim text-[10px] uppercase tracking-wider">Chamber Pressure</span>
                    <div className="text-stone-light font-bold text-sm mt-1">
                      {selectedExpDetail.pressure_atm} atm
                    </div>
                  </div>
                  <div className="p-3.5 rounded bg-ink border border-stone-border/40">
                    <span className="text-stone-dim text-[10px] uppercase tracking-wider">Oxygen Vol %</span>
                    <div className="text-stone-light font-bold text-sm mt-1">
                      {selectedExpDetail.oxygen_percentage}%
                    </div>
                  </div>
                  <div className="p-3.5 rounded bg-ink border border-stone-border/40">
                    <span className="text-stone-dim text-[10px] uppercase tracking-wider">Flow Rate</span>
                    <div className="text-stone-light font-bold text-sm mt-1">
                      {selectedExpDetail.fuel_flow_rate_sccm
                        ? `${selectedExpDetail.fuel_flow_rate_sccm} sccm`
                        : "Droplet Mode"}
                    </div>
                  </div>
                  <div className="p-3.5 rounded bg-ink border border-stone-border/40">
                    <span className="text-stone-dim text-[10px] uppercase tracking-wider">Ambient Temp</span>
                    <div className="text-stone-light font-bold text-sm mt-1">
                      {selectedExpDetail.ambient_temperature_k} K
                    </div>
                  </div>
                </div>

                {selectedExpDetail.metadata && (
                  <div className="p-4 rounded bg-ink border border-stone-border/40 text-xs font-mono space-y-1.5">
                    <div className="text-stone-dim text-[10px] uppercase tracking-wider">Facility &amp; Investigator</div>
                    <div className="text-stone">
                      {selectedExpDetail.metadata.facility || "NASA Spaceflight / Ground"} •{" "}
                      {selectedExpDetail.metadata.investigator || "Principal Investigator"}
                    </div>
                    {selectedExpDetail.metadata.notes && (
                      <div className="text-stone-dim text-[11px] pt-1 font-sans">
                        Notes: {selectedExpDetail.metadata.notes}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-border/60">
                  <Link
                    href={`/workspace?experimentId=${selectedExpDetail.id}`}
                    className="rounded bg-cobalt hover:bg-cobalt-hover px-5 py-2 text-xs font-mono font-semibold text-white transition-all shadow-[0_0_20px_rgba(43,75,255,0.35)]"
                  >
                    Configure / Run Simulation
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Multi-Experiment Parameter Comparison Matrix Modal */}
          {showCompareModal && compareList.length >= 2 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
              <div className="w-full max-w-5xl rounded-lg border border-stone-border bg-ink-surface p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-stone-border/60">
                  <div className="flex items-center gap-3">
                    <GitCompare className="h-5 w-5 text-cobalt" />
                    <h3 className="font-display text-base font-bold text-stone-light uppercase tracking-wide">
                      Parameter Matrix Comparison ({compareList.length} Experiments)
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowCompareModal(false)}
                    className="rounded p-1.5 text-stone-dim hover:bg-ink hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Comparison Matrix Table */}
                <div className="overflow-x-auto rounded border border-stone-border/60 bg-ink">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-ink-surface border-b border-stone-border text-stone-dim">
                      <tr>
                        <th className="px-5 py-3.5 w-48 uppercase tracking-wider text-[11px]">Parameter</th>
                        {compareList.map((exp) => (
                          <th key={exp.id} className="px-5 py-3.5 text-stone-light font-bold tracking-wide">
                            {exp.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-border/40 text-stone">
                      <tr>
                        <td className="px-5 py-3 font-semibold text-stone-dim">Gravity Level (g)</td>
                        {compareList.map((e) => (
                          <td key={e.id} className="px-5 py-3 font-bold text-cobalt">
                            {e.gravity_level_g.toFixed(3)} g
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-semibold text-stone-dim">Fuel Chemical Species</td>
                        {compareList.map((e) => (
                          <td key={e.id} className="px-5 py-3 text-stone-light font-medium">
                            {e.fuel_type}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-semibold text-stone-dim">Fuel Flow Rate</td>
                        {compareList.map((e) => (
                          <td key={e.id} className="px-5 py-3">
                            {e.fuel_flow_rate_sccm ? `${e.fuel_flow_rate_sccm} sccm` : "Droplet Mode"}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-semibold text-stone-dim">Oxygen Percentage</td>
                        {compareList.map((e) => (
                          <td key={e.id} className="px-5 py-3">
                            {e.oxygen_percentage}% O₂
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-semibold text-stone-dim">Chamber Pressure</td>
                        {compareList.map((e) => (
                          <td key={e.id} className="px-5 py-3">
                            {e.pressure_atm} atm
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-semibold text-stone-dim">Ambient Temperature</td>
                        {compareList.map((e) => (
                          <td key={e.id} className="px-5 py-3">
                            {e.ambient_temperature_k} K
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-semibold text-stone-dim">Burner Diameter</td>
                        {compareList.map((e) => (
                          <td key={e.id} className="px-5 py-3">
                            {e.burner_diameter_mm || e.initial_droplet_diameter_mm || 6.35} mm
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-semibold text-stone-dim">Facility</td>
                        {compareList.map((e) => (
                          <td key={e.id} className="px-5 py-3 text-stone-dim">
                            {e.metadata?.facility || "NASA Ground / Orbit"}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowCompareModal(false)}
                    className="rounded bg-ink hover:bg-ink-elevated px-5 py-2 text-xs font-mono text-stone transition-all border border-stone-border"
                  >
                    Close Matrix
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
