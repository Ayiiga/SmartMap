import type { Achievement, LearningLevel, Lesson } from "@/types";
import { MATH_LESSONS } from "@/content/math-curriculum";

export const LEVELS: {
  id: LearningLevel;
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  description: string;
}[] = [
  {
    id: "alphabet",
    number: 1,
    title: "Alphabet Adventure",
    subtitle: "Letters A to Z",
    icon: "🅰️",
    color: "from-giga-purple to-giga-blue",
    description: "Uppercase, lowercase, tracing, sounds, and picture associations",
  },
  {
    id: "phonics",
    number: 2,
    title: "GigaPhonics",
    subtitle: "Sounds & Blending",
    icon: "🔤",
    color: "from-giga-orange to-giga-yellow",
    description: "Phonics sounds, digraphs, CVC words, and pronunciation",
  },
  {
    id: "vocabulary",
    number: 3,
    title: "Vocabulary Builder",
    subtitle: "Words & Meanings",
    icon: "📚",
    color: "from-giga-green to-giga-teal",
    description: "Flashcards, sight words, synonyms, and word categories",
  },
  {
    id: "semantics",
    number: 4,
    title: "Semantics & Meaning",
    subtitle: "Understanding Language",
    icon: "💡",
    color: "from-giga-pink to-giga-purple",
    description: "Context clues, word relationships, and comprehension",
  },
  {
    id: "tone",
    number: 5,
    title: "Tone & Expression",
    subtitle: "How We Say It",
    icon: "🎭",
    color: "from-giga-red to-giga-orange",
    description: "Happy, sad, question tones, and storytelling expression",
  },
  {
    id: "rhythm",
    number: 6,
    title: "Rhythm & Fluency",
    subtitle: "Flow & Beat",
    icon: "🎵",
    color: "from-giga-blue to-giga-teal",
    description: "Nursery rhymes, syllables, and read-aloud practice",
  },
  {
    id: "reading",
    number: 7,
    title: "Reading Champion",
    subtitle: "Stories & Fluency",
    icon: "📖",
    color: "from-giga-indigo to-giga-purple",
    description: "Guided reading, storybooks, and fluency tracking",
  },
  {
    id: "grammar",
    number: 8,
    title: "Grammar Foundations",
    subtitle: "Building Sentences",
    icon: "✏️",
    color: "from-giga-teal to-giga-green",
    description: "Nouns, verbs, adjectives, tenses, and sentence building",
  },
  {
    id: "mathematics",
    number: 9,
    title: "GigaMath",
    subtitle: "Numbers & Logic",
    icon: "🔢",
    color: "from-giga-yellow to-giga-orange",
    description: "Number recognition, counting, arithmetic, and problem-solving games",
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-letter", title: "First Letter", description: "Trace your first letter", icon: "🅰️", xp_required: 50, category: "learning" },
  { id: "phonics-star", title: "Phonics Star", description: "Complete 5 phonics lessons", icon: "⭐", xp_required: 200, category: "phonics" },
  { id: "story-reader", title: "Story Reader", description: "Read your first story", icon: "📖", xp_required: 300, category: "reading" },
  { id: "week-streak", title: "Week Warrior", description: "7-day learning streak", icon: "🔥", xp_required: 500, category: "streak" },
  { id: "word-master", title: "Word Master", description: "Learn 50 vocabulary words", icon: "🏆", xp_required: 1000, category: "learning" },
  { id: "speaking-pro", title: "Speaking Pro", description: "Complete 10 speaking exercises", icon: "🎤", xp_required: 750, category: "phonics" },
  { id: "grammar-guru", title: "Grammar Guru", description: "Master grammar basics", icon: "✏️", xp_required: 800, category: "learning" },
  { id: "champion", title: "Reading Champion", description: "Complete all reading levels", icon: "👑", xp_required: 2000, category: "reading" },
];

export const ALPHABET_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => ({
  uppercase: letter,
  lowercase: letter.toLowerCase(),
  sound: `/ ${letter.toLowerCase()} /`,
  word: getLetterWord(letter),
  emoji: getLetterEmoji(letter),
}));

