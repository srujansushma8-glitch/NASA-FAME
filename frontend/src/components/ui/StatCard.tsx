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
  const accentColor =
    variant === "flame"
      ? "text-flame"
      : variant === "emerald"
      ? "text-emerald-400"
      : variant === "amber"
      ? "text-amber-400"
      : "text-earth";

  return (
    <div className="group relative flex flex-col rounded-xl bg-ink-surface/80 backdrop-blur-xl border border-stone-border/40 hover:border-cobalt/60 p-5 shadow-[0_4px_25px_rgba(0,0,0,0.5)] hover:shadow-[0_4px_30px_rgba(43,75,255,0.18)] hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="font-mono text-label text-regolith/60 uppercase tracking-[0.14em]">
          {title}
        </span>
        {Icon && (
          <div className="size-7 flex items-center justify-center rounded-[4px] bg-white/[0.04] ring-1 ring-white/10 text-regolith/80 group-hover:text-white transition-colors">
            <Icon className="size-3.5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-[2rem] leading-none text-white tracking-wide">
          {value}
        </span>
        {unit && (
          <span className={`font-mono text-label ${accentColor} uppercase tracking-[0.14em]`}>
            {unit}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-[0.8125rem] text-regolith/60 leading-normal font-sans">
          {subtitle}
        </p>
      )}
    </div>
  );
}
