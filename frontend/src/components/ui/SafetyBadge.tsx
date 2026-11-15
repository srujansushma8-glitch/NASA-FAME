"use client";
import React from "react";

type SafetyLevel = "NOMINAL" | "CAUTION" | "HIGH_RISK" | "CRITICAL";

interface SafetyBadgeProps {
  level: SafetyLevel;
  compact?: boolean;
}

const config: Record<
  SafetyLevel,
  { color: string; bg: string; border: string; label: string; pulse: boolean }
> = {
  NOMINAL: {
    color: "#38D996",
    bg: "#38D99615",
    border: "#38D99640",
    label: "✓ NOMINAL",
    pulse: false,
  },
  CAUTION: {
    color: "#FFB020",
    bg: "#FFB02015",
    border: "#FFB02040",
    label: "⚠ CAUTION",
    pulse: false,
  },
  HIGH_RISK: {
    color: "#FF7628",
    bg: "#FF762815",
    border: "#FF762840",
    label: "! HIGH RISK",
    pulse: false,
  },
  CRITICAL: {
    color: "#FF4545",
    bg: "#FF454515",
    border: "#FF454540",
    label: "✕ CRITICAL",
    pulse: true,
  },
};

export function SafetyBadge({ level, compact = false }: SafetyBadgeProps) {
  const c = config[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-bold uppercase tracking-widest rounded-sm border ${
        c.pulse ? "animate-pulse" : ""
      } ${compact ? "text-[9px] px-2 py-0.5" : "text-[11px] px-3 py-1"}`}
      style={{ color: c.color, background: c.bg, borderColor: c.border }}
    >
      {c.label}
    </span>
  );
}

export type { SafetyLevel };