function getLetterWord(letter: string): string {
  const words: Record<string, string> = {
    A: "Apple", B: "Ball", C: "Cat", D: "Dog", E: "Elephant", F: "Fish",
    G: "Giraffe", H: "House", I: "Igloo", J: "Juice", K: "Kite", L: "Lion",
    M: "Moon", N: "Nest", O: "Orange", P: "Penguin", Q: "Queen", R: "Rainbow",
    S: "Sun", T: "Tree", U: "Umbrella", V: "Violin", W: "Water", X: "Xylophone",
    Y: "Yellow", Z: "Zebra",
  };
  return words[letter] ?? "Word";
}

function getLetterEmoji(letter: string): string {
  const emojis: Record<string, string> = {
    A: "🍎", B: "⚽", C: "🐱", D: "🐕", E: "🐘", F: "🐟", G: "🦒", H: "🏠",
    I: "🏔️", J: "🧃", K: "🪁", L: "🦁", M: "🌙", N: "🪺", O: "🍊", P: "🐧",
    Q: "👸", R: "🌈", S: "☀️", T: "🌳", U: "☂️", V: "🎻", W: "💧", X: "🎵",
    Y: "💛", Z: "🦓",
  };
  return emojis[letter] ?? "✨";
}

function buildAlphabetLessons(): Lesson[] {
  return ALPHABET_LETTERS.map((item, index) => ({
    id: `alphabet-${item.lowercase}`,
    level: "alphabet" as const,
    title: `Letter ${item.uppercase} Adventure`,
    description: `Learn ${item.uppercase}, ${item.lowercase}, and the ${item.sound} sound with ${item.word}`,
    slug: `letter-${item.lowercase}`,
    order_index: index + 1,
    duration_minutes: 8,
    xp_reward: 50,
    coin_reward: 10,
    is_premium: false,
    content: {
      type: "alphabet" as const,
      activities: [
        {
          id: `${item.lowercase}-trace`,
          type: "tracing" as const,
          title: `Trace Letter ${item.uppercase}`,
          data: { letter: item.uppercase },
        },
        {
          id: `${item.lowercase}-listen`,
          type: "listening" as const,
          title: `${item.uppercase} Sound`,
          data: { letter: item.uppercase, sound: item.sound, word: item.word },
        },
        {
          id: `${item.lowercase}-match`,
          type: "matching" as const,
          title: `${item.word}`,
          data: { letter: item.uppercase, word: item.word, emoji: item.emoji },
        },
      ],
    },
  }));
}

export const PHONICS_SOUNDS = [
  { id: "short-a", grapheme: "a", sound: "/ă/", example: "cat", type: "vowel" },
  { id: "short-e", grapheme: "e", sound: "/ĕ/", example: "bed", type: "vowel" },
  { id: "short-i", grapheme: "i", sound: "/ĭ/", example: "sit", type: "vowel" },
  { id: "short-o", grapheme: "o", sound: "/ŏ/", example: "hot", type: "vowel" },
  { id: "short-u", grapheme: "u", sound: "/ŭ/", example: "cup", type: "vowel" },
  { id: "sh", grapheme: "sh", sound: "/sh/", example: "ship", type: "digraph" },
  { id: "ch", grapheme: "ch", sound: "/ch/", example: "chip", type: "digraph" },
  { id: "th", grapheme: "th", sound: "/th/", example: "this", type: "digraph" },
  { id: "str", grapheme: "str", sound: "/str/", example: "street", type: "trigraph" },
];

export const CVC_WORDS = [
  { word: "cat", phonemes: ["c", "a", "t"], image: "🐱" },
  { word: "dog", phonemes: ["d", "o", "g"], image: "🐕" },
  { word: "sun", phonemes: ["s", "u", "n"], image: "☀️" },
  { word: "bed", phonemes: ["b", "e", "d"], image: "🛏️" },
  { word: "pig", phonemes: ["p", "i", "g"], image: "🐷" },
  { word: "hat", phonemes: ["h", "a", "t"], image: "🎩" },
  { word: "cup", phonemes: ["c", "u", "p"], image: "☕" },
  { word: "map", phonemes: ["m", "a", "p"], image: "🗺️" },
];

