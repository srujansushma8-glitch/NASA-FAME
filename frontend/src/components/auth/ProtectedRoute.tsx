"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ShieldAlert, Compass } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-2 border-electric/20 border-t-electric animate-spin" />
          <Compass className="h-6 w-6 text-electric-400 absolute inset-0 m-auto" />
        </div>
        <div className="font-mono text-xs text-slate-400 tracking-widest uppercase animate-pulse">
          VERIFYING MISSION CLEARANCE // STANDBY...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

