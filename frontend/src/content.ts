/**
 * NASA-FLAME — Flame in Freefall
 * Microgravity Combustion Science & Spaceflight Fire Safety Platform
 * MONOLITH Design System & Content Architecture
 */

export const brand = {
  name: "NASA-FLAME",
  wordmark: "NASA-FLAME",
  submark: "MICROGRAVITY COMBUSTION SCIENCE",
  missionId: "EXPEDITION 71 // CIR-ACME",
  facility: "ISS Combustion Integrated Rack",
  site: "51.64°N 0.00°E · ALT 408 KM · SPEED 7.66 KM/S",
  email: "mission-control@nasa-flame.gov",
};

export const nav = [
  { label: "01 // SCIENCE", href: "#science" },
  { label: "02 // REGIMES", href: "#regimes" },
  { label: "03 // 3D EXPLORER", href: "#explorer" },
  { label: "04 // WORKFLOW", href: "#workflow" },
  { label: "05 // AI SAFETY", href: "#ai-safety" },
  { label: "ENTER MISSION CONTROL", href: "/login", isCta: true },
];

export const heroContent = {
  missionTag: "NASA-FLAME // EXPEDITION 71 // CIR FLIGHT SCIENCE",
  headlineLine1: "FIRE",
  headlineLine2: "BEYOND",
  headlineLine3: "GRAVITY",
  supportingText: "Understanding combustion in microgravity. Engineering safer fire environments beyond Earth.",
  btnExplore: "EXPLORE THE MISSION",
  btnEnter: "ENTER MISSION CONTROL",
  telemetryStatus: "MICROGRAVITY RESEARCH SYSTEM — ONLINE",
  flightCoordinates: "ISS CIR // 0.000G QUASI-STEADY DIFFUSION",
  systemSpecs: [
    { label: "GRAVITY REGIME", value: "0.000G (10⁻⁶g)" },
    { label: "COMBUSTION TYPE", value: "SPHERICAL DIFFUSION" },
    { label: "CHAMBER ATMO", value: "21.0% O₂ / 1.0 ATM" },
    { label: "EXTINCTION MARGIN", value: "NOMINAL (> 94.2%)" },
  ],
};

export const hero = {
  titleMain: "FIRE BEYOND",
  titleSub: "GRAVITY.",
  kicker: "Understanding combustion in microgravity. Engineering safer fire environments beyond Earth.",
  labels: {
    telemetry: "MICROGRAVITY RESEARCH SYSTEM — ONLINE",
    facility: "ISS CIR / ACME CHAMBER",
    gravity: "GRAVITY 0.000G",
    regime: "SPHERICAL DIFFUSION",
    status: "STATUS: NOMINAL",
    coordinates: "51.64°N 0.00°E · ALT 408 KM",
    scroll: "SCROLL TO EXPLORE",
  },
};

export const intro = {
  eyebrow: "Research Experiment Journey",
  heading: "What happens when fire forgets which way is up?",
  body: "Without buoyancy, hot gas does not rise. Convection collapses, and flames become serene, radially symmetric luminous spheres governed strictly by molecular diffusion and radiative heat dissipation.",
};

export const log = [
  {
    tag: "Phase 01",
    title: "Chamber Inertion",
    body: "Evacuation and inert gas purge within the 110-liter CIR chamber aboard the International Space Station.",
    image: "/media/cards/m1-launch.webp",
  },
  {
    tag: "Phase 02",
    title: "Diffusion Ignition",
    body: "Micro-spark ignition establishing an isotropic, buoyancy-free reaction envelope in pure 0.0g freefall.",
    image: "/media/cards/m2-orbit.webp",
  },
  {
    tag: "Phase 03",
    title: "Soot Aggregation",
    body: "Stagnant carbon nanoparticles linger in an outer spherical shell, radiating thermal infrared emissions.",
    image: "/media/cards/m3-base.webp",
  },
  {
    tag: "Phase 04",
    title: "Extinction Limits",
    body: "Quasi-steady radiative quenching and cool-flame transitions observed at low fuel flow thresholds.",
    image: "/media/cards/m4-walk.webp",
  },
];

export const trajectory = {
  eyebrow: "Combustion Research Workflow",
  heading: "From 1g Buoyancy to 0g Molecular Diffusion.",
  legs: [
    {
      day: "Stage 01",
      title: "Chamber Environment Setup",
      body: "Calibrating oxidizer ratio, chamber pressure (0.1–50 atm), and burner orifice geometry.",
    },
    {
      day: "Stage 02",
      title: "Freefall Deployment (0g)",
      body: "Gravitational acceleration drops to Gr < 0.01. Upward buoyant convection completely ceases.",
    },
    {
      day: "Stage 03",
      title: "Quasi-Steady Spherical Diffusion",
      body: "Burke-Schumann regime established: symmetric spherical flame front governed by Fickian mass diffusion.",
    },
    {
      day: "Stage 04",
      title: "Thermal & Extinction Sampling",
      body: "High-resolution narrow-band chemiluminescence and infrared pyrometry capturing radiative extinction.",
    },
  ],
};

