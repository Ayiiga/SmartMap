import type { Coordinates, WeatherSnapshot } from "@/types/smart-map";
import type { CommunityReport } from "@/types/smart-map";
import type { SafetyDashboardSnapshot } from "@/lib/ai40/types";
import {
  analyzePredictiveSafety,
  computeSafetyScore,
} from "@/lib/ai40/predictive-safety";

function weatherRiskLevel(weather?: WeatherSnapshot): SafetyDashboardSnapshot["weatherRisk"] {
  if (!weather) return "moderate";
  if (weather.floodRisk === "high" || weather.heatAlert) return "severe";
  if (weather.floodRisk === "moderate" || weather.rainChance >= 70) return "high";
  if (weather.rainChance >= 40) return "moderate";
  return "low";
}

function trafficRiskFromReports(reports: CommunityReport[]): SafetyDashboardSnapshot["trafficRisk"] {
  const trafficReports = reports.filter(
    (r) =>
      (r.type === "accident" || r.type === "road_damage") &&
      (r.status === "verified" || r.status === "verifying"),
  );
  if (trafficReports.length >= 3) return "severe";
  if (trafficReports.length >= 2) return "high";
  if (trafficReports.length >= 1) return "moderate";
  return "low";
}

function buildRecommendation(
  safetyScore: number,
  weatherRisk: SafetyDashboardSnapshot["weatherRisk"],
  trafficRisk: SafetyDashboardSnapshot["trafficRisk"],
): string {
  if (safetyScore < 50 || weatherRisk === "severe") {
    return "Delay travel if possible. Use the safest route and enable voice alerts.";
  }
  if (weatherRisk === "high" || trafficRisk === "high") {
    return "Allow extra time. Prefer main roads and check alternate routes.";
  }
  if (safetyScore >= 85) {
    return "Conditions look favorable. Standard precautions apply.";
  }
  return "Moderate conditions. Stay alert and keep location sharing enabled for emergencies.";
}

export interface BuildDashboardInput {
  from: Coordinates;
  to?: Coordinates;
  weather?: WeatherSnapshot;
  reports?: CommunityReport[];
  now?: Date;
}

export function buildSafetyDashboard(input: BuildDashboardInput): SafetyDashboardSnapshot {
  const { from, to = from, weather, reports = [], now = new Date() } = input;
  const predictiveRisks = analyzePredictiveSafety({ from, to, weather, reports, now });
  const safetyScore = computeSafetyScore(predictiveRisks);
  const weatherRisk = weatherRiskLevel(weather);
  const trafficRisk = trafficRiskFromReports(reports);
  const roadClosures = reports.filter(
    (r) => r.type === "road_damage" && r.status !== "resolved",
  ).length;

  const officialCount = predictiveRisks.filter((r) => r.isOfficial).length;
  const aiCount = predictiveRisks.length - officialCount;

  return {
    safetyScore,
    weatherRisk,
    trafficRisk,
    airQuality: weather?.aqi ?? 42,
    travelRecommendation: buildRecommendation(safetyScore, weatherRisk, trafficRisk),
    roadClosures,
    activeHazards: predictiveRisks.length,
    aiSummary:
      predictiveRisks.length === 0
        ? "No significant hazards predicted for your area in the next 30 minutes."
        : `${predictiveRisks.length} potential hazard${predictiveRisks.length > 1 ? "s" : ""} detected (${aiCount} AI forecast${aiCount !== 1 ? "s" : ""}${officialCount > 0 ? `, ${officialCount} official` : ""}). Highest priority: ${predictiveRisks[0].label} in ~${predictiveRisks[0].minutesToImpact} min.`,
    predictiveRisks,
    updatedAt: now.toISOString(),
  };
}
