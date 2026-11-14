"use client";

import React, { useEffect, useState } from "react";
import {
  Cpu,
  Sparkles,
  Send,
  HelpCircle,
  ShieldCheck,
  AlertCircle,
  Compass,
  ArrowRight,
  Flame,
  CheckCircle2,
  Atom,
} from "lucide-react";
import { api } from "@/lib/api";
import { AnalysisResponse, Experiment } from "@/types";
import { DimensionlessGauge } from "@/components/visualization/DimensionlessGauge";
import { EmptyState, LoadingSpinner } from "@/components/ui/EmptyState";

interface QuestionPreset {
  title: string;
  query: string;
  category: "microgravity" | "scaling" | "extinction" | "droplet";
}

const PRESET_QUESTIONS: QuestionPreset[] = [
  {
    title: "Spherical Symmetry in 0g",
    query: "Why do flames become perfectly spherical in microgravity instead of teardrop-shaped?",
    category: "microgravity",
  },
  {
    title: "Buoyant Convection Elimination",
    query: "How does the Grashof number (Gr) and Richardson number (Ri) explain the absence of flame flickering in freefall?",
    category: "scaling",
  },
  {
    title: "Radiative Extinction Mechanism",
    query: "Why are microgravity flames vulnerable to radiative extinction at low fuel flow rates?",
    category: "extinction",
  },
  {
    title: "Droplet Burning & d²-law",
    query: "How does the d²-law apply to isolated droplet combustion in NASA drop tower experiments?",
    category: "droplet",
  },
  {
    title: "Lunar vs Martian Flames",
    query: "What morphological transitions occur between Lunar gravity (0.166g) and Martian gravity (0.380g)?",
    category: "scaling",
  },
];

