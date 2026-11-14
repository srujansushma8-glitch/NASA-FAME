# NASA-FLAME: End-to-End Data Flow

## 1. Complete Scientific Data Pipeline

The following diagram tracks scientific telemetry from NASA research archives and user parameters through the backend, simulation solver, AI diagnostics, and into the visualization tier.

```
[1. NASA Research & Datasets] (Member 3)
     - GRC Drop Tower Candle Flames (TM-107386)
     - ACME CFI Laminar Coflow Data
     - FLEX Droplet Combustion
     - SOFBALL Flame Ball Experiments
                 |
                 v
[2. Database & Seeds] (Member 2)
     - Alembic Relational Schema
     - Seed Experiments & Provenance
                 |
                 v
[3. User Configuration / API Request] (Member 1 & Member 2)
     - Fuel Type (Methane, Propane, Hydrogen, Heptane)
     - Gravity Acceleration (0g to 1g)
     - Ambient Pressure & Oxygen Percentage
                 |
                 v
[4. Simulation Engine & Numerical Solver] (Member 2 & Member 4)
     - Burke-Schumann Diffusion (0g) vs Buoyant Plume (1g)
     - Discrete Time Integration (dt = 0.1s)
     - 2D Spatial Scalar Grid (Res: 32x32 to 64x64)
                 |
                 +-----------------------+
                 |                       |
                 v                       v
[5. AI Diagnostics Engine]     [6. Structured Response Contract]
     (Member 4)                             (Member 2)
     - Fluid Scalers (Gr, Ri, Fr)           - SimulationResponse
     - Regime Classification                - Time-series arrays
     - Scientific Findings                  - Spatial matrix
                 |                               |
                 +-----------------------+-------+
                                         |
                                         v
                         [7. Data Adapter & Sanitizer]
                                    (Member 5)
                         - sanitizeTimeSeries()
                         - sanitizeScalarField()
                         - classifyGravityRegime()
                                         |
                                         v
                      [8. Interactive Visualization Suite]
                                    (Member 5)
                      - Flame3DViewer (Three.js WebGL)
                      - TemperatureDistributionChart (Canvas)
                      - FlameGeometryViewer (SVG Cross-sections)
                      - GravityComparisonChart (Delta Analysis)
                      - SimulationTimeline (Sparklines)
                      - ExperimentResultPanel (Dashboard)
                                         |
                                         v
                      [9. Frontend Application Dashboard]
                                    (Member 1)
```

---

## 2. API Schema Serialization Contracts

### 2.1 Backend to Visualization Contract (`SimulationResponse`)
```json
{
  "id": "SIM-8492A1",
  "experiment_id": "EXP-ISS-ACME-01",
  "status": "COMPLETED",
  "gravity_level_g": 0.00001,
  "flame_shape": "SPHERICAL",
  "flame_radius_mm": 6.8,
  "flame_height_mm": 13.6,
  "max_temperature_k": 1512.4,
  "burn_rate_mg_s": 1.18,
  "soot_volume_fraction": 0.16e-6,
  "extinction_time_s": null,
  "time_series": [
    {
      "time_s": 0.0,
      "flame_radius_mm": 0.0,
      "max_temperature_k": 298.15,
      "burning_rate_mg_s": 0.0,
      "soot_fraction": 0.0
    },
    {
      "time_s": 1.0,
      "flame_radius_mm": 6.2,
      "max_temperature_k": 1495.0,
      "burning_rate_mg_s": 1.10,
      "soot_fraction": 0.14e-6
    }
  ],
  "spatial_scalar_field": {
    "grid_x": [-20.0, -10.0, 0.0, 10.0, 20.0],
    "grid_y": [-20.0, -10.0, 0.0, 10.0, 20.0],
    "temperature_matrix": [
      [300.0, 420.0, 510.0, 420.0, 300.0],
      [420.0, 950.0, 1380.0, 950.0, 420.0],
      [510.0, 1380.0, 1512.4, 1380.0, 510.0],
      [420.0, 950.0, 1380.0, 950.0, 420.0],
      [300.0, 420.0, 510.0, 420.0, 300.0]
    ]
  },
  "provenance": {
    "dataOrigin": "EXPERIMENTAL_MEASURED",
    "facilityOrMission": "ISS Combustion Integrated Rack",
    "citation": "NASA TM-107386"
  }
}
```

### 2.2 AI Engine to Visualization Contract (`AIAnalysisSummary`)
```json
{
  "id": "ANL-9302B",
  "summary": "Combustion is strictly diffusion-controlled with zero buoyant convective flux.",
  "regime_classification": "Diffusive Spherical Quiescent",
  "confidence_score": 0.98,
  "dimensionless_numbers": {
    "grashof_number": 0.0,
    "richardson_number": 0.0,
    "froude_number": 999.0,
    "rayleigh_number": 0.0,
    "flicker_frequency_hz": 0.0
  },
  "scientific_findings": [
    "Absence of buoyant vortex shedding confirmed (flicker = 0 Hz).",
    "Radially symmetric boundary layer extends outward beyond 12mm.",
    "Enhanced radiative cooling observed in microgravity mantle."
  ],
  "recommendations": [
    "Maintain ambient oxygen above 15% to avoid radiative extinction."
  ]
}
```
