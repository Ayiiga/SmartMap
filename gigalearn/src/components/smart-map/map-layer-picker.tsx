"use client";

import { useEffect, useState } from "react";
import { Layers, X } from "lucide-react";
import { MAP_LAYERS, basemapStyleForLayers } from "@/lib/navigation/layers";
import type { MapLayerId } from "@/lib/navigation/types";
import { useMapStore } from "@/stores/map-store";
import { cn } from "@/lib/utils";
import { MapOverlaySync } from "@/components/smart-map/route-input-card";

const PICKER_LAYERS: MapLayerId[] = [
  "standard",
  "satellite",
  "terrain",
  "traffic",
  "weather",
  "night",
];

const LAYER_LABELS: Partial<Record<MapLayerId, string>> = {
  standard: "Standard map",
  satellite: "Satellite",
  terrain: "Terrain",
  traffic: "Traffic",
  weather: "Weather radar",
  night: "Night mode",
};

interface MapLayerPickerProps {
  open: boolean;
  onClose: () => void;
}

export function MapLayerPicker({ open, onClose }: MapLayerPickerProps) {
  const setMapStyle = useMapStore((s) => s.setMapStyle);
  const [active, setActive] = useState<MapLayerId[]>(["standard"]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function toggle(id: MapLayerId) {
    const def = MAP_LAYERS.find((l) => l.id === id);
    if (!def) return;
    let next: MapLayerId[];
    if (def.kind === "basemap") {
      const overlays = active.filter((x) => MAP_LAYERS.find((d) => d.id === x)?.kind === "overlay");
      next = [id, ...overlays];
    } else {
      next = active.includes(id) ? active.filter((x) => x !== id) : [...active, id];
    }
    setActive(next);
    setMapStyle(basemapStyleForLayers(next));
  }

  const overlays = active.filter((id) => MAP_LAYERS.find((l) => l.id === id)?.kind === "overlay");

  if (!open) return <MapOverlaySync overlays={overlays} />;

  return (
    <>
      <MapOverlaySync overlays={overlays} />
      <div className="pointer-events-auto absolute inset-0 z-40 flex items-end justify-center bg-black/40 p-4 sm:items-center">
        <div
          className="w-full max-w-md rounded-3xl border border-white/30 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-[#0B1220]"
          role="dialog"
          aria-label="Map layers"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#0F5B8D]" />
              <h2 className="font-display text-lg font-bold">Map layers</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
              aria-label="Close layers"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Switch between street, satellite, terrain, and live overlays
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {MAP_LAYERS.filter((l) => PICKER_LAYERS.includes(l.id)).map((layer) => {
              const isActive = active.includes(layer.id);
              const label = LAYER_LABELS[layer.id] ?? layer.label;
              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => toggle(layer.id)}
                  className={cn(
                    "flex min-h-[72px] flex-col items-start justify-center rounded-2xl border px-3 py-3 text-left transition-colors",
                    isActive
                      ? "border-[#0F5B8D] bg-[#0F5B8D]/10"
                      : "border-slate-200 dark:border-white/10",
                  )}
                >
                  <span className="text-xl">{layer.emoji}</span>
                  <span className="mt-1 text-sm font-bold">{label}</span>
                  <span className="text-[10px] text-slate-500">{layer.description}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
