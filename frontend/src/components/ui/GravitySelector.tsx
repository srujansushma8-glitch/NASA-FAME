"use client";

import React from "react";

interface GravitySelectorProps {
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export function GravitySelector({ value, onChange, disabled = false }: GravitySelectorProps) {
  const presets = [
    { label: "0g Microgravity", value: 0.0, sub: "ISS ACME Freefall", badge: "0.000g" },
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
              className={`flex flex-col items-start p-3 rounded-[4px] text-left transition-all ring-1 ${
                isSelected
                  ? "bg-white/[0.08] ring-earth text-white shadow-[0_0_20px_rgba(111,182,255,0.2)]"
                  : "bg-white/[0.02] ring-white/10 text-regolith/80 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-label text-white uppercase">{p.label}</span>
                <span
                  className={`text-[0.625rem] font-mono tracking-widest px-1.5 py-0.5 rounded-[2px] ${
                    isSelected ? "bg-earth text-void font-bold" : "bg-white/[0.05] text-regolith/60"
                  }`}
                >
                  {p.badge}
                </span>
              </div>
              <span className="text-[0.75rem] text-regolith/50 mt-1 font-sans">{p.sub}</span>
            </button>
          );
        })}
      </div>

      {/* Slider for continuous gravity tuning */}
      <div className="flex items-center gap-4 bg-white/[0.02] p-3 rounded-[4px] ring-1 ring-white/10">
        <div className="flex-1">
          <div className="flex justify-between font-mono text-label text-regolith/60 uppercase mb-1.5">
            <span>Continuous Gravity Sweep</span>
            <span className="text-earth font-bold tabular-nums">{value.toFixed(3)} g</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full accent-earth bg-white/10 h-1.5 rounded cursor-pointer disabled:opacity-50"
          />
        </div>
        <div className="w-24 text-right">
          <input
            type="number"
            min="0"
            max="20"
            step="0.01"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="w-full bg-void ring-1 ring-white/20 rounded-[3px] px-2.5 py-1.5 text-right font-mono text-xs text-white focus:outline-none focus:ring-earth"
          />
        </div>
      </div>
    </div>
  );
}
