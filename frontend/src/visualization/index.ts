/**
 * NASA-FLAME: Scientific Visualization Suite
 * Module Export Entry Point (Member 5 Ownership)
 */

// Types & Schemas
export * from "./types/index";

// Shared Theme & Colormaps
export * from "./theme/colors";
export * from "./theme/colormaps";

// Physics & Data Transformation Utilities
export * from "./utils/flamePhysics";
export * from "./utils/dataTransformers";

// Common Scientific Components
export { ProvenanceBadge } from "./components/Common/ProvenanceBadge";
export { EmptyState } from "./components/Common/EmptyState";
export { ErrorState } from "./components/Common/ErrorState";

// Main Scientific Visualization Components
export { Flame3DViewer } from "./components/Flame3DViewer/Flame3DViewer";
export type { Flame3DViewerProps } from "./components/Flame3DViewer/Flame3DViewer";

export { TemperatureDistributionChart } from "./components/TemperatureDistributionChart/TemperatureDistributionChart";
export type { TemperatureDistributionChartProps, TempChartTab } from "./components/TemperatureDistributionChart/TemperatureDistributionChart";

export { FlameGeometryViewer } from "./components/FlameGeometryViewer/FlameGeometryViewer";
export type { FlameGeometryViewerProps } from "./components/FlameGeometryViewer/FlameGeometryViewer";

export { GravityComparisonChart } from "./components/GravityComparisonChart/GravityComparisonChart";
export type { GravityComparisonChartProps } from "./components/GravityComparisonChart/GravityComparisonChart";

export { SimulationTimeline } from "./components/SimulationTimeline/SimulationTimeline";
export type { SimulationTimelineProps } from "./components/SimulationTimeline/SimulationTimeline";

export { ExperimentResultPanel } from "./components/ExperimentResultPanel/ExperimentResultPanel";
export type { ExperimentResultPanelProps } from "./components/ExperimentResultPanel/ExperimentResultPanel";