export const VOCABULARY_CATEGORIES = [
  {
    id: "animals",
    name: "Animals",
    icon: "🦁",
    words: [
      { word: "Lion", meaning: "A big wild cat", image: "🦁", synonym: "King of beasts" },
      { word: "Elephant", meaning: "A large animal with a trunk", image: "🐘" },
      { word: "Zebra", meaning: "A horse with black and white stripes", image: "🦓" },
    ],
  },
  {
    id: "colors",
    name: "Colors",
    icon: "🌈",
    words: [
      { word: "Red", meaning: "The color of apples", image: "🔴", antonym: "Green" },
      { word: "Blue", meaning: "The color of the sky", image: "🔵" },
      { word: "Yellow", meaning: "The color of the sun", image: "🟡" },
    ],
  },
  {
    id: "family",
    name: "Family",
    icon: "👨‍👩‍👧",
    words: [
      { word: "Mother", meaning: "A female parent", image: "👩" },
      { word: "Father", meaning: "A male parent", image: "👨" },
      { word: "Sister", meaning: "A female sibling", image: "👧" },
    ],
  },
];

export const SIGHT_WORDS = [
  "the", "and", "a", "to", "said", "in", "he", "I", "of", "it",
  "was", "you", "they", "on", "she", "is", "for", "at", "his", "but",
];

export const STORIES = [
  {
    id: "leo-the-lion",
    title: "Leo the Learning Lion",
    level: "reading" as const,
    content: `Leo was a little lion who lived in the warm African savanna. Every morning, Leo woke up early to learn new words.

"Today I will learn the word BRAVE," Leo said to his friend Zara the zebra.

Leo opened his book and read aloud. His voice grew stronger with each word. The other animals gathered to listen.

"You are brave, Leo!" cheered Zara. Leo smiled. He knew that learning to read was the bravest thing of all.

The End.`,
    word_count: 72,
    age_group: "kindergarten",
    illustration: "🦁",
  },
  {
    id: "rainy-day",
    title: "A Rainy Day Adventure",
    level: "reading" as const,
    content: `It was a rainy day. Maya could not go outside to play. She was sad.

"Maya, let's read a story together!" said her mother.

They opened a colorful book about a fish who swam in the deep blue sea. Maya laughed at the funny fish. Soon the rain stopped and a rainbow appeared.

"I love reading on rainy days!" Maya said happily.

The End.`,
    word_count: 65,
    age_group: "kindergarten",
    illustration: "🌧️",
  },
];

export { MATH_LESSONS } from "@/content/math-curriculum";

export const LESSONS: Lesson[] = [
  ...buildAlphabetLessons(),
  {
    id: "phonics-cvc-a",
    level: "phonics",
    title: "CVC Words: cat, hat, bat",
    description: "Blend consonant-vowel-consonant sounds",
    slug: "cvc-words-a",
    order_index: 1,
    duration_minutes: 12,
    xp_reward: 75,
    coin_reward: 15,
    is_premium: false,
    content: {
      type: "phonics",
      activities: [
        { id: "p1", type: "blending", title: "Blend c-a-t", data: { word: "cat" } },
        { id: "p2", type: "speaking", title: "Say the word", data: { word: "cat" } },
        { id: "p3", type: "quiz", title: "Pick the word", data: { word: "cat", options: ["cat", "cut", "cot"] } },
      ],
    },
  },
  {
    id: "vocab-animals",
    level: "vocabulary",
    title: "Animal Words",
    description: "Learn animal names and meanings",
    slug: "animal-words",
    order_index: 1,
    duration_minutes: 10,
    xp_reward: 60,
    coin_reward: 12,
    is_premium: false,
    content: { type: "vocabulary", activities: [{ id: "v1", type: "flashcard", title: "Animal Flashcards", data: { category: "animals" } }] },
  },
  {
    id: "semantics-context",
    level: "semantics",
    title: "Context Clues",
    description: "Use surrounding words to find meaning",
    slug: "context-clues",
    order_index: 1,
    duration_minutes: 10,
    xp_reward: 65,
    coin_reward: 13,
    is_premium: false,
    content: { type: "quiz", activities: [{ id: "s1", type: "comprehension", title: "Find the meaning", data: {} }] },
  },
  {
    id: "tone-happy",
    level: "tone",
    title: "Happy Tone",
    description: "Learn to express happiness in speech",
    slug: "happy-tone",
    order_index: 1,
    duration_minutes: 8,
    xp_reward: 55,
    coin_reward: 11,
    is_premium: false,
    content: { type: "game", activities: [{ id: "t1", type: "listening", title: "Hear the happy tone", data: { tone: "happy" } }] },
  },
  {
    id: "rhythm-rhyme",
    level: "rhythm",
    title: "Nursery Rhyme Time",
    description: "Twinkle Twinkle and rhythm patterns",
    slug: "nursery-rhymes",
    order_index: 1,
    duration_minutes: 12,
    xp_reward: 70,
    coin_reward: 14,
    is_premium: false,
    content: { type: "game", activities: [{ id: "r1", type: "reading", title: "Read the rhyme", data: { rhyme: "Twinkle Twinkle Little Star" } }] },
  },
  {
    id: "reading-leo",
    level: "reading",
    title: "Leo the Learning Lion",
    description: "Guided reading with comprehension",
    slug: "leo-story",
    order_index: 1,
    duration_minutes: 15,
    xp_reward: 80,
    coin_reward: 16,
    is_premium: false,
    content: { type: "story", activities: [{ id: "rd1", type: "reading", title: "Read the story", data: { storyId: "leo-the-lion" } }] },
  },
  {
    id: "grammar-nouns",
    level: "grammar",
    title: "Naming Words (Nouns)",
    description: "People, places, and things",
    slug: "nouns",
    order_index: 1,
    duration_minutes: 10,
    xp_reward: 60,
    coin_reward: 12,
    is_premium: false,
    content: { type: "grammar", activities: [{ id: "g1", type: "matching", title: "Find the nouns", data: { type: "nouns" } }] },
  },
  ...MATH_LESSONS,
];

