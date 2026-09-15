import { PLACES, haversineKm } from "@/content/smart-map/places";
import type { Coordinates, Place, PlaceCategory } from "@/types/smart-map";
import type { AdvancedTravelMode, EmergencyNavItem } from "@/lib/navigation/types";
import { MODE_SPEED_KMH } from "@/lib/navigation/route-engine";

export const EMERGENCY_NAV_CATEGORIES: PlaceCategory[] = [
  "police",
  "fire",
  "ambulance",
  "hospital",
  "pharmacy",
  "fuel",
  "clinic",
  "shelter",
  "disaster_center",
];

export function isOpenNow(hours?: string, now = new Date()): "open" | "closed" | "unknown" {
  if (!hours) return "unknown";
  const normalized = hours.toLowerCase();
  if (normalized.includes("24")) return "open";
  // Simple demo parser: "6am – 6pm" / "5am – 10pm"
  const match = normalized.match(/(\d{1,2})\s*(am|pm).*?(\d{1,2})\s*(am|pm)/);
  if (!match) return "unknown";
  const to24 = (h: number, ap: string) => {
    let hour = h % 12;
    if (ap === "pm") hour += 12;
    return hour;
  };
  const openH = to24(Number(match[1]), match[2]);
  const closeH = to24(Number(match[3]), match[4]);
  const current = now.getHours() + now.getMinutes() / 60;
  if (closeH > openH) {
    return current >= openH && current < closeH ? "open" : "closed";
  }
  // Overnight window
  return current >= openH || current < closeH ? "open" : "closed";
}

export function nearbyEmergencyServices(
  origin: Coordinates,
  mode: AdvancedTravelMode = "driving",
  limit = 12,
  catalog: Place[] = PLACES,
): EmergencyNavItem[] {
  const speed = MODE_SPEED_KMH[mode];
  return catalog
    .filter((p) => EMERGENCY_NAV_CATEGORIES.includes(p.category))
    .map((place) => {
      const distanceKm = Number(haversineKm(origin, place.coordinates).toFixed(2));
      const durationMin = Math.max(2, Math.round((distanceKm / speed) * 60));
      return {
        place,
        distanceKm,
        durationMin,
        openStatus: isOpenNow(place.hours),
        phone: place.phone,
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

export function telHref(phone?: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}
