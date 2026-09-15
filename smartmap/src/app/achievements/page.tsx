"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ACHIEVEMENTS } from "@/content/curriculum";
import { useGamification, useAppStore } from "@/stores/app-store";
import { GlassCard } from "@/components/ui/glass-card";

export default function AchievementsPage() {
  const { xp, badges } = useGamification();
  const checkAchievements = useAppStore((s) => s.checkAchievements);
  const earnedIds = new Set(badges.map((badge) => badge.id));

  useEffect(() => {
    checkAchievements();
  }, [checkAchievements, xp]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-3xl font-bold">Achievements</h1>
      <p className="mt-2 text-giga-muted">Collect badges and unlock rewards as you learn!</p>

      {badges.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold mb-4">Earned Badges</h2>
          <div className="flex flex-wrap gap-4">
            {badges.map((badge) => (
              <GlassCard key={badge.id} className="text-center w-36 border-giga-yellow/40">
                <span className="text-4xl">{badge.icon}</span>
                <p className="mt-2 font-bold text-sm">{badge.name}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((achievement, index) => {
          const earned = earnedIds.has(achievement.id) || xp >= achievement.xp_required;
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className={earned ? "border-giga-yellow bg-giga-yellow/10" : "opacity-70"}>
                <span className="text-4xl">{earned ? achievement.icon : "🔒"}</span>
                <p className="mt-3 font-bold">{achievement.title}</p>
                <p className="text-sm text-giga-muted">{achievement.description}</p>
                <p className="mt-3 text-sm font-bold text-giga-purple">{achievement.xp_required} XP required</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
