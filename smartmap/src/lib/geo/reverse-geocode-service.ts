import type { Coordinates } from "@/types/smart-map";
import type { ResolvedAddress } from "@/lib/geo/types";
import { fetchJsonWithRetry } from "@/lib/network/fetch-with-retry";
import { SmartMapError, classifyFetchError, logSmartMapError } from "@/lib/errors/smart-map-errors";
import { readLocationCache, writeLocationCache } from "@/lib/geo/location-cache";

export type AddressResolveStatus = "idle" | "resolving" | "resolved" | "failed" | "unavailable";

export function coordinateLabel(coords: Coordinates): string {
  return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
}

export async function reverseGeocode(
  coords: Coordinates,
  options?: { signal?: AbortSignal; offline?: boolean; accuracyM?: number | null },
): Promise<{ address: ResolvedAddress | null; status: AddressResolveStatus; error?: SmartMapError }> {
  if (options?.offline) {
    const cached = readLocationCache();
    if (cached?.address) {
      return { address: cached.address, status: "resolved" };
    }
    return {
      address: null,
      status: "unavailable",
      error: new SmartMapError("NETWORK_OFFLINE", "You're offline. Showing your last available map and location data."),
    };
  }

  try {
    const data = await fetchJsonWithRetry<{ address?: ResolvedAddress | null; error?: string }>(
      `/api/geo/reverse?lat=${coords.lat}&lng=${coords.lng}`,
      {
        cache: "no-store",
        signal: options?.signal,
        retries: 2,
        retryDelayMs: 600,
        timeoutMs: 12_000,
      },
    );

    if (data.address) {
      writeLocationCache({
        coordinates: coords,
        address: data.address,
        accuracyM: options?.accuracyM ?? null,
        updatedAt: Date.now(),
      });
      return { address: data.address, status: "resolved" };
    }

    logSmartMapError("REVERSE_GEOCODE_FAILED", data.error);
    return {
      address: null,
      status: "failed",
      error: new SmartMapError("REVERSE_GEOCODE_FAILED", "Address unavailable — tap to retry"),
    };
  } catch (error) {
    const cached = readLocationCache();
    if (cached?.address) {
      return { address: cached.address, status: "resolved" };
    }
    const classified = classifyFetchError(error, options?.offline);
    logSmartMapError(classified.code, error);
    return { address: null, status: "failed", error: classified };
  }
}
