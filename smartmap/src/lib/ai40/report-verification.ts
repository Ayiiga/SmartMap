import type { ReportType } from "@/types/smart-map";

export interface VerificationResult {
  verified: boolean;
  confidence: number;
  flags: string[];
  summary: string;
}

const SPAM_PATTERNS = [
  /\b(free money|click here|buy now|crypto)\b/i,
  /\b(test|asdf|xxx)\b/i,
];

const CREDIBLE_KEYWORDS: Partial<Record<ReportType, string[]>> = {
  accident: ["collision", "crash", "injured", "vehicle", "ambulance"],
  flood: ["water", "flooded", "impassable", "drainage", "rain"],
  fire: ["smoke", "flames", "burning", "fire service"],
  road_damage: ["pothole", "crack", "sinkhole", "damaged", "uneven"],
  crime: ["theft", "robbery", "assault", "suspicious"],
};

export function verifyCommunityReport(input: {
  type: ReportType;
  title: string;
  description: string;
  hasMedia?: boolean;
}): VerificationResult {
  const flags: string[] = [];
  const text = `${input.title} ${input.description}`.trim();

  if (text.length < 12) {
    flags.push("too_short");
  }
  if (text.length > 2000) {
    flags.push("too_long");
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      flags.push("spam_pattern");
    }
  }

  const keywords = CREDIBLE_KEYWORDS[input.type] ?? [];
  const keywordHits = keywords.filter((kw) => text.toLowerCase().includes(kw)).length;
  if (keywordHits === 0 && text.length > 20) {
    flags.push("low_relevance");
  }

  let confidence = 55 + keywordHits * 12;
  if (input.hasMedia) confidence += 15;
  if (text.length >= 30 && text.length <= 500) confidence += 8;
  confidence -= flags.length * 18;
  confidence = Math.max(15, Math.min(95, confidence));

  const verified = confidence >= 62 && !flags.includes("spam_pattern");

  const summary = verified
    ? `AI verified: ${input.type.replace(/_/g, " ")} report appears credible (${confidence}% confidence).`
    : `Report pending review (${confidence}% confidence). ${flags.length > 0 ? `Flags: ${flags.join(", ")}.` : ""}`;

  return { verified, confidence, flags, summary };
}
