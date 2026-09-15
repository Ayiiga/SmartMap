"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProgressBar } from "@/components/gamification/progress-bar";
import { InsightsPanel, LevelAnalytics } from "@/components/dashboard/analytics-panel";
import { LearningPathCard } from "@/components/dashboard/learning-path-card";
import { buildLearnerInsights } from "@/lib/learning-path/recommendations";
import { useGamification } from "@/stores/app-store";
import { useAuth } from "@/hooks/use-auth";
import { fetchChildProgress, type StudentProgressSummary } from "@/lib/classroom";
import { GlassCard } from "@/components/ui/glass-card";

export default function ParentDashboard() {
  const gamification = useGamification();
  const { user, isAuthenticated } = useAuth();
  const insights = buildLearnerInsights(gamification);
  const [children, setChildren] = useState<StudentProgressSummary[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchChildProgress(user.id).then(setChildren);
    }
  }, [user, isAuthenticated]);

  const child = children[0];
  const completedCount = child?.lessons_completed ?? gamification.completed_lessons.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-giga-purple hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <h1 className="font-display text-3xl font-bold">Parent Dashboard</h1>
      <p className="mt-2 text-giga-muted">Progress reports, analytics, and home learning suggestions</p>

      <GlassCard className="mt-8 p-6">
        <div className="flex items-center gap-4">
          <span className="text-5xl">👧</span>
          <div>
            <p className="font-display text-xl font-bold">
              {child?.full_name ?? "Learner Progress Overview"}
            </p>
            <p className="text-giga-muted">{completedCount} lessons completed · Level {gamification.level}</p>
          </div>
        </div>
        <div className="mt-6 max-w-md"><ProgressBar /></div>
      </GlassCard>

      {children.length > 1 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {children.map((c) => (
            <GlassCard key={c.student_id}>
              <p className="font-bold">{c.full_name}</p>
              <p className="text-sm text-giga-muted">{c.lessons_completed} lessons · {c.xp} XP · 🔥 {c.streak}d</p>
            </GlassCard>
          ))}
        </div>
      )}

      <div className="mt-10">
        <InsightsPanel
          strengths={insights.strengths}
          weaknesses={insights.weaknesses}
          recommendations={[
            `Practice ${insights.recommendedLevel} for ${insights.dailyGoalMinutes} minutes today`,
            "Read one story aloud together before bedtime",
            "Celebrate streak milestones to build habits",
          ]}
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <LearningPathCard />
        <div>
          <h2 className="font-display text-xl font-bold mb-4">Level Breakdown</h2>
          <LevelAnalytics />
        </div>
      </div>

      <div className="mt-10">
        <Link href="/certificates" className="text-giga-purple font-bold hover:underline">
          View digital certificates & achievement portfolio →
        </Link>
      </div>
    </div>
  );
}
