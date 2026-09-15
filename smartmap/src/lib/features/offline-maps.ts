/**
 * Phase 3 offline maps helpers (feature-flag gated in UI).
 * Uses Cache API when available; never stores secrets.
 */

const OFFLINE_CACHE = "smart-map-tiles-v1";

export async function cacheMapStyle(styleUrl: string): Promise<boolean> {
  if (typeof caches === "undefined") return false;
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const response = await fetch(styleUrl, { credentials: "omit" });
    if (!response.ok) return false;
    await cache.put(styleUrl, response.clone());
    return true;
  } catch {
    return false;
  }
}

export async function hasOfflineStyle(styleUrl: string): Promise<boolean> {
  if (typeof caches === "undefined") return false;
  const cache = await caches.open(OFFLINE_CACHE);
  return Boolean(await cache.match(styleUrl));
}

export async function clearOfflineMaps(): Promise<void> {
  if (typeof caches === "undefined") return;
  await caches.delete(OFFLINE_CACHE);
}
