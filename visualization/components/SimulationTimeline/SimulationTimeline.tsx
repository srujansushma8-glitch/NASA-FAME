/**
 * NASA-FLAME: SimulationTimeline
 * Interactive timeline scrubber with synchronized sparklines for flame radius,
 * peak temperature, burning rate, and soot volume fraction.
 */

import React from "react";
import { SimulationTimeSeriesPoint } from "../../types/index.ts";
import { FLAME_THEME } from "../../theme/colors.ts";
import { EmptyState } from "../Common/EmptyState.tsx";

export interface SimulationTimelineProps {
  timeSeries?: SimulationTimeSeriesPoint[];
  currentTime: number;
  duration?: number;
  isPlaying?: boolean;
  onTimeChange: (time_s: number) => void;
  onTogglePlay?: () => void;
  extinctionTime?: number | null;
  height?: number | string;
  width?: number | string;
}

export const SimulationTimeline: React.FC<SimulationTimelineProps> = ({
  timeSeries = [],
  currentTime,
  duration,
  isPlaying = false,
  onTimeChange,
  onTogglePlay,
  extinctionTime,
  height = 200,
  width = "100%",
}) => {
  if (!timeSeries || timeSeries.length === 0) {
    return <EmptyState title="No Simulation Timeline Data" message="Time-series telemetry points are not available." height={height} />;
  }

  const maxTime = duration || timeSeries[timeSeries.length - 1].time_s || 10.0;
  const clampedCurrentTime = Math.max(0, Math.min(maxTime, currentTime));

  // Current metric lookup
  const currentPt = timeSeries.reduce((prev, curr) =>
    Math.abs(curr.time_s - clampedCurrentTime) < Math.abs(prev.time_s - clampedCurrentTime) ? curr : prev
  );

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTimeChange(Number(e.target.value));
  };

  // Sparkline generator helper
  const renderSparkline = (
    dataExtractor: (pt: SimulationTimeSeriesPoint) => number,
    color: string,
    minVal: number,
    maxVal: number
  ) => {
    const range = Math.max(1e-4, maxVal - minVal);
    const points = timeSeries
      .map((pt, i) => {
        const x = (pt.time_s / maxTime) * 100;
        const y = 100 - ((dataExtractor(pt) - minVal) / range) * 100;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${Math.max(5, Math.min(95, y)).toFixed(1)}`;
      })
      .join(" ");

    return (
      <svg width="100%" height="32" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: "visible" }}>
        <path d={points} fill="none" stroke={color} strokeWidth="3" />
        {/* Current Playhead Dot */}
        <circle
          cx={(clampedCurrentTime / maxTime) * 100}
          cy={100 - ((dataExtractor(currentPt) - minVal) / range) * 100}
          r="6"
          fill="#FFFFFF"
          stroke={color}
          strokeWidth="3"
        />
      </svg>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: FLAME_THEME.colors.secondary,
        borderRadius: FLAME_THEME.borders.radiusMd,
        border: FLAME_THEME.borders.subtle,
        padding: "12px 16px",
        width,
        height,
        boxSizing: "border-box",
        gap: "10px",
      }}
    >
      {/* Top Header & Playback Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {onTogglePlay && (
            <button
              onClick={onTogglePlay}
              style={{
                padding: "4px 10px",
                backgroundColor: isPlaying ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
                color: isPlaying ? "#FCA5A5" : "#6EE7B7",
                border: `1px solid ${isPlaying ? "rgba(239, 68, 68, 0.4)" : "rgba(16, 185, 129, 0.4)"}`,
                borderRadius: FLAME_THEME.borders.radiusSm,
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: FLAME_THEME.typography.fontFamilyMono,
              }}
            >
              {isPlaying ? "PAUSE" : "PLAY"}
            </button>
          )}
          <span
            style={{
              color: FLAME_THEME.colors.electricBlue,
              fontWeight: 700,
              fontSize: "12px",
              letterSpacing: "0.04em",
              fontFamily: FLAME_THEME.typography.fontFamilyMono,
            }}
          >
            SIMULATION TIMELINE
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              fontFamily: FLAME_THEME.typography.fontFamilyMono,
              color: FLAME_THEME.colors.textPrimary,
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            t = {clampedCurrentTime.toFixed(2)}s / {maxTime.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Main Scrubber Slider */}
      <div style={{ position: "relative", width: "100%", padding: "4px 0" }}>
        <input
          type="range"
          min="0"
          max={maxTime}
          step="0.05"
          value={clampedCurrentTime}
          onChange={handleSliderChange}
          style={{
            width: "100%",
            accentColor: FLAME_THEME.colors.electricBlue,
            cursor: "pointer",
          }}
        />

        {/* Extinction event marker on timeline */}
        {extinctionTime && extinctionTime <= maxTime && (
          <div
            style={{
              position: "absolute",
              left: `${(extinctionTime / maxTime) * 100}%`,
              top: "-8px",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                fontSize: "9px",
                color: "#EF4444",
                fontFamily: "monospace",
                fontWeight: 700,
              }}
            >
              Extinction
            </span>
            <div style={{ width: "2px", height: "14px", backgroundColor: "#EF4444" }} />
          </div>
        )}
      </div>

      {/* Synchronized Sparkline Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", flex: 1, alignItems: "center" }}>
        {/* 1. Peak Temperature */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontFamily: "monospace" }}>
            <span style={{ color: FLAME_THEME.colors.textMuted }}>T_max</span>
            <span style={{ color: "#FF7029", fontWeight: 700 }}>{currentPt.max_temperature_k.toFixed(0)} K</span>
          </div>
          {renderSparkline((pt) => pt.max_temperature_k, "#FF7029", 300, 2300)}
        </div>

        {/* 2. Flame Radius */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontFamily: "monospace" }}>
            <span style={{ color: FLAME_THEME.colors.textMuted }}>Radius</span>
            <span style={{ color: "#38BDF8", fontWeight: 700 }}>{currentPt.flame_radius_mm.toFixed(2)} mm</span>
          </div>
          {renderSparkline((pt) => pt.flame_radius_mm, "#38BDF8", 0, 15)}
        </div>

        {/* 3. Burning Rate */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontFamily: "monospace" }}>
            <span style={{ color: FLAME_THEME.colors.textMuted }}>Burn Rate</span>
            <span style={{ color: "#10B981", fontWeight: 700 }}>{currentPt.burning_rate_mg_s.toFixed(2)} mg/s</span>
          </div>
          {renderSparkline((pt) => pt.burning_rate_mg_s, "#10B981", 0, 5)}
        </div>

        {/* 4. Soot Volume Fraction */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontFamily: "monospace" }}>
            <span style={{ color: FLAME_THEME.colors.textMuted }}>Soot Frac</span>
            <span style={{ color: "#F59E0B", fontWeight: 700 }}>{(currentPt.soot_fraction * 1e6).toFixed(2)} ppm</span>
          </div>
          {renderSparkline((pt) => pt.soot_fraction, "#F59E0B", 0, 4e-6)}
        </div>
      </div>
    </div>
  );
};
