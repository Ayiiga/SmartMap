"use client";

import { motion } from "framer-motion";
import { DAILY_QUESTS } from "@/content/quests";
import { useGamification } from "@/stores/app-store";
import { GlassCard } from "@/components/ui/glass-card";

export function QuestPanel() {
  const gamification = useGamification();

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold">Daily Quests</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {DAILY_QUESTS.map((quest, index) => {
          const progress = gamification.daily_quest_progress[quest.id] ?? 0;
          const completed = gamification.completed_quests.includes(quest.id);
          const percent = Math.min(100, Math.round((progress / quest.target) * 100));

          return (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className={completed ? "border-giga-green/40 bg-giga-green/10" : undefined}>
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{quest.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold">{quest.title}</p>
                    <p className="text-sm text-giga-muted">{quest.description}</p>
                    <div className="mt-3 h-2 rounded-full bg-giga-border overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-giga-purple to-giga-blue"
                        animate={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-giga-muted">
                      {completed ? "Completed!" : `${progress}/${quest.target}`} • +{quest.xpReward} XP
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
