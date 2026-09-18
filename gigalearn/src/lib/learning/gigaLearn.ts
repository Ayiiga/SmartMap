/**
 * GigaLearn curriculum data — Next.js equivalent of `convex/gigaLearn.ts`.
 * Tables: levels, subjects, modes, lessons, voices. Seeded with Ghana GES
 * content: BECE 2015–2024 quizzes, WASSCE core, KG concrete-object lessons
 * (fruits/animals/shapes with Twi + English), Ananse poems, Twi songs.
 */

export interface GigaLevel {
  id: string;
  label: string;
  icon: string;
  ageRange: string;
}

export const GIGA_LEVELS: GigaLevel[] = [
  { id: "all", label: "All", icon: "🌍", ageRange: "All ages" },
  { id: "creche", label: "Creche", icon: "🧸", ageRange: "0–2" },
  { id: "kg1", label: "KG1", icon: "🧸", ageRange: "3–4" },
  { id: "kg2", label: "KG2", icon: "🎨", ageRange: "4–5" },
  { id: "p1", label: "P1", icon: "📖", ageRange: "6" },
  { id: "p2", label: "P2", icon: "📖", ageRange: "7" },
  { id: "p3", label: "P3", icon: "📖", ageRange: "8" },
  { id: "p4-6", label: "P4–P6", icon: "📚", ageRange: "9–11" },
  { id: "jhs", label: "JHS", icon: "🎓", ageRange: "12–14" },
  { id: "shs", label: "SHS", icon: "🏫", ageRange: "15–18" },
  { id: "university", label: "University", icon: "🎓", ageRange: "18+" },
  { id: "adult", label: "Adult", icon: "💼", ageRange: "18+" },
];

export interface GigaSubject {
  id: string;
  label: string;
  levelIds: string[];
}

export const GIGA_SUBJECTS: GigaSubject[] = [
  { id: "all", label: "All", levelIds: [] },
  { id: "english", label: "English", levelIds: ["kg1", "kg2", "p1", "p2", "p3", "p4-6", "jhs", "shs"] },
  { id: "maths", label: "Maths", levelIds: ["kg1", "kg2", "p1", "p2", "p3", "p4-6", "jhs", "shs"] },
  { id: "science", label: "Science", levelIds: ["p1", "p2", "p3", "p4-6", "jhs", "shs"] },
  { id: "social", label: "Social Studies", levelIds: ["p4-6", "jhs", "shs"] },
  { id: "ghana-lang", label: "Ghanaian Language", levelIds: ["kg1", "kg2", "p1", "p2", "p3", "p4-6", "jhs", "shs"] },
  { id: "creative", label: "Creative Arts", levelIds: ["creche", "kg1", "kg2", "p1", "p2", "p3", "p4-6"] },
  { id: "ict", label: "ICT", levelIds: ["p4-6", "jhs", "shs", "university", "adult"] },
  { id: "rme", label: "RME", levelIds: ["p4-6", "jhs"] },
  { id: "french", label: "French", levelIds: ["jhs", "shs"] },
];

export interface GigaMode {
  id: string;
  label: string;
  subtitle: string;
  icon: string;
  badge?: string;
  badgeTone?: "green" | "yellow" | "red" | "outline";
  live?: boolean;
}

export const GIGA_MODES: GigaMode[] = [
  { id: "recommendations", label: "Recommendations", subtitle: "For You", icon: "💡", badge: "AI STUDIO", badgeTone: "yellow" },
  { id: "practices", label: "Practices", subtitle: "Daily exercises WASSCE", icon: "✍️", badge: "ON DEVICE", badgeTone: "outline" },
  { id: "quizzes", label: "Quizzes", subtitle: "BECE/WASSCE 10 Qs", icon: "❓", badge: "GES", badgeTone: "green" },
  { id: "games", label: "Games/Polls", subtitle: "Live", icon: "🎮", badge: "LIVE", badgeTone: "red", live: true },
  { id: "rhymes", label: "Rhymes", subtitle: "KG Twi + English", icon: "🎵", badge: "VOICE", badgeTone: "green" },
  { id: "poems", label: "Poems", subtitle: "Ananse stories", icon: "📜" },
  { id: "songs", label: "Songs", subtitle: "Educational Twi", icon: "🎤", badge: "AI STUDIO", badgeTone: "yellow" },
  { id: "qa", label: "Q&A", subtitle: "Ask tutor", icon: "💬" },
];

