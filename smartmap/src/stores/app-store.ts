import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getNewBadgesToAward } from "@/lib/gamification/achievements";
import { DAILY_QUESTS } from "@/content/quests";
import { LEARNING_WORLDS } from "@/content/worlds";
import { buildLearnerInsights } from "@/lib/learning-path/recommendations";
import type { ActivityEntry, GamificationState, LearningLevel, UserRole } from "@/types";
import { calculateLevel } from "@/lib/utils";

interface AppState {
  isOnline: boolean;
  userRole: UserRole;
  gamification: GamificationState;
  currentLessonId: string | null;
  darkMode: boolean;
  setOnline: (online: boolean) => void;
  setUserRole: (role: UserRole) => void;
  setCurrentLesson: (id: string | null) => void;
  toggleDarkMode: () => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  incrementStreak: () => void;
  addActivity: (entry: Omit<ActivityEntry, "id" | "timestamp">) => void;
  dismissNotification: (id: string) => void;
  unlockLesson: (lessonId: string) => void;
  earnBadge: (badge: GamificationState["badges"][0]) => void;
  completeLesson: (lessonId: string, level: LearningLevel, xpEarned?: number) => void;
  completeQuest: (questId: string) => void;
  unlockWorld: (worldId: string) => void;
  hydrateGamification: (partial: Partial<GamificationState>) => void;
  checkAchievements: () => void;
  refreshLearningInsights: () => void;
}

const defaultGamification: GamificationState = {
  xp: 0,
  coins: 0,
  gems: 0,
  level: 1,
  streak: 0,
  last_active_date: new Date().toISOString().split("T")[0],
  badges: [],
  unlocked_lessons: ["alphabet-a", "phonics-cvc-a", "math-count-1-5"],
  completed_lessons: [],
  daily_quest_progress: {},
  completed_quests: [],
  unlocked_worlds: ["alphabet-island"],
  strengths: [],
  weaknesses: [],
  lessons_completed_today: 0,
  xp_earned_today: 0,
  speaking_exercises_today: 0,
  recent_activity: [],
  weekly_goals: {
    lessons_completed: 0,
    xp_earned: 0,
    speaking_exercises: 0,
    week_start: getWeekStart(),
  },
  dismissed_notifications: [],
  leaderboard_opt_in: true,
  completed_weekly_challenges: [],
};

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  return monday.toISOString().split("T")[0];
}

function resetWeeklyGoalsIfNeeded(goals: GamificationState["weekly_goals"]): GamificationState["weekly_goals"] {
  const currentWeekStart = getWeekStart();
  if (goals.week_start !== currentWeekStart) {
    return { lessons_completed: 0, xp_earned: 0, speaking_exercises: 0, week_start: currentWeekStart };
  }
  return goals;
}

function withDefaults(state: GamificationState): GamificationState {
  return {
    ...defaultGamification,
    ...state,
    badges: state.badges ?? [],
    unlocked_lessons: state.unlocked_lessons ?? defaultGamification.unlocked_lessons,
    completed_lessons: state.completed_lessons ?? [],
    daily_quest_progress: state.daily_quest_progress ?? {},
    completed_quests: state.completed_quests ?? [],
    unlocked_worlds: state.unlocked_worlds ?? defaultGamification.unlocked_worlds,
    strengths: state.strengths ?? [],
    weaknesses: state.weaknesses ?? [],
    lessons_completed_today: state.lessons_completed_today ?? 0,
    xp_earned_today: state.xp_earned_today ?? 0,
    speaking_exercises_today: state.speaking_exercises_today ?? 0,
    gems: state.gems ?? 0,
    recent_activity: state.recent_activity ?? [],
    weekly_goals: resetWeeklyGoalsIfNeeded(state.weekly_goals ?? defaultGamification.weekly_goals),
    dismissed_notifications: state.dismissed_notifications ?? [],
    leaderboard_opt_in: state.leaderboard_opt_in ?? true,
    completed_weekly_challenges: state.completed_weekly_challenges ?? [],
  };
}

function unlockWorldsForXp(gamification: GamificationState): string[] {
  const worlds = new Set(gamification.unlocked_worlds);
  for (const world of LEARNING_WORLDS) {
    if (gamification.xp >= world.unlockXp) worlds.add(world.id);
  }
  return Array.from(worlds);
}

