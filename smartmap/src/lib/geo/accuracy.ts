export type AccuracyTier = "excellent" | "good" | "fair" | "low" | "very_low" | "unknown";

export interface AccuracyInfo {
  tier: AccuracyTier;
  label: string;
  guidance: string | null;
  isLow: boolean;
}

export function getAccuracyTier(accuracyM: number | null | undefined): AccuracyTier {
  if (accuracyM == null || !Number.isFinite(accuracyM)) return "unknown";
  if (accuracyM < 20) return "excellent";
  if (accuracyM < 50) return "good";
  if (accuracyM < 150) return "fair";
  if (accuracyM < 500) return "low";
  return "very_low";
}

const TIER_LABELS: Record<AccuracyTier, string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  low: "Low",
  very_low: "Very low",
  unknown: "Unknown",
};

export function getAccuracyInfo(accuracyM: number | null | undefined): AccuracyInfo {
  const tier = getAccuracyTier(accuracyM);
  const isLow = tier === "low" || tier === "very_low";
  return {
    tier,
    label: TIER_LABELS[tier],
    guidance: isLow
      ? "Location accuracy is low. Move outdoors or enable precise location."
      : null,
    isLow,
  };
}

export function formatRelativeTime(timestamp: number | null | undefined): string {
  if (!timestamp) return "—";
  const diff = Date.now() - timestamp;
  if (diff < 15_000) return "Just now";
  if (diff < 60_000) return `${Math.round(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)} min ago`;
  return new Date(timestamp).toLocaleTimeString();
}

export function isStaleLocation(updatedAt: number | null | undefined, maxAgeMs = 120_000): boolean {
  if (!updatedAt) return true;
  return Date.now() - updatedAt > maxAgeMs;
}
