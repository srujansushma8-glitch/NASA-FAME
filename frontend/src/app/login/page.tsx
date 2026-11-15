"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ShieldCheck, AlertTriangle, Flame } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

function LoginContent() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";
  const emailParam = searchParams.get("email");

  const [email, setEmail] = useState(emailParam || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTarget);
    }
  }, [isAuthenticated, router, redirectTarget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Investigator email and security access key are required.");
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

  const field =
    "w-full rounded bg-ink px-4 py-3 text-xs font-mono text-stone-light border border-stone-border outline-none placeholder:text-stone-muted focus:border-cobalt transition-colors";

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center py-20 px-4 sm:px-6 md:px-8 overflow-hidden bg-ink">
      {/* Background Atmosphere */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cobalt/10 blur-[130px] pointer-events-none" />

      <div className="relative w-full max-w-md z-10 space-y-6">
        {/* Header & Wordmark */}
        <div className="text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-display text-sm tracking-[0.25em] text-white hover:opacity-80 transition-opacity"
          >
            <div className="size-6 rounded bg-cobalt/20 border border-cobalt/50 flex items-center justify-center text-cobalt">
              <Flame className="size-3.5 text-cobalt" />
            </div>
            <span>NASA-FLAME</span>
          </Link>

          <div className="space-y-1.5 pt-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
              Mission Control Access
            </h1>
            <p className="font-mono text-xs text-stone-dim uppercase tracking-wider">
              ISS Combustion Integrated Rack · Flight Station Portal
            </p>
          </div>
        </div>

        {/* Clearance indicator */}
        <div className="flex items-center justify-between p-3.5 rounded bg-ink-surface border border-stone-border/60 font-mono text-[10px] tracking-widest text-stone-dim uppercase">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-cobalt animate-ping" />
            <span className="text-stone-light">CLEARANCE: CIR FLIGHT LEVEL 4</span>
          </div>
          <span className="text-cobalt font-semibold">API: 8000 NOMINAL</span>
        </div>

        {/* Authentication Card */}
        <div className="rounded-lg bg-ink-surface p-6 sm:p-8 space-y-6 border border-stone-border shadow-2xl">
          {error && (
            <div className="p-3.5 rounded bg-ink border border-flame/60 text-xs text-stone-light flex items-start gap-2.5 font-mono">
              <AlertTriangle className="size-4 text-flame mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="mb-1.5 block font-mono text-xs text-stone-dim uppercase tracking-wider">
                Investigator Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="commander@nasa-flame.gov"
                required
                className={field}
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-xs text-stone-dim uppercase tracking-wider">
                  Operational Access Key
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
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className={field}
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-stone-dim">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-3.5 rounded bg-ink border-stone-border accent-[#2B4BFF]"
                />
                <span>Maintain session token (72h)</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 w-full rounded bg-cobalt hover:bg-cobalt-hover py-3 font-mono text-xs uppercase tracking-widest font-semibold text-white transition-all shadow-[0_0_20px_rgba(43,75,255,0.35)] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="size-3.5 rounded-full border border-white border-t-transparent animate-spin" />
                  <span>Validating Clearance...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ShieldCheck className="size-4" />
                  <span>Authenticate &amp; Enter Console</span>
                </span>
              )}
            </button>
          </form>

          {/* Institutional Test Accounts */}
          <div className="pt-4 border-t border-stone-border/60 space-y-3">
            {/* 1-Click Instant Demo Access Button */}
            <button
              type="button"
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  await login("commander@nasa-flame.gov", "MissionControl!", true);
                  router.push(redirectTarget);
                } catch {
                  setEmail("commander@nasa-flame.gov");
                  setPassword("MissionControl!");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded bg-cobalt/10 border border-cobalt/50 hover:bg-cobalt/25 text-white font-mono text-xs uppercase tracking-widest font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(43,75,255,0.2)]"
            >
              <Flame className="size-3.5 text-cobalt animate-pulse" />
              <span>Instant Demo Access (1-Click)</span>
            </button>

            <span className="font-mono text-[10px] tracking-widest text-stone-muted uppercase block text-center">
              Pre-Configured Test Clearances
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("commander@nasa-flame.gov", "MissionControl!")}
                className="p-2.5 rounded bg-ink hover:bg-ink-elevated border border-stone-border text-left font-mono text-[11px] transition-colors"
              >
                <div className="text-cobalt font-bold uppercase">Flight Director</div>
                <div className="text-stone-dim text-[10px] truncate">commander@nasa-flame.gov</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("dietrich@nasa.gov", "CombustionPhysics2026")}
                className="p-2.5 rounded bg-ink hover:bg-ink-elevated border border-stone-border text-left font-mono text-[11px] transition-colors"
              >
                <div className="text-stone-light font-bold uppercase">Lead Scientist</div>
                <div className="text-stone-dim text-[10px] truncate">dietrich@nasa.gov</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Subtext */}
        <div className="text-center font-mono text-[10px] text-stone-muted uppercase tracking-wider">
          ISS Combustion Integrated Rack · All Communications Ground Encrypted
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center font-mono text-xs text-stone-dim uppercase">
          Loading Mission Control...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
