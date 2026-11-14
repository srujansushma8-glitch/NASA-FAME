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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-[#090D16]/60 p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal-800 border border-border text-slate-400 mb-4">
        {icon === "error" ? (
          <AlertCircle className="h-6 w-6 text-rose-400" />
        ) : (
          <FolderOpen className="h-6 w-6 text-slate-400" />
        )}
      </div>

      <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-slate-400 leading-relaxed">{description}</p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-charcoal-700 hover:bg-charcoal-600 border border-border px-4 py-2 text-xs font-mono font-medium text-white transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function LoadingSpinner({ message = "Computing fluid dynamic combustion models..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-electric" />
      <span className="font-mono text-xs text-slate-400 tracking-wide">{message}</span>
    </div>
  );
}

