"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MATH_LESSONS } from "@/content/math-curriculum";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressBar } from "@/components/gamification/progress-bar";
import { useGamification } from "@/stores/app-store";

const TEACHING_MODES = [
  { icon: "🗣️", title: "Speaking", description: "Talk through problems aloud" },
  { icon: "🎵", title: "Singing", description: "Count and learn with rhymes" },
  { icon: "🧩", title: "Puzzles", description: "Interactive math challenges" },
  { icon: "🍎", title: "Manipulatives", description: "Drag objects to solve problems" },
  { icon: "🤖", title: "AI Tutor", description: "Personalized math coaching" },
  { icon: "🎯", title: "Adaptive Practice", description: "Questions that match your level" },
];

export default function GigaMathPage() {
  const completed = new Set(useGamification().completed_lessons);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl font-bold">GigaMath</h1>
        <p className="mt-2 max-w-2xl text-giga-muted">
          A complete mathematics journey with counting, arithmetic, geometry, money, time, patterns, and mental math.
        </p>
      </motion.div>

      <div className="mt-6 max-w-md">
        <ProgressBar />
      </div>

      <h2 className="font-display text-2xl font-bold mt-12 mb-6">Teaching Modes</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEACHING_MODES.map((mode) => (
          <GlassCard key={mode.title}>
            <span className="text-3xl">{mode.icon}</span>
            <p className="mt-2 font-bold">{mode.title}</p>
            <p className="text-sm text-giga-muted">{mode.description}</p>
          </GlassCard>
        ))}
      </div>

      <h2 className="font-display text-2xl font-bold mt-12 mb-6">Math Lessons</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MATH_LESSONS.map((lesson, index) => {
          const done = completed.has(lesson.id);
          return (
            <motion.div key={lesson.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
              <Link href={`/learn/mathematics/${lesson.slug}`}>
                <GlassCard hover className={done ? "border-giga-green/40" : undefined}>
                  <p className="text-sm text-giga-muted">Lesson {lesson.order_index}</p>
                  <p className="font-display text-lg font-bold mt-1">{lesson.title}</p>
                  <p className="text-sm text-giga-muted mt-2">{lesson.description}</p>
                  <p className="mt-3 text-sm font-semibold text-giga-purple">
                    {done ? "✅ Completed" : `+${lesson.xp_reward} XP`}
                  </p>
                </GlassCard>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
