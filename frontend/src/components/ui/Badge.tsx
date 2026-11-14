import React from "react";
import { ExperimentStatus, FlameShape } from "@/types";

interface BadgeProps {
  status?: ExperimentStatus | string;
  shape?: FlameShape | string;
  children?: React.ReactNode;
}

export function StatusBadge({ status }: { status: ExperimentStatus | string }) {
  const getStyles = () => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-950/60 text-emerald-400 border-emerald-700/50";
      case "RUNNING":
        return "bg-electric-950/60 text-electric-400 border-electric-700/50 animate-pulse";
      case "PENDING":
        return "bg-amber-950/60 text-amber-400 border-amber-700/50";
      case "FAILED":
        return "bg-rose-950/60 text-rose-400 border-rose-700/50";
      default:
        return "bg-charcoal-700 text-slate-300 border-border";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-mono font-semibold border ${getStyles()}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function FlameShapeBadge({ shape }: { shape: FlameShape | string }) {
  const getStyles = () => {
    switch (shape) {
      case "SPHERICAL":
        return "bg-electric-950/60 text-electric-300 border-electric-700/50";
      case "TRANSITIONAL":
        return "bg-amber-950/60 text-amber-300 border-amber-700/50";
      case "TEARDROP":
        return "bg-flame-950/60 text-flame-300 border-flame-700/50";
      case "EXTINCT":
        return "bg-slate-900 text-slate-400 border-slate-700";
      default:
        return "bg-charcoal-800 text-slate-300 border-border";
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-mono font-medium border ${getStyles()}`}
    >
      {shape}
    </span>
  );
}

