export type SpaceCamSource =
  | "real-capture"
  | "optical"
  | "computational"
  | "map"
  | "earth"
  | "simulation"
  | "astronomical";

export type ZoomScaleLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface ZoomFusionState {
  source: SpaceCamSource;
  scaleMeters: number;
  label: string;
  description: string;
  isExternal: boolean;
  level: ZoomScaleLevel;
  levelLabel: string;
  viewType: "camera" | "sky-dome" | "3d-visualization";
}

interface SourceDefinition extends ZoomFusionState {
  maxScaleMeters: number;
}

const LEVEL_DEFINITIONS: Array<{
  level: ZoomScaleLevel;
  levelLabel: string;
  viewType: ZoomFusionState["viewType"];
  scaleMeters: number;
  maxScaleMeters: number;
}> = [
  { level: 0, levelLabel: "Local Sky / Camera", viewType: "camera", scaleMeters: 2.4, maxScaleMeters: 10 },
  { level: 1, levelLabel: "Sky Dome", viewType: "sky-dome", scaleMeters: 50, maxScaleMeters: 100 },
  { level: 2, levelLabel: "Constellations", viewType: "sky-dome", scaleMeters: 500, maxScaleMeters: 1_000 },
  { level: 3, levelLabel: "Earth & Moon", viewType: "3d-visualization", scaleMeters: 6_400_000, maxScaleMeters: 500_000_000 },
  { level: 4, levelLabel: "Solar System", viewType: "3d-visualization", scaleMeters: 150_000_000_000, maxScaleMeters: 2_000_000_000_000 },
  { level: 5, levelLabel: "Planetary Orbits", viewType: "3d-visualization", scaleMeters: 1_500_000_000_000, maxScaleMeters: 10_000_000_000_000 },
  { level: 6, levelLabel: "Outer Solar System", viewType: "3d-visualization", scaleMeters: 10_000_000_000_000, maxScaleMeters: 100_000_000_000_000 },
  { level: 7, levelLabel: "Nearby Stars", viewType: "3d-visualization", scaleMeters: 100_000_000_000_000, maxScaleMeters: 1_000_000_000_000_000 },
  { level: 8, levelLabel: "Star Clusters", viewType: "3d-visualization", scaleMeters: 1_000_000_000_000_000, maxScaleMeters: 10_000_000_000_000_000 },
  { level: 9, levelLabel: "Nebulae & Galaxies", viewType: "3d-visualization", scaleMeters: 10_000_000_000_000_000, maxScaleMeters: 100_000_000_000_000_000 },
  { level: 10, levelLabel: "Large-Scale Universe", viewType: "3d-visualization", scaleMeters: 100_000_000_000_000_000, maxScaleMeters: Number.POSITIVE_INFINITY },
];

const SOURCES: SourceDefinition[] = [
  {
    source: "real-capture",
    maxScaleMeters: 10,
    scaleMeters: 2.4,
    label: "CAMERA VIEW",
    description: "Device camera with astronomical overlay — not seeing invisible objects.",
    isExternal: false,
    level: 0,
    levelLabel: "Local Sky / Camera",
    viewType: "camera",
  },
  {
    source: "optical",
    maxScaleMeters: 25,
    scaleMeters: 12,
    label: "CAMERA VIEW",
    description: "Using available physical camera optics with sky overlay.",
    isExternal: false,
    level: 0,
    levelLabel: "Local Sky / Camera",
    viewType: "camera",
  },
  {
    source: "computational",
    maxScaleMeters: 100,
    scaleMeters: 50,
    label: "CAMERA VIEW",
    description: "Camera with catalog overlay; enhanced framing only.",
    isExternal: false,
    level: 0,
    levelLabel: "Local Sky / Camera",
    viewType: "camera",
  },
  {
    source: "map",
    maxScaleMeters: 100_000,
    scaleMeters: 12_600,
    label: "MAP DATA",
    description: "Smart Map geospatial view — not satellite imagery.",
    isExternal: true,
    level: 1,
    levelLabel: "Sky Dome",
    viewType: "sky-dome",
  },
  {
    source: "earth",
    maxScaleMeters: 100_000_000,
    scaleMeters: 6_400_000,
    label: "3D VISUALIZATION",
    description: "Earth visualization at planetary scale.",
    isExternal: true,
    level: 3,
    levelLabel: "Earth & Moon",
    viewType: "3d-visualization",
  },
  {
    source: "simulation",
    maxScaleMeters: 2_000_000_000,
    scaleMeters: 384_400_000,
    label: "3D VISUALIZATION",
    description: "Solar system visualization using catalog positions.",
    isExternal: true,
    level: 4,
    levelLabel: "Solar System",
    viewType: "3d-visualization",
  },
  {
    source: "astronomical",
    maxScaleMeters: Number.POSITIVE_INFINITY,
    scaleMeters: 1_500_000_000_000,
    label: "3D VISUALIZATION",
    description: "Deep-space catalog visualization — not live camera footage.",
    isExternal: true,
    level: 10,
    levelLabel: "Large-Scale Universe",
    viewType: "3d-visualization",
  },
];

export function getZoomLevelFromSlider(zoom: number): ZoomScaleLevel {
  const normalized = Math.max(0, Math.min(100, zoom));
  return Math.round(normalized / 10) as ZoomScaleLevel;
}

export function getZoomFusionState(zoom: number): ZoomFusionState {
  const normalizedZoom = Math.max(0, Math.min(100, zoom));
  const scaleMeters = 2.4 * 10 ** (normalizedZoom / 10);
  const source = SOURCES.find((item) => scaleMeters <= item.maxScaleMeters) ?? SOURCES.at(-1)!;
  const level = getZoomLevelFromSlider(normalizedZoom);
  const levelDef = LEVEL_DEFINITIONS[level];
  return {
    ...source,
    scaleMeters,
    level,
    levelLabel: levelDef.levelLabel,
    viewType: levelDef.viewType,
  };
}

export function getZoomFusionStateFromLevel(level: ZoomScaleLevel): ZoomFusionState {
  const levelDef = LEVEL_DEFINITIONS[level];
  const source = SOURCES.find((item) => item.level === level) ?? SOURCES.at(-1)!;
  return {
    ...source,
    scaleMeters: levelDef.scaleMeters,
    level,
    levelLabel: levelDef.levelLabel,
    viewType: levelDef.viewType,
  };
}

export function formatSpaceCamScale(meters: number): string {
  if (meters >= 9.461e15) {
    return `${(meters / 9.461e15).toFixed(1)} ly`;
  }
  if (meters >= 1_000_000_000_000) {
    return `${(meters / 1_000_000_000_000).toFixed(1)} billion km`;
  }
  if (meters >= 1_000_000) {
    return `${Math.round(meters / 1_000).toLocaleString()} km`;
  }
  if (meters >= 1_000) return `${(meters / 1_000).toFixed(meters >= 100_000 ? 0 : 1)} km`;
  return `${meters.toFixed(meters < 10 ? 1 : 0)} m`;
}

export function requiresMapView(source: SpaceCamSource): boolean {
  return source === "map";
}

export function getLevelDefinitions() {
  return LEVEL_DEFINITIONS;
}
