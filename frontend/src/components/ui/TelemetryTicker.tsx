"use client";
import React, { useEffect, useState } from "react";

interface TelemetryTickerProps {
  gravityG?: number;
  tempK?: number;
  o2Percent?: number;
  pressureAtm?: number;
  experimentName?: string;
}

export function TelemetryTicker({ gravityG = 0.0, tempK, o2Percent = 21.0, pressureAtm = 1.0, experimentName }: TelemetryTickerProps) {
  const [utc, setUtc] = useState("");
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const update = () => setUtc(new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC");
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setBlink(b => !b), 600);
    return () => clearInterval(id);
  }, []);

  const fields = [
    { label: "UTC", value: utc },
    { label: "GRAVITY", value: `${gravityG.toFixed(3)} g` },
    ...(tempK !== undefined ? [{ label: "TEMP", value: `${tempK.toFixed(0)} K` }] : []),
    { label: "O₂", value: `${o2Percent.toFixed(1)} %` },
    { label: "P", value: `${pressureAtm.toFixed(2)} atm` },
    ...(experimentName ? [{ label: "EXP", value: experimentName.substring(0, 20) }] : []),
  ];

  return (
    <div className="flex items-center gap-4 overflow-x-auto font-mono text-[10px] bg-[#050914]/80 border border-[#16A9FF]/15 rounded-sm px-3 py-2 select-none">
      <span className="shrink-0 text-[#16A9FF]/50 uppercase tracking-widest">◈ TELEMETRY</span>
      {fields.map((f, i) => (
        <span key={i} className="shrink-0 flex items-center gap-1.5">
          <span className="text-[#16A9FF]/60 uppercase">{f.label}:</span>
          <span className="text-white tabular-nums">{f.value}</span>
        </span>
      ))}
      <span className="text-[#16A9FF]/40 ml-auto">{blink ? "█" : " "}</span>
    </div>
  );
}