export const capabilities = {
  eyebrow: "Research Capabilities",
  heading: "Advanced Microgravity Diagnostic Systems.",
  note: "ISS CIR / ACME Validated Diagnostic Suite",
  metrics: [
    { value: "0.000G", label: "ISS Microgravity Environment" },
    { value: "110 L", label: "Chamber Optical Volume" },
    { value: "2,400 K", label: "Chemiluminescence Limit" },
    { value: "0.01 Gr", label: "Quenching Grashof Number" },
  ],
  items: [
    {
      name: "3D Volumetric Flame Solver",
      featured: true,
      metric: "0.000",
      unit: "g microgravity",
      href: "/simulations",
      cta: "Launch 3D Lab",
      lines: [
        "Eulerian Navier-Stokes coupling",
        "Dual-wavelength chemiluminescence",
        "Radiative loss quenching limits",
      ],
    },
    {
      name: "AI Extinction Classifier",
      featured: false,
      metric: "< 12",
      unit: "ms latency",
      href: "/assistant",
      cta: "Launch AI Analyzer",
      lines: [
        "Automated regime classification",
        "Cool-flame autoignition forecast",
        "Spacecraft smolder risk alerts",
      ],
    },
    {
      name: "Comparative Gravitational Matrix",
      featured: false,
      metric: "4",
      unit: "planetary states",
      href: "/dashboard",
      cta: "View Matrix",
      lines: [
        "Side-by-side 3D renderers",
        "Spatial thermal contour mapping",
        "Mass burn rate differentials",
      ],
    },
  ],
  legs: [
    {
      day: "Cap 01",
      title: "High-Speed Diagnostics",
      body: "Multi-spectral pyrometry and chemiluminescence tracking at 500 fps.",
    },
    {
      day: "Cap 02",
      title: "Eulerian Fluid Mechanics Solver",
      body: "Numerical simulation of species diffusion, soot kinetics, and heat dissipation.",
    },
    {
      day: "Cap 03",
      title: "AI Combustion Analyzer",
      body: "Physics-informed neural surrogates computing dimensionless similarity numbers.",
    },
  ],
};

export const cta = {
  eyebrow: "OPERATIONAL MISSION CONTROL ACCESS",
  heading: "MISSION CONTROL READY",
  body: "Access the full microgravity combustion research telemetry and simulation suite.",
  launchWindow: "ACTIVE WINDOW: 2026-2027",
  windowLabel: "FLIGHT CLEARANCE STATUS",
};

export const scienceProblem = {
  sectionNumber: "01",
  eyebrow: "THE SCIENTIFIC PROBLEM",
  title: "When gravity vanishes, buoyancy collapses.",
  lead: "On Earth, fires survive by creating their own wind. Hot exhaust gas rises due to buoyant force (Archimedes principle), vacuuming fresh oxygen into the flame base. In orbit, this mechanism ceases to exist.",
  cards: [
    {
      code: "ARCH-01",
      title: "Buoyancy-Driven Convection",
      environment: "EARTH 1.0G",
      physics: "Grashof number Gr >> 10⁴. Strong buoyant up-draft stretches the flame into a narrow, flickering teardrop. Soot is swept upward and burns brightly at 1700K+.",
      effect: "Rapid natural replenishment of oxygen; high burn rate; turbulent instabilities.",
    },
    {
      code: "DIFF-00",
      title: "Pure Molecular Diffusion",
      environment: "ORBIT 0.0G",
      physics: "Grashof number Gr → 0. Convection is eliminated. Mass transfer is dictated solely by Fick's Law of diffusion. The reaction front becomes a calm, glowing sphere.",
      effect: "Flames burn cooler, slower, and can persist invisibly for hours, starving or spreading undetected.",
    },
    {
      code: "SAFE-03",
      title: "Spacecraft Fire Safety Threat",
      environment: "DEEP SPACE HABITATS",
      physics: "Without buoyant draft, smoke detectors that rely on rising hot air fail. Smoldering materials inside ventilation ducts can reignite unexpectedly under forced airflow.",
      effect: "Critical risk for Lunar Gateway, Artemis surface habitats, and Mars transfer vehicles.",
    },
  ],
};

