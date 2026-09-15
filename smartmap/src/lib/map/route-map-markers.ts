import { Marker } from "maplibre-gl";
import type { Map as MapLibreMapType } from "maplibre-gl";
import type { Coordinates } from "@/types/smart-map";
import type { AdvancedRoutePlan } from "@/lib/navigation/types";
import { formatDuration } from "@/lib/navigation/route-engine";
import { routeHasTolls } from "@/lib/navigation/route-detail-formatter";

let routeMarkers: Marker[] = [];

function polylineMidpoint(points: Coordinates[]): Coordinates {
  if (points.length === 0) return { lat: 0, lng: 0 };
  return points[Math.floor(points.length / 2)] ?? points[0];
}

function originMarkerElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText =
    "width:18px;height:18px;border-radius:999px;background:#64748b;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);";
  el.title = "Start";
  return el;
}

function destinationMarkerElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.innerHTML = `<div style="width:28px;height:28px;background:#EA4335;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(0,0,0,.35);"></div>`;
  el.title = "Destination";
  return el;
}

function routeLabelElement(plan: AdvancedRoutePlan, active: boolean): HTMLDivElement {
  const el = document.createElement("div");
  const tolls = routeHasTolls(plan);
  el.style.cssText = `
    padding:6px 10px;border-radius:999px;font:700 11px/1.2 system-ui,sans-serif;white-space:nowrap;
    box-shadow:0 4px 14px rgba(0,0,0,.25);pointer-events:none;
    background:${active ? "#1A73E8" : "#fff"};
    color:${active ? "#fff" : "#1f2937"};
    border:2px solid ${active ? "#1558b0" : "#e2e8f0"};
  `;
  el.textContent = `${formatDuration(plan.durationMin)} · ${tolls ? "Tolls" : "No tolls"}`;
  return el;
}

export function clearRouteMarkers(): void {
  routeMarkers.forEach((marker) => marker.remove());
  routeMarkers = [];
}

export function renderRouteMarkers(
  map: MapLibreMapType,
  routes: AdvancedRoutePlan[],
  activeRouteId: string | null,
  origin: Coordinates,
  destination: Coordinates,
): void {
  clearRouteMarkers();

  routeMarkers.push(
    new Marker({ element: originMarkerElement(), anchor: "center" })
      .setLngLat([origin.lng, origin.lat])
      .addTo(map),
  );

  routeMarkers.push(
    new Marker({ element: destinationMarkerElement(), anchor: "bottom" })
      .setLngLat([destination.lng, destination.lat])
      .addTo(map),
  );

  const active = routes.find((r) => r.id === activeRouteId) ?? routes[0];
  for (const route of routes) {
    const mid = polylineMidpoint(route.polyline);
    routeMarkers.push(
      new Marker({
        element: routeLabelElement(route, route.id === active?.id),
        anchor: "center",
      })
        .setLngLat([mid.lng, mid.lat])
        .addTo(map),
    );
  }
}
