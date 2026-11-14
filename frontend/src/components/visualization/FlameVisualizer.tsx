"use client";

import React, { useState } from "react";
import { FlameShape } from "@/types";
import { Eye, Layers, ZoomIn } from "lucide-react";

interface FlameVisualizerProps {
  shape?: FlameShape;
  gravity?: number;
  flameRadiusMm?: number;
  flameHeightMm?: number;
  maxTemperatureK?: number;
  sootFraction?: number;
  title?: string;
  showControls?: boolean;
}

export function FlameVisualizer({
  shape = "SPHERICAL",
  gravity = 0.0,
  flameRadiusMm = 8.5,
  flameHeightMm,
  maxTemperatureK = 2100,
  sootFraction = 0.000001,
  title = "Flame Morphology & Geometry",
  showControls = true,
}: FlameVisualizerProps) {
  const [showIsotherms, setShowIsotherms] = useState(true);
  const [showSootShell, setShowSootShell] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // Normalize effective geometry
  const isZeroG = gravity <= 0.05 || shape === "SPHERICAL";
  const isTransitional = (gravity > 0.05 && gravity < 0.6) || shape === "TRANSITIONAL";
  const isTeardrop = gravity >= 0.6 || shape === "TEARDROP";

  const heightVal = flameHeightMm || (isTeardrop ? flameRadiusMm * 2.8 : flameRadiusMm * 1.5);

  return (
    <div className="relative flex flex-col rounded-[6px] bg-void-2 p-5 ring-1 ring-white/10 overflow-hidden shadow-2xl">
      {/* Corner HUD Brackets */}
      <div className="brackets pointer-events-none absolute inset-0 text-regolith/25" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-[0.875rem] tracking-[0.08em] text-white uppercase">
              {title}
            </span>
            <span
              className={`rounded-[3px] px-2 py-0.5 text-[0.625rem] font-mono tracking-widest uppercase ring-1 ${
                isZeroG
                  ? "bg-earth/15 text-earth ring-earth/30"
                  : isTransitional
                  ? "bg-amber-950/40 text-amber-300 ring-amber-500/30"
                  : "bg-flame/15 text-flame ring-flame/30"
              }`}
            >
              {isZeroG ? "0.0g Spherical" : isTransitional ? `${gravity.toFixed(2)}g Transitional` : "1.0g Buoyant Plume"}
            </span>
          </div>
          <p className="text-[0.75rem] font-mono text-regolith/60 mt-0.5">
            {isZeroG
              ? "Diffusion-governed radially symmetric Burke-Schumann flame"
              : isTransitional
              ? "Mixed convection-diffusion with base widening"
              : "Buoyancy-dominated convective acceleration & vortex shedding"}
          </p>
        </div>

        {showControls && (
          <div className="flex items-center gap-1.5 text-regolith/70">
            <button
              type="button"
              onClick={() => setShowIsotherms(!showIsotherms)}
              title="Toggle Thermal Isotherms"
              className={`p-1.5 rounded-[3px] ring-1 transition-colors ${
                showIsotherms
                  ? "text-earth bg-white/[0.08] ring-earth/40"
                  : "text-regolith/50 ring-white/10 hover:text-white"
              }`}
            >
              <Layers className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowSootShell(!showSootShell)}
              title="Toggle Soot Nanoparticle Boundary"
              className={`p-1.5 rounded-[3px] ring-1 transition-colors ${
                showSootShell
                  ? "text-flame bg-white/[0.08] ring-flame/40"
                  : "text-regolith/50 ring-white/10 hover:text-white"
              }`}
            >
              <Eye className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              title="Toggle Scale Grid"
              className={`p-1.5 rounded-[3px] ring-1 transition-colors ${
                showGrid
                  ? "text-white bg-white/[0.08] ring-white/30"
                  : "text-regolith/50 ring-white/10 hover:text-white"
              }`}
            >
              <ZoomIn className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* SVG Canvas Stage */}
      <div className="relative mt-4 flex items-center justify-center min-h-[300px] w-full bg-void rounded-[4px] ring-1 ring-white/10 overflow-hidden">
        {/* Eulerian Coordinate Grid */}
        {showGrid && (
          <svg className="absolute inset-0 size-full opacity-15" aria-hidden="true">
            <defs>
              <pattern id="flame-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#6fb6ff" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#flame-grid)" />
          </svg>
        )}

        {/* Burner and Flame SVG */}
        <svg viewBox="0 0 400 320" className="size-full max-h-[320px] relative z-10">
          <defs>
            <radialGradient id="sphere-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="25%" stopColor="#6fb6ff" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#ffaa40" stopOpacity="0.7" />
              <stop offset="85%" stopColor="#ff7029" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ff7029" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="plume-grad" x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="20%" stopColor="#6fb6ff" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#ffaa40" stopOpacity="0.8" />
              <stop offset="85%" stopColor="#ff7029" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#b91c1c" stopOpacity="0" />
            </linearGradient>

            <radialGradient id="soot-layer" cx="50%" cy="50%" r="50%">
              <stop offset="75%" stopColor="transparent" />
              <stop offset="90%" stopColor="#ff7029" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0.6" />
            </radialGradient>
          </defs>

          {/* Burner Tube Assembly */}
          <rect x="190" y="240" width="20" height="70" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <line x1="185" y1="240" x2="215" y2="240" stroke="#64748b" strokeWidth="2" />
          <circle cx="200" cy="240" r="3" fill="#6fb6ff" />

          {/* 0g Microgravity Spherical Flame */}
          {isZeroG && (
            <g transform="translate(200, 200)">
              {showIsotherms && (
                <>
                  <circle r="78" fill="none" stroke="#6fb6ff" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.4" />
                  <circle r="60" fill="none" stroke="#ffaa40" strokeWidth="0.75" strokeDasharray="4 2" opacity="0.5" />
                  <circle r="42" fill="none" stroke="#ff7029" strokeWidth="0.75" opacity="0.6" />
                </>
              )}

              {showSootShell && (
                <circle r="72" fill="url(#soot-layer)" stroke="#ff7029" strokeWidth="1.2" strokeOpacity="0.6" />
              )}

              <circle r="48" fill="url(#sphere-core)" className="animate-pulse" style={{ animationDuration: "3s" }} />
              <circle r="8" fill="#ffffff" opacity="0.9" filter="drop-shadow(0 0 8px #6fb6ff)" />
            </g>
          )}

          {/* 1g Terrestrial Buoyant Teardrop Flame */}
          {isTeardrop && (
            <g transform="translate(200, 240)">
              {showIsotherms && (
                <path
                  d="M0,0 C-35,-20 -40,-80 0,-140 C40,-80 35,-20 0,0 Z"
                  fill="none"
                  stroke="#6fb6ff"
                  strokeWidth="0.75"
                  strokeDasharray="4 2"
                  opacity="0.4"
                />
              )}

              <path
                d="M0,0 C-30,-15 -35,-65 0,-125 C35,-65 30,-15 0,0 Z"
                fill="url(#plume-grad)"
                className="animate-pulse"
                style={{ animationDuration: "1.2s" }}
              />

              <path
                d="M0,0 C-14,-10 -15,-40 0,-70 C15,-40 14,-10 0,0 Z"
                fill="#ffffff"
                opacity="0.85"
                filter="drop-shadow(0 0 6px #6fb6ff)"
              />
            </g>
          )}

          {/* Transitional Partial Gravity Oblate Flame */}
          {isTransitional && (
            <g transform="translate(200, 215)">
              {showIsotherms && (
                <ellipse cx="0" cy="-10" rx="58" ry="46" fill="none" stroke="#ffaa40" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.5" />
              )}
              <ellipse cx="0" cy="-10" rx="46" ry="38" fill="url(#sphere-core)" />
              <circle cx="0" cy="5" r="7" fill="#ffffff" opacity="0.9" />
            </g>
          )}

          {/* Scale Axis Markers */}
          <line x1="20" y1="280" x2="60" y2="280" stroke="#8b909b" strokeWidth="1.5" />
          <text x="40" y="272" fill="#8b909b" fontSize="9" fontFamily="IBM Plex Mono" textAnchor="middle">
            10 mm
          </text>
        </svg>

        {/* Live Geometry Readout Pill */}
        <div className="absolute bottom-3 left-3 rounded-[3px] bg-void/80 px-2.5 py-1.5 font-mono text-[0.625rem] tracking-[0.14em] text-regolith/80 uppercase backdrop-blur ring-1 ring-white/10">
          Radius: <span className="text-white font-bold">{flameRadiusMm.toFixed(1)} mm</span> • Peak:{" "}
          <span className="text-earth font-bold">{maxTemperatureK} K</span>
        </div>
      </div>
    </div>
  );
}
