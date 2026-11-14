# NASA-FLAME: Known Limitations & Outstanding Issues

## 1. Physical & Numerical Modeling Limitations

1. **Optically Thin Radiation Approximation**:
   The current radiation model assumes combustion gases ($\text{CO}_2, \text{H}_2\text{O}$) are optically thin, neglecting self-absorption of emitted photons by outer gas layers. In large microgravity hydrocarbon flames with heavy soot concentration, optical thickness increases, causing radiative re-absorption that can moderately elevate outer envelope temperatures.
2. **Global 1-Step Chemical Kinetics**:
   To ensure rapid interactive simulation response times ($<100\text{ ms}$), the numerical engine employs global 1-step or 2-step simplified kinetics rather than detailed chemical mechanisms (such as GRI-Mech 3.0 with 53 species and 325 reactions). While macroscopic quantities ($T_{\max}$, flame radius, aspect ratio) match within $\pm 5\%$, intermediate radical concentrations ($\text{OH}, \text{O}, \text{H}$) are simplified.
3. **Quiescent Ambient Atmosphere Assumption**:
   Default microgravity simulations assume zero ambient forced ventilation draft ($u_{\infty} = 0\text{ m/s}$). In actual spacecraft cabins (such as the ISS CIR chamber), ventilation fans generate a minor residual draft ($0.05 - 0.2\text{ m/s}$) to prevent toxic exhaust accumulation, which introduces slight asymmetric flame drift not captured in pure spherical mode.

---

## 2. Rendering & Hardware Constraints

1. **Headless & Virtualized Environments**:
   When running inside automated headless CI test environments or virtualization without hardware GPU drivers, native WebGL context initialization may fail. The system automatically degrades to high-precision 2D Canvas rendering, but 3D orbit rotation is restricted.
2. **Mobile Touch Orbit Sensitivity**:
   On high-DPI mobile touchscreens, two-finger pinch-to-zoom in Three.js requires delicate gestures to prevent conflicting with parent page scrolling. Recommended device: desktop or laptop with dedicated trackpad/mouse.
3. **Discrete Spatial Grid Resolution**:
   To maintain 60 FPS rendering on typical consumer devices, 2D contour matrices are generated at $32 \times 32$ or $64 \times 64$ grid points and smoothed using bilinear canvas sub-sampling. Highly localized micro-eddies smaller than $0.5\text{ mm}$ are not resolved on this grid.

---

## 3. Coordinated Cross-Module Outstanding Issues

- **ISS CIR Flame Extinction Sigmoid (BUG-M5-004)**: Coordinated with Member 2 to replace the hard threshold step function at $13.0\% \text{ O}_2$ with a smooth sigmoidal flammability limit transition in the backend solver.
- **Cantera Integration**: Planned future capability with Member 3 & Member 4 to dynamically invoke Cantera for full detailed kinetic mechanisms when detailed chemical radical distributions are requested.
