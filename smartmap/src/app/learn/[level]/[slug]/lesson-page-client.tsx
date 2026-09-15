"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LetterTracing } from "@/components/learning/letter-tracing";
import { PhonicsCard, BlendingActivity } from "@/components/learning/phonics-card";
import { FlashcardDeck } from "@/components/learning/flashcard";
import { CelebrationEffect, XPBadge } from "@/components/gamification/progress-bar";
import { MathActivityRenderer, VoicePracticePanel } from "@/components/learning/math-activity-renderer";
import { LESSONS, STORIES, VOCABULARY_CATEGORIES, CVC_WORDS, PHONICS_SOUNDS } from "@/content/curriculum";
import { useAppStore, useGamification } from "@/stores/app-store";
import { saveLocalProgress } from "@/lib/offline/db";
import { speak } from "@/lib/speech";
import { getNextCurriculumLesson, getNextLessonAfterCompletion } from "@/lib/learning-path/next-lesson";
import { useLessonNavigation } from "@/hooks/use-lesson-navigation";
import { cacheLessonForOffline } from "@/lib/offline/lesson-cache";
import { Volume2, Download } from "lucide-react";
import type { LearningLevel } from "@/types";

export function LessonPageClient({
  level,
  slug,
}: {
  level: string;
  slug: string;
}) {
  const router = useRouter();
  const lesson = LESSONS.find((l) => l.level === level && l.slug === slug);
  const gamification = useGamification();
  const [celebrate, setCelebrate] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [tracingDone, setTracingDone] = useState(false);
  const { completeLesson, addCoins } = useAppStore();
  const { nextTarget, isAdvancing, scheduleAutoAdvance } = useLessonNavigation();

  if (!lesson) notFound();

  const nextInLevel = getNextCurriculumLesson(lesson.id, lesson.level as LearningLevel);
  const nextAnywhere = getNextLessonAfterCompletion(lesson.id, lesson.level as LearningLevel, gamification);
  const nextLesson = nextInLevel ?? nextAnywhere;

  const handleComplete = async () => {
    if (completed) return;
    setCompleted(true);
    setCelebrate(true);
    completeLesson(lesson.id, lesson.level, lesson.xp_reward);
    addCoins(lesson.coin_reward);

    await saveLocalProgress({
      id: crypto.randomUUID(),
      user_id: "local-user",
      lesson_id: lesson.id,
      level: lesson.level,
      completed: true,
      score: 100,
      time_spent_seconds: lesson.duration_minutes * 60,
      completed_at: new Date().toISOString(),
      synced: false,
    });

    scheduleAutoAdvance(nextLesson, `/learn?level=${level}`);
    setTimeout(() => setCelebrate(false), 3000);
  };

  const renderActivity = () => {
    switch (lesson.level) {
      case "alphabet": {
        const letter =
          (lesson.content.activities.find((a) => a.type === "tracing")?.data.letter as string) ?? "A";
        const word = lesson.content.activities.find((a) => a.type === "matching")?.data
          .word as string | undefined;
        const emoji = lesson.content.activities.find((a) => a.type === "matching")?.data
          .emoji as string | undefined;
        return (
          <div className="space-y-10">
            <LetterTracing
              letter={letter}
              onComplete={() => {
                setTracingDone(true);
                if (word) speak(word);
              }}
            />
            {word && tracingDone && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
                <span className="text-7xl block">{emoji}</span>
                <p className="text-2xl font-bold font-display">{word}</p>
                <Button type="button" variant="secondary" onClick={() => speak(word)}>
                  <Volume2 className="h-4 w-4" /> Hear &ldquo;{word}&rdquo;
                </Button>
                <Button size="lg" onClick={handleComplete}>Complete Letter 🎉</Button>
              </motion.div>
            )}
          </div>
        );
      }
      case "mathematics":
        return (
          <MathActivityRenderer
            activities={lesson.content.activities}
            lessonId={lesson.id}
            onComplete={handleComplete}
          />
        );
      case "phonics":
        return (
          <div className="space-y-12">
            <PhonicsCard {...PHONICS_SOUNDS[0]} />
            <BlendingActivity {...CVC_WORDS[0]} onComplete={handleComplete} />
            <VoicePracticePanel prompt={`Say the word ${CVC_WORDS[0].word}`} />
          </div>
        );
      case "vocabulary":
        return (
          <FlashcardDeck
            cards={VOCABULARY_CATEGORIES[0].words.map((w) => ({
              word: w.word,
              meaning: w.meaning,
              image: w.image,
              synonym: "synonym" in w ? w.synonym : undefined,
              antonym: "antonym" in w ? w.antonym : undefined,
            }))}
            onComplete={handleComplete}
          />
        );
      case "reading": {
        const story = STORIES.find((s) => s.id === "leo-the-lion");
        return story ? (
          <div className="max-w-2xl mx-auto">
            <span className="text-6xl block text-center mb-6">{story.illustration}</span>
            <h2 className="font-display text-2xl font-bold text-center mb-6">{story.title}</h2>
            <div className="prose dark:prose-invert whitespace-pre-line text-lg leading-relaxed">
              {story.content}
            </div>
          </div>
        ) : null;
      }
      default:
        return (
          <div className="text-center py-12">
            <span className="text-6xl">📚</span>
            <p className="mt-4 text-giga-muted">Complete this lesson to continue your learning path.</p>
          </div>
        );
    }
  };

  const showManualComplete =
    !completed &&
    lesson.level !== "phonics" &&
    lesson.level !== "mathematics" &&
    lesson.level !== "vocabulary" &&
    lesson.level !== "alphabet";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <CelebrationEffect show={celebrate} />

      <Link href={`/learn?level=${level}`} className="inline-flex items-center gap-2 text-giga-purple font-semibold hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to lessons
      </Link>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">{lesson.title}</h1>
          <p className="mt-2 text-giga-muted">{lesson.description}</p>
          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <XPBadge amount={lesson.xp_reward} />
            <span className="text-sm text-giga-muted">⏱ {lesson.duration_minutes} min</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                cacheLessonForOffline(lesson.id, { title: lesson.title, level: lesson.level, slug: lesson.slug, content: lesson.content });
                setDownloaded(true);
              }}
            >
              <Download className="h-4 w-4" /> {downloaded ? "Saved offline" : "Download for offline"}
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-giga-border bg-white p-6 sm:p-10 dark:bg-giga-surface dark:border-giga-border-dark">
          {renderActivity()}
        </div>

        {showManualComplete && (
          <div className="mt-8 text-center">
            <Button size="lg" onClick={handleComplete}>
              Complete Lesson 🎉
            </Button>
          </div>
        )}

        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 flex flex-col items-center gap-3 rounded-2xl bg-giga-green/10 p-6 text-giga-green font-bold text-xl"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8" />
              Lesson Complete! +{lesson.xp_reward} XP earned
            </div>
            {isAdvancing && nextTarget && (
              <p className="text-sm text-giga-muted font-normal">Moving to {nextTarget.title}…</p>
            )}
            {!isAdvancing && nextLesson && (
              <Button variant="outline" onClick={() => router.push(nextLesson.href)}>
                Continue to {nextLesson.title} →
              </Button>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