export const gravityComparison = {
  sectionNumber: "02",
  eyebrow: "COMPARATIVE AEROSPACE COMBUSTION",
  title: "Earth Gravity vs Microgravity Combustion",
  subtitle: "Structural morphology and reaction kinetics across planetary gravitational regimes.",
  environments: [
    {
      id: "earth",
      name: "Earth Surface",
      gravity: "1.00g",
      geometry: "Elongated Buoyant Teardrop",
      temperature: "1,750 K - 2,100 K",
      burnRate: "2.85 mg/s",
      sootFormation: "High (Turbulent soot cap & blackbody yellow radiance)",
      flickerFreq: "12.8 Hz (Natural buoyant buoyancy instability)",
      extinctionMechanism: "Thermal convective blowout or strain quenching",
      colorTag: "#FFAA40",
    },
    {
      id: "moon",
      name: "Lunar Surface",
      gravity: "0.16g",
      geometry: "Bulbous Dome Flame",
      temperature: "1,620 K - 1,840 K",
      burnRate: "1.92 mg/s",
      sootFormation: "Moderate (Diminished buoyant acceleration)",
      flickerFreq: "5.1 Hz (Sub-harmonic flicker)",
      extinctionMechanism: "Transitional convective-diffusive limit",
      colorTag: "#CFC9BF",
    },
    {
      id: "mars",
      name: "Martian Surface",
      gravity: "0.38g",
      geometry: "Intermediate Ellipsoidal",
      temperature: "1,680 K - 1,920 K",
      burnRate: "2.24 mg/s",
      sootFormation: "Medium-high (Partial buoyant draft)",
      flickerFreq: "7.8 Hz (Dampened vortex shedding)",
      extinctionMechanism: "Convective diffusion transition",
      colorTag: "#2B4BFF",
    },
    {
      id: "orbit",
      name: "Microgravity (ISS)",
      gravity: "0.00g",
      geometry: "Isotropic Perfect Sphere",
      temperature: "1,450 K - 1,600 K",
      burnRate: "1.12 mg/s",
      sootFormation: "Low / Shell Aggregation (Faint blue CH* chemiluminescence)",
      flickerFreq: "0.0 Hz (Zero flicker, perfectly quiescent)",
      extinctionMechanism: "Radiative loss quenching (cool flame transition)",
      colorTag: "#2B4BFF",
    },
  ],
};

export const workflowStages = [
  {
    step: "01",
    tag: "TELEMETRY",
    title: "Chamber Atmospheric Conditioning",
    desc: "Rigorous purge and regulation of the ISS CIR chamber (110L volume) to target O₂ fraction, diluent ratio (N₂/CO₂/He), and sub-atmospheric pressure levels.",
    parameters: ["Pressure: 0.2 – 3.0 atm", "O₂ Molar Fraction: 14% – 30%", "CIR Inertion Cycle: 99.8% pure"],
  },
  {
    step: "02",
    tag: "IGNITION",
    title: "Freefall Arc & Micro-Droplet Release",
    desc: "Controlled deployment of fuel droplet or gas jet followed by symmetrical electrode spark ignition during sustained 10⁻⁶g freefall trajectory.",
    parameters: ["Ignition Energy: 2.4 mJ", "Droplet Diameter: 1.5 – 4.0 mm", "Residual Gravity: < 1.2 × 10⁻⁶ g"],
  },
  {
    step: "03",
    tag: "DIAGNOSTICS",
    title: "High-Speed Chemiluminescence & Pyrometry",
    desc: "Dual-wavelength OH*/CH* radical emission imaging and high-frame-rate infrared radiometry mapping volumetric soot clouds and radial temperature field.",
    parameters: ["Spectral Sampling: 308nm & 431nm", "Optical Resolution: 2048 × 2048 @ 500 fps", "Pyrometry Range: 600K – 2400K"],
  },
  {
    step: "04",
    tag: "AI INFERENCE",
    title: "Physics-Informed Neural Extinction Modeling",
    desc: "Real-time PINN surrogate ingestion computing dimensionless numbers (Gr, Ri, Fr, Ra), detecting cool-flame transitions, and assessing habitat re-ignition hazards.",
    parameters: ["Surrogate Latency: < 12ms", "Extinction Prediction Accuracy: 98.4%", "Safety Envelope: MIL-STD-1472H"],
  },
];

export const aiSafetyCapabilities = [
  {
    code: "REGIME-DET",
    title: "Microgravity Regime Classifier",
    desc: "Automatic real-time identification of flame morphology from droplet combustion to Burke-Schumann spherical diffusion and cool-flame autoignition.",
    metric: "99.1% Confidence",
  },
  {
    code: "RAD-QUENCH",
    title: "Radiative Extinction Boundary",
    desc: "Predicts the exact oxygen concentration and fuel depletion threshold where radiative heat loss exceeds chemical heat generation, triggering sudden extinction.",
    metric: "± 0.2% O₂ Error",
  },
  {
    code: "SMOLDER-HAZ",
    title: "Smoldering Reignition Forecast",
    desc: "Calculates the probability of hidden deep-seated smoldering transitioning to open flaming under forced spacecraft air ventilation currents.",
    metric: "Critical Safety Protocol",
  },
  {
    code: "DIM-SCALING",
    title: "Dimensionless Aerospace Scaling",
    desc: "Real-time computation of Grashof (Gr), Richardson (Ri), Froude (Fr), and Rayleigh (Ra) numbers for accurate cross-facility validation.",
    metric: "Zero-G Validated",
  },
];
