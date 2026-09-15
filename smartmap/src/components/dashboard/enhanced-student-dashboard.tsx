"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProgressBar } from "@/components/gamification/progress-bar";
import { QuestPanel } from "@/components/gamification/quest-panel";
import { WorldMap } from "@/components/gamification/world-map";
import { AnalyticsSummary, LevelAnalytics } from "@/components/dashboard/analytics-panel";
import { LearningPathCard } from "@/components/dashboard/learning-path-card";
import { GlassCard } from "@/components/ui/glass-card";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { useGamification } from "@/stores/app-store";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

const QUICK_LINKS = [
  { href: "/learn", label: "Continue Learning", icon: "📚", color: "from-giga-purple to-giga-blue" },
  { href: "/gigaphonics", label: "GigaPhonics", icon: "🔤", color: "from-giga-orange to-giga-yellow" },
  { href: "/gigamath", label: "GigaMath", icon: "🔢", color: "from-giga-yellow to-giga-orange" },
  { href: "/ai-tutor", label: "AI Tutor", icon: "🤖", color: "from-giga-teal to-giga-green" },
  { href: "/games", label: "Play Games", icon: "🎮", color: "from-giga-pink to-giga-purple" },
  { href: "/quests", label: "Daily Quests", icon: "🗺️", color: "from-giga-indigo to-giga-blue" },
];

export function EnhancedStudentDashboard() {
  const { user } = useAuth();
  const gamification = useGamification();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <DashboardSkeleton />
      </div>
    );
  }

  const greeting = user?.user_metadata?.full_name?.split(" ")[0] ?? "Learner";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Welcome back, <span className="text-gradient">{greeting}</span>!
        </h1>
        <p className="mt-2 text-giga-muted">Your personalized learning command center</p>
      </motion.div>

      <motion.div className="mt-6 max-w-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <ProgressBar />
      </motion.div>

      <div className="mt-8">
        <AnalyticsSummary />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map((link, index) => (
          <motion.div key={link.href} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + index * 0.04 }}>
            <Link href={link.href}>
              <GlassCard hover className={`bg-gradient-to-br ${link.color} text-white border-0`}>
                <span className="text-4xl">{link.icon}</span>
                <p className="mt-3 font-display text-lg font-bold">{link.label}</p>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <LearningPathCard />
        <GlassCard>
          <h2 className="font-display text-xl font-bold mb-4">Learner Insights</h2>
          <div className="space-y-3 text-sm">
            <p><strong>Strengths:</strong> {gamification.strengths.join(", ") || "Building confidence"}</p>
            <p><strong>Focus areas:</strong> {gamification.weaknesses.join(", ") || "Exploring all levels"}</p>
            <p><strong>Coins:</strong> 🪙 {gamification.coins} · <strong>Gems:</strong> 💎 {gamification.gems ?? 0}</p>
            <p><strong>Badges earned:</strong> {gamification.badges.length}</p>
          </div>
        </GlassCard>
      </div>

      <div className="mt-12">
        <h2 className="font-display text-2xl font-bold mb-6">Unlockable Worlds</h2>
        <WorldMap />
      </div>

      <div className="mt-12">
        <QuestPanel />
      </div>

      <div className="mt-12">
        <h2 className="font-display text-2xl font-bold mb-6">Level Progress</h2>
        <LevelAnalytics />
      </div>
    </div>
  );
}
