import type { GamificationState } from "@/types";

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
  isUser?: boolean;
  optedIn: boolean;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  xpReward: number;
  gemReward: number;
  metric: "lessons" | "xp" | "streak";
}

export const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  {
    id: "weekly-lessons-10",
    title: "Lesson Marathon",
    description: "Complete 10 lessons this week",
    icon: "📚",
    target: 10,
    xpReward: 200,
    gemReward: 5,
    metric: "lessons",
  },
  {
    id: "weekly-xp-1000",
    title: "XP Power Week",
    description: "Earn 1,000 XP this week",
    icon: "⭐",
    target: 1000,
    xpReward: 150,
    gemReward: 4,
    metric: "xp",
  },
  {
    id: "weekly-streak-7",
    title: "Perfect Week",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    target: 7,
    xpReward: 250,
    gemReward: 6,
    metric: "streak",
  },
];

const SAMPLE_CLASSMATES = [
  { name: "Amara O.", xp: 2450, avatar: "👩🏾", optedIn: true },
  { name: "James K.", xp: 2180, avatar: "👨🏿‍🏫", optedIn: true },
  { name: "Sarah M.", xp: 1920, avatar: "👩🏼", optedIn: true },
  { name: "David L.", xp: 1650, avatar: "👦🏻", optedIn: true },
];

export function buildClassroomLeaderboard(
  gamification: GamificationState,
  userName: string,
  optIn = true,
): LeaderboardEntry[] {
  const entries = [
    ...SAMPLE_CLASSMATES.filter((e) => e.optedIn),
    { name: userName, xp: gamification.xp, avatar: "🎓", optedIn: optIn },
  ]
    .sort((a, b) => b.xp - a.xp)
    .map((entry, i) => ({
      rank: i + 1,
      name: entry.name,
      xp: entry.xp,
      avatar: entry.avatar,
      isUser: entry.name === userName,
      optedIn: entry.optedIn,
    }));

  return entries;
}

export function getWeeklyChallengeProgress(
  challenge: WeeklyChallenge,
  gamification: GamificationState,
): number {
  switch (challenge.metric) {
    case "lessons":
      return gamification.weekly_goals?.lessons_completed ?? 0;
    case "xp":
      return gamification.weekly_goals?.xp_earned ?? 0;
    case "streak":
      return gamification.streak;
    default:
      return 0;
  }
}

export interface Certificate {
  id: string;
  title: string;
  learnerName: string;
  earnedAt: string;
  xp: number;
  level: number;
}

export function generateCertificate(
  gamification: GamificationState,
  learnerName: string,
  title = "Smart Map Achievement Certificate",
): Certificate {
  return {
    id: `cert-${Date.now()}`,
    title,
    learnerName,
    earnedAt: new Date().toISOString(),
    xp: gamification.xp,
    level: gamification.level,
  };
}
