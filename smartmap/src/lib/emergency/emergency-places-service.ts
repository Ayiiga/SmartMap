import type { Coordinates } from "@/types/smart-map";
import type { NearbyPoi } from "@/lib/geo/types";
import { fetchJsonWithRetry } from "@/lib/network/fetch-with-retry";
import { nearbyEmergencyServices } from "@/lib/navigation/emergency";
import { PLACES } from "@/content/smart-map/places";
import { classifyFetchError, logSmartMapError } from "@/lib/errors/smart-map-errors";
import type { PlaceCategory } from "@/types/smart-map";

export type EmergencyCategory =
  | "hospital"
  | "pharmacy"
  | "police"
  | "fire"
  | "ambulance"
  | "clinic"
  | "shelter";

export const EMERGENCY_CATEGORY_META: Record<
  EmergencyCategory,
  { emoji: string; label: string; category: PlaceCategory }
> = {
  hospital: { emoji: "🏥", label: "Hospital", category: "hospital" },
  pharmacy: { emoji: "💊", label: "Pharmacy", category: "pharmacy" },
  police: { emoji: "🚓", label: "Police", category: "police" },
  fire: { emoji: "🚒", label: "Fire Service", category: "fire" },
  ambulance: { emoji: "🚑", label: "Ambulance", category: "ambulance" },
  clinic: { emoji: "🏥", label: "Clinic", category: "clinic" },
  shelter: { emoji: "🏠", label: "Safe place", category: "shelter" },
};

const CACHE_KEY = "smart-map-emergency-cache-v1";
const CACHE_TTL_MS = 10 * 60 * 1000;

interface EmergencyCacheEntry {
  key: string;
  results: NearbyPoi[];
  source: string;
  updatedAt: number;
}

function cacheKey(origin: Coordinates, radiusM: number): string {
  return `${origin.lat.toFixed(3)},${origin.lng.toFixed(3)}:${radiusM}`;
}

function readCache(origin: Coordinates, radiusM: number): EmergencyCacheEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as EmergencyCacheEntry;
    if (entry.key !== cacheKey(origin, radiusM)) return null;
    if (Date.now() - entry.updatedAt > CACHE_TTL_MS) return null;
    return entry;
  } catch {
    return null;
  }
}

function writeCache(origin: Coordinates, radiusM: number, results: NearbyPoi[], source: string): void {
  if (typeof window === "undefined") return;
  try {
    const entry: EmergencyCacheEntry = {
      key: cacheKey(origin, radiusM),
      results,
      source,
      updatedAt: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // ignore
  }
}

function catalogFallback(origin: Coordinates, radiusKm: number): NearbyPoi[] {
  return nearbyEmergencyServices(origin, "driving", 20, PLACES)
    .filter((item) => item.distanceKm <= radiusKm)
    .map((item) => ({
      id: item.place.id,
      name: item.place.name,
      category: item.place.category,
      coordinates: item.place.coordinates,
      address: item.place.address,
      phone: item.phone,
      distanceKm: item.distanceKm,
      durationMin: item.durationMin,
      openStatus: item.openStatus,
    }));
}

export type EmergencyFetchStatus = "idle" | "loading" | "success" | "empty" | "error";

export interface EmergencyFetchResult {
  results: NearbyPoi[];
  source: string;
  status: EmergencyFetchStatus;
  errorMessage: string | null;
  fromCache: boolean;
}

export interface NearbyPoiExtended extends NearbyPoi {
  openStatus?: "open" | "closed" | "unknown";
}

export class EmergencyPlacesService {
  private abortController: AbortController | null = null;

  cancel(): void {
    this.abortController?.abort();
    this.abortController = null;
  }

  async fetchNearby(
    origin: Coordinates,
    options?: { radiusM?: number; offline?: boolean; force?: boolean },
  ): Promise<EmergencyFetchResult> {
    const radiusM = options?.radiusM ?? 10_000;
    const radiusKm = radiusM / 1000;

    if (!options?.force) {
      const cached = readCache(origin, radiusM);
      if (cached) {
        return {
          results: cached.results,
          source: cached.source,
          status: cached.results.length > 0 ? "success" : "empty",
          errorMessage: null,
          fromCache: true,
        };
      }
    }

    if (options?.offline) {
      const fallback = catalogFallback(origin, radiusKm);
      return {
        results: fallback,
        source: "catalog-offline",
        status: fallback.length > 0 ? "success" : "empty",
        errorMessage: fallback.length === 0 ? "Nearby services are temporarily unavailable." : null,
        fromCache: false,
      };
    }

    this.abortController?.abort();
    const controller = new AbortController();
    this.abortController = controller;

    try {
      const data = await fetchJsonWithRetry<{
        results?: NearbyPoi[];
        source?: string;
        error?: string;
      }>(`/api/geo/nearby?lat=${origin.lat}&lng=${origin.lng}&radiusM=${radiusM}`, {
        signal: controller.signal,
        cache: "no-store",
        retries: 2,
        retryDelayMs: 800,
        timeoutMs: 20_000,
      });

      const results = data.results ?? [];
      const source = data.source ?? "api";
      writeCache(origin, radiusM, results, source);

      return {
        results,
        source,
        status: results.length > 0 ? "success" : "empty",
        errorMessage: results.length === 0 ? `No emergency services found within ${radiusKm} km.` : null,
        fromCache: false,
      };
    } catch (error) {
      if (controller.signal.aborted) {
        return { results: [], source: "", status: "idle", errorMessage: null, fromCache: false };
      }

      logSmartMapError("PLACES_API_FAILED", error);
      const fallback = catalogFallback(origin, radiusKm);
      if (fallback.length > 0) {
        writeCache(origin, radiusM, fallback, "catalog-fallback");
        return {
          results: fallback,
          source: "catalog-fallback",
          status: "success",
          errorMessage: null,
          fromCache: false,
        };
      }

      const classified = classifyFetchError(error, options?.offline);
      return {
        results: [],
        source: "",
        status: "error",
        errorMessage: classified.userMessage,
        fromCache: false,
      };
    }
  }

  getNearestByCategory(results: NearbyPoi[]): Partial<Record<EmergencyCategory, NearbyPoi>> {
    const out: Partial<Record<EmergencyCategory, NearbyPoi>> = {};
    const order: EmergencyCategory[] = ["hospital", "pharmacy", "police", "fire", "ambulance", "clinic", "shelter"];
    for (const cat of order) {
      const meta = EMERGENCY_CATEGORY_META[cat];
      const best = results
        .filter((r) => r.category === meta.category)
        .sort((a, b) => a.distanceKm - b.distanceKm)[0];
      if (best) out[cat] = best;
    }
    return out;
  }
}

export const emergencyPlacesService = new EmergencyPlacesService();

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
