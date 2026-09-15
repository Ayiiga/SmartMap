export interface LearningEcosystem {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  topics: string[];
  methods: string[];
  href: string;
  available: boolean;
}

export const LEARNING_ECOSYSTEMS: LearningEcosystem[] = [
  {
    id: "gigaenglish",
    title: "GigaEnglish",
    icon: "📖",
    color: "from-giga-purple to-giga-blue",
    description: "Reading, phonics, vocabulary, grammar, writing, comprehension, pronunciation, storytelling, listening, and public speaking.",
    topics: ["Reading", "Phonics", "Vocabulary", "Grammar", "Writing", "Speaking"],
    methods: ["Flashcards", "AI Conversations", "Storytelling", "Voice Interaction"],
    href: "/ecosystems/gigaenglish",
    available: true,
  },
  {
    id: "gigamath",
    title: "GigaMath",
    icon: "🔢",
    color: "from-giga-yellow to-giga-orange",
    description: "Counting, arithmetic, fractions, geometry, measurement, algebra, statistics, and mental mathematics.",
    topics: ["Counting", "Arithmetic", "Fractions", "Geometry", "Algebra", "Statistics"],
    methods: ["AI Tutoring", "Voice Interaction", "Games", "Virtual Manipulatives"],
    href: "/ecosystems/gigamath",
    available: true,
  },
  {
    id: "gigascience",
    title: "GigaScience",
    icon: "🔬",
    color: "from-giga-green to-giga-teal",
    description: "Biology, chemistry, physics, earth science, environmental science, agriculture, and astronomy.",
    topics: ["Biology", "Chemistry", "Physics", "Earth Science", "Astronomy"],
    methods: ["Simulations", "Virtual Labs", "Quizzes", "AI Explanations"],
    href: "/ecosystems/gigascience",
    available: true,
  },
  {
    id: "gigarobotics",
    title: "GigaRobotics",
    icon: "🤖",
    color: "from-giga-indigo to-giga-purple",
    description: "Robotics fundamentals, sensors, motors, AI, automation, Arduino, and virtual robot building.",
    topics: ["Sensors", "Motors", "Automation", "Arduino", "Simulation"],
    methods: ["Simulations", "Drag-and-Drop", "Project-Based Learning"],
    href: "/ecosystems/gigarobotics",
    available: true,
  },
  {
    id: "gigacoding",
    title: "GigaCoding",
    icon: "💻",
    color: "from-giga-blue to-giga-teal",
    description: "Computational thinking, block coding, Scratch, HTML, CSS, JavaScript, Python, and AI programming.",
    topics: ["Block Coding", "Scratch", "HTML/CSS", "JavaScript", "Python"],
    methods: ["Interactive Exercises", "Instant Feedback", "AI Mentoring"],
    href: "/ecosystems/gigacoding",
    available: true,
  },
  {
    id: "gigaiq",
    title: "GigaIQ",
    icon: "🧠",
    color: "from-giga-pink to-giga-purple",
    description: "Critical thinking, logical reasoning, memory training, brain games, and problem solving.",
    topics: ["Critical Thinking", "Logic", "Memory", "Pattern Recognition"],
    methods: ["Brain Games", "Adaptive Quizzes", "AI Conversations"],
    href: "/ai-tutor?feature=quiz_generator",
    available: true,
  },
  {
    id: "gigainnovation",
    title: "GigaInnovation",
    icon: "💡",
    color: "from-giga-orange to-giga-yellow",
    description: "Design thinking, innovation challenges, entrepreneurship, and real-world problem solving.",
    topics: ["Design Thinking", "Entrepreneurship", "Collaboration"],
    methods: ["Project-Based Learning", "AI Creativity"],
    href: "/ecosystems/gigainnovation",
    available: true,
  },
  {
    id: "gigaarts",
    title: "GigaArts",
    icon: "🎨",
    color: "from-giga-red to-giga-pink",
    description: "Drawing, painting, colouring, crafts, digital art, animation, and creative design.",
    topics: ["Drawing", "Painting", "Digital Art", "Animation"],
    methods: ["Picture Learning", "Art Challenges"],
    href: "/ecosystems/gigaarts",
    available: true,
  },
  {
    id: "gigamusic",
    title: "GigaMusic",
    icon: "🎵",
    color: "from-giga-teal to-giga-green",
    description: "Singing, nursery rhymes, rhythm, musical instruments, music theory, and ear training.",
    topics: ["Singing", "Rhythm", "Instruments", "Music Theory"],
    methods: ["Songs", "Rhymes", "Voice Interaction"],
    href: "/learn?level=rhythm",
    available: true,
  },
];

export const AVAILABLE_ECOSYSTEMS = LEARNING_ECOSYSTEMS.filter((e) => e.available);

export const WEEKLY_GOALS = [
  { id: "lessons-5", title: "Complete 5 lessons", target: 5, icon: "📚", xpReward: 100, gemReward: 2 },
  { id: "xp-500", title: "Earn 500 XP", target: 500, icon: "⭐", xpReward: 75, gemReward: 1 },
  { id: "streak-5", title: "5-day streak", target: 5, icon: "🔥", xpReward: 150, gemReward: 3 },
  { id: "speaking-3", title: "3 speaking exercises", target: 3, icon: "🎤", xpReward: 80, gemReward: 2 },
];
