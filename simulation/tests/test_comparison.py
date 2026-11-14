"""Unit tests for the side-by-side comparison engine and data export."""

import unittest
import json
import os
import tempfile
from simulation.api import (
    simulate_normal_gravity,
    simulate_microgravity,
    compare_simulations,
    export_results,
)


class TestSimulationComparison(unittest.TestCase):
    """Test suite for comparing 1g and microgravity results."""

    def setUp(self):
        self.params = {
            "initial_temperature": 298.15,
            "ambient_pressure": 101325.0,
            "oxygen_mole_fraction": 0.21,
            "fuel_type": "methane",
            "fuel_flow_rate": 2.5,
            "burner_radius": 2.0,
        }
        self.sim_1g = simulate_normal_gravity(self.params)
        self.sim_ug = simulate_microgravity(self.params)

    def test_comparison_delta_calculations(self):
        """Comparison must compute valid geometric and energetic deltas."""
        comp = compare_simulations(self.sim_1g, self.sim_ug)

        self.assertIn("summary", comp)
        self.assertIn("geometry_comparison", comp)
        self.assertIn("energetics_and_transport", comp)
        self.assertIn("scientific_insights", comp)

        geom_diffs = comp["geometry_comparison"]["differences"]
        # Aspect ratio in microgravity should drop significantly compared to 1g
        self.assertLess(geom_diffs["delta_aspect_ratio"], 0.0)
        self.assertLess(geom_diffs["percent_aspect_ratio_change"], -30.0)

        # Microgravity width should be wider than 1g
        self.assertGreater(geom_diffs["delta_width_mm"], 0.0)

        # Scientific insights list should contain detailed explanations
        insights = comp["scientific_insights"]
        self.assertGreaterEqual(len(insights), 3)

    def test_export_results_json(self):
        """Export to JSON string and file must succeed and be re-parseable."""
        json_str = export_results(self.sim_1g, format="json")
        parsed = json.loads(json_str)
        self.assertEqual(parsed["simulation_id"], self.sim_1g["simulation_id"])

        # File export
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
            tmp_path = tmp.name

        try:
            export_results(self.sim_ug, filepath=tmp_path, format="json")
            self.assertTrue(os.path.exists(tmp_path))
            with open(tmp_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.assertEqual(data["gravity_condition"], "microgravity")
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)


if __name__ == "__main__":
    unittest.main()
