"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { speak } from "@/lib/speech";
import { Volume2, Mic } from "lucide-react";

export function MathActivityRenderer({
  activities,
  lessonId,
  onComplete,
}: {
  activities: Array<{ id: string; type: string; title: string; data: Record<string, unknown> }>;
  lessonId: string;
  onComplete: () => void;
}) {
  const [activityIndex, setActivityIndex] = useState(0);
  const activity = activities[activityIndex];

  if (!activity) return null;

  const advance = () => {
    if (activityIndex < activities.length - 1) {
      setActivityIndex((index) => index + 1);
      return;
    }
    onComplete();
  };

  const data = activity.data;
  const mathType = (data.mathType as string) ?? activity.type;

  if (mathType === "counting" || (activity.type === "matching" && data.range)) {
    const [min, max] = (data.range as [number, number]) ?? [1, 5];
    const seed = lessonId.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const target = min + (seed % (max - min + 1));
    const emoji = (data.emoji as string) ?? "⭐";
    return (
      <div className="text-center space-y-6">
        <p className="text-xl text-giga-muted">{activity.title}</p>
        <motion.div className="flex flex-wrap justify-center gap-2 text-4xl" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          {Array.from({ length: target }, (_, i) => (
            <span key={i}>{emoji}</span>
          ))}
        </motion.div>
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
            <Button key={n} variant="secondary" size="lg" onClick={() => n === target && advance()}>
              {n}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (mathType === "drag-add") {
    const a = data.a as number;
    const b = data.b as number;
    const answer = data.answer as number;
    const emoji = (data.emoji as string) ?? "🍎";
    return (
      <div className="space-y-6 text-center">
        <p className="text-xl font-display">{activity.title}</p>
        <div className="flex justify-center gap-8">
          <div className="glass-panel rounded-2xl p-4">
            <p className="text-sm text-giga-muted mb-2">Group A</p>
            <div className="flex gap-1 text-3xl">{Array.from({ length: a }, (_, i) => <span key={i}>{emoji}</span>)}</div>
          </div>
          <div className="glass-panel rounded-2xl p-4">
            <p className="text-sm text-giga-muted mb-2">Group B</p>
            <div className="flex gap-1 text-3xl">{Array.from({ length: b }, (_, i) => <span key={`b-${i}`}>{emoji}</span>)}</div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {[answer - 1, answer, answer + 1, answer + 2].filter((n) => n > 0).map((option) => (
            <Button key={option} variant="secondary" onClick={() => option === answer && advance()}>
              {option}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (mathType === "sing" || mathType === "listening") {
    const rhyme = (data.rhyme as string) ?? "One, two, buckle my shoe";
    return (
      <div className="text-center space-y-6">
        <p className="text-2xl font-display">{rhyme}</p>
        <Button variant="secondary" onClick={() => speak(rhyme)}>
          <Volume2 className="h-4 w-4" /> Sing along
        </Button>
        <Button onClick={advance}>I practiced! 🎵</Button>
      </div>
    );
  }

  if (data.answer !== undefined) {
    const answer = data.answer as number | string;
    const a = data.a as number | undefined;
    const b = data.b as number | undefined;
    const operation = (data.operation as string) ?? (mathType === "subtraction" ? "-" : mathType === "multiplication" ? "×" : mathType === "division" ? "÷" : "+");
    const prompt =
      mathType === "number-recognition"
        ? `Pick the number ${data.target}`
        : mathType === "geometry"
          ? `How many sides does a ${data.shape} have?`
          : mathType === "pattern"
            ? `${(data.sequence as number[]).join(", ")}, ?`
            : mathType === "logic"
              ? activity.title
              : mathType === "decimal"
                ? `What is ${data.value}?`
                : mathType === "money"
                  ? `Total coins: ${(data.coins as number[]).join(" + ")}`
                  : mathType === "time"
                    ? `What time is shown?`
                    : mathType === "place-value"
                      ? activity.title
                      : a != null && b != null
                        ? `${a} ${operation} ${b} = ?`
                        : activity.title;

    const numericAnswer = typeof answer === "number" ? answer : undefined;
    const options =
      mathType === "number-recognition"
        ? (data.options as number[])
        : numericAnswer != null
          ? [...new Set([numericAnswer, numericAnswer + 1, Math.max(1, numericAnswer - 1), numericAnswer + 2])].sort((x, y) => x - y)
          : [String(answer), "one half", "two", "three"];

    return (
      <div className="text-center space-y-6">
        <p className="text-3xl font-display font-bold">{prompt}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {options.map((option) => (
            <Button
              key={String(option)}
              size="lg"
              variant="secondary"
              onClick={() => {
                const isCorrect = numericAnswer != null ? option === numericAnswer : option === answer;
                if (isCorrect) advance();
              }}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <p className="text-giga-muted">{activity.title}</p>
      <Button className="mt-4" onClick={advance}>Continue</Button>
    </div>
  );
}

export function VoicePracticePanel({
  prompt,
  onComplete,
}: {
  prompt: string;
  onComplete?: () => void;
}) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleListen = () => speak(prompt);
  const handlePractice = () => {
    setFeedback("Great effort! Keep practicing your pronunciation. 🎤");
    onComplete?.();
  };

  return (
    <div className="glass-panel rounded-3xl p-6 text-center space-y-4">
      <Mic className="mx-auto h-10 w-10 text-giga-purple" />
      <p className="text-xl font-display">{prompt}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="secondary" onClick={handleListen}>
          <Volume2 className="h-4 w-4" /> Listen
        </Button>
        <Button onClick={handlePractice}>I said it!</Button>
      </div>
      {feedback && <p className="text-giga-green font-semibold">{feedback}</p>}
    </div>
  );
}
