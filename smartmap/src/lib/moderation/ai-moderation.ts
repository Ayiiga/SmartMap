/**
 * Phase 5 AI moderation helpers for reviews and community reports.
 * Pure heuristics — no network calls; safe to run offline.
 */

export type ModerationLabel =
  | "clean"
  | "spam"
  | "offensive"
  | "fake_report"
  | "duplicate";

export interface ModerationResult {
  label: ModerationLabel;
  score: number;
  reasons: string[];
}

const OFFENSIVE = /\b(kill|hate|idiot|stupid|terror)\b/i;
const SPAM = /(https?:\/\/|buy now|click here|win prize|crypto giveaway)/i;
const FAKE = /(totally fake|definitely fake|this never happened|made up story)/i;

export function moderateText(input: string, recentHashes: string[] = []): ModerationResult {
  const text = input.trim();
  const reasons: string[] = [];
  let label: ModerationLabel = "clean";
  let score = 0.05;

  if (!text) {
    return { label: "spam", score: 0.9, reasons: ["empty content"] };
  }

  const hash = simpleHash(text.toLowerCase());
  if (recentHashes.includes(hash)) {
    return { label: "duplicate", score: 0.95, reasons: ["duplicate submission detected"] };
  }

  if (SPAM.test(text)) {
    label = "spam";
    score = 0.88;
    reasons.push("promotional or link spam patterns");
  }

  if (OFFENSIVE.test(text)) {
    label = "offensive";
    score = Math.max(score, 0.82);
    reasons.push("potentially offensive language");
  }

  if (FAKE.test(text)) {
    label = "fake_report";
    score = Math.max(score, 0.75);
    reasons.push("self-declared or likely fabricated report language");
  }

  return { label, score, reasons };
}

export function simpleHash(value: string): string {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return String(h);
}
