# Mathematical Formulations and Combustion Physics Models

This document specifies the analytical governing equations, scaling laws, and thermodynamic relationships implemented in the NASA-FLAME AI/ML Engine.

---

## 1. Buoyancy & Dimensionless Fluid Dynamics

### 1.1 Grashof Number ($Gr$)
Quantifies the ratio of buoyant forces to viscous forces in natural convection:

$$Gr = \frac{g \beta (T_{\text{flame}} - T_\infty) L^3}{\nu^2}$$

- $g$: Local gravitational acceleration ($9.80665\text{ m/s}^2$ for $1g$, $10^{-6}\text{ to } 10^{-4}g$ in $\mu g$)
- $\beta$: Coefficient of thermal expansion ($\beta \approx 1/T_\infty$ for ideal gas, $[1/\text{K}]$)
- $T_{\text{flame}}$: Peak or characteristic flame temperature $[\text{K}]$
- $T_\infty$: Ambient oxidizer temperature $[\text{K}]$ ($\sim 298.15\text{ K}$)
- $L$: Characteristic length scale (e.g., burner diameter $D$, droplet diameter $d_0$, or flame height $H$) $[\text{m}]$
- $\nu$: Kinematic viscosity evaluated at film temperature $T_{\text{film}} = (T_{\text{flame}} + T_\infty)/2$ $[\text{m}^2/\text{s}]$

### 1.2 Richardson Number ($Ri$)
Defines the governing flow regime between natural (buoyant) convection and forced convection:

$$Ri = \frac{Gr}{Re^2} = \frac{g \beta (T_{\text{flame}} - T_\infty) L}{u_{\infty}^2}$$

- **$Ri \gg 1$ ($Ri > 10$)**: Buoyancy-dominated regime (terrestrial candle flames, low-speed jet flames). Natural convection controls oxidizer entrainment and flame shape.
- **$0.1 \le Ri \le 10$**: Mixed convection regime (moderate coflow velocity or partial gravity such as Moon $0.166g$ or Mars $0.38g$).
- **$Ri \ll 1$ ($Ri < 0.1$)**: Forced convection / momentum-dominated regime. Buoyancy is negligible (typical of microgravity or high-velocity burners).
- **$Ri \to 0$ ($g \to 0$, quiescent)**: Pure molecular diffusion regime.

### 1.3 Froude Number ($Fr$)
Ratio of inertial forces to gravitational forces:

$$Fr = \frac{u_{\text{fuel}}^2}{g D_{\text{burner}}}$$

- In normal gravity, low-Froude flames ($Fr < 5$) are buoyant and flicker; high-Froude flames ($Fr > 100$) are jet momentum-dominated.
- In microgravity, $Fr \to \infty$, rendering jet geometry symmetric regardless of gravity orientation.

---

## 2. Flame Geometry, Symmetry, and Dynamics

### 2.1 Flame Aspect Ratio ($\mathcal{A}$)
$$\mathcal{A} = \frac{L_{\text{flame}}}{W_{\text{flame}}}$$

- **Normal Gravity ($1g$)**: $\mathcal{A} \in [2.5, 6.0]$ due to vertical elongation from buoyant acceleration.
- **Microgravity ($\mu g$)**: $\mathcal{A} \in [0.9, 1.25]$ for quiescent burners; hemispherical or spherical symmetry where $\mathcal{A} \approx 1.0$.

### 2.2 Flame Flicker Frequency ($f_{\text{flicker}}$)
Terrestrial flames flicker due to periodic buoyant toroidal vortex shedding (Rayleigh-Taylor instability). The empirical scaling by Hamins et al. (1992):

$$f_{\text{flicker}} \approx \frac{1.5}{\sqrt{D_{\text{burner}}}} \quad [\text{Hz}]$$

with burner diameter $D_{\text{burner}}$ in meters.
- In $\mu g$, $f_{\text{flicker}} \equiv 0\text{ Hz}$ (absolute hydrodynamic steadiness).

