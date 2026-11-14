"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Activity, Compass, Cpu, History, Play, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { HealthResponse } from "@/types";

export function Navbar() {
  const pathname = usePathname();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkHealth() {
      try {
        const res = await api.getHealth();
        if (mounted) {
          setHealth(res);
          setIsBackendHealthy(res.status === "healthy");
        }
      } catch {
        if (mounted) {
          setIsBackendHealthy(false);
        }
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Activity },
    { href: "/workspace", label: "Workspace", icon: Compass },
    { href: "/simulations", label: "Simulations", icon: Play },
    { href: "/assistant", label: "AI Assistant", icon: Cpu },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-[#080B12]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-charcoal-700 border border-electric/30 group-hover:border-electric transition-colors shadow-sm shadow-electric/20">
            <Flame className="h-6 w-6 text-flame animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-base font-extrabold tracking-wider text-white">
                NASA<span className="text-flame">FLAME</span>
              </span>
              <span className="rounded bg-electric/10 px-1.5 py-0.5 text-[10px] font-mono text-electric-400 border border-electric/20 font-medium">
                v1.0
              </span>
            </div>
            <p className="text-[11px] font-mono tracking-tight text-slate-400">
              Flame in Freefall
            </p>
          </div>
        </Link>

        {/* Primary Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? "bg-charcoal-700 text-electric-400 border border-electric/30 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-charcoal-800"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-electric-400" : "text-slate-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side status & action */}
        <div className="flex items-center gap-3">
          {/* Backend Status Indicator */}
          <div
            className={`hidden sm:flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-mono border ${
              isBackendHealthy === true
                ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40"
                : isBackendHealthy === false
                ? "bg-rose-950/40 text-rose-400 border-rose-800/40"
                : "bg-charcoal-800 text-slate-400 border-border"
            }`}
            title={
              isBackendHealthy === true
                ? `FastAPI Backend Online (${health?.environment || "ready"})`
                : "FastAPI Backend Connection Failed"
            }
          >
            {isBackendHealthy === true ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>API: ONLINE</span>
              </>
            ) : isBackendHealthy === false ? (
              <>
                <AlertCircle className="h-3 w-3 text-rose-400" />
                <span>API: OFFLINE</span>
              </>
            ) : (
              <span>CONNECTING...</span>
            )}
          </div>

          <Link
            href="/workspace"
            className="flex items-center gap-1.5 rounded-lg bg-electric hover:bg-electric-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-electric/25 transition-colors font-mono"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>RUN SIM</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

