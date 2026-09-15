import type { MapLayerId } from "@/lib/navigation/types";
import type { MapStyle } from "@/types/smart-map";
import { MAP_STYLE_URLS } from "@/lib/map/styles";

export interface MapLayerDefinition {
  id: MapLayerId;
  label: string;
  emoji: string;
  kind: "basemap" | "overlay";
  description: string;
  /** Basemap style mapping when kind === basemap */
  mapStyle?: MapStyle;
}

export const MAP_LAYERS: MapLayerDefinition[] = [
  {
    id: "standard",
    label: "Standard",
    emoji: "🗺️",
    kind: "basemap",
    description: "Default street map",
    mapStyle: "streets",
  },
  {
    id: "satellite",
    label: "Satellite",
    emoji: "🛰️",
    kind: "basemap",
    description: "Aerial imagery style",
    mapStyle: "satellite",
  },
  {
    id: "terrain",
    label: "Terrain",
    emoji: "🌍",
    kind: "basemap",
    description: "Elevation-aware terrain",
    mapStyle: "terrain",
  },
  {
    id: "night",
    label: "Night mode",
    emoji: "🌙",
    kind: "basemap",
    description: "Low-light navigation style",
    mapStyle: "dark",
  },
  {
    id: "vegetation",
    label: "Vegetation",
    emoji: "🌳",
    kind: "overlay",
    description: "Vegetation density overlay",
  },
  {
    id: "rivers",
    label: "Rivers",
    emoji: "🌊",
    kind: "overlay",
    description: "Rivers and waterways",
  },
  {
    id: "lakes",
    label: "Lakes",
    emoji: "🏞️",
    kind: "overlay",
    description: "Lakes and reservoirs",
  },
  {
    id: "mountains",
    label: "Mountains",
    emoji: "⛰️",
    kind: "overlay",
    description: "Mountain and highland ridges",
  },
  {
    id: "forests",
    label: "Forests",
    emoji: "🌲",
    kind: "overlay",
    description: "Forest reserves",
  },
  {
    id: "land_cover",
    label: "Land cover",
    emoji: "🏜️",
    kind: "overlay",
    description: "Land cover classification",
  },
  {
    id: "traffic",
    label: "Traffic",
    emoji: "🚦",
    kind: "overlay",
    description: "Live-style traffic congestion",
  },
  {
    id: "weather",
    label: "Weather",
    emoji: "🌦️",
    kind: "overlay",
    description: "Weather and rain risk",
  },
];

export function basemapStyleForLayers(active: MapLayerId[]): MapStyle {
  if (active.includes("night")) return "dark";
  if (active.includes("satellite")) return "satellite";
  if (active.includes("terrain")) return "terrain";
  return "streets";
}

export function styleUrlForBasemap(style: MapStyle): string {
  return MAP_STYLE_URLS[style] ?? MAP_STYLE_URLS.streets;
}

export const DEFAULT_ACTIVE_LAYERS: MapLayerId[] = ["standard"];
