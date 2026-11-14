"""Unit tests verifying governing equations, dimensionless scaling, and physical consistency."""

import unittest
from simulation.core.combustion_physics import calculate_flame_physics
from simulation.core.physical_constants import STANDARD_EARTH_GRAVITY, MICROGRAVITY_DEFAULT


class TestCombustionPhysics(unittest.TestCase):
    """Test suite for analytical combustion calculations and gravity scaling."""

    def test_richardson_scaling_1g_vs_ug(self):
        """Richardson number must be >> 1 in normal gravity and << 1 in microgravity."""
        physics_1g = calculate_flame_physics(
            gravity_m_s2=STANDARD_EARTH_GRAVITY,
            initial_temp_k=298.15,
            pressure_pa=101325.0,
            oxygen_mole_frac=0.21,
            fuel_name="methane",
            fuel_flow_rate_mg_s=2.5,
            burner_radius_mm=2.0,
        )
        physics_ug = calculate_flame_physics(
            gravity_m_s2=MICROGRAVITY_DEFAULT,
            initial_temp_k=298.15,
            pressure_pa=101325.0,
            oxygen_mole_frac=0.21,
            fuel_name="methane",
            fuel_flow_rate_mg_s=2.5,
            burner_radius_mm=2.0,
        )

        # 1g must be buoyancy dominated (Ri > 5)
        self.assertGreater(physics_1g["richardson_number"], 5.0)
        self.assertEqual(physics_1g["dominant_transport_regime"], "Buoyancy-Driven Convection")

        # Microgravity must be diffusion dominated (Ri < 0.01)
        self.assertLess(physics_ug["richardson_number"], 0.01)
        self.assertEqual(physics_ug["dominant_transport_regime"], "Molecular Diffusion Dominated")

    def test_aspect_ratio_transition(self):
        """Flame aspect ratio in 1g must be slender (AR > 2.0) and spherical in microgravity (AR near 1.0)."""
        physics_1g = calculate_flame_physics(
            gravity_m_s2=STANDARD_EARTH_GRAVITY,
            initial_temp_k=298.15,
            pressure_pa=101325.0,
            oxygen_mole_frac=0.21,
            fuel_name="methane",
            fuel_flow_rate_mg_s=2.5,
            burner_radius_mm=2.0,
        )
        physics_ug = calculate_flame_physics(
            gravity_m_s2=MICROGRAVITY_DEFAULT,
            initial_temp_k=298.15,
            pressure_pa=101325.0,
            oxygen_mole_frac=0.21,
            fuel_name="methane",
            fuel_flow_rate_mg_s=2.5,
            burner_radius_mm=2.0,
        )

        self.assertGreaterEqual(physics_1g["aspect_ratio"], 2.0)
        self.assertEqual(physics_1g["shape_classification"], "teardrop_slender")

        self.assertLessEqual(physics_ug["aspect_ratio"], 1.35)
        self.assertEqual(physics_ug["shape_classification"], "spherical_expanded")

    def test_buoyant_velocity_and_flickering(self):
        """Buoyant velocity and flickering must exist in 1g and vanish in microgravity."""
        physics_1g = calculate_flame_physics(
            gravity_m_s2=STANDARD_EARTH_GRAVITY,
            initial_temp_k=298.15,
            pressure_pa=101325.0,
            oxygen_mole_frac=0.21,
            fuel_name="propane",
            fuel_flow_rate_mg_s=3.0,
            burner_radius_mm=2.0,
        )
        physics_ug = calculate_flame_physics(
            gravity_m_s2=MICROGRAVITY_DEFAULT,
            initial_temp_k=298.15,
            pressure_pa=101325.0,
            oxygen_mole_frac=0.21,
            fuel_name="propane",
            fuel_flow_rate_mg_s=3.0,
            burner_radius_mm=2.0,
        )

        self.assertGreater(physics_1g["u_buoy_m_s"], 0.3)
        self.assertGreater(physics_1g["flicker_frequency_hz"], 8.0)

        self.assertAlmostEqual(physics_ug["u_buoy_m_s"], 0.0, places=4)
        self.assertEqual(physics_ug["flicker_frequency_hz"], 0.0)

    def test_oxygen_starvation_extinction(self):
        """Low oxygen concentration must trigger radiative/flammability quenching."""
        physics_starved = calculate_flame_physics(
            gravity_m_s2=STANDARD_EARTH_GRAVITY,
            initial_temp_k=298.15,
            pressure_pa=101325.0,
            oxygen_mole_frac=0.09,  # Below 12% limit for methane
            fuel_name="methane",
            fuel_flow_rate_mg_s=2.0,
            burner_radius_mm=2.0,
        )
        self.assertTrue(physics_starved["is_quenched"])
        self.assertIsNotNone(physics_starved["quench_reason"])


if __name__ == "__main__":
    unittest.main()
