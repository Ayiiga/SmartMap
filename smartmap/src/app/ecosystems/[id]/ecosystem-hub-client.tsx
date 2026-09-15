"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { ProgressBar } from "@/components/gamification/progress-bar";
import type { EcosystemLesson } from "@/content/ecosystem-lessons";
import type { LearningEcosystem } from "@/content/ecosystems";
import { useGamification } from "@/stores/app-store";

export function EcosystemHubClient({
  ecosystem,
  lessons,
}: {
  ecosystem: LearningEcosystem;
  lessons: EcosystemLesson[];
}) {
  const gamification = useGamification();
  const completed = new Set(gamification.completed_lessons);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-giga-purple hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-5xl">{ecosystem.icon}</span>
        <h1 className="font-display mt-4 text-3xl font-bold sm:text-4xl">{ecosystem.title}</h1>
        <p className="mt-2 text-giga-muted max-w-2xl">{ecosystem.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {ecosystem.methods.map((m) => (
            <span key={m} className="rounded-full bg-giga-purple/10 px-3 py-1 text-xs font-bold text-giga-purple">{m}</span>
          ))}
        </div>
        <div className="mt-6 max-w-md"><ProgressBar /></div>
      </motion.div>

      <h2 className="font-display text-2xl font-bold mt-10 mb-6">Lessons</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson, i) => (
          <motion.div key={lesson.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link href={`/ecosystems/${ecosystem.id}/${lesson.slug}`}>
              <Card hover gradient className="h-full">
                <span className="text-xs font-bold text-giga-purple">{lesson.topic}</span>
                <CardTitle className="mt-2">{lesson.title}</CardTitle>
                <CardDescription>{lesson.description}</CardDescription>
                <div className="mt-4 flex gap-3 text-sm font-bold text-giga-purple">
                  <span>⭐ {lesson.xp_reward} XP</span>
                  {completed.has(lesson.id) && <span className="text-giga-green">✓ Done</span>}
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
