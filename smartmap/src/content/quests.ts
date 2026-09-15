import type { LearningLevel } from "@/types";

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  coinReward: number;
  target: number;
  type: "lessons" | "xp" | "streak" | "speaking" | "math";
  level?: LearningLevel;
}

export const DAILY_QUESTS: DailyQuest[] = [
  {
    id: "complete-2-lessons",
    title: "Lesson Explorer",
    description: "Complete 2 lessons today",
    icon: "📚",
    xpReward: 40,
    coinReward: 8,
    target: 2,
    type: "lessons",
  },
  {
    id: "earn-100-xp",
    title: "XP Champion",
    description: "Earn 100 XP today",
    icon: "⭐",
    xpReward: 25,
    coinReward: 5,
    target: 100,
    type: "xp",
  },
  {
    id: "practice-phonics",
    title: "Sound Star",
    description: "Finish a phonics lesson",
    icon: "🔤",
    xpReward: 35,
    coinReward: 7,
    target: 1,
    type: "lessons",
    level: "phonics",
  },
  {
    id: "math-practice",
    title: "Math Wizard",
    description: "Complete a GigaMath lesson",
    icon: "🔢",
    xpReward: 45,
    coinReward: 10,
    target: 1,
    type: "math",
    level: "mathematics",
  },
  {
    id: "keep-streak",
    title: "Streak Keeper",
    description: "Maintain your learning streak",
    icon: "🔥",
    xpReward: 30,
    coinReward: 6,
    target: 1,
    type: "streak",
  },
];
