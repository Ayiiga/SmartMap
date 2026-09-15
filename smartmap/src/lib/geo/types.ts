import type { Coordinates, PlaceCategory } from "@/types/smart-map";

export type LocationPermission = "unknown" | "prompt" | "granted" | "denied" | "unavailable";

export interface LocationFix {
  coordinates: Coordinates;
  accuracyM: number | null;
  altitudeM: number | null;
  speedMps: number | null;
  heading: number | null;
  timestamp: number;
}

export interface ResolvedAddress {
  label: string;
  street?: string;
  neighbourhood?: string;
  city?: string;
  district?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  postcode?: string;
  raw?: string;
}

export interface GeoSearchResult {
  id: string;
  name: string;
  label: string;
  coordinates: Coordinates;
  category?: PlaceCategory | "place" | "address" | "city" | "country" | "airport" | "tourism";
  country?: string;
  countryCode?: string;
  city?: string;
  region?: string;
  type?: string;
  importance?: number;
}

export interface NearbyPoi {
  id: string;
  name: string;
  category: PlaceCategory;
  coordinates: Coordinates;
  address?: string;
  phone?: string;
  distanceKm: number;
  durationMin: number;
  openStatus?: "open" | "closed" | "unknown";
}

export type LocationEngineStatus =
  | "idle"
  | "locating"
  | "resolved"
  | "low_accuracy"
  | "unavailable"
  | "permission_denied"
  | "network_unavailable";

export type AddressResolveStatus = "idle" | "resolving" | "resolved" | "failed" | "unavailable";

export type NavEndpointSource =
  | "gps"
  | "home"
  | "work"
  | "map"
  | "search"
  | "favorite"
  | "recent"
  | "manual";

export interface NavEndpoint {
  id: string;
  label: string;
  coordinates: Coordinates;
  source: NavEndpointSource;
  placeId?: string;
  address?: string;
}
