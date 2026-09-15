import { resolveRoutePreviewSteps } from "@/content/smart-map/ghana-route-steps";
import { localizeVoiceStep, speakLocalized, type VoiceLanguage } from "@/lib/navigation/voice-ghana";

export interface TurnByTurnOptions {
  steps: string[];
  fromLabel?: string;
  toLabel?: string;
  language: VoiceLanguage;
  enabled: boolean;
  intervalMs?: number;
}

let activeTimer: ReturnType<typeof setInterval> | null = null;
let stepIndex = 0;

export function stopTurnByTurnVoice(): void {
  if (activeTimer) {
    clearInterval(activeTimer);
    activeTimer = null;
  }
  stepIndex = 0;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function startTurnByTurnVoice(options: TurnByTurnOptions): void {
  stopTurnByTurnVoice();
  if (!options.enabled || options.steps.length === 0) return;

  const previewSteps = resolveRoutePreviewSteps(options.steps, options.fromLabel, options.toLabel);
  const interval = options.intervalMs ?? 6000;

  const speakCurrent = () => {
    if (stepIndex >= previewSteps.length) {
      stopTurnByTurnVoice();
      return;
    }
    const line = localizeVoiceStep(previewSteps[stepIndex], options.language);
    speakLocalized(line, options.language);
    stepIndex += 1;
  };

  speakCurrent();
  activeTimer = setInterval(speakCurrent, interval);
}
