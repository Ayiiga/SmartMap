"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const FUNCTIONAL_GAMES = [
  {
    href: "/learn?level=alphabet",
    icon: "🎯",
    title: "Letter Match",
    description: "Match letters to pictures in Alphabet Adventure",
  },
  {
    href: "/gigaphonics",
    icon: "🔊",
    title: "Sound Blender",
    description: "Blend sounds to make words in GigaPhonics",
  },
  {
    href: "/vocabulary",
    icon: "🔍",
    title: "Word Hunt",
    description: "Find and learn sight words with flashcards",
  },
  {
    href: "/stories",
    icon: "❓",
    title: "Story Quiz",
    description: "Read stories and test comprehension",
  },
  {
    href: "/learn?level=rhythm",
    icon: "🎵",
    title: "Rhyme Time",
    description: "Practice rhyming words and rhythm",
  },
  {
    href: "/gigamath",
    icon: "🔢",
    title: "Number Ninja",
    description: "Quick counting and arithmetic challenges",
  },
];

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-giga-purple hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <h1 className="font-display text-3xl font-bold">Learning Games</h1>
      <p className="mt-2 text-giga-muted">Play educational games linked to real lessons — works offline too!</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FUNCTIONAL_GAMES.map((game, i) => (
          <motion.div
            key={game.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={game.href}>
              <Card hover className="h-full">
                <span className="text-5xl">{game.icon}</span>
                <CardTitle className="mt-4">{game.title}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/learn" className="text-giga-purple font-bold hover:underline">
          Explore structured lessons →
        </Link>
      </div>
    </div>
  );
}
