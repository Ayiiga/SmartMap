import type { Map as MapLibreMapType } from "maplibre-gl";
import type { MapLayerId } from "@/lib/navigation/types";

const WEATHER_SOURCE = "sm-weather-radar";
const WEATHER_LAYER = "sm-weather-radar-layer";
const TRAFFIC_SOURCE = "sm-traffic-tint";
const TRAFFIC_LAYER = "sm-traffic-tint-layer";

let cachedRainTimestamp: number | null = null;

async function latestRainViewerTimestamp(): Promise<number> {
  if (cachedRainTimestamp) return cachedRainTimestamp;
  try {
    const res = await fetch("https://api.rainviewer.com/public/weather-maps.json", {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error("rainviewer");
    const data = await res.json();
    const past = data?.radar?.past as Array<{ time: number }> | undefined;
    const latest = past?.[past.length - 1]?.time;
    if (latest) {
      cachedRainTimestamp = latest;
      return latest;
    }
  } catch {
    // fallback timestamp
  }
  return Math.floor(Date.now() / 1000) - 600;
}

function removeLayerAndSource(map: MapLibreMapType, layerId: string, sourceId: string): void {
  if (map.getLayer(layerId)) map.removeLayer(layerId);
  if (map.getSource(sourceId)) map.removeSource(sourceId);
}

async function ensureWeatherOverlay(map: MapLibreMapType): Promise<void> {
  if (map.getSource(WEATHER_SOURCE)) return;
  const ts = await latestRainViewerTimestamp();
  map.addSource(WEATHER_SOURCE, {
    type: "raster",
    tiles: [
      `https://tilecache.rainviewer.com/v2/radar/${ts}/256/{z}/{x}/{y}/2/1_1.png`,
    ],
    tileSize: 256,
    attribution: "RainViewer",
  });
  map.addLayer({
    id: WEATHER_LAYER,
    type: "raster",
    source: WEATHER_SOURCE,
    paint: { "raster-opacity": 0.45 },
  });
}

function ensureTrafficTint(map: MapLibreMapType): void {
  if (map.getSource(TRAFFIC_SOURCE)) return;
  map.addSource(TRAFFIC_SOURCE, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
  });
  map.addLayer({
    id: TRAFFIC_LAYER,
    type: "background",
    paint: {
      "background-color": "rgba(255, 140, 0, 0.04)",
    },
  });
}

export async function applyMapOverlays(
  map: MapLibreMapType,
  overlays: MapLayerId[],
): Promise<void> {
  if (!map.isStyleLoaded()) return;

  const wantWeather = overlays.includes("weather");
  const wantTraffic = overlays.includes("traffic");

  if (!wantWeather) removeLayerAndSource(map, WEATHER_LAYER, WEATHER_SOURCE);
  if (!wantTraffic) removeLayerAndSource(map, TRAFFIC_LAYER, TRAFFIC_SOURCE);

  if (wantWeather) await ensureWeatherOverlay(map);
  if (wantTraffic) ensureTrafficTint(map);
}

export function clearMapOverlays(map: MapLibreMapType): void {
  removeLayerAndSource(map, WEATHER_LAYER, WEATHER_SOURCE);
  removeLayerAndSource(map, TRAFFIC_LAYER, TRAFFIC_SOURCE);
}
