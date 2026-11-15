/**
 * NASA-FLAME: Scientific Data Provenance & Model Labeling Badge
 * Ensures strict compliance with Section 2:
 * "If generating a procedural flame representation, clearly identify it as a
 * visualization model rather than a real photograph or measured NASA flame."
 */

import React from "react";
import { DataOrigin } from "../../types/index";
import { FLAME_THEME } from "../../theme/colors";

export interface ProvenanceBadgeProps {
  origin: DataOrigin;
  facility?: string;
  citation?: string;
  compact?: boolean;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  origin,
  facility,
  citation,
  compact = false,
}) => {
  const getBadgeConfig = (originType: DataOrigin) => {
    switch (originType) {
      case "EXPERIMENTAL_MEASURED":
        return {
          label: "NASA EMPIRICAL DATA",
          sublabel: "Measured Physical Experiment",
          bg: "rgba(16, 185, 129, 0.15)",
          border: "rgba(16, 185, 129, 0.4)",
          textColor: "#34D399",
          dotColor: "#10B981",
        };
      case "NUMERICAL_SIMULATION":
        return {
          label: "NUMERICAL SIMULATION",
          sublabel: "Discrete CFD / Burke-Schumann Solver",
          bg: "rgba(8, 124, 255, 0.15)",
          border: "rgba(8, 124, 255, 0.4)",
          textColor: "#60A5FA",
          dotColor: "#087CFF",
        };
      case "AI_PREDICTION":
        return {
          label: "AI / ML PREDICTION",
          sublabel: "Physics-Informed Surrogate Model",
          bg: "rgba(168, 85, 247, 0.15)",
          border: "rgba(168, 85, 247, 0.4)",
          textColor: "#C084FC",
          dotColor: "#A855F7",
        };
      case "VISUALIZATION_MODEL":
      default:
        return {
          label: "VISUALIZATION MODEL",
          sublabel: "Procedural Physics-Informed 3D Model (Not Flight Photo)",
          bg: "rgba(255, 112, 41, 0.15)",
          border: "rgba(255, 112, 41, 0.4)",
          textColor: "#FB923C",
          dotColor: "#FF7029",
        };
    }
  };

  const config = getBadgeConfig(origin);

  if (compact) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "2px 8px",
          borderRadius: FLAME_THEME.borders.radiusSm,
          backgroundColor: config.bg,
          border: `1px solid ${config.border}`,
          color: config.textColor,
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.04em",
          fontFamily: FLAME_THEME.typography.fontFamilyMono,
        }}
        title={citation ? `${config.sublabel} | Citation: ${citation}` : config.sublabel}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: config.dotColor,
          }}
        />
        {config.label}
      </span>
    );
  }

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: "2px",
        padding: "6px 12px",
        borderRadius: FLAME_THEME.borders.radiusSm,
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: config.dotColor,
          }}
        />
        <span
          style={{
            color: config.textColor,
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            fontFamily: FLAME_THEME.typography.fontFamilyMono,
          }}
        >
          {config.label}
        </span>
      </div>
      <span
        style={{
          color: FLAME_THEME.colors.textMuted,
          fontSize: "11px",
          lineHeight: 1.2,
        }}
      >
        {facility ? `${facility} — ` : ""}
        {config.sublabel}
      </span>
      {citation && (
        <span
          style={{
            color: FLAME_THEME.colors.textDim,
            fontSize: "10px",
            fontStyle: "italic",
            marginTop: "2px",
          }}
        >
          Ref: {citation}
        </span>
      )}
    </div>
  );
};
