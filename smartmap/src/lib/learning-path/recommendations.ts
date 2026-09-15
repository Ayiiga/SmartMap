import { LESSONS, LEVELS } from "@/content/curriculum";
import type { GamificationState, LearningLevel } from "@/types";

export interface LearningPathItem {
  lessonId: string;
  title: string;
  level: LearningLevel;
  slug: string;
  reason: string;
  priority: number;
  href: string;
}

export interface LearnerInsights {
  strengths: string[];
  weaknesses: string[];
  recommendedLevel: LearningLevel;
  dailyGoalMinutes: number;
}

const LEVEL_ORDER: LearningLevel[] = LEVELS.map((level) => level.id);

function getCompletedSet(gamification: GamificationState) {
  return new Set(gamification.completed_lessons ?? []);
}

function getLevelCompletion(gamification: GamificationState, level: LearningLevel) {
  const lessons = LESSONS.filter((lesson) => lesson.level === level);
  const completed = lessons.filter((lesson) => getCompletedSet(gamification).has(lesson.id));
  return { total: lessons.length, completed: completed.length };
}

export function buildLearnerInsights(gamification: GamificationState): LearnerInsights {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  for (const level of LEVEL_ORDER) {
    const { total, completed } = getLevelCompletion(gamification, level);
    if (total === 0) continue;
    const percent = (completed / total) * 100;
    const label = LEVELS.find((item) => item.id === level)?.title ?? level;
    if (percent >= 60) strengths.push(label);
    if (percent > 0 && percent < 40) weaknesses.push(label);
  }

  if (strengths.length === 0) strengths.push("Curiosity and eagerness to learn");
  if (weaknesses.length === 0 && gamification.xp < 200) weaknesses.push("Building daily practice habits");

  const recommendedLevel =
    weaknesses[0]
      ? (LEVELS.find((level) => level.title === weaknesses[0])?.id ?? "alphabet")
      : LEVEL_ORDER.find((level) => getLevelCompletion(gamification, level).completed < getLevelCompletion(gamification, level).total) ?? "alphabet";

  return {
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    recommendedLevel,
    dailyGoalMinutes: gamification.streak >= 7 ? 20 : 15,
  };
}

export function buildPersonalizedLearningPath(gamification: GamificationState): LearningPathItem[] {
  const completed = getCompletedSet(gamification);
  const insights = buildLearnerInsights(gamification);

  const candidates = LESSONS.filter((lesson) => !completed.has(lesson.id))
    .map((lesson) => {
      let priority = lesson.order_index;
      if (lesson.level === insights.recommendedLevel) priority -= 50;
      if (gamification.weaknesses?.includes(lesson.level)) priority -= 20;
      if (gamification.strengths?.includes(lesson.level)) priority += 10;
      if (gamification.unlocked_lessons.includes(lesson.id)) priority -= 15;

      return {
        lessonId: lesson.id,
        title: lesson.title,
        level: lesson.level,
        slug: lesson.slug,
        reason:
          lesson.level === insights.recommendedLevel
            ? "Recommended for your current learning focus"
            : gamification.unlocked_lessons.includes(lesson.id)
              ? "Ready to explore next"
              : "Builds your skills step by step",
        priority,
        href: `/learn/${lesson.level}/${lesson.slug}`,
      };
    })
    .sort((a, b) => a.priority - b.priority);

  return candidates.slice(0, 6);
}

export async function fetchAILearningPath(
  gamification: GamificationState,
  learnerName = "friend",
): Promise<LearningPathItem[]> {
  const localPath = buildPersonalizedLearningPath(gamification);
  try {
    const { fetchJsonWithRetry } = await import("@/lib/network/fetch-with-retry");
    const response = await fetchJsonWithRetry<{ response: string }>("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feature: "recommendations",
        input: `Learner ${learnerName} has ${gamification.xp} XP, level ${gamification.level}, streak ${gamification.streak}. Completed lessons: ${(gamification.completed_lessons ?? []).length}. Suggest next steps.`,
        context: { gamification },
      }),
      retries: 1,
    });
    if (response.response) {
      return localPath.map((item, index) => ({
        ...item,
        reason: index === 0 ? response.response.split("\n")[0] ?? item.reason : item.reason,
      }));
    }
  } catch {
    // Fall back to local recommendations when offline or API unavailable
  }
  return localPath;
}
