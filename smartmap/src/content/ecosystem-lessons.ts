export type EcosystemId =
  | "gigascience"
  | "gigarobotics"
  | "gigacoding"
  | "gigaarts"
  | "gigainnovation";

export type EcosystemStepType =
  | "intro"
  | "diagram"
  | "simulation"
  | "quiz"
  | "voice"
  | "song"
  | "game"
  | "ai-explain"
  | "project";

export interface EcosystemStep {
  id: string;
  type: EcosystemStepType;
  title: string;
  content: string;
  data?: Record<string, unknown>;
}

export interface EcosystemLesson {
  id: string;
  ecosystemId: EcosystemId;
  title: string;
  description: string;
  slug: string;
  order_index: number;
  duration_minutes: number;
  xp_reward: number;
  coin_reward: number;
  topic: string;
  steps: EcosystemStep[];
}

export const ECOSYSTEM_LESSONS: EcosystemLesson[] = [
  // GigaScience
  {
    id: "science-plants",
    ecosystemId: "gigascience",
    title: "Parts of a Plant",
    description: "Learn roots, stem, leaves, and flowers with an interactive diagram.",
    slug: "parts-of-a-plant",
    order_index: 1,
    duration_minutes: 12,
    xp_reward: 60,
    coin_reward: 12,
    topic: "Biology",
    steps: [
      { id: "s1", type: "intro", title: "Welcome to the Lab", content: "Plants are living things that make their own food using sunlight. Let's explore each part!" },
      { id: "s2", type: "diagram", title: "Plant Diagram", content: "Tap each part to learn its job.", data: { parts: ["Roots", "Stem", "Leaves", "Flower"], emoji: "🌱" } },
      { id: "s3", type: "quiz", title: "Quick Quiz", content: "Which part absorbs water from the soil?", data: { question: "Which part absorbs water?", options: ["Leaves", "Roots", "Flower", "Stem"], answer: 1 } },
      { id: "s4", type: "ai-explain", title: "AI Science Assistant", content: "Ask the AI to explain photosynthesis in simple words.", data: { aiFeature: "science_lab" } },
      { id: "s5", type: "voice", title: "Say It Aloud", content: "Practice saying: Roots, Stem, Leaves, Flower" },
    ],
  },
  {
    id: "science-solar-system",
    ecosystemId: "gigascience",
    title: "Our Solar System",
    description: "Explore the Sun and planets with a space simulation.",
    slug: "solar-system",
    order_index: 2,
    duration_minutes: 15,
    xp_reward: 75,
    coin_reward: 15,
    topic: "Astronomy",
    steps: [
      { id: "s1", type: "intro", title: "Blast Off!", content: "Our solar system has the Sun at the centre and eight planets orbiting around it." },
      { id: "s2", type: "simulation", title: "Planet Orbit", content: "Watch how planets move around the Sun.", data: { planets: ["Mercury", "Venus", "Earth", "Mars"], emoji: "🪐" } },
      { id: "s3", type: "quiz", title: "Planet Quiz", content: "Test your space knowledge!", data: { question: "Which planet do we live on?", options: ["Mars", "Earth", "Jupiter", "Venus"], answer: 1 } },
      { id: "s4", type: "song", title: "Planet Rhyme", content: "My Very Educated Mother Just Served Us Nachos — Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune!", data: { rhyme: "Mercury, Venus, Earth and Mars, Jupiter, Saturn, far afar!" } },
    ],
  },
  // GigaRobotics
  {
    id: "robotics-sensors",
    ecosystemId: "gigarobotics",
    title: "Robot Sensors",
    description: "Learn how robots sense the world using light, sound, and touch sensors.",
    slug: "robot-sensors",
    order_index: 1,
    duration_minutes: 12,
    xp_reward: 65,
    coin_reward: 13,
    topic: "Sensors",
    steps: [
      { id: "s1", type: "intro", title: "Robot Eyes & Ears", content: "Sensors help robots detect light, distance, sound, and touch — just like our senses!" },
      { id: "s2", type: "diagram", title: "Sensor Map", content: "Explore robot sensor placement.", data: { parts: ["Light Sensor", "Ultrasonic", "Touch Sensor", "Microphone"], emoji: "🤖" } },
      { id: "s3", type: "simulation", title: "Obstacle Avoidance", content: "Drag the robot to avoid obstacles using its ultrasonic sensor.", data: { game: "avoid-obstacles" } },
      { id: "s4", type: "quiz", title: "Sensor Quiz", content: "Which sensor measures distance?", data: { question: "Which sensor measures distance?", options: ["Touch", "Ultrasonic", "Light", "Speaker"], answer: 1 } },
      { id: "s5", type: "project", title: "Build Challenge", content: "Design a robot that stops when it detects an obstacle. Discuss your plan with the AI tutor!" },
    ],
  },
  {
    id: "robotics-motors",
    ecosystemId: "gigarobotics",
    title: "Motors & Movement",
    description: "Discover how motors make robots move and turn.",
    slug: "motors-movement",
    order_index: 2,
    duration_minutes: 10,
    xp_reward: 55,
    coin_reward: 11,
    topic: "Motors",
    steps: [
      { id: "s1", type: "intro", title: "Power to Move", content: "Motors convert electrical energy into movement. Wheels, arms, and grippers all use motors!" },
      { id: "s2", type: "game", title: "Motor Match", content: "Match each motor type to its use.", data: { pairs: [{ motor: "DC Motor", use: "Wheels" }, { motor: "Servo", use: "Robot Arm" }] } },
      { id: "s3", type: "quiz", title: "Motor Quiz", content: "What do servo motors control best?", data: { question: "Servo motors are best for...", options: ["Exact angles", "Loud sounds", "Storing data", "Cooling"], answer: 0 } },
    ],
  },
  // GigaCoding
  {
    id: "coding-sequences",
    ecosystemId: "gigacoding",
    title: "Computational Thinking",
    description: "Learn sequences, loops, and conditions with block coding.",
    slug: "computational-thinking",
    order_index: 1,
    duration_minutes: 14,
    xp_reward: 70,
    coin_reward: 14,
    topic: "Block Coding",
    steps: [
      { id: "s1", type: "intro", title: "Think Like a Coder", content: "Coding is giving step-by-step instructions. Every program is a sequence of commands!" },
      { id: "s2", type: "simulation", title: "Block Builder", content: "Drag blocks to move the character to the goal.", data: { blocks: ["Move Forward", "Turn Left", "Turn Right", "Repeat 3"] } },
      { id: "s3", type: "quiz", title: "Logic Quiz", content: "What comes first in a program?", data: { question: "Programs run commands in...", options: ["Random order", "Sequence", "Reverse only", "No order"], answer: 1 } },
      { id: "s4", type: "ai-explain", title: "AI Coding Tutor", content: "Ask the AI to explain what a loop does.", data: { aiFeature: "coding_tutor" } },
      { id: "s5", type: "game", title: "Code Challenge", content: "Write the shortest sequence to reach the star!", data: { game: "code-maze" } },
    ],
  },
  {
    id: "coding-html",
    ecosystemId: "gigacoding",
    title: "HTML Basics",
    description: "Build your first web page with headings, paragraphs, and images.",
    slug: "html-basics",
    order_index: 2,
    duration_minutes: 12,
    xp_reward: 60,
    coin_reward: 12,
    topic: "HTML",
    steps: [
      { id: "s1", type: "intro", title: "Web Pages", content: "HTML is the language of web pages. Tags like <h1> and <p> structure content." },
      { id: "s2", type: "diagram", title: "HTML Structure", content: "See how a web page is built.", data: { parts: ["<html>", "<head>", "<body>", "<h1>"], emoji: "💻" } },
      { id: "s3", type: "quiz", title: "HTML Quiz", content: "Which tag creates a heading?", data: { question: "Heading tag?", options: ["<p>", "<h1>", "<img>", "<div>"], answer: 1 } },
    ],
  },
  // GigaArts
  {
    id: "arts-colour",
    ecosystemId: "gigaarts",
    title: "Colour Mixing",
    description: "Learn primary and secondary colours through interactive painting.",
    slug: "colour-mixing",
    order_index: 1,
    duration_minutes: 10,
    xp_reward: 50,
    coin_reward: 10,
    topic: "Painting",
    steps: [
      { id: "s1", type: "intro", title: "The Colour Wheel", content: "Red, blue, and yellow are primary colours. Mix them to create green, orange, and purple!" },
      { id: "s2", type: "simulation", title: "Mix Colours", content: "Tap two colours to see what they make.", data: { colours: ["Red", "Blue", "Yellow"], mixes: { "Red+Blue": "Purple", "Red+Yellow": "Orange", "Blue+Yellow": "Green" } } },
      { id: "s3", type: "game", title: "Colour Match", content: "Match the mixed colour to its name!", data: { game: "colour-match" } },
      { id: "s4", type: "voice", title: "Name the Colours", content: "Say the three primary colours aloud." },
    ],
  },
  {
    id: "arts-drawing",
    ecosystemId: "gigaarts",
    title: "Shape Drawing",
    description: "Draw circles, squares, and triangles to build pictures.",
    slug: "shape-drawing",
    order_index: 2,
    duration_minutes: 12,
    xp_reward: 55,
    coin_reward: 11,
    topic: "Drawing",
    steps: [
      { id: "s1", type: "intro", title: "Shapes Everywhere", content: "Every drawing starts with basic shapes — circles, squares, and triangles!" },
      { id: "s2", type: "diagram", title: "Shape Guide", content: "Learn to draw each shape.", data: { parts: ["Circle", "Square", "Triangle", "Rectangle"], emoji: "🎨" } },
      { id: "s3", type: "project", title: "Art Challenge", content: "Draw a house using only shapes. Take a photo or describe it to the AI art coach!" },
    ],
  },
  // GigaInnovation
  {
    id: "innovation-design-thinking",
    ecosystemId: "gigainnovation",
    title: "Design Thinking",
    description: "Empathise, define, ideate, prototype, and test solutions.",
    slug: "design-thinking",
    order_index: 1,
    duration_minutes: 15,
    xp_reward: 80,
    coin_reward: 16,
    topic: "Design Thinking",
    steps: [
      { id: "s1", type: "intro", title: "Solve Real Problems", content: "Design thinking helps you solve problems by understanding people first, then creating solutions." },
      { id: "s2", type: "diagram", title: "The 5 Steps", content: "Explore the design thinking process.", data: { parts: ["Empathise", "Define", "Ideate", "Prototype", "Test"], emoji: "💡" } },
      { id: "s3", type: "quiz", title: "Process Quiz", content: "What is the first step?", data: { question: "First step in design thinking?", options: ["Test", "Empathise", "Prototype", "Sell"], answer: 1 } },
      { id: "s4", type: "ai-explain", title: "Innovation Coach", content: "Describe a problem in your community and get AI brainstorming help.", data: { aiFeature: "lesson_generator" } },
      { id: "s5", type: "project", title: "Innovation Challenge", content: "Pick one problem and sketch three possible solutions. Share your best idea!" },
    ],
  },
  {
    id: "innovation-entrepreneur",
    ecosystemId: "gigainnovation",
    title: "Young Entrepreneur",
    description: "Learn how ideas become products that help people.",
    slug: "young-entrepreneur",
    order_index: 2,
    duration_minutes: 12,
    xp_reward: 70,
    coin_reward: 14,
    topic: "Entrepreneurship",
    steps: [
      { id: "s1", type: "intro", title: "Ideas to Business", content: "Entrepreneurs spot problems and create products or services that help people." },
      { id: "s2", type: "quiz", title: "Entrepreneur Quiz", content: "What does an entrepreneur do?", data: { question: "An entrepreneur...", options: ["Creates solutions", "Only plays games", "Ignores problems", "Never tries"], answer: 0 } },
      { id: "s3", type: "project", title: "Pitch Your Idea", content: "Create a 30-second pitch for a product that helps learners in your school." },
    ],
  },
];

export function getEcosystemLessons(ecosystemId: EcosystemId) {
  return ECOSYSTEM_LESSONS.filter((l) => l.ecosystemId === ecosystemId).sort(
    (a, b) => a.order_index - b.order_index,
  );
}
