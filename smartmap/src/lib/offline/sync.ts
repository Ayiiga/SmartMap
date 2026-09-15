"use client";

import { createClient } from "@/lib/supabase/client";
import {
  getPendingSyncItems,
  removeSyncItem,
  saveLocalGamification,
  db,
} from "@/lib/offline/db";
import type { GamificationState } from "@/types";

export async function syncOfflineData(userId: string): Promise<{ synced: number; failed: number }> {
  if (!navigator.onLine || !db) {
    return { synced: 0, failed: 0 };
  }

  const supabase = createClient();
  const items = await getPendingSyncItems();
  let synced = 0;
  let failed = 0;

  for (const item of items) {
    try {
      if (item.type === "progress") {
        const payload = item.payload as {
          user_id: string;
          lesson_id: string;
          level: string;
          completed: boolean;
          score: number;
          time_spent_seconds: number;
        };

        // Curriculum IDs are stored locally; cloud sync uses slug-based progress when UUID FK is unavailable
        const { error } = await supabase.from("user_progress").upsert(
          {
            user_id: payload.user_id,
            lesson_id: payload.lesson_id,
            level: payload.level,
            completed: payload.completed,
            score: payload.score,
            time_spent_seconds: payload.time_spent_seconds,
            completed_at: payload.completed ? new Date().toISOString() : null,
          },
          { onConflict: "user_id,lesson_id", ignoreDuplicates: false },
        );

        if (error) {
          // Keep item queued for retry when schema constraints differ
          failed++;
          continue;
        }

        await db.progress
          .where("lesson_id")
          .equals(payload.lesson_id)
          .modify({ synced: true });
      }

      if (item.type === "gamification") {
        const payload = item.payload as unknown as GamificationState & { user_id: string };
        const { error } = await supabase.from("gamification").upsert({
          user_id: userId,
          xp: payload.xp,
          coins: payload.coins,
          level: payload.level,
          streak: payload.streak,
          unlocked_lessons: payload.unlocked_lessons,
          completed_lessons: payload.completed_lessons ?? [],
          daily_quest_progress: payload.daily_quest_progress ?? {},
          completed_quests: payload.completed_quests ?? [],
          unlocked_worlds: payload.unlocked_worlds ?? [],
          strengths: payload.strengths ?? [],
          weaknesses: payload.weaknesses ?? [],
        });
        if (error) throw error;
      }

      await removeSyncItem(item.id);
      synced++;
    } catch {
      failed++;
    }
  }

  const { data: remoteGamification } = await supabase
    .from("gamification")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (remoteGamification) {
    await saveLocalGamification(userId, remoteGamification as GamificationState & { user_id: string });
  }

  return { synced, failed };
}

export function registerBackgroundSync(): void {
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then((registration) => {
      // @ts-expect-error Background Sync API
      return registration.sync.register("smartmap-sync");
    }).catch(() => {
      // Background sync not supported — fall back to online event
    });
  }

  window.addEventListener("online", () => {
    window.dispatchEvent(new CustomEvent("smartmap:online"));
  });
}

export async function prefetchLessonsForOffline(lessonIds: string[]): Promise<void> {
  if (!db) return;
  const supabase = createClient();
  const { data } = await supabase.from("lessons").select("*").in("id", lessonIds);
  if (data?.length) {
    const now = new Date().toISOString();
    await db.lessons.bulkPut(data.map((l) => ({ ...l, cached_at: now })));
  }
}
