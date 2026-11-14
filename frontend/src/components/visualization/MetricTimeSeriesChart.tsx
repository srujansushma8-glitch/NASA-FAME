"use client";

import React, { useState } from "react";
import { SimulationTimeSeriesPoint } from "@/types";

interface MetricTimeSeriesChartProps {
  data?: SimulationTimeSeriesPoint[];
  title?: string;
}

type ActiveMetric = "temperature" | "radius" | "burn_rate" | "soot";

export function MetricTimeSeriesChart({
  data = [],
  title = "Combustion Temporal Trajectory",
}: MetricTimeSeriesChartProps) {
  const [metric, setMetric] = useState<ActiveMetric>("temperature");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 rounded-xl border border-border bg-[#090D16] p-6 text-slate-500 font-mono text-xs">
        No discrete time-series points recorded for this run.
      </div>
    );
  }

  // Metric metadata
  const metricConfig = {
    temperature: {
      key: "max_temperature_k" as const,
      label: "Peak Flame Temperature",
      unit: "K",
      color: "#FF7029",
      min: 250,
      max: Math.max(...data.map((d) => d.max_temperature_k)) * 1.05 || 2500,
    },
    radius: {
      key: "flame_radius_mm" as const,
      label: "Flame Radius",
      unit: "mm",
      color: "#087CFF",
      min: 0,
      max: Math.max(...data.map((d) => d.flame_radius_mm)) * 1.15 || 20,
    },
    burn_rate: {
      key: "burning_rate_mg_s" as const,
      label: "Mass Burning Rate",
      unit: "mg/s",
      color: "#10B981",
      min: 0,
      max: Math.max(...data.map((d) => d.burning_rate_mg_s)) * 1.2 || 10,
    },
    soot: {
      key: "soot_fraction" as const,
      label: "Soot Volume Fraction",
      unit: "ppm",
      color: "#F59E0B",
      min: 0,
      max: Math.max(...data.map((d) => d.soot_fraction * 1e6)) * 1.25 || 10,
    },
  };

  const current = metricConfig[metric];

  // SVG Chart bounds
  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 35, left: 55 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minX = data[0].time_s;
  const maxX = data[data.length - 1].time_s || 10;
  const minY = current.min;
  const maxY = current.max;

  const scaleX = (x: number) => padding.left + ((x - minX) / (maxX - minX || 1)) * chartW;
  const scaleY = (y: number) => padding.top + chartH - ((y - minY) / (maxY - minY || 1)) * chartH;

  const getMetricValue = (d: SimulationTimeSeriesPoint) => {
    if (metric === "soot") {
      return d.soot_fraction * 1e6;
    }
    return d[current.key];
  };

  // Generate SVG path line
  const points = data.map((d) => ({
    x: scaleX(d.time_s),
    y: scaleY(getMetricValue(d)),
    val: getMetricValue(d),
    time: d.time_s,
  }));

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  // Area under curve
  const areaD = `${pathD} L ${scaleX(maxX)} ${scaleY(minY)} L ${scaleX(minX)} ${scaleY(minY)} Z`;

  return (
    <div className="flex flex-col rounded-xl border border-border bg-[#090D16] p-4 shadow-lg">
      {/* Header with Metric Selectors */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
            {title}
          </span>
          <p className="text-[11px] font-mono text-slate-400">
            Transient numerical solver trajectory across physical duration
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1 rounded-lg bg-charcoal-800 p-1 border border-border/60">
          <button
            onClick={() => setMetric("temperature")}
            className={`px-2.5 py-1 text-[11px] font-mono rounded font-medium transition-colors ${
              metric === "temperature"
                ? "bg-flame-950 text-flame-400 border border-flame-700/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Temp (K)
          </button>
          <button
            onClick={() => setMetric("radius")}
            className={`px-2.5 py-1 text-[11px] font-mono rounded font-medium transition-colors ${
              metric === "radius"
                ? "bg-electric-950 text-electric-400 border border-electric-700/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Radius (mm)
          </button>
          <button
            onClick={() => setMetric("burn_rate")}
            className={`px-2.5 py-1 text-[11px] font-mono rounded font-medium transition-colors ${
              metric === "burn_rate"
                ? "bg-emerald-950 text-emerald-400 border border-emerald-700/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Burn Rate
          </button>
          <button
            onClick={() => setMetric("soot")}
            className={`px-2.5 py-1 text-[11px] font-mono rounded font-medium transition-colors ${
              metric === "soot"
                ? "bg-amber-950 text-amber-400 border border-amber-700/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Soot
          </button>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative mt-3 w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={current.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={current.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padding.top + chartH * (1 - pct);
            const val = minY + (maxY - minY) * pct;
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1E293B"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  fill="#64748B"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {val.toFixed(val > 100 ? 0 : 1)}
                </text>
              </g>
            );
          })}

          {/* Time axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const x = padding.left + chartW * pct;
            const t = minX + (maxX - minX) * pct;
            return (
              <g key={idx}>
                <line
                  x1={x}
                  y1={height - padding.bottom}
                  x2={x}
                  y2={height - padding.bottom + 4}
                  stroke="#475569"
                />
                <text
                  x={x}
                  y={height - padding.bottom + 16}
                  fill="#64748B"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {t.toFixed(1)}s
                </text>
              </g>
            );
          })}

          {/* Fill area */}
          <path d={areaD} fill="url(#curveGradient)" />

          {/* Line trajectory */}
          <path
            d={pathD}
            fill="none"
            stroke={current.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive point markers */}
          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={hoverIndex === idx ? "5" : "2.5"}
              fill={hoverIndex === idx ? "#FFFFFF" : current.color}
              stroke="#090D16"
              strokeWidth="1.5"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}

          {/* Active Hover crosshair & tooltip */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={points[hoverIndex].x}
                y1={padding.top}
                x2={points[hoverIndex].x}
                y2={height - padding.bottom}
                stroke="#94A3B8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <rect
                x={Math.min(points[hoverIndex].x - 45, width - padding.right - 90)}
                y={Math.max(points[hoverIndex].y - 30, padding.top)}
                width="90"
                height="22"
                rx="4"
                fill="#000000"
                stroke="#334155"
              />
              <text
                x={Math.min(points[hoverIndex].x, width - padding.right - 45)}
                y={Math.max(points[hoverIndex].y - 15, padding.top + 15)}
                fill="#FFFFFF"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {points[hoverIndex].val.toFixed(2)} {current.unit} @ {points[hoverIndex].time.toFixed(1)}s
              </text>
            </g>
          )}
        </svg>

        {/* Axis labels */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
          <span>Y-Axis: {current.label} ({current.unit})</span>
          <span>X-Axis: Elapsed Simulation Time (s)</span>
        </div>
      </div>
    </div>
  );
}

