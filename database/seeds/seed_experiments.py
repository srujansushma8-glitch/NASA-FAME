"""Seed script to populate reference NASA combustion experiments."""

import sys
from pathlib import Path

# Setup paths
repo_root = Path(__file__).resolve().parent.parent.parent
backend_dir = repo_root / "backend"
for p in [str(repo_root), str(backend_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from backend.app.core.database import SessionLocal, init_db
from backend.app.models.experiment import Experiment, ExperimentMetadata
from backend.app.models.simulation import SimulationResult
from backend.app.models.analysis import AnalysisResult


REFERENCE_EXPERIMENTS = [
    {
        "name": "ISS CIR/ACME Spherical Methane Flame",
        "description": "Combustion Integrated Rack (CIR) Advanced Combustion via Microgravity Experiments (ACME) investigating pure diffusion spherical methane flames without natural convection.",
        "fuel_type": "Methane",
        "fuel_flow_rate_sccm": 12.5,
        "oxidizer": "Air (21% O2, 79% N2)",
        "oxygen_percentage": 21.0,
        "pressure_atm": 1.0,
        "ambient_temperature_k": 298.15,
        "gravity_level_g": 0.0,
        "burner_diameter_mm": 6.35,
        "chamber_volume_liters": 110.0,
        "status": "COMPLETED",
        "metadata": {
            "investigator": "Dr. D. L. Dietrich (NASA GRC)",
            "facility": "ISS Combustion Integrated Rack (CIR)",
            "tags": ["ISS", "microgravity", "ACME", "spherical", "diffusion"],
            "notes": "Spherical flame envelope established. Radiative extinction observed at low flow rates.",
        },
    },
    {
        "name": "Glenn Zero-G Drop Tower Heptane Droplet Burning",
        "description": "Drop tower investigation of isolated single n-heptane fuel droplet combustion in microgravity under the d^2-law regime.",
        "fuel_type": "Heptane",
        "oxidizer": "Air (21% O2, 79% N2)",
        "oxygen_percentage": 21.0,
        "pressure_atm": 1.0,
        "ambient_temperature_k": 295.0,
        "gravity_level_g": 0.0,
        "initial_droplet_diameter_mm": 1.8,
        "chamber_volume_liters": 25.0,
        "status": "COMPLETED",
        "metadata": {
            "investigator": "Dr. F. A. Williams (UC San Diego / NASA)",
            "facility": "NASA Glenn 2.2-Second Drop Tower",
            "tags": ["drop-tower", "droplet-combustion", "d2-law", "heptane"],
            "notes": "Symmetric spherical burning observed. Burn rate constant K = 0.78 mm^2/s.",
        },
    },
    {
        "name": "Lunar Surface 0.16g Propane Burner Analogue",
        "description": "Parabolic aircraft flight testing propane diffusion flame morphology under lunar equivalent gravitational acceleration (0.166g).",
        "fuel_type": "Propane",
        "fuel_flow_rate_sccm": 25.0,
        "oxidizer": "Air (21% O2, 79% N2)",
        "oxygen_percentage": 21.0,
        "pressure_atm": 1.0,
        "ambient_temperature_k": 298.15,
        "gravity_level_g": 0.166,
        "burner_diameter_mm": 10.0,
        "chamber_volume_liters": 45.0,
        "status": "COMPLETED",
        "metadata": {
            "investigator": "Artemis Lunar Fire Safety Group",
            "facility": "NASA Reduced Gravity Aircraft",
            "tags": ["lunar", "parabolic-flight", "partial-g", "transitional"],
            "notes": "Flame exhibited widened base with intermediate buoyant flicker at ~4 Hz.",
        },
    },
    {
        "name": "Martian Atmosphere 0.38g Reduced Pressure Flame",
        "description": "Evaluation of methane combustion in a Martian ambient pressure (0.7 atm test cell) at 0.38g gravity.",
        "fuel_type": "Methane",
        "fuel_flow_rate_sccm": 18.0,
        "oxidizer": "Simulated Habitat Air (30% O2, 70% N2)",
        "oxygen_percentage": 30.0,
        "pressure_atm": 0.7,
        "ambient_temperature_k": 293.15,
        "gravity_level_g": 0.38,
        "burner_diameter_mm": 8.0,
        "chamber_volume_liters": 60.0,
        "status": "COMPLETED",
        "metadata": {
            "investigator": "Mars Exploration Safety Working Group",
            "facility": "Hypobaric Centrifuge Chamber",
            "tags": ["mars", "habitat-safety", "reduced-pressure", "methane"],
            "notes": "Oxygen enrichment compensates for reduced pressure; stable flame with moderate height.",
        },
    },
    {
        "name": "Terrestrial 1g Baseline Methane Plume",
        "description": "Standard ground-based Earth gravity (1.0g) reference experiment establishing baseline buoyant convection and soot dynamics.",
        "fuel_type": "Methane",
        "fuel_flow_rate_sccm": 20.0,
        "oxidizer": "Air (21% O2, 79% N2)",
        "oxygen_percentage": 21.0,
        "pressure_atm": 1.0,
        "ambient_temperature_k": 298.15,
        "gravity_level_g": 1.0,
        "burner_diameter_mm": 6.35,
        "chamber_volume_liters": 110.0,
        "status": "COMPLETED",
        "metadata": {
            "investigator": "NASA Flame Benchmark Laboratory",
            "facility": "Ground Reference Test Cell",
            "tags": ["earth-baseline", "1g", "convective-plume", "buoyancy"],
            "notes": "Characteristic teardrop flame with buoyant flicker frequency of ~12 Hz.",
        },
    },
]


def seed_database():
    """Seeds the database with canonical NASA microgravity experiments."""
    init_db()
    db = SessionLocal()
    try:
        existing_count = db.query(Experiment).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} experiments. Skipping seed.")
            return

        print("Seeding database with reference NASA microgravity experiments...")
        for data in REFERENCE_EXPERIMENTS:
            data_copy = dict(data)
            meta_data = data_copy.pop("metadata", None)
            exp = Experiment(**data_copy)
            db.add(exp)
            db.flush()

            if meta_data:
                meta = ExperimentMetadata(
                    experiment_id=exp.id,
                    investigator=meta_data.get("investigator"),
                    facility=meta_data.get("facility"),
                    tags=meta_data.get("tags", []),
                    notes=meta_data.get("notes"),
                )
                db.add(meta)

        db.commit()
        print(f"Successfully seeded {len(REFERENCE_EXPERIMENTS)} NASA reference experiments.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

