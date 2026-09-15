"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LevelCard } from "@/components/learning/level-card";
import { ProgressBar } from "@/components/gamification/progress-bar";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { LEVELS, LESSONS } from "@/content/curriculum";

function LearnContent() {
  const searchParams = useSearchParams();
  const selectedLevel = searchParams.get("level");

  const filteredLessons = selectedLevel
    ? LESSONS.filter((l) => l.level === selectedLevel)
    : LESSONS;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Learning Hub</h1>
        <p className="mt-2 text-giga-muted">Choose your adventure and start learning!</p>
        <div className="mt-6 max-w-md">
          <ProgressBar />
        </div>
      </div>

      {!selectedLevel ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {LEVELS.map((level) => (
            <LevelCard
              key={level.id}
              {...level}
              href={
                level.id === "phonics"
                  ? "/gigaphonics"
                  : level.id === "mathematics"
                    ? "/learn?level=mathematics"
                    : `/learn?level=${level.id}`
              }
              progress={Math.min(LESSONS.filter((l) => l.level === level.id).length * 3, 100)}
            />
          ))}
        </div>
      ) : (
        <div>
          <Link href="/learn" className="text-giga-purple font-semibold hover:underline mb-6 inline-block">
            ← All Levels
          </Link>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLessons.map((lesson, i) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/learn/${lesson.level}/${lesson.slug}`}>
                  <Card hover gradient className="h-full">
                    <CardTitle>{lesson.title}</CardTitle>
                    <CardDescription>{lesson.description}</CardDescription>
                    <div className="mt-4 flex gap-4 text-sm font-bold text-giga-purple">
                      <span>⭐ {lesson.xp_reward} XP</span>
                      <span>🪙 {lesson.coin_reward}</span>
                      <span>⏱ {lesson.duration_minutes} min</span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <LearnContent />
    </Suspense>
  );
}
