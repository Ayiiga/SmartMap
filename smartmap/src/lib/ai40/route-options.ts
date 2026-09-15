import type { Coordinates } from "@/types/smart-map";
import {
  buildPolyline,
  estimateArrival,
  estimateFuelLiters,
  formatDuration,
  pathDistanceKm,
} from "@/lib/navigation/route-engine";
import type { AdvancedTravelMode } from "@/lib/navigation/types";
import { analyzeRouteSafety } from "@/lib/navigation/safety-analysis";
import type { Ai40RoutePlan, Ai40RoutePreference, RouteScores } from "@/lib/ai40/types";

const PREFERENCE_CONFIG: Record<
  Ai40RoutePreference,
  {
    label: string;
    distanceFactor: number;
    durationFactor: number;
    safetyBoost: number;
    trafficBias: number;
    weatherBias: number;
    roadQualityBias: number;
    mode?: AdvancedTravelMode;
  }
> = {
  fastest: {
    label: "Fastest",
    distanceFactor: 1.06,
    durationFactor: 0.88,
    safetyBoost: -2,
    trafficBias: 0.7,
    weatherBias: 0.5,
    roadQualityBias: 0.6,
  },
  safest: {
    label: "Safest",
    distanceFactor: 1.2,
    durationFactor: 1.14,
    safetyBoost: 14,
    trafficBias: 0.3,
    weatherBias: 0.25,
    roadQualityBias: 0.85,
  },
  lowest_traffic: {
    label: "Lowest traffic",
    distanceFactor: 1.1,
    durationFactor: 1.02,
    safetyBoost: 6,
    trafficBias: 0.15,
    weatherBias: 0.4,
    roadQualityBias: 0.7,
  },
  lowest_fuel: {
    label: "Lowest fuel",
    distanceFactor: 1.03,
    durationFactor: 1.08,
    safetyBoost: 4,
    trafficBias: 0.45,
    weatherBias: 0.35,
    roadQualityBias: 0.75,
    mode: "driving",
  },
  ev_optimized: {
    label: "EV optimized",
    distanceFactor: 1.04,
    durationFactor: 1.06,
    safetyBoost: 5,
    trafficBias: 0.4,
    weatherBias: 0.3,
    roadQualityBias: 0.8,
    mode: "driving",
  },
  motorcycle_friendly: {
    label: "Motorcycle friendly",
    distanceFactor: 1.08,
    durationFactor: 0.95,
    safetyBoost: 8,
    trafficBias: 0.5,
    weatherBias: 0.45,
    roadQualityBias: 0.72,
    mode: "motorcycle",
  },
  walking_safe: {
    label: "Walking safe",
    distanceFactor: 1.0,
    durationFactor: 1.0,
    safetyBoost: 10,
    trafficBias: 0.2,
    weatherBias: 0.35,
    roadQualityBias: 0.9,
    mode: "walking",
  },
  wheelchair_accessible: {
    label: "Wheelchair accessible",
    distanceFactor: 1.12,
    durationFactor: 1.18,
    safetyBoost: 12,
    trafficBias: 0.25,
    weatherBias: 0.3,
    roadQualityBias: 0.95,
    mode: "walking",
  },
  family_friendly: {
    label: "Family friendly",
    distanceFactor: 1.14,
    durationFactor: 1.1,
    safetyBoost: 13,
    trafficBias: 0.28,
    weatherBias: 0.28,
    roadQualityBias: 0.88,
  },
  night_safe: {
    label: "Night-safe",
    distanceFactor: 1.16,
    durationFactor: 1.08,
    safetyBoost: 15,
    trafficBias: 0.35,
    weatherBias: 0.4,
    roadQualityBias: 0.82,
  },
};

const MODE_SPEED: Record<AdvancedTravelMode, number> = {
  driving: 28,
  motorcycle: 32,
  transit: 18,
  cycling: 14,
  walking: 5,
};