### 2.3 Laminar Diffusion Flame Height (Roper & Burke-Schumann)
Under Roper's formulation for circular momentum-controlled or diffusion-controlled laminar jet diffusion flames:

$$L_f = \frac{Q_{\text{fuel}} (T_\infty / T_{\text{fuel}})}{4 \pi D_{0} \ln(1 + 1/S)}$$

where:
- $Q_{\text{fuel}}$: Volumetric fuel flow rate $[\text{m}^3/\text{s}]$
- $D_0$: Mean molecular diffusion coefficient at reference conditions $[\text{m}^2/\text{s}]$
- $S$: Molar stoichiometric oxidizer-to-fuel ratio ($\text{mol oxidizer} / \text{mol fuel}$)

Notice that in pure diffusion, $L_f$ is independent of gravity $g$ to first order, but in $1g$ natural convection narrows the flame width $W_f$, increasing the aspect ratio.

---

## 3. Droplet Combustion: The Classical $d^2$-Law and Cool Flames

### 3.1 Godsave-Spalding $d^2$-Law
In a spherically symmetric, quasi-steady quiescent microgravity environment, droplet surface diameter follows:

$$d(t)^2 = d_0^2 - K t$$

where:
- $d_0$: Initial droplet diameter $[\text{mm}]$
- $d(t)$: Droplet diameter at time $t$ $[\text{mm}]$
- $K$: Burning rate constant $[\text{mm}^2/\text{s}]$, given by:

$$K = \frac{8 k_g}{\rho_l c_{p,g}} \ln(1 + B_T)$$

where $B_T$ is the Spalding heat transfer number:

$$B_T = \frac{c_{p,g} (T_\infty - T_s) + \Delta h_c Y_{O_2,\infty} / s}{h_{fg}}$$

### 3.2 Radiative Extinction and Cool Flame Regime Transition
In microgravity, high radiative emissions from accumulated soot and $\text{H}_2\text{O}/\text{CO}_2$ exhaust reduce the flame temperature below the hot-flame extinction limit:

$$T_{\text{flame}} \le T_{\text{ext,hot}} \approx 1400\text{ K}$$

At this hot extinction diameter $d_{\text{ext,hot}}$, the flame either quenches entirely or transitions into a quasi-steady **cool flame**:

$$d_{\text{cool}}(t)^2 = d_{\text{ext,hot}}^2 - K_{\text{cool}} (t - t_{\text{ext,hot}})$$

where $K_{\text{cool}} \approx 0.3 - 0.5 K_{\text{hot}}$, operating at $T_{\text{cool}} \approx 600 - 850\text{ K}$ through low-temperature ketohydroperoxide branching kinetics.

---

## 4. Heat Transfer and Radiation Fraction

Total chemical heat release rate $\dot{Q}_{\text{chem}}$:

$$\dot{Q}_{\text{chem}} = \dot{m}_{\text{fuel}} \Delta H_c$$

Total radiative heat loss $\dot{Q}_{\text{rad}}$ under the optically thin approximation:

$$\dot{Q}_{\text{rad}} = 4 \sigma \int_{V} \left( a_p (T^4 - T_\infty^4) + a_{\text{soot}} T^4 \right) dV$$

where:
- $\sigma = 5.670374 \times 10^{-8}\text{ W}/(\text{m}^2\text{K}^4)$ (Stefan-Boltzmann constant)
- $a_p$: Planck mean gas absorption coefficient (primarily $\text{CO}_2$ and $\text{H}_2\text{O}$)
- $a_{\text{soot}} \approx 1864 \cdot f_v \cdot T$: Soot Planck mean absorption coefficient, with $f_v$ as soot volume fraction.

Radiative loss fraction:

$$\chi_{\text{rad}} = \frac{\dot{Q}_{\text{rad}}}{\dot{Q}_{\text{chem}}}$$

- **$1g$**: $\chi_{\text{rad}} \approx 0.12 - 0.22$
- **$\mu g$**: $\chi_{\text{rad}} \approx 0.30 - 0.55$ (elevated radiative cooling induces flame contraction and eventual extinction).
