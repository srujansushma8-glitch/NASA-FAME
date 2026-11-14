# NASA-FLAME: AI/ML Combustion Research & Analysis Engine
**Member 3:** AI/ML Engineer & Combustion Research Analyst  
**Modules Owned:** `ai-engine/` and `research/`

---

## 1. Executive Scientific Overview
The **NASA-FLAME AI Engine** is a scientifically grounded, physics-informed diagnostic and analysis library designed to analyze flame behavior, temperature distributions, and soot-radiation kinetics under normal gravity ($1g_0$) and microgravity ($\mu g$).

### Core Tenet: Scientific Credibility
- **No Hallucinated Claims:** The engine strictly distinguishes **Measured Experimental Data** (NASA drop-tower & ISS CIR flight missions), **Numerical Simulations** (reacting CFD), and **AI-Generated Predictions/Interpretations**.
- **Physics-First Architecture:** When sample sizes are small ($N < 8$), the engine automatically falls back to transparent, peer-reviewed analytical models (Burke-Schumann, Roper, Godsave-Spalding $d^2$-law) rather than unvalidated black-box neural networks.

---

## 2. Directory Structure

```
nasa-flame/
├── research/
│   ├── NASA_COMBUSTION_RESEARCH.md       # Comprehensive scientific literature synthesis
│   ├── DATA_PROVENANCE_AND_SOURCES.md    # NASA GRC, ISS CIR, PSI portals, citations & limitations
│   ├── PHYSICS_MODELS_AND_FORMULATIONS.md# Equations for Gr, Ri, Fr, aspect ratio, d^2-law, radiation
│   └── datasets/
│       ├── acme_cfi_laminar_coflow.csv   # ACME CFI ISS & drop tower ethylene/methane benchmarks
│       ├── flex_droplet_combustion.csv   # FLEX droplet burning & cool-flame discovery matrix
│       ├── grc_candle_flame_comparison.csv# GRC candle flame 1g vs drop tower/Mir measurements
│       ├── sofball_flame_balls.csv       # Space Shuttle STS-83/94/107 premixed flame balls
│       ├── synthetic_cfd_flame_simulations.csv# Validated OpenFOAM reactive CFD benchmarks
│       └── metadata_registry.json        # Machine-readable provenance catalog
└── ai-engine/
    ├── __init__.py                       # Package exports and public functions
    ├── schemas.py                        # Pydantic data models for FastAPI integration
    ├── data_loader.py                    # Multi-format scientific data loader with provenance
    ├── preprocessing.py                  # Physical bounds validator, missing-value imputer, Gr/Ri calculator
    ├── flame_analyzer.py                 # Aspect ratio, spherical symmetry, flicker & regime classifier
    ├── temperature_analyzer.py           # Peak T, gradients, thermal boundary layer & radiative cooling
    ├── pattern_detector.py               # Anomaly detection (cool-flame transitions) & correlation finder
    ├── comparator.py                     # Quantitative 1g vs microgravity comparison engine
    ├── explainer.py                      # Peer-review level scientific technical report generator
    ├── ml_models.py                      # Scikit-learn regressors/classifiers + analytical physics fallbacks
    ├── api_interface.py                  # FastAPI-ready facade functions for Member 2
    ├── README.md                         # This integration guide
    └── tests/
        ├── test_data_loader.py
        ├── test_preprocessing.py
        ├── test_flame_analyzer.py
        ├── test_comparator_and_explainer.py
        └── test_ml_and_api.py
```

---

## 3. Public Python Functions (Member 2 FastAPI Integration)

Member 2 can easily import and utilize all functions directly. Simply add `ai-engine/` to the Python path:

```python
import sys
from pathlib import Path

# Add ai-engine path
sys.path.insert(0, str(Path(__file__).resolve().parent / "ai-engine"))

from api_interface import (
    run_complete_flame_analysis,
    load_dataset,
    preprocess_data,
    analyze_flame_behavior,
    compare_gravity_conditions,
    analyze_temperature,
    detect_patterns,
    generate_scientific_summary,
    predict_aspect_ratio_ml,
    classify_combustion_regime_ml
)
```

