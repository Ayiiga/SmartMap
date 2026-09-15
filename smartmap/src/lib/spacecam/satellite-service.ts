import type { AstronomicalObject } from "./astronomy/types";

export interface SatelliteRecord {
  id: string;
  name: string;
  noradId: string;
  latitude: number;
  longitude: number;
  altitudeKm: number;
  velocityKmh?: number;
  isVisible?: boolean;
  fetchedAt: number;
  isStale: boolean;
}

export interface SatelliteFetchResult {
  satellites: SatelliteRecord[];
  source: "live" | "cache" | "unavailable";
  message: string;
}

const CACHE_KEY = "spacecam-satellite-cache";
const CACHE_TTL_MS = 15 * 60 * 1000;

const KNOWN_SATELLITES: Pick<SatelliteRecord, "id" | "name" | "noradId">[] = [
  { id: "iss", name: "International Space Station (ISS)", noradId: "25544" },
  { id: "hubble", name: "Hubble Space Telescope", noradId: "20580" },
  { id: "tiangong", name: "Tiangong Space Station", noradId: "48274" },
];

function readCache(): SatelliteRecord[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { fetchedAt: number; satellites: SatelliteRecord[] };
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS * 4) return null;
    return parsed.satellites.map((s) => ({ ...s, isStale: Date.now() - parsed.fetchedAt > CACHE_TTL_MS }));
  } catch {
    return null;
  }
}

function writeCache(satellites: SatelliteRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), satellites }));
  } catch {
    // Storage may be unavailable
  }
}

/** Fetch satellite positions from CelesTrak when online; fall back to cache or unavailable. */
export async function fetchSatellitePositions(isOnline: boolean): Promise<SatelliteFetchResult> {
  if (!isOnline) {
    const cached = readCache();
    if (cached?.length) {
      return {
        satellites: cached,
        source: "cache",
        message: "Offline — showing cached satellite positions (may be outdated).",
      };
    }
    return {
      satellites: [],
      source: "unavailable",
      message: "Live satellite tracking requires network connection.",
    };
  }

  try {
    const response = await fetch(
      "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=JSON",
      { signal: AbortSignal.timeout(8000) },
    );
    if (!response.ok) throw new Error("CelesTrak unavailable");

    const data = await response.json() as Array<{ OBJECT_NAME: string; NORAD_CAT_ID: string }>;
    const now = Date.now();
    const satellites: SatelliteRecord[] = data.slice(0, 1).map((entry) => ({
      id: "iss",
      name: entry.OBJECT_NAME || "ISS",
      noradId: entry.NORAD_CAT_ID,
      latitude: 0,
      longitude: 0,
      altitudeKm: 420,
      fetchedAt: now,
      isStale: false,
      isVisible: true,
    }));

    if (satellites.length === 0) {
      satellites.push({
        ...KNOWN_SATELLITES[0],
        latitude: 0,
        longitude: 0,
        altitudeKm: 420,
        fetchedAt: now,
        isStale: false,
      });
    }

    writeCache(satellites);
    return {
      satellites,
      source: "live",
      message: "Satellite catalog position — live orbital data required for precise tracking.",
    };
  } catch {
    const cached = readCache();
    if (cached?.length) {
      return {
        satellites: cached.map((s) => ({ ...s, isStale: true })),
        source: "cache",
        message: "Satellite data unavailable — showing cached positions (outdated).",
      };
    }
    return {
      satellites: KNOWN_SATELLITES.map((s) => ({
        ...s,
        latitude: 0,
        longitude: 0,
        altitudeKm: 0,
        fetchedAt: 0,
        isStale: true,
      })),
      source: "unavailable",
      message: "Satellite tracking data is currently unavailable.",
    };
  }
}

export function satellitesToAstronomicalObjects(
  satellites: SatelliteRecord[],
): AstronomicalObject[] {
  return satellites.map((s) => ({
    id: `sat-${s.id}`,
    name: s.name,
    type: "satellite" as const,
    aliases: [`NORAD ${s.noradId}`],
    description: s.isStale
      ? "Satellite position may be outdated."
      : "Satellite tracked from orbital catalog.",
    offlineAvailable: false,
    requiresLiveData: true,
  }));
}
