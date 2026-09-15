"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Mic, Bot, ChevronRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak, SpeechRecognizer } from "@/lib/speech";
import { cn } from "@/lib/utils";
import type { EcosystemLesson, EcosystemStep } from "@/content/ecosystem-lessons";
import Link from "next/link";

function DiagramStep({ step, onDone }: { step: EcosystemStep; onDone: () => void }) {
  const parts = (step.data?.parts as string[]) ?? [];
  const emoji = (step.data?.emoji as string) ?? "📊";
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const reveal = (i: number) => {
    const next = new Set(revealed);
    next.add(i);
    setRevealed(next);
    if (next.size === parts.length) setTimeout(onDone, 600);
  };

  return (
    <div className="space-y-4">
      <p className="text-giga-muted">{step.content}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {parts.map((part, i) => (
          <button
            key={part}
            type="button"
            onClick={() => reveal(i)}
            className={cn(
              "rounded-2xl border p-4 text-left transition min-h-[64px]",
              revealed.has(i) ? "border-giga-green bg-giga-green/10" : "border-giga-border hover:border-giga-purple",
            )}
          >
            <span className="text-2xl mr-2">{emoji}</span>
            <span className="font-semibold">{part}</span>
            {revealed.has(i) && <CheckCircle className="inline h-4 w-4 ml-2 text-giga-green" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function QuizStep({ step, onDone }: { step: EcosystemStep; onDone: () => void }) {
  const question = (step.data?.question as string) ?? step.content;
  const options = (step.data?.options as string[]) ?? [];
  const answer = (step.data?.answer as number) ?? 0;
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <p className="font-display text-xl font-bold">{question}</p>
      <div className="grid gap-2">
        {options.map((opt, i) => (
          <Button
            key={opt}
            variant={selected === i ? (i === answer ? "primary" : "outline") : "secondary"}
            className={cn("justify-start", selected !== null && i === answer && "ring-2 ring-giga-green")}
            onClick={() => {
              if (selected !== null) return;
              setSelected(i);
              setTimeout(onDone, i === answer ? 800 : 1200);
            }}
          >
            {opt}
          </Button>
        ))}
      </div>
      {selected !== null && selected !== answer && (
        <p className="text-sm text-giga-orange">Good try! The answer is {options[answer]}.</p>
      )}
    </div>
  );
}

function SimulationStep({ step, onDone }: { step: EcosystemStep; onDone: () => void }) {
  const planets = (step.data?.planets as string[]) ?? [];
  const colours = (step.data?.colours as string[]) ?? ["Red", "Blue", "Yellow"];
  const mixes = (step.data?.mixes as Record<string, string>) ?? {};
  const [picked, setPicked] = useState<string[]>([]);

  if (planets.length > 0) {
    return (
      <div className="text-center space-y-4">
        <p className="text-giga-muted">{step.content}</p>
        <motion.div className="flex justify-center gap-3 text-4xl" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }}>
          <span>☀️</span>
          {planets.map((p) => <span key={p} title={p}>🪐</span>)}
        </motion.div>
        <Button onClick={onDone}>I watched the orbits! 🚀</Button>
      </div>
    );
  }

  if (Object.keys(mixes).length > 0) {
    const mixKey = picked.length === 2 ? [...picked].sort().join("+") : "";
    const result = mixes[mixKey];
    return (
      <div className="space-y-4">
        <p className="text-giga-muted">{step.content}</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {colours.map((c) => (
            <Button key={c} variant={picked.includes(c) ? "primary" : "secondary"} onClick={() => {
              setPicked((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : prev.length < 2 ? [...prev, c] : [c]);
            }}>{c}</Button>
          ))}
        </div>
        {result && (
          <motion.p initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center text-2xl font-bold text-giga-purple">
            {picked.join(" + ")} = {result} 🎨
          </motion.p>
        )}
        {result && <Button onClick={onDone} className="w-full">Continue</Button>}
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <p className="text-giga-muted">{step.content}</p>
      <div className="rounded-2xl bg-giga-purple/10 p-8 text-5xl">🎮</div>
      <Button onClick={onDone}>Simulation complete!</Button>
    </div>
  );
}

export function EcosystemLessonPlayer({
  lesson,
  onComplete,
  nextHref,
  nextTitle,
}: {
  lesson: EcosystemLesson;
  onComplete: () => void;
  nextHref?: string | null;
  nextTitle?: string | null;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const step = lesson.steps[stepIndex];

  const advance = useCallback(() => {
    if (stepIndex < lesson.steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      setFinished(true);
      onComplete();
    }
  }, [stepIndex, lesson.steps.length, onComplete]);

  if (!step) return null;

  const renderStep = () => {
    switch (step.type) {
      case "intro":
      case "project":
        return (
          <div className="space-y-4">
            <p className="text-lg leading-relaxed">{step.content}</p>
            <AutoContinueButton onAdvance={advance} />
          </div>
        );
      case "diagram":
        return <DiagramStep step={step} onDone={advance} />;
      case "quiz":
        return <QuizStep step={step} onDone={advance} />;
      case "simulation":
      case "game":
        return <SimulationStep step={step} onDone={advance} />;
      case "voice":
        return (
          <div className="space-y-4 text-center">
            <p className="text-lg">{step.content}</p>
            <Button variant="secondary" onClick={() => speak(step.content)}><Volume2 className="h-4 w-4" /> Listen</Button>
            <Button onClick={() => {
              if (!SpeechRecognizer.isSupported()) { advance(); return; }
              const r = new SpeechRecognizer();
              r.start(() => advance(), () => advance());
            }}><Mic className="h-4 w-4" /> Practice speaking</Button>
            <Button variant="outline" onClick={advance}>Skip</Button>
          </div>
        );
      case "song":
        return (
          <div className="space-y-4 text-center">
            <p className="text-xl font-display">{(step.data?.rhyme as string) ?? step.content}</p>
            <Button variant="secondary" onClick={() => speak((step.data?.rhyme as string) ?? step.content)}><Volume2 className="h-4 w-4" /> Sing along</Button>
            <Button onClick={advance}>I sang it! 🎵</Button>
          </div>
        );
      case "ai-explain":
        return (
          <div className="space-y-4">
            <p className="text-giga-muted">{step.content}</p>
            <Link href={`/ai-tutor?feature=${step.data?.aiFeature === "science_lab" ? "science_lab" : step.data?.aiFeature ?? "recommendations"}`}>
              <Button><Bot className="h-4 w-4" /> Open AI Assistant</Button>
            </Link>
            <Button variant="outline" onClick={advance}>I explored the AI — continue</Button>
          </div>
        );
      default:
        return <Button onClick={advance}>Continue</Button>;
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm text-giga-muted">
        <span>Step {stepIndex + 1} of {lesson.steps.length}</span>
        <span>{lesson.topic}</span>
      </div>
      <div className="mb-2 h-2 rounded-full bg-giga-border overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-giga-purple to-giga-blue"
          animate={{ width: `${((stepIndex + (finished ? 1 : 0)) / lesson.steps.length) * 100}%` }}
        />
      </div>
      <h2 className="font-display text-2xl font-bold mb-4">{step.title}</h2>
      <AnimatePresence mode="wait">
        <motion.div key={step.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
          {renderStep()}
        </motion.div>
      </AnimatePresence>
      {finished && nextHref && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center text-giga-purple font-bold">
          Moving to {nextTitle ?? "next lesson"}…
        </motion.p>
      )}
    </div>
  );
}

function AutoContinueButton({ onAdvance, delayMs = 2500 }: { onAdvance: () => void; delayMs?: number }) {
  const [seconds, setSeconds] = useState(Math.ceil(delayMs / 1000));

  useEffect(() => {
    const tick = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    const done = setTimeout(onAdvance, delayMs);
    return () => { clearInterval(tick); clearTimeout(done); };
  }, [onAdvance, delayMs]);

  return (
    <div className="space-y-2">
      <Button onClick={onAdvance}>Continue now <ChevronRight className="h-4 w-4" /></Button>
      <p className="text-xs text-giga-muted">Auto-continuing in {seconds}s...</p>
    </div>
  );
}
