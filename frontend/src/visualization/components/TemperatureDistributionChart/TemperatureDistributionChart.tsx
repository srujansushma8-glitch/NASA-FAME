/**
 * NASA-FLAME: TemperatureDistributionChart
 * Scientific temperature distribution visualization supporting 2D spatial contour heatmaps,
 * radial thermal gradient profiles, temporal temperature trajectories, and gravity condition comparisons.
 */

import React, { useState, useRef, useEffect } from "react";
import {
  SimulationResponseData,
} from "../../types/index";
import { FLAME_THEME } from "../../theme/colors";
import { ColormapType } from "../../theme/colormaps";
import { renderContourField } from "./ContourCanvasRenderer";
import { EmptyState } from "../Common/EmptyState";
import { ErrorState } from "../Common/ErrorState";
import { calculateRadialTemperature } from "../../utils/flamePhysics";

export type TempChartTab = "contour2d" | "radial" | "temporal" | "gravity_comparison";

export interface TemperatureDistributionChartProps {
  simulationData?: SimulationResponseData | null;
  comparisonData1g?: SimulationResponseData | null; // For gravity comparison overlay
  defaultTab?: TempChartTab;
  colormap?: ColormapType;
  height?: number | string;
  width?: number | string;
  onProbeHover?: (data: { x_mm: number; y_mm: number; temp_k: number } | null) => void;
}

