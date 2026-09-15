"use client";

import { useState } from "react";
import { Crosshair, Layers, Minus, Plus } from "lucide-react";
import { useMapStore } from "@/stores/map-store";
import { useLiveLocation } from "@/lib/geo/use-live-location";
import { cn } from "@/lib/utils";
import { MapLayerPicker } from "@/components/smart-map/map-layer-picker";
import { getRegisteredMap } from "@/lib/map/map-instance-registry";

export function MapFloatingControls() {
  const [layersOpen, setLayersOpen] = useState(false);
  const [pitch3d, setPitch3d] = useState(false);
  const setFollowUser = useMapStore((s) => s.setFollowUser);
  const followUser = useMapStore((s) => s.followUser);
  const mapStyle = useMapStore((s) => s.mapStyle);
  const setMapStyle = useMapStore((s) => s.setMapStyle);
  const { requestLocation } = useLiveLocation(false);

  function zoom(delta: number) {
    const map = getRegisteredMap();
    if (!map) return;
    map.zoomTo(map.getZoom() + delta, { duration: 300 });
  }

  function toggle3d() {
    const map = getRegisteredMap();
    if (!map) return;
    const next = !pitch3d;
    setPitch3d(next);
    map.easeTo({ pitch: next ? 55 : 0, duration: 600 });
  }

  const btn = "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-[#0A0E23]/90 text-white shadow-lg backdrop-blur-xl hover:bg-[#12182F]";

  return (
    <>
      <div className="pointer-events-auto absolute right-2 z-30 flex flex-col gap-1.5 sm:right-4" style={{ top: "calc(5.5rem + env(safe-area-inset-top))" }}>
        <button type="button" onClick={() => zoom(1)} className={btn} aria-label="Zoom in"><Plus className="h-4 w-4" /></button>
        <button type="button" onClick={() => zoom(-1)} className={btn} aria-label="Zoom out"><Minus className="h-4 w-4" /></button>
        <button type="button" onClick={() => { void requestLocation(); setFollowUser(true); }} className={cn(btn, followUser && "border-[#3B82F6] bg-[#3B82F6]/20")} aria-label="My location"><Crosshair className="h-4 w-4" /></button>
        <button type="button" onClick={toggle3d} className={cn(btn, pitch3d && "border-[#3B82F6] bg-[#3B82F6]/20")} aria-label="3D view"><span className="text-[10px] font-black">3D</span></button>
        <button type="button" onClick={() => setLayersOpen(true)} className={cn(btn, mapStyle === "satellite" && "border-[#3B82F6] bg-[#3B82F6]/20")} aria-label="Layers"><Layers className="h-4 w-4" /></button>
        <button type="button" onClick={() => setMapStyle(mapStyle === "satellite" ? "streets" : "satellite")} className={cn(btn, "text-[9px] font-black", mapStyle === "satellite" && "text-[#60A5FA]")} aria-label="Satellite">SAT</button>
      </div>
      <MapLayerPicker open={layersOpen} onClose={() => setLayersOpen(false)} />
    </>
  );
}
