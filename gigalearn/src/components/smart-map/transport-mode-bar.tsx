"use client";

import { Bike, Bus, Car, Footprints } from "lucide-react";
import type { TravelMode } from "@/types/smart-map";
import { useMapStore } from "@/stores/map-store";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/navigation/route-engine";
import type { AdvancedRoutePlan } from "@/lib/navigation/types";

const MODES: {
  id: TravelMode;
  label: string;
  icon: typeof Car;
}[] = [
  { id: "driving", label: "Driving", icon: Car },
  { id: "walking", label: "Walking", icon: Footprints },
  { id: "cycling", label: "Cycling", icon: Bike },
  { id: "transit", label: "Public Transport", icon: Bus },
];

interface TransportModeBarProps {
  multiModeEta?: Record<TravelMode, AdvancedRoutePlan> | null;
  className?: string;
}

export function TransportModeBar({ multiModeEta, className }: TransportModeBarProps) {
  const travelMode = useMapStore((s) => s.travelMode);
  const setTravelMode = useMapStore((s) => s.setTravelMode);

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-1 rounded-full border border-white/12 bg-[#0A0E23]/92 p-1.5 shadow-2xl backdrop-blur-xl",
        className,
      )}
      role="tablist"
      aria-label="Travel mode"
    >
      {MODES.map(({ id, label, icon: Icon }) => {
        const active = travelMode === id;
        const eta = multiModeEta?.[id];
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setTravelMode(id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition-all sm:px-4 sm:py-2.5 sm:text-sm",
              active
                ? "bg-[#3B82F6] text-white shadow-md"
                : "text-slate-400 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
            {eta && (
              <span className={cn("text-[10px]", active ? "text-white/80" : "text-slate-500")}>
                {formatDuration(eta.durationMin)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
