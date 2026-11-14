# NASA-FLAME: Simulation Engine API & Integration Reference
## Interface Contracts for Member 2 (Backend) and Member 5 (Visualization)

---

### 1. Integration with Member 2 (Backend)

The simulation engine is fully modular, stateless, and exposes clean Python functions via `simulation`:

```python
from simulation import (
    validate_parameters,
    run_simulation,
    simulate_normal_gravity,
    simulate_microgravity,
    compare_simulations,
    export_results,
    SimulationParameters,
    PARAMETER_METADATA,
)
```

#### 1.1 `validate_parameters(params: dict) -> (bool, dict, list[str])`
Validates user input against physical ranges and schema rules before initiating computation.

- **Input:** Raw dictionary of user parameters.
- **Output:**
  - `is_valid` (`bool`): `True` if parameters conform to physical limits.
  - `sanitized_params` (`dict`): Cleaned dictionary with clamped values and default fallbacks.
  - `errors` (`list[str]`): List of human-readable error descriptions.

```python
is_valid, clean_params, errors = validate_parameters({
    "fuel_flow_rate": 3.0,
    "oxygen_mole_fraction": 0.21,
    "gravity": 9.81
})
```

#### 1.2 `run_simulation(params: dict) -> dict`
Executes a combustion simulation run and returns structured numerical data.

**Input Parameter Schema:**
| Parameter | Type | Default | Valid Range | Physical Unit | Description |
|---|---|---|---|---|---|
| `condition_type` | `str` | `"normal_gravity"` | `["normal_gravity", "microgravity", "custom"]` | categorical | Experiment gravity condition |
| `gravity` | `float` | `9.80665` | `[0.0, 25.0]` | $\text{m/s}^2$ | Gravitational acceleration |
| `initial_temperature` | `float` | `298.15` | `[200.0, 500.0]` | $\text{K}$ | Ambient initial chamber temperature |
| `ambient_pressure` | `float` | `101325.0` | `[20000.0, 300000.0]` | $\text{Pa}$ | Chamber pressure |
| `oxygen_mole_fraction` | `float` | `0.21` | `[0.08, 0.45]` | dimensionless | $O_2$ mole fraction in ambient atmosphere |
| `fuel_type` | `str` | `"methane"` | `["methane", "propane", "butane", "ethylene", "heptane"]` | categorical | Chemical fuel species |
| `fuel_flow_rate` | `float` | `2.5` | `[0.1, 50.0]` | $\text{mg/s}$ | Fuel mass injection rate |
| `burner_radius` | `float` | `2.0` | `[0.5, 15.0]` | $\text{mm}$ | Burner injector tube radius |
| `duration` | `float` | `5.0` | `[0.5, 30.0]` | $\text{s}$ | Duration of simulated experiment |
| `time_steps` | `int` | `25` | `[5, 100]` | count | Time-series sampling points |
| `grid_resolution_r` | `int` | `35` | `[15, 80]` | count | 2D radial grid cell count |
| `grid_resolution_z` | `int` | `45` | `[20, 100]` | count | 2D axial grid cell count |

#### 1.3 `simulate_normal_gravity(params: dict = None) -> dict`
Shortcut to execute Earth 1g ($9.81\,\text{m/s}^2$) simulation.

#### 1.4 `simulate_microgravity(params: dict = None) -> dict`
Shortcut to execute microgravity ($1.0 \times 10^{-6}\,\text{m/s}^2$) simulation.

#### 1.5 `compare_simulations(normal_results: dict, micro_results: dict) -> dict`
Produces side-by-side comparison with geometric deltas, percent changes, thermal shifts, and physical insights.

#### 1.6 `export_results(results: dict, filepath: str = None, format: str = "json") -> str`
Serializes results into formatted JSON string or saves directly to disk.

---

### 2. Integration with Member 5 (Visualization)

The simulation engine generates structured numerical arrays designed for conversion into charts, 2D heatmaps, and 3D WebGL/Three.js geometry.

#### 2.1 2D Flame Representations
`results["flame_geometry"]["contour_2d"]`:
- List of `{"r_mm": float, "z_mm": float}` points outlining the stoichiometric flame boundary.
- For 1g: Traces a slender, tapered teardrop profile with inward entrainment.
- For $\mu g$: Traces a wide, hemispherical/spherical dome profile.

#### 2.2 3D Watertight Triangle Mesh
`results["flame_geometry"]["mesh_3d"]`:
Direct drop-in for Three.js `BufferGeometry`:
- `vertices`: `[[x, y, z], ...]` in mm coordinates.
- `normals`: `[[nx, ny, nz], ...]` normalized surface normal vectors.
- `uvs`: `[[u, v], ...]` texture UV coordinates.
- `faces`: `[[v0, v1, v2], ...]` triangular face indices.
- `vertex_temperatures_K`: `[T0, T1, ...]` temperature at each vertex for thermographic colormapping.

#### 2.3 2D Temperature Field Heatmap
`results["temperature_distribution"]`:
- `grid_r_mm`: 1D array of radial coordinates $[0 \dots R_{max}]$.
- `grid_z_mm`: 1D array of axial coordinates $[0 \dots Z_{max}]$.
- `temperature_grid_K`: 2D nested array $[z\_index][r\_index]$ of local temperature values in Kelvin.
- `axial_profile`: Centerline profile along $r = 0\,\text{mm}$ (`{"z_mm", "temperature_K"}`).
- `radial_profile_mid`: Radial profile across $z = \frac{1}{2} L_f$ (`{"r_mm", "temperature_K"}`).

#### 2.4 Simulation Timelines & Comparison Charts
`results["time_series"]`:
- `time_points_s`: $[t_0, t_1, \dots, t_{end}]$.
- `height_history_mm`: Transient flame height evolution (including 1g buoyant flickering or smooth microgravity expansion).
- `width_history_mm`: Transient flame width growth.
- `peak_temperature_history_K`: Thermal heating curve from ambient $T_0$ to steady-state.
- `convective_velocity_history_m_s`: Velocity development curve.
