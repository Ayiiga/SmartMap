import type { Coordinates, Place, TravelMode } from "@/types/smart-map";

/** Phase 7 transport modes (includes motorcycle). */
export type AdvancedTravelMode = TravelMode;

export type RoutePreference =
  | "fastest"
  | "safest"
  | "shortest"
  | "eco"
  | "lowest_fuel";

export type AvoidOption = "tolls" | "traffic" | "ferries" | "unpaved";

export type RouteDifficulty = "easy" | "moderate" | "challenging" | "difficult";

export type MapLayerId =
  | "satellite"
  | "standard"
  | "terrain"
  | "vegetation"
  | "rivers"
  | "lakes"
  | "mountains"
  | "forests"
  | "land_cover"
  | "traffic"
  | "weather"
  | "night";

export type SafetyHazardKind =
  | "accident"
  | "flood"
  | "poor_condition"
  | "construction"
  | "dangerous_curve"
  | "steep_hill"
  | "high_crime"
  | "wildlife"
  | "school_zone"
  | "heavy_traffic"
  | "road_closed"
  | "bridge"
  | "slippery";

export interface RouteAvoidOptions {
  tolls: boolean;
  traffic: boolean;
  ferries: boolean;
  unpaved: boolean;
}

export interface RouteWaypoint {
  id: string;
  label: string;
  coordinates: Coordinates;
  placeId?: string;
}

export interface ElevationPoint {
  distanceKm: number;
  elevationM: number;
}

export interface SafetyWarning {
  id: string;
  kind: SafetyHazardKind;
  label: string;
  severity: "low" | "medium" | "high";
  distanceAlongKm: number;
  message: string;
}

export interface AdvancedRoutePlan {
  id: string;
  label: string;
  preference: RoutePreference;
  mode: AdvancedTravelMode;
  from: RouteWaypoint;
  to: RouteWaypoint;
  stops: RouteWaypoint[];
  distanceKm: number;
  distanceMiles: number;
  durationMin: number;
  etaIso: string;
  difficulty: RouteDifficulty;
  fuelLiters?: number;
  safetyScore: number;
  elevationProfile: ElevationPoint[];
  warnings: SafetyWarning[];
  steps: string[];
  polyline: Coordinates[];
  avoided: AvoidOption[];
}

export interface EmergencyNavItem {
  place: Place;
  distanceKm: number;
  durationMin: number;
  openStatus: "open" | "closed" | "unknown";
  phone?: string;
}

export interface TripSummaryData {
  routeId: string;
  mode: AdvancedTravelMode;
  totalDistanceKm: number;
  totalDurationMin: number;
  averageSpeedKmh: number;
  fuelLiters?: number;
  stops: RouteWaypoint[];
  warnings: SafetyWarning[];
  polyline: Coordinates[];
  completedAt: string;
}

export interface MapInfoOverlay {
  roadNames: string[];
  communities: string[];
  rivers: string[];
  lakes: string[];
  forestReserves: string[];
  nationalParks: string[];
  districts: string[];
  regions: string[];
  elevationM: number;
  weatherLabel: string;
  timeToDestinationMin: number | null;
  currentSpeedKmh: number | null;
}
