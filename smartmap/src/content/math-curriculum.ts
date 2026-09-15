import type { Lesson } from "@/types";

function mathLesson(
  id: string,
  slug: string,
  order: number,
  title: string,
  description: string,
  activities: Lesson["content"]["activities"],
  xp = 65,
): Lesson {
  return {
    id,
    level: "mathematics",
    title,
    description,
    slug,
    order_index: order,
    duration_minutes: 10 + (order % 5),
    xp_reward: xp,
    coin_reward: Math.round(xp / 5),
    is_premium: false,
    content: { type: "mathematics", activities },
  };
}

export const MATH_LESSONS: Lesson[] = [
  mathLesson("math-numbers-0-5", "number-recognition-0-5", 1, "Numbers 0 to 5", "Recognize and name numbers zero through five", [
    { id: "n05", type: "quiz", title: "Pick the number 3", data: { mathType: "number-recognition", target: 3, options: [1, 3, 5, 2] } },
  ]),
  mathLesson("math-numbers-6-10", "number-recognition-6-10", 2, "Numbers 6 to 10", "Recognize and name numbers six through ten", [
    { id: "n610", type: "quiz", title: "Pick the number 8", data: { mathType: "number-recognition", target: 8, options: [6, 8, 10, 7] } },
  ]),
  mathLesson("math-count-1-5", "counting-1-5", 3, "Counting 1 to 5", "Recognize and count numbers one through five", [
    { id: "m1", type: "matching", title: "Count the objects", data: { mathType: "counting", range: [1, 5], emoji: "🍎" } },
  ]),
  mathLesson("math-count-6-10", "counting-6-10", 4, "Counting 6 to 10", "Practice counting higher numbers", [
    { id: "m2", type: "matching", title: "Count the stars", data: { mathType: "counting", range: [6, 10], emoji: "⭐" } },
  ]),
  mathLesson("math-addition-basics", "addition-basics", 5, "Adding Together", "Simple addition with pictures", [
    { id: "m3", type: "quiz", title: "1 + 1 = ?", data: { mathType: "addition", a: 1, b: 1, answer: 2 } },
    { id: "m3b", type: "quiz", title: "2 + 2 = ?", data: { mathType: "addition", a: 2, b: 2, answer: 4 } },
  ]),
  mathLesson("math-subtraction-basics", "subtraction-basics", 6, "Taking Away", "Simple subtraction with visuals", [
    { id: "sub1", type: "quiz", title: "5 - 2 = ?", data: { mathType: "subtraction", a: 5, b: 2, answer: 3 } },
    { id: "sub2", type: "quiz", title: "4 - 1 = ?", data: { mathType: "subtraction", a: 4, b: 1, answer: 3 } },
  ]),
  mathLesson("math-multiplication-intro", "multiplication-intro", 7, "Groups of Numbers", "Introduction to multiplication as equal groups", [
    { id: "mul1", type: "quiz", title: "2 groups of 3", data: { mathType: "multiplication", a: 2, b: 3, answer: 6 } },
  ]),
  mathLesson("math-division-intro", "division-intro", 8, "Sharing Fairly", "Introduction to division as sharing", [
    { id: "div1", type: "quiz", title: "6 shared by 2", data: { mathType: "division", a: 6, b: 2, answer: 3 } },
  ]),
  mathLesson("math-place-value", "place-value", 9, "Tens and Ones", "Understand place value with blocks", [
    { id: "pv1", type: "quiz", title: "How many tens in 30?", data: { mathType: "place-value", prompt: "tens-in", target: 30, answer: 3 } },
  ]),
  mathLesson("math-fractions-halves", "fractions-halves", 10, "Halves and Quarters", "Learn basic fractions with pizza slices", [
    { id: "fr1", type: "quiz", title: "Half of 8", data: { mathType: "fraction", numerator: 1, denominator: 2, whole: 8, answer: 4 } },
  ]),
  mathLesson("math-decimals-intro", "decimals-intro", 11, "Tenths and Hundredths", "Introduction to decimal numbers", [
    { id: "dec1", type: "quiz", title: "0.5 as a fraction", data: { mathType: "decimal", value: 0.5, answer: "one half" } },
  ]),
  mathLesson("math-money-coins", "money-coins", 12, "Counting Coins", "Add coins to make amounts", [
    { id: "money1", type: "quiz", title: "2 coins + 3 coins", data: { mathType: "money", coins: [2, 3], answer: 5, unit: "cents" } },
  ]),
  mathLesson("math-time-clock", "time-clock", 13, "Telling Time", "Read the clock to the hour", [
    { id: "time1", type: "quiz", title: "What time is it?", data: { mathType: "time", hour: 3, minute: 0, answer: "3:00" } },
  ]),
  mathLesson("math-measurement-length", "measurement-length", 14, "Measuring Length", "Compare and measure objects", [
    { id: "meas1", type: "matching", title: "Which is longer?", data: { mathType: "measurement", items: ["pencil", "ruler"], answer: "ruler" } },
  ]),
  mathLesson("math-geometry-shapes", "geometry-shapes", 15, "Shapes Around Us", "Identify circles, squares, triangles", [
    { id: "geo1", type: "quiz", title: "How many sides on a triangle?", data: { mathType: "geometry", shape: "triangle", answer: 3 } },
  ]),
  mathLesson("math-patterns", "patterns", 16, "Number Patterns", "Find the next number in a pattern", [
    { id: "pat1", type: "quiz", title: "2, 4, 6, ?", data: { mathType: "pattern", sequence: [2, 4, 6], answer: 8 } },
  ]),
  mathLesson("math-logic-reasoning", "logic-reasoning", 17, "Logic Puzzles", "Solve simple reasoning problems", [
    { id: "logic1", type: "quiz", title: "If 2 cats have 4 legs, 3 cats have?", data: { mathType: "logic", answer: 6 } },
  ]),
  mathLesson("math-mental-math", "mental-math", 18, "Mental Math Sprint", "Quick mental arithmetic practice", [
    { id: "mental1", type: "quiz", title: "10 + 5 = ?", data: { mathType: "mental-math", a: 10, b: 5, operation: "+", answer: 15 } },
    { id: "mental2", type: "quiz", title: "9 - 4 = ?", data: { mathType: "mental-math", a: 9, b: 4, operation: "-", answer: 5 } },
  ]),
  mathLesson("math-drag-add", "drag-addition", 19, "Drag to Add", "Drag objects to solve addition", [
    { id: "drag1", type: "matching", title: "Drag 3 apples + 2 apples", data: { mathType: "drag-add", a: 3, b: 2, emoji: "🍎", answer: 5 } },
  ]),
  mathLesson("math-sing-count", "sing-counting", 20, "Counting Song", "Learn counting with a rhyme", [
    { id: "sing1", type: "listening", title: "Count with the song", data: { mathType: "sing", rhyme: "One, two, buckle my shoe", range: [1, 10] } },
  ]),
];
