# NASA-FLAME: System Architecture

## 1. Executive Mission & System Overview

**NASA-FLAME (Flame in Freefall)** is an integrated scientific diagnostics, simulation, and 3D visualization platform designed to model and analyze combustion behavior under variable gravity conditions—from terrestrial gravity ($1g \approx 9.81\text{ m/s}^2$) to Martian ($0.38g$), Lunar ($0.16g$), and orbital microgravity ($\mu g \approx 10^{-6}\text{ to } 10^{-4}g$).

Flames behave in a fundamentally counter-intuitive manner when buoyant convection is removed:
- In terrestrial gravity ($1g$), hot exhaust gases rise rapidly due to density gradients, drawing in fresh oxygen and stretching the flame into an elongated, flickering teardrop with strong soot incandescence.
- In microgravity ($0g$), natural convection vanishes entirely ($Gr \approx 0$). Without buoyancy, mass transport is governed exclusively by molecular diffusion, producing a spherical, stationary, flicker-free flame characterized by dim blue chemiluminescent emissions, prolonged residence times, and increased vulnerability to radiative extinction.

---

## 2. Multi-Tier Distributed Architecture

```
+-----------------------------------------------------------------------------------+
|                           NASA-FLAME PRESENTATION TIER                            |
|                                                                                   |
|  +--------------------------+  +-----------------------------------------------+  |
|  | Member 1: Frontend UI    |  | Member 5: Scientific Visualization Suite     |  |
|  | - React Dashboard        |  | - Flame3DViewer (Three.js WebGL Engine)       |  |
|  | - Experiment Form Config |  | - TemperatureDistributionChart (2D Contours)  |  |
|  | - Telemetry Controls     |  | - FlameGeometryViewer (Orthographic Profiles) |  |
|  | - Session State          |  | - GravityComparisonChart (Delta Analysis)     |  |
|  |                          |  | - SimulationTimeline (Sparkline Scrubber)     |  |
|  |                          |  | - ExperimentResultPanel (Scientific Telemetry)|  |
|  +--------------------------+  +-----------------------------------------------+  |
+------------------------------------------^----------------------------------------+
                                           | HTTP REST / JSON Contracts
+------------------------------------------v----------------------------------------+
|                             APPLICATION & API TIER                                |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Member 2: FastAPI Backend Engine                                            |  |
|  | - REST Endpoints: /experiments, /simulations, /analysis, /health            |  |
|  | - Validation Pipeline: Pydantic v2 Models & Typed Schemas                  |  |
|  | - Relational ORM: SQLAlchemy with PostgreSQL / SQLite fallback               |  |
|  +-----------------------^-----------------------------^-----------------------+  |
|                          |                             |                          |
|  +-----------------------v-------+     +---------------v-----------------------+  |
|  | Member 4: AI & ML Engine      |     | Member 3: Physical Modeling & Data    |  |
|  | - Dimensionless Scalers       |     | - NASA GRC Drop Tower Datasets        |  |
|  |   (Gr, Ri, Fr, Ra, Le)        |     | - ISS CIR / ACME & FLEX Experiments   |  |
|  | - Regime Classification (PINN)|     | - Burke-Schumann Formulations         |  |
|  | - Anomaly & Pattern Detectors |     | - Optical & Sensor Calibration Data   |  |
|  +-------------------------------+     +---------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 3. Team Ownership & Module Boundaries

| Module Path | Team Member | Primary Responsibility |
|---|---|---|
| `frontend/` | **Member 1** | Application shell, page layout, user navigation, experiment input forms, and integration of visualization modules. |
| `backend/` & `database/` | **Member 2** | FastAPI REST service, SQLAlchemy models, database migrations, security, and multi-threaded simulation adapters. |
| `research/` | **Member 3** | NASA empirical dataset curation, physical combustion formulations, and ground-truth data provenance verification. |
| `ai-engine/` & `simulation/` | **Member 4** | Machine learning surrogate models, dimensionless fluid scaling groups ($Gr, Ri, Fr, Ra$), and automated scientific insights. |
| `visualization/`, `tests/`, `docs/` | **Member 5** | Three.js WebGL 3D flame viewer, Canvas 2D contour heatmaps, comparative charts, Vitest component test suites, Playwright E2E tests, and documentation. |

---

## 4. Hardware & Software Requirements

- **Runtime Engine**: Node.js v18+ (tested on Node.js v26.8.1) and Python 3.10+ (tested on Python 3.14.6).
- **Graphics Pipeline**: WebGL 1.0 / 2.0 with HTML5 Canvas fallback for headless/server-side rendering.
- **Frontend Stack**: TypeScript 5.3+, React 18+, Three.js 0.160+, Vitest 1.3+, Playwright 1.42+.
- **Backend Stack**: FastAPI, Uvicorn, Pydantic v2, SQLAlchemy 2.0, SQLite / PostgreSQL.
