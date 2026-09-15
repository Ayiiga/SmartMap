"use client";

import { db } from "@/lib/offline/db";

const CACHE_PREFIX = "smartmap-lesson-cache:";

export async function cacheLessonForOffline(lessonId: string, payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${CACHE_PREFIX}${lessonId}`, JSON.stringify({
      ...payload,
      cached_at: new Date().toISOString(),
    }));
    if (db) {
      await db.syncQueue.add({
        id: `cache-${lessonId}`,
        type: "activity",
        payload: { lessonId, action: "cached" },
        created_at: new Date().toISOString(),
        retry_count: 0,
      });
    }
  } catch {
    // Storage quota or private mode — fail silently
  }
}

export function getCachedLesson(lessonId: string): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${lessonId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function listCachedLessonIds(): string[] {
  if (typeof window === "undefined") return [];
  const ids: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      ids.push(key.replace(CACHE_PREFIX, ""));
    }
  }
  return ids;
}

export async function registerBackgroundSync() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    if ("sync" in registration) {
      await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register("smartmap-sync");
    }
  } catch {
    // Background sync not supported
  }
}
