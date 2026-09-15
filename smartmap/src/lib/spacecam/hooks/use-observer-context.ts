"use client";

import { useMemo } from "react";
import { useMapStore } from "@/stores/map-store";
import { useSpaceCamStore } from "@/lib/spacecam/spacecam-store";
import type { ObserverContext } from "@/lib/spacecam/astronomy/types";

export function useObserverContext(): ObserverContext {
  const userLocation = useMapStore((s) => s.userLocation);
  const simulationTime = useSpaceCamStore((s) => s.simulationTime);
  const useSimulationTime = useSpaceCamStore((s) => s.useSimulationTime);

  return useMemo(
    () => ({
      latitude: userLocation?.lat ?? 0,
      longitude: userLocation?.lng ?? 0,
      date: useSimulationTime ? simulationTime : new Date(),
    }),
    [userLocation?.lat, userLocation?.lng, simulationTime, useSimulationTime],
  );
}
