"use client";
import React from "react";

interface AeroStatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  variant?: "blue" | "orange" | "green" | "red" | "slate";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
}

export function AeroStatCard({ label, value, unit, sub, icon: Icon, variant = "blue", size = "md", glow = false }: AeroStatCardProps) {
  const colors = {
    blue: { text: "#16A9FF", border: "#16A9FF30", glow: "rgba(22,169,255,0.15)" },
    orange: { text: "#FF7628", border: "#FF762830", glow: "rgba(255,118,40,0.15)" },
    green: { text: "#38D996", border: "#38D99630", glow: "rgba(56,217,150,0.15)" },
    red: { text: "#FF4545", border: "#FF454530", glow: "rgba(255,69,69,0.15)" },
    slate: { text: "#94A3B8", border: "#94A3B830", glow: "rgba(148,163,184,0.1)" },
  };
  const c = colors[variant];
  const valSize = size === "lg" ? "text-4xl" : size === "sm" ? "text-xl" : "text-3xl";
  return (
    <div
      className="relative bg-[#101D32]/80 border rounded-sm p-4 overflow-hidden transition-all hover:-translate-y-0.5"
      style={{ borderColor: c.border, boxShadow: glow ? `0 0 20px ${c.glow}` : undefined }}
    >
      <div className="brackets text-[#16A9FF]/15 absolute inset-0 pointer-events-none" />
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">{label}</span>
        {Icon && <Icon className="w-4 h-4" style={{ color: c.text }} />}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`font-mono font-bold text-white ${valSize} tabular-nums`}>{value}</span>
        {unit && <span className="font-mono text-xs" style={{ color: c.text }}>{unit}</span>}
      </div>
      {sub && <p className="font-mono text-[9px] text-slate-500 mt-1 uppercase tracking-wider">{sub}</p>}
    </div>
  );
}
