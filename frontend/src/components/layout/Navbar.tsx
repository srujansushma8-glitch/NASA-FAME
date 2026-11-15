"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/content";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { HealthResponse } from "@/types";
import { Activity, Compass, Play, Cpu, History, Flame, LogOut, Menu, X, ArrowRight } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isLogin = pathname === "/login";
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

  const landingLinks = [
    { href: "#science", label: "01 // SCIENCE" },
    { href: "#regimes", label: "02 // REGIMES" },
    { href: "#explorer", label: "03 // 3D EXPLORER" },
    { href: "#workflow", label: "04 // WORKFLOW" },
    { href: "#ai-safety", label: "05 // AI SAFETY" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 text-stone bg-[#07090E]/90 backdrop-blur-md border-b border-stone-border/40 transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full">
        {/* Brand identity */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-transform hover:opacity-90 group"
          aria-label={`${brand.name} — return to top`}
        >
          <div className="size-7 rounded bg-cobalt/15 border border-cobalt/40 flex items-center justify-center text-cobalt group-hover:border-cobalt transition-colors shadow-[0_0_12px_rgba(43,75,255,0.25)]">
            <Flame className="size-4 text-cobalt" />
          </div>
          <span className="font-display text-sm font-bold tracking-[0.22em] text-white uppercase">
            {brand.wordmark}
          </span>
          <span className="hidden sm:inline-block font-mono text-[10px] tracking-widest text-stone-muted uppercase ml-1.5 px-2 py-0.5 rounded bg-ink-surface border border-stone-border/30">
            CIR / 0.00G
          </span>
        </Link>

        {/* Navigation Items: Context-Aware */}
        <nav aria-label="Application Modules" className="hidden items-center gap-1 md:flex">
          {isLanding ? (
            // Landing Page Section Links
            <div className="flex items-center gap-4 text-xs font-mono tracking-widest text-stone-dim">
              {landingLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-2.5 py-1 rounded hover:text-white hover:bg-stone/10 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          ) : isLogin ? (
            // Login Page Header Marker
            <div className="font-mono text-xs text-stone-dim tracking-widest uppercase flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-cobalt animate-ping" />
              <span>FLIGHT CLEARANCE GATEWAY</span>
            </div>
          ) : (
            // Interior Authenticated Module Links
            internalLinks.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 group ${
                    isActive
                      ? "bg-cobalt/20 text-white border border-cobalt/70 shadow-[0_0_16px_rgba(43,75,255,0.35)]"
                      : "text-stone hover:bg-stone/10 hover:text-white hover:border-cobalt/40 border border-transparent hover:shadow-[0_0_12px_rgba(43,75,255,0.18)]"
                  }`}
                >
                  <Icon className={`size-3.5 transition-colors ${isActive ? "text-cobalt" : "text-stone-dim group-hover:text-cobalt"}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-[-1px] left-3 right-3 h-[2px] bg-cobalt rounded-full shadow-[0_0_8px_#2B4BFF]" />
                  )}
                </Link>
              );
            })
          )}
        </nav>

        {/* Right side: Health & Clearance Button */}
        <div className="flex items-center gap-3">
          {/* Health indicator */}
          <div
            className="hidden lg:flex items-center gap-2 font-mono text-[10px] tracking-widest px-2.5 py-1 rounded bg-ink-surface border border-stone-border/40 text-stone-dim"
            title={health ? `API Online: ${health.status}` : "API Offline"}
          >
            <span
              className={`size-2 rounded-full ${
                health?.status === "healthy"
                  ? "bg-cobalt animate-pulse shadow-[0_0_8px_#2B4BFF]"
                  : "bg-flame"
              }`}
            />
            <span className="text-stone-light">
              {health?.status === "healthy" ? "SYS NOMINAL" : "CONNECTING..."}
            </span>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs text-stone-light font-medium px-2.5 py-1 rounded bg-ink-surface border border-stone-border/40 hover:border-cobalt/60 transition-colors"
              >
                <span className="size-1.5 rounded-full bg-cobalt" />
                <span>{user?.name || user?.email}</span>
              </Link>
              <button
                onClick={logout}
                className="p-1.5 rounded hover:bg-stone/10 text-stone-dim hover:text-white transition-colors"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : isLogin ? (
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded border border-stone-border/60 hover:bg-stone/10 text-stone hover:text-white font-mono text-xs uppercase tracking-widest transition-all"
            >
              Launch Page
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 rounded bg-cobalt hover:bg-cobalt-hover text-white font-mono text-xs uppercase tracking-widest font-semibold transition-all shadow-[0_0_15px_rgba(43,75,255,0.35)] flex items-center gap-2"
            >
              <span>Sign In</span>
              <ArrowRight className="size-3.5" />
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
          {isLanding
            ? landingLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded font-mono text-xs uppercase tracking-wider text-stone hover:bg-stone/10 hover:text-white"
                >
                  {item.label}
                </a>
              ))
            : internalLinks.map((item) => {
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
          {!isAuthenticated && isLanding && (
            <div className="pt-2 border-t border-stone-border/40">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-cobalt text-white font-mono text-xs uppercase tracking-widest font-semibold"
              >
                <span>Enter Mission Control</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
