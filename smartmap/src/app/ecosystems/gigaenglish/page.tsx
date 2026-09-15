"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

const ENGLISH_MODULES = [
  { href: "/gigaphonics", icon: "🔤", title: "GigaPhonics", description: "Phonics sounds, blending, and pronunciation" },
  { href: "/learn?level=alphabet", icon: "🅰️", title: "Alphabet Adventure", description: "Letter tracing, sounds, and recognition" },
  { href: "/vocabulary", icon: "📚", title: "Vocabulary Builder", description: "Flashcards, sight words, and word categories" },
  { href: "/stories", icon: "📖", title: "Reading Champion", description: "Guided reading and interactive stories" },
  { href: "/grammar", icon: "✏️", title: "Grammar Foundations", description: "Nouns, verbs, tenses, and sentence building" },
  { href: "/learn?level=semantics", icon: "💡", title: "Semantics & Meaning", description: "Context clues and comprehension" },
  { href: "/learn?level=tone", icon: "🎭", title: "Tone & Expression", description: "Storytelling expression and voice" },
  { href: "/ai-tutor", icon: "🤖", title: "AI English Tutor", description: "Reading coach, pronunciation, and speaking practice" },
];

export default function GigaEnglishPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-giga-purple hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-5xl">📖</span>
        <h1 className="font-display mt-4 text-3xl font-bold sm:text-4xl">GigaEnglish</h1>
        <p className="mt-2 text-giga-muted max-w-2xl">
          Reading, phonics, vocabulary, grammar, writing, comprehension, pronunciation, storytelling, listening, and public speaking.
        </p>
      </motion.div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ENGLISH_MODULES.map((mod, i) => (
          <motion.div key={mod.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link href={mod.href}>
              <Card hover className="h-full">
                <span className="text-4xl">{mod.icon}</span>
                <CardTitle className="mt-3">{mod.title}</CardTitle>
                <CardDescription>{mod.description}</CardDescription>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
