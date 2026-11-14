"""Interactive demonstration CLI for NASA-FLAME Scientific Simulation Engine.

Demonstrates side-by-side comparison between normal gravity (1g) and microgravity (ug).
"""

import sys
import json
from simulation.api import (
    simulate_normal_gravity,
    simulate_microgravity,
    compare_simulations,
    export_results,
    validate_parameters,
)
from simulation.core.physical_constants import FUEL_DATABASE


def print_banner():
    print("=" * 78)
    print("         NASA-FLAME: FLAME IN FREEFALL - SIMULATION ENGINE")
    print("    Member 4: Scientific Simulation & Computational Modeling Engineer")
    print("=" * 78)


def main():
    print_banner()

    print("\n[1/4] Validating default simulation parameters...")
    test_params = {
        "fuel_type": "methane",
        "fuel_flow_rate": 2.5,  # mg/s
        "burner_radius": 2.0,   # mm
        "oxygen_mole_fraction": 0.21,
        "initial_temperature": 298.15,
        "ambient_pressure": 101325.0,
        "duration": 5.0,
        "time_steps": 25,
    }
    is_valid, sanitized, errors = validate_parameters(test_params)
    print(f"Validation status: {'PASSED' if is_valid else 'FAILED'}")
    print(f"Fuel: {sanitized['fuel_type'].capitalize()} ({FUEL_DATABASE[sanitized['fuel_type']]['formula']})")
    print(f"Mass Flow Rate: {sanitized['fuel_flow_rate']} mg/s | Oxygen: {sanitized['oxygen_mole_fraction']*100:.1f}%")

    print("\n[2/4] Executing Normal Gravity (1g = 9.81 m/s²) Simulation...")
    sim_1g = simulate_normal_gravity(test_params)
    g_1g = sim_1g["flame_geometry"]
    p_1g = sim_1g["physical_quantities"]
    t_1g = sim_1g["temperature_distribution"]
    print(f"  -> Flame Height:     {g_1g['height_mm']:.2f} mm")
    print(f"  -> Flame Width:      {g_1g['width_mm']:.2f} mm (Aspect Ratio: {g_1g['aspect_ratio']:.2f})")
    print(f"  -> Morphology:       {g_1g['shape_classification']}")
    print(f"  -> Peak Temperature: {t_1g['peak_temperature_K']:.1f} K")
    print(f"  -> Buoyant Velocity: {p_1g['convective_velocity_max_m_s']:.3f} m/s")
    print(f"  -> Richardson No:    {p_1g['richardson_number']:.2e} ({p_1g['dominant_transport_regime']})")
    print(f"  -> Flickering Inst:  {p_1g['flicker_frequency_hz']:.1f} Hz (Buoyant puffing)")
    print(f"  -> Radiation Loss:   {p_1g['radiative_fraction']*100:.1f}% ({p_1g['radiative_loss_rate_W']:.2f} W)")

    print("\n[3/4] Executing Microgravity (μg = 1.0e-6 m/s²) Simulation...")
    sim_ug = simulate_microgravity(test_params)
    g_ug = sim_ug["flame_geometry"]
    p_ug = sim_ug["physical_quantities"]
    t_ug = sim_ug["temperature_distribution"]
    print(f"  -> Flame Height:     {g_ug['height_mm']:.2f} mm")
    print(f"  -> Flame Width:      {g_ug['width_mm']:.2f} mm (Aspect Ratio: {g_ug['aspect_ratio']:.2f})")
    print(f"  -> Morphology:       {g_ug['shape_classification']}")
    print(f"  -> Peak Temperature: {t_ug['peak_temperature_K']:.1f} K (Cooler due to high radiative loss)")
    print(f"  -> Convective Flow:  {p_ug['convective_velocity_max_m_s']:.4f} m/s (Near-zero buoyant flow)")
    print(f"  -> Richardson No:    {p_ug['richardson_number']:.2e} ({p_ug['dominant_transport_regime']})")
    print(f"  -> Flickering Inst:  {p_ug['flicker_frequency_hz']:.1f} Hz (Steady quiescent flame ball)")
    print(f"  -> Radiation Loss:   {p_ug['radiative_fraction']*100:.1f}% ({p_ug['radiative_loss_rate_W']:.2f} W)")

    print("\n[4/4] Side-by-Side Physical Comparison:")
    comp = compare_simulations(sim_1g, sim_ug)
    diffs = comp["geometry_comparison"]["differences"]
    print("-" * 78)
    print(f" Metric                     Normal Gravity (1g)    Microgravity (μg)      Change")
    print("-" * 78)
    print(f" Flame Height               {g_1g['height_mm']:8.2f} mm        {g_ug['height_mm']:8.2f} mm       {diffs['percent_height_change']:+6.1f}%")
    print(f" Flame Width                {g_1g['width_mm']:8.2f} mm        {g_ug['width_mm']:8.2f} mm       {diffs['percent_width_change']:+6.1f}%")
    print(f" Aspect Ratio (L/W)         {g_1g['aspect_ratio']:8.2f}           {g_ug['aspect_ratio']:8.2f}          {diffs['percent_aspect_ratio_change']:+6.1f}%")
    print(f" Peak Temperature           {t_1g['peak_temperature_K']:8.1f} K         {t_ug['peak_temperature_K']:8.1f} K        {comp['energetics_and_transport']['peak_temperature_difference_K']:+6.1f} K")
    print(f" Radiative Heat Fraction    {p_1g['radiative_fraction']*100:8.1f} %         {p_ug['radiative_fraction']*100:8.1f} %        {(p_ug['radiative_fraction']-p_1g['radiative_fraction'])*100:+6.1f}%")
    print(f" Convective Velocity        {p_1g['convective_velocity_max_m_s']:8.3f} m/s       {p_ug['convective_velocity_max_m_s']:8.4f} m/s      x{p_1g['convective_velocity_max_m_s']/max(1e-4, p_ug['convective_velocity_max_m_s']):.1f} drop")
    print(f" Flickering Frequency       {p_1g['flicker_frequency_hz']:8.1f} Hz        {p_ug['flicker_frequency_hz']:8.1f} Hz        Quiescent")
    print("-" * 78)

    print("\nKey Scientific Insights:")
    for i, insight in enumerate(comp["scientific_insights"], 1):
        print(f" [{i}] {insight}\n")

    print("=" * 78)
    print("Simulation execution completed successfully.")
    print("Structured numerical output generated for Backend (Member 2) & Visualization (Member 5).")


if __name__ == "__main__":
    main()
