/**
 * Pre-cache OpenFreeMap vector tiles for Ashanti Region hubs (15 km radius).
 * Lightweight runtime warming — no heavy native SDKs.
 */

import { BEDOMASE_COORDINATES } from "@/content/smart-map/ghana-route-steps";

const PACK_CACHE = "smart-map-ghana-pack-v1";
const READY_KEY = "smart-map-ghana-offline-ready";
const TILE_BASE = "https://tiles.openfreemap.org";

/** Ashanti Region anchor points (15 km coverage intent). */
export const GHANA_PACK_CENTERS = [
  { name: "Bedomase", ...BEDOMASE_COORDINATES },
  { name: "Agona", lat: 6.994, lng: -1.573 },
  { name: "Ofinso", lat: 6.747, lng: -1.691 },
  { name: "Kumasi", lat: 6.688, lng: -1.624 },
] as const;

const PACK_ZOOMS = [12, 13, 14] as const;

function lonLatToTile(lon: number, lat: number, zoom: number): { x: number; y: number } {
  const n = 2 ** zoom;
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return { x, y };
}

export function ghanaPackTileUrls(): string[] {
  const urls = new Set<string>();
  for (const center of GHANA_PACK_CENTERS) {
    for (const z of PACK_ZOOMS) {
      const { x, y } = lonLatToTile(center.lng, center.lat, z);
      for (const dx of [-1, 0, 1]) {
        for (const dy of [-1, 0, 1]) {
          urls.add(`${TILE_BASE}/data/v3/${z}/${x + dx}/${y + dy}.pbf`);
        }
      }
    }
  }
  urls.add(`${TILE_BASE}/styles/liberty`);
  urls.add(`${TILE_BASE}/styles/dark`);
  return [...urls];
}

export function isGhanaPackReady(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(READY_KEY) === "true";
  } catch {
    return false;
  }
}

export function markGhanaPackReady(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(READY_KEY, "true");
  } catch {
    // ignore
  }
}

export async function warmGhanaTilePack(onProgress?: (done: number, total: number) => void): Promise<boolean> {
  if (typeof caches === "undefined") return false;
  const urls = ghanaPackTileUrls();
  const cache = await caches.open(PACK_CACHE);
  let done = 0;

  for (const url of urls) {
    try {
      const existing = await cache.match(url);
      if (!existing) {
        const res = await fetch(url, { credentials: "omit", mode: "cors" });
        if (res.ok) await cache.put(url, res);
      }
    } catch {
      // Continue warming remaining tiles on slow 3G links.
    }
    done += 1;
    onProgress?.(done, urls.length);
  }

  markGhanaPackReady();
  return true;
}
