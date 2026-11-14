# NASA-FLAME: Experiment Configuration Guide

## 1. Primary Combustion Parameters

When configuring a new combustion experiment in the NASA-FLAME platform, the physical outcomes are governed by the following variables:

### 1.1 Gravity Level ($g$ Acceleration)
- **$0.00001g$ to $0.05g$ (Microgravity)**: Models orbital freefall on the International Space Station (ISS) or drop towers. Buoyancy is zero ($Gr \approx 0$). Flames become spherical, steady, and diffusion-controlled.
- **$0.16g$ (Lunar Gravity)**: Represents lunar surface conditions. Mild upward buoyant stretch with significant base widening.
- **$0.38g$ (Martian Gravity)**: Represents Mars surface gravity. Transitional teardrop flame with low-frequency buoyancy perturbation (~3–5 Hz).
- **$1.00g$ (Terrestrial Gravity)**: Standard Earth surface gravity. Strong buoyant convection, high aspect ratio teardrop, and rapid flicker (~10–15 Hz).

### 1.2 Fuel Selection
- **Methane ($\text{CH}_4$)**: Low soot propensity, classic blue base, clean gaseous diffusion benchmark.
- **Propane ($\text{C}_3\text{H}_8$)**: Moderate soot propensity, prominent bright yellow incandescent soot tip in $1g$.
- **Hydrogen ($\text{H}_2$)**: High flame temperature (~2380 K), soot-free, extremely fast mass diffusivity ($Le < 1$).
- **Heptane ($\text{C}_7\text{H}_{16}$)**: Liquid droplet combustion benchmark (models NASA FLEX droplet experiments).

### 1.3 Ambient Oxygen Concentration ($\text{O}_2\%$)
- **Standard Terrestrial ($21\% \text{ O}_2$)**: Stable, vigorous combustion.
- **Enriched ($>25\% \text{ O}_2$)**: Elevated peak temperatures, reduced flame standoff radius.
- **Depleted ($14\% - 18\% \text{ O}_2$)**: Cool flame transitions, dim blue appearance, expanded reaction zone.
- **Sub-critical ($<13\% \text{ O}_2$)**: Chemical heat release falls below radiative loss; causes **radiative extinction**.

### 1.4 Pressure ($P_{\text{atm}}$)
- Standard atmospheric pressure is $1.0\text{ atm}$.
- Higher pressures increase soot volume fraction ($f_v \propto P^{1.2}$) and compress flame boundary layer thickness.
- Lower pressures widen the reaction zone and suppress soot agglomeration.

---

## 2. Recommended Benchmark Presets

| Experiment Preset | Gravity | Fuel | $\text{O}_2\%$ | Pressure | Expected Regime |
|---|---|---|---|---|---|
| **ISS CIR ACME Coflow** | $0.00001g$ | Methane | $21.0\%$ | $1.0\text{ atm}$ | Diffusive Spherical Steady |
| **GRC Candle Baseline** | $1.00g$ | Methane | $21.0\%$ | $1.0\text{ atm}$ | Buoyant Laminar Teardrop |
| **Lunar Habitability Test** | $0.16g$ | Propane | $20.0\%$ | $0.8\text{ atm}$ | Transitional Widened Plume |
| **SOFBALL Low Oxygen** | $0.00001g$ | Hydrogen | $12.5\%$ | $1.0\text{ atm}$ | Stationary Quenched Flame Ball |
