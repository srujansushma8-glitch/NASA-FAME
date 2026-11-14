"""
Unit Tests for Data Preprocessing and Combustion Physics Transformations.
"""

import sys
from pathlib import Path

AI_ENGINE_DIR = Path(__file__).resolve().parent.parent
if str(AI_ENGINE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_ENGINE_DIR))

import unittest
import numpy as np
import pandas as pd

from preprocessing import (
    preprocess_data,
    detect_invalid_records,
    handle_missing_values,
    compute_combustion_physics_parameters,
    calculate_descriptive_statistics
)


class TestPreprocessing(unittest.TestCase):

    def test_invalid_record_detection(self):
        df_corrupt = pd.DataFrame([
            {"peak_temperature_k": -50.0, "flame_length_mm": 30.0, "gravity_g": 1.0}, # Invalid negative temp
            {"peak_temperature_k": 2100.0, "flame_length_mm": -10.0, "gravity_g": 1.0}, # Invalid negative length
            {"peak_temperature_k": 1950.0, "flame_length_mm": 40.0, "gravity_g": 1.0}  # Valid
        ])
        clean_df, reasons = detect_invalid_records(df_corrupt)
        self.assertEqual(len(clean_df), 1)
        self.assertEqual(len(reasons), 2)

    def test_missing_value_imputation(self):
        # In microgravity, flicker should be imputed to 0.0 Hz
        df_missing = pd.DataFrame([
            {"gravity_g": 0.000001, "flicker_frequency_hz": np.nan, "flame_length_mm": 40.0, "flame_width_mm": 35.0},
            {"gravity_g": 1.0, "flicker_frequency_hz": 12.5, "flame_length_mm": 40.0, "flame_width_mm": 10.0}
        ])
        imputed_df, counts = handle_missing_values(df_missing)
        self.assertEqual(imputed_df.loc[0, "flicker_frequency_hz"], 0.0)
        self.assertAlmostEqual(imputed_df.loc[0, "aspect_ratio"], 40.0 / 35.0, places=2)

    def test_combustion_parameters_extraction(self):
        df = pd.DataFrame([
            {"flame_length_mm": 40.0, "flame_width_mm": 10.0, "gravity_g": 1.0, "peak_temperature_k": 2000.0},
            {"flame_length_mm": 40.0, "flame_width_mm": 40.0, "gravity_g": 0.000001, "peak_temperature_k": 1800.0}
        ])
        featured_df, extracted = compute_combustion_physics_parameters(df)
        self.assertIn("grashof_number", featured_df.columns)
        self.assertIn("richardson_number", featured_df.columns)
        self.assertIn("froude_number", featured_df.columns)

        # In 1g, Gr should be positive and substantial (~10^4 - 10^5)
        self.assertGreater(featured_df.loc[0, "grashof_number"], 1e3)
        # In microgravity, Gr should be near zero (< 1.0, vs > 10^4 in 1g)
        self.assertLess(featured_df.loc[1, "grashof_number"], 1.0)

    def test_descriptive_statistics(self):
        df = pd.DataFrame({
            "peak_temperature_k": [1800.0, 1900.0, 2000.0, 2100.0],
            "aspect_ratio": [1.1, 1.2, 4.5, 4.6]
        })
        stats_dict = calculate_descriptive_statistics(df)
        self.assertIn("peak_temperature_k", stats_dict)
        self.assertEqual(stats_dict["peak_temperature_k"].mean, 1950.0)
        self.assertIsNotNone(stats_dict["peak_temperature_k"].snr_db)


if __name__ == "__main__":
    unittest.main()
