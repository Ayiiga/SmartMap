"use client";

import { create } from "zustand";
import type { AstronomicalObject } from "./astronomy/types";

export type SpaceCamMode = "camera" | "sky-map" | "space-3d";

export interface SpaceCamLayers {
  stars: boolean;
  constellations: boolean;
  planets: boolean;
  moon: boolean;
  satellites: boolean;
  comets: boolean;
  deepSky: boolean;
  milkyWay: boolean;
  grid: boolean;
  orbits: boolean;
}

export interface OrientationState {
  available: boolean;
  permission: "granted" | "denied" | "prompt" | "unavailable";
  alpha: number;
  beta: number;
  gamma: number;
  accuracy: "high" | "medium" | "low" | "unavailable";
  calibrated: boolean;
  manualAzimuth: number;
  manualAltitude: number;
}

import type { ZoomScaleLevel } from "./zoom-fusion";

interface SpaceCamState {
  mode: SpaceCamMode;
  zoomLevel: ZoomScaleLevel;
  layers: SpaceCamLayers;
  selectedObject: AstronomicalObject | null;
  searchOpen: boolean;
  layersOpen: boolean;
  timeOpen: boolean;
  settingsOpen: boolean;
  identifyResults: AstronomicalObject[];
  simulationTime: Date;
  useSimulationTime: boolean;
  favorites: string[];
  reducedMotion: boolean;
  orientation: OrientationState;
  dataSourceLabel: string;
  setMode: (mode: SpaceCamMode) => void;
  setZoomLevel: (level: ZoomScaleLevel) => void;
  setLayer: (key: keyof SpaceCamLayers, value: boolean) => void;
  toggleLayer: (key: keyof SpaceCamLayers) => void;
  setSelectedObject: (obj: AstronomicalObject | null) => void;
  setSearchOpen: (open: boolean) => void;
  setLayersOpen: (open: boolean) => void;
  setTimeOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setIdentifyResults: (results: AstronomicalObject[]) => void;
  setSimulationTime: (date: Date) => void;
  setUseSimulationTime: (use: boolean) => void;
  stepTime: (hours: number) => void;
  resetTime: () => void;
  toggleFavorite: (id: string) => void;
  setReducedMotion: (value: boolean) => void;
  setOrientation: (partial: Partial<OrientationState>) => void;
  setDataSourceLabel: (label: string) => void;
}

const DEFAULT_LAYERS: SpaceCamLayers = {
  stars: true,
  constellations: true,
  planets: true,
  moon: true,
  satellites: true,
  comets: true,
  deepSky: true,
  milkyWay: true,
  grid: false,
  orbits: false,
};

const DEFAULT_ORIENTATION: OrientationState = {
  available: false,
  permission: "unavailable",
  alpha: 0,
  beta: 90,
  gamma: 0,
  accuracy: "unavailable",
  calibrated: false,
  manualAzimuth: 180,
  manualAltitude: 45,
};

export const useSpaceCamStore = create<SpaceCamState>((set, get) => ({
  mode: "sky-map",
  zoomLevel: 1,
  layers: DEFAULT_LAYERS,
  selectedObject: null,
  searchOpen: false,
  layersOpen: false,
  timeOpen: false,
  settingsOpen: false,
  identifyResults: [],
  simulationTime: new Date(),
  useSimulationTime: false,
  favorites: [],
  reducedMotion: false,
  orientation: DEFAULT_ORIENTATION,
  dataSourceLabel: "3D Visualization",
  setMode: (mode) => set({ mode }),
  setZoomLevel: (level) => set({ zoomLevel: Math.max(0, Math.min(10, level)) as ZoomScaleLevel }),
  setLayer: (key, value) => set((s) => ({ layers: { ...s.layers, [key]: value } })),
  toggleLayer: (key) => set((s) => ({ layers: { ...s.layers, [key]: !s.layers[key] } })),
  setSelectedObject: (obj) => set({ selectedObject: obj }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setLayersOpen: (open) => set({ layersOpen: open }),
  setTimeOpen: (open) => set({ timeOpen: open }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setIdentifyResults: (results) => set({ identifyResults: results }),
  setSimulationTime: (date) => set({ simulationTime: date, useSimulationTime: true }),
  setUseSimulationTime: (use) => set({ useSimulationTime: use }),
  stepTime: (hours) => {
    const current = get().simulationTime;
    const next = new Date(current.getTime() + hours * 60 * 60 * 1000);
    set({ simulationTime: next, useSimulationTime: true });
  },
  resetTime: () => set({ simulationTime: new Date(), useSimulationTime: false }),
  toggleFavorite: (id) =>
    set((s) => ({
      favorites: s.favorites.includes(id)
        ? s.favorites.filter((f) => f !== id)
        : [...s.favorites, id],
    })),
  setReducedMotion: (value) => set({ reducedMotion: value }),
  setOrientation: (partial) => set((s) => ({ orientation: { ...s.orientation, ...partial } })),
  setDataSourceLabel: (label) => set({ dataSourceLabel: label }),
}));
