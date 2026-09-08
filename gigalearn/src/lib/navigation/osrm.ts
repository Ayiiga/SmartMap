import type { Coordinates, TravelMode } from "@/types/smart-map";
import type { AdvancedRoutePlan, AdvancedTravelMode, RoutePreference } from "@/lib/navigation/types";
import type { RouteWaypoint } from "@/lib/navigation/types";
import {
  buildElevationProfile,
  classifyDifficulty,
  estimateArrival,
  estimateFuelLiters,
  kmToMiles,
} from "@/lib/navigation/route-engine";
import { analyzeRouteSafety } from "@/lib/navigation/safety-analysis";

export const OSRM_PROFILE: Record<AdvancedTravelMode, string> = {
  driving: "driving",
  motorcycle: "driving",
  transit: "driving",
  cycling: "bike",
  walking: "foot",
};

interface OsrmManeuver {
  type?: string;
  modifier?: string;
  instruction?: string;
  location?: [number, number];
}

interface OsrmStep {
  name?: string;
  distance?: number;
  duration?: number;
  maneuver?: OsrmManeuver;
}

interface OsrmLeg {
  steps?: OsrmStep[];
  distance?: number;
  duration?: number;
}

interface OsrmRoute {
  geometry?: { coordinates?: [number, number][] };
  legs?: OsrmLeg[];
  distance?: number;
  duration?: number;
}

export interface OsrmRouteResponse {
  code?: string;
  routes?: OsrmRoute[];
}

export function coordsToOsrmParam(points: Coordinates[]): string {
  return points.map((p) => `${p.lng},${p.lat}`).join(";");
}

export function parseOsrmPolyline(route: OsrmRoute): Coordinates[] {
  const coords = route.geometry?.coordinates ?? [];
  return coords.map(([lng, lat]) => ({ lat, lng }));
}

export function osrmStepsToInstructions(route: OsrmRoute, fromLabel: string, toLabel: string): string[] {
  const steps: string[] = [`Depart from ${fromLabel}`];
  for (const leg of route.legs ?? []) {
    for (const step of leg.steps ?? []) {
      const instruction =
        step.maneuver?.instruction ??
        (step.name ? `Continue on ${step.name}` : undefined);
      if (instruction && !instruction.toLowerCase().includes("arrive")) {
        steps.push(instruction);
      }
    }
  }
  steps.push(`Arrive at ${toLabel}`);
  return steps;
}

const PREFERENCE_LABELS: Record<RoutePreference, string> = {
  fastest: "Fastest",
  safest: "Safest",
  shortest: "Shortest",
  eco: "Eco-friendly",
  lowest_fuel: "Lowest fuel",
};

function preferenceForRoute(
  index: number,
  routes: OsrmRoute[],
): RoutePreference {
  if (routes.length === 1) return "fastest";
  const durations = routes.map((r) => r.duration ?? 0);
  const distances = routes.map((r) => r.distance ?? 0);
  const minDuration = Math.min(...durations);
  const minDistance = Math.min(...distances);
  const duration = routes[index].duration ?? 0;
  const distance = routes[index].distance ?? 0;
  if (duration === minDuration) return "fastest";
  if (distance === minDistance) return "shortest";
  if (index === 0) return "fastest";
  if (index === 1) return "shortest";
  return "safest";
}

export function osrmRoutesToPlans(
  response: OsrmRouteResponse,
  input: {
    from: RouteWaypoint;
    to: RouteWaypoint;
    mode: AdvancedTravelMode;
    now?: Date;
  },
): AdvancedRoutePlan[] {
  const routes = response.routes ?? [];
  if (routes.length === 0) return [];

  const now = input.now ?? new Date();

  return routes.map((route, index) => {
    const preference = preferenceForRoute(index, routes);
    const polyline = parseOsrmPolyline(route);
    const distanceKm = Number(((route.distance ?? 0) / 1000).toFixed(2));
    const durationMin = Math.max(1, Math.round((route.duration ?? 0) / 60));
    const elevationProfile = buildElevationProfile(distanceKm, index + 1);
    const warnings = analyzeRouteSafety({
      distanceKm,
      polyline,
      preference,
      mode: input.mode,
      seed: index + distanceKm,
    });
    const safetyScore = Math.max(
      60,
      Math.min(98, Math.round(92 - warnings.length * 3 - distanceKm * 0.25)),
    );

    return {
      id: `osrm-${preference}-${index}`,
      label: PREFERENCE_LABELS[preference],
      preference,
      mode: input.mode,
      from: input.from,
      to: input.to,
      stops: [],
      distanceKm,
      distanceMiles: Number(kmToMiles(distanceKm).toFixed(2)),
      durationMin,
      etaIso: estimateArrival(now, durationMin).toISOString(),
      difficulty: classifyDifficulty(distanceKm, elevationProfile, input.mode),
      fuelLiters: estimateFuelLiters(distanceKm, input.mode),
      safetyScore,
      elevationProfile,
      warnings,
      steps: osrmStepsToInstructions(route, input.from.label, input.to.label),
      polyline,
      avoided: [],
    };
  });
}

export function travelModeToOsrmProfile(mode: TravelMode): string {
  return OSRM_PROFILE[mode] ?? "driving";
}
