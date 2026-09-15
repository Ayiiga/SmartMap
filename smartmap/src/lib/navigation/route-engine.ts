import { haversineKm } from "@/content/smart-map/places";
import type { Coordinates } from "@/types/smart-map";
import type {
  AdvancedRoutePlan,
  AdvancedTravelMode,
  AvoidOption,
  ElevationPoint,
  RouteAvoidOptions,
  RouteDifficulty,
  RoutePreference,
  RouteWaypoint,
} from "@/lib/navigation/types";
import { analyzeRouteSafety } from "@/lib/navigation/safety-analysis";

/** Typical speeds (km/h) by mode under urban Ghana conditions. */
export const MODE_SPEED_KMH: Record<AdvancedTravelMode, number> = {
  driving: 28,
  motorcycle: 32,
  transit: 18,
  cycling: 14,
  walking: 5,
};

/** Approximate fuel economy (L/100km). */
const FUEL_L_PER_100KM: Partial<Record<AdvancedTravelMode, number>> = {
  driving: 8.5,
  motorcycle: 3.2,
};

const PREFERENCE_FACTORS: Record<
  RoutePreference,
  { distance: number; duration: number; safetyBoost: number; label: string }
> = {
  fastest: { distance: 1.08, duration: 0.88, safetyBoost: 0, label: "Fastest" },
  safest: { distance: 1.18, duration: 1.12, safetyBoost: 12, label: "Safest" },
  shortest: { distance: 1.0, duration: 1.05, safetyBoost: -2, label: "Shortest" },
  eco: { distance: 1.06, duration: 1.08, safetyBoost: 4, label: "Eco-friendly" },
  lowest_fuel: { distance: 1.04, duration: 1.1, safetyBoost: 3, label: "Lowest fuel" },
};

export function kmToMiles(km: number): number {
  return km * 0.621371;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function estimateArrival(from: Date, durationMin: number): Date {
  return new Date(from.getTime() + durationMin * 60_000);
}

export function pathDistanceKm(points: Coordinates[]): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineKm(points[i - 1], points[i]);
  }
  return total;
}

/** Build a simple corridor polyline with optional intermediate stops. */
export function buildPolyline(
  from: Coordinates,
  to: Coordinates,
  stops: Coordinates[] = [],
  preference: RoutePreference = "fastest",
): Coordinates[] {
  const waypoints = [from, ...stops, to];
  const points: Coordinates[] = [];
  const bend =
    preference === "safest" ? 0.018 : preference === "shortest" ? 0.004 : 0.01;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    points.push(a);
    // Midpoint offset creates a distinct alternative corridor.
    const mid = {
      lat: (a.lat + b.lat) / 2 + bend * (i % 2 === 0 ? 1 : -1),
      lng: (a.lng + b.lng) / 2 + bend * 0.6 * (i % 2 === 0 ? -1 : 1),
    };
    points.push(mid);
  }
  points.push(to);
  return points;
}

export function buildElevationProfile(distanceKm: number, seed = 1): ElevationPoint[] {
  const steps = Math.max(6, Math.min(24, Math.round(distanceKm * 2) + 4));
  const profile: ElevationPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const distance = distanceKm * t;
    const elevationM = Math.round(
      35 + 40 * Math.sin(t * Math.PI * 2 + seed) + 18 * Math.sin(t * Math.PI * 5 + seed * 0.3),
    );
    profile.push({ distanceKm: Number(distance.toFixed(2)), elevationM: Math.max(5, elevationM) });
  }
  return profile;
}

export function classifyDifficulty(
  distanceKm: number,
  elevationProfile: ElevationPoint[],
  mode: AdvancedTravelMode,
): RouteDifficulty {
  const elevGain = elevationGainM(elevationProfile);
  if (mode === "walking" && (distanceKm > 8 || elevGain > 120)) return "difficult";
  if (mode === "cycling" && (distanceKm > 25 || elevGain > 180)) return "challenging";
  if (elevGain > 220 || distanceKm > 45) return "challenging";
  if (elevGain > 100 || distanceKm > 20) return "moderate";
  return "easy";
}

export function elevationGainM(profile: ElevationPoint[]): number {
  let gain = 0;
  for (let i = 1; i < profile.length; i++) {
    const delta = profile[i].elevationM - profile[i - 1].elevationM;
    if (delta > 0) gain += delta;
  }
  return Math.round(gain);
}

export function estimateFuelLiters(distanceKm: number, mode: AdvancedTravelMode): number | undefined {
  const rate = FUEL_L_PER_100KM[mode];
  if (!rate) return undefined;
  return Number(((distanceKm * rate) / 100).toFixed(2));
}

function applyAvoidDistanceMultiplier(baseKm: number, avoid: RouteAvoidOptions): number {
  let factor = 1;
  if (avoid.tolls) factor += 0.06;
  if (avoid.traffic) factor += 0.08;
  if (avoid.ferries) factor += 0.04;
  if (avoid.unpaved) factor += 0.05;
  return baseKm * factor;
}

