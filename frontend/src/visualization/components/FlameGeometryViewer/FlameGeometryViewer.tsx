/**
 * NASA-FLAME: FlameGeometryViewer
 * Visualizes 2D orthographic cross-sections of flame geometry, comparing normal gravity (1g)
 * elongated teardrops against microgravity (0g) diffusion spheres.
 * Displays calculated geometric dimensions: flame height, flame width, aspect ratio,
 * standoff ratio, and soot formation zones.
 */

import React, { useState } from "react";
import {
  SimulationResponseData,
} from "../../types/index";
import { FLAME_THEME } from "../../theme/colors";
import { EmptyState } from "../Common/EmptyState";

export interface FlameGeometryViewerProps {
  simulationData?: SimulationResponseData | null;
  comparisonData1g?: SimulationResponseData | null;
  burnerDiameterMm?: number;
  height?: number | string;
  width?: number | string;
  showSootZone?: boolean;
}

export const FlameGeometryViewer: React.FC<FlameGeometryViewerProps> = ({
  simulationData,
  comparisonData1g,
  burnerDiameterMm = 4.0,
  height = 420,
  width = "100%",
  showSootZone = true,
}) => {
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [sootOverlay, setSootOverlay] = useState<boolean>(showSootZone);

  if (!simulationData) {
    return <EmptyState title="No Flame Geometry Data" height={height} />;
  }

  const gLevel = simulationData.gravity_level_g;
  const is0g = gLevel <= 0.05;

  const currentRadius = simulationData.flame_radius_mm || (is0g ? 6.8 : 4.6);
  const currentHeight = simulationData.flame_height_mm || (is0g ? currentRadius * 2 : currentRadius * 3.4);
  const currentWidth = currentRadius * 2;
  const currentAspect = Number((currentHeight / Math.max(0.1, currentWidth)).toFixed(2));
  const currentSymmetry = is0g ? 1.02 : Number((currentAspect * 0.9).toFixed(2));
  const standoffRatio = Number((currentRadius / Math.max(0.1, burnerDiameterMm / 2)).toFixed(2));

  // 1g Reference numbers
  const refRadius = comparisonData1g?.flame_radius_mm || 4.6;
  const refHeight = comparisonData1g?.flame_height_mm || 16.5;
  const refWidth = refRadius * 2;
  const refAspect = Number((refHeight / Math.max(0.1, refWidth)).toFixed(2));

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
            FLAME GEOMETRY & MORPHOLOGY
          </span>
          <span style={{ color: FLAME_THEME.colors.textMuted, fontSize: "12px" }}>
            Aspect Ratio: {currentAspect} | L/W
          </span>
        </div>

        {/* Toggles */}
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            style={{
              padding: "3px 8px",
              fontSize: "11px",
              fontFamily: FLAME_THEME.typography.fontFamilyMono,
              backgroundColor: showAnnotations ? "rgba(8, 124, 255, 0.2)" : FLAME_THEME.colors.surfaceElevated,
              color: showAnnotations ? "#60A5FA" : FLAME_THEME.colors.textMuted,
              border: FLAME_THEME.borders.subtle,
              borderRadius: FLAME_THEME.borders.radiusSm,
              cursor: "pointer",
            }}
          >
            Dimensions {showAnnotations ? "ON" : "OFF"}
          </button>
          <button
            onClick={() => setSootOverlay(!sootOverlay)}
            style={{
              padding: "3px 8px",
              fontSize: "11px",
              fontFamily: FLAME_THEME.typography.fontFamilyMono,
              backgroundColor: sootOverlay ? "rgba(255, 112, 41, 0.2)" : FLAME_THEME.colors.surfaceElevated,
              color: sootOverlay ? "#FB923C" : FLAME_THEME.colors.textMuted,
              border: FLAME_THEME.borders.subtle,
              borderRadius: FLAME_THEME.borders.radiusSm,
              cursor: "pointer",
            }}
          >
            Soot Zone {sootOverlay ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* Main Comparison Stage */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", padding: "16px", boxSizing: "border-box" }}>
        {/* Left Panel: Active Simulation Morphology */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: FLAME_THEME.colors.backgroundAlt,
            borderRadius: FLAME_THEME.borders.radiusSm,
            border: FLAME_THEME.borders.subtle,
            padding: "12px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ color: is0g ? "#38BDF8" : "#FF7029", fontWeight: 700, fontSize: "12px", fontFamily: FLAME_THEME.typography.fontFamilyMono }}>
              {is0g ? "MICROGRAVITY (0g)" : `GRAVITY (${gLevel.toFixed(2)}g)`}
            </span>
            <span style={{ fontSize: "11px", color: FLAME_THEME.colors.textMuted }}>
              {is0g ? "Burke-Schumann Sphere" : "Buoyant Teardrop Plume"}
            </span>
          </div>

          {/* SVG Cross-section drawing */}
          <div style={{ flex: 1, position: "relative" }}>
            <svg width="100%" height="100%" viewBox="0 0 240 220">
              {/* Coordinate grid background */}
              <line x1="20" y1="180" x2="220" y2="180" stroke="#1F2937" strokeWidth="1" />
              <line x1="120" y1="20" x2="120" y2="200" stroke="#1F2937" strokeWidth="1" strokeDasharray="2 2" />

              {/* Burner nozzle base */}
              <rect x={120 - (burnerDiameterMm * 4) / 2} y="180" width={burnerDiameterMm * 4} height="15" fill="#374151" rx="2" />
              <text x="120" y="205" fill="#6B7280" fontSize="8" textAnchor="middle" fontFamily="monospace">
                Burner (D = {burnerDiameterMm}mm)
              </text>

              {/* 0g Radial Sphere Geometry */}
              {is0g ? (
                <g>
                  {/* Outer soot boundary layer */}
                  {sootOverlay && (
                    <circle cx="120" cy="140" r="58" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeDasharray="3 3" />
                  )}

                  {/* Flame outer reaction front (blue chemiluminescence) */}
                  <circle cx="120" cy="140" r="42" fill="rgba(8, 124, 255, 0.25)" stroke="#38BDF8" strokeWidth="2.5" />

                  {/* Inner fuel vapor core */}
                  <circle cx="120" cy="140" r="18" fill="rgba(14, 165, 233, 0.4)" stroke="#0284C7" strokeWidth="1" />

                  {/* Dimension markers */}
                  {showAnnotations && (
                    <g>
                      {/* Diameter marker */}
                      <line x1="78" y1="140" x2="162" y2="140" stroke="#F9FAFB" strokeWidth="1" />
                      <line x1="78" y1="135" x2="78" y2="145" stroke="#F9FAFB" strokeWidth="1" />
                      <line x1="162" y1="135" x2="162" y2="145" stroke="#F9FAFB" strokeWidth="1" />
                      <text x="120" y="135" fill="#F9FAFB" fontSize="9" textAnchor="middle" fontFamily="monospace">
                        W = {currentWidth.toFixed(1)} mm
                      </text>

                      {/* Standoff marker */}
                      <line x1="120" y1="180" x2="120" y2="140" stroke="#10B981" strokeWidth="1" strokeDasharray="2 2" />
                      <text x="126" y="162" fill="#10B981" fontSize="8" fontFamily="monospace">
                        r_standoff
                      </text>
                    </g>
                  )}
                </g>
              ) : (
                /* 1g Buoyant Teardrop Geometry */
                <g>
                  {/* Teardrop path */}
                  <path
                    d="M 95 180 C 85 140, 95 90, 120 40 C 145 90, 155 140, 145 180 Z"
                    fill="rgba(255, 112, 41, 0.25)"
                    stroke="#FF7029"
                    strokeWidth="2.5"
                  />

                  {/* Incandescent soot tip */}
                  {sootOverlay && (
                    <path
                      d="M 108 95 C 112 70, 115 50, 120 40 C 125 50, 128 70, 132 95 Z"
                      fill="rgba(250, 204, 21, 0.6)"
                      stroke="#FACC15"
                      strokeWidth="1"
                    />
                  )}

                  {/* Blue base chemiluminescence */}
                  <path
                    d="M 96 180 C 100 165, 105 160, 120 160 C 135 160, 140 165, 144 180 Z"
                    fill="rgba(56, 189, 248, 0.5)"
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                  />

                  {/* Dimension markers */}
                  {showAnnotations && (
                    <g>
                      {/* Height line */}
                      <line x1="170" y1="40" x2="170" y2="180" stroke="#F9FAFB" strokeWidth="1" />
                      <line x1="165" y1="40" x2="175" y2="40" stroke="#F9FAFB" strokeWidth="1" />
                      <line x1="165" y1="180" x2="175" y2="180" stroke="#F9FAFB" strokeWidth="1" />
                      <text x="178" y="115" fill="#F9FAFB" fontSize="9" fontFamily="monospace">
                        H = {currentHeight.toFixed(1)} mm
                      </text>

                      {/* Width line */}
                      <line x1="92" y1="145" x2="148" y2="145" stroke="#F9FAFB" strokeWidth="1" />
                      <text x="120" y="140" fill="#F9FAFB" fontSize="8" textAnchor="middle" fontFamily="monospace">
                        W = {currentWidth.toFixed(1)} mm
                      </text>
                    </g>
                  )}
                </g>
              )}
            </svg>
          </div>

          {/* Morphological Metrics Table */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px",
              marginTop: "8px",
              paddingTop: "8px",
              borderTop: FLAME_THEME.borders.subtle,
              fontSize: "11px",
              fontFamily: FLAME_THEME.typography.fontFamilyMono,
            }}
          >
            <div>Height: <span style={{ color: "#F9FAFB" }}>{currentHeight.toFixed(1)} mm</span></div>
            <div>Width: <span style={{ color: "#F9FAFB" }}>{currentWidth.toFixed(1)} mm</span></div>
            <div>Aspect Ratio: <span style={{ color: is0g ? "#38BDF8" : "#FF7029", fontWeight: 700 }}>{currentAspect}</span></div>
            <div>Symmetry: <span style={{ color: is0g ? "#10B981" : "#F59E0B" }}>{currentSymmetry}</span></div>
          </div>
        </div>

        {/* Right Panel: Terrestrial 1g Baseline Comparison */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: FLAME_THEME.colors.backgroundAlt,
            borderRadius: FLAME_THEME.borders.radiusSm,
            border: FLAME_THEME.borders.subtle,
            padding: "12px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ color: "#FF7029", fontWeight: 700, fontSize: "12px", fontFamily: FLAME_THEME.typography.fontFamilyMono }}>
              TERRESTRIAL BASELINE (1.0g)
            </span>
            <span style={{ fontSize: "11px", color: FLAME_THEME.colors.textMuted }}>NASA Reference</span>
          </div>

          <div style={{ flex: 1, position: "relative" }}>
            <svg width="100%" height="100%" viewBox="0 0 240 220">
              <line x1="20" y1="180" x2="220" y2="180" stroke="#1F2937" strokeWidth="1" />
              <line x1="120" y1="20" x2="120" y2="200" stroke="#1F2937" strokeWidth="1" strokeDasharray="2 2" />

              <rect x={120 - (burnerDiameterMm * 4) / 2} y="180" width={burnerDiameterMm * 4} height="15" fill="#374151" rx="2" />

              {/* 1g Reference Shape */}
              <path
                d="M 98 180 C 88 140, 96 90, 120 45 C 144 90, 152 140, 142 180 Z"
                fill="rgba(255, 112, 41, 0.2)"
                stroke="#FF7029"
                strokeWidth="2"
              />

              {/* Soot zone tip */}
              <path
                d="M 110 90 C 114 70, 116 55, 120 45 C 124 55, 126 70, 130 90 Z"
                fill="rgba(250, 204, 21, 0.5)"
              />

              {/* Blue Base */}
              <path
                d="M 99 180 C 102 168, 108 162, 120 162 C 132 162, 138 168, 141 180 Z"
                fill="rgba(56, 189, 248, 0.4)"
                stroke="#38BDF8"
                strokeWidth="1"
              />

              {showAnnotations && (
                <g>
                  <line x1="168" y1="45" x2="168" y2="180" stroke="#F9FAFB" strokeWidth="1" />
                  <line x1="164" y1="45" x2="172" y2="45" stroke="#F9FAFB" strokeWidth="1" />
                  <line x1="164" y1="180" x2="172" y2="180" stroke="#F9FAFB" strokeWidth="1" />
                  <text x="175" y="115" fill="#F9FAFB" fontSize="9" fontFamily="monospace">
                    H = {refHeight.toFixed(1)} mm
                  </text>
                </g>
              )}
            </svg>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px",
              marginTop: "8px",
              paddingTop: "8px",
              borderTop: FLAME_THEME.borders.subtle,
              fontSize: "11px",
              fontFamily: FLAME_THEME.typography.fontFamilyMono,
            }}
          >
            <div>Height: <span style={{ color: "#F9FAFB" }}>{refHeight.toFixed(1)} mm</span></div>
            <div>Width: <span style={{ color: "#F9FAFB" }}>{refWidth.toFixed(1)} mm</span></div>
            <div>Aspect Ratio: <span style={{ color: "#FF7029", fontWeight: 700 }}>{refAspect}</span></div>
            <div>Standoff Ratio: <span style={{ color: "#38BDF8" }}>{standoffRatio}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
