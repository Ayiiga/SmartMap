"use client";

import { useEffect, useRef } from "react";
import { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { BEDOMASE_COORDINATES } from "@/content/smart-map/ghana-route-steps";
import { SATELLITE_HYBRID_STYLE } from "@/lib/map/satellite-style";
import { useMapStore } from "@/stores/map-store";

export function MapMinimapInset() {
  const containerRef = useRef<HTMLDivElement>(null);
  const userLocation = useMapStore((s) => s.userLocation);
  const center = userLocation ?? BEDOMASE_COORDINATES;

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new MapLibreMap({
      container: containerRef.current,
      style: SATELLITE_HYBRID_STYLE,
      center: [center.lng, center.lat],
      zoom: 8,
      interactive: false,
      attributionControl: false,
    });
    return () => map.remove();
  }, [center.lat, center.lng]);

  return (
    <div
      className="pointer-events-none absolute bottom-[calc(5rem+env(safe-area-inset-bottom))] left-3 z-20 hidden overflow-hidden rounded-xl border-2 border-white/20 shadow-xl sm:block lg:left-[360px]"
      aria-hidden
    >
      <div ref={containerRef} className="h-[72px] w-[96px] sm:h-[88px] sm:w-[112px]" />
      <p className="absolute inset-x-0 bottom-0 bg-[#0A0E23]/80 px-1.5 py-0.5 text-center text-[8px] font-bold text-white">
        Ashanti Region
      </p>
    </div>
  );
}
