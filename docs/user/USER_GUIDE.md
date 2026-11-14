# NASA-FLAME: User Guide

## Welcome to NASA-FLAME

**NASA-FLAME (Flame in Freefall)** allows researchers, flight scientists, and aerospace students to explore the physics of combustion across varying gravitational fields ($0g$ to $1g$).

---

## 1. Navigating the 3D Flame Viewport

The 3D Flame Viewer is your primary visual laboratory for inspecting flame morphology:

### 1.1 Mouse Controls
- **Rotate / Orbit**: Click and drag with the left mouse button to rotate around the combustion chamber.
- **Pitch / Elevation**: Drag vertically to adjust viewing elevation from side to top-down.
- **Zoom**: Scroll the mouse wheel to zoom into the reaction zone or out to inspect the combustion chamber wireframe.

### 1.2 Camera Presets
Use the quick buttons in the top-left corner:
- **Isometric**: Standard $45^\circ$ perspective view.
- **Side**: Orthographic elevation view ideal for measuring flame height and buoyant teardrop stretch.
- **Top**: Top-down axial view showing radial spherical symmetry.
- **Standoff**: High-magnification close-up focusing on burner nozzle clearance and reaction zone anchor.
- **Reset**: Restores default camera distance and angles.

### 1.3 Simulation Playback Controls
- **Play / Pause**: Starts or stops temporal advancement of simulation data.
- **Step Controls (`-0.2s` / `+0.2s`)**: Manually step discrete frames to inspect ignition transients or flame quenching.
- **Speed Selector (`0.5x`, `1.0x`, `2.0x`)**: Adjust playback rate for slow-motion combustion analysis.
- **Vectors Toggle (`Vectors ON/OFF`)**: Toggles buoyant convective flow streamlines rising from the burner.
- **Palette Selector**: Switch between `Blackbody (Kelvin)`, `Chemiluminescence (Radicals)`, and `Inferno`.

---

## 2. Using the Temperature Analysis Suite

Located beside or below the 3D viewport:
1. **2D Contour Tab**: Displays the spatial cross-section temperature matrix. Hover your mouse over any coordinate to activate the **Floating Temperature Probe**, revealing exact local temperature in Kelvin.
2. **Radial $T(r)$ Tab**: Shows the radial decay of temperature from the flame centerline ($r = 0\text{ mm}$) to ambient air ($r = 30\text{ mm}$). The blue vertical band highlights the high-temperature chemical reaction zone ($r_f$).
3. **Temporal $T(t)$ Tab**: Tracks peak flame temperature across the simulation duration, marking ignition transients ($t < 0.4\text{s}$) and extinction quenching points.
4. **0g vs 1g Comparison Tab**: Summarizes why microgravity flames burn ~200–250 K cooler than terrestrial flames.

---

## 3. Scrubbing the Simulation Timeline

The **SimulationTimeline** component at the base of the interface synchronizes all visualizations:
- Drag the slider thumb to inspect any timestamp $t \in [0, T_{\max}]$.
- Four synchronized sparklines display real-time readouts for:
  - **$T_{\max}$**: Peak reaction zone temperature (K).
  - **Radius**: Flame boundary radius ($r_f$ in mm).
  - **Burn Rate**: Fuel consumption rate ($\dot{m}$ in mg/s).
  - **Soot Frac**: Peak soot volume fraction ($f_v$ in ppm).
- An explicit red marker identifies the exact extinction timestamp if the flame was quenched.
