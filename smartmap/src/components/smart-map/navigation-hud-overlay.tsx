"use client";

import { useEffect, useState } from "react";
import { Compass, Gauge } from "lucide-react";
import { useMapStore } from "@/stores/map-store";

interface NavigationHudOverlayProps {
  active?: boolean;
}

export function NavigationHudOverlay({ active = false }: NavigationHudOverlayProps) {
  const speedMps = useMapStore((s) => s.locationMeta.speedMps);
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    if (!active) return;

    const onOrientation = (event: DeviceOrientationEvent) => {
      if (typeof event.alpha === "number" && !Number.isNaN(event.alpha)) {
        setHeading(Math.round(event.alpha));
      }
    };

    window.addEventListener("deviceorientation", onOrientation);
    return () => window.removeEventListener("deviceorientation", onOrientation);
  }, [active]);

  if (!active) return null;

  const speedKmh =
    speedMps != null && Number.isFinite(speedMps) ? Math.max(0, Math.round(speedMps * 3.6)) : 0;

  return (
    <div className="pointer-events-none absolute left-3 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2">
      <div className="rounded-2xl border border-white/30 bg-slate-950/75 px-3 py-2 text-white shadow-lg backdrop-blur">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-cyan-300" style={{ transform: `rotate(${heading}deg)` }} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Compass</p>
            <p className="text-sm font-bold">{heading}°</p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-white/30 bg-slate-950/75 px-3 py-2 text-white shadow-lg backdrop-blur">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-emerald-300" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Speed</p>
            <p className="text-sm font-bold">{speedKmh} km/h</p>
          </div>
        </div>
      </div>
    </div>
  );
}
