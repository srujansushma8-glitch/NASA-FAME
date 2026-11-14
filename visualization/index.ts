/**
 * NASA-FLAME: Scientific Visualization Suite
 * Module Export Entry Point (Member 5 Ownership)
 */

// Types & Schemas
export * from "./types/index.ts";

// Shared Theme & Colormaps
export * from "./theme/colors.ts";
export * from "./theme/colormaps.ts";

// Physics & Data Transformation Utilities
export * from "./utils/flamePhysics.ts";
export * from "./utils/dataTransformers.ts";

// Common Scientific Components
export { ProvenanceBadge } from "./components/Common/ProvenanceBadge.tsx";
export { EmptyState } from "./components/Common/EmptyState.tsx";
export { ErrorState } from "./components/Common/ErrorState.tsx";

// Main Scientific Visualization Components
export { Flame3DViewer } from "./components/Flame3DViewer/Flame3DViewer.tsx";
export type { Flame3DViewerProps } from "./components/Flame3DViewer/Flame3DViewer.tsx";

export { TemperatureDistributionChart } from "./components/TemperatureDistributionChart/TemperatureDistributionChart.tsx";
export type { TemperatureDistributionChartProps, TempChartTab } from "./components/TemperatureDistributionChart/TemperatureDistributionChart.tsx";

export { FlameGeometryViewer } from "./components/FlameGeometryViewer/FlameGeometryViewer.tsx";
export type { FlameGeometryViewerProps } from "./components/FlameGeometryViewer/FlameGeometryViewer.tsx";

export { GravityComparisonChart } from "./components/GravityComparisonChart/GravityComparisonChart.tsx";
export type { GravityComparisonChartProps } from "./components/GravityComparisonChart/GravityComparisonChart.tsx";

export { SimulationTimeline } from "./components/SimulationTimeline/SimulationTimeline.tsx";
export type { SimulationTimelineProps } from "./components/SimulationTimeline/SimulationTimeline.tsx";

export { ExperimentResultPanel } from "./components/ExperimentResultPanel/ExperimentResultPanel.tsx";
export type { ExperimentResultPanelProps } from "./components/ExperimentResultPanel/ExperimentResultPanel.tsx";
