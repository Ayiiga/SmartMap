import type { SafetyWarning } from "@/lib/navigation/types";
import type { PredictiveRisk, TravelAlert, TravelAlertKind } from "@/lib/ai40/types";
import { warningVoiceLine } from "@/lib/navigation/safety-analysis";

const KIND_MAP: Partial<Record<SafetyWarning["kind"], TravelAlertKind>> = {
  flood: "flood_prone",
  accident: "accident",
  dangerous_curve: "sharp_curve",
  school_zone: "school_zone",
  heavy_traffic: "accident",
  road_closed: "road_closure",
  construction: "construction",
  slippery: "reduced_visibility",
};

function severityFromRisk(risk: PredictiveRisk): TravelAlert["severity"] {
  if (risk.confidencePercent >= 85 && risk.recommendedAction === "reroute") return "critical";
  if (risk.confidencePercent >= 70) return "warning";
  if (risk.confidencePercent >= 50) return "caution";
  return "info";
}

export function alertsFromRouteWarnings(warnings: SafetyWarning[]): TravelAlert[] {
  return warnings.map((w) => ({
    id: `alert-${w.id}`,
    kind: KIND_MAP[w.kind] ?? "sharp_curve",
    message: w.message,
    voiceLine: warningVoiceLine(w),
    distanceM: Math.round(w.distanceAlongKm * 1000),
    severity: w.severity === "high" ? "warning" : w.severity === "medium" ? "caution" : "info",
    source: "ai_forecast",
    isOfficial: false,
  }));
}

export function alertsFromPredictiveRisks(risks: PredictiveRisk[]): TravelAlert[] {
  const kindMap: Partial<Record<PredictiveRisk["kind"], TravelAlertKind>> = {
    heavy_rain: "heavy_rain",
    flood: "flood_prone",
    strong_wind: "crosswind",
    reduced_visibility: "reduced_visibility",
    multi_vehicle_accident: "accident",
    road_closure: "road_closure",
    traffic_congestion: "accident",
  };

  return risks.map((risk) => ({
    id: `alert-pred-${risk.id}`,
    kind: kindMap[risk.kind] ?? "reduced_visibility",
    message: risk.description,
    voiceLine: risk.label,
    distanceM: Math.round(risk.affectedAreaKm * 500),
    severity: severityFromRisk(risk),
    source: risk.source,
    isOfficial: risk.isOfficial,
  }));
}

export function mergeTravelAlerts(
  routeWarnings: SafetyWarning[],
  predictiveRisks: PredictiveRisk[],
): TravelAlert[] {
  const fromRoute = alertsFromRouteWarnings(routeWarnings);
  const fromPredictive = alertsFromPredictiveRisks(predictiveRisks);
  const seen = new Set<string>();

  return [...fromPredictive, ...fromRoute]
    .filter((a) => {
      const key = `${a.kind}-${a.message.slice(0, 40)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.distanceM - b.distanceM);
}

export function alertsWithinDistance(
  alerts: TravelAlert[],
  maxDistanceM: number,
): TravelAlert[] {
  return alerts.filter((a) => a.distanceM <= maxDistanceM);
}

export function nearestAlert(alerts: TravelAlert[]): TravelAlert | null {
  if (alerts.length === 0) return null;
  return alerts.reduce((nearest, a) => (a.distanceM < nearest.distanceM ? a : nearest));
}
