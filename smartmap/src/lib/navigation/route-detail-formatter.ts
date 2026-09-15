import type { AdvancedRoutePlan } from "@/lib/navigation/types";
import { formatDuration } from "@/lib/navigation/route-engine";

export function routeSummaryHeadline(plan: AdvancedRoutePlan): string {
  return `${formatDuration(plan.durationMin)} (${plan.distanceKm.toFixed(0)} km)`;
}

export function routeSummaryDescription(plan: AdvancedRoutePlan): string {
  if (plan.preference === "fastest") {
    return plan.warnings.some((w) => w.kind === "heavy_traffic")
      ? "Fastest route, despite the usual traffic."
      : "Fastest route for your trip.";
  }
  if (plan.preference === "safest") return "Safest corridor with fewer reported hazards.";
  if (plan.preference === "shortest") return "Shortest distance between your points.";
  return `${plan.label} route selected.`;
}

export function routeHasTolls(plan: AdvancedRoutePlan): boolean {
  return !plan.avoided.includes("tolls") && plan.distanceKm > 40;
}

export function routeTollLabel(plan: AdvancedRoutePlan): string {
  return routeHasTolls(plan) ? "Tolls" : "No tolls";
}

export function routeEcoLabel(plan: AdvancedRoutePlan): string | null {
  if (plan.preference === "eco" || plan.preference === "lowest_fuel") {
    return "Saves fuel";
  }
  if (plan.fuelLiters != null && plan.fuelLiters < plan.distanceKm * 0.08) {
    return "Saves ~5% gas";
  }
  return null;
}
