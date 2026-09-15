"use client";

import { motion } from "framer-motion";
import { useGamification } from "@/stores/app-store";
import { xpForNextLevel } from "@/lib/utils";

export function ProgressBar() {
  const { xp, level, streak, coins, gems } = useGamification();
  const nextLevelXp = xpForNextLevel(level);
  const prevLevelXp = xpForNextLevel(level - 1);
  const progress = ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-giga-purple/10 to-giga-blue/10 p-4 border border-giga-purple/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-giga-purple">Level {level}</span>
          {streak > 0 && (
            <span className="rounded-full bg-giga-orange/20 px-2 py-0.5 text-xs font-bold text-giga-orange">
              🔥 {streak} day streak
            </span>
          )}
        </div>
        <span className="text-sm text-giga-muted">🪙 {coins} · 💎 {gems ?? 0}</span>
      </div>
      <div className="h-3 rounded-full bg-white dark:bg-giga-surface overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-giga-purple to-giga-blue"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
      <p className="mt-1 text-xs text-giga-muted text-right">{xp} / {nextLevelXp} XP</p>
    </div>
  );
}

export function CelebrationEffect({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden>
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
          }}
          initial={{ y: -20, opacity: 1 }}
        >
          {["⭐", "🎉", "🌟", "✨", "🏆"][i % 5]}
        </motion.div>
      ))}
    </div>
  );
}

export function XPBadge({ amount }: { amount: number }) {
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-1 rounded-full bg-giga-yellow/20 px-3 py-1 text-sm font-bold text-giga-orange"
    >
      +{amount} XP ⭐
    </motion.span>
  );
}