function avoidList(avoid: RouteAvoidOptions): AvoidOption[] {
  const list: AvoidOption[] = [];
  if (avoid.tolls) list.push("tolls");
  if (avoid.traffic) list.push("traffic");
  if (avoid.ferries) list.push("ferries");
  if (avoid.unpaved) list.push("unpaved");
  return list;
}

export interface PlanRoutesInput {
  from: RouteWaypoint;
  to: RouteWaypoint;
  stops?: RouteWaypoint[];
  mode: AdvancedTravelMode;
  avoid?: Partial<RouteAvoidOptions>;
  now?: Date;
  preferences?: RoutePreference[];
}

/**
 * Generate alternative advanced routes (fastest / safest / shortest / eco / lowest fuel).
 * Uses deterministic geometry suitable for offline demo + caching until a live routing API is wired.
 */
export function planAdvancedRoutes(input: PlanRoutesInput): AdvancedRoutePlan[] {
  const {
    from,
    to,
    stops = [],
    mode,
    avoid = {},
    now = new Date(),
    preferences = ["fastest", "safest", "shortest", "eco", "lowest_fuel"],
  } = input;

  const avoidOpts: RouteAvoidOptions = {
    tolls: Boolean(avoid.tolls),
    traffic: Boolean(avoid.traffic),
    ferries: Boolean(avoid.ferries),
    unpaved: Boolean(avoid.unpaved),
  };

  const straightKm = Math.max(
    0.2,
    pathDistanceKm([from.coordinates, ...stops.map((s) => s.coordinates), to.coordinates]),
  );

  return preferences.map((preference, index) => {
    const factors = PREFERENCE_FACTORS[preference];
    const polyline = buildPolyline(
      from.coordinates,
      to.coordinates,
      stops.map((s) => s.coordinates),
      preference,
    );
    let distanceKm = pathDistanceKm(polyline) * factors.distance;
    distanceKm = applyAvoidDistanceMultiplier(distanceKm, avoidOpts);
    // Keep shortest preference closest to corridor length.
    if (preference === "shortest") {
      distanceKm = Math.min(distanceKm, straightKm * 1.05 * (avoidOpts.tolls ? 1.03 : 1));
    }

    distanceKm = Number(distanceKm.toFixed(2));
    const speed = MODE_SPEED_KMH[mode];
    let durationMin = (distanceKm / speed) * 60 * factors.duration;
    if (avoidOpts.traffic && preference !== "fastest") durationMin *= 0.95;
    if (avoidOpts.traffic && preference === "fastest") durationMin *= 1.05;
    durationMin = Math.max(2, Math.round(durationMin));

    const elevationProfile = buildElevationProfile(distanceKm, index + 1);
    const difficulty = classifyDifficulty(distanceKm, elevationProfile, mode);
    const fuelLiters = estimateFuelLiters(
      preference === "lowest_fuel" || preference === "eco" ? distanceKm * 0.94 : distanceKm,
      mode,
    );
    const warnings = analyzeRouteSafety({
      distanceKm,
      polyline,
      preference,
      mode,
      seed: index + distanceKm,
    });
    const safetyScore = Math.max(
      55,
      Math.min(98, Math.round(90 - warnings.length * 4 - distanceKm * 0.4 + factors.safetyBoost)),
    );
    const eta = estimateArrival(now, durationMin);

    const steps = [
      `Depart from ${from.label}`,
      ...stops.map((s, i) => `Stop ${i + 1}: ${s.label}`),
      `Follow the ${factors.label.toLowerCase()} corridor for ${distanceKm.toFixed(1)} km`,
      ...warnings.slice(0, 2).map((w) => w.message),
      `Arrive at ${to.label}`,
    ];

    return {
      id: `route-${preference}-${index}`,
      label: factors.label,
      preference,
      mode,
      from,
      to,
      stops,
      distanceKm,
      distanceMiles: Number(kmToMiles(distanceKm).toFixed(2)),
      durationMin,
      etaIso: eta.toISOString(),
      difficulty,
      fuelLiters,
      safetyScore,
      elevationProfile,
      warnings,
      steps,
      polyline,
      avoided: avoidList(avoidOpts),
    };
  });
}

export function recalculateRoute(
  plan: AdvancedRoutePlan,
  current: Coordinates,
  now = new Date(),
): AdvancedRoutePlan {
  const remainingStops = plan.stops;
  const nextPlans = planAdvancedRoutes({
    from: { id: "current", label: "Current location", coordinates: current },
    to: plan.to,
    stops: remainingStops,
    mode: plan.mode,
    avoid: Object.fromEntries(plan.avoided.map((k) => [k, true])) as Partial<RouteAvoidOptions>,
    now,
    preferences: [plan.preference],
  });
  return nextPlans[0] ?? plan;
}
