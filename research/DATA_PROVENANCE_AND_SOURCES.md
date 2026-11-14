# NASA Public Combustion Research, Provenance & Data Sources

## 1. NASA Combustion Facilities & Flight Programs

The empirical benchmarks and physical parameters utilized in the NASA-FLAME project derive from peer-reviewed publications, open experimental repositories, and technical reports produced by NASA research facilities.

### 1.1 NASA Glenn Research Center (GRC) Ground Facilities
- **2.2-Second Drop Tower**: Operational since 1966 at NASA Glenn (Cleveland, Ohio). Provides $2.18\text{ seconds}$ of microgravity ($\sim 10^{-4}g_0$) in a 24-meter freefall chamber under ambient air or controlled pressure. Ideal for rapid screening of ignition, soot inception, and candle flame transitions.
- **5.18-Second Zero Gravity Research Facility**: World's largest drop facility. Offers $5.18\text{ seconds}$ of freefall ($\sim 10^{-5}g_0$) over a 145-meter drop in an evacuated vacuum chamber (pressure $\sim 1\text{ Pa}$ to eliminate aerodynamic drag). Used for laminar diffusion flame height scaling and droplet burning investigations.

### 1.2 International Space Station (ISS) Microgravity Combustion Facilities
- **Combustion Integrated Rack (CIR)**:
  - Located in the Destiny Laboratory module of the ISS.
  - Features an 100-liter combustion chamber rated to 660 kPa, multi-wavelength imaging (color video, OH* and CH* chemiluminescence, soot incandescence), gas supply system, and high-precision laser diagnostic packages.
  - Achieves long-duration microgravity ($10^{-6}\text{ to } 10^{-5}g_0$) limited only by fuel capacity, allowing study of steady-state microgravity combustion impossible in drop towers.

---

## 2. Key NASA Flight & Orbital Research Projects

### 2.1 ACME (Advanced Combustion via Microgravity Experiments)
- **Facility**: ISS CIR (destiny module), 2017–2022.
- **Sub-Experiments**:
  1. **CFI (Coflow Flame Investigation)**: Focused on soot inception, growth, oxidation, and smoke point in laminar coflow diffusion flames burning methane, ethylene, and propane.
  2. **B-FIRE (Burner Flame Investigation)**: Characterized non-premixed round and planar burner flames, measuring extinction limits across varied oxygen dilutions.
  3. **CLD Flame (Cool Flames Investigation with Gases)**: Studied gaseous cool flames without droplet evaporation complications.
  4. **s-Flame (Structure and Response of Spherical Diffusion Flames)**: Evaluated soot-free and sooting spherical gas diffusion flames over porous spherical burners.
  5. **E-FIELD (Electric-Field Effects on Microgravity Combustion)**: Examined the interaction between ionic wind and combustion chemistry in the absence of gravity.
- **Principal Investigators**: Dr. David Urban (NASA GRC), Prof. Peter Sunderland (Univ. of Maryland), Dr. Dennis Stocker (NASA GRC).

### 2.2 FLEX & FLEX-2 (Flame Extinguishment Experiment)
- **Facility**: ISS CIR (Multi-User Droplet Combustion Apparatus), 2009–2016.
- **Focus**: Pure hydrocarbon and biofuel droplet combustion (alkanes: $n$-heptane, $n$-octane, $n$-decane, ethanol, heptane-hexanol mixtures).
- **Landmark Discovery**: Discovery of low-temperature "cool flame" burning. Following radiative extinction of the high-temperature hot flame ($T \sim 1700\text{ K}$), droplets continued quasi-steady burning at $T \sim 700\text{ K}$ driven by low-temperature chain reactions.
- **Principal Investigators**: Prof. Forman A. Williams (UC San Diego), Prof. Frederick L. Dryer (Princeton Univ.), Prof. Vedha-Nayagam (NASA GRC).

### 2.3 SOFBALL (Structure of Flame Balls at Low Lewis-number)
- **Facility**: Space Shuttle flights STS-83, STS-94, and STS-107.
- **Focus**: Extremely lean premixed hydrogen-air and methane-air mixtures with $Le \ll 1$.
- **Discovery**: Discovered stable, stationary, spherical flame balls sustained entirely by molecular diffusion with zero convection. Provided ground-truth validation for Zeldovich's 1944 theoretical prediction of flame balls.
- **Principal Investigator**: Prof. Paul D. Ronney (Univ. of Southern California).

