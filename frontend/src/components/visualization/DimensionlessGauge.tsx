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
    <div className="flex flex-col rounded-xl border border-border bg-[#090D16] p-4 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div>
          <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
            Dimensionless Scaling Numbers (Member 3 AI Engine)
          </span>
          <p className="text-[11px] font-mono text-slate-400">
            Fluid dynamic similarity metrics defining microgravity vs terrestrial regime
          </p>
        </div>
        {regime && (
          <span className="rounded bg-electric-950/60 border border-electric-700/50 px-2.5 py-1 text-[11px] font-mono text-electric-300">
            {regime}
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-lg bg-charcoal-800/80 border border-border/60 p-3 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg font-extrabold text-white">
                {item.symbol}
              </span>
              <span className="text-[10px] font-mono text-slate-500">{item.formula}</span>
            </div>
            <div className="text-xs font-medium text-slate-300 mt-0.5">{item.name}</div>

            <div className={`mt-2 font-mono text-xl font-bold ${item.color}`}>
              {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
            </div>

            <div className="mt-2 text-[10px] text-slate-400 leading-tight">
              {item.description}
            </div>
            <div className="mt-1 text-[10px] font-mono text-slate-300 font-medium">
              &bull; {item.interpretation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

