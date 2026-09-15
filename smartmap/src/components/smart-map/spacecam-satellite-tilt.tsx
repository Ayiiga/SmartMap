"use client";

import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap } from "maplibre-gl";
import type { Map as MapLibreMapType } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { SATELLITE_RASTER_STYLE } from "@/lib/map/satellite-style";
import { BEDOMASE_COORDINATES } from "@/content/smart-map/ghana-route-steps";
import { useMapStore } from "@/stores/map-store";

interface SpaceCamSatelliteTiltProps {
  className?: string;
}

export function SpaceCamSatelliteTilt({ className = "" }: SpaceCamSatelliteTiltProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMapType | null>(null);
  const [tilted, setTilted] = useState(false);
  const userLocation = useMapStore((s) => s.userLocation);
  const center = userLocation ?? BEDOMASE_COORDINATES;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: SATELLITE_RASTER_STYLE,
      center: [center.lng, center.lat],
      zoom: 14,
      pitch: 0,
      bearing: 0,
      canvasContextAttributes: { preserveDrawingBuffer: true },
      attributionControl: { compact: true },
    });

    mapRef.current = map;

    const enableTilt = () => {
      setTilted(true);
      map.easeTo({ pitch: 60, bearing: map.getBearing() + 25, duration: 900 });
    };

    const resetTilt = () => {
      setTilted(false);
      map.easeTo({ pitch: 0, bearing: 0, duration: 700 });
    };

    let pressTimer: ReturnType<typeof setTimeout> | null = null;
    const onPointerDown = () => {
      pressTimer = setTimeout(enableTilt, 650);
    };
    const onPointerUp = () => {
      if (pressTimer) clearTimeout(pressTimer);
    };

    map.getCanvas().addEventListener("pointerdown", onPointerDown);
    map.getCanvas().addEventListener("pointerup", onPointerUp);
    map.getCanvas().addEventListener("pointerleave", onPointerUp);
    map.getCanvas().addEventListener("dblclick", resetTilt);

    return () => {
      if (pressTimer) clearTimeout(pressTimer);
      map.remove();
      mapRef.current = null;
    };
  }, [center.lat, center.lng]);

  return (
    <div className={`relative h-full w-full ${className}`}>
      <div ref={containerRef} className="absolute inset-0" />
      <p className="pointer-events-none absolute inset-x-0 bottom-3 z-10 text-center text-[10px] font-semibold text-white/80">
        {tilted ? "3D tilt active · double-tap to reset" : "Long-press map for 3D satellite tilt"}
      </p>
    </div>
  );
}
