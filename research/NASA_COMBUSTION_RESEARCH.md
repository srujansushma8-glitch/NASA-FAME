# NASA-FLAME: Scientific Combustion Research in Normal Gravity and Microgravity

## Executive Summary
This document synthesizes theoretical and experimental combustion science across terrestrial (normal gravity, $1g_0 \approx 9.81\text{ m/s}^2$) and spaceflight microgravity ($\mu g \approx 10^{-6}\text{ to } 10^{-4}g_0$) environments. The primary objective is to establish an unassailable scientific foundation for the NASA-FLAME AI/ML Engine, cataloging empirical findings from NASA Glenn Research Center (GRC), the International Space Station (ISS) Combustion Integrated Rack (CIR), Space Shuttle missions, and drop-tower facilities.

---

## 1. Fundamental Physics: Gravity and Buoyancy in Combustion

### 1.1 Buoyancy-Driven Natural Convection ($1g$)
In terrestrial gravity, combustion generates intense temperature gradients ($T_{\text{flame}} \sim 1400 - 2300\text{ K}$ vs $T_{\infty} \sim 300\text{ K}$). Under the ideal gas law ($\rho = P / (R_{\text{spec}} T)$), hot product gases have a density roughly $1/4$ to $1/8$ that of the surrounding cold air. This density differential generates an upward hydrostatic buoyant force per unit volume:

$$f_{\text{buoyancy}} = (\rho_\infty - \rho) g \approx \rho_\infty \beta (T - T_\infty) g$$

where $\beta \approx 1/T_\infty$ is the thermal expansion coefficient.

#### Consequences in $1g$:
1. **Buoyant Convective Draft**: The hot gas column accelerates vertically ($u_{\text{buoyant}} \sim \sqrt{2 g H \Delta \rho / \rho_\infty} \approx 1 - 3\text{ m/s}$).
2. **Ambient Oxidizer Entrainment**: The upward draft pulls fresh oxidizer inward at the flame base via viscous shear and pressure gradients, creating a strong advective inflow.
3. **Flame Geometry**: Flames are stretched vertically into the characteristic elongated, slender, tapered teardrop shape with a high aspect ratio ($L/W \sim 2.5 - 6.0$).
4. **Hydrodynamic Instability & Flicker**: Buoyant shear between the rising plume and quiescent ambient air triggers toroidal vortex shedding (Kelvin-Helmholtz / Rayleigh-Taylor instability). This produces the classic flickering frequency:
   $$f_{\text{flicker}} \approx \frac{1.5}{\sqrt{D_{\text{burner}}}} \quad (\text{typically } 10 - 18\text{ Hz for candle/small burners})$$
5. **Short Residence Time**: Hot gases and soot precursors transit through the high-temperature reaction zone in milliseconds ($\tau_{\text{res}} \sim 10 - 50\text{ ms}$).

### 1.2 Microgravity Combustion Regime ($\mu g$)
In orbital freefall (e.g., ISS CIR, where residual acceleration $g_{\text{eff}} \sim 10^{-6}g_0$), buoyant acceleration drops to zero:

$$f_{\text{buoyancy}} \approx 0$$

#### Consequences in $\mu g$:
1. **Absence of Natural Convection**: Advective buoyant inflow ceases entirely. Bulk gas motion is governed exclusively by:
   - Forced coflow / convective flow (if externally imposed by ventilation or fuel jet).
   - Stefan velocity (outward mass blowing from fuel evaporation/pyrolysis).
2. **Pure Molecular Diffusion Transport**:
   - Mass transport of oxidizer ($\text{O}_2$) inward and fuel outward obeys Fick's Law: $j_i = -\rho D_{im} \nabla Y_i$.
   - Heat transfer to ambient surroundings obeys Fourier's Law: $q = -k \nabla T$.
3. **Flame Geometry & Spherical Symmetry**:
   - Quiescent diffusion flames around droplets or circular burners relax into perfectly spherical or hemispherical structures with an aspect ratio $L/W \approx 1.0 \pm 0.1$.
4. **Flicker-Free Quiescent Stability**: Buoyant vortex shedding disappears ($f_{\text{flicker}} = 0\text{ Hz}$). The flame burns with complete visual steadiness.
5. **Diffusion-Limited Oxygen Availability**: Oxidizer cannot be continuously swept into the reaction zone; it must diffuse through an expanding spherical boundary layer. Consequently:
   - Local reaction rate per unit flame area is significantly lower.
   - Flame standoff distance ($r_f / r_s$) increases drastically.
   - Burning rates are reduced compared to buoyant environments.
6. **Prolonged Residence Time**: Residence times are 10 to 50 times longer ($\tau_{\text{res}} \sim 200 - 1500\text{ ms}$), fundamentally altering soot chemistry and radiative loss.

---

## 2. Dimensionless Numbers and Regime Criteria

To scientifically evaluate experimental and simulated flame behavior, the engine evaluates key dimensionless criteria:

