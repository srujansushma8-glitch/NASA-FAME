# NASA-FLAME: Project Overview & Presentation Brief

## Project Title
**NASA-FLAME: Flame in Freefall**  
*Scientific Simulation, AI Diagnostics, and 3D Visualization of Combustion in Variable Gravity*

---

## 1. Challenge & Scientific Problem Statement

Flames in microgravity behave in ways that completely contradict everyday human intuition:
- On Earth ($1g$), hot air rises. The buoyant chimney draft sweeps oxygen into the base and stretches the flame upward into an elongated, flickering teardrop with yellow incandescent soot ($T_{\max} \sim 1750\text{ K}$, $f \sim 12\text{ Hz}$).
- In space ($0g$), buoyancy vanishes ($Gr \approx 0$). Without upward natural convection, the flame expands into a **quiescent, perfectly symmetric sphere governed solely by molecular diffusion**. Oxygen must slowly diffuse inward while combustion products diffuse outward. Radiative cooling dominates, soot gathers in an outer shell, and the flame glows dim blue ($T_{\max} \sim 1510\text{ K}$, $f = 0.00\text{ Hz}$).

Understanding these differences is critical for **spacecraft fire safety**, lunar and Martian habitat design (e.g., Artemis base camps), and advanced propulsion combustion modeling.

---

## 2. Key Technical Innovations

1. **Integrated 3D WebGL Scientific Viewport**:
   A Three.js combustion chamber allowing researchers to rotate, zoom, and visually contrast $0g$ spherical diffusion against $1g$ buoyant teardrop flames with physical flicker frequency and convective streamlines.
2. **Physics-Grounded 2D Spatial Contour Engine**:
   High-performance canvas-based contour heatmaps with bilinear sub-grid interpolation and interactive temperature probing with uncertainty tolerances.
3. **Rigorous Data Provenance & Model Labeling**:
   Every visual element is explicitly tagged (`NASA EMPIRICAL DATA`, `NUMERICAL SIMULATION`, or `VISUALIZATION MODEL`), guaranteeing complete scientific transparency and preventing confusion between procedural pedagogical models and authentic flight photography.
4. **AI Fluid Dynamic Regime Classifier**:
   Surrogate intelligence evaluating dimensionless groups ($Gr, Ri, Fr, Ra$) and generating explainable physical findings and extinction limit warnings.
5. **Cross-Regime Comparative Diagnostics**:
   Side-by-side orthographic geometry viewers and delta percentage charts detailing exactly how and why combustion shifts across gravity fields.

---

## 3. Team Member Contributions

- **Member 1 (Frontend UI/Application)**: Dashboard user interface, experiment parameter configuration, responsive design.
- **Member 2 (Backend & Database)**: FastAPI service architecture, relational schemas, seed datasets, simulation execution adapters.
- **Member 3 (Combustion Research & Physical Modeling)**: Provenance catalog, NASA GRC drop-tower datasets, Burke-Schumann formulations.
- **Member 4 (AI Engine & Machine Learning)**: Dimensionless scaling calculations, PINN regime classification, anomaly detectors.
- **Member 5 (Scientific Visualization, Testing & Documentation)**: 3D WebGL flame viewer, 2D contour heatmaps, comparative charts, Vitest unit/component test suite, Playwright E2E tests, technical and user documentation.
