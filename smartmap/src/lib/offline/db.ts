import Dexie, { type EntityTable } from "dexie";
import type { GamificationState, Lesson, OfflineQueueItem, UserProgress } from "@/types";

export interface CachedLesson extends Lesson {
  cached_at: string;
}

export interface LocalProgress extends UserProgress {
  local_id?: string;
}

class SmartMapDB extends Dexie {
  lessons!: EntityTable<CachedLesson, "id">;
  progress!: EntityTable<LocalProgress, "id">;
  gamification!: EntityTable<GamificationState & { user_id: string }, "user_id">;
  syncQueue!: EntityTable<OfflineQueueItem, "id">;
  stories!: EntityTable<{ id: string; title: string; content: string; cached_at: string }, "id">;
  audio!: EntityTable<{ id: string; url: string; blob: Blob; cached_at: string }, "id">;

  constructor() {
    super("SmartMapDB");
    this.version(1).stores({
      lessons: "id, level, slug, cached_at",
      progress: "id, user_id, lesson_id, synced",
      gamification: "user_id",
      syncQueue: "id, type, created_at",
      stories: "id, cached_at",
      audio: "id, cached_at",
    });
  }
}

export const db = typeof window !== "undefined" ? new SmartMapDB() : (null as unknown as SmartMapDB);

export async function cacheLessons(lessons: Lesson[]): Promise<void> {
  if (!db) return;
  const now = new Date().toISOString();
  await db.lessons.bulkPut(
    lessons.map((l) => ({ ...l, cached_at: now })),
  );
}

export async function getCachedLessonsByLevel(level: string): Promise<CachedLesson[]> {
  if (!db) return [];
  return db.lessons.where("level").equals(level).toArray();
}

export async function saveLocalProgress(progress: LocalProgress): Promise<void> {
  if (!db) return;
  await db.progress.put({ ...progress, synced: false });
  await db.syncQueue.add({
    id: crypto.randomUUID(),
    type: "progress",
    payload: progress as unknown as Record<string, unknown>,
    created_at: new Date().toISOString(),
    retry_count: 0,
  });
}

export async function getLocalGamification(userId: string): Promise<(GamificationState & { user_id: string }) | undefined> {
  if (!db) return undefined;
  return db.gamification.get(userId);
}

export async function saveLocalGamification(
  userId: string,
  state: GamificationState,
): Promise<void> {
  if (!db) return;
  await db.gamification.put({ ...state, user_id: userId });
}

export async function getPendingSyncItems(): Promise<OfflineQueueItem[]> {
  if (!db) return [];
  return db.syncQueue.orderBy("created_at").toArray();
}

export async function removeSyncItem(id: string): Promise<void> {
  if (!db) return;
  await db.syncQueue.delete(id);
}

export async function cacheStory(story: { id: string; title: string; content: string }): Promise<void> {
  if (!db) return;
  await db.stories.put({ ...story, cached_at: new Date().toISOString() });
}

export async function getCachedStories(): Promise<{ id: string; title: string; content: string }[]> {
  if (!db) return [];
  return db.stories.toArray();
}
