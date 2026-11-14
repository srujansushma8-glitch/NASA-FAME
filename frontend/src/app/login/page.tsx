"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ShieldCheck, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

function FlameMark({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M12 2C9.5 6 7 9.5 7 13.5C7 16.5 9.2 19 12 19C14.8 19 17 16.5 17 13.5C17 11.2 15.5 8.8 14 7C13.8 9.5 12 11 10.5 11.5C10.8 10 11.8 7.5 12 2Z"
        fill="#ff7029"
      />
      <circle cx="12" cy="14" r="2.5" fill="#6fb6ff" opacity="0.85" />
    </svg>
  );
}

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
    "w-full rounded-[4px] bg-white/[0.04] px-4 py-3.5 text-body text-white ring-1 ring-white/15 outline-none placeholder:text-regolith/40 focus:ring-earth transition-colors";

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center py-20 px-4 sm:px-6 md:px-[6vw] overflow-hidden bg-void">
      {/* Radiant combustion chemiluminescence horizon */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[40vw] left-1/2 size-[80vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_50%_30%,rgba(255,112,41,0.2),rgba(111,182,255,0.08)_50%,transparent_70%)]"
      />

      <div className="relative w-full max-w-lg z-10 space-y-8">
        {/* Header & Wordmark */}
        <div className="text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-display text-sm tracking-[0.3em] text-white/80 hover:text-white transition-opacity"
          >
            <FlameMark className="size-5" />
            <span>NASA-FLAME</span>
          </Link>

          <div className="space-y-2 pt-2">
            <h1 className="font-display text-[1.75rem] md:text-[2.25rem] tracking-[0.06em] text-white uppercase">
              Mission Control Access
            </h1>
            <p className="font-mono text-label text-regolith/70 uppercase">
              ISS Combustion Integrated Rack · Flight Station Portal
            </p>
          </div>
        </div>

        {/* Telemetry Status Bar with .brackets */}
        <div className="brackets relative flex items-center justify-between p-4 bg-void-2 text-white/40 font-mono text-[0.625rem] tracking-[0.14em]">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-regolith/80 uppercase">CLEARANCE: CIR FLIGHT LEVEL 4</span>
          </div>
          <span className="text-earth uppercase">API PORT: 8000 NOMINAL</span>
        </div>

        {/* Authentication Card */}
        <div className="relative rounded-[8px] bg-void-2/80 p-6 sm:p-8 space-y-6 ring-1 ring-white/10 backdrop-blur-xl">
          {error && (
            <div className="p-3.5 rounded-[4px] bg-rose-950/60 ring-1 ring-rose-500/40 text-[0.8125rem] text-rose-300 flex items-start gap-2.5 font-mono">
              <AlertTriangle className="size-4 text-rose-400 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="mb-1.5 block font-mono text-label text-regolith/60 uppercase">
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
                <label className="font-mono text-label text-regolith/60 uppercase">
                  Operational Access Key
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="font-mono text-[0.625rem] tracking-[0.14em] text-regolith/60 hover:text-earth transition-colors flex items-center gap-1 uppercase"
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
              <label className="flex items-center gap-2 cursor-pointer font-mono text-label text-regolith/70 uppercase">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-3.5 rounded bg-void ring-1 ring-white/20 accent-earth"
                />
                <span>Maintain session token (72h)</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 w-full rounded-[4px] bg-white px-5 py-4 font-mono text-label text-void uppercase transition-colors hover:bg-earth disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="size-3.5 rounded-full border border-void border-t-transparent animate-spin" />
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

          {/* Quick Credential Helpers */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <span className="font-mono text-[0.625rem] tracking-[0.14em] text-regolith/50 uppercase block text-center">
              Institutional Test Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("commander@nasa-flame.gov", "MissionControl!")}
                className="p-2.5 rounded-[4px] bg-white/[0.03] hover:bg-white/[0.07] ring-1 ring-white/10 text-left font-mono text-[0.6875rem] transition-colors"
              >
                <div className="text-earth font-bold uppercase">Flight Director</div>
                <div className="text-regolith/60 truncate">commander@nasa-flame.gov</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("dietrich@nasa.gov", "CombustionPhysics2026")}
                className="p-2.5 rounded-[4px] bg-white/[0.03] hover:bg-white/[0.07] ring-1 ring-white/10 text-left font-mono text-[0.6875rem] transition-colors"
              >
                <div className="text-flame font-bold uppercase">Lead Scientist</div>
                <div className="text-regolith/60 truncate">dietrich@nasa.gov</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Subtext */}
        <div className="text-center font-mono text-label text-regolith/40 uppercase">
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
        <div className="min-h-[80vh] flex items-center justify-center font-mono text-label text-regolith/60 uppercase">
          Loading Mission Control...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
