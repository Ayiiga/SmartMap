import { NextRequest, NextResponse } from "next/server";
import { runAIFeature } from "@/lib/ai/openai";
import { FEATURE_FLAGS } from "@/lib/features/flags";
import { rateLimit } from "@/lib/security/rate-limit";
import { sanitizeText } from "@/lib/security/validate";
import type { AIFeatureRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    if (!FEATURE_FLAGS.aiExpansionPhase3 && !FEATURE_FLAGS.publicSafetyPhase2) {
      // Allow map_assistant only when a later phase is enabled; Phase 1 does not expose AI UI.
      return NextResponse.json(
        { error: "AI features are disabled until Phase 2/3 flags are enabled." },
        { status: 403 },
      );
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const limited = rateLimit(`ai:${ip}`, 20, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many requests. Try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    const body = (await request.json()) as AIFeatureRequest;
    const feature = body.feature;
    const input = sanitizeText(body.input, 2000);

    if (!feature || !input) {
      return NextResponse.json({ error: "Missing feature or input" }, { status: 400 });
    }

    if (feature === "map_assistant" && !FEATURE_FLAGS.aiExpansionPhase3) {
      return NextResponse.json({ error: "AI assistant requires Phase 3." }, { status: 403 });
    }

    const response = await runAIFeature({ ...body, feature, input });
    return NextResponse.json({ response });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
