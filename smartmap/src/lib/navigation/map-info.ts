import type { MapInfoOverlay } from "@/lib/navigation/types";
import { GHANA_MAP_INFO } from "@/content/smart-map/map-info";

export function getMapInformation(input?: {
  timeToDestinationMin?: number | null;
  currentSpeedKmh?: number | null;
  elevationM?: number;
}): MapInfoOverlay {
  return {
    roadNames: [...GHANA_MAP_INFO.roadNames],
    communities: [...GHANA_MAP_INFO.communities],
    rivers: [...GHANA_MAP_INFO.rivers],
    lakes: [...GHANA_MAP_INFO.lakes],
    forestReserves: [...GHANA_MAP_INFO.forestReserves],
    nationalParks: [...GHANA_MAP_INFO.nationalParks],
    districts: [...GHANA_MAP_INFO.districts],
    regions: [...GHANA_MAP_INFO.regions],
    elevationM: input?.elevationM ?? GHANA_MAP_INFO.defaultElevationM,
    weatherLabel: GHANA_MAP_INFO.weatherLabel,
    timeToDestinationMin: input?.timeToDestinationMin ?? null,
    currentSpeedKmh: input?.currentSpeedKmh ?? null,
  };
}
