"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { STORIES } from "@/content/curriculum";
import { speak } from "@/lib/speech";

export default function StoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Interactive Stories</h1>
      <p className="mt-2 text-giga-muted">Guided reading with narration and comprehension</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {STORIES.map((story, i) => (
          <motion.div key={story.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card hover gradient className="h-full flex flex-col">
              <span className="text-5xl">{story.illustration}</span>
              <CardTitle className="mt-4">{story.title}</CardTitle>
              <CardDescription>{story.word_count} words • {story.age_group}</CardDescription>
              <p className="mt-4 text-sm text-giga-muted line-clamp-4 flex-1">{story.content.slice(0, 120)}...</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => speak(story.content)}>
                  <Volume2 className="h-4 w-4" /> Listen
                </Button>
                <Link href={`/learn/reading/${story.id === "leo-the-lion" ? "leo-story" : "leo-story"}`}>
                  <Button size="sm">Read</Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