export interface GigaVoice {
  id: string;
  name: string;
  language: string;
  flag: string;
  provider: "on-device" | "elevenlabs" | "openai";
  /** Credits per 500 chars for cloud voices; on-device is free. */
  creditCost: number;
}

export const GIGA_VOICES: GigaVoice[] = [
  { id: "abena-twi", name: "Abena Twi Female Ghana", language: "Twi", flag: "🇬🇭", provider: "on-device", creditCost: 0 },
  { id: "musa-hausa", name: "Musa Hausa", language: "Hausa", flag: "🇬🇭", provider: "on-device", creditCost: 0 },
  { id: "naa-ga", name: "Naa Ga", language: "Ga", flag: "🇬🇭", provider: "on-device", creditCost: 0 },
  { id: "kofi-ewe", name: "Kofi Ewe", language: "Ewe", flag: "🇬🇭", provider: "on-device", creditCost: 0 },
  { id: "ade-yoruba", name: "Ade Yoruba", language: "Yoruba", flag: "🇳🇬", provider: "elevenlabs", creditCost: 1 },
  { id: "zawadi-swahili", name: "Zawadi Swahili", language: "Swahili", flag: "🇰🇪", provider: "elevenlabs", creditCost: 1 },
];

export interface GigaQuizQuestion {
  q: string;
  options: string[];
  answer: number;
}

export interface GigaLesson {
  id: string;
  levelId: string;
  subjectId: string;
  modeId: string;
  title: string;
  /** Concrete objects for lower grades (big emoji, real items). */
  objects?: { emoji: string; name: string; twi: string }[];
  rhymeText?: string;
  poemText?: string;
  songLyrics?: string;
  questions?: GigaQuizQuestion[];
  answers?: string[];
  voiceId: string;
  offline: boolean;
  badge?: string;
}

export const CONCRETE_OBJECTS = {
  fruits: [
    { emoji: "🍎", name: "apple", twi: "Kan maŋgo no" },
    { emoji: "🍌", name: "banana", twi: "Kwadu" },
    { emoji: "🍊", name: "orange", twi: "Akaa" },
    { emoji: "🥭", name: "mango", twi: "Maŋgo" },
    { emoji: "🍍", name: "pineapple", twi: "Abrɔbɛ" },
  ],
  animals: [
    { emoji: "🦁", name: "lion", twi: "Gyata" },
    { emoji: "🐘", name: "elephant", twi: "Ɔsono" },
    { emoji: "🐐", name: "goat", twi: "Aponkye" },
    { emoji: "🐔", name: "chicken", twi: "Akokɔ" },
  ],
  shapes: [
    { emoji: "🔴", name: "circle red", twi: "Kurukuruwa" },
    { emoji: "🟦", name: "square blue", twi: "Ahwea" },
    { emoji: "🔺", name: "triangle", twi: "Ahaban" },
  ],
  colors: [
    { emoji: "🔴", name: "red", twi: "Kɔkɔɔ" },
    { emoji: "🟡", name: "yellow", twi: "Akokɔsradeɛ" },
    { emoji: "🟢", name: "green", twi: "Ahabanmono" },
  ],
  body: [
    { emoji: "👁️", name: "eye", twi: "Ani" },
    { emoji: "👂", name: "ear", twi: "Aso" },
    { emoji: "👄", name: "mouth", twi: "Ano" },
    { emoji: "🤚", name: "hand", twi: "Nsa" },
  ],
} as const;

