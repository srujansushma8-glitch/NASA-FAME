# NASA-FLAME: Demonstration Workflow & Presentation Script

This document provides a structured 5-minute live demonstration script for presentations, stakeholder walkthroughs, and judging evaluations.

---

## Act 1: Introduction to the Gravity Problem (0:00 - 1:00)

1. **Open the NASA-FLAME Dashboard**.
2. **State the core premise**:
   > *"On Earth, gravity creates buoyancy, making flames tall, hot, and flickering. In orbit, buoyancy drops to zero—turning the flame into a mysterious, spherical, blue bubble. Today we demonstrate NASA-FLAME: Flame in Freefall."*
3. **Point out the Shared Visual System**:
   - Deep aerospace dark background (`#080B12`).
   - Electric blue interactive highlights (`#087CFF`).
   - Scientific flame orange indicators (`#FF7029`).
   - Prominent **Data Provenance Badges** guaranteeing scientific traceability.

---

## Act 2: Interactive 3D Flame Viewport (1:00 - 2:15)

1. **Select Baseline 1g Terrestrial Flame**:
   - Show the 3D elongated teardrop shape ($L/W \approx 3.2$).
   - Point to the **Scientific HUD**: $T_{\text{peak}} \approx 1750\text{ K}$, flicker frequency $\approx 11.5\text{ Hz}$, convective updraft velocity $\approx 1.4\text{ m/s}$.
   - Orbit the camera: demonstrate click-drag 3D rotation, mouse wheel zoom, and click the **Side** and **Top** camera presets.
2. **Toggle to 0g Microgravity (ISS CIR Simulation)**:
   - Observe instantaneous morphological transition:
     - The elongated teardrop relaxes into a **symmetric sphere** ($L/W \approx 1.0$).
     - The yellow incandescent tip disappears; flame becomes dim blue chemiluminescent ($\text{CH}^*$ / $\text{C}_2^*$).
     - The flicker frequency drops to strictly **$0.00\text{ Hz (Steady)}$**.
     - Convective updraft vectors disappear.
   - Show the outer grey wireframe sphere: the **diffuse soot shell** lingering in microgravity.

---

## Act 3: Scientific Thermal Analysis & Probing (2:15 - 3:30)

1. **Navigate to Temperature Distribution Chart**:
   - Show the **2D Contour Map**: bilinear interpolation smoothly rendering the spatial temperature field from $300\text{ K}$ to $2200\text{ K}$.
   - **Interactive Probe Demo**: Move cursor across the canvas; demonstrate the floating probe updating coordinates $(r, z)$ and local temperature with $\pm 25\text{ K}$ uncertainty bounds.
2. **Click "Radial $T(r)$" Tab**:
   - Highlight the blue vertical band indicating the stoichiometric reaction zone ($r_f \approx 5.5\text{ mm}$).
   - Show the smooth exponential decay of heat into ambient space via pure conduction.
3. **Click "0g vs 1g Comparison" Tab**:
   - Explain the ~240 K temperature deficit caused by enhanced spherical radiative cooling and lack of convective oxidizer feeding.

---

## Act 4: Morphological Geometry & AI Diagnostics (3:30 - 4:30)

1. **Open Flame Geometry Viewer**:
   - Show the side-by-side 2D orthographic comparison:
     - Left: 0g sphere with annotated diameter $W$ and standoff radius $r_{\text{standoff}}$.
     - Right: 1g baseline teardrop with annotated height $H = 16.5\text{ mm}$ and incandescent soot apex.
   - Click **Dimensions OFF/ON** and **Soot Zone OFF/ON** to toggle visual overlays.
2. **Open Gravity Comparison Chart & AI Diagnostics**:
   - Highlight quantitative bars: Flame Aspect Ratio ($-70.3\%$), Peak Temperature ($-13.7\%$), Flicker Frequency ($-100\%$).
   - Click **Flame Aspect Ratio** to expand the explainable fluid-dynamic attribution:
     > *"Absence of upward buoyant acceleration allows flame to expand spherically rather than stretching vertically."*
   - Point out AI-calculated dimensionless groups: $Gr \to 0$, $Ri \to 0$, $Ra \to 0$.

---

## Act 5: Timeline Scrubbing & Conclusion (4:30 - 5:00)

1. **Scrub the Simulation Timeline**:
   - Drag the time slider from $t = 0\text{s}$ (ignition transient) through quasi-steady combustion ($t = 2.0\text{s}$) to demonstrate real-time synchronization with all 4 sparklines.
   - Point out the red **Extinction Marker** indicating the radiative quenching timestamp for low-oxygen runs.
2. **Conclude with Impact**:
   > *"NASA-FLAME provides an unassailable scientific bridge between theoretical combustion physics, empirical NASA flight datasets, and real-time interactive engineering diagnostics."*
