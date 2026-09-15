"use client";

import { useEffect } from "react";
import { syncOfflineData, registerBackgroundSync } from "@/lib/offline/sync";
import { cacheLessons } from "@/lib/offline/db";
import { cacheLessonForOffline } from "@/lib/offline/lesson-cache";
import { LESSONS } from "@/content/curriculum";
import { ECOSYSTEM_LESSONS } from "@/content/ecosystem-lessons";
import { useAppStore } from "@/stores/app-store";

export function OfflineInitializer({ userId }: { userId?: string }) {
  const setOnline = useAppStore((s) => s.setOnline);

  useEffect(() => {
    cacheLessons(LESSONS);
    for (const lesson of ECOSYSTEM_LESSONS) {
      cacheLessonForOffline(lesson.id, { title: lesson.title, ecosystemId: lesson.ecosystemId, steps: lesson.steps });
    }
    registerBackgroundSync();

    const handleOnline = async () => {
      setOnline(true);
      if (userId) await syncOfflineData(userId);
    };

    const handleOffline = () => setOnline(false);

    window.addEventListener("smartmap:online", handleOnline);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener("smartmap:online", handleOnline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [userId, setOnline]);

  return null;
}
