"use client";

import { useEffect } from "react";
import { ProgressBar } from "@/components/gamification/progress-bar";
import { LevelAnalytics } from "@/components/dashboard/analytics-panel";
import { LESSONS } from "@/content/curriculum";
import { useGamification, useAppStore } from "@/stores/app-store";
import { motion } from "framer-motion";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";

export default function ProgressPage() {
  const { xp, level, streak, completed_lessons, badges } = useGamification();
  const checkAchievements = useAppStore((s) => s.checkAchievements);
  const completed = new Set(completed_lessons);

  useEffect(() => {
    checkAchievements();
  }, [checkAchievements, xp]);

  const recentLessons = LESSONS.filter((lesson) => completed.has(lesson.id)).slice(-6).reverse();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-3xl font-bold">Your Progress</h1>
      <p className="mt-2 text-giga-muted">Track your learning journey across all levels</p>

      <div className="mt-8 max-w-md">
        <ProgressBar />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Current Level", value: level, icon: "🎯" },
          { label: "Day Streak", value: streak, icon: "🔥" },
          { label: "Total XP", value: xp, icon: "⭐" },
          { label: "Badges", value: badges.length, icon: "🏆" },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <GlassCard className="text-center">
              <span className="text-2xl">{stat.icon}</span>
              <p className="mt-2 text-3xl font-display font-bold text-giga-purple">{stat.value}</p>
              <p className="text-sm text-giga-muted">{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <h2 className="font-display text-2xl font-bold mt-12 mb-6">Level Progress</h2>
      <LevelAnalytics />

      <h2 className="font-display text-2xl font-bold mt-12 mb-6">Recent Lessons</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {recentLessons.length > 0 ? (
          recentLessons.map((lesson) => (
            <Link key={lesson.id} href={`/learn/${lesson.level}/${lesson.slug}`}>
              <GlassCard hover>
                <p className="font-bold">{lesson.title}</p>
                <p className="text-sm text-giga-muted">{lesson.level} • {lesson.duration_minutes} min • ✅ Complete</p>
              </GlassCard>
            </Link>
          ))
        ) : (
          <GlassCard>
            <p className="text-giga-muted">Complete your first lesson to see progress here.</p>
            <Link href="/learn" className="mt-3 inline-block font-semibold text-giga-purple hover:underline">Start learning</Link>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
