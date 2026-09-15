import type { LearningLevel } from "@/types";

export interface LearningWorld {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  level: LearningLevel;
  unlockXp: number;
  order: number;
}

export const LEARNING_WORLDS: LearningWorld[] = [
  {
    id: "alphabet-island",
    title: "Alphabet Island",
    description: "Trace letters and discover sounds",
    icon: "🏝️",
    color: "from-giga-purple to-giga-blue",
    level: "alphabet",
    unlockXp: 0,
    order: 1,
  },
  {
    id: "phonics-forest",
    title: "Phonics Forest",
    description: "Blend sounds and read CVC words",
    icon: "🌲",
    color: "from-giga-orange to-giga-yellow",
    level: "phonics",
    unlockXp: 150,
    order: 2,
  },
  {
    id: "story-sky",
    title: "Story Sky",
    description: "Read stories and build fluency",
    icon: "☁️",
    color: "from-giga-indigo to-giga-purple",
    level: "reading",
    unlockXp: 400,
    order: 3,
  },
  {
    id: "math-mountain",
    title: "Math Mountain",
    description: "Count, add, subtract, and solve puzzles",
    icon: "⛰️",
    color: "from-giga-yellow to-giga-orange",
    level: "mathematics",
    unlockXp: 250,
    order: 4,
  },
  {
    id: "grammar-garden",
    title: "Grammar Garden",
    description: "Grow sentences with nouns and verbs",
    icon: "🌻",
    color: "from-giga-teal to-giga-green",
    level: "grammar",
    unlockXp: 600,
    order: 5,
  },
  {
    id: "champion-castle",
    title: "Champion Castle",
    description: "Master all skills and earn royal rewards",
    icon: "🏰",
    color: "from-giga-pink to-giga-red",
    level: "reading",
    unlockXp: 1500,
    order: 6,
  },
];
