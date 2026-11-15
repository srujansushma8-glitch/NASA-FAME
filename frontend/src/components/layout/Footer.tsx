"use client";

import React, { type MouseEvent } from "react";
import Link from "next/link";
import { brand } from "@/content";
import { Flame, ArrowUp } from "lucide-react";

export function Footer() {
  const scrollToTop = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-stone-border/40 bg-ink px-6 py-12 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6 font-mono text-xs text-stone-dim uppercase">
        <div className="flex items-center gap-3 text-stone-light">
          <div className="size-6 rounded bg-cobalt/15 border border-cobalt/40 flex items-center justify-center text-cobalt">
            <Flame className="size-3.5 text-cobalt" />
          </div>
          <span className="font-display tracking-widest font-bold text-white">
            {brand.wordmark}
          </span>
          <span className="text-stone-muted">// {brand.missionId}</span>
        </div>

        <div className="text-stone-muted text-[11px] tracking-wider">
          © {new Date().getFullYear()} NASA-FLAME // SPACE APPS // FLAME IN FREEFALL · ALL SYSTEMS NOMINAL
        </div>

        <a
          href="#top"
          onClick={scrollToTop}
          className="flex items-center gap-2 text-stone hover:text-white transition-colors group self-start md:self-auto"
        >
          <span>Return to Top</span>
          <ArrowUp className="size-3.5 text-cobalt group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </footer>
  );
}
