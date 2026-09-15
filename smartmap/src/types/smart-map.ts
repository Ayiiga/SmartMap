export type PlaceCategory =
  | "police"
  | "fire"
  | "ambulance"
  | "hospital"
  | "clinic"
  | "pharmacy"
  | "school"
  | "university"
  | "hostel"
  | "hotel"
  | "restaurant"
  | "bank"
  | "atm"
  | "fuel"
  | "market"
  | "bus_station"
  | "airport"
  | "church"
  | "mosque"
  | "government"
  | "passport"
  | "dvla"
  | "court"
  | "attraction"
  | "park"
  | "toilet"
  | "ev_charger"
  | "shelter"
  | "disaster_center";

export type VerificationBadge =
  | "government"
  | "police"
  | "hospital"
  | "school"
  | "business"
  | "ngo";

export type TravelMode = "driving" | "walking" | "cycling" | "transit" | "motorcycle";

export type MapStyle = "streets" | "satellite" | "terrain" | "dark";

export type ReportType =
  | "crime"
  | "accident"
  | "fire"
  | "flood"
  | "power_outage"
  | "water_outage"
  | "road_damage"
  | "missing_person"
  | "unsafe_area"
  | "environmental";

export type ReportStatus = "submitted" | "verifying" | "verified" | "resolved" | "dismissed";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  coordinates: Coordinates;
  address: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  phone?: string;
  website?: string;
  hours?: string;
  rating?: number;
  reviewCount?: number;
  verified?: VerificationBadge;
  accessibility?: boolean;
  parking?: boolean;
  description?: string;
  popularTimes?: string;
}

export interface CommunityReport {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  coordinates: Coordinates;
  city: string;
  countryCode: string;
  status: ReportStatus;
  createdAt: string;
  mediaCount?: number;
  aiSummary?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface CountryProfile {
  code: string;
  name: string;
  flag: string;
  capital: string;
  languages: string[];
  emergency: {
    police: string;
    fire: string;
    ambulance: string;
    general?: string;
  };
  center: Coordinates;
  zoom: number;
}

export interface WeatherSnapshot {
  tempC: number;
  condition: string;
  humidity: number;
  windKph: number;
  uvIndex: number;
  aqi: number;
  rainChance: number;
  floodRisk: "low" | "moderate" | "high";
  heatAlert: boolean;
}

export interface RoutePlan {
  mode: TravelMode;
  distanceKm: number;
  durationMin: number;
  safetyScore: number;
  steps: string[];
}

export interface UserMapPreferences {
  savedPlaceIds: string[];
  favoriteRouteIds: string[];
  emergencyContacts: EmergencyContact[];
  womenSafetyMode: boolean;
  childSafetyMode: boolean;
  touristSafetyMode: boolean;
  bloodGroup?: string;
  medicalNotes?: string;
  mapStyle: MapStyle;
  voiceNav: boolean;
  voiceLanguage: "en" | "tw";
}
