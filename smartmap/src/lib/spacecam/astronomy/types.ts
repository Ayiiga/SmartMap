export type AstronomicalObjectType =
  | "star"
  | "planet"
  | "moon"
  | "sun"
  | "constellation"
  | "satellite"
  | "comet"
  | "deep-sky"
  | "cluster"
  | "galaxy"
  | "nebula";

export interface EquatorialCoords {
  raHours: number;
  decDeg: number;
}

export interface HorizontalCoords {
  azimuthDeg: number;
  altitudeDeg: number;
}

export interface AstronomicalObject {
  id: string;
  name: string;
  type: AstronomicalObjectType;
  aliases?: string[];
  constellation?: string;
  raHours?: number;
  decDeg?: number;
  magnitude?: number;
  distanceLy?: number;
  distanceKm?: number;
  distanceAu?: number;
  catalogIds?: string[];
  description?: string;
  /** Whether this object is available offline from cached catalog data */
  offlineAvailable: boolean;
  /** Whether position requires live ephemeris calculation */
  requiresLiveData?: boolean;
}

export interface ConstellationDefinition {
  id: string;
  name: string;
  abbreviation: string;
  lines: [string, string][];
  boundary?: [number, number][];
}

export interface ObserverContext {
  latitude: number;
  longitude: number;
  elevationM?: number;
  date: Date;
}

export interface VisibilityInfo {
  altitudeDeg: number;
  azimuthDeg: number;
  isAboveHorizon: boolean;
  isDaylight: boolean;
  label: string;
}

export interface SearchResult extends AstronomicalObject {
  visibility?: VisibilityInfo;
  matchScore: number;
}

export interface IdentifyCandidate {
  object: AstronomicalObject;
  horizontal: HorizontalCoords;
  angularSeparationDeg: number;
  confidence: "high" | "medium" | "low";
}
