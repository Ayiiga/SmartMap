"use client";

import { MAP_LAYERS, basemapStyleForLayers } from "@/lib/navigation/layers";
import type { MapLayerId } from "@/lib/navigation/types";
import { useMapStore } from "@/stores/map-store";
import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";
import { MapOverlaySync } from "@/components/smart-map/route-input-card";

const HOME_LAYERS: MapLayerId[] = [
  "standard",
  "satellite",
  "terrain",
  "traffic",
  "weather",
  "night",
];

const LAYER_LABELS: Partial<Record<MapLayerId, string>> = {
  standard: "Standard",
  satellite: "Satellite",
  terrain: "Terrain",
  traffic: "Traffic",
  weather: "Weather",
  night: "Safety",
};

export function LiveLayerToggles() {
  const setMapStyle = useMapStore((s) => s.setMapStyle);
  const [active, setActive] = useState<MapLayerId[]>(["standard"]);
  const [pending, startTransition] = useTransition();

  function toggle(id: MapLayerId) {
    const def = MAP_LAYERS.find((l) => l.id === id);
    if (!def) return;
    startTransition(() => {
      let next: MapLayerId[];
      if (def.kind === "basemap") {
        const overlays = active.filter((x) => MAP_LAYERS.find((d) => d.id === x)?.kind === "overlay");
        next = [id, ...overlays];
      } else {
        next = active.includes(id) ? active.filter((x) => x !== id) : [...active, id];
      }
      setActive(next);
      setMapStyle(basemapStyleForLayers(next));
    });
  }

  return (
    <>
      <MapOverlaySync
        overlays={active.filter((id) => MAP_LAYERS.find((l) => l.id === id)?.kind === "overlay")}
      />
      <div className="rounded-2xl border border-white/30 bg-white/95 p-3 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-[#0B1220]/95">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#0F5B8D]">Live map layers</p>
      <div
        className="mt-2 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none"
        style={{ WebkitOverflowScrolling: "touch" }}
        role="tablist"
        aria-label="Map layers"
      >
        {MAP_LAYERS.filter((l) => HOME_LAYERS.includes(l.id)).map((layer) => {
          const isActive = active.includes(layer.id);
          const label = LAYER_LABELS[layer.id] ?? layer.label;
          return (
            <button
              key={layer.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => toggle(layer.id)}
              className={cn(
                "shrink-0 rounded-2xl px-3 py-2.5 text-xs font-bold min-h-[44px] transition-colors",
                isActive
                  ? "bg-[#0F5B8D] text-white shadow-md"
                  : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white",
              )}
            >
              {layer.emoji} {label}
            </button>
          );
        })}
      </div>
      {pending && <p className="mt-1 text-[11px] text-slate-500">Updating…</p>}
      </div>
    </>
  );
}