export const TemperatureDistributionChart: React.FC<TemperatureDistributionChartProps> = ({
  simulationData,
  comparisonData1g,
  defaultTab = "contour2d",
  colormap = "blackbody",
  height = 420,
  width = "100%",
  onProbeHover,
}) => {
  const [activeTab, setActiveTab] = useState<TempChartTab>(defaultTab);
  const [activeColormap, setActiveColormap] = useState<ColormapType>(colormap);
  const [probeData, setProbeData] = useState<{ x_mm: number; y_mm: number; temp_k: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scalarField = simulationData?.spatial_scalar_field;
  const timeSeries = simulationData?.time_series || [];
  const gLevel = simulationData?.gravity_level_g ?? 0.0;
  const peakTemp = simulationData?.max_temperature_k ?? 1750;
  const flameRadius = simulationData?.flame_radius_mm ?? 5.0;

  // Handle Canvas Rendering for 2D Spatial Contour
  useEffect(() => {
    if (activeTab !== "contour2d" || !canvasRef.current || !containerRef.current) return;

    if (!scalarField || !scalarField.grid_x || !scalarField.grid_y || !scalarField.temperature_matrix) {
      return;
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;
    canvas.width = container.clientWidth || 550;
    canvas.height = (container.clientHeight || 340) - 40;

    renderContourField({
      canvas,
      gridX: scalarField.grid_x,
      gridY: scalarField.grid_y,
      matrix: scalarField.temperature_matrix,
      minTempK: 300,
      maxTempK: Math.max(2000, Math.round(peakTemp * 1.08)),
      colormap: activeColormap,
      showColorbar: true,
    });
  }, [activeTab, scalarField, activeColormap, peakTemp]);

  // Handle Canvas Mouse Move for Temperature Probe
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!scalarField || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const plotMarginLeft = 45;
    const plotMarginBottom = 35;
    const plotMarginTop = 15;
    const plotMarginRight = 65;

    const plotW = canvasRef.current.width - plotMarginLeft - plotMarginRight;
    const plotH = canvasRef.current.height - plotMarginTop - plotMarginBottom;

    if (px < plotMarginLeft || px > plotMarginLeft + plotW || py < plotMarginTop || py > plotMarginTop + plotH) {
      setProbeData(null);
      if (onProbeHover) onProbeHover(null);
      return;
    }

    const normX = (px - plotMarginLeft) / plotW;
    const normY = 1.0 - (py - plotMarginTop) / plotH;

    const minX = scalarField.grid_x[0] || -20;
    const maxX = scalarField.grid_x[scalarField.grid_x.length - 1] || 20;
    const minY = scalarField.grid_y[0] || -20;
    const maxY = scalarField.grid_y[scalarField.grid_y.length - 1] || 20;

    const x_mm = minX + normX * (maxX - minX);
    const y_mm = minY + normY * (maxY - minY);

    const xIdx = Math.min(scalarField.grid_x.length - 1, Math.max(0, Math.round(normX * (scalarField.grid_x.length - 1))));
    const yIdx = Math.min(scalarField.grid_y.length - 1, Math.max(0, Math.round(normY * (scalarField.grid_y.length - 1))));
    const temp_k = scalarField.temperature_matrix[yIdx]?.[xIdx] ?? 300;

    const info = { x_mm: Number(x_mm.toFixed(1)), y_mm: Number(y_mm.toFixed(1)), temp_k: Number(temp_k.toFixed(1)) };
    setProbeData(info);
    if (onProbeHover) onProbeHover(info);
  };

  // Check for empty or invalid data
  if (!simulationData) {
    return <EmptyState title="No Temperature Distribution Data" height={height} />;
  }

  if (simulationData.status === "FAILED") {
    return (
      <ErrorState
        errorTitle="Simulation Execution Failed"
        errorMessage={simulationData.error_message || "Thermal solver reported numerical divergence."}
        height={height}
      />
    );
  }

  // Generate Radial Temperature Points (0 to 30 mm)
  const radialPoints = Array.from({ length: 31 }, (_, i) => {
    const r = i * 1.0;
    const t_current = calculateRadialTemperature(r, flameRadius, peakTemp);
    const t_comparison = comparisonData1g
      ? calculateRadialTemperature(r, comparisonData1g.flame_radius_mm || 4.5, comparisonData1g.max_temperature_k || 1780)
      : null;
    return { r_mm: r, t_current, t_comparison };
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: FLAME_THEME.colors.secondary,
        borderRadius: FLAME_THEME.borders.radiusMd,
        border: FLAME_THEME.borders.subtle,
        overflow: "hidden",
        width,
        height,
        boxSizing: "border-box",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          backgroundColor: FLAME_THEME.colors.cardHeader,
          borderBottom: FLAME_THEME.borders.subtle,
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              color: FLAME_THEME.colors.flameOrange,
              fontWeight: 700,
              fontSize: "13px",
              letterSpacing: "0.04em",
              fontFamily: FLAME_THEME.typography.fontFamilyMono,
            }}
          >
            TEMPERATURE ANALYSIS
          </span>
          <span style={{ color: FLAME_THEME.colors.textMuted, fontSize: "12px" }}>
            Peak: {peakTemp.toFixed(1)} K (±25 K uncertainty)
          </span>
        </div>

        {/* Tab switchers */}
        <div style={{ display: "flex", gap: "4px" }}>
          {[
            { id: "contour2d", label: "2D Contour" },
            { id: "radial", label: "Radial T(r)" },
            { id: "temporal", label: "Temporal T(t)" },
            { id: "gravity_comparison", label: "0g vs 1g Comparison" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TempChartTab)}
              style={{
                padding: "4px 8px",
                fontSize: "11px",
                fontFamily: FLAME_THEME.typography.fontFamilyMono,
                backgroundColor: activeTab === tab.id ? FLAME_THEME.colors.electricBlue : FLAME_THEME.colors.surfaceElevated,
                color: activeTab === tab.id ? "#FFFFFF" : FLAME_THEME.colors.textSecondary,
                border: FLAME_THEME.borders.subtle,
                borderRadius: FLAME_THEME.borders.radiusSm,
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div ref={containerRef} style={{ flex: 1, padding: "12px", position: "relative", overflow: "hidden" }}>
        {/* TAB 1: 2D Spatial Contour */}
        {activeTab === "contour2d" && (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", color: FLAME_THEME.colors.textMuted, fontFamily: FLAME_THEME.typography.fontFamilyMono }}>
                Spatial Temperature Field [K] | {gLevel <= 0.05 ? "0g Radial Diffusion" : "1g Buoyant Plume"}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: FLAME_THEME.colors.textDim }}>Palette:</span>
                <select
                  value={activeColormap}
                  onChange={(e) => setActiveColormap(e.target.value as any)}
                  style={{
                    padding: "2px 6px",
                    fontSize: "10px",
                    fontFamily: FLAME_THEME.typography.fontFamilyMono,
                    backgroundColor: FLAME_THEME.colors.surfaceElevated,
                    color: FLAME_THEME.colors.textPrimary,
                    border: FLAME_THEME.borders.subtle,
                    borderRadius: FLAME_THEME.borders.radiusSm,
                  }}
                >
                  <option value="blackbody">Blackbody</option>
                  <option value="inferno">Inferno</option>
                  <option value="chemiluminescence">Chemiluminescence</option>
                </select>
              </div>
            </div>

            {scalarField ? (
              <div style={{ flex: 1, position: "relative" }}>
                <canvas
                  ref={canvasRef}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseLeave={() => {
                    setProbeData(null);
                    if (onProbeHover) onProbeHover(null);
                  }}
                  style={{ width: "100%", height: "100%", cursor: "crosshair" }}
                />
                {/* Floating Temperature Probe */}
                {probeData && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      right: "80px",
                      backgroundColor: "rgba(11, 15, 25, 0.9)",
                      border: FLAME_THEME.borders.accentBlue,
                      borderRadius: FLAME_THEME.borders.radiusSm,
                      padding: "4px 8px",
                      fontSize: "11px",
                      fontFamily: FLAME_THEME.typography.fontFamilyMono,
                      color: FLAME_THEME.colors.textPrimary,
                      pointerEvents: "none",
                    }}
                  >
                    r = {probeData.x_mm} mm, z = {probeData.y_mm} mm:{" "}
                    <span style={{ color: "#F97316", fontWeight: 700 }}>{probeData.temp_k} K</span>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState title="No 2D Grid Contours" message="The solver did not produce a spatial scalar field for this experiment." />
            )}
          </div>
        )}

        {/* TAB 2: Radial Temperature Gradient */}
        {activeTab === "radial" && (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "11px", color: FLAME_THEME.colors.textMuted, marginBottom: "8px", fontFamily: FLAME_THEME.typography.fontFamilyMono }}>
              Radial Temperature Profile T(r) from Centerline (r = 0 mm) to Ambient (r = 30 mm)
            </span>
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", paddingBottom: "24px", position: "relative" }}>
              {/* SVG Radial Line Plot */}
              <svg width="100%" height="100%" viewBox="0 0 500 240" preserveAspectRatio="none">
                {/* Grid lines */}
                {[500, 1000, 1500, 2000].map((t) => {
                  const y = 220 - ((t - 300) / (2200 - 300)) * 200;
                  return (
                    <g key={t}>
                      <line x1="40" y1={y} x2="480" y2={y} stroke="#1F2937" strokeDasharray="3 3" />
                      <text x="35" y={y + 3} fill="#6B7280" fontSize="9" textAnchor="end" fontFamily="monospace">
                        {t}K
                      </text>
                    </g>
                  );
                })}

                {/* Flame reaction zone band indicator */}
                <rect
                  x={40 + ((flameRadius - 1.0) / 30) * 440}
                  y="20"
                  width={(2.0 / 30) * 440}
                  height="200"
                  fill="rgba(8, 124, 255, 0.08)"
                />
                <text
                  x={40 + (flameRadius / 30) * 440}
                  y="15"
                  fill="#087CFF"
                  fontSize="8"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  Reaction Zone (r_f ≈ {flameRadius.toFixed(1)}mm)
                </text>

                {/* Primary Temperature Profile Curve */}
                <path
                  d={radialPoints
                    .map((pt, i) => {
                      const x = 40 + (pt.r_mm / 30) * 440;
                      const y = 220 - ((pt.t_current - 300) / (2200 - 300)) * 200;
                      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#FF7029"
                  strokeWidth="2.5"
                />

                {/* Comparison Curve if available */}
                {comparisonData1g && (
                  <path
                    d={radialPoints
                      .map((pt, i) => {
                        if (pt.t_comparison === null) return "";
                        const x = 40 + (pt.r_mm / 30) * 440;
                        const y = 220 - ((pt.t_comparison - 300) / (2200 - 300)) * 200;
                        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#087CFF"
                    strokeWidth="1.8"
                    strokeDasharray="4 2"
                  />
                )}

                {/* Bottom Axis */}
                <line x1="40" y1="220" x2="480" y2="220" stroke="#374151" strokeWidth="1" />
                {[0, 5, 10, 15, 20, 25, 30].map((r) => (
                  <g key={r}>
                    <line x1={40 + (r / 30) * 440} y1="220" x2={40 + (r / 30) * 440} y2="225" stroke="#374151" />
                    <text x={40 + (r / 30) * 440} y="235" fill="#9CA3AF" fontSize="9" textAnchor="middle" fontFamily="monospace">
                      {r}mm
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        )}

        {/* TAB 3: Temporal Temperature Trajectory T(t) */}
        {activeTab === "temporal" && (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "11px", color: FLAME_THEME.colors.textMuted, marginBottom: "8px", fontFamily: FLAME_THEME.typography.fontFamilyMono }}>
              Peak Flame Temperature Evolution T_max(t) Over Time
            </span>
            {timeSeries.length > 0 ? (
              <div style={{ flex: 1, position: "relative" }}>
                <svg width="100%" height="100%" viewBox="0 0 500 240" preserveAspectRatio="none">
                  {/* Grid */}
                  {[500, 1000, 1500, 2000].map((t) => {
                    const y = 220 - ((t - 300) / (2200 - 300)) * 200;
                    return (
                      <g key={t}>
                        <line x1="45" y1={y} x2="480" y2={y} stroke="#1F2937" strokeDasharray="3 3" />
                        <text x="40" y={y + 3} fill="#6B7280" fontSize="9" textAnchor="end" fontFamily="monospace">
                          {t}K
                        </text>
                      </g>
                    );
                  })}

                  {/* Curve */}
                  <path
                    d={timeSeries
                      .map((pt, i) => {
                        const maxT = timeSeries[timeSeries.length - 1].time_s || 10;
                        const x = 45 + (pt.time_s / maxT) * 435;
                        const y = 220 - ((pt.max_temperature_k - 300) / (2200 - 300)) * 200;
                        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#FF7029"
                    strokeWidth="2.5"
                  />

                  {/* Extinction marker if quenched */}
                  {simulationData.extinction_time_s && (
                    <g>
                      {(() => {
                        const maxT = timeSeries[timeSeries.length - 1].time_s || 10;
                        const extX = 45 + (simulationData.extinction_time_s / maxT) * 435;
                        return (
                          <>
                            <line x1={extX} y1="20" x2={extX} y2="220" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" />
                            <text x={extX} y="15" fill="#EF4444" fontSize="9" textAnchor="middle" fontFamily="monospace">
                              Extinction ({simulationData.extinction_time_s.toFixed(2)}s)
                            </text>
                          </>
                        );
                      })()}
                    </g>
                  )}

                  {/* X axis */}
                  <line x1="45" y1="220" x2="480" y2="220" stroke="#374151" strokeWidth="1" />
                  <text x="260" y="236" fill="#9CA3AF" fontSize="9" textAnchor="middle" fontFamily="monospace">
                    Elapsed Simulation Time [seconds]
                  </text>
                </svg>
              </div>
            ) : (
              <EmptyState title="No Time Series Data" message="Temporal temperature records are not available." />
            )}
          </div>
        )}

        {/* TAB 4: Gravity Comparison */}
        {activeTab === "gravity_comparison" && (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", flex: 1 }}>
              {/* 0g Microgravity card */}
              <div
                style={{
                  backgroundColor: FLAME_THEME.colors.backgroundAlt,
                  border: FLAME_THEME.borders.subtle,
                  borderRadius: FLAME_THEME.borders.radiusSm,
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#38BDF8", fontWeight: 700, fontSize: "12px", fontFamily: FLAME_THEME.typography.fontFamilyMono }}>
                    MICROGRAVITY (0g)
                  </span>
                  <span style={{ fontSize: "10px", color: FLAME_THEME.colors.textMuted }}>ISS CIR / Drop Tower</span>
                </div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: FLAME_THEME.colors.textPrimary, fontFamily: FLAME_THEME.typography.fontFamilyMono }}>
                  ~1510 K - 1530 K
                </div>
                <div style={{ fontSize: "11px", color: FLAME_THEME.colors.textMuted, lineHeight: 1.4 }}>
                  • Absence of convective draft eliminates upward oxygen replenishment.
                  <br />
                  • Governed by pure molecular diffusion (Burke-Schumann regime).
                  <br />
                  • Enhanced spherical radiative cooling reduces peak reaction temperature by ~200-250 K.
                </div>
              </div>

              {/* 1g Terrestrial card */}
              <div
                style={{
                  backgroundColor: FLAME_THEME.colors.backgroundAlt,
                  border: FLAME_THEME.borders.subtle,
                  borderRadius: FLAME_THEME.borders.radiusSm,
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#FF7029", fontWeight: 700, fontSize: "12px", fontFamily: FLAME_THEME.typography.fontFamilyMono }}>
                    TERRESTRIAL GRAVITY (1g)
                  </span>
                  <span style={{ fontSize: "10px", color: FLAME_THEME.colors.textMuted }}>Normal Ground Lab</span>
                </div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: FLAME_THEME.colors.textPrimary, fontFamily: FLAME_THEME.typography.fontFamilyMono }}>
                  ~1750 K - 1780 K
                </div>
                <div style={{ fontSize: "11px", color: FLAME_THEME.colors.textMuted, lineHeight: 1.4 }}>
                  • Buoyant convective draft draws ambient oxidizer continuously into reaction front.
                  <br />
                  • Rapid gas throughput accelerates chemical kinetics.
                  <br />
                  • Buoyant plume carries incandescent soot upward into high-temperature tip.
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "rgba(8, 124, 255, 0.08)",
                border: FLAME_THEME.borders.accentBlue,
                borderRadius: FLAME_THEME.borders.radiusSm,
                padding: "8px 12px",
                fontSize: "11px",
                color: FLAME_THEME.colors.textSecondary,
                lineHeight: 1.4,
              }}
            >
              <strong style={{ color: FLAME_THEME.colors.electricBlue }}>Key Scientific Finding:</strong>{" "}
              The ~240 K temperature deficit in microgravity is driven by the expansion of the boundary layer and lack of buoyant convective heating, rendering 0g flames susceptible to radiative quenching at lower oxygen concentrations.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
