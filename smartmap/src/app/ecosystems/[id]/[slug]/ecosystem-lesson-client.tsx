"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { EcosystemLessonPlayer } from "@/components/learning/ecosystem-lesson-player";
import { CelebrationEffect, XPBadge } from "@/components/gamification/progress-bar";
import { getNextEcosystemLesson } from "@/lib/learning-path/next-lesson";
import { useLessonNavigation } from "@/hooks/use-lesson-navigation";
import { useAppStore } from "@/stores/app-store";
import { saveLocalProgress } from "@/lib/offline/db";
import type { EcosystemId, EcosystemLesson } from "@/content/ecosystem-lessons";

export function EcosystemLessonClient({
  lesson,
  ecosystemId,
}: {
  lesson: EcosystemLesson;
  ecosystemId: EcosystemId;
}) {
  const [celebrate, setCelebrate] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { completeLesson, addCoins } = useAppStore();
  const { nextTarget, isAdvancing, scheduleAutoAdvance } = useLessonNavigation();

  const next = getNextEcosystemLesson(ecosystemId, lesson.id);

  const handleComplete = async () => {
    if (completed) return;
    setCompleted(true);
    setCelebrate(true);
    completeLesson(lesson.id, "vocabulary", lesson.xp_reward);
    addCoins(lesson.coin_reward);

    await saveLocalProgress({
      id: crypto.randomUUID(),
      user_id: "local-user",
      lesson_id: lesson.id,
      level: "vocabulary",
      completed: true,
      score: 100,
      time_spent_seconds: lesson.duration_minutes * 60,
      completed_at: new Date().toISOString(),
      synced: false,
    });

    scheduleAutoAdvance(
      next,
      `/ecosystems/${ecosystemId}`,
    );

    setTimeout(() => setCelebrate(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <CelebrationEffect show={celebrate} />

      <Link href={`/ecosystems/${ecosystemId}`} className="inline-flex items-center gap-2 text-giga-purple font-semibold hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to lessons
      </Link>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">{lesson.title}</h1>
          <p className="mt-2 text-giga-muted">{lesson.description}</p>
          <div className="mt-4 flex gap-3">
            <XPBadge amount={lesson.xp_reward} />
            <span className="text-sm text-giga-muted">⏱ {lesson.duration_minutes} min</span>
          </div>
        </div>

        <div className="rounded-3xl border border-giga-border bg-white p-6 sm:p-10 dark:bg-giga-surface dark:border-giga-border-dark">
          <EcosystemLessonPlayer
            lesson={lesson}
            onComplete={handleComplete}
            nextHref={next?.href}
            nextTitle={next?.title}
          />
        </div>

        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 rounded-2xl bg-giga-green/10 p-6 text-center"
          >
            <CheckCircle className="h-8 w-8 text-giga-green mx-auto" />
            <p className="mt-2 font-bold text-giga-green text-xl">Lesson Complete! +{lesson.xp_reward} XP</p>
            {isAdvancing && nextTarget && (
              <p className="mt-2 text-sm text-giga-muted">Moving to {nextTarget.title}…</p>
            )}
            {!isAdvancing && next && (
              <Link href={next.href} className="mt-3 inline-block text-giga-purple font-bold hover:underline">
                Continue to {next.title} →
              </Link>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
