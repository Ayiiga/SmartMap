import { LngLatBounds, Marker, Popup } from "maplibre-gl";
import type { GeoJSONSource, Map as MapLibreMapType } from "maplibre-gl";
import type { Coordinates } from "@/types/smart-map";
import type { AdvancedRoutePlan } from "@/lib/navigation/types";
import { formatDuration } from "@/lib/navigation/route-engine";
import { routeTollLabel } from "@/lib/navigation/route-detail-formatter";
import { clearRouteMarkers, renderRouteMarkers } from "@/lib/map/route-map-markers";

const ACTIVE_SOURCE = "sm-route-active";
const ALT_SOURCE = "sm-route-alt";
const ACTIVE_LINE = "sm-route-active-line";
const ACTIVE_OUTLINE = "sm-route-active-outline";
const ACTIVE_CASING = "sm-route-active-casing";
const ALT_LINE = "sm-route-alt-line";
const ETA_MARKERS: Marker[] = [];

/** Google Maps–style route colors */
const GOOGLE_ACTIVE = "#1A73E8";
const GOOGLE_ACTIVE_DARK = "#1558B0";
const GOOGLE_ALT = "#8AB4F8";

function clearEtaMarkers(): void {
  ETA_MARKERS.forEach((m) => m.remove());
  ETA_MARKERS.length = 0;
}

function midpoint(polyline: Coordinates[]): Coordinates {
  if (polyline.length === 0) return { lat: 0, lng: 0 };
  const mid = polyline[Math.floor(polyline.length / 2)];
  return mid;
}

function renderEtaBubbles(
  map: MapLibreMapType,
  routes: AdvancedRoutePlan[],
  activeRouteId: string | null,
): void {
  clearEtaMarkers();
  if (routes.length === 0) return;

  const active = routes.find((r) => r.id === activeRouteId) ?? routes[0];

  for (const route of routes) {
    const isActive = route.id === active.id;
    const mid = midpoint(route.polyline);
    const el = document.createElement("button");
    el.type = "button";
    el.className = "sm-route-eta-bubble";
    el.style.cssText = `
      padding: 6px 10px; border-radius: 999px; font-size: 11px; font-weight: 700;
      border: 2px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.2);
      cursor: pointer; white-space: nowrap; font-family: system-ui, sans-serif;
      background: ${isActive ? "#1A73E8" : "#ffffff"};
      color: ${isActive ? "#ffffff" : "#1A73E8"};
    `;
    el.innerHTML = `${formatDuration(route.durationMin)}<br/><span style="font-size:9px;opacity:0.9">${routeTollLabel(route)}</span>`;
    el.title = `${route.label}: ${formatDuration(route.durationMin)}`;

    const marker = new Marker({ element: el, anchor: "center" })
      .setLngLat([mid.lng, mid.lat])
      .setPopup(
        new Popup({ offset: 12, closeButton: false }).setHTML(
          `<strong>${route.label}</strong><br/>${formatDuration(route.durationMin)} · ${route.distanceKm.toFixed(1)} km`,
        ),
      )
      .addTo(map);
    ETA_MARKERS.push(marker);
  }
}

function lineFeature(
  polyline: Coordinates[],
  props: Record<string, string | number | boolean> = {},
): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: "Feature",
    properties: props,
    geometry: {
      type: "LineString",
      coordinates: polyline.map((p) => [p.lng, p.lat]),
    },
  };
}

function removeLayerIfExists(map: MapLibreMapType, id: string): void {
  if (map.getLayer(id)) map.removeLayer(id);
}

function removeSourceIfExists(map: MapLibreMapType, id: string): void {
  if (map.getSource(id)) map.removeSource(id);
}

function clearRouteLineLayers(map: MapLibreMapType): void {
  [ACTIVE_CASING, ACTIVE_OUTLINE, ACTIVE_LINE, ALT_LINE].forEach((id) =>
    removeLayerIfExists(map, id),
  );
  [ACTIVE_SOURCE, ALT_SOURCE].forEach((id) => removeSourceIfExists(map, id));
}

function ensureRouteLineLayers(map: MapLibreMapType): void {
  if (map.getSource(ALT_SOURCE)) return;

  map.addSource(ALT_SOURCE, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });
  map.addLayer({
    id: ALT_LINE,
    type: "line",
    source: ALT_SOURCE,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": GOOGLE_ALT,
      "line-width": ["interpolate", ["linear"], ["zoom"], 8, 4, 14, 7],
      "line-opacity": 0.95,
    },
  });

  map.addSource(ACTIVE_SOURCE, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });
  map.addLayer({
    id: ACTIVE_CASING,
    type: "line",
    source: ACTIVE_SOURCE,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "#ffffff",
      "line-width": ["interpolate", ["linear"], ["zoom"], 8, 8, 14, 14],
      "line-opacity": 0.95,
    },
  });
  map.addLayer({
    id: ACTIVE_OUTLINE,
    type: "line",
    source: ACTIVE_SOURCE,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": GOOGLE_ACTIVE_DARK,
      "line-width": ["interpolate", ["linear"], ["zoom"], 8, 7, 14, 12],
    },
  });
  map.addLayer({
    id: ACTIVE_LINE,
    type: "line",
    source: ACTIVE_SOURCE,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": GOOGLE_ACTIVE,
      "line-width": ["interpolate", ["linear"], ["zoom"], 8, 5, 14, 9],
    },
  });
}

export interface RenderRoutesOptions {
  fit?: boolean;
  origin?: Coordinates;
  destination?: Coordinates;
}

export function renderRoutesOnMap(
  map: MapLibreMapType,
  routes: AdvancedRoutePlan[],
  activeRouteId: string | null,
  options: RenderRoutesOptions = {},
): void {
  if (!map.isStyleLoaded()) return;

  clearRouteLineLayers(map);
  clearRouteMarkers();
  clearEtaMarkers();

  if (routes.length === 0) return;

  ensureRouteLineLayers(map);

  const active = routes.find((r) => r.id === activeRouteId) ?? routes[0];
  const alternatives = routes.filter((r) => r.id !== active.id);

  const altSource = map.getSource(ALT_SOURCE) as GeoJSONSource;
  altSource.setData({
    type: "FeatureCollection",
    features: alternatives.map((route) => lineFeature(route.polyline, { id: route.id })),
  });

  const activeSource = map.getSource(ACTIVE_SOURCE) as GeoJSONSource;
  activeSource.setData({
    type: "FeatureCollection",
    features: [lineFeature(active.polyline, { id: active.id, active: true })],
  });

  const origin = options.origin ?? active.from.coordinates;
  const destination = options.destination ?? active.to.coordinates;
  renderRouteMarkers(map, routes, activeRouteId, origin, destination);
  renderEtaBubbles(map, routes, activeRouteId);

  if (options.fit !== false) {
    const bounds = new LngLatBounds(
      [origin.lng, origin.lat],
      [destination.lng, destination.lat],
    );
    for (const route of routes) {
      route.polyline.forEach((p) => bounds.extend([p.lng, p.lat]));
    }
    map.fitBounds(bounds, {
      padding: { top: 100, bottom: 300, left: 40, right: 40 },
      maxZoom: routes.some((r) => r.distanceKm > 80) ? 8 : 13,
      duration: 900,
    });
  }
}

export function clearRoutesFromMap(map: MapLibreMapType): void {
  if (!map.isStyleLoaded()) return;
  clearRouteLineLayers(map);
  clearRouteMarkers();
  clearEtaMarkers();
}
