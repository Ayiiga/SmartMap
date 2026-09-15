import type { Coordinates } from "@/types/smart-map";
import type { GeoSearchResult, NearbyPoi, ResolvedAddress } from "@/lib/geo/types";
import type { PlaceCategory } from "@/types/smart-map";
import { haversineKm } from "@/content/smart-map/places";
import { MODE_SPEED_KMH } from "@/lib/navigation/route-engine";
import { fetchWithRetry } from "@/lib/network/fetch-with-retry";

const NOMINATIM = "https://nominatim.openstreetmap.org";
const OVERPASS = "https://overpass-api.de/api/interpreter";

const USER_AGENT = "SmartMap/2.0 (https://smart-map.vercel.app; contact=support@smartmap.app)";

function headers(): HeadersInit {
  return {
    Accept: "application/json",
    "User-Agent": USER_AGENT,
  };
}

interface NominatimItem {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type?: string;
  class?: string;
  importance?: number;
  address?: Record<string, string>;
}

function mapCategory(item: NominatimItem): GeoSearchResult["category"] {
  const t = `${item.class ?? ""}:${item.type ?? ""}`.toLowerCase();
  if (t.includes("airport") || item.type === "aerodrome") return "airport";
  if (t.includes("hospital") || t.includes("clinic")) return "hospital";
  if (t.includes("police")) return "police";
  if (t.includes("school")) return "school";
  if (t.includes("university") || t.includes("college")) return "university";
  if (t.includes("hotel") || t.includes("hostel")) return "hotel";
  if (t.includes("tourism") || t.includes("attraction")) return "tourism";
  if (item.type === "city" || item.type === "town" || item.type === "village") return "city";
  if (item.type === "country") return "country";
  if (item.class === "highway" || item.class === "place") return "address";
  return "place";
}

export function parseResolvedAddress(item: NominatimItem): ResolvedAddress {
  const a = item.address ?? {};
  const city =
    a.city || a.town || a.village || a.municipality || a.suburb || a.county || undefined;
  const district = a.city_district || a.district || a.borough || a.county || undefined;
  const region = a.state || a.region || a.province || undefined;
  const street = [a.house_number, a.road || a.pedestrian || a.path].filter(Boolean).join(" ") || undefined;
  const neighbourhood = a.neighbourhood || a.suburb || a.quarter || undefined;
  const country = a.country;
  const countryCode = a.country_code?.toUpperCase();
  const label =
    [street, neighbourhood, city, region, country].filter(Boolean).join(", ") || item.display_name;

  return {
    label,
    street,
    neighbourhood,
    city,
    district,
    region,
    country,
    countryCode,
    postcode: a.postcode,
    raw: item.display_name,
  };
}

export function toGeoResult(item: NominatimItem): GeoSearchResult {
  const address = parseResolvedAddress(item);
  return {
    id: `osm-${item.place_id}`,
    name: item.name || address.street || address.city || item.display_name.split(",")[0],
    label: item.display_name,
    coordinates: { lat: Number(item.lat), lng: Number(item.lon) },
    category: mapCategory(item),
    country: address.country,
    countryCode: address.countryCode,
    city: address.city,
    region: address.region,
    type: item.type,
    importance: item.importance,
  };
}

