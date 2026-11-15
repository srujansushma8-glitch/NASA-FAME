"use client";

import React, { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/content";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { HealthResponse } from "@/types";
import { Activity, Compass, Play, Cpu, History, Flame, LogOut, Menu, X } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const res = await api.getHealth();
        if (mounted) setHealth(res);
      } catch {
        if (mounted) setHealth(null);
      }
    }
    check();
    const id = setInterval(check, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const internalLinks = [
    { href: "/dashboard", label: "DASHBOARD", icon: Activity },
    { href: "/workspace", label: "WORKSPACE", icon: Compass },
    { href: "/simulations", label: "SIMULATIONS", icon: Play },
    { href: "/assistant", label: "AI ANALYZER", icon: Cpu },
    { href: "/history", label: "HISTORY", icon: History },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 text-stone bg-ink/90 backdrop-blur-md border-b border-stone-border/50 transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full">
        {/* Brand identity */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-transform hover:opacity-90 group"
          aria-label={`${brand.name} — return to top`}
        >
          <div className="size-7 rounded bg-cobalt/15 border border-cobalt/40 flex items-center justify-center text-cobalt group-hover:border-cobalt transition-colors">
            <Flame className="size-4 text-cobalt" />
          </div>
          <span className="font-display text-sm font-bold tracking-[0.22em] text-white uppercase">
            {brand.wordmark}
          </span>
          <span className="hidden sm:inline-block font-mono text-[10px] tracking-widest text-stone-muted uppercase ml-1.5 px-2 py-0.5 rounded bg-ink-surface border border-stone-border/30">
            CIR / 0.00G
          </span>
        </Link>

        {/* Global Navigation Items */}
        <nav aria-label="Application Modules" className="hidden items-center gap-1 md:flex">
          {internalLinks.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-cobalt/15 text-white border border-cobalt/60 shadow-[0_0_12px_rgba(43,75,255,0.25)]"
                    : "text-stone hover:bg-stone/10 hover:text-white"
                }`}
              >
                <Icon className={`size-3.5 ${isActive ? "text-cobalt" : "text-stone-dim"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side: Status and Auth */}
        <div className="flex items-center gap-3">
          {/* Health indicator */}
          <div
            className="hidden lg:flex items-center gap-2 font-mono text-[10px] tracking-widest px-2.5 py-1 rounded bg-ink-surface border border-stone-border/40 text-stone-dim"
            title={health ? `API Online: ${health.status}` : "API Offline"}
          >
            <span
              className={`size-2 rounded-full ${
                health?.status === "healthy"
                  ? "bg-cobalt animate-pulse"
                  : "bg-flame"
              }`}
            />
            <span className="text-stone-light">
              {health?.status === "healthy" ? "SYS NOMINAL" : "CONNECTING..."}
            </span>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline font-mono text-xs text-stone-light font-medium px-2.5 py-1 rounded bg-ink-surface border border-stone-border/40">
                {user?.name || user?.email}
              </span>
              <button
                onClick={logout}
                className="p-1.5 rounded hover:bg-stone/10 text-stone-dim hover:text-white transition-colors"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded bg-cobalt hover:bg-cobalt-hover text-white font-mono text-xs uppercase tracking-widest font-semibold transition-all shadow-[0_0_15px_rgba(43,75,255,0.3)]"
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded hover:bg-stone/10 text-stone-light"
            aria-label="Toggle navigation"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {open && (
        <div className="md:hidden bg-ink-surface border-b border-stone-border px-4 py-4 space-y-2">
          {internalLinks.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded font-mono text-xs uppercase tracking-wider ${
                  isActive
                    ? "bg-cobalt/20 text-white border border-cobalt/50"
                    : "text-stone hover:bg-stone/10"
                }`}
              >
                <Icon className={`size-4 ${isActive ? "text-cobalt" : "text-stone-dim"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
