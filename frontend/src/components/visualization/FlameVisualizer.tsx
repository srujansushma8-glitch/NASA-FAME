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
    <div className="relative flex flex-col rounded-xl border border-border bg-[#090D16] p-4 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              {title}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold border ${
                isZeroG
                  ? "bg-electric-900/40 text-electric-400 border-electric-600/40"
                  : isTransitional
                  ? "bg-amber-950/40 text-amber-400 border-amber-700/40"
                  : "bg-flame-950/40 text-flame-400 border-flame-700/40"
              }`}
            >
              {isZeroG ? "0.0g SPHERICAL" : isTransitional ? `${gravity.toFixed(2)}g TRANSITIONAL` : "1.0g BUOYANT PLUME"}
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            {isZeroG
              ? "Diffusion-governed radially symmetric Burke-Schumann flame"
              : isTransitional
              ? "Mixed convection-diffusion with base widening"
              : "Buoyancy-dominated convective acceleration & vortex shedding"}
          </p>
        </div>

        {showControls && (
          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => setShowIsotherms(!showIsotherms)}
              title="Toggle Thermal Isotherms"
              className={`p-1.5 rounded hover:bg-charcoal-700 text-xs transition-colors ${
                showIsotherms ? "text-electric-400 bg-charcoal-800" : "text-slate-500"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShowSootShell(!showSootShell)}
              title="Toggle Soot Shell"
              className={`p-1.5 rounded hover:bg-charcoal-700 text-xs transition-colors ${
                showSootShell ? "text-flame-400 bg-charcoal-800" : "text-slate-500"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              title="Toggle Grid Coordinates"
              className={`p-1.5 rounded hover:bg-charcoal-700 text-xs transition-colors ${
                showGrid ? "text-slate-300 bg-charcoal-800" : "text-slate-500"
              }`}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Flame Visualizer Viewport */}
      <div className="relative mt-3 flex items-center justify-center min-h-[280px] w-full rounded-lg bg-[#06080E] border border-border/40 overflow-hidden">
        {/* Spatial background grid */}
        {showGrid && (
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, #202D45 1px, transparent 1px), linear-gradient(to bottom, #202D45 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
        )}

        {/* Burner / Nozzle Representation at bottom center */}
        <div className="absolute bottom-2 flex flex-col items-center z-10">
          <div className="h-4 w-12 rounded-t-sm bg-gradient-to-t from-slate-800 to-slate-600 border-t border-x border-slate-500 flex items-center justify-center">
            <span className="text-[8px] font-mono text-slate-300">BURNER</span>
          </div>
          <div className="h-3 w-8 bg-slate-900 border-x border-slate-700" />
        </div>

        {/* SVG Flame Rendering */}
        <svg
          viewBox="-120 -160 240 200"
          className="relative h-64 w-full max-w-[340px] drop-shadow-2xl"
        >
          <defs>
            {/* 0g Radial Gradient */}
            <radialGradient id="sphericalCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="30%" stopColor="#FFE066" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#FF7029" stopOpacity="0.75" />
              <stop offset="85%" stopColor="#087CFF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#087CFF" stopOpacity="0" />
            </radialGradient>

            {/* 1g Vertical Buoyancy Gradient */}
            <linearGradient id="teardropPlume" x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#087CFF" stopOpacity="0.9" />
              <stop offset="25%" stopColor="#FFE066" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#FF7029" stopOpacity="0.85" />
              <stop offset="90%" stopColor="#FF3300" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#551100" stopOpacity="0" />
            </linearGradient>

            {/* Transitional Gradient */}
            <radialGradient id="transitionalGradient" cx="50%" cy="65%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#FFE880" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#FF7029" stopOpacity="0.7" />
              <stop offset="95%" stopColor="#087CFF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#087CFF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Zero-g: Symmetrical Burke-Schumann Sphere */}
          {isZeroG && (
            <g transform="translate(0, -50)">
              {/* Thermal Isotherm Outlines */}
              {showIsotherms && (
                <>
                  <circle cx="0" cy="0" r="75" fill="none" stroke="#087CFF" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                  <circle cx="0" cy="0" r="62" fill="none" stroke="#FF7029" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
                </>
              )}

              {/* Soot shell ring - characteristic microgravity soot stagnation */}
              {showSootShell && (
                <circle
                  cx="0"
                  cy="0"
                  r="52"
                  fill="none"
                  stroke="#FF9500"
                  strokeWidth="2.5"
                  opacity="0.6"
                  className="animate-pulse"
                />
              )}

              {/* Luminous Reaction Zone */}
              <circle cx="0" cy="0" r="45" fill="url(#sphericalCore)" />

              {/* Inner Core */}
              <circle cx="0" cy="0" r="18" fill="#FFFBE6" opacity="0.9" />

              {/* Dimension callout */}
              <line x1="0" y1="0" x2="45" y2="0" stroke="#087CFF" strokeWidth="1.5" />
              <circle cx="45" cy="0" r="2.5" fill="#087CFF" />
              <text x="10" y="-6" fill="#087CFF" fontSize="10" fontFamily="monospace" fontWeight="bold">
                R={flameRadiusMm.toFixed(1)}mm
              </text>
            </g>
          )}

          {/* Transitional: Partial-g Oblate Oval (Lunar 0.16g / Mars 0.38g) */}
          {isTransitional && (
            <g transform="translate(0, -40)">
              {showIsotherms && (
                <ellipse cx="0" cy="-10" rx="65" ry="75" fill="none" stroke="#FF7029" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
              )}
              {showSootShell && (
                <ellipse cx="0" cy="-8" rx="50" ry="60" fill="none" stroke="#FFB020" strokeWidth="2" opacity="0.55" />
              )}
              {/* Oblate flame body */}
              <ellipse cx="0" cy="-8" rx="42" ry="52" fill="url(#transitionalGradient)" />
              <ellipse cx="0" cy="0" rx="18" ry="22" fill="#FFFFFF" opacity="0.85" />

              {/* Dimension indicators */}
              <line x1="0" y1="0" x2="42" y2="0" stroke="#087CFF" strokeWidth="1.5" />
              <text x="8" y="-4" fill="#087CFF" fontSize="9" fontFamily="monospace" fontWeight="bold">
                R={flameRadiusMm.toFixed(1)}mm
              </text>
            </g>
          )}

          {/* Terrestrial 1g: Elongated Buoyant Teardrop Plume */}
          {isTeardrop && (
            <g transform="translate(0, 0)">
              {showIsotherms && (
                <path
                  d="M -35, -5 C -45, -50 -25, -115 0, -145 C 25, -115 45, -50 35, -5 Z"
                  fill="none"
                  stroke="#FF7029"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.35"
                />
              )}

              {/* Convective teardrop geometry */}
              <path
                d="M -26, -5 C -34, -40 -18, -95 0, -125 C 18, -95 34, -40 26, -5 Z"
                fill="url(#teardropPlume)"
              />

              {/* Intense base & core */}
              <path
                d="M -14, -5 C -18, -25 -8, -60 0, -80 C 8, -60 18, -25 14, -5 Z"
                fill="#FFFBEA"
                opacity="0.9"
              />

              {/* Blue flame base anchor (chemiluminescent root) */}
              <ellipse cx="0" cy="-5" rx="16" ry="6" fill="#087CFF" opacity="0.8" />

              {/* Height callout */}
              <line x1="40" y1="-5" x2="40" y2="-125" stroke="#FF7029" strokeWidth="1.5" />
              <line x1="36" y1="-5" x2="44" y2="-5" stroke="#FF7029" strokeWidth="1.5" />
              <line x1="36" y1="-125" x2="44" y2="-125" stroke="#FF7029" strokeWidth="1.5" />
              <text x="46" y="-65" fill="#FF7029" fontSize="9" fontFamily="monospace" fontWeight="bold">
                H={heightVal.toFixed(1)}mm
              </text>
            </g>
          )}
        </svg>

        {/* Legend overlays */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 text-[10px] font-mono text-slate-400 bg-black/60 p-2 rounded border border-border/50">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white" />
            <span>Peak Temp: {maxTemperatureK.toFixed(0)} K</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-electric-400" />
            <span>Gravity Field: {gravity.toFixed(3)} g</span>
          </div>
          {sootFraction > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-flame-400" />
              <span>Soot Fraction: {(sootFraction * 1e6).toFixed(1)} ppm</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

