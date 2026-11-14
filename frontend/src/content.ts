/**
 * NASA-FLAME — Flame in Freefall
 * Microgravity Combustion Science & Diagnostics Platform
 */

export const brand = {
  name: "NASA-FLAME",
  wordmark: "NASA-FLAME",
  submark: "MICROGRAVITY COMBUSTION SCIENCE",
  site: "ISS CIR / ACME · 51.64°N 0.00°E · ALT 408 KM",
  facility: "ISS Combustion Integrated Rack",
  email: "mission-control@nasa-flame.gov",
};

export const nav = [
  { label: "Research Log", href: "#log" },
  { label: "Workflow", href: "#trajectory" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Enter Mission Control", href: "/login" },
];

export const hero = {
  titleMain: "MICROGRAVITY",
  titleSub: "COMBUSTION",
  kicker: "Understanding Flame Behaviour Beyond Earth",
  labels: {
    telemetry: "COMBUSTION RESEARCH",
    facility: "ISS CIR / ACME CHAMBER",
    gravity: "GRAVITY 0.000G",
    regime: "SPHERICAL DIFFUSION",
    status: "EXPERIMENT STATUS: NOMINAL",
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

/** The four stages of the combustion research trajectory */
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
  note: "Standard flight facilities & computational engines.",
  items: [
    {
      name: "Flame Visualizer",
      metric: "0g to 1g",
      unit: "regimes",
      lines: [
        "Eulerian 2D temperature matrices",
        "Soot shell morphology & isotherms",
        "Buoyancy flicker vortex tracking",
      ],
      cta: "Explore Visualizer",
      href: "/simulations",
    },
    {
      name: "Microgravity Simulation",
      metric: "60 s",
      unit: "transient",
      lines: [
        "Member 4 numerical conservation solver",
        "d²-law droplet & Burke-Schumann kinetics",
        "Optically thin radiative cooling models",
      ],
      cta: "Launch Simulation",
      href: "/workspace",
      featured: true,
    },
    {
      name: "AI Flame Analysis",
      metric: "4x",
      unit: "scaling",
      lines: [
        "Grashof (Gr) & Richardson (Ri) scaling",
        "Froude (Fr) & Rayleigh (Ra) numbers",
        "Regime classification & flight guidance",
      ],
      cta: "Run AI Diagnostics",
      href: "/assistant",
    },
  ],
};

export const cta = {
  eyebrow: "Mission Control Access",
  heading: "Enter the Scientific Research Operations Console.",
  body: "Access the full computational workspace, run variable-gravity simulations, inspect AI combustion diagnostics, and analyze historic NASA flight archives.",
  launchWindow: "2026-11-15T00:00:00Z",
  windowLabel: "Next ISS CIR/ACME Test Window",
};