export const GAMES = [
  { id: "letter-match", title: "Letter Match", icon: "🎯", description: "Match letters to pictures", level: "alphabet" },
  { id: "sound-blend", title: "Sound Blender", icon: "🔊", description: "Blend sounds to make words", level: "phonics" },
  { id: "word-hunt", title: "Word Hunt", icon: "🔍", description: "Find hidden sight words", level: "vocabulary" },
  { id: "story-quiz", title: "Story Quiz", icon: "❓", description: "Answer questions about stories", level: "reading" },
  { id: "rhyme-time", title: "Rhyme Time", icon: "🎵", description: "Match rhyming words", level: "rhythm" },
  { id: "grammar-go", title: "Grammar Go", icon: "🏃", description: "Sort words by type", level: "grammar" },
  { id: "number-ninja", title: "Number Ninja", icon: "🔢", description: "Quick counting challenges", level: "mathematics" },
];

export const AI_FEATURES = [
  { id: "reading_coach", title: "AI Reading Coach", icon: "📖", description: "Get help reading any text" },
  { id: "pronunciation", title: "Pronunciation Checker", icon: "🎤", description: "Practice and improve pronunciation" },
  { id: "speech_coach", title: "AI Speech Coach", icon: "🗣️", description: "Improve speaking pace and clarity" },
  { id: "story_generator", title: "Story Generator", icon: "✨", description: "Create custom stories" },
  { id: "quiz_generator", title: "Quiz Generator", icon: "❓", description: "Generate practice quizzes" },
  { id: "homework_assistant", title: "Homework Assistant", icon: "📝", description: "Get homework help" },
  { id: "math_tutor", title: "AI Math Tutor", icon: "🔢", description: "Step-by-step math guidance" },
  { id: "science_lab", title: "Science Lab Assistant", icon: "🔬", description: "Virtual science explanations" },
  { id: "coding_tutor", title: "AI Coding Tutor", icon: "💻", description: "Learn programming step by step" },
  { id: "lesson_generator", title: "Lesson Generator", icon: "📋", description: "Generate custom lesson plans" },
  { id: "recommendations", title: "Learning Recommendations", icon: "💡", description: "Personalized learning paths" },
  { id: "study_plan", title: "Study Plan", icon: "📅", description: "Personalized weekly study plans" },
  { id: "revision", title: "Revision Mode", icon: "🔄", description: "Adaptive revision sessions" },
  { id: "vocabulary_trainer", title: "Vocabulary Trainer", icon: "📚", description: "Learn new words with AI" },
  { id: "speaking_coach", title: "Speaking Coach", icon: "🎙️", description: "Practice speaking English" },
];

export const TESTIMONIALS = [
  { name: "Amara O.", role: "Parent, Lagos", text: "Smart Map made my 4-year-old excited about reading. The phonics games are wonderful!", avatar: "👩🏾" },
  { name: "Mr. James K.", role: "Teacher, Nairobi", text: "My kindergarten class loves GigaPhonics. Progress tracking helps me support every child.", avatar: "👨🏿‍🏫" },
  { name: "Sarah M.", role: "Homeschool Parent", text: "Offline mode is a lifesaver! My kids learn anywhere, even without internet.", avatar: "👩🏼" },
];
