import type { Map as MapLibreMapType } from "maplibre-gl";

type MapListener = (map: MapLibreMapType | null) => void;

let registeredMap: MapLibreMapType | null = null;
const listeners = new Set<MapListener>();

export function registerMapInstance(map: MapLibreMapType | null): void {
  registeredMap = map;
  listeners.forEach((listener) => listener(map));
}

export function getRegisteredMap(): MapLibreMapType | null {
  return registeredMap;
}

export function subscribeMapInstance(listener: MapListener): () => void {
  listeners.add(listener);
  if (registeredMap) listener(registeredMap);
  return () => listeners.delete(listener);
}
