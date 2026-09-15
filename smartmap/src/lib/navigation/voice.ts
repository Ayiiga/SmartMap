import type { AdvancedRoutePlan, SafetyWarning } from "@/lib/navigation/types";
import { warningVoiceLine } from "@/lib/navigation/safety-analysis";
import { formatDuration } from "@/lib/navigation/route-engine";

export function turnGuidanceLine(distanceMeters: number, direction: "left" | "right" | "straight"): string {
  const rounded =
    distanceMeters >= 1000
      ? `${(distanceMeters / 1000).toFixed(distanceMeters >= 2000 ? 0 : 1)} kilometers`
      : `${Math.round(distanceMeters / 10) * 10} meters`;
  if (direction === "straight") return `Continue straight for ${rounded}.`;
  return `Turn ${direction} in ${rounded}.`;
}

export function hospitalAheadLine(distanceKm: number): string {
  return `Hospital ${distanceKm.toFixed(distanceKm >= 10 ? 0 : 1)} km ahead.`;
}

export function policeNearbyLine(): string {
  return "Police station nearby.";
}

export function buildVoiceScript(plan: AdvancedRoutePlan): string[] {
  const lines: string[] = [
    `Starting ${plan.label.toLowerCase()} route. ${plan.distanceKm.toFixed(1)} kilometers, about ${formatDuration(plan.durationMin)}.`,
    turnGuidanceLine(200, "left"),
  ];

  for (const warning of plan.warnings.slice(0, 3)) {
    lines.push(warningVoiceLine(warning));
  }

  if (plan.mode === "driving" || plan.mode === "motorcycle") {
    lines.push(hospitalAheadLine(Math.max(1, plan.distanceKm * 0.4)));
  }
  lines.push(policeNearbyLine());
  lines.push(`Arrive at ${plan.to.label}.`);
  return lines;
}

export function speakText(text: string): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
    return true;
  } catch {
    return false;
  }
}

export function speakWarning(warning: SafetyWarning): boolean {
  return speakText(warningVoiceLine(warning));
}
