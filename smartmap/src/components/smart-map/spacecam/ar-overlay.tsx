"use client";

import { useMemo } from "react";
import { getAllPlanetPositions } from "@/lib/spacecam/astronomy/ephemeris";
import { BRIGHT_STARS } from "@/lib/spacecam/astronomy/catalog";
import { horizontalFromRaDec } from "@/lib/spacecam/astronomy/coordinates";
import type { ObserverContext } from "@/lib/spacecam/astronomy/types";
import type { SpaceCamLayers } from "@/lib/spacecam/spacecam-store";
import type { OrientationState } from "@/lib/spacecam/spacecam-store";

interface OverlayItem {
  id: string;
  name: string;
  x: number;
  y: number;
  type: string;
  visible: boolean;
}

function projectToScreen(
  azimuthDeg: number,
  altitudeDeg: number,
  viewAz: number,
  viewAlt: number,
  fovDeg = 60,
): { x: number; y: number; visible: boolean } {
  const azDiff = ((azimuthDeg - viewAz + 540) % 360) - 180;
  const altDiff = altitudeDeg - viewAlt;

  if (Math.abs(azDiff) > fovDeg || altDiff < -10) {
    return { x: 50, y: 50, visible: false };
  }

  const x = 50 + (azDiff / fovDeg) * 50;
  const y = 50 - (altDiff / fovDeg) * 50;
  return {
    x: Math.max(5, Math.min(95, x)),
    y: Math.max(5, Math.min(95, y)),
    visible: altitudeDeg > -5,
  };
}

export function ArOverlay({
  observer,
  layers,
  orientation,
  className,
}: {
  observer: ObserverContext;
  layers: SpaceCamLayers;
  orientation: OrientationState;
  className?: string;
}) {
  const viewAz = orientation.available ? orientation.alpha : orientation.manualAzimuth;
  const viewAlt = orientation.available ? 90 - orientation.beta : orientation.manualAltitude;

  const items = useMemo(() => {
    const overlayItems: OverlayItem[] = [];

    if (layers.stars) {
      for (const star of BRIGHT_STARS) {
        if (!star.raHours || !star.decDeg) continue;
        if ((star.magnitude ?? 5) > 2.5) continue;
        const hor = horizontalFromRaDec(star.raHours, star.decDeg, observer);
        const proj = projectToScreen(hor.azimuthDeg, hor.altitudeDeg, viewAz, viewAlt);
        overlayItems.push({
          id: star.id,
          name: star.name,
          x: proj.x,
          y: proj.y,
          type: "star",
          visible: proj.visible,
        });
      }
    }

    if (layers.planets || layers.moon) {
      const planets = getAllPlanetPositions(observer.date);
      for (const pos of planets) {
        if (pos.objectId === "moon" && !layers.moon) continue;
        if (pos.objectId !== "moon" && pos.objectId !== "sun" && !layers.planets) continue;
        const hor = horizontalFromRaDec(pos.raHours, pos.decDeg, observer);
        const proj = projectToScreen(hor.azimuthDeg, hor.altitudeDeg, viewAz, viewAlt);
        overlayItems.push({
          id: pos.objectId,
          name: pos.objectId.charAt(0).toUpperCase() + pos.objectId.slice(1),
          x: proj.x,
          y: proj.y,
          type: pos.objectId,
          visible: proj.visible,
        });
      }
    }

    return overlayItems;
  }, [observer, layers, viewAz, viewAlt]);

  return (
    <div className={className} aria-hidden>
      {items
        .filter((item) => item.visible)
        .map((item) => (
          <div
            key={item.id}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            <span className="text-lg text-amber-200 drop-shadow-lg">★</span>
            <p className="mt-0.5 whitespace-nowrap text-center text-[10px] font-bold tracking-wider text-white drop-shadow-md">
              {item.name}
            </p>
          </div>
        ))}

      {/* Compass indicator */}
      <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-slate-950/60 px-3 py-1 text-[10px] font-bold tracking-widest text-cyan-200 backdrop-blur">
        {Math.round(viewAz)}° AZ · {Math.round(viewAlt)}° ALT
      </div>

      {!orientation.calibrated && (
        <p className="pointer-events-none absolute inset-x-4 bottom-32 text-center text-xs text-amber-200/90">
          Move your phone in a slow figure-eight to improve compass calibration.
        </p>
      )}
    </div>
  );
}
