import type { Map as MapLibreMapType } from "maplibre-gl";
import type { MapStyle } from "@/types/smart-map";
import { SATELLITE_HYBRID_STYLE, SATELLITE_RASTER_STYLE } from "@/lib/map/satellite-style";

/** Free vector styles via OpenFreeMap — no API key required. */
export const MAP_STYLE_URLS: Record<MapStyle, string> = {
  streets: "https://tiles.openfreemap.org/styles/liberty",
  dark: "https://tiles.openfreemap.org/styles/dark",
  terrain: "https://tiles.openfreemap.org/styles/liberty",
  satellite: "satellite-raster",
};

export const DEFAULT_CENTER = { lat: 5.6037, lng: -0.187 };
export const DEFAULT_ZOOM = 12;

export function mapStyleKey(style: MapStyle): string {
  return style === "satellite" ? "satellite-raster" : MAP_STYLE_URLS[style];
}

export function applyMapStyle(map: MapLibreMapType, style: MapStyle): void {
  if (style === "satellite") {
    map.setStyle(SATELLITE_HYBRID_STYLE);
    return;
  }
  map.setStyle(MAP_STYLE_URLS[style]);
}

export function initialMapStyle(style: MapStyle): string | typeof SATELLITE_HYBRID_STYLE {
  if (style === "satellite") return SATELLITE_HYBRID_STYLE;
  return MAP_STYLE_URLS[style] ?? MAP_STYLE_URLS.streets;
}