| Dimensionless Group | Formula | Physical Meaning | $1g$ Normal Regime | $\mu g$ Microgravity Regime |
|---|---|---|---|---|
| **Grashof Number ($Gr$)** | $Gr = \frac{g \beta (T_f - T_\infty) L^3}{\nu^2}$ | Ratio of buoyant force to viscous force | $10^4 - 10^7$ (High buoyancy) | $< 10^{-2} \approx 0$ (No buoyancy) |
| **Richardson Number ($Ri$)** | $Ri = \frac{Gr}{Re^2} = \frac{g \beta \Delta T L}{u_{\text{flow}}^2}$ | Ratio of natural convection to forced convection | $Ri \gg 1$ (Buoyancy dominates) | $Ri \ll 1$ (Forced/diffusion dominates) |
| **Froude Number ($Fr$)** | $Fr = \frac{u_{\text{flow}}^2}{g L}$ | Ratio of inertial to gravitational forces | $Fr \sim 0.1 - 10$ | $Fr \to \infty$ ($g \to 0$) |
| **Rayleigh Number ($Ra$)** | $Ra = Gr \cdot Pr = \frac{g \beta \Delta T L^3}{\nu \alpha}$ | Thermal buoyancy driving natural convection | $Ra > 10^5$ (Turbulent/vigorous convection) | $Ra \approx 0$ (Pure conduction) |
| **Peclet Number ($Pe$)** | $Pe = \frac{u L}{D_{AB}} = Re \cdot Sc$ | Ratio of advective to diffusive mass transport | $Pe \gg 1$ (Advection-dominated) | $Pe \ll 1$ or $\sim 1$ (Diffusion-controlled) |
| **Damköhler Number ($Da$)** | $Da = \frac{\tau_{\text{flow}}}{\tau_{\text{chem}}}$ | Ratio of transport timescale to chemical reaction timescale | $Da \sim 1 - 10$ (Fast mixing/thin flame) | $Da \gg 10$ (Thick reaction zone, diffusion-starved) |
| **Lewis Number ($Le$)** | $Le = \frac{\alpha}{D_{AB}} = \frac{k}{\rho c_p D_{AB}}$ | Ratio of thermal diffusivity to mass diffusivity | Controls cellular flame instabilities | Governs stationary flame ball stability (SOFBALL) |

---

## 3. Detailed Scientific Phenomenological Analysis

### 3.1 Heat Transfer Mechanisms
In normal gravity, heat loss is predominantly **convective**; rising exhaust carries away $80-90\%$ of total heat release into the thermal plume. Radiative heat loss fraction ($\chi_{\text{rad}} = Q_{\text{rad}} / Q_{\text{chem}}$) is modest, typically $10 - 20\%$ for clean hydrocarbon flames.

In microgravity:
- Convective heat carry-away is virtually non-existent in quiescent environments.
- Heat dissipates slowly via thermal conduction into the far-field gas.
- Because flame volume and soot cloud size are greatly expanded and residence times are long, **thermal radiation** becomes the dominant cooling mechanism ($\chi_{\text{rad}}$ can exceed $35 - 50\%$).
- Extreme radiative heat loss cools the flame zone, lowering peak flame temperatures by **$100\text{ K}$ to $300\text{ K}$** relative to identical $1g$ flames.

### 3.2 Temperature Distributions
- **$1g$ Flame**: Sharp, steep radial temperature gradients with high peak flame temperatures ($1800 - 2200\text{ K}$ for hydrocarbons in air). Rapid axial thermal decay above flame tip due to ambient air entrainment and turbulent mixing.
- **$\mu g$ Flame**: Broad, diffuse, spherically symmetric thermal profile. Flatter temperature gradients ($\nabla T$). Peak temperature is lower ($1450 - 1850\text{ K}$) because molecular diffusion limits local oxygen delivery while radiant emissions continuously drain thermal energy from the wide flame envelope.

### 3.3 Soot Formation, Agglomeration, and Radiation
Soot formation is intensely sensitive to gravity:
1. **Nucleation and Residence Time**: In $1g$, nascent polycyclic aromatic hydrocarbons (PAHs) are quickly swept upward into the oxidative flame tip. In $\mu g$, the prolonged residence time allows extensive PAH growth, particle inception, surface growth, and coagulation.
2. **Fractal Aggregation**: Without buoyant shear tearing them apart, primary soot particles ($d_p \sim 20 - 40\text{ nm}$) agglomerate into massive, long-chain, open-structured fractal aggregates ($D_f \approx 1.7 - 1.8$).
3. **Soot Shell Formation**: In droplet combustion or spherical gas diffusion flames, soot particles experience thermophoretic forces pushing them away from the hot reaction zone toward the fuel source, while Stefan flow pushes them outward. These opposing forces balance, trapping soot in a distinct concentric spherical **"soot shell"**.
4. **Radiative Quenching / Smoke Point**: In coflow laminar diffusion flames (NASA ACME CFI / SPICE), the microgravity smoke point occurs at much lower fuel flow rates because soot accumulates more rapidly. If radiative emission from soot exceeds chemical heat release, the flame suffers radiative extinction.

