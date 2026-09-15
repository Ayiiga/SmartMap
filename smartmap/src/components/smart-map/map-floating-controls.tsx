"use client";

import { useState } from "react";
import { Layers, Minus, Plus } from "lucide-react";
import { getRegisteredMap } from "@/lib/map/map-instance-registry";
import { useMapStore } from "@/stores/map-store";
import { MapLayersSheet } from "@/components/smart-map/map-layers-sheet";

const btnGroup =
  "inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center border border-[#1E293B] bg-[#141C2F]/90 text-[#F8FAFC] shadow-lg backdrop-blur-md hover:bg-[#1A253C]/90";

export function MapFloatingControls() {
  const [layersOpen, setLayersOpen] = useState(false);

  function zoom(delta: number) {
    const map = getRegisteredMap();
    if (!map) return;
    useMapStore?.getState?.()?.setFollowUser(false);
    map.zoomTo(map.getZoom() + delta, { duration: 250 });
  }

  return (
    <>
      <div
        className="pointer-events-auto absolute right-4 z-30 flex flex-col gap-3"
        style={{ top: "calc(5rem + env(safe-area-inset-top))" }}
      >
        <div className="flex flex-col overflow-hidden rounded-2xl border border-[#1E293B] shadow-lg">
          <button type="button" onClick={() => zoom(1)} className={`${btnGroup} rounded-t-2xl border-b`} aria-label="Zoom in">
            <Plus className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => zoom(-1)} className={`${btnGroup} rounded-b-2xl`} aria-label="Zoom out">
            <Minus className="h-5 w-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setLayersOpen(true)}
          className={`${btnGroup} rounded-2xl`}
          aria-label="Map layers and satellite"
        >
          <Layers className="h-5 w-5" />
        </button>
      </div>
      <MapLayersSheet open={layersOpen} onClose={() => setLayersOpen(false)} />
    </>
  );
}
