"use client";

import { Languages, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/map-store";
import type { VoiceLanguage } from "@/lib/navigation/voice-ghana";
import { voiceLanguageLabel } from "@/lib/navigation/voice-ghana";

interface NavigateVoiceControlsProps {
  className?: string;
}

export function NavigateVoiceControls({ className }: NavigateVoiceControlsProps) {
  const voiceNav = useMapStore((s) => s.voiceNav);
  const setVoiceNav = useMapStore((s) => s.setVoiceNav);
  const voiceLanguage = useMapStore((s) => s.voiceLanguage);
  const setVoiceLanguage = useMapStore((s) => s.setVoiceLanguage);

  const toggleLanguage = () => {
    const next: VoiceLanguage = voiceLanguage === "en" ? "tw" : "en";
    setVoiceLanguage(next);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => setVoiceNav(!voiceNav)}
        className={cn(
          "inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold",
          voiceNav ? "bg-sm-emerald text-white" : "bg-slate-100 dark:bg-white/10",
        )}
        aria-pressed={voiceNav}
      >
        {voiceNav ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        Voice {voiceNav ? "ON" : "OFF"}
      </button>
      <button
        type="button"
        onClick={toggleLanguage}
        disabled={!voiceNav}
        className={cn(
          "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold",
          voiceNav
            ? "bg-sm-primary/10 text-sm-primary"
            : "bg-slate-100 opacity-50 dark:bg-white/10",
        )}
        aria-label={`Voice language ${voiceLanguageLabel(voiceLanguage)}`}
      >
        <Languages className="h-4 w-4" />
        {voiceLanguage === "en" ? "EN" : "TW"}
      </button>
    </div>
  );
}