/** Worldwide forward geocode / autocomplete (Nominatim). */
export async function nominatimSearch(
  query: string,
  options?: { limit?: number; signal?: AbortSignal },
): Promise<GeoSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  // Coordinate paste: "5.6037, -0.1870"
  const coordMatch = q.match(/^(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/);
  if (coordMatch) {
    const lat = Number(coordMatch[1]);
    const lng = Number(coordMatch[2]);
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return [
        {
          id: `coord-${lat}-${lng}`,
          name: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          label: `Coordinates ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          coordinates: { lat, lng },
          category: "place",
        },
      ];
    }
  }

  const url = new URL(`${NOMINATIM}/search`);
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", String(options?.limit ?? 8));

  const res = await fetchWithRetry(url.toString(), {
    headers: headers(),
    signal: options?.signal,
    retries: 2,
    retryDelayMs: 600,
    timeoutMs: 12_000,
  });
  if (!res.ok) throw new Error(`Geocode search failed (${res.status})`);
  const data = (await res.json()) as NominatimItem[];
  return data.map(toGeoResult);
}

/** Reverse geocode a GPS fix. */
export async function nominatimReverse(
  coords: Coordinates,
  options?: { signal?: AbortSignal },
): Promise<ResolvedAddress | null> {
  const url = new URL(`${NOMINATIM}/reverse`);
  url.searchParams.set("lat", String(coords.lat));
  url.searchParams.set("lon", String(coords.lng));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "18");

  const res = await fetchWithRetry(url.toString(), {
    headers: headers(),
    signal: options?.signal,
    retries: 2,
    retryDelayMs: 600,
    timeoutMs: 12_000,
  });
  if (!res.ok) return null;
  const data = (await res.json()) as NominatimItem;
  if (!data?.lat) return null;
  return parseResolvedAddress(data);
}

const OVERPASS_AMENITIES: { amenity: string; category: PlaceCategory; nameFallback: string }[] = [
  { amenity: "police", category: "police", nameFallback: "Police Station" },
  { amenity: "fire_station", category: "fire", nameFallback: "Fire Service" },
  { amenity: "hospital", category: "hospital", nameFallback: "Hospital" },
  { amenity: "clinic", category: "clinic", nameFallback: "Clinic" },
  { amenity: "pharmacy", category: "pharmacy", nameFallback: "Pharmacy" },
  { amenity: "fuel", category: "fuel", nameFallback: "Fuel Station" },
];

/** Live nearby emergency/service POIs via Overpass around the user's GPS. */
export async function overpassNearbyEmergency(
  origin: Coordinates,
  options?: { radiusM?: number; signal?: AbortSignal },
): Promise<NearbyPoi[]> {
  const radius = options?.radiusM ?? 8000;
  const filters = OVERPASS_AMENITIES.map(
    (a) =>
      `node["amenity"="${a.amenity}"](around:${radius},${origin.lat},${origin.lng});way["amenity"="${a.amenity}"](around:${radius},${origin.lat},${origin.lng});`,
  ).join("\n");

  // ambulance often tagged as emergency=ambulance_station
  const query = `
    [out:json][timeout:25];
    (
      ${filters}
      node["emergency"="ambulance_station"](around:${radius},${origin.lat},${origin.lng});
      node["amenity"="doctors"](around:${radius},${origin.lat},${origin.lng});
    );
    out center 40;
  `;

  const res = await fetchWithRetry(OVERPASS, {
    method: "POST",
    headers: {
      ...headers(),
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: `data=${encodeURIComponent(query)}`,
    signal: options?.signal,
    retries: 2,
    retryDelayMs: 1000,
    timeoutMs: 25_000,
  });
  if (!res.ok) throw new Error(`Nearby POI lookup failed (${res.status})`);

  const data = (await res.json()) as {
    elements: Array<{
      id: number;
      type: string;
      lat?: number;
      lon?: number;
      center?: { lat: number; lon: number };
      tags?: Record<string, string>;
    }>;
  };

  const speed = MODE_SPEED_KMH.driving;
  const results: NearbyPoi[] = [];

  for (const el of data.elements ?? []) {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat == null || lon == null) continue;
    const amenity = el.tags?.amenity || el.tags?.emergency || "";
    let category: PlaceCategory = "hospital";
    let fallback = "Place";
    if (amenity === "police") {
      category = "police";
      fallback = "Police Station";
    } else if (amenity === "fire_station") {
      category = "fire";
      fallback = "Fire Service";
    } else if (amenity === "hospital") {
      category = "hospital";
      fallback = "Hospital";
    } else if (amenity === "clinic" || amenity === "doctors") {
      category = "clinic";
      fallback = "Clinic";
    } else if (amenity === "pharmacy") {
      category = "pharmacy";
      fallback = "Pharmacy";
    } else if (amenity === "fuel") {
      category = "fuel";
      fallback = "Fuel Station";
    } else if (amenity === "ambulance_station") {
      category = "ambulance";
      fallback = "Ambulance Station";
    }

    const coordinates = { lat, lng: lon };
    const distanceKm = Number(haversineKm(origin, coordinates).toFixed(2));
    results.push({
      id: `osm-${el.type}-${el.id}`,
      name: el.tags?.name || fallback,
      category,
      coordinates,
      address: [el.tags?.["addr:street"], el.tags?.["addr:city"]].filter(Boolean).join(", ") || undefined,
      phone: el.tags?.phone || el.tags?.["contact:phone"],
      distanceKm,
      durationMin: Math.max(2, Math.round((distanceKm / speed) * 60)),
    });
  }

  // Keep nearest of each priority category + overall nearest list
  const priority: PlaceCategory[] = [
    "police",
    "fire",
    "hospital",
    "ambulance",
    "pharmacy",
    "fuel",
    "clinic",
  ];
  const picked: NearbyPoi[] = [];
  for (const cat of priority) {
    const best = results
      .filter((r) => r.category === cat)
      .sort((a, b) => a.distanceKm - b.distanceKm)[0];
    if (best) picked.push(best);
  }
  const extras = results
    .filter((r) => !picked.some((p) => p.id === r.id))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 6);

  return [...picked, ...extras].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 12);
}
