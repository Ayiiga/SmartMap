import type { AdvancedRoutePlan } from "@/lib/navigation/types";
import type { TravelMode } from "@/types/smart-map";

/** ETA for a transport pill — matches the active route headline for the selected mode. */
export function modeEtaMinutes(
  mode: TravelMode,
  travelMode: TravelMode,
  active: AdvancedRoutePlan | null,
  multiModeEta: Record<TravelMode, AdvancedRoutePlan> | null,
): number | null {
  if (travelMode === mode && active) return active.durationMin;
  return multiModeEta?.[mode]?.durationMin ?? null;
}
