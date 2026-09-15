"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PhonicsCard, BlendingActivity } from "@/components/learning/phonics-card";
import { ProgressBar } from "@/components/gamification/progress-bar";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PHONICS_SOUNDS, CVC_WORDS } from "@/content/curriculum";

const TABS = ["Sounds", "Blending", "CVC Words", "Practice"] as const;

export default function GigaPhonicsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Sounds");
  const [soundIndex, setSoundIndex] = useState(0);
  const [cvcIndex, setCvcIndex] = useState(0);
  const [advanceHint, setAdvanceHint] = useState<string | null>(null);

  const advanceSound = useCallback(() => {
    if (soundIndex < PHONICS_SOUNDS.length - 1) {
      setAdvanceHint(`Moving to ${PHONICS_SOUNDS[soundIndex + 1].grapheme}...`);
      setTimeout(() => {
        setSoundIndex((i) => i + 1);
        setAdvanceHint(null);
      }, 1800);
    } else {
      setAdvanceHint("Great work! Moving to Blending...");
      setTimeout(() => {
        setTab("Blending");
        setAdvanceHint(null);
      }, 2000);
    }
  }, [soundIndex]);

  const advanceCvc = useCallback(() => {
    if (cvcIndex < CVC_WORDS.length - 1) {
      setCvcIndex((i) => i + 1);
    } else {
      setAdvanceHint("All words blended! Explore CVC Words...");
      setTimeout(() => {
        setTab("CVC Words");
        setAdvanceHint(null);
      }, 2000);
    }
  }, [cvcIndex]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <span className="text-5xl">🔤</span>
          <h1 className="font-display mt-4 text-4xl font-bold text-gradient">GigaPhonics</h1>
          <p className="mt-2 text-giga-muted max-w-xl mx-auto">
            Master phonics sounds, blending, digraphs, trigraphs, and CVC words with interactive audio-guided lessons
          </p>
        </div>

        <div className="max-w-md mx-auto mb-8">
          <ProgressBar />
        </div>

        {advanceHint && (
          <p className="text-center text-sm font-bold text-giga-purple mb-4" role="status">{advanceHint}</p>
        )}

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl px-5 py-3 font-bold min-h-[48px] transition-all ${
                tab === t
                  ? "bg-gradient-to-r from-giga-orange to-giga-yellow text-white shadow-lg"
                  : "bg-white border border-giga-border text-giga-muted hover:border-giga-orange dark:bg-giga-surface"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Sounds" && (
          <div className="space-y-8">
            <PhonicsCard {...PHONICS_SOUNDS[soundIndex]} onMastered={advanceSound} />
            <div className="flex justify-center gap-3 flex-wrap">
              {PHONICS_SOUNDS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setSoundIndex(i)}
                  className={`rounded-xl px-4 py-2 font-bold min-h-[44px] ${
                    i === soundIndex ? "bg-giga-purple text-white" : "bg-giga-purple/10 text-giga-purple"
                  }`}
                >
                  {s.grapheme}
                </button>
              ))}
            </div>
            <div className="text-center">
              <Button variant="outline" onClick={advanceSound}>Skip to next sound →</Button>
            </div>
          </div>
        )}

        {tab === "Blending" && (
          <BlendingActivity
            key={CVC_WORDS[cvcIndex].word}
            {...CVC_WORDS[cvcIndex]}
            onComplete={advanceCvc}
          />
        )}

        {tab === "CVC Words" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CVC_WORDS.map((word) => (
              <Card key={word.word} hover className="text-center">
                <span className="text-4xl">{word.image}</span>
                <CardTitle className="mt-3 font-display text-2xl">{word.word}</CardTitle>
                <CardDescription>{word.phonemes.join(" - ")}</CardDescription>
              </Card>
            ))}
            <div className="sm:col-span-2 lg:col-span-4 text-center mt-4">
              <Link href="/learn?level=phonics">
                <Button>Continue to Phonics Lessons →</Button>
              </Link>
            </div>
          </div>
        )}

        {tab === "Practice" && (
          <div className="grid gap-6 sm:grid-cols-2">
            <Link href="/ai-tutor?feature=pronunciation">
              <Card hover gradient>
                <CardTitle>🎤 Pronunciation</CardTitle>
                <CardDescription>Speak and get instant AI feedback</CardDescription>
              </Card>
            </Link>
            <Link href="/learn?level=phonics">
              <Card hover gradient>
                <CardTitle>📖 Reading Practice</CardTitle>
                <CardDescription>Blend sounds to read full lessons</CardDescription>
              </Card>
            </Link>
            <Link href="/ai-tutor?feature=quiz_generator">
              <Card hover gradient>
                <CardTitle>❓ Phonics Quiz</CardTitle>
                <CardDescription>AI-generated phonics practice quizzes</CardDescription>
              </Card>
            </Link>
            <Link href="/stories">
              <Card hover gradient>
                <CardTitle>📚 Story Time</CardTitle>
                <CardDescription>Read stories aloud with phonics practice</CardDescription>
              </Card>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
