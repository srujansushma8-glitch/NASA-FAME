"""
Unit Tests for Flame Behavior Analysis and Temperature Diagnostics.
"""

import sys
from pathlib import Path

AI_ENGINE_DIR = Path(__file__).resolve().parent.parent
if str(AI_ENGINE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_ENGINE_DIR))

import unittest
import pandas as pd

from flame_analyzer import analyze_flame_behavior
from temperature_analyzer import analyze_temperature
from schemas import GravityRegime, CombustionRegime, DataOrigin, ProvenanceMetadata


class TestFlameAndTemperatureAnalysis(unittest.TestCase):

    def setUp(self):
        self.prov_exp = ProvenanceMetadata(
            data_origin=DataOrigin.EXPERIMENTAL_MEASURED,
            facility_or_mission="ISS CIR / ACME",
            citation="Urban et al. AIAA 2018-0145"
        )

    def test_1g_flame_behavior(self):
        record_1g = {
            "flame_length_mm": 42.5,
            "flame_width_mm": 9.2,
            "gravity_g": 1.0,
            "peak_temperature_k": 2045.0,
            "fuel_type": "C2H4",
            "flicker_frequency_hz": 12.8
        }
        res = analyze_flame_behavior(record_1g, provenance=self.prov_exp)
        self.assertEqual(res.gravity_condition, GravityRegime.NORMAL_1G)
        self.assertGreater(res.geometry.aspect_ratio, 4.0)
        self.assertEqual(res.classified_regime, CombustionRegime.BUOYANT_LAMINAR)
        self.assertGreater(res.physics_parameters.flicker_frequency_hz, 10.0)

    def test_microgravity_flame_behavior(self):
        record_mug = {
            "flame_length_mm": 44.1,
            "flame_width_mm": 38.8,
            "gravity_g": 0.000001,
            "peak_temperature_k": 1810.0,
            "fuel_type": "C2H4",
            "flicker_frequency_hz": 0.0
        }
        res = analyze_flame_behavior(record_mug, provenance=self.prov_exp)
        self.assertEqual(res.gravity_condition, GravityRegime.MICROGRAVITY)
        self.assertAlmostEqual(res.geometry.aspect_ratio, 1.14, places=1)
        self.assertEqual(res.classified_regime, CombustionRegime.DIFFUSION_CONTROLLED_STEADY)
        self.assertEqual(res.physics_parameters.flicker_frequency_hz, 0.0)

    def test_cool_flame_regime_classification(self):
        record_cool = {
            "flame_length_mm": 15.0,
            "flame_width_mm": 14.5,
            "gravity_g": 0.000001,
            "peak_temperature_k": 760.0,
            "fuel_type": "n-Heptane",
            "cool_flame_observed": True
        }
        res = analyze_flame_behavior(record_cool, provenance=self.prov_exp)
        self.assertEqual(res.classified_regime, CombustionRegime.MICROGRAVITY_COOL_FLAME_TRANSITION)

    def test_temperature_analysis_1g_vs_microg(self):
        res_1g = analyze_temperature({"peak_temperature_k": 2050.0, "gravity_g": 1.0, "flame_width_mm": 10.0})
        res_mug = analyze_temperature({"peak_temperature_k": 1810.0, "gravity_g": 0.000001, "flame_width_mm": 38.0})

        # 1g radial gradient should be steeper than microgravity
        self.assertGreater(res_1g.estimated_radial_gradient_k_per_mm, res_mug.estimated_radial_gradient_k_per_mm)
        # Microgravity thermal boundary layer should be thicker
        self.assertGreater(res_mug.thermal_boundary_thickness_mm, res_1g.thermal_boundary_thickness_mm)


if __name__ == "__main__":
    unittest.main()
