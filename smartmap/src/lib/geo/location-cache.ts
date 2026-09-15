import type { Coordinates } from "@/types/smart-map";
import type { ResolvedAddress } from "@/lib/geo/types";

const CACHE_KEY = "smart-map-location-cache-v1";

export interface CachedLocationData {
  coordinates: Coordinates;
  address: ResolvedAddress | null;
  accuracyM: number | null;
  updatedAt: number;
}

export function readLocationCache(): CachedLocationData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as CachedLocationData;
    if (!data?.coordinates?.lat || !data?.coordinates?.lng) return null;
    return data;
  } catch {
    return null;
  }
}

export function writeLocationCache(data: CachedLocationData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

export function clearLocationCache(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}
