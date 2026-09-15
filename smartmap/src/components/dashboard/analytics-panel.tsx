"use client";

import { motion } from "framer-motion";
import { useGamification } from "@/stores/app-store";
import { LEVELS, LESSONS } from "@/content/curriculum";
import { getLevelProgressPercent } from "@/lib/gamification/achievements";
import { GlassCard } from "@/components/ui/glass-card";

export function AnalyticsSummary() {
  const gamification = useGamification();
  const completed = new Set(gamification.completed_lessons);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: "Total XP", value: gamification.xp, icon: "⭐" },
        { label: "Level", value: gamification.level, icon: "🎯" },
        { label: "Lessons Done", value: completed.size, icon: "📚" },
        { label: "Day Streak", value: gamification.streak, icon: "🔥" },
      ].map((stat, index) => (
        <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
          <GlassCard className="text-center">
            <span className="text-3xl">{stat.icon}</span>
            <p className="mt-2 text-3xl font-display font-bold text-giga-purple">{stat.value}</p>
            <p className="text-sm text-giga-muted">{stat.label}</p>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}

export function LevelAnalytics() {
  const gamification = useGamification();
  const completed = new Set(gamification.completed_lessons);

  return (
    <div className="space-y-3">
      {LEVELS.map((level) => {
        const lessons = LESSONS.filter((lesson) => lesson.level === level.id);
        const done = lessons.filter((lesson) => completed.has(lesson.id)).length;
        const percent = getLevelProgressPercent(level.number, done, lessons.length);
        return (
          <GlassCard key={level.id}>
            <div className="flex items-center gap-4">
              <span className="text-3xl">{level.icon}</span>
              <div className="flex-1">
                <p className="font-bold">{level.title}</p>
                <div className="mt-2 h-2 rounded-full bg-giga-border overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${level.color}`} style={{ width: `${percent}%` }} />
                </div>
              </div>
              <span className="text-sm font-bold text-giga-muted">{percent}%</span>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}

export function InsightsPanel({
  strengths,
  weaknesses,
  recommendations,
}: {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <GlassCard>
        <p className="font-bold text-giga-green mb-2">Strengths</p>
        <ul className="space-y-2 text-sm">
          {strengths.map((item) => (
            <li key={item}>✅ {item}</li>
          ))}
        </ul>
      </GlassCard>
      <GlassCard>
        <p className="font-bold text-giga-orange mb-2">Areas to Grow</p>
        <ul className="space-y-2 text-sm">
          {weaknesses.map((item) => (
            <li key={item}>🎯 {item}</li>
          ))}
        </ul>
      </GlassCard>
      <GlassCard>
        <p className="font-bold text-giga-purple mb-2">Recommendations</p>
        <ul className="space-y-2 text-sm">
          {recommendations.map((item) => (
            <li key={item}>💡 {item}</li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}