### 3.1 One-Call Master Analysis: `run_complete_flame_analysis()`
Executes the full pipeline: loading, physical preprocessing, dimensionless parameter calculation, geometric & temperature analysis, anomaly/pattern detection, and scientific report formulation.

```python
result = run_complete_flame_analysis("research/datasets/acme_cfi_laminar_coflow.csv")
print(result.model_dump_json(indent=2))
```

#### Output Schema:
```json
{
  "analysis_id": "NASA-FLAME-A1B2C3D4",
  "input_reference": "Urban, D. L. et al., AIAA 2018-0145",
  "gravity_condition": "MICROGRAVITY",
  "data_origin_classification": "EXPERIMENTAL_MEASURED",
  "key_observations": [
    "Spherical / near-spherical symmetry confirmed with aspect ratio 1.14 (spherical symmetry deviation index: 0.14).",
    "Natural convection is suppressed (Gr ~ 0, Ri ~ 0). Oxidizer delivery is diffusion-controlled.",
    "Hydrodynamic steadiness observed: flicker frequency is 0.0 Hz (absence of buoyant vortex shedding).",
    "Prolonged reaction zone residence time (320.5 ms) enhances radiative cooling and soot agglomeration."
  ],
  "calculated_metrics": {
    "flame_length_mm": 44.1,
    "flame_width_mm": 38.8,
    "aspect_ratio": 1.14,
    "spherical_symmetry_index": 0.14,
    "flicker_frequency_hz": 0.0,
    "residence_time_ms": 320.5,
    "grashof_number": 0.19,
    "richardson_number": 0.03,
    "peak_temperature_k": 1810.0,
    "temperature_differential_k": 1511.85,
    "estimated_radial_gradient_k_per_mm": 86.6,
    "thermal_boundary_thickness_mm": 17.46
  },
  "detected_patterns": [
    "Strong empirical coupling observed between gravitational field strength and flame aspect ratio: as gravity g drops towards 0, aspect ratio monotonically relaxes to ~1.0.",
    "Flame flicker is confirmed as a strictly buoyancy-driven phenomenon; microgravity yields 0.0 Hz flicker."
  ],
  "scientific_explanation": "Under orbital microgravity conditions, buoyant natural convection is suppressed...",
  "confidence_or_uncertainty": {
    "analysis_confidence_score": 0.95,
    "temperature_uncertainty_k": "+/- 25.0 K",
    "geometric_measurement_tolerance": "+/- 0.4 mm",
    "validation_status": "VALIDATED_EMPIRICAL"
  },
  "limitations": [
    "Drop-tower data durations capture transient relaxation; orbital CIR data required for quasi-steady verification.",
    "Thermocouple probe measurements are subject to conduction and radiative heat loss error."
  ],
  "source_references": [
    "Williams, F. A. et al. (2012). Combust. Flame 159(12):3583-3591 (NASA FLEX)",
    "Urban, D. L., Sunderland, P. B. et al. (2018). AIAA SciTech 2018-0145 (NASA ACME)",
    "NASA Physical Sciences Informatics (PSI) Database (psi.nasa.gov)"
  ],
  "data_origin_breakdown": {
    "measured_experimental_data": "Primary measurements (dimensions, thermocouple readings, flicker) verified from NASA empirical flight/drop-tower records.",
    "simulated_data": null,
    "ai_generated_interpretation": "Regime classification, dimensionless number scaling, and fluid-dynamic narrative produced by NASA-FLAME AI Engine."
  }
}
```

---

### 3.2 Individual Modular Functions

#### `load_dataset(filepath_or_data, data_origin=None, provenance=None)`
- Automatically detects and standardizes column names (`flame_length_mm`, `aspect_ratio`, `peak_temperature_k`, `gravity_g`).
- Maps against `metadata_registry.json` for NASA provenance, facility, and citations.

