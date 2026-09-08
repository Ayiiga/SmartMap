"use client";

import { useEffect } from "react";
import type { Map as MapLibreMapType } from "maplibre-gl";
import type { AdvancedRoutePlan } from "@/lib/navigation/types";
import type { Coordinates } from "@/types/smart-map";
import { getRegisteredMap, subscribeMapInstance } from "@/lib/map/map-instance-registry";
import { clearRoutesFromMap, renderRoutesOnMap } from "@/lib/map/route-map-layer";

interface RouteMapOverlayProps {
  routes: AdvancedRoutePlan[];
  activeRouteId: string | null;
  origin?: Coordinates | null;
  destination?: Coordinates | null;
}

export function RouteMapOverlay({
  routes,
  activeRouteId,
  origin,
  destination,
}: RouteMapOverlayProps) {
  useEffect(() => {
    let cancelled = false;
    let detachMapListeners: (() => void) | undefined;

    const draw = (map: MapLibreMapType) => {
      if (cancelled) return;
      if (routes.length === 0 || !origin || !destination) {
        clearRoutesFromMap(map);
        return;
      }
      renderRoutesOnMap(map, routes, activeRouteId, { origin, destination });
    };

    const bindMap = (map: MapLibreMapType | null) => {
      detachMapListeners?.();
      detachMapListeners = undefined;
      if (!map || cancelled) return;

      const onStyle = () => draw(map);
      const onResize = () => draw(map);
      map.on("styledata", onStyle);
      map.on("idle", onStyle);
      map.on("resize", onResize);
      detachMapListeners = () => {
        map.off("styledata", onStyle);
        map.off("idle", onStyle);
        map.off("resize", onResize);
      };

      draw(map);
      map.once("idle", () => draw(map));
    };

    bindMap(getRegisteredMap());
    const unsubscribe = subscribeMapInstance(bindMap);

    return () => {
      cancelled = true;
      detachMapListeners?.();
      unsubscribe();
      const map = getRegisteredMap();
      if (map) clearRoutesFromMap(map);
    };
  }, [routes, activeRouteId, origin, destination]);

  return null;
}