function updateQuestProgress(
  gamification: GamificationState,
  updates: Partial<Pick<GamificationState, "lessons_completed_today" | "xp_earned_today" | "speaking_exercises_today">>,
  level?: LearningLevel,
) {
  const progress = { ...gamification.daily_quest_progress };
  const completed = new Set(gamification.completed_quests);
  let xpBonus = 0;
  let coinBonus = 0;

  if (updates.lessons_completed_today !== undefined) {
    progress["complete-2-lessons"] = updates.lessons_completed_today;
    if (level === "phonics") progress["practice-phonics"] = 1;
    if (level === "mathematics") progress["math-practice"] = 1;
  }
  if (updates.xp_earned_today !== undefined) {
    progress["earn-100-xp"] = updates.xp_earned_today;
  }
  if (gamification.streak > 0) progress["keep-streak"] = 1;

  for (const quest of DAILY_QUESTS) {
    if (completed.has(quest.id)) continue;
    const current = progress[quest.id] ?? 0;
    if (current >= quest.target) {
      completed.add(quest.id);
      xpBonus += quest.xpReward;
      coinBonus += quest.coinReward;
    }
  }

  return { progress, completed: Array.from(completed), xpBonus, coinBonus };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isOnline: true,
      userRole: "student",
      gamification: defaultGamification,
      currentLessonId: null,
      darkMode: false,

      setOnline: (online) => set({ isOnline: online }),
      setUserRole: (role) => set({ userRole: role }),
      setCurrentLesson: (id) => set({ currentLessonId: id }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      addXP: (amount) =>
        set((s) => {
          const today = new Date().toISOString().split("T")[0];
          const resetDaily = s.gamification.last_active_date !== today;
          const xpEarnedToday = (resetDaily ? 0 : s.gamification.xp_earned_today) + amount;
          const xp = s.gamification.xp + amount;
          const weeklyGoals = resetWeeklyGoalsIfNeeded(s.gamification.weekly_goals ?? defaultGamification.weekly_goals);
          const base: GamificationState = {
            ...withDefaults(s.gamification),
            xp,
            level: calculateLevel(xp),
            xp_earned_today: xpEarnedToday,
            last_active_date: today,
            unlocked_worlds: unlockWorldsForXp({ ...s.gamification, xp }),
            weekly_goals: { ...weeklyGoals, xp_earned: weeklyGoals.xp_earned + amount },
          };
          const questUpdate = updateQuestProgress(base, { xp_earned_today: xpEarnedToday });
          return {
            gamification: {
              ...base,
              daily_quest_progress: questUpdate.progress,
              completed_quests: questUpdate.completed,
              xp: base.xp + questUpdate.xpBonus,
              coins: base.coins + questUpdate.coinBonus,
              level: calculateLevel(base.xp + questUpdate.xpBonus),
            },
          };
        }),

      addCoins: (amount) =>
        set((s) => ({
          gamification: {
            ...withDefaults(s.gamification),
            coins: s.gamification.coins + amount,
          },
        })),

      addGems: (amount) =>
        set((s) => ({
          gamification: {
            ...withDefaults(s.gamification),
            gems: (s.gamification.gems ?? 0) + amount,
          },
        })),

      addActivity: (entry) =>
        set((s) => {
          const activity: ActivityEntry = {
            ...entry,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            timestamp: new Date().toISOString(),
          };
          const recent = [activity, ...(s.gamification.recent_activity ?? [])].slice(0, 20);
          return {
            gamification: { ...withDefaults(s.gamification), recent_activity: recent },
          };
        }),

      dismissNotification: (id) =>
        set((s) => ({
          gamification: {
            ...withDefaults(s.gamification),
            dismissed_notifications: [...(s.gamification.dismissed_notifications ?? []), id],
          },
        })),

      incrementStreak: () =>
        set((s) => {
          const today = new Date().toISOString().split("T")[0];
          const lastActive = s.gamification.last_active_date;
          let streak = s.gamification.streak;

          if (lastActive !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0];
            streak = lastActive === yesterdayStr ? streak + 1 : 1;
          }

          const gamification = {
            ...withDefaults(s.gamification),
            streak,
            last_active_date: today,
          };
          const questUpdate = updateQuestProgress(gamification, {});
          return {
            gamification: {
              ...gamification,
              daily_quest_progress: questUpdate.progress,
              completed_quests: questUpdate.completed,
              coins: gamification.coins + questUpdate.coinBonus,
              xp: gamification.xp + questUpdate.xpBonus,
              level: calculateLevel(gamification.xp + questUpdate.xpBonus),
            },
          };
        }),

      unlockLesson: (lessonId) =>
        set((s) => ({
          gamification: {
            ...withDefaults(s.gamification),
            unlocked_lessons: s.gamification.unlocked_lessons.includes(lessonId)
              ? s.gamification.unlocked_lessons
              : [...s.gamification.unlocked_lessons, lessonId],
          },
        })),

      earnBadge: (badge) =>
        set((s) => {
          if (s.gamification.badges.some((b) => b.id === badge.id)) return s;
          const recent: ActivityEntry = {
            id: `${Date.now()}-badge`,
            type: "badge",
            title: `Earned badge: ${badge.name}`,
            icon: badge.icon,
            timestamp: new Date().toISOString(),
          };
          return {
            gamification: {
              ...withDefaults(s.gamification),
              badges: [...s.gamification.badges, badge],
              gems: (s.gamification.gems ?? 0) + 2,
              recent_activity: [recent, ...(s.gamification.recent_activity ?? [])].slice(0, 20),
            },
          };
        }),

      completeLesson: (lessonId, level, xpEarned = 0) => {
        const state = get();
        const isNew = !state.gamification.completed_lessons.includes(lessonId);
        if (isNew) {
          state.unlockLesson(lessonId);
          state.addXP(xpEarned);
          state.addCoins(Math.floor(xpEarned / 5));
          state.addGems(1);
          state.incrementStreak();
          state.addActivity({
            type: "lesson",
            title: `Completed lesson`,
            icon: "📚",
          });
        }
        set((s) => {
          const today = new Date().toISOString().split("T")[0];
          const resetDaily = s.gamification.last_active_date !== today;
          const lessonsToday = (resetDaily ? 0 : s.gamification.lessons_completed_today) + 1;
          const completedLessons = s.gamification.completed_lessons.includes(lessonId)
            ? s.gamification.completed_lessons
            : [...s.gamification.completed_lessons, lessonId];
          const gamification = {
            ...withDefaults(s.gamification),
            completed_lessons: completedLessons,
            lessons_completed_today: lessonsToday,
            last_active_date: today,
            weekly_goals: {
              ...resetWeeklyGoalsIfNeeded(s.gamification.weekly_goals ?? defaultGamification.weekly_goals),
              lessons_completed: resetWeeklyGoalsIfNeeded(s.gamification.weekly_goals ?? defaultGamification.weekly_goals).lessons_completed + (isNew ? 1 : 0),
            },
          };
          const questUpdate = updateQuestProgress(gamification, { lessons_completed_today: lessonsToday }, level);
          const insights = buildLearnerInsights({
            ...gamification,
            completed_lessons: completedLessons,
          });
          return {
            gamification: {
              ...gamification,
              daily_quest_progress: questUpdate.progress,
              completed_quests: questUpdate.completed,
              strengths: insights.strengths,
              weaknesses: insights.weaknesses,
              unlocked_worlds: unlockWorldsForXp(gamification),
            },
          };
        });
        get().checkAchievements();
      },

      completeQuest: (questId) =>
        set((s) => ({
          gamification: {
            ...withDefaults(s.gamification),
            completed_quests: s.gamification.completed_quests.includes(questId)
              ? s.gamification.completed_quests
              : [...s.gamification.completed_quests, questId],
          },
        })),

      unlockWorld: (worldId) =>
        set((s) => ({
          gamification: {
            ...withDefaults(s.gamification),
            unlocked_worlds: s.gamification.unlocked_worlds.includes(worldId)
              ? s.gamification.unlocked_worlds
              : [...s.gamification.unlocked_worlds, worldId],
          },
        })),

      hydrateGamification: (partial) =>
        set((s) => ({
          gamification: withDefaults({ ...s.gamification, ...partial }),
        })),

      checkAchievements: () => {
        const { gamification, earnBadge } = get();
        for (const badge of getNewBadgesToAward(withDefaults(gamification))) {
          earnBadge(badge);
        }
      },

      refreshLearningInsights: () =>
        set((s) => {
          const insights = buildLearnerInsights(withDefaults(s.gamification));
          return {
            gamification: {
              ...withDefaults(s.gamification),
              strengths: insights.strengths,
              weaknesses: insights.weaknesses,
            },
          };
        }),
    }),
    {
      name: "smartmap-store",
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<AppState> | undefined;
        return {
          ...current,
          ...persistedState,
          gamification: withDefaults((persistedState?.gamification ?? current.gamification) as GamificationState),
        };
      },
    },
  ),
);

export function useGamification() {
  return useAppStore((s) => s.gamification);
}
