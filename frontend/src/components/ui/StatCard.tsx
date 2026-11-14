import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: "electric" | "flame" | "emerald" | "amber" | "slate";
}

export function StatCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  variant = "electric",
}: StatCardProps) {
  const variantStyles = {
    electric: {
      border: "border-border hover:border-electric/50",
      iconBg: "bg-electric-950/50 text-electric-400 border border-electric/30",
      valueColor: "text-white",
    },
    flame: {
      border: "border-border hover:border-flame/50",
      iconBg: "bg-flame-950/50 text-flame-400 border border-flame/30",
      valueColor: "text-white",
    },
    emerald: {
      border: "border-border hover:border-emerald-500/50",
      iconBg: "bg-emerald-950/50 text-emerald-400 border border-emerald-500/30",
      valueColor: "text-white",
    },
    amber: {
      border: "border-border hover:border-amber-500/50",
      iconBg: "bg-amber-950/50 text-amber-400 border border-amber-500/30",
      valueColor: "text-white",
    },
    slate: {
      border: "border-border hover:border-slate-500/50",
      iconBg: "bg-charcoal-700 text-slate-300 border border-border",
      valueColor: "text-white",
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`flex flex-col rounded-xl bg-[#090D16] p-4 border ${style.border} transition-colors shadow-md`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-1.5 rounded-lg ${style.iconBg}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={`font-mono text-2xl font-bold tracking-tight ${style.valueColor}`}>
          {value}
        </span>
        {unit && <span className="font-mono text-xs text-slate-400 font-medium">{unit}</span>}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-400 leading-tight">{subtitle}</p>}
    </div>
  );
}

