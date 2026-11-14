# NASA-FLAME: Scientific Combustion Simulation Model
## Mathematical Formulation, Governing Equations, and Assumptions

### 1. Overview
The **NASA-FLAME (Flame in Freefall)** simulation engine implements a modular, scientifically grounded computational model of laminar diffusion flames under variable gravitational acceleration $g \in [0, 25.0]\,\text{m/s}^2$. 

The model specifically captures the transition between two distinct physical regimes observed in microgravity combustion science (NASA CIR, FLEX, BASS, ACME):
1. **Normal Earth Gravity ($1g \approx 9.81\,\text{m/s}^2$):** Buoyancy-driven natural convection dominates. Hot, lower-density combustion gases accelerate upwards, drawing surrounding cold oxidizer into the flame base and stretching the flame into a tall, slender, flickering teardrop shape.
2. **Microgravity ($\mu g \approx 10^{-6}\,\text{m/s}^2$):** Buoyant acceleration vanishes ($(\rho_\infty - \rho)g \to 0$). Transport is governed primarily by molecular diffusion. Fuel and oxidizer mix through isotropic Fickian diffusion, expanding the flame into a quiescent, spherical shell ("flame ball") with lower peak temperatures, increased radiative heat loss, and elevated soot accumulation.

---

### 2. Dimensionless Numbers & Regime Classification

The dominance of buoyancy versus diffusion or momentum is governed by fundamental dimensionless groups:

#### 2.1 Richardson Number ($Ri$)
The Richardson number represents the ratio of natural buoyant forces to inertial momentum forces:
$$Ri = \frac{Gr}{Re^2} = \frac{g \beta (T_f - T_\infty) L_f}{u_0^2}$$
where:
- $g$ is gravitational acceleration ($\text{m/s}^2$)
- $\beta = 1 / T_\infty$ is the thermal expansion coefficient ($\text{K}^{-1}$)
- $T_f - T_\infty$ is the characteristic temperature rise across the reaction zone ($\text{K}$)
- $L_f$ is the flame height or buoyant length scale ($\text{m}$)
- $u_0$ is the fuel exit velocity from the burner port ($\text{m/s}$)

**Regime criteria:**
- $Ri > 1.0$: Buoyancy-dominated natural convection (Normal gravity)
- $Ri < 0.1$: Diffusion-dominated transport (Microgravity)
- $0.1 \le Ri \le 1.0$: Mixed convection-diffusion transition zone

#### 2.2 Grashof Number ($Gr$)
$$Gr = \frac{g \beta (T_f - T_\infty) L_f^3}{\nu^2}$$
Measures the ratio of buoyant forces to viscous forces in the ambient fluid.

#### 2.3 Froude Number ($Fr$) and Reynolds Number ($Re$)
$$Fr = \frac{u_0}{\sqrt{g d_0}}, \quad Re = \frac{u_0 d_0}{\nu_0}$$
where $d_0$ is the inner diameter of the fuel burner tube.

#### 2.4 Péclet Number ($Pe$)
$$Pe_{conv} = \frac{u_{eff} L_f}{D}, \quad Pe_{diff} = \frac{u_{diff} L_f}{D} \approx 1.0$$
where $D$ is the mass diffusivity of the fuel/air mixture and $u_{eff} = \max(u_0, u_{buoy})$.

---

### 3. Governing Equations

#### 3.1 Continuity & Momentum (Axisymmetric Coordinates)
$$\frac{\partial (\rho u_z)}{\partial z} + \frac{1}{r} \frac{\partial (r \rho u_r)}{\partial r} = 0$$

$$\rho \left( u_r \frac{\partial u_z}{\partial r} + u_z \frac{\partial u_z}{\partial z} \right) = -\frac{\partial p}{\partial z} + \mu \left( \frac{\partial^2 u_z}{\partial z^2} + \frac{1}{r}\frac{\partial}{\partial r}\left(r \frac{\partial u_z}{\partial r}\right) \right) + (\rho_\infty - \rho) g$$

- In **$1g$**, the buoyant body force $(\rho_\infty - \rho)g$ creates an upward buoyant convective velocity:
  $$u_{buoy}(z) \approx \sqrt{2 g z \frac{T_f - T_\infty}{T_\infty}}$$
- In **$\mu g$**, $(\rho_\infty - \rho)g \to 0$. Fluid motion is restricted to the small expansion/Stefan outflow velocity from the burner:
  $$u_0 = \frac{\dot{m}_F}{\rho_{F,0} \pi r_0^2}$$

