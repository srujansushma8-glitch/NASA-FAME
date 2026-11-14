"""
Unit Tests for Gravity Comparison, Pattern Detection, and Scientific Explainer.
"""

import sys
from pathlib import Path

AI_ENGINE_DIR = Path(__file__).resolve().parent.parent
if str(AI_ENGINE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_ENGINE_DIR))

import unittest
import pandas as pd

from comparator import compare_gravity_conditions
from pattern_detector import detect_patterns
from explainer import generate_scientific_summary
from schemas import DataOrigin, ProvenanceMetadata


class TestComparatorAndExplainer(unittest.TestCase):

    def setUp(self):
        self.prov = ProvenanceMetadata(
            data_origin=DataOrigin.EXPERIMENTAL_MEASURED,
            facility_or_mission="NASA GRC / ISS CIR",
            citation="NASA Physical Sciences Informatics"
        )
        self.rec_1g = {
            "aspect_ratio": 4.62,
            "flame_width_mm": 9.2,
            "flame_length_mm": 42.5,
            "peak_temperature_k": 2045.0,
            "flicker_frequency_hz": 12.8,
            "soot_volume_fraction_ppm": 4.2,
            "radiative_loss_fraction": 0.18,
            "fuel_type": "C2H4"
        }
        self.rec_mug = {
            "aspect_ratio": 1.14,
            "flame_width_mm": 38.8,
            "flame_length_mm": 44.1,
            "peak_temperature_k": 1810.0,
            "flicker_frequency_hz": 0.0,
            "soot_volume_fraction_ppm": 18.5,
            "radiative_loss_fraction": 0.41,
            "fuel_type": "C2H4"
        }

    def test_gravity_comparison(self):
        comp = compare_gravity_conditions(self.rec_1g, self.rec_mug, fuel_or_config="Ethylene Laminar Flame", provenance=self.prov)
        self.assertEqual(len(comp.metrics_comparison), 7)
        
        ar_comp = next(m for m in comp.metrics_comparison if "Aspect Ratio" in m.metric_name)
        self.assertEqual(ar_comp.direction, "DECREASED")
        self.assertLess(ar_comp.percentage_change, -70.0)

        flicker_comp = next(m for m in comp.metrics_comparison if "Flicker" in m.metric_name)
        self.assertEqual(flicker_comp.value_microgravity, 0.0)

    def test_pattern_detection(self):
        df = pd.DataFrame([self.rec_1g, self.rec_mug, {
            "aspect_ratio": 1.10, "flame_width_mm": 36.0, "flame_length_mm": 40.0,
            "peak_temperature_k": 750.0, "gravity_g": 0.000001, "flicker_frequency_hz": 0.0,
            "soot_volume_fraction_ppm": 0.1, "radiative_loss_fraction": 0.05
        }])
        res = detect_patterns(df, provenance=self.prov)
        self.assertGreaterEqual(res.total_records_evaluated, 3)
        self.assertGreater(len(res.explainable_findings), 0)

    def test_scientific_summary(self):
        summary = generate_scientific_summary(self.rec_mug, provenance=self.prov)
        self.assertEqual(summary.data_origin, DataOrigin.EXPERIMENTAL_MEASURED)
        self.assertIn("microgravity", summary.title.lower())
        self.assertGreater(len(summary.assumptions_made), 0)
        self.assertGreater(len(summary.scientific_limitations), 0)


if __name__ == "__main__":
    unittest.main()
