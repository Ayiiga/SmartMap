"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import {
  CONCRETE_OBJECTS,
  GIGA_LESSONS,
  GIGA_LEVELS,
  GIGA_MODES,
  GIGA_SUBJECTS,
  GIGA_VOICES,
} from "@/lib/learning/gigaLearn";
import { TeleprompterOverlay } from "@/components/studio/TeleprompterOverlay";
import { cn } from "@/lib/utils";

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(text.slice(0, 500));
  utter.lang = "ak-GH";
  utter.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export default function GigaLearnPage() {
  const [level, setLevel] = useState("all");
  const [subject, setSubject] = useState("all");
  const [voiceId, setVoiceId] = useState("abena-twi");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [teleprompter, setTeleprompter] = useState(false);
  const [matchPicked, setMatchPicked] = useState<string | null>(null);

  const lessons = useMemo(
    () =>
      GIGA_LESSONS.filter(
        (l) =>
          (level === "all" || l.levelId === level) &&
          (subject === "all" || l.subjectId === subject),
      ),
    [level, subject],
  );

  const kgPreview = GIGA_LESSONS.find((l) => l.id === "kg1-fruits-count");
  const fruits = [...CONCRETE_OBJECTS.fruits];
  const voice = GIGA_VOICES.find((v) => v.id === voiceId) ?? GIGA_VOICES[0];

  return (
    <div className="gigalearn-page mx-auto w-full max-w-5xl px-4 pb-[72px] pt-6">
      <header>
        <h1 className="text-[24px] font-extrabold text-black dark:text-white">
          GigaLearn <span aria-hidden="true">🇬🇭</span>
        </h1>
        <p className="text-[11px] text-[#6B7280]">
          Ghana GES Curriculum · All Levels · African Voiceovers
        </p>
      </header>

      <div className="relative mt-4">
        <div className="scrollbar-none flex gap-1.5 overflow-x-auto" role="tablist" aria-label="Levels">
          {GIGA_LEVELS.map((l) => (
            <button
              key={l.id}
              role="tab"
              aria-selected={level === l.id}
              onClick={() => setLevel(l.id)}
              title={l.ageRange}
              className={cn(
                "min-h-[44px] shrink-0 rounded-full px-3 text-[12px] font-semibold",
                level === l.id ? "bg-[#EAB308] font-bold text-black" : "bg-[#F3F4F6] text-[#374151]",
              )}
            >
              {l.icon} {l.label}
            </button>
          ))}
        </div>
        <span className="giga3-fade-right" aria-hidden="true" />
      </div>

      <div className="scrollbar-none mt-2 flex gap-1.5 overflow-x-auto" aria-label="Subjects">
        {GIGA_SUBJECTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSubject(s.id)}
            aria-pressed={subject === s.id}
            className={cn(
              "min-h-[44px] shrink-0 rounded-full border px-3 text-[12px] font-semibold",
              subject === s.id
                ? "border-black bg-white font-bold text-black"
                : "border-[#E5E7EB] bg-white text-[#374151]",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <h2 className="mb-2 mt-5 text-[14px] font-bold text-black dark:text-white">Learning Modes</h2>
      <div className="grid grid-cols-2 gap-2">
        {GIGA_MODES.map((m) => (
          <div key={m.id} className="rounded-[20px] bg-[#1A233A] p-4 text-white">
            <p className="text-xl" aria-hidden="true">{m.icon}</p>
            <p className="mt-1 text-[13px] font-bold">{m.label}</p>
            <p className="truncate text-[11px] text-slate-300">{m.subtitle}</p>
            {m.badge && (
              <span
                className={cn(
                  "mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                  m.badgeTone === "yellow" && "bg-[#EAB308] text-black",
                  m.badgeTone === "green" && "bg-[#22c55e] text-white",
                  m.badgeTone === "red" && "bg-[#ef4444] text-white",
                  m.badgeTone === "outline" && "border border-[#EAB308] text-[#EAB308]",
                  !m.badgeTone && "bg-white/15 text-white",
                )}
              >
                {m.live && <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />}
                {m.badge}
              </span>
            )}
          </div>
        ))}
      </div>

      <h2 className="mb-2 mt-5 text-[14px] font-bold text-black dark:text-white">African Voiceovers</h2>
      <div className="scrollbar-none flex gap-2 overflow-x-auto" aria-label="African voiceovers">
        {GIGA_VOICES.map((v) => (
          <button
            key={v.id}
            onClick={() => {
              setVoiceId(v.id);
              speak(`${v.name}. Welcome to GigaLearn.`);
            }}
            aria-pressed={voiceId === v.id}
            className={cn(
              "w-[150px] shrink-0 rounded-[16px] p-3 text-left",
              voiceId === v.id ? "bg-[#EAB308] text-black" : "bg-[#1A233A] text-white",
            )}
          >
            <span className="flex items-center justify-between">
              <span className="text-[12px] font-bold">{v.name}</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EAB308] text-black" aria-hidden="true">
                <Play className="ml-0.5 h-3 w-3" />
              </span>
            </span>
            <span className={cn("mt-0.5 block text-[11px]", voiceId === v.id ? "text-black/70" : "text-slate-300")}>
              {v.flag} {v.language} · sample &lt;2s
            </span>
          </button>
        ))}
      </div>

      <h2 className="mb-2 mt-5 text-[14px] font-bold text-black dark:text-white">GES Curriculum</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          { title: "BECE 2015–2024", sub: "Maths 10-question packs", href: "/learn?level=mathematics" },
          { title: "WASSCE Core", sub: "English + Core drills", href: "/learn" },
          { title: "KG Kooko", sub: "Rhymes Twi/English + songs", href: "/gigalearn" },
          { title: "Primary Ananse", sub: "Poems + stories", href: "/learn" },
          { title: "JHS RME", sub: "Festivals practice", href: "/learn" },
          { title: "SHS Electives", sub: "Functions + sciences", href: "/learn" },
        ].map((c) => (
          <Link key={c.title} href={c.href} className="rounded-2xl border border-[#E5E7EB] bg-white p-3">
            <p className="text-[13px] font-bold text-black">{c.title}</p>
            <p className="text-[11px] text-[#6B7280]">{c.sub}</p>
          </Link>
        ))}
      </div>

      {kgPreview && (level === "all" || level === "kg1") && (
        <section aria-label="KG1 lesson preview" className="mt-5 rounded-[20px] border border-[#E5E7EB] bg-white p-4">
          <p className="text-[14px] font-bold text-black">{kgPreview.title}</p>
          <p className="text-[11px] text-[#6B7280]">Twi: “Kan maŋgo no” · Voice: Abena Twi</p>

          <div className="relative mt-3 overflow-hidden rounded-2xl bg-[#0A0F1E] p-4">
            <span className="absolute left-2 top-2 rounded-full bg-[#EAB308] px-2 py-0.5 text-[10px] font-bold text-black">
              Teleprompter · Top 25%
            </span>
            <div className="mt-6 flex items-end justify-center gap-2">
              <span className="text-[32px]" aria-hidden="true">🍎🍎🍎</span>
              <span className="pb-1 text-[14px] font-bold text-white">= 3 apples</span>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {fruits.map((f) => (
                <span key={f.name} className="rounded-xl bg-white/10 px-2 py-1 text-center">
                  <span className="block text-[32px]" aria-hidden="true">{f.emoji}</span>
                  <span className="block text-[11px] font-bold text-white">{f.name}</span>
                  <span className="block text-[11px] text-slate-300">{f.twi}</span>
                </span>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => speak("Kan maŋgo no. Three apples. Kwadu. Two bananas.")}
                className="flex min-h-[44px] items-center gap-1 rounded-full bg-[#EAB308] px-4 text-[13px] font-bold text-black"
              >
                <Play className="h-4 w-4" /> Abena Twi
              </button>
              <button
                type="button"
                onClick={() => setTeleprompter((v) => !v)}
                aria-expanded={teleprompter}
                className="min-h-[44px] rounded-full border border-white/30 px-4 text-[13px] font-bold text-white"
              >
                {teleprompter ? "Hide" : "Show"} teleprompter
              </button>
            </div>
            {teleprompter && (
              <div className="relative mt-2 min-h-[120px]">
                <TeleprompterOverlay
                  script={"🍎🍎🍎 = 3 apples.\nKan maŋgo no.\nKwadu = banana.\nCount with me: one, two, three!"}
                  isVisible
                  onClose={() => setTeleprompter(false)}
                />
              </div>
            )}
          </div>

          <h3 className="mb-1 mt-4 rounded bg-[#EAB308] px-2 py-1 text-[13px] font-bold text-black">
            Quiz · Count the fruits (5 Qs)
          </h3>
          <ol className="space-y-2">
            {(kgPreview.questions ?? []).map((q, qi) => (
              <li key={qi} className="rounded-xl border border-[#E5E7EB] p-2">
                <p className="text-[13px] font-semibold text-black">{qi + 1}. {q.q}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setQuizAnswers((a) => ({ ...a, [`${kgPreview.id}-${qi}`]: oi }))}
                      aria-pressed={quizAnswers[`${kgPreview.id}-${qi}`] === oi}
                      className={cn(
                        "min-h-[44px] rounded-full border px-3 text-[12px]",
                        quizAnswers[`${kgPreview.id}-${qi}`] === oi
                          ? oi === q.answer
                            ? "border-[#22c55e] bg-[#22c55e]/10 font-bold text-black"
                            : "border-[#ef4444] bg-[#ef4444]/10 font-bold text-black"
                          : "border-[#E5E7EB] text-[#374151]",
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ol>

          <h3 className="mb-1 mt-4 rounded bg-white px-2 py-1 text-[13px] font-bold text-black ring-1 ring-[#E5E7EB]">
            Game · Match the fruit
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {fruits.map((f) => (
              <button
                key={f.name}
                onClick={() => setMatchPicked(f.name)}
                aria-pressed={matchPicked === f.name}
                className={cn(
                  "min-h-[48px] rounded-xl border px-3 text-[20px]",
                  matchPicked === f.name ? "border-[#EAB308] bg-[#EAB308]/15" : "border-[#E5E7EB]",
                )}
                aria-label={`Match ${f.name}`}
              >
                {f.emoji}
              </button>
            ))}
          </div>
          {matchPicked && (
            <p className="mt-1 text-[12px] text-[#374151]">
              {fruits.find((f) => f.name === matchPicked)?.twi} — nice! Tap 🔊 to hear it.
            </p>
          )}

          <Link
            href={`/ai-assistant`}
            className="mt-3 flex min-h-[48px] items-center justify-center rounded-full bg-[#7C3AED] text-[14px] font-bold text-white"
          >
            Q&A · Ask the tutor
          </Link>
          <p className="mt-2 text-[11px] text-[#6B7280]">
            Offline-ready · {voice.flag} {voice.name} · {lessons.length} lesson{lessons.length === 1 ? "" : "s"} in filter
          </p>
        </section>
      )}
    </div>
  );
}