### 3.4 Discovery of Microgravity "Cool Flames" (NASA FLEX)
One of the most consequential discoveries of modern combustion physics was made on the ISS Combustion Integrated Rack during the **FLEX (Flame Extinguishment Experiment)**:
- Isolated alkane droplets (e.g., $n$-heptane, $n$-decane) were ignited in $\mu g$.
- The visible, high-temperature hot flame ($T \sim 1600 - 1800\text{ K}$) burned until intense radiative heat loss caused it to extinguish abruptly (radiative extinction).
- Unexpectedly, droplet evaporation did not cease! The droplet continued to burn invisibly in a low-temperature **"cool flame"** regime ($T \sim 600 - 900\text{ K}$), sustained by low-temperature hydrocarbon oxidation chemistry (peroxy radical $\text{RO}_2$ isomerization and chain-branching) without visible soot or incandescent emissions.
- In $1g$, buoyant convection instantly cools and sweeps away intermediate radical pools, rendering steady cool flame droplet combustion impossible.

### 3.5 Diffusion vs. Premixed Flames Under Gravity Variations

#### Non-Premixed (Diffusion) Flames
- Fuel and oxidizer enter separately; combustion is limited by the mixing rate (Burke-Schumann limit).
- **$1g$**: Slender, buoyant flame with flicker and convective tip-opening.
- **$\mu g$**: Spherical Burke-Schumann flame where flame height/radius is governed purely by the ratio of mass flow rate to molecular diffusion coefficient ($r_f \propto \dot{m} / D_{AB}$).

#### Premixed Flames
- Fuel and oxidizer are mixed prior to reaction; flame speed $S_L$ depends on chemical kinetics and thermal/mass diffusion.
- **$1g$**: Buoyancy distorts flame fronts (e.g. upward-propagating flames in tubes become curved and wrinkled; downward-propagating flames can be flattened or quenched by buoyant counterflow).
- **$\mu g$**: Enables observation of true fundamental laminar flame speeds without buoyant stretch. Allows stable existence of stationary **Flame Balls (NASA SOFBALL)** in ultra-lean hydrogen/methane mixtures near the flammability limit ($Le \ll 1$), which cannot exist in $1g$ because buoyancy lifts and tears them apart.

---

## 4. Synthesis: Microgravity vs. Normal Gravity Comparison Matrix

| Parameter / Feature | Normal Gravity ($1g_0$) | Microgravity ($\mu g$) | Physical Driving Mechanism |
|---|---|---|---|
| **Dominant Transport** | Buoyant Natural Convection + Diffusion | Molecular Diffusion + Conduction | Suppression of density-driven hydrostatic forces ($\Delta \rho g \to 0$) |
| **Flame Geometry** | Elongated, slender teardrop ($L/W \sim 2.5 - 6$) | Spherical / Hemispherical ($L/W \sim 1.0$) | Absence of vertical buoyant acceleration |
| **Flicker / Instability** | Periodic flicker ($10 - 18\text{ Hz}$) | Visually steady ($0\text{ Hz}$) | Absence of toroidal buoyant shear vortices |
| **Peak Flame Temperature** | Higher ($1800 - 2200\text{ K}$) | Lower by $100 - 300\text{ K}$ ($1500 - 1850\text{ K}$) | Diffusion-limited $\text{O}_2$ supply + elevated radiative loss |
| **Thermal Profile** | Steep radial gradients, narrow plume | Broad, diffuse spherical temperature field | Convective carry-away replaced by molecular conduction |
| **Residence Time ($\tau_{\text{res}}$)** | Short ($10 - 50\text{ ms}$) | Long ($200 - 1500\text{ ms}$) | Gas velocity determined by diffusion/Stefan flow, not buoyant draft |
| **Soot Morphology** | Small aggregates, rapid oxidation | Large fractal agglomerates, thick soot shells | Extended growth time and thermophoretic stagnation |
| **Radiative Heat Loss Fraction** | Moderate ($10 - 20\%$) | High ($30 - 50\%+$) | Increased soot volume fraction and broader radiating volume |
| **Extinction Mechanisms** | Strain-induced or blowout | Radiative extinction / conductive quenching | Low local strain rates allow radiative heat drain to dominate |
| **Special Phenomena** | Buoyant plume turbulence | Quasi-steady Cool Flames, Flame Balls (SOFBALL) | Low-temperature peroxy kinetics / low Lewis number stability |

---

## 5. Scientific Limitations and Provenance Guidelines for AI/ML Modeling
1. **Never conflate simulated and experimental data**: Experimental drop-tower and ISS data contain sensor noise, thermocouple radiation error ($T_{\text{meas}} < T_{\text{gas}}$), soot deposition, and finite microgravity quality (g-jitter $\sim 10^{-6}\text{ to } 10^{-4}g$). Numerical CFD models (e.g. OpenFOAM, FireFOAM) assume ideal boundary conditions.
2. **Rule-Based Physical Grounding First**: Where experimental microgravity datasets are sparse ($N < 50$), statistical estimation and validated analytical combustion relations (Burke-Schumann, Roper, $d^2$-law) must take precedence over deep neural networks to prevent hallucinated physical behaviors.
3. **Uncertainty Quantification**: All computed combustion metrics (aspect ratio, burning rate $K$, peak $T$) must report standard error or sensor uncertainty bounds.
