import { haversineKm } from "@/content/smart-map/places";
import type { NavEndpoint } from "@/lib/geo/types";

/** Treat endpoints within ~150 m as the same place (e.g. Current Location = Bedomase). */
const SAME_LOCATION_THRESHOLD_KM = 0.15;

export function isSameLocation(
  origin: NavEndpoint | null,
  dest: NavEndpoint | null,
): boolean {
  if (!origin || !dest) return false;
  if (origin.id === dest.id) return true;
  if (
    origin.placeId &&
    dest.placeId &&
    origin.placeId === dest.placeId
  ) {
    return true;
  }
  const dist = haversineKm(origin.coordinates, dest.coordinates);
  return dist < SAME_LOCATION_THRESHOLD_KM;
}