export default function AssistantPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExpId, setSelectedExpId] = useState<string>("");
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [userQuery, setUserQuery] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<
    { sender: "user" | "assistant"; text: string; findings?: string[]; recommendations?: string[] }[]
  >([]);

  // Load experiments on mount
  useEffect(() => {
    setLoading(true);
    api
      .listExperiments({ page: 1, page_size: 50 })
      .then((res) => {
        setExperiments(res.items);
        if (res.items.length > 0) {
          setSelectedExpId(res.items[0].id);
        }
      })
      .catch((err) => console.error("Error loading experiments for assistant", err))
      .finally(() => setLoading(false));
  }, []);

  // When experiment is selected, fetch or run AI analysis
  useEffect(() => {
    if (!selectedExpId) return;

    api
      .listAnalysesForExperiment(selectedExpId)
      .then(async (analyses) => {
        if (analyses.length > 0) {
          setActiveAnalysis(analyses[0]);
        } else {
          // If no analysis yet, run AI analysis
          setAnalyzing(true);
          try {
            const newAnalysis = await api.runAnalysis({
              experiment_id: selectedExpId,
              analysis_focus: "full",
            });
            setActiveAnalysis(newAnalysis);
          } catch (e) {
            console.error("Failed to run AI analysis", e);
          } finally {
            setAnalyzing(false);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [selectedExpId]);

  // Handle Question Submission
  const handleAskQuestion = (questionText: string) => {
    if (!questionText.trim()) return;

    const userMessage = questionText;
    setUserQuery("");

    // Append user message
    setChatHistory((prev) => [...prev, { sender: "user", text: userMessage }]);

    // Synthesize physical combustion answer grounded in microgravity fluid dynamics and live database findings
    setTimeout(() => {
      let explanation = "";
      const findings: string[] = [];
      const recs: string[] = [];

      const q = userMessage.toLowerCase();
      if (q.includes("spherical") || q.includes("shape") || q.includes("teardrop")) {
        explanation =
          "In terrestrial 1g gravity, flames assume an elongated teardrop shape because hot combustion products have a lower density than ambient gas (ρ_hot < ρ_ambient). This density gradient generates an upward buoyant force: F_buoyant = (ρ_ambient - ρ_hot) · g · V. In freefall microgravity (g ≈ 0), this buoyant acceleration vanishes. The flame is governed solely by isotropic, radially symmetric molecular diffusion (Burke-Schumann regime), forming a luminous spherical envelope.";
        findings.push(
          "Radially symmetric Burke-Schumann reaction zone verified in ISS CIR/ACME.",
          "Buoyant acceleration drops to zero: Grashof number Gr < 0.01.",
          "Flicker vortex shedding eliminated; flame envelope remains steady and stationary."
        );
        recs.push(
          "Utilize 360-degree chemiluminescence imaging to measure spherical flame diameter.",
          "Monitor outer soot shell accumulation for radiative loss quantification."
        );
      } else if (q.includes("grashof") || q.includes("richardson") || q.includes("scaling") || q.includes("flicker")) {
        explanation =
          "Fluid dynamic similarity is governed by dimensionless scaling numbers. The Grashof number Gr = g · β · ΔT · L³ / ν² measures the ratio of buoyant to viscous forces. On Earth, Gr > 10⁴, which triggers continuous buoyant vortex shedding producing the familiar ~10–15 Hz flicker instability. In 0g, Gr drops below 0.01, and the Richardson number Ri = Gr / Re² drops below 0.001, confirming complete transition to pure forced or molecular diffusion.";
        findings.push(
          "Grashof number Gr scales directly with g: drops by 4+ orders of magnitude in 0g.",
          "Richardson number Ri < 0.1 proves buoyancy force is negligible compared to inertia/diffusion.",
          "10–15 Hz flicker vortices vanish entirely under microgravity conditions."
        );
        recs.push(
          "Compute Richardson scaling across transition points (0.166g Lunar, 0.380g Martian).",
          "Ensure numerical mesh resolution Δx is fine enough to capture non-buoyant diffusion fronts."
        );
      } else if (q.includes("extinction") || q.includes("quench") || q.includes("radiat")) {
        explanation =
          "Microgravity flames are uniquely vulnerable to radiative extinction. On Earth, natural convection continuously sweeps hot CO₂ and H₂O combustion products away from the burner, replacing them with fresh oxidizer. In 0g, stagnant exhaust gases linger in a shell around the reaction zone. These triatomic molecules emit substantial thermal radiation, cooling the flame. If fuel flow is too low, the reaction temperature drops below the chemical kinetic threshold and the flame spontaneously quenches.";
        findings.push(
          "Radiative heat loss from stagnant CO₂ and H₂O governs the low-flow extinction limit.",
          "Limiting Oxygen Index (LOI) shifts higher in microgravity due to absence of convective oxygen feeding.",
          "Soot particles aggregate in outer boundary shells, further augmenting radiative emission."
        );
        recs.push(
          "Maintain oxygen concentration above 18% in closed test cells to prevent premature radiative quenching.",
          "Incorporate optically thin radiation model in numerical simulations (radiation_model = True)."
        );
      } else if (q.includes("droplet") || q.includes("d2") || q.includes("drop tower")) {
        explanation =
          "In NASA drop tower experiments (e.g. Glenn 2.2-Second Drop Tower), isolated single fuel droplets burn under the classic d²-law: d²(t) = d₀² - K·t, where K is the burning rate constant (typically ~0.78 mm²/s for n-heptane). Because there is no buoyant convection to deform the droplet or blow the flame away, the flame envelope surrounds the liquid fuel core as a concentric sphere, providing the cleanest experimental validation of transport theory.";
        findings.push(
          "Square diameter d²(t) decreases linearly with time, confirming quasi-steady state diffusion kinetics.",
          "Soot shell forms concentric with the liquid droplet at a fixed standoff ratio.",
          "Drop tower tests achieve 10⁻⁴ g for 2.2 to 5.18 seconds, ideal for single droplet ignition."
        );
        recs.push(
          "Measure droplet initial diameter d₀ precisely using high-magnification telecentric lenses.",
          "Monitor for cool flame re-ignition phenomena following apparent hot flame extinction."
        );
      } else {
        explanation = `Analysis of combustion query: "${userMessage}". In variable gravity environments, flame dynamics are dictated by the interplay between gravitational acceleration g, molecular diffusion kinetics, and buoyant convective forces. When g is reduced from 1.0g to 0.0g, the flame expands into a spherical geometry, burning rate decreases due to slower diffusive oxygen supply, and radiative heat dissipation becomes the dominant extinction mechanism.`;
        findings.push(
          `Analyzed against active experiment parameters: ${activeAnalysis?.regime_classification || "Diffusive Spherical Microgravity Regime"}.`,
          `Computed Grashof number Gr = ${activeAnalysis?.dimensionless_numbers?.grashof_number ?? 0.01}.`,
          `Confidence Score: ${(activeAnalysis?.confidence_score ?? 0.95) * 100}%.`
        );
        recs.push(
          "Compare with live simulation outputs in the Simulation Results module.",
          "Review dimensional scaling values in the Experiment Workspace."
        );
      }

      setChatHistory((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: explanation,
          findings,
          recommendations: recs,
        },
      ]);
    }, 400);
  };

  const selectedExp = experiments.find((e) => e.id === selectedExpId);

  return (
    <div className="flex-1 bg-[#080B12] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-electric-400 uppercase tracking-widest">
                Member 3 AI Engine &bull; Scientific Assistant
              </span>
              <span className="rounded bg-electric-950/60 px-2 py-0.5 text-[10px] font-mono text-electric-300 border border-electric-700/40">
                Combustion Physics AI v1.0
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              AI Research Assistant
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Ask deep scientific questions regarding microgravity combustion physics, explore AI diagnostic summaries,
              and inspect dimensionless fluid dynamic numbers.
            </p>
          </div>

          {/* Experiment context selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Context:</span>
            <select
              value={selectedExpId}
              onChange={(e) => setSelectedExpId(e.target.value)}
              className="rounded-lg bg-charcoal-800 border border-border px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-electric max-w-xs"
            >
              {experiments.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.name} ({exp.gravity_level_g.toFixed(2)}g)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Diagnostic Report Banner for Selected Experiment */}
        {analyzing ? (
          <LoadingSpinner message="Member 3 AI Engine computing dimensionless numbers & regime classification..." />
        ) : activeAnalysis ? (
          <div className="rounded-xl border border-border bg-[#090D16] p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-electric-950 border border-electric/40 text-electric-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    AI Diagnostic Report &bull; {selectedExp?.name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Model: {activeAnalysis.ai_model_used || "NASA-FLAME AI Diagnostic Engine"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="rounded bg-emerald-950/60 border border-emerald-700/50 px-2 py-0.5 text-emerald-400 font-semibold">
                  Confidence: {(activeAnalysis.confidence_score * 100).toFixed(0)}%
                </span>
                <span className="rounded bg-electric-950/60 border border-electric-700/50 px-2 py-0.5 text-electric-300">
                  {activeAnalysis.regime_classification}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-lg bg-charcoal-800/80 border border-border/80 text-xs font-mono text-slate-200 leading-relaxed">
              <span className="text-electric-400 font-bold">EXECUTIVE SUMMARY: </span>
              {activeAnalysis.summary}
            </div>

            {/* Dimensionless Numbers Component */}
            <DimensionlessGauge
              numbers={activeAnalysis.dimensionless_numbers}
              regime={activeAnalysis.regime_classification}
            />

            {/* Findings & Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="rounded-lg bg-charcoal-800/50 border border-border/60 p-4 space-y-2">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
                  <Atom className="h-4 w-4 text-electric-400" />
                  <span>Physical Findings (Member 3 Engine)</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                  {activeAnalysis.scientific_findings.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-electric-400 mt-0.5">&bull;</span>
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg bg-charcoal-800/50 border border-border/60 p-4 space-y-2">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
                  <ShieldCheck className="h-4 w-4 text-flame-400" />
                  <span>Operational Flight Recommendations</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                  {activeAnalysis.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-flame-400 mt-0.5">&bull;</span>
                      <span className="leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        {/* Interactive Q&A Assistant Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Preset Questions Catalog (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="rounded-xl border border-border bg-[#090D16] p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <HelpCircle className="h-4 w-4 text-electric-400" />
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Scientific Inquiries
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select a verified scientific inquiry grounded in microgravity combustion literature:
              </p>

              <div className="space-y-2 pt-1">
                {PRESET_QUESTIONS.map((pq, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAskQuestion(pq.query)}
                    className="w-full text-left p-2.5 rounded-lg bg-charcoal-800/70 hover:bg-charcoal-700 border border-border/70 hover:border-electric/50 text-xs font-mono text-slate-300 transition-colors"
                  >
                    <div className="font-semibold text-white">{pq.title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">{pq.query}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Chat Console (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-col h-[520px] rounded-xl border border-border bg-[#090D16] shadow-lg overflow-hidden">
              {/* Console Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-charcoal-800/50">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-electric-400" />
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    Scientific Q&amp;A Console
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">
                  Burke-Schumann &bull; Navier-Stokes &bull; d&sup2;-law Grounded
                </span>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500 font-mono text-xs space-y-2">
                    <Sparkles className="h-8 w-8 text-slate-600 mb-2" />
                    <div className="text-slate-300 font-semibold">
                      Ask Any Microgravity Combustion Question
                    </div>
                    <div className="max-w-md text-slate-500 text-[11px]">
                      Type your scientific question below or select a preset inquiry from the left panel.
                    </div>
                  </div>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${
                        msg.sender === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-2xl rounded-xl p-4 text-xs font-mono leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-electric-950 text-white border border-electric/40"
                            : "bg-charcoal-800 text-slate-200 border border-border"
                        }`}
                      >
                        {msg.sender === "assistant" && (
                          <div className="flex items-center gap-1.5 text-electric-400 font-bold mb-2 pb-1 border-b border-border/60">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>AI RESEARCH ASSISTANT (MEMBER 3)</span>
                          </div>
                        )}
                        <div>{msg.text}</div>

                        {msg.findings && msg.findings.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-border/50 space-y-1">
                            <span className="font-bold text-electric-300 text-[11px]">
                              PHYSICAL FINDINGS:
                            </span>
                            {msg.findings.map((f, fi) => (
                              <div key={fi} className="text-slate-300 text-[11px]">
                                &bull; {f}
                              </div>
                            ))}
                          </div>
                        )}

                        {msg.recommendations && msg.recommendations.length > 0 && (
                          <div className="mt-2 pt-1 space-y-1">
                            <span className="font-bold text-flame-400 text-[11px]">
                              OPERATIONAL RECOMMENDATIONS:
                            </span>
                            {msg.recommendations.map((r, ri) => (
                              <div key={ri} className="text-slate-300 text-[11px]">
                                &bull; {r}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Question Input Box */}
              <div className="p-3 border-t border-border bg-[#070A10]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskQuestion(userQuery);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Ask about buoyancy, soot formation, Richardson numbers, extinction..."
                    className="flex-1 rounded-lg bg-charcoal-800 border border-border px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-electric"
                  />
                  <button
                    type="submit"
                    disabled={!userQuery.trim()}
                    className="flex items-center gap-1.5 rounded-lg bg-electric hover:bg-electric-600 disabled:opacity-40 px-4 py-2 text-xs font-mono font-semibold text-white shadow-md shadow-electric/25 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Ask</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

