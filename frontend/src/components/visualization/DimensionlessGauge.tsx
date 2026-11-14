"use client";

import React from "react";
import { DimensionlessNumbers } from "@/types";
import { Info } from "lucide-react";

interface DimensionlessGaugeProps {
  numbers?: DimensionlessNumbers;
  regime?: string;
}

export function DimensionlessGauge({ numbers, regime }: DimensionlessGaugeProps) {
  if (!numbers) {
    return (
      <div className="rounded-xl border border-border bg-[#090D16] p-4 text-xs font-mono text-slate-500">
        Run AI Analysis to compute dimensionless fluid dynamic numbers.
      </div>
    );
  }

  const items = [
    {
      symbol: "Gr",
      name: "Grashof Number",
      formula: "g · β · ΔT · L³ / ν²",
      value: numbers.grashof_number,
      description: "Buoyancy vs. viscous forces",
      interpretation:
        numbers.grashof_number < 10
          ? "Near-zero: Buoyancy suppressed"
          : numbers.grashof_number < 1000
          ? "Moderate: Partial-g regime"
          : "High: Strong buoyant convection",
      color: numbers.grashof_number < 10 ? "text-electric-400" : "text-flame-400",
    },
    {
      symbol: "Ri",
      name: "Richardson Number",
      formula: "Gr / Re²",
      value: numbers.richardson_number,
      description: "Buoyancy vs. shear flow",
      interpretation:
        numbers.richardson_number < 0.1
          ? "Diffusive / forced transport"
          : numbers.richardson_number < 5.0
          ? "Mixed convection regime"
          : "Buoyancy dominated plume",
      color: numbers.richardson_number < 0.1 ? "text-emerald-400" : "text-amber-400",
    },
    {
      symbol: "Fr",
      name: "Froude Number",
      formula: "u / √(g · L)",
      value: numbers.froude_number > 1e4 ? "∞ (0g)" : numbers.froude_number.toFixed(3),
      description: "Inertial vs. gravitational field",
      interpretation:
        numbers.froude_number > 1e4
          ? "Infinite: Freefall state"
          : "Finite: Gravitational influence",
      color: "text-electric-300",
    },
    {
      symbol: "Ra",
      name: "Rayleigh Number",
      formula: "Gr · Pr",
      value: numbers.rayleigh_number,
      description: "Buoyant heat transfer regime",
      interpretation:
        numbers.rayleigh_number < 100
          ? "Conduction & radiation govern"
          : "Convective heat transport active",
      color: numbers.rayleigh_number < 100 ? "text-electric-400" : "text-flame-400",
    },
  ];

  return (
    <div className="relative flex flex-col rounded-[6px] bg-void-2 p-5 ring-1 ring-white/10 shadow-2xl overflow-hidden">
      <div className="brackets pointer-events-none absolute inset-0 text-regolith/20" />
      <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
        <div>
          <span className="font-display text-[0.875rem] tracking-[0.08em] text-white uppercase">
            Dimensionless Scaling Numbers (Member 3 AI Engine)
          </span>
          <p className="text-[0.75rem] font-mono text-regolith/60 mt-0.5">
            Fluid dynamic similarity metrics defining microgravity vs terrestrial regime
          </p>
        </div>
        {regime && (
          <span className="rounded-[3px] bg-earth/15 ring-1 ring-earth/30 px-2.5 py-1 text-[0.625rem] font-mono text-earth uppercase tracking-widest">
            {regime}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-[4px] bg-white/[0.03] ring-1 ring-white/10 p-3.5 hover:ring-white/25 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-[1.125rem] font-bold text-white">
                {item.symbol}
              </span>
              <span className="text-[0.625rem] font-mono text-regolith/50">{item.formula}</span>
            </div>
            <div className="text-[0.75rem] font-mono text-regolith/80 uppercase mt-0.5">{item.name}</div>

            <div className={`mt-2 font-display text-[1.5rem] ${item.color} leading-tight`}>
              {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
            </div>

            <div className="mt-2 text-[0.75rem] text-regolith/60 leading-tight font-sans">
              {item.description}
            </div>
            <div className="mt-1 text-[0.6875rem] font-mono text-regolith/80">
              &bull; {item.interpretation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

