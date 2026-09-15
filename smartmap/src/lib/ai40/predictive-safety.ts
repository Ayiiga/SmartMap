import type { Coordinates, WeatherSnapshot } from "@/types/smart-map";
import type { CommunityReport } from "@/types/smart-map";
import type {
  PredictiveRisk,
  PredictiveRiskKind,
  RecommendedAction,
} from "@/lib/ai40/types";

const RISK_META: Record<
  PredictiveRiskKind,
  { label: string; description: string; recommendedAction: RecommendedAction }
> = {
  heavy_rain: {
    label: "Heavy rain likely",
    description: "AI estimates heavy rainfall along your route corridor.",
    recommendedAction: "slow_down",
  },
  flood: {
    label: "Flood risk",
    description: "Low-lying road segments may become impassable.",
    recommendedAction: "reroute",
  },
  lightning: {
    label: "Lightning activity",
    description: "Thunderstorm cells detected within range of your route.",
    recommendedAction: "seek_shelter",
  },
  strong_wind: {
    label: "Strong crosswinds",
    description: "Gusty winds may affect high-profile vehicles and bridges.",
    recommendedAction: "slow_down",
  },
  dust_storm: {
    label: "Dust storm risk",
    description: "Reduced visibility from blowing dust is possible.",
    recommendedAction: "pull_over",
  },
  wildfire: {
    label: "Wildfire smoke",
    description: "Air quality and visibility may degrade near fire-affected areas.",
    recommendedAction: "reroute",
  },
  road_icing: {
    label: "Road icing possible",
    description: "Freezing conditions may create slippery surfaces overnight.",
    recommendedAction: "slow_down",
  },
  reduced_visibility: {
    label: "Reduced visibility",
    description: "Fog or haze may limit sight distance ahead.",
    recommendedAction: "slow_down",
  },
  traffic_congestion: {
    label: "Traffic congestion building",
    description: "Traffic density is increasing on major corridors.",
    recommendedAction: "reroute",
  },
  multi_vehicle_accident: {
    label: "Multi-vehicle incident",
    description: "Reports indicate a significant incident affecting traffic flow.",
    recommendedAction: "reroute",
  },
  road_closure: {
    label: "Road closure ahead",
    description: "A segment of your route may be closed or restricted.",
    recommendedAction: "reroute",
  },
};

function hashCoord(lat: number, lng: number, salt: number): number {
  const x = Math.sin(lat * 12.9898 + lng * 78.233 + salt) * 43758.5453;
  return x - Math.floor(x);
}

function pointAlongRoute(
  from: Coordinates,
  to: Coordinates,
  t: number,
): Coordinates {
  return {
    lat: from.lat + (to.lat - from.lat) * t,
    lng: from.lng + (to.lng - from.lng) * t,
  };
}

function risksFromWeather(
  weather: WeatherSnapshot,
  location: Coordinates,
  now: Date,
): PredictiveRisk[] {
  const risks: PredictiveRisk[] = [];
  const base = { coordinates: location, source: "ai_forecast" as const, isOfficial: false };

  if (weather.rainChance >= 60) {
    risks.push({
      id: "pred-rain",
      kind: "heavy_rain",
      ...RISK_META.heavy_rain,
      confidencePercent: Math.min(95, weather.rainChance + 10),
      minutesToImpact: 15 + Math.round(weather.rainChance / 5),
      affectedAreaKm: 3.5,
      ...base,
      expiresAt: new Date(now.getTime() + 30 * 60_000).toISOString(),
    });
  }

  if (weather.floodRisk === "high" || weather.floodRisk === "moderate") {
    risks.push({
      id: "pred-flood",
      kind: "flood",
      ...RISK_META.flood,
      confidencePercent: weather.floodRisk === "high" ? 82 : 58,
      minutesToImpact: weather.floodRisk === "high" ? 20 : 45,
      affectedAreaKm: 2.0,
      ...base,
      alternateRouteHint: "Use elevated main roads",
      expiresAt: new Date(now.getTime() + 45 * 60_000).toISOString(),
    });
  }

  if (weather.windKph >= 40) {
    risks.push({
      id: "pred-wind",
      kind: "strong_wind",
      ...RISK_META.strong_wind,
      confidencePercent: Math.min(90, 50 + weather.windKph),
      minutesToImpact: 10,
      affectedAreaKm: 5.0,
      ...base,
      expiresAt: new Date(now.getTime() + 25 * 60_000).toISOString(),
    });
  }

  if (weather.condition.toLowerCase().includes("fog") || weather.humidity > 88) {
    risks.push({
      id: "pred-visibility",
      kind: "reduced_visibility",
      ...RISK_META.reduced_visibility,
      confidencePercent: 72,
      minutesToImpact: 8,
      affectedAreaKm: 4.0,
      ...base,
      expiresAt: new Date(now.getTime() + 20 * 60_000).toISOString(),
    });
  }

  return risks;
}

