"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

const MATH_METHODS = [
  { icon: "🤖", title: "AI Tutoring", description: "Step-by-step guidance from the AI math tutor" },
  { icon: "🎤", title: "Voice Interaction", description: "Speak answers and practice mental math aloud" },
  { icon: "🎵", title: "Songs & Rhymes", description: "Learn counting and operations through music" },
  { icon: "📖", title: "Storytelling", description: "Real-life math stories and word problems" },
  { icon: "🎮", title: "Educational Games", description: "Interactive quizzes and number challenges" },
  { icon: "🧩", title: "Virtual Manipulatives", description: "Drag-and-drop counting and arithmetic tools" },
];

export default function GigaMathEcosystemPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-giga-purple hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-5xl">🔢</span>
        <h1 className="font-display mt-4 text-3xl font-bold sm:text-4xl">GigaMath</h1>
        <p className="mt-2 text-giga-muted max-w-2xl">
          Counting, arithmetic, fractions, geometry, measurement, algebra, statistics, and mental mathematics.
        </p>
        <Link href="/gigamath" className="mt-4 inline-block rounded-xl bg-gradient-to-r from-giga-yellow to-giga-orange px-6 py-3 font-bold text-white hover:opacity-90 transition-opacity">
          Start GigaMath Lessons →
        </Link>
      </motion.div>

      <h2 className="font-display text-2xl font-bold mt-12 mb-6">Learning Methods</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MATH_METHODS.map((method, i) => (
          <motion.div key={method.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="h-full">
              <span className="text-4xl">{method.icon}</span>
              <CardTitle className="mt-3">{method.title}</CardTitle>
              <CardDescription>{method.description}</CardDescription>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
