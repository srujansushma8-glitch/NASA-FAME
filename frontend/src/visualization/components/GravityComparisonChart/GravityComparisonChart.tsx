/**
 * NASA-FLAME: GravityComparisonChart
 * Quantitative comparative visualization contrasting terrestrial (1g) and microgravity (0g)
 * combustion parameters, dimensionless scaling groups, and kinetic differences.
 */

import React, { useState } from "react";
import {
  GravityComparisonData,
  MetricComparisonItem,
  DimensionlessNumbers,
} from "../../types/index";
import { FLAME_THEME } from "../../theme/colors";
import { EmptyState } from "../Common/EmptyState";
import { ProvenanceBadge } from "../Common/ProvenanceBadge";

export interface GravityComparisonChartProps {
  comparisonData?: GravityComparisonData | null;
  dimensionlessNumbers?: DimensionlessNumbers | null;
  title?: string;
  height?: number | string;
  width?: number | string;
}

export const GravityComparisonChart: React.FC<GravityComparisonChartProps> = ({
  comparisonData,
  dimensionlessNumbers,
  title = "TERRESTRIAL (1g) vs MICROGRAVITY (0g) COMPARISON",
  height = 440,
  width = "100%",
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricComparisonItem | null>(null);

  if (!comparisonData || !comparisonData.metrics || comparisonData.metrics.length === 0) {
    return <EmptyState title="No Gravity Comparison Data" height={height} />;
  }

  const metrics = comparisonData.metrics;

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
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          backgroundColor: FLAME_THEME.colors.cardHeader,
          borderBottom: FLAME_THEME.borders.subtle,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              color: FLAME_THEME.colors.electricBlue,
              fontWeight: 700,
              fontSize: "13px",
              letterSpacing: "0.04em",
              fontFamily: FLAME_THEME.typography.fontFamilyMono,
            }}
          >
            {title}
          </span>
          <span style={{ color: FLAME_THEME.colors.textMuted, fontSize: "12px" }}>
            {comparisonData.fuel_or_configuration}
          </span>
        </div>

        <ProvenanceBadge origin={comparisonData.data_origin} compact={true} />
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column", gap: "14px", overflowY: "auto" }}>
        {/* Metric Comparison Table / Bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {metrics.map((m, idx) => {
            const maxVal = Math.max(m.value_1g, m.value_microgravity, 1e-6);
            const pct1g = (m.value_1g / maxVal) * 100;
            const pct0g = (m.value_microgravity / maxVal) * 100;

            const isSelected = selectedMetric?.metric_name === m.metric_name;

            return (
              <div
                key={idx}
                onClick={() => setSelectedMetric(isSelected ? null : m)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "8px 12px",
                  backgroundColor: isSelected ? "rgba(8, 124, 255, 0.1)" : FLAME_THEME.colors.backgroundAlt,
                  border: isSelected ? FLAME_THEME.borders.accentBlue : FLAME_THEME.borders.subtle,
                  borderRadius: FLAME_THEME.borders.radiusSm,
                  cursor: "pointer",
                  transition: "background-color 0.15s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span
                    style={{
                      color: FLAME_THEME.colors.textPrimary,
                      fontSize: "12px",
                      fontWeight: 600,
                      fontFamily: FLAME_THEME.typography.fontFamily,
                    }}
                  >
                    {m.metric_name}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontFamily: FLAME_THEME.typography.fontFamilyMono,
                        color: m.percentage_change < 0 ? "#38BDF8" : "#FF7029",
                        fontWeight: 700,
                      }}
                    >
                      {m.percentage_change > 0 ? `+${m.percentage_change.toFixed(1)}%` : `${m.percentage_change.toFixed(1)}%`}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "1px 5px",
                        borderRadius: "2px",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        color: FLAME_THEME.colors.textMuted,
                      }}
                    >
                      {m.direction}
                    </span>
                  </div>
                </div>

                {/* Double Bar Comparison */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", alignItems: "center" }}>
                  {/* 1g Bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "32px", fontSize: "10px", color: "#FF7029", fontFamily: "monospace" }}>1g:</span>
                    <div style={{ flex: 1, height: "6px", backgroundColor: "#1F2937", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${pct1g}%`, height: "100%", backgroundColor: "#FF7029" }} />
                    </div>
                    <span style={{ minWidth: "55px", fontSize: "10px", color: FLAME_THEME.colors.textSecondary, fontFamily: "monospace", textAlign: "right" }}>
                      {m.value_1g.toFixed(1)} {m.unit}
                    </span>
                  </div>

                  {/* 0g Bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "32px", fontSize: "10px", color: "#38BDF8", fontFamily: "monospace" }}>0g:</span>
                    <div style={{ flex: 1, height: "6px", backgroundColor: "#1F2937", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${pct0g}%`, height: "100%", backgroundColor: "#38BDF8" }} />
                    </div>
                    <span style={{ minWidth: "55px", fontSize: "10px", color: FLAME_THEME.colors.textSecondary, fontFamily: "monospace", textAlign: "right" }}>
                      {m.value_microgravity.toFixed(1)} {m.unit}
                    </span>
                  </div>
                </div>

                {/* Expandable Physical Mechanism explanation */}
                {isSelected && (
                  <div
                    style={{
                      marginTop: "8px",
                      paddingTop: "6px",
                      borderTop: "1px dashed #1F2937",
                      fontSize: "11px",
                      color: FLAME_THEME.colors.textSecondary,
                      lineHeight: 1.4,
                    }}
                  >
                    <strong style={{ color: FLAME_THEME.colors.electricBlue }}>Physical Mechanism:</strong>{" "}
                    {m.physical_driver}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Dimensionless Fluid Dynamic Scaling Groups */}
        {dimensionlessNumbers && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "8px",
              paddingTop: "8px",
              borderTop: FLAME_THEME.borders.subtle,
            }}
          >
            {dimensionlessNumbers.grashof_number !== undefined && (
              <div
                style={{
                  padding: "8px",
                  backgroundColor: FLAME_THEME.colors.backgroundAlt,
                  borderRadius: FLAME_THEME.borders.radiusSm,
                  border: FLAME_THEME.borders.subtle,
                }}
              >
                <div style={{ fontSize: "10px", color: FLAME_THEME.colors.textMuted }}>Grashof (Gr)</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: FLAME_THEME.colors.textPrimary, fontFamily: "monospace" }}>
                  {dimensionlessNumbers.grashof_number.toExponential(2)}
                </div>
                <div style={{ fontSize: "9px", color: FLAME_THEME.colors.textDim }}>Buoyancy / Viscous</div>
              </div>
            )}
            {dimensionlessNumbers.richardson_number !== undefined && (
              <div
                style={{
                  padding: "8px",
                  backgroundColor: FLAME_THEME.colors.backgroundAlt,
                  borderRadius: FLAME_THEME.borders.radiusSm,
                  border: FLAME_THEME.borders.subtle,
                }}
              >
                <div style={{ fontSize: "10px", color: FLAME_THEME.colors.textMuted }}>Richardson (Ri)</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: FLAME_THEME.colors.textPrimary, fontFamily: "monospace" }}>
                  {dimensionlessNumbers.richardson_number.toFixed(2)}
                </div>
                <div style={{ fontSize: "9px", color: FLAME_THEME.colors.textDim }}>Natural / Forced</div>
              </div>
            )}
            {dimensionlessNumbers.froude_number !== undefined && (
              <div
                style={{
                  padding: "8px",
                  backgroundColor: FLAME_THEME.colors.backgroundAlt,
                  borderRadius: FLAME_THEME.borders.radiusSm,
                  border: FLAME_THEME.borders.subtle,
                }}
              >
                <div style={{ fontSize: "10px", color: FLAME_THEME.colors.textMuted }}>Froude (Fr)</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: FLAME_THEME.colors.textPrimary, fontFamily: "monospace" }}>
                  {dimensionlessNumbers.froude_number.toFixed(2)}
                </div>
                <div style={{ fontSize: "9px", color: FLAME_THEME.colors.textDim }}>Inertia / Gravity</div>
              </div>
            )}
            {dimensionlessNumbers.rayleigh_number !== undefined && (
              <div
                style={{
                  padding: "8px",
                  backgroundColor: FLAME_THEME.colors.backgroundAlt,
                  borderRadius: FLAME_THEME.borders.radiusSm,
                  border: FLAME_THEME.borders.subtle,
                }}
              >
                <div style={{ fontSize: "10px", color: FLAME_THEME.colors.textMuted }}>Rayleigh (Ra)</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: FLAME_THEME.colors.textPrimary, fontFamily: "monospace" }}>
                  {dimensionlessNumbers.rayleigh_number.toExponential(2)}
                </div>
                <div style={{ fontSize: "9px", color: FLAME_THEME.colors.textDim }}>Thermal Buoyancy</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
