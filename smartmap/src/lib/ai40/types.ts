import type { Coordinates } from "@/types/smart-map";

/** AI 4.0 route preference — extends Phase 7 with specialized options. */
export type Ai40RoutePreference =
  | "fastest"
  | "safest"
  | "lowest_traffic"
  | "lowest_fuel"
  | "ev_optimized"
  | "motorcycle_friendly"
  | "walking_safe"
  | "wheelchair_accessible"
  | "family_friendly"
  | "night_safe";

export type PredictiveRiskKind =
  | "heavy_rain"
  | "flood"
  | "lightning"
  | "strong_wind"
  | "dust_storm"
  | "wildfire"
  | "road_icing"
  | "reduced_visibility"
  | "traffic_congestion"
  | "multi_vehicle_accident"
  | "road_closure";

export type AlertSource = "ai_forecast" | "official_alert" | "community_verified" | "traffic_feed";

export type RecommendedAction =
  | "continue"
  | "slow_down"
  | "reroute"
  | "pull_over"
  | "seek_shelter"
  | "delay_departure";

export interface PredictiveRisk {
  id: string;
  kind: PredictiveRiskKind;
  label: string;
  description: string;
  confidencePercent: number;
  minutesToImpact: number;
  affectedAreaKm: number;
  coordinates: Coordinates;
  recommendedAction: RecommendedAction;
  alternateRouteHint?: string;
  source: AlertSource;
  isOfficial: boolean;
  expiresAt: string;
}

export interface RouteScores {
  safety: number;
  traffic: number;
  weatherRisk: number;
  roadQuality: number;
}

export interface Ai40RoutePlan {
  id: string;
  label: string;
  preference: Ai40RoutePreference;
  distanceKm: number;
  durationMin: number;
  etaIso: string;
  fuelLiters?: number;
  scores: RouteScores;
  polyline: Coordinates[];
  warnings: string[];
  steps: string[];
}

export type TravelAlertKind =
  | "heavy_rain"
  | "flood_prone"
  | "accident"
  | "sharp_curve"
  | "school_zone"
  | "crosswind"
  | "reduced_visibility"
  | "emergency_vehicle"
  | "construction"
  | "road_closure";

export interface TravelAlert {
  id: string;
  kind: TravelAlertKind;
  message: string;
  voiceLine: string;
  distanceM: number;
  severity: "info" | "caution" | "warning" | "critical";
  source: AlertSource;
  isOfficial: boolean;
}

export interface SafetyDashboardSnapshot {
  safetyScore: number;
  weatherRisk: "low" | "moderate" | "high" | "severe";
  trafficRisk: "low" | "moderate" | "high" | "severe";
  airQuality: number;
  travelRecommendation: string;
  roadClosures: number;
  activeHazards: number;
  aiSummary: string;
  predictiveRisks: PredictiveRisk[];
  updatedAt: string;
}

export type PrivacyConsentKey =
  | "location"
  | "motion_sensors"
  | "calendar"
  | "weather_providers"
  | "government_alerts"
  | "traffic_feeds"
  | "community_reports"
  | "web_intelligence"
  | "bluetooth"
  | "camera"
  | "microphone"
  | "location_sharing";

export interface PrivacyConsent {
  key: PrivacyConsentKey;
  granted: boolean;
  grantedAt?: string;
  purpose: string;
}

export interface TrustedSource {
  id: string;
  name: string;
  type: "weather" | "government" | "traffic" | "transit" | "news";
  url: string;
  requiresConsent: PrivacyConsentKey;
}

export interface WebIntelligenceItem {
  id: string;
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  relevanceScore: number;
  publishedAt: string;
}
