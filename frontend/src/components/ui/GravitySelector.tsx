"use client";

import React from "react";

interface GravitySelectorProps {
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export function GravitySelector({ value, onChange, disabled = false }: GravitySelectorProps) {
  const presets = [
    { label: "0g Microgravity", value: 0.0, sub: "ISS ACME / Freefall", badge: "0.000g" },
    { label: "Lunar Surface", value: 0.166, sub: "Artemis Test Cell", badge: "0.166g" },
    { label: "Martian Surface", value: 0.38, sub: "Partial Convection", badge: "0.380g" },
    { label: "Earth Baseline", value: 1.0, sub: "Terrestrial Plume", badge: "1.000g" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Preset Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {presets.map((p) => {
          const isSelected = Math.abs(value - p.value) < 0.01;
          return (
            <button
              key={p.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(p.value)}
              className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? "bg-charcoal-700 border-electric text-white shadow-md shadow-electric/15"
                  : "bg-charcoal-800/80 border-border text-slate-300 hover:border-slate-600 hover:bg-charcoal-700/60"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-xs font-bold text-white">{p.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected ? "bg-electric text-white font-bold" : "bg-black/50 text-slate-400"
                  }`}
                >
                  {p.badge}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1">{p.sub}</span>
            </button>
          );
        })}
      </div>

      {/* Slider for fine adjustment */}
      <div className="flex items-center gap-4 bg-charcoal-800/50 p-2.5 rounded-lg border border-border/70">
        <div className="flex-1">
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
            <span>Continuous Gravity Sweep</span>
            <span className="text-electric-400 font-bold">{value.toFixed(3)} g</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full accent-electric bg-slate-700 h-1.5 rounded-lg cursor-pointer disabled:opacity-50"
          />
        </div>
        <div className="w-20 text-right">
          <input
            type="number"
            min="0"
            max="20"
            step="0.01"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="w-full bg-charcoal-900 border border-border rounded px-2 py-1 text-right font-mono text-xs text-white focus:outline-none focus:border-electric"
          />
        </div>
      </div>
    </div>
  );
}

