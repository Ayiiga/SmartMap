"use client";

import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";

interface TeleprompterOverlayProps {
  script: string;
  isVisible: boolean;
  opacity?: number;
  speed?: number;
  onClose: () => void;
}

/**
 * GigaEdits teleprompter — top 25% overlay so the bottom 75% keeps the
 * subject visible. Controls stay interactive while script scrolls behind
 * pointer-events-none text.
 */
export function TeleprompterOverlay({
  script,
  isVisible,
  opacity = 0.7,
  speed = 1,
  onClose,
}: TeleprompterOverlayProps) {
  const [hidden, setHidden] = useState(false);
  const [level, setLevel] = useState(opacity);
  const [rate, setRate] = useState(speed);

  if (!isVisible) return null;

  return (
    <div
      className="absolute left-0 right-0 top-0 z-30 m-2 rounded-[12px] bg-black/70 p-3 backdrop-blur"
      style={{ height: "25%", opacity: hidden ? 0 : undefined }}
      role="dialog"
      aria-label="Teleprompter"
    >
      <div className="pointer-events-none h-full overflow-hidden">
        {!hidden && (
          <p
            className="animate-teleprompter-scroll whitespace-pre-wrap text-[14px] leading-relaxed text-white"
            style={{ animationDuration: `${Math.max(4, 20 / rate)}s` }}
          >
            {script}
          </p>
        )}
      </div>
      <div className="pointer-events-auto absolute -bottom-9 left-0 right-0 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setHidden((v) => !v)}
          aria-label={hidden ? "Show teleprompter" : "Hide teleprompter"}
          aria-pressed={!hidden}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"
        >
          {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        <span className="rounded-full bg-[#EAB308] px-2 py-0.5 text-[10px] font-bold text-black">
          TOP 25% · 70% subject visible below
        </span>
        <label className="flex items-center gap-1 text-[10px] font-bold text-white">
          Opacity
          <input
            type="range"
            min={50}
            max={100}
            value={Math.round(level * 100)}
            onChange={(e) => setLevel(Number(e.target.value) / 100)}
            aria-label="Teleprompter opacity"
            className="h-1 w-16"
          />
        </label>
        <button
          type="button"
          onClick={() => setRate((r) => (r >= 2 ? 0.5 : Math.round((r + 0.5) * 10) / 10))}
          aria-label="Teleprompter speed"
          className="rounded-full bg-black/50 px-2 py-1 text-[10px] font-bold text-white"
        >
          {rate.toFixed(1)}x
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close teleprompter"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-[#22c55e]" aria-hidden="true" />
    </div>
  );
}
