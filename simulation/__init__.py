"""NASA-FLAME: Scientific Combustion Simulation & Computational Modeling Package.

Simulates laminar diffusion flame behavior under normal gravity (1g) and microgravity (μg).
Developed by Member 4 (Scientific Simulation & Computational Modeling Engineer).
"""

from simulation.api import (
    validate_parameters,
    run_simulation,
    simulate_normal_gravity,
    simulate_microgravity,
    compare_simulations,
    export_results,
)
from simulation.models.parameters import (
    SimulationParameters,
    PARAMETER_METADATA,
)
from simulation.core.physical_constants import (
    STANDARD_EARTH_GRAVITY,
    MICROGRAVITY_DEFAULT,
    MOON_GRAVITY,
    MARS_GRAVITY,
    FUEL_DATABASE,
)

__all__ = [
    "validate_parameters",
    "run_simulation",
    "simulate_normal_gravity",
    "simulate_microgravity",
    "compare_simulations",
    "export_results",
    "SimulationParameters",
    "PARAMETER_METADATA",
    "STANDARD_EARTH_GRAVITY",
    "MICROGRAVITY_DEFAULT",
    "MOON_GRAVITY",
    "MARS_GRAVITY",
    "FUEL_DATABASE",
]

__version__ = "1.0.0"
