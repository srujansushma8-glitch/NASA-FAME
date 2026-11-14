/**
 * NASA-FLAME: ExperimentResultPanel
 * Comprehensive scientific dashboard panel presenting experiment configuration,
 * quantitative measurement telemetry, AI regime classifications, and NASA provenance citations.
 */

import React from "react";
import {
  ExperimentMetadata,
  SimulationResponseData,
  AIAnalysisSummary,
  DimensionlessNumbers,
} from "../../types/index.ts";
import { FLAME_THEME } from "../../theme/colors.ts";
import { ProvenanceBadge } from "../Common/ProvenanceBadge.tsx";
import { EmptyState } from "../Common/EmptyState.tsx";
import { ErrorState } from "../Common/ErrorState.tsx";

export interface ExperimentResultPanelProps {
  experiment?: ExperimentMetadata | null;
  simulation?: SimulationResponseData | null;
  analysis?: AIAnalysisSummary | null;
  dimensionlessNumbers?: DimensionlessNumbers | null;
  onExportData?: () => void;
  width?: number | string;
}

export const ExperimentResultPanel: React.FC<ExperimentResultPanelProps> = ({
  experiment,
  simulation,
  analysis,
  dimensionlessNumbers,
  onExportData,
  width = "100%",
}) => {
  if (!experiment && !simulation) {
    return <EmptyState title="No Experiment Results Loaded" message="Select a combustion experiment or run a simulation to inspect telemetry." />;
  }

  if (simulation?.status === "FAILED") {
    return (
      <ErrorState
        errorTitle="Simulation Execution Halted"
        errorMessage={simulation.error_message || "Solver reported unphysical parameter condition or numerical divergence."}
      />
    );
  }

  const gLevel = simulation?.gravity_level_g ?? experiment?.gravity_level_g ?? 0.0;
  const is0g = gLevel <= 0.05;
  const provenance = experiment?.provenance || simulation?.provenance || {
    dataOrigin: "VISUALIZATION_MODEL" as const,
    facilityOrMission: "NASA Glenn Research Center Drop Tower / ISS CIR",
    citation: "NASA TM-107386",
  };

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
        boxSizing: "border-box",
        gap: "14px",
        padding: "16px",
      }}
    >
      {/* Top Header & Provenance */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span
              style={{
                color: FLAME_THEME.colors.electricBlue,
                fontWeight: 700,
                fontSize: "14px",
                letterSpacing: "0.04em",
                fontFamily: FLAME_THEME.typography.fontFamilyMono,
              }}
            >
              {experiment?.title || `Combustion Run: ${simulation?.id || "EXP-001"}`}
            </span>
            <span
              style={{
                padding: "2px 6px",
                borderRadius: "3px",
                fontSize: "10px",
                fontFamily: "monospace",
                backgroundColor: is0g ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 112, 41, 0.2)",
                color: is0g ? "#38BDF8" : "#FF7029",
                fontWeight: 600,
              }}
            >
              {is0g ? "MICROGRAVITY (0g)" : `GRAVITY (${gLevel.toFixed(2)}g)`}
            </span>
          </div>
          <span style={{ fontSize: "12px", color: FLAME_THEME.colors.textMuted }}>
            Fuel: <strong style={{ color: FLAME_THEME.colors.textPrimary }}>{experiment?.fuel_type || "Methane"}</strong> | 
            Oxidizer: {experiment?.oxidizer || "O2/N2"} ({experiment?.oxygen_percentage || 21}% O2) | 
            Pressure: {experiment?.pressure_atm || 1.0} atm
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {onExportData && (
            <button
              onClick={onExportData}
              style={{
                padding: "5px 10px",
                backgroundColor: FLAME_THEME.colors.surfaceElevated,
                color: FLAME_THEME.colors.textSecondary,
                border: FLAME_THEME.borders.subtle,
                borderRadius: FLAME_THEME.borders.radiusSm,
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Export JSON
            </button>
          )}
          <ProvenanceBadge
            origin={provenance.dataOrigin}
            facility={provenance.facilityOrMission}
            citation={provenance.citation}
            compact={false}
          />
        </div>
      </div>

      {/* Grid: Quantitative Telemetry Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px",
        }}
      >
        {/* Peak Temperature */}
        <div
          style={{
            backgroundColor: FLAME_THEME.colors.backgroundAlt,
            padding: "10px 12px",
            borderRadius: FLAME_THEME.borders.radiusSm,
            border: FLAME_THEME.borders.subtle,
          }}
        >
          <div style={{ fontSize: "11px", color: FLAME_THEME.colors.textMuted }}>Peak Flame Temperature</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#FF7029", fontFamily: "monospace" }}>
            {simulation?.max_temperature_k ? `${simulation.max_temperature_k.toFixed(1)} K` : "—"}
          </div>
          <div style={{ fontSize: "10px", color: FLAME_THEME.colors.textDim }}>Uncertainty: ±25 K</div>
        </div>

        {/* Flame Radius */}
        <div
          style={{
            backgroundColor: FLAME_THEME.colors.backgroundAlt,
            padding: "10px 12px",
            borderRadius: FLAME_THEME.borders.radiusSm,
            border: FLAME_THEME.borders.subtle,
          }}
        >
          <div style={{ fontSize: "11px", color: FLAME_THEME.colors.textMuted }}>Flame Radius</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#38BDF8", fontFamily: "monospace" }}>
            {simulation?.flame_radius_mm ? `${simulation.flame_radius_mm.toFixed(2)} mm` : "—"}
          </div>
          <div style={{ fontSize: "10px", color: FLAME_THEME.colors.textDim }}>Uncertainty: ±0.15 mm</div>
        </div>

        {/* Burn Rate */}
        <div
          style={{
            backgroundColor: FLAME_THEME.colors.backgroundAlt,
            padding: "10px 12px",
            borderRadius: FLAME_THEME.borders.radiusSm,
            border: FLAME_THEME.borders.subtle,
          }}
        >
          <div style={{ fontSize: "11px", color: FLAME_THEME.colors.textMuted }}>Burning Rate</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#10B981", fontFamily: "monospace" }}>
            {simulation?.burn_rate_mg_s ? `${simulation.burn_rate_mg_s.toFixed(2)} mg/s` : "—"}
          </div>
          <div style={{ fontSize: "10px", color: FLAME_THEME.colors.textDim }}>Mass fuel consumption</div>
        </div>

        {/* Soot Fraction */}
        <div
          style={{
            backgroundColor: FLAME_THEME.colors.backgroundAlt,
            padding: "10px 12px",
            borderRadius: FLAME_THEME.borders.radiusSm,
            border: FLAME_THEME.borders.subtle,
          }}
        >
          <div style={{ fontSize: "11px", color: FLAME_THEME.colors.textMuted }}>Peak Soot Fraction</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#F59E0B", fontFamily: "monospace" }}>
            {simulation?.soot_volume_fraction
              ? `${(simulation.soot_volume_fraction * 1e6).toFixed(2)} ppm`
              : "—"}
          </div>
          <div style={{ fontSize: "10px", color: FLAME_THEME.colors.textDim }}>Volume fraction (ppm)</div>
        </div>
      </div>

      {/* AI Diagnostic Verdict & Regime Classification */}
      {analysis && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            backgroundColor: FLAME_THEME.colors.backgroundAlt,
            borderRadius: FLAME_THEME.borders.radiusSm,
            border: FLAME_THEME.borders.subtle,
            padding: "12px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#A855F7", fontWeight: 700, fontSize: "12px", fontFamily: "monospace" }}>
              AI COMBUSTION DIAGNOSTICS & REGIME VERDICT
            </span>
            <span style={{ fontSize: "11px", color: "#34D399", fontWeight: 600 }}>
              Confidence: {(analysis.confidence_score * 100).toFixed(0)}%
            </span>
          </div>

          <div style={{ fontSize: "13px", fontWeight: 600, color: FLAME_THEME.colors.textPrimary }}>
            Regime: <span style={{ color: FLAME_THEME.colors.electricBlue }}>{analysis.regime_classification}</span>
          </div>

          <p style={{ margin: 0, fontSize: "12px", color: FLAME_THEME.colors.textSecondary, lineHeight: 1.4 }}>
            {analysis.summary}
          </p>

          {analysis.scientific_findings && analysis.scientific_findings.length > 0 && (
            <div style={{ marginTop: "4px" }}>
              <span style={{ fontSize: "11px", color: FLAME_THEME.colors.textMuted, fontWeight: 600 }}>
                Key Physical Findings:
              </span>
              <ul style={{ margin: "4px 0 0 0", paddingLeft: "18px", fontSize: "11px", color: FLAME_THEME.colors.textSecondary }}>
                {analysis.scientific_findings.map((f, i) => (
                  <li key={i} style={{ marginBottom: "2px" }}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Dimensionless Numbers Section */}
      {dimensionlessNumbers && (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", fontSize: "11px", fontFamily: "monospace" }}>
          {dimensionlessNumbers.grashof_number !== undefined && (
            <div style={{ padding: "4px 8px", backgroundColor: FLAME_THEME.colors.surfaceElevated, borderRadius: "4px", border: FLAME_THEME.borders.subtle }}>
              Gr: <strong style={{ color: "#38BDF8" }}>{dimensionlessNumbers.grashof_number.toExponential(2)}</strong>
            </div>
          )}
          {dimensionlessNumbers.richardson_number !== undefined && (
            <div style={{ padding: "4px 8px", backgroundColor: FLAME_THEME.colors.surfaceElevated, borderRadius: "4px", border: FLAME_THEME.borders.subtle }}>
              Ri: <strong style={{ color: "#38BDF8" }}>{dimensionlessNumbers.richardson_number.toFixed(2)}</strong>
            </div>
          )}
          {dimensionlessNumbers.froude_number !== undefined && (
            <div style={{ padding: "4px 8px", backgroundColor: FLAME_THEME.colors.surfaceElevated, borderRadius: "4px", border: FLAME_THEME.borders.subtle }}>
              Fr: <strong style={{ color: "#38BDF8" }}>{dimensionlessNumbers.froude_number.toFixed(2)}</strong>
            </div>
          )}
          {dimensionlessNumbers.rayleigh_number !== undefined && (
            <div style={{ padding: "4px 8px", backgroundColor: FLAME_THEME.colors.surfaceElevated, borderRadius: "4px", border: FLAME_THEME.borders.subtle }}>
              Ra: <strong style={{ color: "#38BDF8" }}>{dimensionlessNumbers.rayleigh_number.toExponential(2)}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