#### 3.2 Species Transport & Burke-Schumann Flame Sheet
The conserved scalar mixture fraction $Z$ is defined as:
$$Z = \frac{s Y_F - Y_{O2} + Y_{O2,\infty}}{s Y_{F,0} + Y_{O2,\infty}}$$
where $s$ is the stoichiometric mass ratio $(\text{g } O_2 / \text{g Fuel})$. Under fast chemistry, the reaction sheet is pinned to the stoichiometric surface $Z(r, z) = Z_{st}$:
$$Z_{st} = \frac{Y_{O2,\infty}}{s Y_{F,0} + Y_{O2,\infty}}$$

#### 3.3 Flame Geometry Models
1. **Normal Gravity Height (Roper Model):**
   $$L_{f, 1g} = C_{roper} \cdot 0.12 \cdot (Q_F \times 10^6)^{0.4} \cdot \frac{1}{\ln(1 + 1/S)}$$
   where $Q_F$ is the volumetric fuel flow rate ($\text{m}^3/\text{s}$), and $S$ is the stoichiometric molar ratio.
   Buoyant inward air entrainment constrains flame width:
   $$W_{f, 1g} = d_{burner} \cdot [1.2 + 0.3 (Q_F \times 10^6)^{0.25}]$$
   Yielding a high aspect ratio $AR = L_f / W_f \approx 3.0 - 5.5$.

2. **Microgravity Spherical Flame Radius:**
   In the absence of buoyant convective sweeping, fuel diffuses radially:
   $$R_{f, \mu g} = \frac{\dot{m}_F}{4 \pi \rho_\infty D \ln(1 + Y_{O2,\infty} / s)}$$
   $$L_{f, \mu g} \approx 1.25 \cdot R_{f, \mu g}, \quad W_{f, \mu g} \approx 2.0 \cdot R_{f, \mu g}$$
   Yielding an aspect ratio $AR \approx 1.0 - 1.25$ (near-spherical symmetry).

#### 3.4 Thermal Energy & Radiative Heat Loss
$$\rho c_p \left( \frac{\partial T}{\partial t} + \vec{u} \cdot \nabla T \right) = \nabla \cdot (k \nabla T) + \dot{q}_{chem} - \dot{q}_{rad}$$
- Total chemical heat release: $\dot{Q}_{chem} = \dot{m}_F \Delta H_c \eta_{comb}$
- Radiative emission fraction $\chi_{rad} = \dot{Q}_{rad} / \dot{Q}_{chem}$:
  - In $1g$: $\chi_{rad} \approx 14\% - 18\%$ (rapid convective removal of soot and hot gas)
  - In $\mu g$: $\chi_{rad} \approx 30\% - 45\%$ (stagnant soot and triatomic gas accumulation)
- Consequently, peak flame temperature in $\mu g$ is $100\,\text{K} - 250\,\text{K}$ lower than in $1g$.
- If $Y_{O2,\infty}$ drops below the flammability threshold ($\approx 11\%-12\%$), excessive radiative cooling triggers **radiative extinction**.

#### 3.5 Buoyant Flickering Instability
In Earth gravity, Kelvin-Helmholtz shear between the buoyant accelerating hot plume and quiescent ambient air produces periodic toroidal vortices at the puffing frequency (Hamins correlation):
$$f_{flicker} \approx 1.5 \sqrt{\frac{g}{d_{burner}}} \approx 10 - 14\,\text{Hz}$$
In microgravity, $g \to 0 \implies f_{flicker} = 0\,\text{Hz}$, producing a completely silent, non-flickering, steady flame.

---

### 4. Explicit Assumptions and Limitations

#### Assumptions:
1. **Laminar Axisymmetric Flow:** $Re < 500$; turbulence and azimuthal swirl are neglected.
2. **Global Single-Step Chemistry:** Reaction rate is fast relative to diffusion (high Damköhler number $Da \gg 1$), except near extinction.
3. **Ideal Gas Law:** Density scales with temperature according to $\rho \propto 1/T$ at constant chamber pressure.
4. **Variable Gas Transport:** Dynamic viscosity and thermal conductivity scale as $T^{0.7}$; mass diffusivity scales as $T^{1.75} / P$.
5. **Radiation Formulation:** Optically thin gas radiation augmented with residence-time-scaled soot radiation.

#### Limitations:
1. **Not a 3D Direct Numerical Simulation (DNS):** The engine uses calibrated integral-boundary-layer and 2D finite-difference physics solvers to ensure fast ($< 0.2$ s) local execution rather than solving full Navier-Stokes equations with multi-step chemical kinetic mechanisms (e.g. GRI-Mech 3.0).
2. **Far-Field Boundary:** Chamber boundaries are assumed sufficiently distant to prevent convective recirculating eddies from impinging on the flame base.
3. **Soot Modeling:** Soot volume fraction is parameterized via empirical residence-time indices rather than a multi-section soot aerosol population balance.
