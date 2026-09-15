"use client";

import { Card, CardTitle, CardDescription } from "@/components/ui/card";

const GRAMMAR_TOPICS = [
  { title: "Nouns", icon: "🏠", desc: "Naming words — people, places, things", examples: ["cat", "school", "Maya"] },
  { title: "Pronouns", icon: "👤", desc: "Words that replace nouns", examples: ["I", "she", "they", "it"] },
  { title: "Verbs", icon: "🏃", desc: "Action words", examples: ["run", "read", "play", "learn"] },
  { title: "Adjectives", icon: "🌈", desc: "Describing words", examples: ["big", "happy", "blue", "fast"] },
  { title: "Tenses", icon: "⏰", desc: "Past, present, and future", examples: ["walked", "walks", "will walk"] },
  { title: "Sentences", icon: "✏️", desc: "Building complete sentences", examples: ["The cat sat on the mat."] },
];

export default function GrammarPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-3xl font-bold">Grammar Foundations</h1>
      <p className="mt-2 text-giga-muted">Level 8 — Learn the building blocks of English</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {GRAMMAR_TOPICS.map((topic) => (
          <Card key={topic.title} hover gradient>
            <span className="text-4xl">{topic.icon}</span>
            <CardTitle className="mt-3">{topic.title}</CardTitle>
            <CardDescription>{topic.desc}</CardDescription>
            <div className="mt-4 flex flex-wrap gap-2">
              {topic.examples.map((ex) => (
                <span key={ex} className="rounded-lg bg-giga-teal/10 px-3 py-1 text-sm font-medium text-giga-teal">
                  {ex}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
