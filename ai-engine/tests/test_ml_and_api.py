"""
Unit Tests for ML Models and Member 2 FastAPI Facade.
"""

import sys
from pathlib import Path

AI_ENGINE_DIR = Path(__file__).resolve().parent.parent
if str(AI_ENGINE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_ENGINE_DIR))

import unittest
import pandas as pd

from ml_models import AnalyticalCombustionModel, FlameAspectRegressor, CombustionRegimeClassifier
from api_interface import run_complete_flame_analysis, predict_aspect_ratio_ml, classify_combustion_regime_ml
from data_loader import load_dataset
from schemas import DataOrigin


DATASETS_DIR = Path(__file__).resolve().parent.parent.parent / "research" / "datasets"


class TestMLAndApi(unittest.TestCase):

    def test_analytical_aspect_ratio(self):
        # In microgravity (g=0), aspect ratio should be 1.0 (sphere)
        ar_0g, exp_0g = AnalyticalCombustionModel.predict_aspect_ratio(0.0)
        self.assertAlmostEqual(ar_0g, 1.0, places=2)

        # In 1g, aspect ratio should be ~4.2 - 4.6
        ar_1g, exp_1g = AnalyticalCombustionModel.predict_aspect_ratio(1.0)
        self.assertGreater(ar_1g, 4.0)

    def test_flame_aspect_regressor_training(self):
        filepath = DATASETS_DIR / "acme_cfi_laminar_coflow.csv"
        df, _ = load_dataset(filepath)
        
        regressor = FlameAspectRegressor()
        train_res = regressor.train_or_fallback(df)
        self.assertEqual(train_res["status"], "TRAINED_WITH_CROSS_VALIDATION")
        self.assertIsNotNone(train_res["validation_r2"])

        pred_mug = regressor.predict(0.000001, oxidizer_o2_frac=0.21, coflow_velocity_cm_s=15.0)
        self.assertAlmostEqual(pred_mug["aspect_ratio_predicted"], 1.14, delta=0.4)

    def test_regime_classifier(self):
        filepath = DATASETS_DIR / "acme_cfi_laminar_coflow.csv"
        df, _ = load_dataset(filepath)
        
        clf = CombustionRegimeClassifier()
        clf_res = clf.train_or_fallback(df)
        self.assertIn("TRAINED", clf_res["status"])

        pred_res = clf.predict(gravity_g=0.000001, peak_temp_k=1800.0, aspect_ratio=1.12)
        self.assertEqual(pred_res["regime_predicted"], "DIFFUSION_CONTROLLED_STEADY")

    def test_run_complete_flame_analysis_end_to_end(self):
        filepath = DATASETS_DIR / "acme_cfi_laminar_coflow.csv"
        out = run_complete_flame_analysis(filepath)

        self.assertIsNotNone(out.analysis_id)
        self.assertIn("aspect_ratio", out.calculated_metrics)
        self.assertIn("flicker_frequency_hz", out.calculated_metrics)
        self.assertIn("peak_temperature_k", out.calculated_metrics)
        self.assertGreater(len(out.key_observations), 0)
        self.assertGreater(len(out.detected_patterns), 0)
        self.assertIn("EXPERIMENTAL_MEASURED", out.data_origin_classification)
        self.assertIn("ai_generated_interpretation", out.data_origin_breakdown)


if __name__ == "__main__":
    unittest.main()
