/**
 * NASA-FLAME: Unit Tests for Data Transformers and Safe Adapters
 */

import { describe, it, expect } from "vitest";
import {
  sanitizeTimeSeries,
  sanitizeScalarField,
  classifyGravityRegime,
  normalizeSimulationData,
} from "../../visualization/utils/dataTransformers.ts";

describe("dataTransformers Utilities", () => {
  describe("sanitizeTimeSeries", () => {
    it("should handle empty or null input gracefully", () => {
      expect(sanitizeTimeSeries(undefined)).toEqual([]);
      expect(sanitizeTimeSeries([])).toEqual([]);
      expect(sanitizeTimeSeries("not an array" as any)).toEqual([]);
    });

    it("should filter out invalid objects and sanitize NaN numbers", () => {
      const raw = [
        { time_s: 0.2, flame_radius_mm: 4.5, max_temperature_k: 1700, burning_rate_mg_s: 2.1, soot_fraction: 1e-6 },
        null,
        { time_s: 0.1, flame_radius_mm: "NaN", max_temperature_k: null, burning_rate_mg_s: 1.0, soot_fraction: 0.5e-6 },
      ];
      const result = sanitizeTimeSeries(raw);
      expect(result.length).toBe(2);
      expect(result[0].time_s).toBe(0.1); // Sorted by time_s
      expect(result[0].flame_radius_mm).toBe(0); // NaN replaced with 0
      expect(result[0].max_temperature_k).toBe(298.15); // null replaced with ambient
    });
  });

  describe("sanitizeScalarField", () => {
    it("should return null if scalar field is malformed", () => {
      expect(sanitizeScalarField(null)).toBeNull();
      expect(sanitizeScalarField({})).toBeNull();
      expect(sanitizeScalarField({ grid_x: [], grid_y: [], temperature_matrix: [] })).toBeNull();
    });

    it("should sanitize valid scalar field", () => {
      const raw = {
        grid_x: [-5, 0, 5],
        grid_y: [-5, 0, 5],
        temperature_matrix: [
          [300, 500, 300],
          [500, 1500, 500],
          [300, 500, 300],
        ],
      };
      const clean = sanitizeScalarField(raw);
      expect(clean).not.toBeNull();
      expect(clean?.grid_x.length).toBe(3);
      expect(clean?.temperature_matrix[1][1]).toBe(1500);
    });
  });

  describe("classifyGravityRegime", () => {
    it("should classify 0g as MICROGRAVITY", () => {
      expect(classifyGravityRegime(0.0)).toBe("MICROGRAVITY");
      expect(classifyGravityRegime(0.0001)).toBe("MICROGRAVITY");
      expect(classifyGravityRegime(0.05)).toBe("MICROGRAVITY");
    });

    it("should classify Lunar and Martian gravity as PARTIAL_GRAVITY", () => {
      expect(classifyGravityRegime(0.16)).toBe("PARTIAL_GRAVITY");
      expect(classifyGravityRegime(0.38)).toBe("PARTIAL_GRAVITY");
    });

    it("should classify 1.0g as NORMAL_1G", () => {
      expect(classifyGravityRegime(1.0)).toBe("NORMAL_1G");
      expect(classifyGravityRegime(1.5)).toBe("NORMAL_1G");
    });
  });

  describe("normalizeSimulationData", () => {
    it("should throw error for non-object input", () => {
      expect(() => normalizeSimulationData(null)).toThrow();
      expect(() => normalizeSimulationData("invalid")).toThrow();
    });

    it("should supply sensible physical defaults for partial objects", () => {
      const partial = { id: "SIM-001", gravity_level_g: 0.0 };
      const normalized = normalizeSimulationData(partial);
      expect(normalized.id).toBe("SIM-001");
      expect(normalized.flame_shape).toBe("SPHERICAL");
      expect(normalized.flame_radius_mm).toBe(5.0);
      expect(normalized.provenance?.dataOrigin).toBe("VISUALIZATION_MODEL");
    });
  });
});
