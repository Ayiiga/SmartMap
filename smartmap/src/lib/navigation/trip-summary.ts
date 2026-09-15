import type { AdvancedRoutePlan, TripSummaryData } from "@/lib/navigation/types";

export function buildTripSummary(
  plan: AdvancedRoutePlan,
  options?: { averageSpeedKmh?: number; completedAt?: string },
): TripSummaryData {
  const durationHours = Math.max(plan.durationMin / 60, 1 / 60);
  const averageSpeedKmh =
    options?.averageSpeedKmh ?? Number((plan.distanceKm / durationHours).toFixed(1));

  return {
    routeId: plan.id,
    mode: plan.mode,
    totalDistanceKm: plan.distanceKm,
    totalDurationMin: plan.durationMin,
    averageSpeedKmh,
    fuelLiters: plan.fuelLiters,
    stops: plan.stops,
    warnings: plan.warnings,
    polyline: plan.polyline,
    completedAt: options?.completedAt ?? new Date().toISOString(),
  };
}

const SUMMARY_KEY = "smart-map-last-trip-summary";

export function persistTripSummary(summary: TripSummaryData): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SUMMARY_KEY, JSON.stringify(summary));
  } catch {
    // ignore
  }
}

export function loadTripSummary(): TripSummaryData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SUMMARY_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TripSummaryData;
  } catch {
    return null;
  }
}
