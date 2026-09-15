"use client";

import { Crosshair, Layers, X } from "lucide-react";
import { useMapStore } from "@/stores/map-store";
import { useLiveLocation } from "@/lib/geo/use-live-location";
import { getRegisteredMap } from "@/lib/map/map-instance-registry";
import { cn } from "@/lib/utils";

interface MapLayersSheetProps {
  open: boolean;
  onClose: () => void;
}

const STYLES = [
  { id: "satellite" as const, label: "Satellite" },
  { id: "streets" as const, label: "Standard" },
  { id: "terrain" as const, label: "Terrain" },
];

export function MapLayersSheet({ open, onClose }: MapLayersSheetProps) {
  const mapStyle = useMapStore((s) => s.mapStyle);
  const setMapStyle = useMapStore((s) => s.setMapStyle);
  const setFollowUser = useMapStore((s) => s.setFollowUser);
  const { requestLocation } = useLiveLocation(false);

  if (!open) return null;

  function toggle3d() {
    const map = getRegisteredMap();
    if (!map) return;
    const pitch = map.getPitch();
    map.easeTo({ pitch: pitch > 10 ? 0 : 55, duration: 500 });
  }

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-3xl border border-[#1E293B] bg-[#0F172A]/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Map layers"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-bold text-[#F8FAFC]">
            <Layers className="h-4 w-4 text-[#60A5FA]" aria-hidden />
            Map layers
          </p>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-[#94A3B8] hover:bg-[#1E293B]" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {STYLES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMapStyle(id)}
              className={cn(
                "min-h-[44px] rounded-xl text-sm font-bold",
                mapStyle === id
                  ? "bg-gradient-to-r from-[#3B82F6] to-[#1E5EB8] text-[#F8FAFC]"
                  : "border border-[#2A3A5C] text-[#94A3B8]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={toggle3d}
            className="min-h-[44px] rounded-xl border border-[#2A3A5C] text-sm font-bold text-[#F8FAFC]"
          >
            3D view
          </button>
          <button
            type="button"
            onClick={() => {
              void requestLocation();
              setFollowUser(true);
              onClose();
            }}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#2A3A5C] text-sm font-bold text-[#F8FAFC]"
          >
            <Crosshair className="h-4 w-4" aria-hidden />
            My location
          </button>
        </div>
      </div>
    </div>
  );
}
