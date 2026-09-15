import type { Coordinates } from "@/types/smart-map";
import type { LocationFix, LocationPermission } from "@/lib/geo/types";

export function readGeolocationPermission(): Promise<LocationPermission> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return Promise.resolve("unavailable");
  if (!navigator.permissions?.query) return Promise.resolve("prompt");
  return navigator.permissions
    .query({ name: "geolocation" as PermissionName })
    .then((status) => {
      if (status.state === "granted") return "granted" as const;
      if (status.state === "denied") return "denied" as const;
      return "prompt" as const;
    })
    .catch(() => "prompt" as const);
}

export function fixFromPosition(pos: GeolocationPosition): LocationFix {
  return {
    coordinates: {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    },
    accuracyM: Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : null,
    altitudeM: pos.coords.altitude,
    speedMps: pos.coords.speed,
    heading: pos.coords.heading,
    timestamp: pos.timestamp || Date.now(),
  };
}

export function getCurrentFix(options?: PositionOptions): Promise<LocationFix> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation unavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(fixFromPosition(pos)),
      (err) => reject(err),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
        ...options,
      },
    );
  });
}

export function watchLocation(
  onFix: (fix: LocationFix) => void,
  onError: (error: GeolocationPositionError | Error) => void,
  options?: PositionOptions,
): () => void {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    onError(new Error("Geolocation unavailable"));
    return () => undefined;
  }
  const id = navigator.geolocation.watchPosition(
    (pos) => onFix(fixFromPosition(pos)),
    (err) => onError(err),
    {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 2000,
      ...options,
    },
  );
  return () => navigator.geolocation.clearWatch(id);
}

export function formatAccuracy(accuracyM: number | null | undefined): string {
  if (accuracyM == null || !Number.isFinite(accuracyM)) return "Unknown";
  if (accuracyM < 1000) return `±${Math.round(accuracyM)} m`;
  return `±${(accuracyM / 1000).toFixed(1)} km`;
}

export function isValidCoordinates(coords: Coordinates | null | undefined): coords is Coordinates {
  if (!coords) return false;
  return (
    Number.isFinite(coords.lat) &&
    Number.isFinite(coords.lng) &&
    Math.abs(coords.lat) <= 90 &&
    Math.abs(coords.lng) <= 180
  );
}
