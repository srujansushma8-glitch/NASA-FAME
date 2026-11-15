"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  Mail,
  KeyRound,
  Orbit,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoadingSpinner } from "@/components/ui/EmptyState";

function LoginContent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [redirectTarget, setRedirectTarget] = useState("/dashboard");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const target = params.get("redirect");
      if (target) setRedirectTarget(target);
    }
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Investigator email and operational access key are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password.trim(), rememberMe);
      router.push(redirectTarget);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Authentication failed. Please verify credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  const handleInstantDemoLogin = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await login("commander@nasa-flame.gov", "MissionControl!", true);
      router.push(redirectTarget);
    } catch {
      setEmail("commander@nasa-flame.gov");
      setPassword("MissionControl!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const field =
    "w-full rounded bg-ink/90 px-4 py-3 text-xs font-mono text-stone-light border border-stone-border/60 outline-none placeholder:text-stone-muted focus:border-cobalt focus:shadow-[0_0_15px_rgba(43,75,255,0.25)] transition-all";

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4 sm:px-6 md:px-8">
      {/* Cockpit Atmosphere Radial Backdrop */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] bg-cobalt/10 blur-[140px] pointer-events-none" />
      <div className="absolute right-1/4 bottom-1/4 w-[400px] h-[400px] bg-flame/10 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md z-10 space-y-6">
        {/* Header & NASA-FLAME Wordmark */}
        <div className="text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-display text-sm tracking-[0.25em] text-white hover:opacity-85 transition-opacity group"
          >
            <div className="size-7 rounded bg-cobalt/15 border border-cobalt/50 flex items-center justify-center text-cobalt group-hover:border-cobalt transition-colors shadow-[0_0_12px_rgba(43,75,255,0.3)]">
              <Flame className="size-4 text-cobalt" />
            </div>
            <span>NASA-FLAME</span>
          </Link>

          <div className="space-y-1.5 pt-1">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
              {isAuthenticated ? "Session Established" : "Welcome back, Commander"}
            </h1>
            <p className="font-mono text-xs text-stone-dim uppercase tracking-wider">
              {isAuthenticated
                ? "Active flight clearance ready for deployment"
                : "Enter credentials to access ISS CIR research systems"}
            </p>
          </div>
        </div>

        {/* Clearance indicator */}
        <div className="flex items-center justify-between p-3.5 rounded bg-ink-surface/80 backdrop-blur-md border border-stone-border/50 font-mono text-[10px] tracking-widest text-stone-dim uppercase shadow-lg">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-cobalt animate-ping" />
            <span className="text-stone-light">CIR FLIGHT LEVEL 4 GATEWAY</span>
          </div>
          <span className="text-cobalt font-semibold">API: 8000 NOMINAL</span>
        </div>

        {/* Condition 1: User Already Has Active Clearance */}
        {isAuthenticated && user ? (
          <div className="rounded-xl bg-ink-surface/85 backdrop-blur-xl p-6 sm:p-8 space-y-6 border border-stone-border/70 shadow-[0_0_50px_rgba(0,0,0,0.85)]">
            <div className="flex items-center gap-3.5">
              <div className="size-11 rounded-full bg-cobalt/20 border border-cobalt/60 flex items-center justify-center text-cobalt shadow-[0_0_15px_rgba(43,75,255,0.35)]">
                <CheckCircle2 className="size-6 text-cobalt" />
              </div>
              <div>
                <div className="font-mono text-[10px] text-cobalt font-bold tracking-widest uppercase">
                  Active Mission Clearance Verified
                </div>
                <div className="font-display text-lg text-white font-bold tracking-wide">
                  {user.name}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded bg-ink/80 border border-stone-border/40 font-mono text-xs text-stone-dim space-y-1.5">
              <div className="flex justify-between">
                <span>CLEARANCE:</span>
                <span className="text-cobalt font-semibold">{user.clearance_level || "LEVEL 4"}</span>
              </div>
              <div className="flex justify-between">
                <span>ROLE:</span>
                <span className="text-stone-light">{user.role || "Flight Commander"}</span>
              </div>
              <div className="flex justify-between">
                <span>STATION:</span>
                <span className="text-stone-light">{user.station || "ISS CIR ACME"}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href={redirectTarget}
                className="w-full py-3.5 rounded bg-cobalt hover:bg-cobalt-hover text-white font-mono text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(43,75,255,0.45)] hover:shadow-[0_0_40px_rgba(43,75,255,0.7)] transition-all"
              >
                <span>Proceed to Mission Control</span>
                <ArrowRight className="size-4" />
              </Link>
              <button
                onClick={() => logout()}
                className="w-full py-2.5 rounded bg-ink hover:bg-stone/10 border border-stone-border/40 text-stone-dim hover:text-white font-mono text-xs uppercase tracking-widest transition-all"
              >
                Switch Station Account / Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* Condition 2: Authentication Form */
          <div className="rounded-xl bg-ink-surface/85 backdrop-blur-xl p-6 sm:p-8 space-y-6 border border-stone-border/70 shadow-[0_0_50px_rgba(0,0,0,0.85)]">
            {error && (
              <div className="p-3.5 rounded bg-ink border border-flame/60 text-xs text-stone-light flex items-start gap-2.5 font-mono">
                <AlertTriangle className="size-4 text-flame mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username / Email Address */}
              <div>
                <label className="mb-1.5 block font-mono text-xs text-stone-dim uppercase tracking-wider">
                  Username / Investigator Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="commander@nasa-flame.gov"
                    required
                    className={field}
                  />
                  <Mail className="size-4 text-stone-muted absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Password Field with Show/Hide */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-mono text-xs text-stone-dim uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="font-mono text-[10px] tracking-wider text-stone-dim hover:text-cobalt transition-colors flex items-center gap-1 uppercase"
                  >
                    {showPassword ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                    <span>{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className={field}
                  />
                  <Lock className="size-4 text-stone-muted absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-stone-dim">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="size-3.5 rounded bg-ink border-stone-border accent-[#2B4BFF]"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Cryptographic Clearance Recovery: Contact NASA CIR Flight Communications at mission-control@nasa-flame.gov or use Pre-Configured Flight Clearances below."
                    )
                  }
                  className="font-mono text-[11px] text-stone-dim hover:text-cobalt transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* SIGN IN Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-3 w-full rounded bg-cobalt hover:bg-cobalt-hover py-3.5 font-mono text-xs uppercase tracking-widest font-semibold text-white transition-all shadow-[0_0_25px_rgba(43,75,255,0.4)] hover:shadow-[0_0_40px_rgba(43,75,255,0.65)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="size-3.5 rounded-full border border-white border-t-transparent animate-spin" />
                    <span>AUTHENTICATING CLEARANCE...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" />
                    <span>SIGN IN</span>
                  </>
                )}
              </button>

              {/* Registration Option */}
              <div className="text-center pt-1 font-mono text-xs text-stone-dim">
                <span>New Investigator? </span>
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Research Station Registration: Select any pre-configured institutional clearance below to immediately initialize an accredited research session."
                    )
                  }
                  className="text-cobalt hover:underline font-semibold"
                >
                  Request Clearance / Register
                </button>
              </div>
            </form>

            {/* Institutional Clearances & 1-Click Demo */}
            <div className="pt-4 border-t border-stone-border/50 space-y-3">
              {/* 1-Click Instant Demo Button */}
              <button
                type="button"
                onClick={handleInstantDemoLogin}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded bg-cobalt/15 border border-cobalt/60 hover:bg-cobalt/25 text-white font-mono text-xs uppercase tracking-widest font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(43,75,255,0.25)]"
              >
                <Flame className="size-3.5 text-cobalt animate-pulse" />
                <span>Instant Demo Access (1-Click)</span>
              </button>

              <span className="font-mono text-[10px] tracking-widest text-stone-muted uppercase block text-center">
                Pre-Configured Flight Clearances
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill("commander@nasa-flame.gov", "MissionControl!")}
                  className="p-2.5 rounded bg-ink/90 hover:bg-ink-elevated border border-stone-border/40 hover:border-cobalt/50 text-left font-mono text-[11px] transition-colors"
                >
                  <div className="text-cobalt font-bold uppercase">Flight Director</div>
                  <div className="text-stone-dim text-[10px] truncate">commander@nasa-flame.gov</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("dietrich@nasa.gov", "CombustionPhysics2026")}
                  className="p-2.5 rounded bg-ink/90 hover:bg-ink-elevated border border-stone-border/40 hover:border-cobalt/50 text-left font-mono text-[11px] transition-colors"
                >
                  <div className="text-stone-light font-bold uppercase">Lead Scientist</div>
                  <div className="text-stone-dim text-[10px] truncate">dietrich@nasa.gov</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Subtext */}
        <div className="text-center font-mono text-[10px] text-stone-muted uppercase tracking-wider">
          ISS CIR Combustion Integrated Rack · Communications Ground Encrypted
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginContent />;
}
