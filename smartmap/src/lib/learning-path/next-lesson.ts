import { LESSONS } from "@/content/curriculum";
import { ECOSYSTEM_LESSONS, type EcosystemId } from "@/content/ecosystem-lessons";
import { buildPersonalizedLearningPath } from "@/lib/learning-path/recommendations";
import type { GamificationState, LearningLevel } from "@/types";

export interface NextLessonTarget {
  href: string;
  title: string;
  kind: "curriculum" | "ecosystem";
}

export function getNextCurriculumLesson(
  currentLessonId: string,
  level: LearningLevel,
): NextLessonTarget | null {
  const levelLessons = LESSONS.filter((l) => l.level === level).sort(
    (a, b) => a.order_index - b.order_index,
  );
  const index = levelLessons.findIndex((l) => l.id === currentLessonId);
  const next = index >= 0 ? levelLessons[index + 1] : null;
  if (!next) return null;
  return {
    href: `/learn/${next.level}/${next.slug}`,
    title: next.title,
    kind: "curriculum",
  };
}

export function getNextEcosystemLesson(
  ecosystemId: EcosystemId,
  currentLessonId: string,
): NextLessonTarget | null {
  const lessons = ECOSYSTEM_LESSONS.filter((l) => l.ecosystemId === ecosystemId).sort(
    (a, b) => a.order_index - b.order_index,
  );
  const index = lessons.findIndex((l) => l.id === currentLessonId);
  const next = index >= 0 ? lessons[index + 1] : null;
  if (!next) return null;
  return {
    href: `/ecosystems/${ecosystemId}/${next.slug}`,
    title: next.title,
    kind: "ecosystem",
  };
}

export function getNextLessonAfterCompletion(
  currentLessonId: string,
  level: LearningLevel,
  gamification: GamificationState,
): NextLessonTarget | null {
  const inLevel = getNextCurriculumLesson(currentLessonId, level);
  if (inLevel) return inLevel;

  const path = buildPersonalizedLearningPath(gamification);
  const next = path.find((item) => item.lessonId !== currentLessonId);
  if (next) {
    return { href: next.href, title: next.title, kind: "curriculum" };
  }
  return null;
}
