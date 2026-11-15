import { useMemo } from "react";

interface ExperimentParams {
  oxygen_percentage?: number;
  pressure_atm?: number;
  ambient_temperature_k?: number;
  gravity_level_g?: number;
  fuel_type?: string;
  fuel_flow_rate_sccm?: number;
}

type SafetyLevel = "NOMINAL" | "CAUTION" | "HIGH_RISK" | "CRITICAL";

interface RiskFactor {
  factor: string;
  detail: string;
  severity: "low" | "medium" | "high";
}

export interface SafetyResult {
  level: SafetyLevel;
  score: number;
  risks: RiskFactor[];
  recommendations: string[];
  disclaimer: string;
}

export function useSafetyAnalysis(params: ExperimentParams): SafetyResult {
  return useMemo(() => {
    const o2 = params.oxygen_percentage ?? 21;
    const pressure = params.pressure_atm ?? 1.0;
    const tempK = params.ambient_temperature_k ?? 298;
    const gravity = params.gravity_level_g ?? 0.0;
    const fuel = (params.fuel_type ?? "").toLowerCase();
    const flowRate = params.fuel_flow_rate_sccm ?? 10;

    let score = 0;
    const risks: RiskFactor[] = [];
    const recommendations: string[] = [];

    // O2 enrichment risk
    if (o2 > 40) {
      score += 50;
      risks.push({ factor: "O₂ Concentration", detail: `${o2}% O₂ — Severely enriched atmosphere, extreme fire hazard`, severity: "high" });
      recommendations.push("Reduce O₂ concentration below 25% for safe operation.");
    } else if (o2 > 30) {
      score += 30;
      risks.push({ factor: "O₂ Concentration", detail: `${o2}% O₂ — Enriched oxidizer significantly increases flammability`, severity: "high" });
      recommendations.push("Consider reducing O₂ below 25% to minimize rapid combustion risk.");
    } else if (o2 > 25) {
      score += 15;
      risks.push({ factor: "O₂ Concentration", detail: `${o2}% O₂ — Moderately enriched, elevated flammability`, severity: "medium" });
    }

    // Pressure risk
    if (pressure > 5) {
      score += 35;
      risks.push({ factor: "Chamber Pressure", detail: `${pressure} atm — Very high pressure amplifies reaction rates`, severity: "high" });
      recommendations.push("Review pressure vessel integrity. Use pressure relief system.");
    } else if (pressure > 2) {
      score += 15;
      risks.push({ factor: "Chamber Pressure", detail: `${pressure} atm — Elevated pressure increases burning rate`, severity: "medium" });
    }

    // Temperature risk
    if (tempK > 1000) {
      score += 25;
      risks.push({ factor: "Initial Temperature", detail: `${tempK} K — Pre-heated environment, reduced ignition energy required`, severity: "high" });
      recommendations.push("Verify thermal insulation and chamber material limits.");
    } else if (tempK > 600) {
      score += 10;
      risks.push({ factor: "Initial Temperature", detail: `${tempK} K — Elevated ambient temperature`, severity: "medium" });
    }

    // Hydrogen fuel
    if (fuel.includes("hydrogen") || fuel.includes("h2")) {
      score += 30;
      risks.push({ factor: "Fuel Type", detail: "Hydrogen: Wide flammability limits (4–75%), high diffusivity, invisible flame", severity: "high" });
      recommendations.push("Ensure H₂ leak detection, use flame ionization detection, verify ventilation.");
      if (o2 > 25) {
        score += 20;
        risks.push({ factor: "H₂ + Enriched O₂", detail: "Combination of H₂ and elevated O₂ is critically hazardous", severity: "high" });
      }
    }

    // Microgravity + enriched O2 combo
    if (gravity < 0.05 && o2 > 25) {
      score += 20;
      risks.push({ factor: "Microgravity + Enriched O₂", detail: "In 0g, buoyancy-driven convection is absent. Enriched O₂ can sustain larger, hotter spherical flames with no natural ventilation.", severity: "high" });
      recommendations.push("Strictly control O₂ in microgravity environments. Implement active gas management.");
    }

    // High flow rate
    if (flowRate > 50) {
      score += 10;
      risks.push({ factor: "Fuel Flow Rate", detail: `${flowRate} sccm — High flow rate may exceed extinction limits in 0g`, severity: "medium" });
    }

    // Classify
    let level: SafetyLevel;
    if (score >= 70) level = "CRITICAL";
    else if (score >= 40) level = "HIGH_RISK";
    else if (score >= 15) level = "CAUTION";
    else level = "NOMINAL";

    if (risks.length === 0) {
      recommendations.push("Configuration appears within normal operating bounds. Continue standard monitoring.");
    }

    return {
      level,
      score: Math.min(score, 100),
      risks,
      recommendations,
      disclaimer: "⚠ EDUCATIONAL ASSESSMENT ONLY: This is a simplified rule-based model for educational use. It does not represent validated NASA safety protocols or certified hazard analysis.",
    };
  }, [params.oxygen_percentage, params.pressure_atm, params.ambient_temperature_k, params.gravity_level_g, params.fuel_type, params.fuel_flow_rate_sccm]);
}
