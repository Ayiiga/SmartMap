"use client";

import { useEffect } from "react";
import { startTurnByTurnVoice, stopTurnByTurnVoice } from "@/lib/navigation/voice-turn-by-turn";
import { useMapStore } from "@/stores/map-store";

interface NavigateVoiceRunnerProps {
  steps: string[];
  fromLabel?: string;
  toLabel?: string;
  navigating: boolean;
}

export function NavigateVoiceRunner({
  steps,
  fromLabel,
  toLabel,
  navigating,
}: NavigateVoiceRunnerProps) {
  const voiceNav = useMapStore((s) => s.voiceNav);
  const voiceLanguage = useMapStore((s) => s.voiceLanguage);

  useEffect(() => {
    if (!navigating || !voiceNav) {
      stopTurnByTurnVoice();
      return;
    }

    startTurnByTurnVoice({
      steps,
      fromLabel,
      toLabel,
      language: voiceLanguage,
      enabled: true,
    });

    return () => stopTurnByTurnVoice();
  }, [navigating, voiceNav, voiceLanguage, steps, fromLabel, toLabel]);

  return null;
}
