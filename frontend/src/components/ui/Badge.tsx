import React from "react";
import { ExperimentStatus, FlameShape } from "@/types";

export function StatusBadge({ status }: { status: ExperimentStatus | string }) {
  const getStyles = () => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-950/40 text-emerald-400 ring-emerald-500/30";
      case "RUNNING":
        return "bg-earth/20 text-earth ring-earth/40 animate-pulse";
      case "PENDING":
        return "bg-amber-950/40 text-amber-300 ring-amber-500/30";
      case "FAILED":
        return "bg-rose-950/40 text-rose-300 ring-rose-500/30";
      default:
        return "bg-white/[0.04] text-regolith/80 ring-white/10";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[3px] px-2 py-0.5 font-mono text-[0.625rem] tracking-[0.14em] uppercase ring-1 ${getStyles()}`}
    >
      <span className="size-1 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function FlameShapeBadge({ shape }: { shape: FlameShape | string }) {
  const getStyles = () => {
    switch (shape) {
      case "SPHERICAL":
        return "bg-earth/15 text-earth ring-earth/30";
      case "TRANSITIONAL":
        return "bg-amber-950/40 text-amber-300 ring-amber-500/30";
      case "TEARDROP":
        return "bg-flame/15 text-flame ring-flame/30";
      case "EXTINCT":
        return "bg-white/[0.03] text-regolith/50 ring-white/10";
      default:
        return "bg-white/[0.04] text-regolith/70 ring-white/10";
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-[3px] px-2 py-0.5 font-mono text-[0.625rem] tracking-[0.14em] uppercase ring-1 ${getStyles()}`}
    >
      {shape}
    </span>
  );
}
