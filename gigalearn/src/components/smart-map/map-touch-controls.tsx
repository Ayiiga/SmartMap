"use client";

import { useEffect } from "react";
import { Crosshair } from "lucide-react";
import type { Map as MapLibreMapType } from "maplibre-gl";
import { getRegisteredMap, subscribeMapInstance } from "@/lib/map/map-instance-registry";
import { useMapStore } from "@/stores/map-store";

export function MapTouchZoomHint() {
  const setFollowUser = useMapStore((s) => s.setFollowUser);

  useEffect(() => {
    let detach: (() => void) | undefined;

    const bind = (map: MapLibreMapType | null) => {
      detach?.();
      detach = undefined;
      if (!map) return;

      map.touchZoomRotate.enable();
      map.dragPan.enable();
      map.scrollZoom.enable();
      map.doubleClickZoom.enable();

      const releaseFollow = () => setFollowUser(false);
      map.on("dragstart", releaseFollow);
      map.on("zoomstart", releaseFollow);
      map.on("rotatestart", releaseFollow);
      map.on("pitchstart", releaseFollow);

      detach = () => {
        map.off("dragstart", releaseFollow);
        map.off("zoomstart", releaseFollow);
        map.off("rotatestart", releaseFollow);
        map.off("pitchstart", releaseFollow);
      };
    };

    bind(getRegisteredMap());
    const unsubscribe = subscribeMapInstance(bind);
    return () => {
      detach?.();
      unsubscribe();
    };
  }, [setFollowUser]);

  return (
    <div
      className="pointer-events-none absolute left-3 z-10 rounded-full bg-slate-950/70 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur"
      style={{ bottom: "calc(54vh + env(safe-area-inset-bottom))" }}
    >
      Pinch with two fingers to zoom the map
    </div>
  );
}

export function MapRecenterButton() {
  const userLocation = useMapStore((s) => s.userLocation);
  const setFollowUser = useMapStore((s) => s.setFollowUser);
  const followUser = useMapStore((s) => s.followUser);

  function recenter() {
    if (!userLocation) return;
    setFollowUser(true);
    const map = getRegisteredMap();
    if (map) {
      map.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: Math.max(map.getZoom(), 14),
        essential: true,
      });
    }
  }

  if (followUser || !userLocation) return null;

  return (
    <button
      type="button"
      onClick={recenter}
      className="pointer-events-auto absolute right-3 z-20 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/95 shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#0B1220]/95"
      style={{ bottom: "calc(54vh + env(safe-area-inset-bottom))" }}
      aria-label="Recenter map on your location"
    >
      <Crosshair className="h-5 w-5 text-[#0F5B8D]" />
    </button>
  );
}

export function MapZoomControls() {
  function zoomBy(delta: number) {
    const map = getRegisteredMap();
    if (!map) return;
    useMapStore.getState().setFollowUser(false);
    map.zoomTo(map.getZoom() + delta, { duration: 250 });
  }

  return (
    <div
      className="pointer-events-auto absolute right-3 z-20 flex flex-col gap-2"
      style={{ top: "calc(6.5rem + env(safe-area-inset-top))" }}
    >
      <button
        type="button"
        onClick={() => zoomBy(1)}
        aria-label="Zoom in"
        className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#1E293B] bg-[#141C2F]/95 text-lg font-bold text-[#60A5FA] shadow-lg backdrop-blur"
      >
        +
      </button>
      <button
        type="button"
        onClick={() => zoomBy(-1)}
        aria-label="Zoom out"
        className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#1E293B] bg-[#141C2F]/95 text-lg font-bold text-[#60A5FA] shadow-lg backdrop-blur"
      >
        −
      </button>
    </div>
  );
}
