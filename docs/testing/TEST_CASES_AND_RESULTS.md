# NASA-FLAME: Test Cases & Execution Results

**Author**: Member 5 (Scientific Visualization, Testing & Documentation Engineer)  
**Test Framework**: Vitest v1.6.1 + React Testing Library + JSDOM  
**Status**: All 55 Unit and Component Tests Passing (100% Pass Rate)

---

## 1. Test Suite Summary Matrix

| Test Suite File | Domain | Tests Executed | Passed | Failed | Status |
|---|---|---|---|---|---|
| `tests/unit/flamePhysics.test.ts` | Scientific Formulas & Scaling Laws | 12 | 12 | 0 | **PASS** |
| `tests/unit/dataTransformers.test.ts` | Data Sanitization & Adapters | 9 | 9 | 0 | **PASS** |
| `tests/components/Flame3DViewer.test.tsx` | 3D WebGL Viewport & HUD | 7 | 7 | 0 | **PASS** |
| `tests/components/TemperatureDistributionChart.test.tsx` | 2D Contour & Radial Gradient Charts | 6 | 6 | 0 | **PASS** |
| `tests/components/FlameGeometryViewer.test.tsx` | 2D Orthographic Cross-Section | 5 | 5 | 0 | **PASS** |
| `tests/components/GravityComparisonChart.test.tsx` | 1g vs 0g Parameter Comparison | 5 | 5 | 0 | **PASS** |
| `tests/components/SimulationTimeline.test.tsx` | Timeline Scrubber & Sparklines | 5 | 5 | 0 | **PASS** |
| `tests/components/ExperimentResultPanel.test.tsx` | Results Dashboard & Provenance | 6 | 6 | 0 | **PASS** |
| **TOTAL** | — | **55** | **55** | **0** | **PASS** |

---

## 2. Detailed Test Specifications

### 2.1 Scientific Combustion Physics (`flamePhysics.test.ts`)
- **TC-PHY-01**: Verifies flicker frequency evaluates strictly to $0.00\text{ Hz}$ in microgravity ($g \le 0.05g$).
- **TC-PHY-02**: Verifies flicker frequency in $1g$ for a $4\text{ mm}$ burner falls within the physical range $15 - 30\text{ Hz}$.
- **TC-PHY-03**: Verifies flicker frequency scales inversely with burner diameter ($f \propto 1/\sqrt{D}$).
- **TC-PHY-04**: Validates Grashof number ($Gr$) evaluates to zero in microgravity and $>10^4$ in $1g$.
- **TC-PHY-05**: Validates Richardson number ($Ri$) evaluates to zero without gravity.
- **TC-PHY-06**: Asserts buoyant convective draft velocity evaluates to $0\text{ m/s}$ in $0g$ and $1.0 - 2.5\text{ m/s}$ in $1g$.
- **TC-PHY-07**: Confirms radial temperature profile decays monotonically toward ambient temperature ($298.15\text{ K}$) at large distances.

### 2.2 Data Sanitizers & Transformers (`dataTransformers.test.ts`)
- **TC-DAT-01**: Asserts `sanitizeTimeSeries` handles null, undefined, or empty arrays without crashing.
- **TC-DAT-02**: Verifies invalid timestamps and NaN numeric values are sanitized and sorted chronologically.
- **TC-DAT-03**: Asserts malformed 2D scalar fields are safely intercepted and replaced with null.
- **TC-DAT-04**: Validates gravity regime classification ($0g \to \text{MICROGRAVITY}$, $0.16g / 0.38g \to \text{PARTIAL\_GRAVITY}$, $1.0g \to \text{NORMAL\_1G}$).
- **TC-DAT-05**: Confirms `normalizeSimulationData` populates safe defaults and fallback provenance metadata.

### 2.3 3D Flame Viewport (`Flame3DViewer.test.tsx`)
- **TC-3D-01**: Verifies scene initialization, canvas mounting, and header rendering.
- **TC-3D-02**: Confirms scientific HUD displays $0.00\text{ Hz (Steady)}$ for $0g$ data.
- **TC-3D-03**: Confirms scientific HUD displays non-zero draft velocity and flicker frequency for $1g$ data.
- **TC-3D-04**: Validates provenance badge rendering for empirical vs procedural models.
- **TC-3D-05**: Asserts camera preset buttons (`side`, `top`, `standoff`, `isometric`, `reset`) fire camera angle updates.
- **TC-3D-06**: Validates play/pause toggle interaction and state switching.
- **TC-3D-07**: Confirms robust, crash-free fallback when simulation data is null.

### 2.4 Temperature Distribution Chart (`TemperatureDistributionChart.test.tsx`)
- **TC-TMP-01**: Verifies initial header and tab buttons render with peak temperature.
- **TC-TMP-02**: Validates switching to the Radial $T(r)$ tab and rendering the reaction zone band.
- **TC-TMP-03**: Validates switching to the Temporal $T(t)$ tab and rendering time evolution curves.
- **TC-TMP-04**: Validates switching to the 0g vs 1g Comparison tab and rendering physical explanations.
- **TC-TMP-05**: Asserts `EmptyState` renders when input simulation payload is null.
- **TC-TMP-06**: Asserts `ErrorState` renders when simulation status is `FAILED`.

### 2.5 Flame Geometry Viewer (`FlameGeometryViewer.test.tsx`)
- **TC-GEO-01**: Verifies rendering of calculated aspect ratio and dimensions.
- **TC-GEO-02**: Asserts microgravity renders a Burke-Schumann spherical cross-section.
- **TC-GEO-03**: Asserts terrestrial gravity renders an elongated teardrop cross-section.
- **TC-GEO-04**: Tests dimension and soot zone annotation toggle buttons.
- **TC-GEO-05**: Confirms empty state fallback on null data.

### 2.6 Gravity Comparison Chart (`GravityComparisonChart.test.tsx`)
- **TC-CMP-01**: Asserts multi-metric comparison rows render with correct units.
- **TC-CMP-02**: Confirms delta percentage calculation and color coding.
- **TC-CMP-03**: Asserts clicking a metric expands its detailed fluid-dynamic physical mechanism.
- **TC-CMP-04**: Validates rendering of fluid dynamic dimensionless numbers ($Gr, Ri, Fr, Ra$).
- **TC-CMP-05**: Validates empty state when no metrics are provided.

### 2.7 Simulation Timeline (`SimulationTimeline.test.tsx`)
- **TC-TML-01**: Confirms playback controls, duration formatting, and 4 sparklines render.
- **TC-TML-02**: Validates timeline slider onChange fires timestamp updates.
- **TC-TML-03**: Asserts play/pause toggle button fires parent event handlers.
- **TC-TML-04**: Confirms extinction event marker appears at correct temporal position if quenched.
- **TC-TML-05**: Confirms empty state when time series is missing.

### 2.8 Experiment Result Panel (`ExperimentResultPanel.test.tsx`)
- **TC-EXP-01**: Asserts experiment title, fuel species, and gravity badges render.
- **TC-EXP-02**: Confirms numerical telemetry cards render with uncertainty tolerances ($\pm 25\text{ K}$, $\pm 0.15\text{ mm}$).
- **TC-EXP-03**: Validates AI diagnostic summary and regime classification verdict.
- **TC-EXP-04**: Confirms JSON export callback fires on button click.
- **TC-EXP-05**: Confirms graceful empty state when no experiment is loaded.
- **TC-EXP-06**: Confirms error banner when simulation status is `FAILED`.
