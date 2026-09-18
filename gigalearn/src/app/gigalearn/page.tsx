"use client";

import { useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const LEVELS = [
  { id: "Creche", label: "Creche (0-2)", emoji: "🧸" },
  { id: "KG1", label: "KG1 (3-4)", emoji: "🎨" },
  { id: "KG2", label: "KG2 (4-5)", emoji: "🧩" },
  { id: "P1", label: "P1 (5-6)", emoji: "📖" },
  { id: "P2", label: "P2 (6-7)", emoji: "✏️" },
  { id: "P3", label: "P3 (7-8)", emoji: "🔢" },
  { id: "P4-P6", label: "P4-P6", emoji: "📚" },
  { id: "JHS1-3", label: "JHS1-3", emoji: "🧪" },
  { id: "SHS1-3", label: "SHS1-3", emoji: "🎓" },
  { id: "University", label: "University", emoji: "🏛️" },
  { id: "Adult", label: "Adult", emoji: "💼" },
] as const;

const LOWER_GRADES = new Set(["Creche", "KG1", "KG2", "P1", "P2", "P3"]);

type ConcreteCard = { emoji: string; title: string; subtitle: string };

const CONCRETE_GROUPS: { group: string; items: ConcreteCard[] }[] = [
  {
    group: "Fruits",
    items: [
      { emoji: "🍎", title: "Apple", subtitle: "Count 1-5 fruits" },
      { emoji: "🍌", title: "Banana", subtitle: "Count 1-5 fruits" },
      { emoji: "🍊", title: "Orange", subtitle: "Count 1-5 fruits" },
      { emoji: "🥭", title: "Mango", subtitle: "Count 1-5 fruits" },
      { emoji: "🍈", title: "Pawpaw", subtitle: "Count 1-5 fruits" },
    ],
  },
  {
    group: "Vegetables",
    items: [
      { emoji: "🥕", title: "Carrot", subtitle: "Touch & see real veg" },
      { emoji: "🥔", title: "Potato", subtitle: "Touch & see real veg" },
      { emoji: "🍅", title: "Tomato", subtitle: "Touch & see real veg" },
    ],
  },
  {
    group: "Animals",
    items: [
      { emoji: "🐕", title: "Dog", subtitle: "Hear & point real animal" },
      { emoji: "🐈", title: "Cat", subtitle: "Hear & point real animal" },
      { emoji: "🐔", title: "Chicken", subtitle: "Hear & point real animal" },
      { emoji: "🐐", title: "Goat", subtitle: "Hear & point real animal" },
    ],
  },
  {
    group: "Shapes",
    items: [
      { emoji: "⚽", title: "Ball = Circle", subtitle: "Real object shape" },
      { emoji: "📦", title: "Box = Square", subtitle: "Real object shape" },
    ],
  },
  {
    group: "Colors",
    items: [
      { emoji: "🍅", title: "Red = Tomato", subtitle: "Color from real thing" },
      { emoji: "🍌", title: "Yellow = Banana", subtitle: "Color from real thing" },
    ],
  },
  {
    group: "Body",
    items: [
      { emoji: "🤲", title: "Hands", subtitle: "Touch your hands" },
      { emoji: "👀", title: "Eyes", subtitle: "Point to your eyes" },
      { emoji: "👃", title: "Nose", subtitle: "Point to your nose" },
    ],
  },
];

const VOICES = [
  { name: "Abena", lang: "Twi", flag: "🇬🇭", detail: "Female · Ghana · slow & clear for KG" },
  { name: "Musa", lang: "Hausa", flag: "🇬🇭", detail: "Male · Ghana/Nigeria" },
  { name: "Naa", lang: "Ga", flag: "🇬🇭", detail: "Female · Accra" },
  { name: "Kofi", lang: "Ewe", flag: "🇬🇭", detail: "Male · Volta" },
  { name: "Ade", lang: "Yoruba", flag: "🇳🇬", detail: "Female · Nigeria" },
  { name: "Zawadi", lang: "Swahili", flag: "🇰🇪", detail: "Female · East Africa" },
];

const QUIZ_QUESTION = {
  prompt: "How many bananas?",
  emojis: ["🍌", "🍌", "🍌"],
  answer: 3,
  options: [2, 3, 4, 5],
};

const FRUIT_PHOTOS = [
  { emoji: "🍎", label: "Apple" },
  { emoji: "🍌", label: "Banana" },
  { emoji: "🍊", label: "Orange" },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.85;
  u.pitch = 1.05;
  window.speechSynthesis.speak(u);
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function GigaLearnLowerGradesPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>("KG1");
  const [quizPick, setQuizPick] = useState<number | null>(null);
  const [pollPick, setPollPick] = useState<string | null>(null);
  const [gamePick, setGamePick] = useState<string | null>(null);
  const [qaOpen, setQaOpen] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState<string | null>(null);

  const isLower = LOWER_GRADES.has(selectedLevel);
  const levelMeta = LEVELS.find((l) => l.id === selectedLevel);

  const lessonsForLevel = useMemo(() => {
    if (selectedLevel === "KG1") return ["KG1 Maths: Counting Fruits", "KG1 Literacy: Fruit Words", "KG1 My World: Real Things"];
    if (selectedLevel === "P2") return ["P2 Maths: Adding Oranges", "P2 English: Fruit Rhymes", "P2 Science: Real Things"];
    if (selectedLevel === "P3") return ["P3 Maths: Taking Away Mangoes", "P3 English: Ananse & Fruits", "P3 Science: Plants We Eat"];
    if (LOWER_GRADES.has(selectedLevel)) return [`${selectedLevel} Maths: Concrete Counting`, `${selectedLevel} Literacy: Real Words`, `${selectedLevel} Our World: Real Things`];
    return [`${selectedLevel} English`, `${selectedLevel} Mathematics`, `${selectedLevel} Science`, `${selectedLevel} ICT`];
  }, [selectedLevel]);

  const lessonPreview = useMemo(() => {
    if (selectedLevel === "P2")
      return {
        title: "P2 Maths · Adding Oranges",
        visual: "🍊+🍊",
        result: "= 2 oranges",
        text: "Count the oranges: 1, 2",
        twi: "Kan maŋgo no: 1, 2",
      };
    if (selectedLevel === "P3")
      return {
        title: "P3 Maths · Taking Away Mangoes",
        visual: "🥭🥭🥭🥭🥭 − 🥭🥭",
        result: "= 3 mangoes",
        text: "5 mangoes take away 2 = 3 left",
        twi: "Maŋgo 5, yi 2, aka 3",
      };
    return {
      title: "KG1 Maths · Counting Fruits",
      visual: "🍎🍎🍎",
      result: "= 3 apples",
      text: "Count the apples: 1, 2, 3",
      twi: "Kan maŋgo no: 1, 2, 3",
    };
  }, [selectedLevel]);

  const playVoice = (name: string, sample: string) => {
    setVoicePlaying(name);
    speak(sample);
    window.setTimeout(() => setVoicePlaying((v) => (v === name ? null : v)), 2200);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 pb-[72px] pt-6 sm:px-6">
      {/* Header */}
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#EAB308]">Giga3 AI · GigaLearn</p>
      <h1 className="mt-1 text-2xl font-extrabold text-white">Learn with Real Things</h1>
      <p className="mt-1 text-[13px] text-slate-400">
        {levelMeta?.emoji} {selectedLevel} · Concrete objects, fruits & real items — not abstract numbers.
      </p>

      {/* TASK 1: LEVEL SELECTOR */}
      <section aria-label="Select level" className="mt-4">
        <div className="relative">
          <div
            className="flex gap-2 overflow-x-auto rounded-2xl border border-[#2A3441] bg-[#1A233A] p-3"
            role="tablist"
            aria-label="Learning levels"
          >
            {LEVELS.map((l) => {
              const active = l.id === selectedLevel;
              return (
                <button
                  key={l.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setSelectedLevel(l.id);
                    setQuizPick(null);
                    setPollPick(null);
                    setGamePick(null);
                    setQaOpen(false);
                  }}
                  className={`h-12 shrink-0 rounded-full border px-4 text-[13px] font-bold transition-colors ${
                    active
                      ? "border-[#EAB308] bg-[#EAB308] text-black"
                      : "border-[#2A3441] bg-[#0D1323] text-slate-300 hover:border-[#EAB308]/60 hover:text-white"
                  }`}
                >
                  {l.emoji} {l.label}
                </button>
              );
            })}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-12 rounded-r-2xl bg-gradient-to-l from-[#1A233A] to-transparent"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {lessonsForLevel.map((t) => (
            <span key={t} className="rounded-full border border-[#2A3441] bg-[#1A233A] px-3 py-1.5 text-[12px] font-semibold text-slate-200">
              {t}
            </span>
          ))}
        </div>
      </section>

      {isLower ? (
        <>
          {/* TASK 2: CONCRETE OBJECTS */}
          <section aria-label="Learn with Real Things" className="mt-6">
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-extrabold text-white">Learn with Real Things</h2>
              <span className="rounded-full bg-[#10B981] px-2.5 py-0.5 text-[11px] font-bold text-black">Touch &amp; See</span>
            </div>
            <p className="mt-1 text-[12px] text-slate-400">Real fruits, objects & body parts for {selectedLevel} · GES concrete-first.</p>
            <div className="mt-3 space-y-4 rounded-[20px] bg-[#1A233A] p-4">
              {CONCRETE_GROUPS.map((g) => (
                <div key={g.group}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-[13px] font-bold text-white">{g.group}</h3>
                    <span className="rounded-full bg-[#3B82F6] px-2 py-0.5 text-[10px] font-bold text-white">Concrete</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {g.items.map((c) => (
                      <button
                        key={`${g.group}-${c.title}`}
                        onClick={() => speak(`${c.title}. ${c.subtitle}`)}
                        className="flex items-center gap-3 rounded-2xl border border-[#2A3441] bg-[#0D1323] p-3 text-left transition-colors hover:border-[#EAB308]/60"
                      >
                        <span className="text-[32px] leading-none" aria-hidden>
                          {c.emoji}
                        </span>
                        <span>
                          <span className="block text-[14px] font-bold text-white">{c.title}</span>
                          <span className="block text-[11px] text-slate-400">{c.subtitle}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TASK 4: LESSON PREVIEW (concrete) */}
          <section aria-label="Lesson preview" className="mt-6 rounded-2xl border border-[#EAB308] bg-[#1E293B] p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#EAB308]">Lesson preview · {selectedLevel}</p>
            <h2 className="mt-1 text-[14px] font-bold text-white">{lessonPreview.title}</h2>
            <p className="mt-2 text-3xl tracking-wide" aria-label={lessonPreview.result}>
              {lessonPreview.visual} <span className="text-xl font-extrabold text-white">{lessonPreview.result}</span>
            </p>
            <p className="mt-2 text-[13px] text-white">{lessonPreview.text}</p>
            <p className="text-[12px] text-slate-400">Twi · {lessonPreview.twi}</p>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => speak(`${lessonPreview.text}. ${lessonPreview.twi}`)}
                aria-label="Play lesson voice, Abena Twi"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAB308] text-[14px] font-bold text-black"
              >
                ▶️
              </button>
              <span className="text-[12px] text-slate-300">Voice · Abena Twi 🇬🇭</span>
            </div>
            <p className="mt-3 rounded-xl border border-dashed border-[#EAB308]/60 bg-[#0D1323] p-2.5 text-[11px] leading-relaxed text-slate-300">
              TELEPROMPTER TOP 25% — Teacher script top, kids see fruits bottom 75%
            </p>
            <div className="mt-2 flex items-center gap-2 overflow-x-auto">
              {FRUIT_PHOTOS.map((f) => (
                <span key={f.label} className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#2A3441] bg-[#0D1323] px-3 py-1.5 text-[12px] font-semibold text-slate-200">
                  <span className="text-lg">{f.emoji}</span> {f.label}
                </span>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button onClick={() => speak("Quiz. Count the fruits. Five questions.")} className="rounded-xl bg-[#EAB308] px-2 py-2.5 text-[12px] font-extrabold text-black">
                Quiz · Count fruits · 5 Qs
              </button>
              <button onClick={() => speak("Game. Match the fruits.")} className="rounded-xl bg-white px-2 py-2.5 text-[12px] font-extrabold text-black">
                Game · Match fruits
              </button>
              <button onClick={() => setQaOpen((v) => !v)} className="rounded-xl border border-[#EAB308] px-2 py-2.5 text-[12px] font-extrabold text-[#EAB308]">
                Q&amp;A · Ask
              </button>
            </div>
          </section>

          {/* TASK 3: LEARNING MODES */}
          <section aria-label="Learning modes" className="mt-6 space-y-4">
            {/* Recommendations */}
            <div className="rounded-2xl border border-[#2A3441] bg-[#1A233A] p-4">
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-bold text-white">For You · {selectedLevel}</h2>
                <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-300">For You</span>
                <span className="rounded-full bg-[#EAB308] px-2 py-0.5 text-[10px] font-extrabold text-black">AI STUDIO</span>
              </div>
              <p className="mt-1 text-[12px] text-slate-400">Start with 3 fruits — touch, count aloud, then quiz.</p>
              <div className="mt-2 flex gap-2 text-2xl" aria-hidden>
                <span>🍎</span>
                <span>🍌</span>
                <span>🍊</span>
              </div>
            </div>

            {/* Practice */}
            <div className="rounded-2xl border border-[#EAB308] bg-[#1A233A] p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-bold text-white">Practice · Touch 3 apples</h2>
                <span className="rounded-full border border-[#EAB308] px-2 py-0.5 text-[10px] font-bold text-[#EAB308]">ON DEVICE</span>
              </div>
              <p className="mt-1 text-2xl" aria-hidden>
                🍎🍎🍎
              </p>
              <button
                onClick={() => speak("One. Two. Three apples. Touch each apple and count.")}
                className="mt-2 w-full rounded-xl bg-[#EAB308] py-2.5 text-[13px] font-extrabold text-black"
              >
                Count aloud: 1, 2, 3
              </button>
            </div>

            {/* Quiz */}
            <div className="rounded-2xl border border-[#2A3441] bg-[#1A233A] p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-bold text-white">Quiz · {QUIZ_QUESTION.prompt}</h2>
                <span className="rounded-full border border-[#EAB308] px-2 py-0.5 text-[10px] font-bold text-[#EAB308]">ON DEVICE</span>
              </div>
              <p className="mt-2 text-3xl" aria-hidden>
                {QUIZ_QUESTION.emojis.join("")}
              </p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {QUIZ_QUESTION.options.map((n) => {
                  const picked = quizPick === n;
                  const correct = quizPick !== null && n === QUIZ_QUESTION.answer;
                  return (
                    <button
                      key={n}
                      onClick={() => {
                        setQuizPick(n);
                        speak(n === QUIZ_QUESTION.answer ? `${n}. Correct! Three bananas!` : `${n}. Try again. Count the bananas.`);
                      }}
                      className={`rounded-xl py-2.5 text-[15px] font-extrabold ${
                        correct ? "bg-[#10B981] text-black" : picked ? "bg-red-500 text-white" : "bg-[#0D1323] text-white"
                      } border ${correct || picked ? "border-transparent" : "border-[#2A3441]"}`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
              {quizPick !== null && (
                <p className={`mt-2 text-[12px] font-bold ${quizPick === QUIZ_QUESTION.answer ? "text-green-400" : "text-red-400"}`}>
                  {quizPick === QUIZ_QUESTION.answer ? "🎉 Correct! 3 bananas!" : "Try again — point at each 🍌 and count."}
                </p>
              )}
            </div>

            {/* Game + Poll */}
            <div className="rounded-2xl border border-[#2A3441] bg-[#1A233A] p-4">
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-bold text-white">Game · Drag fruit to basket</h2>
                <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> LIVE
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between rounded-xl bg-[#0D1323] p-3">
                <div className="flex gap-2 text-2xl">
                  {(["🍎", "🍌", "🍊"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setGamePick(f);
                        speak(f === "🍌" ? "Banana in the basket! Well done!" : "That fruit goes back. Pick the banana!");
                      }}
                      aria-label={`Pick ${f}`}
                      className={`rounded-xl border p-1.5 ${gamePick === f ? "border-[#EAB308]" : "border-transparent"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-3xl" aria-hidden>
                    🧺
                  </p>
                  <p className="text-[10px] text-slate-400">Put 🍌 here</p>
                </div>
              </div>
              {gamePick && (
                <p className={`mt-2 text-[12px] font-bold ${gamePick === "🍌" ? "text-green-400" : "text-slate-300"}`}>
                  {gamePick === "🍌" ? "🎉 Banana matched!" : "Tap the 🍌 banana for the basket."}
                </p>
              )}
              <div className="mt-3 border-t border-[#2A3441] pt-3">
                <p className="text-[13px] font-bold text-white">Poll · Which fruit is yellow?</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["Banana 🍌", "Apple 🍎"] as const).map((o) => (
                    <button
                      key={o}
                      onClick={() => {
                        setPollPick(o);
                        speak(o.startsWith("Banana") ? "Correct! Banana is yellow!" : "Apple is red. Try again!");
                      }}
                      className={`rounded-xl border py-2.5 text-[13px] font-bold ${
                        pollPick === o ? "border-[#EAB308] bg-[#EAB308]/15 text-[#EAB308]" : "border-[#2A3441] bg-[#0D1323] text-slate-200"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Rhymes */}
            <div className="rounded-2xl border border-[#2A3441] bg-[#1A233A] p-4">
              <h2 className="text-[14px] font-bold text-white">Rhyme · Fruits</h2>
              <p className="mt-1 text-[13px] text-white">“Mango sweet, mango nice…”</p>
              <p className="text-[12px] text-slate-400">Twi · “Mango dɛdɛ…”</p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => speak("Mango sweet, mango nice. Mango dɛdɛ. One, two, three fruits for me!")}
                  aria-label="Play fruit rhyme"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAB308] text-[13px] font-bold text-black"
                >
                  ▶️
                </button>
                <span className="rounded-full border border-[#2A3441] bg-[#0D1323] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                  African voice · Abena Twi 🇬🇭 · ON DEVICE
                </span>
              </div>
            </div>

            {/* Poems */}
            <div className="rounded-2xl border border-[#2A3441] bg-[#1A233A] p-4">
              <h2 className="text-[14px] font-bold text-white">Poem · Ananse and the Fruits 🕷️</h2>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-300">
                Ananse saw 3 mangoes 🥭🥭🥭, counted 1-2-3, shared with friends — concrete objects in every line.
              </p>
              <button onClick={() => speak("Ananse and the fruits. Ananse counted three mangoes and shared with friends.")} className="mt-2 rounded-xl border border-[#EAB308] px-4 py-2 text-[12px] font-bold text-[#EAB308]">
                Read aloud ▶️
              </button>
            </div>

            {/* Songs */}
            <div className="rounded-2xl border border-[#2A3441] bg-[#1A233A] p-4">
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-bold text-white">Song · “I like bananas” 🍌</h2>
                <span className="rounded-full bg-[#EAB308] px-2 py-0.5 text-[10px] font-extrabold text-black">AI STUDIO</span>
              </div>
              <p className="mt-1 text-[12px] text-slate-400">Twi voiceover + teleprompter</p>
              <p className="mt-2 rounded-xl bg-[#0D1323] p-2.5 text-[11px] font-bold uppercase tracking-widest text-[#EAB308]">
                Teleprompter · Top 25% badge
              </p>
              <button onClick={() => speak("I like bananas, yes I do! Me pɛ kwadu!")} className="mt-2 w-full rounded-xl bg-[#EAB308] py-2.5 text-[13px] font-extrabold text-black">
                Play song ▶️
              </button>
            </div>

            {/* Q&A */}
            <div className="rounded-2xl border border-[#2A3441] bg-[#1A233A] p-4">
              <h2 className="text-[14px] font-bold text-white">Q&amp;A · Fruit questions</h2>
              <button onClick={() => setQaOpen((v) => !v)} className="mt-2 w-full rounded-xl bg-[#0D1323] px-3 py-2.5 text-left text-[13px] font-bold text-white">
                What color is an orange? 🍊 {qaOpen ? "▾" : "▸"}
              </button>
              {qaOpen && (
                <div className="mt-2 flex items-center gap-3 rounded-xl bg-[#0D1323] p-3">
                  <span className="text-3xl" aria-hidden>
                    🍊
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-white">Orange! 🍊</p>
                    <button onClick={() => speak("Orange! The orange is orange!")} className="mt-1 text-[12px] font-bold text-[#EAB308]">
                      Play voice ▶️
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* TASK 5: VOICES + CURRICULUM + OFFLINE */}
          <section aria-label="Voices and curriculum" className="mt-6 space-y-4">
            <div>
              <h2 className="text-[14px] font-bold text-white">African Voiceovers</h2>
              <div className="mt-2 space-y-2">
                {VOICES.map((v) => (
                  <div key={v.name} className="flex items-center gap-3 rounded-2xl bg-[#1A233A] p-3">
                    <button
                      onClick={() => playVoice(v.name, `Hello! I am ${v.name}. I speak ${v.lang}. Let's count fruits together. One, two, three!`)}
                      aria-label={`Play ${v.name} sample`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAB308] text-[13px] font-bold text-black"
                    >
                      {voicePlaying === v.name ? "⏸" : "▶️"}
                    </button>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-white">
                        {v.name} · {v.lang} {v.flag}
                      </p>
                      <p className="truncate text-[11px] text-slate-400">{v.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#2A3441] bg-[#1A233A] p-4">
              <h2 className="text-[14px] font-bold text-white">Ghana GES Curriculum 🇬🇭</h2>
              <p className="mt-1 text-[12px] text-slate-300">KG1–2: My World, Our World, Literacy, Numeracy — all with concrete objects.</p>
              <p className="mt-1 text-[12px] text-slate-300">Primary 1–3: English rhymes, Maths with fruits &amp; objects, Science with real things.</p>
            </div>

            <div className="rounded-2xl border border-[#10B981]/50 bg-[#1A233A] p-4">
              <p className="text-[12px] font-bold text-green-300">📴 Offline · Concrete objects cached · African voices ready</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#0D1323]">
                <div className="h-full w-[12%] rounded-full bg-[#10B981]" />
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">Storage 1.2GB / 10GB</p>
                <button onClick={() => speak("Cache cleared.")} className="rounded-lg border border-[#2A3441] px-3 py-1.5 text-[11px] font-bold text-slate-300">
                  Clear cache
                </button>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Upper levels: abstract-ready list (filtered by level) */
        <section aria-label="Level lessons" className="mt-6 space-y-3">
          <h2 className="text-[15px] font-extrabold text-white">{selectedLevel} Lessons</h2>
          {lessonsForLevel.map((t, i) => (
            <div key={t} className="rounded-2xl border border-[#2A3441] bg-[#1A233A] p-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#EAB308]">Lesson {i + 1}</p>
              <p className="mt-0.5 text-[14px] font-bold text-white">{t}</p>
              <p className="mt-0.5 text-[12px] text-slate-400">GES curriculum · quizzes, games &amp; AI Studio voices included.</p>
            </div>
          ))}
        </section>
      )}

      {/* Perf note (3G-friendly: emoji visuals, no heavy assets) */}
      <p className="mt-6 text-center text-[11px] text-slate-500">
        3G-ready · visuals &lt;500KB · voices on-device · quizzes work offline · 60fps teleprompter
      </p>
    </main>
  );
}
