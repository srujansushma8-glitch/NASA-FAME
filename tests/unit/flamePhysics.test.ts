/**
 * NASA-FLAME: Unit Tests for Scientific Combustion Physics Formulas
 */

import { describe, it, expect } from "vitest";
import {
  calculateFlickerFrequency,
  calculateGrashofNumber,
  calculateRichardsonNumber,
  calculateBuoyantDraftVelocity,
  calculateRadialTemperature,
} from "../../visualization/utils/flamePhysics.ts";

describe("flamePhysics Utilities", () => {
  describe("calculateFlickerFrequency", () => {
    it("should return 0.0 Hz in microgravity (0g)", () => {
      const f_0g = calculateFlickerFrequency(0.0, 4.0);
      expect(f_0g).toBe(0.0);

      const f_near0g = calculateFlickerFrequency(0.00001, 4.0);
      expect(f_near0g).toBe(0.0);
    });

    it("should return ~11.85 Hz in 1g terrestrial gravity for a 4mm burner", () => {
      // f ≈ 1.5 / sqrt(0.004) ≈ 1.5 / 0.0632 ≈ 23.7 Hz
      const f_1g = calculateFlickerFrequency(1.0, 4.0);
      expect(f_1g).toBeGreaterThan(15);
      expect(f_1g).toBeLessThan(30);
    });

    it("should scale with square root of burner diameter", () => {
      const f_small = calculateFlickerFrequency(1.0, 2.0);
      const f_large = calculateFlickerFrequency(1.0, 8.0);
      expect(f_small).toBeGreaterThan(f_large);
    });

    it("should return 0 for non-positive burner diameter", () => {
      expect(calculateFlickerFrequency(1.0, 0)).toBe(0.0);
      expect(calculateFlickerFrequency(1.0, -2)).toBe(0.0);
    });
  });

  describe("calculateGrashofNumber", () => {
    it("should return 0 in microgravity", () => {
      const gr_0g = calculateGrashofNumber(0.0, 1400, 0.02);
      expect(gr_0g).toBe(0);
    });

    it("should return >10^4 in 1g for hot combustion flame", () => {
      const gr_1g = calculateGrashofNumber(1.0, 1450, 0.02);
      expect(gr_1g).toBeGreaterThan(10000);
    });
  });

  describe("calculateRichardsonNumber", () => {
    it("should return 0 in microgravity", () => {
      const ri_0g = calculateRichardsonNumber(0.0, 1400, 0.02, 0.5);
      expect(ri_0g).toBe(0.0);
    });

    it("should return large value for quiescent 1g combustion", () => {
      const ri_1g = calculateRichardsonNumber(1.0, 1450, 0.02, 0.05);
      expect(ri_1g).toBeGreaterThan(10);
    });
  });

  describe("calculateBuoyantDraftVelocity", () => {
    it("should return 0 m/s in 0g", () => {
      const u_0g = calculateBuoyantDraftVelocity(0.0, 16.0, 1750);
      expect(u_0g).toBe(0.0);
    });

    it("should return ~1-2 m/s in 1g for typical candle/gas flame height", () => {
      const u_1g = calculateBuoyantDraftVelocity(1.0, 16.0, 1750);
      expect(u_1g).toBeGreaterThan(0.8);
      expect(u_1g).toBeLessThan(2.5);
    });
  });

  describe("calculateRadialTemperature", () => {
    it("should match peak temperature at the flame reaction radius", () => {
      const t_peak = 1750;
      const r_flame = 5.0;
      const t_at_front = calculateRadialTemperature(r_flame, r_flame, t_peak);
      expect(t_at_front).toBeCloseTo(t_peak, 0);
    });

    it("should decay towards ambient temperature at large radii", () => {
      const t_ambient = 298.15;
      const t_far = calculateRadialTemperature(30.0, 5.0, 1750, t_ambient);
      expect(t_far).toBeLessThan(400);
      expect(t_far).toBeGreaterThanOrEqual(t_ambient);
    });
  });
});
