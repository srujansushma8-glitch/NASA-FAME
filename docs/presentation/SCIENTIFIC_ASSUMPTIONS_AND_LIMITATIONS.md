# NASA-FLAME: Scientific Assumptions & Physical Limitations

## 1. Theoretical Framework & Governing Equations

The mathematical and physical formulations implemented in NASA-FLAME are grounded in classic combustion theory (Burke-Schumann 1928, Williams 1985, Glassman 2008) and NASA microgravity combustion research (Dietrich et al., Ross et al., Law & Faeth):

### 1.1 Navier-Stokes & Continuity Under Variable Gravity
$$\frac{\partial \rho}{\partial t} + \nabla \cdot (\rho \mathbf{u}) = 0$$
$$\rho \left( \frac{\partial \mathbf{u}}{\partial t} + \mathbf{u} \cdot \nabla \mathbf{u} \right) = -\nabla P + \mu \nabla^2 \mathbf{u} + (\rho_\infty - \rho) \mathbf{g}$$

In microgravity ($|\mathbf{g}| \to 0$):
$$(\rho_\infty - \rho)\mathbf{g} \approx 0$$
Natural convection is entirely suppressed, reducing gas velocity $\mathbf{u}$ in quiescent ambient environments to the Stefan blowing velocity at the fuel surface.

### 1.2 Species Transport & Energy Conservation
$$\rho \left( \frac{\partial Y_i}{\partial t} + \mathbf{u} \cdot \nabla Y_i \right) = \nabla \cdot (\rho D_i \nabla Y_i) + \dot{\omega}_i$$
$$\rho c_p \left( \frac{\partial T}{\partial t} + \mathbf{u} \cdot \nabla T \right) = \nabla \cdot (k \nabla T) + \sum_{k} (-\Delta h_{f,k}^\circ) \dot{\omega}_k - q_{\text{rad}}$$

In steady microgravity spherical symmetry ($u \approx 0$):
$$\frac{1}{r^2} \frac{d}{dr} \left( r^2 \rho D \frac{d Y_i}{dr} \right) + \dot{\omega}_i = 0$$
$$\frac{1}{r^2} \frac{d}{dr} \left( r^2 k \frac{d T}{dr} \right) - q_{\text{rad}} = 0$$

---

## 2. Explicit Modeling Assumptions

| Physical Domain | Assumption Implemented | Scientific Justification | Validity Envelope |
|---|---|---|---|
| **Kinetics** | Global 1-Step Irreversible: $\text{Fuel} + \nu_{\text{ox}} \text{O}_2 \to \nu_{\text{prod}} \text{Products}$ | High computational speed for real-time visualization | Quasi-steady hydrocarbon & hydrogen flames ($T > 1300\text{ K}$) |
| **Reaction Front** | Burke-Schumann Flame Sheet ($Da \to \infty$) | Infinitely fast kinetics assumption accurately predicts macroscopic flame location ($r_f$) | Valid when ambient oxygen is above extinction limit ($>14\%$) |
| **Radiation** | Optically Thin Planar/Spherical: $q_{\text{rad}} = 4 \sigma a_p (T^4 - T_\infty^4)$ | Neglects internal gas re-absorption; standard in NASA microgravity codes | Accurate for small burner & droplet flames ($D < 10\text{ mm}$) |
| **Soot Formation** | Empirical Acetylene/Precursor Model ($f_v \propto P^{1.2}$) | Matches empirical GRC candle flame and coflow measurements | Atmospheric to moderate pressures ($0.5 - 3.0\text{ atm}$) |
| **Transport** | Constant or temperature-averaged Lewis number ($Le \approx 1$) | Decouples differential mass/thermal diffusion | Standard hydrocarbons ($\text{CH}_4, \text{C}_3\text{H}_8$); for $\text{H}_2$ ($Le < 1$), cellular instabilities noted |

---

## 3. Boundary & Physical Limitations

1. **Quenching & Extinction**:
   When ambient oxygen falls below the critical threshold ($13.0\% \text{ O}_2$ for methane), radiative cooling $q_{\text{rad}}$ exceeds the chemical heat generation rate $\dot{q}_{\text{chem}}$, leading to thermal quenching.
2. **Cool Flame Transitions**:
   In droplet combustion (e.g., NASA FLEX heptane experiments), second-stage low-temperature chemistry (cool flames at $600 - 800\text{ K}$) can sustain combustion after hot flame extinction. The current visual model notes this transition via AI diagnostics but models visual geometry as dim/quenched.
3. **Turbulence Boundary**:
   The current visual models apply to laminar and transitional combustion ($Re_{\text{fuel}} < 1500$). Turbulent buoyant jet flames are beyond the scope of the steady/laminar Burke-Schumann solver.
