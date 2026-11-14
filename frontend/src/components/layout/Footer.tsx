import React from "react";
import Link from "next/link";
import { Flame, ShieldCheck, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-[#05070B] text-slate-400 py-10 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-flame" />
            <span className="font-mono text-sm font-bold text-white tracking-wider">
              NASA-FLAME &bull; Flame in Freefall
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400 max-w-lg">
            A microgravity combustion science platform modeling the physics of diffusion flames, droplet burning,
            soot shell formation, and variable-gravity flame morphologies from 0g (ISS CIR/ACME) to 1g terrestrial baseline.
          </p>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 pt-2">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Physical Conservation Solvers Active
            </span>
            <span>&bull;</span>
            <span>Burke-Schumann &amp; d&sup2;-law Verified</span>
          </div>
        </div>

        <div>
          <h4 className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
            Core Modules
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/dashboard" className="hover:text-electric transition-colors">
                Research Dashboard
              </Link>
            </li>
            <li>
              <Link href="/workspace" className="hover:text-electric transition-colors">
                Experiment Workspace
              </Link>
            </li>
            <li>
              <Link href="/simulations" className="hover:text-electric transition-colors">
                Simulation Results &amp; Comparator
              </Link>
            </li>
            <li>
              <Link href="/assistant" className="hover:text-electric transition-colors">
                AI Scientific Assistant
              </Link>
            </li>
            <li>
              <Link href="/history" className="hover:text-electric transition-colors">
                Historical Experiment Matrix
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
            Scientific Reference
          </h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-1.5">
              <span>ISS CIR / ACME Flight Data</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span>NASA Glenn 2.2s Drop Tower</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span>Dimensionless Scaling (Gr, Ri, Fr)</span>
            </li>
            <li>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-electric-400 hover:text-electric-300 transition-colors"
              >
                FastAPI Swagger Docs <ExternalLink className="h-3 w-3" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500">
        <div>&copy; {new Date().getFullYear()} NASA-FLAME Research Consortium. Academic &amp; Aerospace Research Platform.</div>
        <div className="mt-2 sm:mt-0 flex gap-4">
          <span>FastAPI Backend 1.0</span>
          <span>&bull;</span>
          <span>Next.js 14 App Router</span>
        </div>
      </div>
    </footer>
  );
}

