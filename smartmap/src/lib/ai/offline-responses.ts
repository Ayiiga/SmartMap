import type { AIFeatureRequest } from "@/types";

export function getOfflineAIResponse(request: AIFeatureRequest): string {
  const responses: Record<AIFeatureRequest["feature"], string> = {
    reading_coach:
      "Great job reading! 🌟 Let's break it down: read each word slowly, sound it out, and look at the pictures for clues. You're doing amazing!",
    pronunciation:
      "Nice try! 🎤 Remember to open your mouth wide for vowel sounds. Listen to the audio and repeat slowly. Practice makes perfect!",
    story_generator:
      "Once upon a time, a little lion named Leo lived in the African savanna. Leo loved to learn new words every day. One sunny morning, Leo found a magical book that taught him to read. He shared his new skills with all his friends. The end! 📚",
    quiz_generator:
      "1. What letter does 'Apple' start with? (A/B/C)\n2. Which word rhymes with 'cat'? (hat/bat/sun)\n3. How many syllables in 'elephant'? (2/3/4)\n4. What is the opposite of 'big'? (small/tall/fast)\n5. Complete: The cat ___ on the mat. (sat/run/jump)",
    homework_assistant:
      "Let's work through this together! 💡 Break the task into small steps. Read the instructions aloud, try one example, and ask for help if you get stuck.",
    recommendations:
      "Based on your progress, try:\n1. 🅰️ Alphabet Adventure — Letter tracing\n2. 🔤 GigaPhonics — CVC word blending\n3. 📖 Story time — Read a short story aloud",
    vocabulary_trainer:
      "Word: Happy 😊\nMeaning: Feeling good and smiling\nExample: I am happy when I play with friends.\n\nWord: Brave 🦁\nMeaning: Not afraid to try new things\nExample: The brave girl read aloud in class.",
    speaking_coach:
      "Let's practice speaking! 🗣️ Try saying: 'Hello, my name is ___. I like to ___.' Speak slowly and clearly. Great job practicing!",
    speech_coach:
      "Focus on speaking clearly! 🎤 Take a breath, speak at a steady pace, and emphasise important words.",
    science_lab:
      "🔬 In our virtual lab: observe carefully, ask 'what if?' questions, and test your ideas safely.",
    lesson_generator:
      "📋 Lesson Plan: Warm-up → Explore → Activity → Quiz → Reflection. Great for structured learning!",
    coding_tutor:
      "💻 Break the problem into small commands. Test each step. Fix errors and try again!",
    math_tutor:
      "🔢 Read carefully → Draw or count → Solve step by step → Check your answer!",
    study_plan:
      "📅 Spread practice across the week: phonics, math, reading, and review sessions.",
    revision:
      "🔄 Review vocabulary, try 3 quiz questions, read aloud, and celebrate what you remember!",
    news_assistant:
      "Smart Map briefing: check Community Alerts for floods, traffic, and verified hazards. Ask about a city, route, or emergency service.",
    map_assistant:
      "I can help with nearest services, safer routes, landmark context, emergency steps, and travel planning across Ghana and Africa. Ask something specific.",
  };

  return responses[request.feature];
}
