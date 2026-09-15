import { ACHIEVEMENTS } from "@/content/curriculum";
import type { Badge, GamificationState } from "@/types";

export function getEarnedAchievements(gamification: GamificationState) {
  return ACHIEVEMENTS.filter((achievement) => gamification.xp >= achievement.xp_required);
}

export function getNewBadgesToAward(gamification: GamificationState): Badge[] {
  const earned = getEarnedAchievements(gamification);
  const existing = new Set(gamification.badges.map((badge) => badge.id));

  return earned
    .filter((achievement) => !existing.has(achievement.id))
    .map((achievement) => ({
      id: achievement.id,
      name: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      earned_at: new Date().toISOString(),
    }));
}

export function getLevelProgressPercent(levelNumber: number, completedInLevel: number, totalInLevel: number) {
  if (totalInLevel <= 0) return 0;
  return Math.round((completedInLevel / totalInLevel) * 100);
}
