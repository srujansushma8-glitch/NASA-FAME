"use client";

import React, { type MouseEvent } from "react";
import { brand } from "@/content";
import { scrollToHash } from "@/lib/scroll";

function FlameMark({ className = "size-4" }: { className?: string }) {
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

export function Footer() {
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    const hash = e.currentTarget.getAttribute("href");
    if (!hash?.startsWith("#")) return;
    e.preventDefault();
    scrollToHash(hash);
  };

  return (
    <footer className="border-t border-white/10 bg-void px-4 py-8 sm:px-6 md:px-[6vw]">
      <div className="flex flex-col gap-4 font-mono text-label text-regolith/50 uppercase md:flex-row md:items-center md:justify-between">
        <span className="flex items-center gap-2.5 text-white/80">
          <FlameMark className="size-4" />
          {brand.wordmark} · ISS CIR/ACME SCIENCE
        </span>
        <span className="text-regolith/60">
          © {new Date().getFullYear()} · NASA-FLAME • FLAME IN FREEFALL · ALL SYSTEMS NOMINAL
        </span>
        <a href="#top" onClick={go} className="transition-colors hover:text-white">
          Back to the surface ↑
        </a>
      </div>
    </footer>
  );
}
