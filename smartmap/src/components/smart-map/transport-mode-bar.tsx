"use client";

import { Bike, Bus, Car, Footprints } from "lucide-react";
import type { TravelMode } from "@/types/smart-map";
import { useMapStore } from "@/stores/map-store";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/navigation/route-engine";
import type { AdvancedRoutePlan } from "@/lib/navigation/types";
import { modeEtaMinutes } from "@/lib/navigation/mode-eta";
import { hapticTap } from "@/lib/haptics";

const MODES: {
  id: TravelMode;
  label: string;
  icon: typeof Car;
}[] = [
  { id: "driving", label: "Car", icon: Car },
  { id: "transit", label: "Bus", icon: Bus },
  { id: "motorcycle", label: "Moto", icon: Bike },
  { id: "cycling", label: "Cycle", icon: Bike },
  { id: "walking", label: "Walk", icon: Footprints },
];

interface TransportModeBarProps {
  multiModeEta?: Record<TravelMode, AdvancedRoutePlan> | null;
  activeRoute?: AdvancedRoutePlan | null;
  className?: string;
}

export function TransportModeBar({ multiModeEta, activeRoute, className }: TransportModeBarProps) {
  const travelMode = useMapStore((s) => s.travelMode);
  const setTravelMode = useMapStore((s) => s.setTravelMode);

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-1 rounded-full border border-[#1E293B] bg-[#141C2F]/95 p-1.5 shadow-2xl backdrop-blur-xl",
        className,
      )}
      role="tablist"
      aria-label="Travel mode"
    >
      {MODES.map(({ id, label, icon: Icon }) => {
        const active = travelMode === id;
        const etaMin = modeEtaMinutes(id, travelMode, activeRoute ?? null, multiModeEta ?? null);
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`${label}${etaMin != null ? `, ${formatDuration(etaMin)}` : ""}`}
            onClick={() => {
              hapticTap();
              setTravelMode(id);
            }}
            className={cn(
              "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-full px-2 py-1.5 text-[10px] font-bold transition-all sm:flex-row sm:gap-1.5 sm:px-3 sm:text-xs",
              active
                ? "bg-gradient-to-r from-[#3B82F6] to-[#1E5EB8] text-white shadow-md"
                : "text-[#94A3B8] hover:bg-[#1E293B] hover:text-white",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {etaMin != null ? (
              <span className={cn(active ? "text-white/90" : "text-[#94A3B8]")}>
                {formatDuration(etaMin)}
              </span>
            ) : (
              <span className="hidden sm:inline">{label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
