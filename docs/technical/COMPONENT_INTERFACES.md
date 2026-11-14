# NASA-FLAME: Visualization Component Interfaces

All components are strictly typed TypeScript React components exported from `visualization/index.ts`. They can be imported directly by Member 1 for embedding in dashboards.

---

## 1. Flame3DViewer

Interactive 3D WebGL viewport rendering physical flame morphology, camera controls, and simulation playback.

```typescript
import { Flame3DViewer } from "visualization";

<Flame3DViewer
  simulationData={simulationData}
  gravityLevel={0.0}
  fuelName="Methane"
  burnerDiameterMm={4.0}
  initialTime={0}
  onTimeUpdate={(t) => console.log("Time updated:", t)}
  colormap="blackbody"
  showConvectiveVectors={true}
  showChamberBounds={true}
  height={520}
  width="100%"
  readOnly={false}
/>
```

### Props Specification

| Prop Name | Type | Default | Description |
|---|---|---|---|
| `simulationData` | `SimulationResponseData \| null` | `undefined` | Simulation telemetry response payload. |
| `gravityLevel` | `number` | `simulationData.gravity_level_g` | Effective gravity override in g units ($0.0$ to $20.0$). |
| `fuelName` | `string` | `"Methane"` | Fuel species name for labeling. |
| `burnerDiameterMm`| `number` | `4.0` | Physical nozzle/wick diameter in mm. |
| `initialTime` | `number` | `0` | Starting timestamp in seconds. |
| `onTimeUpdate` | `(time_s: number) => void` | `undefined` | Callback fired on playback time advance. |
| `colormap` | `"blackbody" \| "chemiluminescence" \| "inferno"` | `"blackbody"` | Colormap applied to flame mesh surfaces. |
| `showConvectiveVectors` | `boolean` | `true` | Toggles buoyant updraft convective flow streamlines. |
| `showChamberBounds`| `boolean` | `true` | Toggles combustion chamber wireframe bounds. |
| `height` | `number \| string` | `520` | Container height in px or string format. |
| `readOnly` | `boolean` | `false` | Hides playback controls when true. |

---

## 2. TemperatureDistributionChart

Multi-mode temperature distribution analyzer featuring 2D contour maps, radial gradients, temporal trajectories, and gravity comparisons.

```typescript
import { TemperatureDistributionChart } from "visualization";

<TemperatureDistributionChart
  simulationData={simulationData}
  comparisonData1g={reference1gData}
  defaultTab="contour2d"
  colormap="blackbody"
  height={420}
  width="100%"
  onProbeHover={(probe) => console.log("Temperature probe:", probe)}
/>
```

### Props Specification

| Prop Name | Type | Default | Description |
|---|---|---|---|
| `simulationData` | `SimulationResponseData \| null` | `undefined` | Active simulation data containing spatial scalar grid. |
| `comparisonData1g`| `SimulationResponseData \| null` | `undefined` | Optional terrestrial 1g reference for overlay comparison. |
| `defaultTab` | `"contour2d" \| "radial" \| "temporal" \| "gravity_comparison"` | `"contour2d"` | Initial active tab view. |
| `colormap` | `"blackbody" \| "chemiluminescence" \| "inferno"` | `"blackbody"` | Colormap used for 2D spatial heatmap. |
| `height` | `number \| string` | `420` | Component height. |
| `onProbeHover` | `(data: { x_mm: number; y_mm: number; temp_k: number } \| null) => void` | `undefined` | Interactive probe listener. |

---

## 3. FlameGeometryViewer

Orthographic cross-section viewer contrasting flame dimensions ($H, W$), aspect ratio, and soot zones.

```typescript
import { FlameGeometryViewer } from "visualization";

<FlameGeometryViewer
  simulationData={simulationData}
  comparisonData1g={reference1gData}
  burnerDiameterMm={4.0}
  height={420}
  showSootZone={true}
/>
```

### Props Specification

| Prop Name | Type | Default | Description |
|---|---|---|---|
| `simulationData` | `SimulationResponseData \| null` | `undefined` | Active simulation geometry data. |
| `comparisonData1g`| `SimulationResponseData \| null` | `undefined` | 1g baseline comparison geometry data. |
| `burnerDiameterMm`| `number` | `4.0` | Burner nozzle diameter in mm. |
| `height` | `number \| string` | `420` | Container height. |
| `showSootZone` | `boolean` | `true` | Displays soot formation shell or tip plume. |

---

## 4. GravityComparisonChart

Quantitative comparison table and double-bar visualizer comparing 1g and 0g combustion parameters.

```typescript
import { GravityComparisonChart } from "visualization";

<GravityComparisonChart
  comparisonData={comparisonData}
  dimensionlessNumbers={dimensionlessNumbers}
  title="TERRESTRIAL (1g) vs MICROGRAVITY (0g) COMPARISON"
  height={440}
/>
```

---

## 5. SimulationTimeline

Scrubbable timeline with synchronized sparklines for temperature, radius, burning rate, and soot fraction.

```typescript
import { SimulationTimeline } from "visualization";

<SimulationTimeline
  timeSeries={simulationData.time_series}
  currentTime={currentTime}
  duration={10.0}
  isPlaying={isPlaying}
  onTimeChange={(t) => setCurrentTime(t)}
  onTogglePlay={() => setIsPlaying(!isPlaying)}
  extinctionTime={simulationData.extinction_time_s}
  height={200}
/>
```

---

## 6. ExperimentResultPanel

Full scientific dashboard card presenting experiment parameters, measurement telemetry with uncertainty bounds, and AI diagnostic insights.

```typescript
import { ExperimentResultPanel } from "visualization";

<ExperimentResultPanel
  experiment={experimentMetadata}
  simulation={simulationData}
  analysis={aiAnalysisSummary}
  dimensionlessNumbers={dimensionlessNumbers}
  onExportData={() => handleExportJson()}
/>
```
