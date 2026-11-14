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
    <div className="group relative flex flex-col rounded-[6px] bg-void-2 p-5 ring-1 ring-white/10 transition-[transform,box-shadow] duration-300 hover:ring-white/20">
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
