# NASA-FLAME: Visualization Architecture

## 1. Architectural Philosophy & Principles

The NASA-FLAME scientific visualization suite adheres to strict criteria:
1. **Scientific Integrity**: All displayed graphics, temperatures, geometries, and trajectories are strictly traceable to empirical NASA experiments, discrete numerical simulations, or explicitly labeled physics-informed procedural models.
2. **Strict Provenance Labeling**: In compliance with Member 5 mandate, procedural 3D models are never masqueraded as real flight photographs; they are prominently tagged with the `VISUALIZATION MODEL` provenance badge.
3. **Physical Faithfulness**: Visual behaviors—such as the transition from a spherical quiescent flame at $0g$ to an elongated flickering teardrop at $1g$—are driven directly by physical scaling laws (Burke-Schumann diffusion, Grashof number, and Rayleigh-Taylor vortex shedding).
4. **Performance & Responsiveness**: 3D and 2D components maintain a target 60 FPS rendering budget via hardware-accelerated WebGL and offscreen canvas pixel buffers.

---

## 2. Rendering Subsystems

```
+------------------------------------------------------------------------------------+
|                         VISUALIZATION MODULE (Member 5)                            |
|                                                                                    |
|  +------------------------------------------------------------------------------+  |
|  | 1. THREE.JS 3D WEBGL RENDERING ENGINE                                        |  |
|  | - Camera: Spherical Orbit Controls (Theta, Phi, Radius) with 4 Presets     |  |
|  | - Geometries: Procedural Burner Nozzle, Flame Core, Soot Outer Shell, Chamber|  |
|  | - Shaders & Materials: Additive blending with blackbody & chemiluminescence  |  |
|  | - Convective Streamlines: Dynamic vector field active only when g > 0.05g   |  |
|  | - Hydrodynamic Flicker: Frequency-driven periodic amplitude modulation     |  |
|  +------------------------------------------------------------------------------+  |
|                                                                                    |
|  +------------------------------------------------------------------------------+  |
|  | 2. 2D SPATIAL SCALAR CONTOUR ENGINE (HTML5 Canvas)                           |  |
|  | - Bilinear Sub-Grid Interpolation for compact numerical matrices (32x32)   |  |
|  | - Perceptually Uniform Colormaps (Blackbody, Chemiluminescence, Inferno)    |  |
|  | - Calibrated Temperature Calibration Bar (300 K to 2400 K)                  |  |
|  | - Interactive Floating Coordinate Probe (r, z, T_K with uncertainty)        |  |
|  +------------------------------------------------------------------------------+  |
|                                                                                    |
|  +------------------------------------------------------------------------------+  |
|  | 3. SCIENTIFIC 2D VECTOR CHARTS & TIMELINE (SVG & Canvas)                     |  |
|  | - FlameGeometryViewer: Orthographic cross-section with dimension annotations|  |
|  | - GravityComparisonChart: Metric divergence bars and physical attributions  |  |
|  | - SimulationTimeline: Scrubbable playhead with 4 synchronized sparklines   |  |
|  +------------------------------------------------------------------------------+  |
+------------------------------------------------------------------------------------+
```

---

## 3. 3D Flame Morphological Representation

### 3.1 Microgravity ($g \le 0.05g$)
- **Geometry**: Perfect sphere centered symmetrically over the burner or droplet ($L/W \approx 1.0$).
- **Coloration**: Predominantly dim blue chemiluminescent emissions ($\text{CH}^*$ at 431 nm and $\text{C}_2^*$ Swan bands at 516 nm).
- **Soot Morphology**: Diffuse, wide outer shell without an apex accumulation tip.
- **Oscillation**: Completely steady ($f_{\text{flicker}} = 0.00\text{ Hz}$).
- **Flow**: Zero buoyant updraft; convective vectors are deactivated.

### 3.2 Terrestrial Gravity ($g \ge 0.8g$)
- **Geometry**: Vertically elongated teardrop shape ($L/W \approx 3.0 - 4.5$).
- **Coloration**: Blue reaction anchor at the base; bright yellow-orange incandescence in the upper half due to aggregated carbon soot.
- **Oscillation**: Periodic buoyant vortex shedding (~10–18 Hz) driven by:
  $$f_{\text{flicker}} \approx \frac{1.5}{\sqrt{D_{\text{burner}}}} \sqrt{\frac{g}{g_0}}$$
- **Flow**: High-velocity convective updraft ($u_{\text{draft}} \approx 1 - 2.5\text{ m/s}$) displayed via rotating particle streamlines.

### 3.3 Partial Gravity ($0.05g < g < 0.8g$)
- **Geometry**: Wide transitional base with moderate vertical elongation ($L/W \approx 1.5 - 2.5$).
- **Coloration**: Mixed amber and cyan emission front.
- **Oscillation**: Subdued low-frequency buoyant perturbation ($f < 6\text{ Hz}$).

---

## 4. Canvas Bilinear Contour Interpolation

To visualize discrete spatial temperature grids (e.g., $32 \times 32$ matrix from Member 2's solver) without visual pixelation, `ContourCanvasRenderer` executes bilinear sub-sampling in an offscreen pixel buffer:

$$T(x, y) \approx (1-f_x)(1-f_y) T_{00} + f_x (1-f_y) T_{10} + (1-f_x) f_y T_{01} + f_x f_y T_{11}$$

The resulting scalar value is normalized:
$$t_{\text{norm}} = \frac{T(x, y) - T_{\min}}{T_{\max} - T_{\min}}$$
and mapped through the selected scientific palette (`blackbody`, `chemiluminescence`, or `inferno`) in $O(W \times H)$ time.

---

## 5. Visual System & Theming Tokens

All components conform strictly to the project-wide visual identity:
- **Primary Background**: `#080B12`
- **Secondary Surface**: `#111827`
- **Card Header**: `#161F32`
- **Electric Blue**: `#087CFF` (Primary interactive accents and microgravity focus)
- **Flame Orange**: `#FF7029` (Combustion metrics and 1g buoyant accents)
- **Borders**: `#1F2937` with `#374151` highlight
- **Typography**: System sans-serif with monospace accents (`SFMono-Regular`, `Consolas`, `Menlo`).
