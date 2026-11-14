"""
Unit Tests for Data Loader and Provenance Tracking.
"""

import sys
from pathlib import Path

# Add ai-engine directory to sys.path
AI_ENGINE_DIR = Path(__file__).resolve().parent.parent
if str(AI_ENGINE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_ENGINE_DIR))

import unittest
import pandas as pd

from data_loader import load_dataset, standardize_columns, CombustionDataLoadError
from schemas import DataOrigin


DATASETS_DIR = Path(__file__).resolve().parent.parent.parent / "research" / "datasets"


class TestDataLoader(unittest.TestCase):

    def test_load_acme_csv(self):
        filepath = DATASETS_DIR / "acme_cfi_laminar_coflow.csv"
        df, prov = load_dataset(filepath)
        self.assertFalse(df.empty)
        self.assertIn("flame_length_mm", df.columns)
        self.assertIn("aspect_ratio", df.columns)
        self.assertEqual(prov.data_origin, DataOrigin.EXPERIMENTAL_MEASURED)
        self.assertIn("ACME", prov.facility_or_mission)

    def test_load_flex_droplet(self):
        filepath = DATASETS_DIR / "flex_droplet_combustion.csv"
        df, prov = load_dataset(filepath)
        self.assertFalse(df.empty)
        self.assertIn("burning_rate_k_mm2_s", df.columns)
        self.assertEqual(prov.data_origin, DataOrigin.EXPERIMENTAL_MEASURED)

    def test_load_cfd_simulation(self):
        filepath = DATASETS_DIR / "synthetic_cfd_flame_simulations.csv"
        df, prov = load_dataset(filepath)
        self.assertEqual(prov.data_origin, DataOrigin.NUMERICAL_SIMULATION)

    def test_load_from_dict(self):
        raw = [
            {"flame_length": 45.0, "flame_width": 10.0, "gravity": 1.0, "temp_k": 2000.0},
            {"flame_length": 42.0, "flame_width": 38.0, "gravity": 0.00001, "temp_k": 1800.0}
        ]
        df, prov = load_dataset(raw, data_origin=DataOrigin.EXPERIMENTAL_MEASURED)
        self.assertEqual(len(df), 2)
        self.assertIn("flame_length_mm", df.columns)
        self.assertIn("flame_width_mm", df.columns)
        self.assertEqual(prov.data_origin, DataOrigin.EXPERIMENTAL_MEASURED)

    def test_load_missing_file_raises_error(self):
        with self.assertRaises(CombustionDataLoadError):
            load_dataset("non_existent_dataset_12345.csv")


if __name__ == "__main__":
    unittest.main()
