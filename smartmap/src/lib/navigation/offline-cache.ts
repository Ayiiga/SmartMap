import type { AdvancedRoutePlan } from "@/lib/navigation/types";

const CACHE_PREFIX = "smart-map-route-cache-v1:";

export interface CachedRouteEntry {
  key: string;
  savedAt: string;
  plan: AdvancedRoutePlan;
}

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function routeCacheKey(plan: Pick<AdvancedRoutePlan, "from" | "to" | "mode" | "preference">): string {
  const f = `${plan.from.coordinates.lat.toFixed(4)},${plan.from.coordinates.lng.toFixed(4)}`;
  const t = `${plan.to.coordinates.lat.toFixed(4)},${plan.to.coordinates.lng.toFixed(4)}`;
  return `${plan.mode}:${plan.preference}:${f}->${t}`;
}

export function cacheRoute(plan: AdvancedRoutePlan): void {
  const store = storage();
  if (!store) return;
  const key = routeCacheKey(plan);
  const entry: CachedRouteEntry = {
    key,
    savedAt: new Date().toISOString(),
    plan,
  };
  try {
    store.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Quota / private mode — ignore; navigation still works online.
  }
}

export function readCachedRoute(key: string): CachedRouteEntry | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as CachedRouteEntry;
  } catch {
    return null;
  }
}

export function listCachedRoutes(): CachedRouteEntry[] {
  const store = storage();
  if (!store) return [];
  const out: CachedRouteEntry[] = [];
  for (let i = 0; i < store.length; i++) {
    const k = store.key(i);
    if (!k?.startsWith(CACHE_PREFIX)) continue;
    try {
      const entry = JSON.parse(store.getItem(k) ?? "") as CachedRouteEntry;
      if (entry?.plan) out.push(entry);
    } catch {
      // skip corrupt
    }
  }
  return out.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function clearRouteCache(): void {
  const store = storage();
  if (!store) return;
  const keys: string[] = [];
  for (let i = 0; i < store.length; i++) {
    const k = store.key(i);
    if (k?.startsWith(CACHE_PREFIX)) keys.push(k);
  }
  keys.forEach((k) => store.removeItem(k));
}
