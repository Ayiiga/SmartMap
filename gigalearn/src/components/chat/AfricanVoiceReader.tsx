"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface AfricanVoice {
  id: string;
  label: string;
  flag: string;
  lang: string;
}

export const AFRICAN_VOICES: AfricanVoice[] = [
  { id: "abena-twi", label: "Abena Twi", flag: "🇬🇭", lang: "ak-GH" },
  { id: "musa-hausa", label: "Musa Hausa", flag: "🇬🇭", lang: "ha-GH" },
  { id: "naa-ga", label: "Naa Ga", flag: "🇬🇭", lang: "gaa-GH" },
  { id: "ewe", label: "Ewe", flag: "🇬🇭", lang: "ee-GH" },
  { id: "yoruba", label: "Yoruba", flag: "🇳🇬", lang: "yo-NG" },
  { id: "swahili", label: "Swahili", flag: "🇰🇪", lang: "sw-KE" },
];

function pickSpeechVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const base = lang.split("-")[0].toLowerCase();
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase())) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(base)) ??
    voices.find((v) => v.lang.toLowerCase().startsWith("en")) ??
    null
  );
}

/**
 * African voice reader bar rendered below each AI response.
 * Uses the on-device Web Speech API (no API keys, works on 3G, 1 credit
 * accounting stays server-side). Default: Twi female, slow + clear.
 */
export function AfricanVoiceReader({ text }: { text: string }) {
  const [voiceId, setVoiceId] = useState("abena-twi");
  const [rate, setRate] = useState(0.9);
  const [playing, setPlaying] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.getVoices();
    const onVoices = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", onVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", onVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  function stop() {
    window.speechSynthesis.cancel();
    setPlaying(false);
  }

  function play() {
    if (!("speechSynthesis" in window)) return;
    if (playing) {
      stop();
      return;
    }
    const voice = AFRICAN_VOICES.find((v) => v.id === voiceId) ?? AFRICAN_VOICES[0];
    const utter = new SpeechSynthesisUtterance(text.slice(0, 2000));
    utter.lang = voice.lang;
    utter.rate = rate;
    const match = pickSpeechVoice(voice.lang);
    if (match) utter.voice = match;
    utter.onend = () => setPlaying(false);
    utter.onerror = () => setPlaying(false);
    utterRef.current = utter;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
    setPlaying(true);
  }

  function download() {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "giga3-response.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (typeof window !== "undefined" && !("speechSynthesis" in window)) return null;

  return (
    <div className="mt-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-2" aria-label="Read with African voice">
      <p className="px-1 pb-1 text-[11px] font-bold text-[#374151]">
        🔊 Read with African voice <span className="font-normal text-[#9CA3AF]">(1 credit / 500 chars)</span>
      </p>
      <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto">
        {AFRICAN_VOICES.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setVoiceId(v.id)}
            aria-pressed={voiceId === v.id}
            title={`${v.label} ${v.flag}`}
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-[12px] font-semibold",
              voiceId === v.id
                ? "border-[#EAB308] bg-[#EAB308] text-black"
                : "border-[#E5E7EB] bg-white text-[#374151]",
            )}
          >
            {v.label} {v.flag}
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex items-center gap-2 px-1">
        <button
          type="button"
          onClick={play}
          aria-label={playing ? "Pause African voice" : "Play African voice"}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAB308] text-black"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => setRate((r) => (r >= 1.5 ? 0.9 : Math.round((r + 0.2) * 10) / 10))}
          aria-label="Playback speed"
          className="min-h-[32px] rounded-full bg-white px-2.5 text-[12px] font-bold text-[#374151]"
        >
          {rate.toFixed(1)}x
        </button>
        <button
          type="button"
          onClick={download}
          aria-label="Download response"
          className="flex min-h-[32px] items-center gap-1 rounded-full bg-white px-2.5 text-[12px] font-bold text-[#374151]"
        >
          <Download className="h-3.5 w-3.5" /> Save
        </button>
      </div>
    </div>
  );
}
