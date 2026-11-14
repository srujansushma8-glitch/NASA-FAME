"use client";

import React, { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/content";
import { scrollToHash } from "@/lib/scroll";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { HealthResponse } from "@/types";
import { LogOut, Activity, Compass, Play, Cpu, History } from "lucide-react";

/** Flame / Crescent mark in pure SVG */
function FlameMark({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M12 2C9.5 6 7 9.5 7 13.5C7 16.5 9.2 19 12 19C14.8 19 17 16.5 17 13.5C17 11.2 15.5 8.8 14 7C13.8 9.5 12 11 10.5 11.5C10.8 10 11.8 7.5 12 2Z"
        fill="currentColor"
        className="text-flame"
      />
      <circle cx="12" cy="14" r="2.5" fill="#6fb6ff" opacity="0.85" />
    </svg>
  );
}

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

  const go = (e: MouseEvent<HTMLAnchorElement>, hash: string, then?: () => void) => {
    if (isLanding && hash.startsWith("#")) {
      e.preventDefault();
      then?.();
      scrollToHash(hash);
    }
  };

  const internalLinks = [
    { href: "/dashboard", label: "OVERVIEW", icon: Activity },
    { href: "/workspace", label: "WORKSPACE", icon: Compass },
    { href: "/simulations", label: "SIMULATIONS", icon: Play },
    { href: "/assistant", label: "AI ANALYZER", icon: Cpu },
    { href: "/history", label: "HISTORY", icon: History },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 text-white bg-void/90 backdrop-blur-md border-b border-white/10 transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:px-[4vw]">
        {/* Brand identity */}
        <Link
          href={isLanding ? "#top" : "/"}
          onClick={(e) => {
            if (isLanding) go(e, "#top");
          }}
          className="flex items-center gap-2.5 transition-transform hover:opacity-90"
          aria-label={`${brand.name} — return to top`}
        >
          <FlameMark className="size-5" />
          <span className="font-display text-[0.875rem] tracking-[0.32em] text-white">
            {brand.wordmark}
          </span>
          <span className="hidden sm:inline-block font-mono text-[0.625rem] tracking-[0.18em] text-regolith/50 uppercase ml-1">
            CIR / ACME
          </span>
        </Link>

        {/* Navigation items */}
        {isLanding ? (
          <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
            <a
              href="#log"
              onClick={(e) => go(e, "#log")}
              className="font-mono text-label text-white/75 uppercase transition-colors hover:text-white"
            >
              Research Log
            </a>
            <a
              href="#trajectory"
              onClick={(e) => go(e, "#trajectory")}
              className="font-mono text-label text-white/75 uppercase transition-colors hover:text-white"
            >
              Workflow
            </a>
            <a
              href="#capabilities"
              onClick={(e) => go(e, "#capabilities")}
              className="font-mono text-label text-white/75 uppercase transition-colors hover:text-white"
            >
              Capabilities
            </a>
            <a
              href="#manifest"
              onClick={(e) => go(e, "#manifest")}
              className="font-mono text-label text-white/75 uppercase transition-colors hover:text-white"
            >
              Access Window
            </a>
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              className="rounded-[4px] bg-white px-4 py-2 font-mono text-label text-void uppercase transition-colors hover:bg-earth"
            >
              {isAuthenticated && user
                ? `Console · ${user.name.split(" ")[0]}`
                : "Enter Mission Control"}
            </Link>
          </nav>
        ) : (
          <nav aria-label="Application Modules" className="hidden items-center gap-1.5 md:flex">
            {internalLinks.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-[4px] px-3 py-1.5 font-mono text-label uppercase transition-all ${
                    isActive
                      ? "bg-white/10 text-earth ring-1 ring-earth/40"
                      : "text-white/65 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Status indicator and user auth profile */}
        <div className="flex items-center gap-3">
          {/* Telemetry pill */}
          <div className="hidden sm:flex items-center gap-2 rounded-[3px] bg-white/[0.03] px-2.5 py-1 ring-1 ring-white/10 font-mono text-[0.625rem] tracking-[0.14em]">
            <span
              className={`size-1.5 rounded-full ${
                health?.status === "healthy"
                  ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  : "bg-amber-400"
              }`}
            />
            <span className="text-regolith/70 uppercase">
              {health?.status === "healthy" ? "ISS LINK: NOMINAL" : "OFFLINE"}
            </span>
          </div>

          {!isLanding && isAuthenticated && user && (
            <div className="flex items-center gap-2">
              <span className="hidden lg:inline-block font-mono text-label text-regolith/80 uppercase">
                {user.email}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                title="Disconnect session"
                className="flex items-center gap-1 rounded-[4px] bg-white/[0.05] px-2.5 py-1 font-mono text-label text-regolith/80 uppercase ring-1 ring-white/10 transition-colors hover:bg-rose-950/40 hover:text-rose-300 hover:ring-rose-500/40"
              >
                <LogOut className="size-3" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}

          {!isLanding && !isAuthenticated && (
            <Link
              href="/login"
              className="rounded-[4px] bg-earth px-3 py-1.5 font-mono text-label text-void uppercase transition-colors hover:bg-white"
            >
              Authenticate
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="font-mono text-label uppercase md:hidden text-regolith hover:text-white"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        id="mobile-menu"
        inert={!open}
        className={`fixed inset-0 top-16 -z-10 flex flex-col justify-center gap-6 bg-void/98 px-6 backdrop-blur-2xl transition-opacity md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {isLanding ? (
          <>
            <a
              href="#log"
              onClick={(e) => go(e, "#log", () => setOpen(false))}
              className="flex items-baseline gap-4 font-display text-[1.5rem] tracking-[0.14em] uppercase text-white"
            >
              <span className="font-mono text-label text-earth">01</span>
              Research Log
            </a>
            <a
              href="#trajectory"
              onClick={(e) => go(e, "#trajectory", () => setOpen(false))}
              className="flex items-baseline gap-4 font-display text-[1.5rem] tracking-[0.14em] uppercase text-white"
            >
              <span className="font-mono text-label text-earth">02</span>
              Workflow
            </a>
            <a
              href="#capabilities"
              onClick={(e) => go(e, "#capabilities", () => setOpen(false))}
              className="flex items-baseline gap-4 font-display text-[1.5rem] tracking-[0.14em] uppercase text-white"
            >
              <span className="font-mono text-label text-earth">03</span>
              Capabilities
            </a>
            <a
              href="#manifest"
              onClick={(e) => go(e, "#manifest", () => setOpen(false))}
              className="flex items-baseline gap-4 font-display text-[1.5rem] tracking-[0.14em] uppercase text-white"
            >
              <span className="font-mono text-label text-earth">04</span>
              Access Window
            </a>
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              onClick={() => setOpen(false)}
              className="mt-4 rounded-[4px] bg-white px-5 py-3 text-center font-mono text-label text-void uppercase transition-colors hover:bg-earth"
            >
              {isAuthenticated ? "Enter Mission Control" : "Authenticate & Login"}
            </Link>
          </>
        ) : (
          <>
            {internalLinks.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-4 font-display text-[1.5rem] tracking-[0.14em] uppercase text-white"
              >
                <span className="font-mono text-label text-earth">0{i + 1}</span>
                {item.label}
              </Link>
            ))}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="mt-6 rounded-[4px] bg-white/[0.08] px-5 py-3 font-mono text-label text-white uppercase ring-1 ring-white/20"
              >
                Terminate Session
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
}
