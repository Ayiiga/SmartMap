export interface TripPlan {
  id: string;
  name: string;
  stops: string[];
  mode: "driving" | "walking" | "cycling" | "transit";
  createdAt: string;
  favorite: boolean;
}

export interface RouteHistoryItem {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  durationMin: number;
  completedAt: string;
}

export const SAMPLE_TRIPS: TripPlan[] = [
  {
    id: "trip-1",
    name: "Airport → Legon via Ring Road",
    stops: ["Kotoka International Airport", "37 Military Hospital", "University of Ghana, Legon"],
    mode: "driving",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    favorite: true,
  },
  {
    id: "trip-2",
    name: "Osu essentials loop",
    stops: ["Ernest Chemists — Osu", "Buka Restaurant", "Labadi Beach Hotel"],
    mode: "walking",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    favorite: false,
  },
];

export const SAMPLE_ROUTE_HISTORY: RouteHistoryItem[] = [
  {
    id: "hist-1",
    from: "Airport City",
    to: "Korle Bu Teaching Hospital",
    distanceKm: 9.4,
    durationMin: 28,
    completedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: "hist-2",
    from: "Circle",
    to: "Makola Market",
    distanceKm: 2.2,
    durationMin: 14,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
];
