"""Unit tests for parameter validation and schema conformance."""

import unittest
from simulation.models.parameters import validate_parameters, SimulationParameters
from simulation.core.physical_constants import STANDARD_EARTH_GRAVITY, MICROGRAVITY_DEFAULT


class TestParameterValidation(unittest.TestCase):
    """Test suite for parameter validation and sanity checks."""

    def test_default_parameters_valid(self):
        """Default parameters should validate without errors."""
        is_valid, sanitized, errors = validate_parameters({})
        self.assertTrue(is_valid)
        self.assertEqual(len(errors), 0)
        self.assertAlmostEqual(sanitized["gravity"], STANDARD_EARTH_GRAVITY, places=3)
        self.assertEqual(sanitized["condition_type"], "normal_gravity")
        self.assertEqual(sanitized["fuel_type"], "methane")

    def test_microgravity_default_selection(self):
        """Microgravity condition should automatically assign near-zero gravity default."""
        is_valid, sanitized, errors = validate_parameters({"condition_type": "microgravity"})
        self.assertTrue(is_valid)
        self.assertAlmostEqual(sanitized["gravity"], MICROGRAVITY_DEFAULT, places=8)

    def test_parameter_bounds_enforcement(self):
        """Out of bounds values must be caught and clamped with explicit error notices."""
        bad_inputs = {
            "gravity": -5.0,
            "initial_temperature": 50.0,  # Below minimum 200 K
            "oxygen_mole_fraction": 0.90,  # Above maximum 0.45
            "fuel_flow_rate": 200.0,      # Above laminar 50 mg/s
        }
        is_valid, sanitized, errors = validate_parameters(bad_inputs)
        self.assertFalse(is_valid)
        self.assertGreaterEqual(len(errors), 4)
        # Clamped values
        self.assertGreaterEqual(sanitized["gravity"], 0.0)
        self.assertGreaterEqual(sanitized["initial_temperature"], 200.0)
        self.assertLessEqual(sanitized["oxygen_mole_fraction"], 0.45)
        self.assertLessEqual(sanitized["fuel_flow_rate"], 50.0)

    def test_invalid_fuel_handling(self):
        """Unsupported fuel types should log an error and fallback safely."""
        is_valid, sanitized, errors = validate_parameters({"fuel_type": "unobtainium"})
        self.assertFalse(is_valid)
        self.assertTrue(any("Unsupported fuel_type" in err for err in errors))
        self.assertEqual(sanitized["fuel_type"], "methane")


if __name__ == "__main__":
    unittest.main()
