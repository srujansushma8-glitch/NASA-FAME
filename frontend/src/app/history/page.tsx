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
      <div className="min-h-screen bg-[#030508] relative overflow-hidden text-slate-200 py-10 px-4 sm:px-6 lg:px-8">
        {/* Subtle Cosmic Ambient Glow */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[500px] bg-gradient-to-b from-electric-500/10 via-electric-900/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="mx-auto max-w-7xl space-y-8 relative">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-electric-950/80 border border-electric-500/40 text-cyan-300 font-mono text-[10px] tracking-widest uppercase">
                  <Archive className="h-3 w-3 text-cyan-400" />
                  Mission Archive Registry
                </span>
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-mono text-slate-300 border border-white/10">
                  {experiments.length} Total Telemetry Records
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white mt-2 tracking-tight uppercase">
                Experiment History &amp; Matrix Comparison
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-sans">
                Browse historical flight and ground combustion archives, inspect physical boundary conditions, and cross-compare multi-gravity datasets.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {selectedForCompare.length >= 2 && (
                <button
                  onClick={() => setShowCompareModal(true)}
                  className="flex items-center gap-2 rounded-xl bg-electric-500 hover:bg-electric-400 px-4 py-2.5 text-xs font-mono font-semibold text-white shadow-lg shadow-electric-500/25 transition-all"
                >
                  <GitCompare className="h-4 w-4" />
                  <span>Compare Matrix ({selectedForCompare.length})</span>
                </button>
              )}

              <button
                onClick={fetchHistory}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 text-xs font-mono font-medium text-slate-200 transition-all hover:border-white/20"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
                <span>Refresh Logs</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/[0.02] backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex-1 w-full md:w-auto relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by experiment title, fuel species, facility..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Fuel filter */}
              <select
                value={fuelFilter}
                onChange={(e) => setFuelFilter(e.target.value)}
                className="rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 transition-all"
              >
                <option value="" className="bg-[#0b101b] text-white">All Fuel Species</option>
                <option value="Methane" className="bg-[#0b101b] text-white">Methane (CH₄)</option>
                <option value="Propane" className="bg-[#0b101b] text-white">Propane (C₃H₈)</option>
                <option value="Heptane" className="bg-[#0b101b] text-white">Heptane (C₇H₁₆)</option>
                <option value="Hydrogen" className="bg-[#0b101b] text-white">Hydrogen (H₂)</option>
              </select>

              {/* Gravity filter */}
              <select
                value={gravityFilter}
                onChange={(e) => setGravityFilter(e.target.value)}
                className="rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 transition-all"
              >
                <option value="" className="bg-[#0b101b] text-white">All Gravity Regimes</option>
                <option value="zero_g" className="bg-[#0b101b] text-white">0g Microgravity (ISS / Drop Tower)</option>
                <option value="partial_g" className="bg-[#0b101b] text-white">Partial Gravity (Lunar / Mars)</option>
                <option value="earth" className="bg-[#0b101b] text-white">1.0g Earth Terrestrial</option>
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
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-white/10 bg-white/5 text-slate-400 uppercase tracking-wider text-[11px]">
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
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {filteredList.map((exp) => {
                    const isChecked = selectedForCompare.includes(exp.id);
                    return (
                      <tr
                        key={exp.id}
                        className={`hover:bg-white/[0.03] transition-colors ${
                          isChecked ? "bg-electric-950/20" : ""
                        }`}
                      >
                        <td className="px-5 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectForCompare(exp.id)}
                            className="rounded accent-cyan-400 h-4 w-4 bg-slate-800 border-white/20"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedExpDetail(exp)}
                            className="font-semibold text-white hover:text-cyan-300 text-left transition-colors tracking-wide"
                          >
                            {exp.name}
                          </button>
                          <div className="text-[11px] text-slate-400 line-clamp-1 max-w-sm font-sans mt-0.5">
                            {exp.description || exp.metadata?.facility || "NASA Combustion Test"}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded px-2.5 py-1 text-[10px] font-bold border ${
                              exp.gravity_level_g <= 0.05
                                ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/40"
                                : exp.gravity_level_g < 0.6
                                ? "bg-amber-950/60 text-amber-300 border-amber-500/40"
                                : "bg-flame-950/60 text-flame-300 border-flame-500/40"
                            }`}
                          >
                            {exp.gravity_level_g.toFixed(3)}g
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-white font-medium">{exp.fuel_type}</span>
                          <div className="text-[11px] text-slate-400">
                            {exp.fuel_flow_rate_sccm ? `${exp.fuel_flow_rate_sccm} sccm` : "Droplet"}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-300">
                          <div>
                            {exp.pressure_atm} atm • {exp.oxygen_percentage}% O₂
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {exp.ambient_temperature_k} K • Ø{" "}
                            {exp.burner_diameter_mm || exp.initial_droplet_diameter_mm || 6.35}mm
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-300">
                          <div className="flex items-center gap-2">
                            <span className="text-flame-400 font-semibold">{exp.simulations_count || 0} sim</span>
                            <span>•</span>
                            <span className="text-cyan-400 font-semibold">{exp.analyses_count || 0} AI</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={exp.status} />
                        </td>
                        <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedExpDetail(exp)}
                            title="View Details"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/workspace?experimentId=${exp.id}`}
                            title="Run in Workspace"
                            className="inline-flex p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            <Play className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteExperiment(exp.id, exp.name)}
                            title="Delete Experiment"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition-colors"
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
              <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#060910] p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="font-display text-base font-bold text-white uppercase tracking-wide">
                      {selectedExpDetail.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      ID: {selectedExpDetail.id} • Created: {new Date(selectedExpDetail.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedExpDetail(null)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider">Gravity Level</span>
                    <div className="text-cyan-400 font-bold text-sm mt-1">
                      {selectedExpDetail.gravity_level_g.toFixed(3)} g
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider">Fuel Species</span>
                    <div className="text-white font-bold text-sm mt-1">
                      {selectedExpDetail.fuel_type}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider">Chamber Pressure</span>
                    <div className="text-white font-bold text-sm mt-1">
                      {selectedExpDetail.pressure_atm} atm
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider">Oxygen Vol %</span>
                    <div className="text-white font-bold text-sm mt-1">
                      {selectedExpDetail.oxygen_percentage}%
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider">Flow Rate</span>
                    <div className="text-white font-bold text-sm mt-1">
                      {selectedExpDetail.fuel_flow_rate_sccm
                        ? `${selectedExpDetail.fuel_flow_rate_sccm} sccm`
                        : "Droplet Mode"}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider">Ambient Temp</span>
                    <div className="text-white font-bold text-sm mt-1">
                      {selectedExpDetail.ambient_temperature_k} K
                    </div>
                  </div>
                </div>

                {selectedExpDetail.metadata && (
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono space-y-1.5">
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider">Facility &amp; Investigator</div>
                    <div className="text-slate-200">
                      {selectedExpDetail.metadata.facility || "NASA Spaceflight / Ground"} •{" "}
                      {selectedExpDetail.metadata.investigator || "Principal Investigator"}
                    </div>
                    {selectedExpDetail.metadata.notes && (
                      <div className="text-slate-400 text-[11px] pt-1 font-sans">
                        Notes: {selectedExpDetail.metadata.notes}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <Link
                    href={`/workspace?experimentId=${selectedExpDetail.id}`}
                    className="rounded-xl bg-electric-500 hover:bg-electric-400 px-5 py-2.5 text-xs font-mono font-semibold text-white transition-all shadow-lg shadow-electric-500/25"
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
              <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-[#060910] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <GitCompare className="h-5 w-5 text-cyan-400" />
                    <h3 className="font-display text-base font-bold text-white uppercase tracking-wide">
                      Parameter Matrix Comparison ({compareList.length} Experiments)
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowCompareModal(false)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Comparison Matrix Table */}
                <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-white/5 border-b border-white/10 text-slate-400">
                      <tr>
                        <th className="px-5 py-3.5 w-48 uppercase tracking-wider text-[11px]">Parameter</th>
                        {compareList.map((exp) => (
                          <th key={exp.id} className="px-5 py-3.5 text-white font-bold tracking-wide">
                            {exp.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      <tr>
                        <td className="px-5 py-3 font-semibold text-slate-400">Gravity Level (g)</td>
                        {compareList.map((e) => (
                          <td key={e.id} className="px-5 py-3 font-bold text-cyan-400">
                            {e.gravity_level_g.toFixed(3)} g
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-semibold text-slate-400">Fuel Chemical Species</td>
                        {compareList.map((e) => (
                          <td key={e.id} className="px-5 py-3 text-white font-medium">
                            {e.fuel_type}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-semibold text-slate-400">Fuel Flow Rate</td>
                        {compareList.map((e) => (
                          <td key={e.id} className="px-5 py-3">
                            {e.fuel_flow_rate_sccm ? `${e.fuel_flow_rate_sccm} sccm` : "Droplet Mode"}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-semibold text-slate-400">Oxygen Percentage</td>
                        {compareList.map((e) => (
                          <td key={e.id} className="px-5 py-3">
                            {e.oxygen_percentage}% O₂
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-semibold text-slate-400">Chamber Pressure</td>
                        {compareList.map((e) => (
                          <td key={e.id} className="px-5 py-3">
                            {e.pressure_atm} atm
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-semibold text-slate-400">Ambient Temperature</td>
                        {compareList.map((e) => (
                          <td key={e.id} className="px-5 py-3">
                            {e.ambient_temperature_k} K
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-semibold text-slate-400">Burner Diameter</td>
                        {compareList.map((e) => (
                          <td key={e.id} className="px-5 py-3">
                            {e.burner_diameter_mm || e.initial_droplet_diameter_mm || 6.35} mm
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-semibold text-slate-400">Facility</td>
                        {compareList.map((e) => (
                          <td key={e.id} className="px-5 py-3 text-slate-400">
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
                    className="rounded-xl bg-white/5 hover:bg-white/10 px-5 py-2.5 text-xs font-mono text-white transition-all border border-white/10"
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
