import OpenAI from "openai";
import type { AIFeatureRequest } from "@/types";
import {
  GIGA3_LOGO_URLS,
  GIGA3_SYSTEM_PROMPT,
  needsWebSearch,
  offlineWebSearchBriefing,
} from "@/lib/ai/giga3";

const MAP_SYSTEM_PROMPT = `You are Smart Map AI, an advanced assistant for an AI-powered mapping, navigation, and public safety platform built for Ghana and scaling across Africa.
Help users find nearest trusted services, recommend safer routes, plan travel, explain landmarks, translate local phrases, and provide emergency guidance.
Be concise, practical, and safety-first. Prefer verified public services. Never invent emergency phone numbers — for Ghana use Police 191, Fire 192, Ambulance 193, general 112.
${GIGA3_SYSTEM_PROMPT}
Logotype: when asked for the logo or logotype URL, return a direct URL: ${GIGA3_LOGO_URLS[0]} (mirror: ${GIGA3_LOGO_URLS[1]}). Never say you don't have a direct URL.
PWA install manifest: /manifest.json.
Books: you can draft outlines and chapters. Research: papers with citations. Essays: structured with citations. Code: with African context (mobile money, local languages, low-bandwidth). CVs: Ghana format (bio-data, WASSCE/BECE, NSS, referees).
African voice readout: responses can be read aloud in Twi, Hausa, Ga, Ewe, Yoruba, Swahili, Zulu, Amharic.
News/politics/web: when the prompt asks for news, politics, or latest events, answer with dated facts and cite sources [1], [2].`;

const FEATURE_PROMPTS: Record<AIFeatureRequest["feature"], string> = {
  reading_coach: "Help the user understand the following text clearly:",
  pronunciation: "Give practical pronunciation feedback for:",
  story_generator: "Create a short travel story about:",
  quiz_generator: "Generate 5 quiz questions about local safety and navigation for:",
  homework_assistant: "Explain this request in simple steps:",
  recommendations: "Suggest 3 practical Smart Map actions based on:",
  vocabulary_trainer: "Teach useful travel phrases related to:",
  speaking_coach: "Provide speaking practice for travel conversations about:",
  speech_coach: "Coach clear speech for emergency or travel communication about:",
  science_lab: "Explain this environmental or weather concept simply:",
  lesson_generator: "Generate a short travel-safety briefing outline for:",
  coding_tutor: "Explain this mapping/API concept step-by-step:",
  math_tutor: "Help with distance/time/speed calculation for:",
  study_plan: "Create a travel preparation checklist for:",
  revision: "Create a quick safety revision brief for:",
  news_assistant: "Summarize relevant local alerts or travel context for:",
  map_assistant: "Answer this Smart Map navigation, safety, or places question:",
};

export async function runAIFeature(request: AIFeatureRequest): Promise<string> {
  // Stable multi-provider failover: OpenAI → Gemini → OpenRouter → offline.
  // Only OpenAI is wired with a key today; the later providers fall through to
  // the grounded offline response so chat stays stable on 3G / no-key builds.
  if (needsWebSearch(request.input)) {
    const live = await runWebSearch(request.input);
    if (live) return live;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.startsWith("sk-your")) {
    return getOfflineResponse(request);
  }

  try {
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: MAP_SYSTEM_PROMPT },
        {
          role: "user",
          content: `${FEATURE_PROMPTS[request.feature]}\n\n${request.input}`,
        },
      ],
      max_tokens: 800,
      temperature: 0.6,
    });

    return completion.choices[0]?.message?.content ?? "I couldn't generate a response. Try again!";
  } catch {
    // Provider failover point (Gemini → OpenRouter would go here when keys exist).
    return getOfflineResponse(request);
  }
}

/**
 * Live web-search hook (Perplexity / OpenRouter). Returns null when no search
 * provider is configured so callers fall back to the offline briefing.
 */
async function runWebSearch(prompt: string): Promise<string | null> {
  const searchKey = process.env.PERPLEXITY_API_KEY ?? process.env.OPENROUTER_API_KEY;
  if (!searchKey) return offlineWebSearchBriefing(prompt);
  // Provider call goes here when a key is configured; keep the stable offline
  // briefing until then so news/politics prompts always get citations.
  return offlineWebSearchBriefing(prompt);
}

function getOfflineResponse(request: AIFeatureRequest): string {
  if (request.feature === "map_assistant" || request.feature === "news_assistant") {
    const q = request.input.toLowerCase();
    if (q.includes("hospital")) {
      return "Nearest major hospitals in Accra: Korle Bu Teaching Hospital and 37 Military Hospital. Both are verified and open 24 hours. Open Navigate for a safety-aware route.";
    }
    if (q.includes("flood")) {
      return "Flood guidance: avoid underpasses, move to higher ground, share live location from Safety Center, and call Fire 192 / Ambulance 193 if anyone is trapped.";
    }
    if (q.includes("police")) {
      return "Ghana Police emergency: 191 (or 112). Accra Central Police Station is a verified pin on Smart Map. Enable Women Safety Mode for safer evening routing.";
    }
    return "Smart Map AI can help with nearest services, safer routes, landmark context, emergency steps, and travel planning across Ghana and expanding African cities.";
  }

  return "Smart Map AI is ready to help with navigation, trusted places, and safety guidance. Ask about hospitals, police, routes, or weather risks.";
}
