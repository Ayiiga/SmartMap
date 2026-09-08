"use client";

import { useEffect, useState } from "react";
import type { AdvancedRoutePlan } from "@/lib/navigation/types";
import type { RouteWaypoint } from "@/lib/navigation/types";
import type { AdvancedTravelMode } from "@/lib/navigation/types";
import { planAdvancedRoutes } from "@/lib/navigation/route-engine";

export interface RoutePlannerInput {
  from: RouteWaypoint;
  to: RouteWaypoint;
  mode: AdvancedTravelMode;
}

export type RouteSource = "osrm" | "synthetic" | null;

export function useRoutePlanner(input: RoutePlannerInput | null) {
  const [routes, setRoutes] = useState<AdvancedRoutePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<RouteSource>(null);

  useEffect(() => {
    if (!input?.from?.coordinates || !input?.to?.coordinates) {
      setRoutes([]);
      setSource(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams({
      from: `${input.from.coordinates.lat},${input.from.coordinates.lng}`,
      to: `${input.to.coordinates.lat},${input.to.coordinates.lng}`,
      fromLabel: input.from.label,
      toLabel: input.to.label,
      mode: input.mode,
      alternatives: "true",
    });

    fetch(`/api/routing/directions?${params}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data.routes) && data.routes.length > 0) {
          setRoutes(data.routes);
          setSource(data.source === "osrm" ? "osrm" : "synthetic");
        } else {
          setRoutes(
            planAdvancedRoutes({
              from: input.from,
              to: input.to,
              mode: input.mode,
              preferences: ["fastest", "shortest", "safest"],
            }),
          );
          setSource("synthetic");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setRoutes(
          planAdvancedRoutes({
            from: input.from,
            to: input.to,
            mode: input.mode,
            preferences: ["fastest", "shortest", "safest"],
          }),
        );
        setSource("synthetic");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    input?.from?.id,
    input?.from?.coordinates.lat,
    input?.from?.coordinates.lng,
    input?.from?.label,
    input?.to?.id,
    input?.to?.coordinates.lat,
    input?.to?.coordinates.lng,
    input?.to?.label,
    input?.mode,
  ]);

  return { routes, loading, source };
}