function mapPreferenceToEngine(pref: Ai40RoutePreference): "fastest" | "safest" | "shortest" | "eco" | "lowest_fuel" {
  if (pref === "safest" || pref === "walking_safe" || pref === "wheelchair_accessible" || pref === "family_friendly" || pref === "night_safe") {
    return "safest";
  }
  if (pref === "lowest_fuel" || pref === "ev_optimized") return "lowest_fuel";
  if (pref === "lowest_traffic") return "eco";
  return "fastest";
}

function computeScores(
  warnings: { severity: string }[],
  distanceKm: number,
  config: (typeof PREFERENCE_CONFIG)[Ai40RoutePreference],
): RouteScores {
  const hazardPenalty = warnings.filter((w) => w.severity === "high").length * 8
    + warnings.filter((w) => w.severity === "medium").length * 4;

  return {
    safety: Math.max(50, Math.min(98, Math.round(92 - hazardPenalty + config.safetyBoost))),
    traffic: Math.max(40, Math.min(95, Math.round(90 - config.trafficBias * 35 - distanceKm * 0.3))),
    weatherRisk: Math.max(10, Math.min(90, Math.round(config.weatherBias * 55 + distanceKm * 0.2))),
    roadQuality: Math.max(45, Math.min(98, Math.round(88 - config.roadQualityBias * 12))),
  };
}

export interface PlanAi40RoutesInput {
  from: Coordinates;
  to: Coordinates;
  fromLabel: string;
  toLabel: string;
  mode?: AdvancedTravelMode;
  preferences?: Ai40RoutePreference[];
  now?: Date;
}

export function planAi40Routes(input: PlanAi40RoutesInput): Ai40RoutePlan[] {
  const {
    from,
    to,
    fromLabel,
    toLabel,
    mode = "driving",
    preferences = [
      "fastest",
      "safest",
      "lowest_traffic",
      "lowest_fuel",
      "ev_optimized",
      "motorcycle_friendly",
      "walking_safe",
      "wheelchair_accessible",
      "family_friendly",
      "night_safe",
    ],
    now = new Date(),
  } = input;

  return preferences.map((preference, index) => {
    const config = PREFERENCE_CONFIG[preference];
    const effectiveMode = config.mode ?? mode;
    const enginePref = mapPreferenceToEngine(preference);
    const polyline = buildPolyline(from, to, [], enginePref);
    let distanceKm = pathDistanceKm(polyline) * config.distanceFactor;
    distanceKm = Number(distanceKm.toFixed(2));

    const speed = MODE_SPEED[effectiveMode];
    const durationMin = Math.max(2, Math.round((distanceKm / speed) * 60 * config.durationFactor));
    const warnings = analyzeRouteSafety({
      distanceKm,
      polyline,
      preference: enginePref,
      mode: effectiveMode,
      seed: index + distanceKm,
    });
    const scores = computeScores(warnings, distanceKm, config);
    const fuelLiters = estimateFuelLiters(
      preference === "ev_optimized" ? distanceKm * 0.0 : distanceKm * (preference === "lowest_fuel" ? 0.92 : 1),
      effectiveMode === "motorcycle" ? "motorcycle" : "driving",
    );
    const eta = estimateArrival(now, durationMin);

    return {
      id: `ai40-${preference}-${index}`,
      label: config.label,
      preference,
      distanceKm,
      durationMin,
      etaIso: eta.toISOString(),
      fuelLiters: preference === "ev_optimized" ? 0 : fuelLiters,
      scores,
      polyline,
      warnings: warnings.map((w) => w.message),
      steps: [
        `Depart from ${fromLabel}`,
        `Follow the ${config.label.toLowerCase()} corridor (${distanceKm.toFixed(1)} km, ${formatDuration(durationMin)})`,
        ...warnings.slice(0, 2).map((w) => w.message),
        `Arrive at ${toLabel}`,
      ],
    };
  });
}

export function findAlternateRoute(
  routes: Ai40RoutePlan[],
  currentPreference: Ai40RoutePreference,
): Ai40RoutePlan | undefined {
  const current = routes.find((r) => r.preference === currentPreference);
  if (!current) return routes.find((r) => r.preference === "safest");

  return routes
    .filter((r) => r.preference !== currentPreference)
    .sort((a, b) => b.scores.safety - a.scores.safety || a.durationMin - b.durationMin)[0];
}

export { formatDuration };
