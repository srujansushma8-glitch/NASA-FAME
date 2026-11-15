"use client";
import React from "react";

interface AeroPanelProps {
  title?: string;
  badge?: string;
  badgeColor?: "blue" | "orange" | "green" | "red";
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
  noPadding?: boolean;
}

export function AeroPanel({ title, badge, badgeColor = "blue", children, className = "", headerRight, noPadding = false }: AeroPanelProps) {
  const badgeColors = { blue: "#16A9FF", orange: "#FF7628", green: "#38D996", red: "#FF4545" };
  const accent = badgeColors[badgeColor];
  return (
    <div className={`relative bg-[#0A1428]/90 backdrop-blur-md border border-[#16A9FF]/20 rounded-sm overflow-hidden ${className}`}>
      <div className="brackets text-[#16A9FF]/15 absolute inset-0 pointer-events-none" />
      <div style={{ background: `linear-gradient(90deg, ${accent}60 0%, transparent 60%)` }} className="h-[1px] w-full" />
      {(title || badge || headerRight) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#16A9FF]/10">
          <div className="flex items-center gap-3">
            {badge && (
              <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm border" style={{ color: accent, borderColor: `${accent}50`, background: `${accent}12` }}>
                {badge}
              </span>
            )}
            {title && <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#16A9FF]/80">{title}</span>}
          </div>
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-4"}>{children}</div>
    </div>
  );
}