#### `preprocess_data(df, normalize=False, norm_method='minmax')`
- Filters impossible physical records ($T \le 0\text{ K}$, negative lengths, out-of-range oxygen mole fractions).
- Imputes missing parameters using physical constraints ($f_{\text{flicker}} = 0\text{ Hz}$ in microgravity).
- Computes dimensionless numbers: Grashof ($Gr$), Richardson ($Ri$), Froude ($Fr$), Aspect Ratio ($L/W$), and Spherical Symmetry Index.
- Calculates descriptive statistics: mean, std, median, min, max, IQR, and SNR (dB).

#### `analyze_flame_behavior(data, provenance=None)`
- Evaluates flame geometry, symmetry deviation, residence time ($\tau_{\text{res}}$), and flicker frequency.
- Classifies regime: `BUOYANT_LAMINAR`, `DIFFUSION_CONTROLLED_STEADY`, `MICROGRAVITY_COOL_FLAME_TRANSITION`, `STATIONARY_FLAME_BALL`.

#### `compare_gravity_conditions(data_1g, data_mug, fuel_or_config=None)`
- Quantifies exact percentage shifts in flame width, length, aspect ratio, peak temperature, soot volume fraction, and burning rate between 1g and microgravity.
- Automatically pairs each metric shift with fundamental fluid-dynamic and chemical kinetic causes.

#### `analyze_temperature(data, ambient_temp_k=298.15)`
- Evaluates peak flame temperature, radial thermal gradient $\partial T / \partial r$, thermal boundary layer thickness, and radiative cooling deficits.

#### `detect_patterns(df, provenance=None)`
- Detects statistical anomalies (Z-score $> 2.5$) such as cool-flame second-stage transitions.
- Computes Pearson and Spearman correlations between gravitational acceleration and combustion metrics.

#### `generate_scientific_summary(analysis_result, provenance=None)`
- Generates publication-ready scientific text with fluid-dynamic interpretations, heat/mass transfer descriptions, assumptions, and limitations.

---

## 4. FastAPI Endpoint Integration Example (For Member 2)

```python
from fastapi import FastAPI, HTTPException, UploadFile, File
import pandas as pd
import io
import sys
from pathlib import Path

# Add ai-engine to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent / "ai-engine"))

from api_interface import (
    run_complete_flame_analysis,
    compare_gravity_conditions,
    predict_aspect_ratio_ml,
    ComprehensiveAnalysisOutput
)

app = FastAPI(title="NASA-FLAME API", version="1.0.0")

@app.post("/api/flame/analyze", response_model=ComprehensiveAnalysisOutput)
async def analyze_flame(file: UploadFile = File(...)):
    """Upload CSV combustion dataset and receive comprehensive scientific analysis."""
    contents = await file.read()
    try:
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        result = run_complete_flame_analysis(df)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/flame/compare-gravity")
async def compare_gravity(record_1g: dict, record_mug: dict):
    """Compare matched 1g and microgravity combustion records."""
    try:
        result = compare_gravity_conditions(record_1g, record_mug)
        return result.model_dump()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/flame/predict-aspect-ratio")
async def predict_aspect_ratio(gravity_g: float, fuel_type: str = "Hydrocarbon"):
    """Predict flame aspect ratio using validated ML or Burke-Schumann physics model."""
    return predict_aspect_ratio_ml(gravity_g=gravity_g, fuel_type=fuel_type)
```

---

## 5. Acceptance Verification & Test Execution
All 20 comprehensive unit and integration tests can be executed via:

```bash
python -m pytest ai-engine/tests -v
```

**Test Coverage Summary:**
- `test_data_loader.py`: CSV/JSON loading, column standardization, provenance linking, error handling.
- `test_preprocessing.py`: Bounds filtering, missing value imputation, Gr/Ri/Fr calculation, descriptive stats.
- `test_flame_analyzer.py`: 1g teardrop vs $\mu g$ spherical symmetry, flicker suppression, regime classification.
- `test_temperature_analyzer.py`: Radial gradients, boundary layer expansion, radiative cooling impact.
- `test_comparator_and_explainer.py`: Gravity comparisons, pattern detection, scientific report generation.
- `test_ml_and_api.py`: Cross-validated Random Forest models, Burke-Schumann analytical models, end-to-end FastAPI integration.