export const GIGA_LESSONS: GigaLesson[] = [
  {
    id: "kg1-fruits-count",
    levelId: "kg1",
    subjectId: "maths",
    modeId: "quizzes",
    title: "Count the fruits 🍎🍎🍎 = 3 apples",
    objects: [...CONCRETE_OBJECTS.fruits],
    questions: [
      { q: "🍎🍎🍎 — how many apples?", options: ["2", "3", "4"], answer: 1 },
      { q: "🍌🍌 — how many bananas?", options: ["1", "2", "3"], answer: 1 },
      { q: "🍊 + 🍊 = ?", options: ["1 orange", "2 oranges", "3 oranges"], answer: 1 },
      { q: "Which is the mango? 🥭", options: ["🥭", "🍎", "🍌"], answer: 0 },
      { q: "Twi: Kwadu means…?", options: ["apple", "banana", "orange"], answer: 1 },
    ],
    answers: ["3", "2", "2 oranges", "🥭", "banana"],
    voiceId: "abena-twi",
    offline: true,
    badge: "Concrete",
  },
  {
    id: "kg-kooko-rhyme",
    levelId: "kg1",
    subjectId: "ghana-lang",
    modeId: "rhymes",
    title: "Kooko ne mma — Kooko rhyme (Twi/English)",
    rhymeText: "Kooko ne mma, yɛdidi na yɛnnyini… / Kooko and friends, we eat and we grow…",
    voiceId: "abena-twi",
    offline: true,
  },
  {
    id: "primary-ananse",
    levelId: "p4-6",
    subjectId: "english",
    modeId: "poems",
    title: "Ananse the Spider — poem",
    poemText: "Ananse spin, Ananse grin, stories weave the world within…",
    voiceId: "naa-ga",
    offline: true,
  },
  {
    id: "jhs-rme-practice",
    levelId: "jhs",
    subjectId: "rme",
    modeId: "practices",
    title: "JHS RME practice — festivals of Ghana",
    questions: [
      { q: "Homowo is celebrated by which people?", options: ["Ga", "Ashanti", "Ewe"], answer: 0 },
      { q: "Hogbetsoto is a festival of the…?", options: ["Anlo Ewe", "Fante", "Dagomba"], answer: 0 },
    ],
    answers: ["Ga", "Anlo Ewe"],
    voiceId: "kofi-ewe",
    offline: true,
  },
  {
    id: "bece-maths-2015-2024",
    levelId: "jhs",
    subjectId: "maths",
    modeId: "quizzes",
    title: "BECE Maths 2015–2024 — 10 Qs",
    questions: [
      { q: "Simplify 3/4 + 1/8", options: ["4/12", "7/8", "1"], answer: 1 },
      { q: "Round 4.678 to 2 decimals", options: ["4.67", "4.68", "4.70"], answer: 1 },
      { q: "Next prime after 7?", options: ["9", "11", "13"], answer: 1 },
      { q: "Area of 5cm × 3cm rectangle?", options: ["8cm²", "15cm²", "16cm²"], answer: 1 },
      { q: "15% of 200?", options: ["20", "25", "30"], answer: 2 },
      { q: "Solve x + 7 = 12", options: ["4", "5", "6"], answer: 1 },
      { q: "Mean of 2, 4, 6?", options: ["3", "4", "5"], answer: 1 },
      { q: "0.5 as a fraction?", options: ["1/2", "1/3", "2/3"], answer: 0 },
      { q: "Angle in a triangle sums to…?", options: ["90°", "180°", "360°"], answer: 1 },
      { q: "√49 = ?", options: ["6", "7", "8"], answer: 1 },
    ],
    answers: ["7/8", "4.68", "11", "15cm²", "30", "5", "4", "1/2", "180°", "7"],
    voiceId: "abena-twi",
    offline: true,
    badge: "GES",
  },
  {
    id: "wassce-core-english",
    levelId: "shs",
    subjectId: "english",
    modeId: "practices",
    title: "WASSCE Core English — essay drill",
    rhymeText: undefined,
    poemText: undefined,
    songLyrics: undefined,
    questions: [
      { q: "Choose the correctly punctuated sentence", options: ["Its mine.", "It's mine.", "Its' mine."], answer: 1 },
    ],
    answers: ["It's mine."],
    voiceId: "musa-hausa",
    offline: true,
    badge: "WASSCE",
  },
  {
    id: "shs-elective-maths",
    levelId: "shs",
    subjectId: "maths",
    modeId: "practices",
    title: "SHS Elective Maths — functions drill",
    questions: [{ q: "If f(x) = 2x + 3, f(4) = ?", options: ["9", "11", "12"], answer: 1 }],
    answers: ["11"],
    voiceId: "abena-twi",
    offline: true,
    badge: "WASSCE",
  },
];

/** Deduplicate projects/lessons by id (fixes the 1001144701-style 3x duplicate bug). */
export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  return [...new Map(items.map((p) => [p.id, p])).values()];
}
