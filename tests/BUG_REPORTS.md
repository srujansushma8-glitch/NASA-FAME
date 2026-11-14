# NASA-FLAME: Bug & Quality Assurance Reports

**Author**: Member 5 (Scientific Visualization, Testing & Documentation Engineer)  
**Status**: Active Audit & Quality Log  
**Policy**: In accordance with project instructions, bugs detected in peer modules are formally cataloged below with replication steps and proposed fixes. No peer module is silently modified without cross-member coordination.

---

## Bug Report Index

| Bug ID | Title | Module Owner | Severity | Status |
|---|---|---|---|---|
| **BUG-M5-001** | Zero-Division Risk in Flame Aspect Ratio Calculation | Member 4 / Member 5 | Low | Resolved in Visualization Adapter |
| **BUG-M5-002** | Discretization Clamping at Ambient Temperature ($298.15\text{ K}$) | Member 4 (AI Engine) | Minor | Resolved in Physics Formula |
| **BUG-M5-003** | Headless WebGL Context Texture Creation in Non-GPU Runners | Member 1 / Member 5 | Medium | Resolved with Safe Canvas Fallback |
| **BUG-M5-004** | Discontinuity at Extinction Threshold ($\text{O}_2 = 13.0\%$) | Member 2 (Backend Solver) | Medium | Coordinated with Member 2 |
| **BUG-M5-005** | Time Series Sorting Inversion in Asynchronous Batches | Member 2 / Member 4 | Minor | Resolved in Data Transformers |

---

### BUG-M5-001: Zero-Division Risk in Flame Aspect Ratio Calculation

- **Module**: `ai-engine/schemas.py` / `visualization/utils/dataTransformers.ts`
- **Owner**: Member 4 & Member 5
- **Severity**: Low
- **Description**: If a simulation run experiences complete flame extinction or records an unphysical zero flame width ($W = 0.0\text{ mm}$), computing the aspect ratio $L/W$ throws a division-by-zero runtime exception (`ZeroDivisionError` in Python / `Infinity` in JavaScript).
- **Steps to Reproduce**:
  1. Pass an extinguished simulation result with `flame_width_mm: 0.0` to the geometry analyzer.
  2. Attempt to evaluate $L/W$.
- **Expected Behaviour**: The aspect ratio should evaluate to $0.0$ or a protected floor of $\epsilon = 0.1\text{ mm}$, preventing mathematical crashes.
- **Actual Behaviour**: JavaScript produced `Infinity`, which caused SVG coordinate render errors in SVG path definitions.
- **Resolution**: Implemented `Math.max(0.1, currentWidth)` inside `FlameGeometryViewer` and sanitized aspect ratio calculations with an extinction check.

---

### BUG-M5-002: Discretization Clamping at Ambient Temperature ($298.15\text{ K}$)

- **Module**: `ai-engine/temperature_analyzer.py` / `visualization/utils/flamePhysics.ts`
- **Owner**: Member 4 & Member 5
- **Severity**: Minor
- **Description**: 1D radial temperature decay profiles using `toFixed(1)` truncated standard room temperature $298.15\text{ K}$ to $298.1\text{ K}$, causing automated thermodynamic bounds assertions to register negative differential relative to $T_\infty$.
- **Steps to Reproduce**:
  1. Call `calculateRadialTemperature(30.0, 5.0, 1750, 298.15)`.
  2. Check if output temperature is $\ge 298.15\text{ K}$.
- **Expected Behaviour**: At asymptotic radial distances $r \to \infty$, the gas temperature should strictly equal or exceed $T_{\text{ambient}}$.
- **Actual Behaviour**: Due to 1-decimal truncation, $298.1\text{ K} < 298.15\text{ K}$ occurred.
- **Resolution**: Increased precision to two decimal places (`toFixed(2)`) and wrapped in `Math.max(ambient_temp_k, temp)`.

---

### BUG-M5-003: Headless WebGL Context Texture Creation in Non-GPU Runners

- **Module**: `visualization/components/Flame3DViewer/Flame3DViewer.tsx`
- **Owner**: Member 5
- **Severity**: Medium
- **Description**: When executing automated UI test suites or running on headless Linux CI containers lacking hardware GPU acceleration, Three.js `WebGLRenderer` throws a context creation error (`gl.createTexture is not a function`).
- **Steps to Reproduce**:
  1. Render `<Flame3DViewer />` in a standard jsdom or virtual framebuffer environment without native WebGL bindings.
- **Expected Behaviour**: The 3D viewer should catch the WebGL context creation exception, log an informative diagnostic note, and maintain component stability with a high-precision 2D Canvas or SVG fallback HUD.
- **Actual Behaviour**: Uncaught exception could crash parent component trees if not enclosed in a try/catch boundary.
- **Resolution**: Wrapped Three.js renderer initialization in a robust `try...catch` block, populated `webglError` state, and provided complete fallback test mocks in `tests/setup.ts`.

---

### BUG-M5-004: Discontinuity at Extinction Threshold ($\text{O}_2 = 13.0\%$)

- **Module**: `backend/app/services/simulation_service.py`
- **Owner**: Member 2
- **Severity**: Medium
- **Description**: In `simulation_service.py`, line 152 checks `if oxygen_pct < 13.0:` for extinction. If oxygen concentration is exactly $13.0\%$, the solver treats the flame as fully buoyant and burning at peak temperature without transitional quenching or cool flame behavior.
- **Steps to Reproduce**:
  1. Configure an experiment with `oxygen_pct = 13.0`.
  2. Run simulation.
- **Expected Behaviour**: Near the flammability limit ($12.5\% - 13.5\% \text{ O}_2$), the flame should exhibit transitional oscillatory instability or cool flame behavior.
- **Actual Behaviour**: Discrete step function where $12.99\%$ quenches immediately but $13.0\%$ burns vigorously at $2200\text{ K}$.
- **Proposed Coordinated Fix**: Coordinate with Member 2 to introduce a smooth sigmoidal damping function near flammability extinction limits:
  $$\phi_{\text{quench}} = \frac{1}{1 + \exp(-k(\text{O}_2 - \text{O}_{2,\text{crit}}))}$$

---

### BUG-M5-005: Time Series Sorting Inversion in Asynchronous Batches

- **Module**: `visualization/utils/dataTransformers.ts`
- **Owner**: Member 5
- **Severity**: Minor
- **Description**: If time series packets from discrete multi-core solver threads arrive out of chronological order, timeline scrubbers and sparkline plots produce zig-zagging retro-grade SVG paths.
- **Steps to Reproduce**:
  1. Pass unsorted time-series array `[{time_s: 1.0}, {time_s: 0.2}]` to `SimulationTimeline`.
- **Expected Behaviour**: Time series must always be strictly monotonically increasing.
- **Actual Behaviour**: SVG paths rendered overlapping horizontal segments.
- **Resolution**: Implemented automatic chronological sorting in `sanitizeTimeSeries`: `.sort((a, b) => a.time_s - b.time_s)`.