function risksFromReports(
  reports: CommunityReport[],
  from: Coordinates,
  to: Coordinates,
  now: Date,
): PredictiveRisk[] {
  const risks: PredictiveRisk[] = [];
  const verified = reports.filter(
    (r) => r.status === "verified" || r.status === "verifying",
  );

  for (const report of verified.slice(0, 4)) {
    const kindMap: Partial<Record<string, PredictiveRiskKind>> = {
      accident: "multi_vehicle_accident",
      flood: "flood",
      road_damage: "road_closure",
      fire: "wildfire",
      crime: "traffic_congestion",
    };
    const kind = kindMap[report.type];
    if (!kind) continue;

    const meta = RISK_META[kind];
    const t = hashCoord(report.coordinates.lat, report.coordinates.lng, 1);
    risks.push({
      id: `pred-report-${report.id}`,
      kind,
      label: meta.label,
      description: report.aiSummary ?? report.description,
      confidencePercent: report.status === "verified" ? 88 : 62,
      minutesToImpact: Math.round(5 + t * 25),
      affectedAreaKm: 1.5,
      coordinates: report.coordinates,
      recommendedAction: meta.recommendedAction,
      alternateRouteHint: "Community-verified alternate available",
      source: "community_verified",
      isOfficial: false,
      expiresAt: new Date(now.getTime() + 60 * 60_000).toISOString(),
    });
  }

  // Corridor-based AI estimates between endpoints
  const roll = hashCoord(from.lat, to.lng, 2);
  if (roll > 0.55 && risks.length < 3) {
    risks.push({
      id: "pred-traffic",
      kind: "traffic_congestion",
      ...RISK_META.traffic_congestion,
      confidencePercent: Math.round(55 + roll * 30),
      minutesToImpact: Math.round(10 + roll * 20),
      affectedAreaKm: 2.8,
      coordinates: pointAlongRoute(from, to, 0.45),
      alternateRouteHint: "Try the safest route option",
      source: "ai_forecast",
      isOfficial: false,
      expiresAt: new Date(now.getTime() + 30 * 60_000).toISOString(),
    });
  }

  return risks;
}

export interface PredictiveSafetyInput {
  from: Coordinates;
  to: Coordinates;
  weather?: WeatherSnapshot;
  reports?: CommunityReport[];
  now?: Date;
}

/** Estimate risks within the next 5–30 minutes along a route corridor. */
export function analyzePredictiveSafety(input: PredictiveSafetyInput): PredictiveRisk[] {
  const { from, to, weather, reports = [], now = new Date() } = input;
  const mid = pointAlongRoute(from, to, 0.5);

  const weatherRisks = weather ? risksFromWeather(weather, mid, now) : [];
  const reportRisks = risksFromReports(reports, from, to, now);

  const merged = [...weatherRisks, ...reportRisks];
  const seen = new Set<PredictiveRiskKind>();

  return merged
    .filter((r) => {
      if (seen.has(r.kind)) return false;
      seen.add(r.kind);
      return r.minutesToImpact <= 30;
    })
    .sort((a, b) => a.minutesToImpact - b.minutesToImpact);
}

export function computeSafetyScore(risks: PredictiveRisk[]): number {
  if (risks.length === 0) return 94;
  let score = 94;
  for (const risk of risks) {
    const weight = risk.isOfficial ? 1.2 : 1.0;
    score -= (risk.confidencePercent / 100) * 8 * weight;
  }
  return Math.max(35, Math.round(score));
}

export function actionLabel(action: RecommendedAction): string {
  switch (action) {
    case "continue":
      return "Continue with caution";
    case "slow_down":
      return "Reduce speed";
    case "reroute":
      return "Consider alternate route";
    case "pull_over":
      return "Pull over safely";
    case "seek_shelter":
      return "Seek shelter";
    case "delay_departure":
      return "Delay departure";
  }
}
