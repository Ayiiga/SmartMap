"use client";

import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/map-store";

export function NavigateSatelliteToggle() {
  const mapStyle = useMapStore((s) => s.mapStyle);
  const setMapStyle = useMapStore((s) => s.setMapStyle);
  const satellite = mapStyle === "satellite";

  return (
    <button
      type="button"
      onClick={() => setMapStyle(satellite ? "streets" : "satellite")}
      className={cn(
        "pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl border shadow-lg backdrop-blur-xl transition-colors",
        satellite
          ? "border-[#1A73E8] bg-[#1A73E8] text-white"
          : "border-white/30 bg-white/95 text-[#0F5B8D] dark:border-white/10 dark:bg-[#0B1220]/95",
      )}
      aria-pressed={satellite}
      aria-label={satellite ? "Switch to map view" : "Switch to satellite view"}
      title={satellite ? "Map view" : "Satellite view"}
    >
      <Layers className="h-5 w-5" />
    </button>
  );
}
