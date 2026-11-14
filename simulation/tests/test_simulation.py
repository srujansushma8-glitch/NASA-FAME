"""Unit tests verifying full simulation runs, grid solvers, and output schemas."""

import unittest
from simulation.api import (
    run_simulation,
    simulate_normal_gravity,
    simulate_microgravity,
)


class TestSimulationRuns(unittest.TestCase):
    """Test suite for top-level simulation execution and contract verification."""

    def test_normal_gravity_simulation_schema(self):
        """1g simulation must return all required keys, fields, and physical values."""
        res = simulate_normal_gravity({"fuel_flow_rate": 3.0})

        self.assertIn("simulation_id", res)
        self.assertEqual(res["gravity_condition"], "normal_gravity")
        self.assertIn("flame_geometry", res)
        self.assertIn("temperature_distribution", res)
        self.assertIn("physical_quantities", res)
        self.assertIn("time_series", res)
        self.assertIn("model_assumptions", res)
        self.assertIn("validation_status", res)

        # Geometry checks
        geom = res["flame_geometry"]
        self.assertGreater(geom["height_mm"], 5.0)
        self.assertGreater(geom["width_mm"], 2.0)
        self.assertEqual(geom["shape_classification"], "teardrop_slender")
        self.assertGreater(len(geom["contour_2d"]), 10)
        self.assertIsNotNone(geom["mesh_3d"])
        self.assertGreater(geom["mesh_3d"]["triangle_count"], 50)

        # Temperature distribution checks
        temp = res["temperature_distribution"]
        self.assertGreater(temp["peak_temperature_K"], 1800.0)
        self.assertGreater(len(temp["temperature_grid_K"]), 10)
        self.assertGreater(len(temp["axial_profile"]), 10)

        # Physical quantities
        phys = res["physical_quantities"]
        self.assertGreater(phys["richardson_number"], 1.0)
        self.assertGreater(phys["heat_release_rate_W"], 10.0)
        self.assertGreater(phys["flicker_frequency_hz"], 0.0)

        # Validation status
        val = res["validation_status"]
        self.assertTrue(val["is_valid"])
        self.assertTrue(val["cfl_stable"])
        self.assertTrue(val["energy_conserved"])

    def test_microgravity_simulation_schema(self):
        """Microgravity simulation must return spherical flame, near-zero flicker, and high radiation."""
        res = simulate_microgravity({"fuel_flow_rate": 3.0})

        self.assertEqual(res["gravity_condition"], "microgravity")
        geom = res["flame_geometry"]
        self.assertEqual(geom["shape_classification"], "spherical_expanded")
        self.assertLessEqual(geom["aspect_ratio"], 1.35)

        phys = res["physical_quantities"]
        self.assertLess(phys["richardson_number"], 0.1)
        self.assertEqual(phys["flicker_frequency_hz"], 0.0)
        self.assertGreater(phys["radiative_fraction"], 0.25)
        self.assertEqual(phys["dominant_transport_regime"], "Molecular Diffusion Dominated")

    def test_time_series_monotonicity_and_length(self):
        """Time-series arrays must have matched lengths and positive monotonically non-decreasing time."""
        res = simulate_normal_gravity({"duration": 4.0, "time_steps": 20})
        ts = res["time_series"]

        self.assertEqual(len(ts["time_points_s"]), 20)
        self.assertEqual(len(ts["height_history_mm"]), 20)
        self.assertEqual(len(ts["peak_temperature_history_K"]), 20)

        # Time monotonicity
        times = ts["time_points_s"]
        for i in range(len(times) - 1):
            self.assertLess(times[i], times[i + 1])


if __name__ == "__main__":
    unittest.main()
