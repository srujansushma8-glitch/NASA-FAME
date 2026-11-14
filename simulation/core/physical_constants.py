"""Physical constants and chemical fuel properties for the FLAME simulation engine.

Based on standard NIST thermochemical data and NASA microgravity combustion references.
"""

from typing import Dict, Any

# Universal Physical Constants
STANDARD_EARTH_GRAVITY = 9.80665  # m/s^2 (Standard acceleration of Earth gravity, 1g)
MICROGRAVITY_DEFAULT = 1.0e-6      # m/s^2 (Standard ISS orbit near-zero gravity approximation)
MOON_GRAVITY = 1.62                # m/s^2
MARS_GRAVITY = 3.71                # m/s^2

UNIVERSAL_GAS_CONSTANT = 8.314462618  # J / (mol * K)
STEFAN_BOLTZMANN_CONSTANT = 5.670374419e-8  # W / (m^2 * K^4)
STANDARD_ATMOSPHERE = 101325.0  # Pa (1.0 atm)
STANDARD_TEMPERATURE = 298.15  # K (25 deg C)

# Air & Atmospheric Properties at 298.15 K
AIR_MOLAR_MASS = 0.02897  # kg/mol
AIR_HEAT_CAPACITY_CP = 1005.0  # J / (kg * K)
AIR_REFERENCE_VISCOSITY = 1.846e-5  # Pa * s (dynamic viscosity at 300 K)
AIR_REFERENCE_CONDUCTIVITY = 0.0262  # W / (m * K)
AIR_REFERENCE_DIFFUSIVITY = 2.15e-5  # m^2 / s (molecular diffusivity in air)
PRANDTL_NUMBER = 0.71  # Pr = mu * cp / k
SCHMIDT_NUMBER = 0.72  # Sc = nu / D

# Supported Fuel Thermochemical Data
# Stoichiometric mass ratio s = (mass of O2) / (mass of Fuel) for complete combustion to CO2 and H2O
FUEL_DATABASE: Dict[str, Dict[str, Any]] = {
    "methane": {
        "name": "Methane",
        "formula": "CH4",
        "molar_mass": 0.016043,  # kg/mol
        "heat_of_combustion": 50.0e6,  # J/kg (LHV)
        "stoichiometric_mass_ratio": 4.0,  # CH4 + 2 O2 -> CO2 + 2 H2O: 64 / 16.04 = 4.0
        "stoichiometric_molar_ratio": 2.0,  # 2 moles of O2 per mole of fuel
        "adiabatic_flame_temp_air": 2226.0,  # K in standard 21% O2 air
        "soot_propensity": 0.15,  # Relative soot yield index (low soot, blue flame core)
        "quench_limit_o2": 0.12,  # Minimum mole fraction of O2 for stable combustion
        "roper_scale_factor": 1.33,  # Calibrated constant for Roper height model
    },
    "propane": {
        "name": "Propane",
        "formula": "C3H8",
        "molar_mass": 0.044096,  # kg/mol
        "heat_of_combustion": 46.35e6,  # J/kg
        "stoichiometric_mass_ratio": 3.63,  # C3H8 + 5 O2 -> 3 CO2 + 4 H2O: 160 / 44.1 = 3.63
        "stoichiometric_molar_ratio": 5.0,
        "adiabatic_flame_temp_air": 2250.0,  # K
        "soot_propensity": 0.45,  # Moderate soot (yellow luminescent tip in 1g)
        "quench_limit_o2": 0.11,
        "roper_scale_factor": 1.25,
    },
    "butane": {
        "name": "Butane",
        "formula": "C4H10",
        "molar_mass": 0.05812,  # kg/mol
        "heat_of_combustion": 45.75e6,  # J/kg
        "stoichiometric_mass_ratio": 3.58,  # C4H10 + 6.5 O2 -> 4 CO2 + 5 H2O: 208 / 58.1 = 3.58
        "stoichiometric_molar_ratio": 6.5,
        "adiabatic_flame_temp_air": 2243.0,  # K
        "soot_propensity": 0.55,  # Moderate to high soot
        "quench_limit_o2": 0.11,
        "roper_scale_factor": 1.21,
    },
    "ethylene": {
        "name": "Ethylene",
        "formula": "C2H4",
        "molar_mass": 0.028054,  # kg/mol
        "heat_of_combustion": 47.16e6,  # J/kg
        "stoichiometric_mass_ratio": 3.42,  # C2H4 + 3 O2 -> 2 CO2 + 2 H2O: 96 / 28.05 = 3.42
        "stoichiometric_molar_ratio": 3.0,
        "adiabatic_flame_temp_air": 2370.0,  # K (highly reactive olefin)
        "soot_propensity": 0.85,  # High soot propensity
        "quench_limit_o2": 0.10,
        "roper_scale_factor": 1.18,
    },
    "heptane": {
        "name": "Heptane (Droplet / Wick Analog)",
        "formula": "C7H16",
        "molar_mass": 0.1002,  # kg/mol
        "heat_of_combustion": 44.56e6,  # J/kg
        "stoichiometric_mass_ratio": 3.51,  # C7H16 + 11 O2 -> 7 CO2 + 8 H2O
        "stoichiometric_molar_ratio": 11.0,
        "adiabatic_flame_temp_air": 2290.0,  # K
        "soot_propensity": 0.70,  # High soot in 1g; creates soot shells in microgravity
        "quench_limit_o2": 0.12,
        "roper_scale_factor": 1.15,
    },
}
