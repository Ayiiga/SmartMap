export interface FuelPrice {
  stationId: string;
  stationName: string;
  fuelType: "petrol" | "diesel" | "lpg";
  priceGhs: number;
  updatedAt: string;
  coordinates: { lat: number; lng: number };
}

export interface ParkingSpot {
  id: string;
  name: string;
  available: number;
  capacity: number;
  feeGhsPerHour: number;
  coordinates: { lat: number; lng: number };
}

export interface NearbyPromotion {
  id: string;
  title: string;
  business: string;
  distanceKm: number;
  expiresAt: string;
}

export const FUEL_PRICES: FuelPrice[] = [
  {
    stationId: "gh-fuel-shell-spintex",
    stationName: "Shell — Spintex",
    fuelType: "petrol",
    priceGhs: 13.45,
    updatedAt: new Date().toISOString(),
    coordinates: { lat: 5.635, lng: -0.12 },
  },
  {
    stationId: "gh-fuel-total-osu",
    stationName: "TotalEnergies — Osu",
    fuelType: "diesel",
    priceGhs: 14.1,
    updatedAt: new Date().toISOString(),
    coordinates: { lat: 5.56, lng: -0.175 },
  },
];

export const PARKING_SPOTS: ParkingSpot[] = [
  {
    id: "park-airport",
    name: "Airport City Parking",
    available: 42,
    capacity: 120,
    feeGhsPerHour: 5,
    coordinates: { lat: 5.602, lng: -0.172 },
  },
  {
    id: "park-makola",
    name: "Makola Multi-storey",
    available: 8,
    capacity: 80,
    feeGhsPerHour: 3,
    coordinates: { lat: 5.55, lng: -0.21 },
  },
];

export const NEARBY_PROMOTIONS: NearbyPromotion[] = [
  {
    id: "promo-1",
    title: "10% off pharmacy essentials",
    business: "Ernest Chemists — Osu",
    distanceKm: 2.1,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "promo-2",
    title: "Free EV charge for first 30 mins",
    business: "EV Charger — Airport City",
    distanceKm: 1.7,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
];

export function recommendStops(goal: string): string[] {
  const q = goal.toLowerCase();
  if (q.includes("airport")) {
    return ["Fuel near Airport City", "Taxi rank at Airport", "EV charger if needed"];
  }
  if (q.includes("school") || q.includes("legon")) {
    return ["University of Ghana Legon", "Nearby hostel", "Safe evening route corridor"];
  }
  return ["Nearest hospital", "Nearest police station", "Fuel stop on route"];
}
