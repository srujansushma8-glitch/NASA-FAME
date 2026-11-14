# NASA-FLAME: Database Architecture & Migrations

This directory contains database schemas, Alembic migrations, and seed datasets for **NASA-FLAME: Flame in Freefall**.

## Schema Overview

The database stores combustion physics parameters, experimental metadata, numerical simulation results, and AI-driven diagnostic explanations.

```mermaid
erDiagram
    EXPERIMENTS ||--o| EXPERIMENT_METADATA : has
    EXPERIMENTS ||--o{ SIMULATION_RESULTS : generates
    EXPERIMENTS ||--o{ ANALYSIS_RESULTS : evaluates
    SIMULATION_RESULTS ||--o{ ANALYSIS_RESULTS : analyzed_by

    EXPERIMENTS {
        string id PK
        string name
        string fuel_type
        float fuel_flow_rate_sccm
        string oxidizer
        float oxygen_percentage
        float pressure_atm
        float ambient_temperature_k
        float gravity_level_g
        float burner_diameter_mm
        float initial_droplet_diameter_mm
        float chamber_volume_liters
        string status
        datetime created_at
        datetime updated_at
    }

    EXPERIMENT_METADATA {
        string id PK
        string experiment_id FK
        string investigator
        string facility
        json tags
        text notes
        json extra_attributes
        datetime created_at
        datetime updated_at
    }

    SIMULATION_RESULTS {
        string id PK
        string experiment_id FK
        string status
        float gravity_level_g
        string flame_shape
        float flame_radius_mm
        float flame_height_mm
        float max_temperature_k
        float burn_rate_mg_s
        float soot_volume_fraction
        float extinction_time_s
        json time_series_data
        json spatial_scalar_field
        float execution_duration_ms
        text error_message
        datetime created_at
        datetime completed_at
    }

    ANALYSIS_RESULTS {
        string id PK
        string experiment_id FK
        string simulation_id FK
        string status
        text summary
        string regime_classification
        json dimensionless_numbers
        json scientific_findings
        json recommendations
        float confidence_score
        string ai_model_used
        text error_message
        datetime created_at
        datetime completed_at
    }
```

## Supported Databases

1. **SQLite (Development Default)**:
   - Zero-configuration local database (`sqlite:///./nasa_flame.db`).
   - Tables are auto-created at application startup via `init_db()`.
2. **PostgreSQL (Production / Staging)**:
   - Configured via environment variable `DATABASE_URL=postgresql://user:pass@host:5432/nasa_flame`.
   - Uses `psycopg2-binary` connection driver with connection pooling (`pool_size=10`, `max_overflow=20`, `pool_pre_ping=True`).

## Alembic Migrations

To apply migrations manually:

```powershell
# From the backend directory
alembic upgrade head
```

To create a new migration after updating SQLAlchemy models:

```powershell
alembic revision --autogenerate -m "description_of_changes"
```

## Seeding the Database

Populate canonical NASA experiments (ISS CIR ACME, Glenn Drop Tower, Lunar 0.16g, Martian 0.38g, and Earth 1g):

```powershell
python database/seeds/seed_experiments.py
```

