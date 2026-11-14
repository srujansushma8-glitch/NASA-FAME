# NASA-FLAME: Reading Simulation Results

## 1. Output Metrics & Measurement Tolerances

NASA-FLAME reports quantitative physical metrics with explicitly stated uncertainty bounds derived from experimental sensor calibrations.

| Metric | Symbol | Typical Range | Experimental Tolerance | Physical Significance |
|---|---|---|---|---|
| **Peak Flame Temperature** | $T_{\max}$ | $1450 - 2350\text{ K}$ | $\pm 25\text{ K}$ | Maximum temperature inside the thin reaction zone. |
| **Flame Radius** | $r_f$ | $3.0 - 15.0\text{ mm}$ | $\pm 0.15\text{ mm}$ | Radial distance from burner/droplet center to reaction peak. |
| **Flame Height** | $H_f$ | $6.0 - 40.0\text{ mm}$ | $\pm 0.30\text{ mm}$ | Total vertical height from burner surface to apex. |
| **Flame Aspect Ratio** | $L/W$ | $0.9 - 5.5$ | $\pm 0.05$ | Ratio of height to width. $\approx 1.0$ indicates spherical symmetry. |
| **Fuel Burning Rate** | $\dot{m}$ | $0.5 - 50.0\text{ mg/s}$ | $\pm 5\%$ | Rate of fuel consumption per unit time. |
| **Soot Volume Fraction** | $f_v$ | $0.05 - 5.0\text{ ppm}$ | $\pm 15\%$ | Peak concentration of solid carbon soot particles. |
| **Flicker Frequency** | $f$ | $0.0 - 18.0\text{ Hz}$ | $\pm 0.5\text{ Hz}$ | Hydrodynamic buoyant oscillation frequency ($0\text{ Hz}$ in $0g$). |
| **Extinction Timestamp** | $t_{\text{ext}}$ | $0.5 - 60.0\text{ s}$ | $\pm 0.1\text{ s}$ | Instant at which reaction quenches below sustainability limit. |

---

## 2. Understanding Provenance Badges

Every visualization panel and summary table in NASA-FLAME displays an explicit **Data Provenance Badge**:

- ![NASA Empirical Data](https://via.placeholder.com/12/10B981/10B981.png) **NASA EMPIRICAL DATA**: Direct physical measurements gathered from NASA Glenn Research Center drop towers, Space Shuttle flights, or the International Space Station CIR.
- ![Numerical Simulation](https://via.placeholder.com/12/087CFF/087CFF.png) **NUMERICAL SIMULATION**: Discrete spatial solver output computing Burke-Schumann diffusion, energy conservation, and chemical species transport.
- ![AI / ML Prediction](https://via.placeholder.com/12/A855F7/A855F7.png) **AI / ML PREDICTION**: Physics-informed neural surrogate model predictions with confidence scores.
- ![Visualization Model](https://via.placeholder.com/12/FF7029/FF7029.png) **VISUALIZATION MODEL**: Physics-informed procedural 3D model designed for interactive pedagogical rendering. Explicitly tagged to prevent confusion with authentic NASA photography.
