import React from "react";
import { AlertCircle, FolderOpen, RefreshCw } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: "empty" | "error";
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = "empty",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[6px] bg-void-2/60 p-12 text-center ring-1 ring-white/10">
      <div className="flex size-10 items-center justify-center rounded-[4px] bg-white/[0.04] ring-1 ring-white/10 text-regolith/80 mb-4">
        {icon === "error" ? (
          <AlertCircle className="size-5 text-rose-400" />
        ) : (
          <FolderOpen className="size-5 text-regolith" />
        )}
      </div>

      <h3 className="font-display text-[1rem] tracking-[0.08em] text-white uppercase">{title}</h3>
      <p className="mt-2 max-w-sm text-[0.875rem] text-regolith/65 leading-relaxed font-sans">{description}</p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-[4px] bg-white px-4 py-2 font-mono text-label text-void uppercase transition-colors hover:bg-earth"
        >
          <RefreshCw className="size-3.5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function LoadingSpinner({
  message = "Computing fluid dynamic combustion models...",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-14 space-y-4">
      <div className="size-7 animate-spin rounded-full border border-earth border-t-transparent" />
      <span className="font-mono text-label text-regolith/70 uppercase tracking-[0.16em]">
        {message}
      </span>
    </div>
  );
}
