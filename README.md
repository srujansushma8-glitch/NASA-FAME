# NASA-FLAME: Flame in Freefall

An advanced scientific simulation, diagnostics, and visualization platform modeling microgravity combustion, droplet burning, and variable-gravity flame dynamics (0g to 1g).

## Overview

Flames behave fundamentally differently in microgravity compared to terrestrial gravity:
- **Microgravity (0g)**: Buoyancy-induced convective flows disappear ($Gr \approx 0$). Without upward natural convection, flames become radially symmetric spheres governed strictly by molecular diffusion (Burke-Schumann regime). Radiative heat loss dominates, soot particles linger in outer shells, and flames are vulnerable to radiative extinction.
- **Terrestrial Gravity (1g)**: Strong buoyant convection stretches the flame into an elongated teardrop with periodic vortex shedding (~10–15 Hz flicker instability) and convective oxygen feeding.
- **Partial Gravity (Lunar 0.16g / Martian 0.38g)**: Transitional regimes exhibiting base widening and low-frequency buoyant perturbations.

NASA-FLAME provides a modular architecture connecting frontend visualization, an AI diagnostic engine, a numerical combustion simulation engine, and a reliable FastAPI backend with relational storage.

---

## Architecture & Team Ownership

- `backend/`: **Member 2** (FastAPI, REST APIs, business logic, Member 3 & 4 integration adapters, test suite)
- `database/`: **Member 2** (SQLAlchemy models, Alembic migrations, reference NASA experiment seeds)
- `frontend/`: UI dashboards and interactive user controls
- `simulation/`: Combustion simulation numerical solvers
- `ai-engine/`: AI diagnostics and combustion regime classification
- `visualization/`: 3D and 2D spatial contour rendering

---

## Backend & API Features

- **FastAPI Core**: Modular routers, Pydantic v2 data contracts, CORS middleware, and OpenAPI / Swagger documentation (`/docs`).
- **Experiment CRUD**: Full lifecycle management of combustion experiment parameters (fuel, flow rate, oxidizer, oxygen percentage, pressure, gravity level).
- **Simulation Interface**: Runs simulations under variable gravity levels, producing structured scalar metrics, time-series data, and 2D spatial temperature contour grids.
- **AI Analysis Engine**: Computes fluid dynamic dimensionless scaling metrics (Grashof $Gr$, Richardson $Ri$, Froude $Fr$, Rayleigh $Ra$) and generates physics-based insights and recommendations.
- **Dual-Database Support**: PostgreSQL production capability with zero-configuration SQLite development fallback.
- **Health Diagnostics**: `/health` endpoint with active database verification and uptime metrics.

---

## Quick Start

### 1. Environment Setup

```powershell
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 2. Seed Reference Experiments (Optional)

```powershell
python database/seeds/seed_experiments.py
```

### 3. Run the Backend Server

```powershell
uvicorn backend.app.main:app --reload --port 8000
```

- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 4. Run Pytest Suite

```powershell
pytest backend/tests -v
```

---

## License

MIT License.