### 2.4 BASS & BASS-II (Burning and Suppression of Solids)
- **Facility**: ISS Microgravity Science Glovebox (MSG).
- **Focus**: Solid polymer fuel combustion (PMMA sheets and rods) under microgravity and low-velocity forced flows mimicking spacecraft ventilation.
- **Principal Investigator**: Dr. Sandra Olson (NASA GRC).

### 2.5 SPICE (Smoke Point in Co-flow Experiment)
- **Facility**: ISS CIR.
- **Focus**: Quantitative determination of soot production and smoke points in microgravity coflow flames compared to 1g.
- **Principal Investigator**: Dr. David L. Urban (NASA GRC).

---

## 3. NASA Physical Sciences Informatics (PSI) System
- **Repository URL**: `https://psi.nasa.gov`
- **Description**: NASA's official open-science data repository for microgravity physical sciences research, housing raw video, thermocouple measurements, gas chromatography readings, and test matrices from Space Shuttle, ISS, and drop tower missions.
- **Data Categories in PSI**:
  - Biophysical Sciences
  - Combustion Science
  - Fluid Physics
  - Materials Science
  - Fundamental Physics

---

## 4. Scientific Literature Citations & Foundational Papers

1. **Williams, F. A.** (1985). *Combustion Theory* (2nd ed.). Benjamin-Cummings.
2. **Williams, F. A., Dryer, F. L., Nayagam, V.** (2012). "Cool-flame burning of hydrocarbon droplets in microgravity." *Combustion and Flame*, 159(12), 3583-3591.
3. **Urban, D. L., Sunderland, P. B., et al.** (2018). "The ACME Project: Advanced Combustion via Microgravity Experiments on the ISS." *AIAA SciTech Forum*, AIAA 2018-0145.
4. **Ronney, P. D.** (1998). "Understanding combustion processes through microgravity research." *Twenty-Seventh Symposium (International) on Combustion*, 2485-2506.
5. **Stocker, D. P., et al.** (2020). "Soot formation and temperature fields in microgravity laminar diffusion flames." *NASA Technical Reports Server (NTRS)*, NASA/TM-2020-220451.
6. **Burke, S. P., & Schumann, T. E. W.** (1928). "Diffusion flames." *Industrial & Engineering Chemistry*, 20(10), 998-1004.
7. **Roper, F. G.** (1977). "The prediction of laminar jet diffusion flame sizes: Part I. Theoretical model." *Combustion and Flame*, 29, 219-226.
8. **Hamins, A., Yang, J. C., Kashiwagi, T.** (1992). "An experimental investigation of the pulsation frequency of flames." *Twenty-Fourth Symposium (International) on Combustion*, 1695-1702.

---

## 5. Data Provenance & Scientific Integrity Standards

To preserve scientific credibility, the NASA-FLAME AI/ML Engine strictly enforces data provenance tagging:

```json
{
  "provenance_metadata": {
    "data_origin": "EXPERIMENTAL_MEASURED | NUMERICAL_SIMULATION | AI_SYNTHETIC_BENCHMARK",
    "mission_or_facility": "e.g., ISS CIR / ACME CFI or NASA GRC 2.2s Drop Tower",
    "primary_investigators": "e.g., Sunderland et al.",
    "doi_or_citation": "e.g., AIAA 2018-0145 / NASA TM-2020-220451",
    "gravity_level_g": 1e-6,
    "confidence_rating": "HIGH_EMPIRICAL | VALIDATED_SIMULATION | TENTATIVE_PREDICTION",
    "measurement_uncertainty": {
      "temperature_K": "+/- 25 K",
      "flame_length_mm": "+/- 0.5 mm",
      "burning_rate_mm2_s": "+/- 0.02 mm^2/s"
    }
  }
}
```

### Strict Rules:
1. **Never fabricate NASA data**: Datasets packaged in this engine represent actual published empirical test matrices or explicitly labeled, physically grounded simulation benchmarks.
2. **Clear Origin Flags**: Every data point, plot, and analysis response must explicitly display its `data_origin`.
3. **Uncertainty Propagation**: Experimental measurements must include known sensor tolerances (e.g. thermocouple radiation correction bounds, camera resolution limits).
