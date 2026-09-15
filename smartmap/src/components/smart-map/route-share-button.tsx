"use client";

import { useEffect } from "react";
import { Share2 } from "lucide-react";
import { shareRouteMapScreenshot } from "@/lib/map/map-screenshot";

interface RouteShareButtonProps {
  routeLabel: string;
  disabled?: boolean;
}

export function RouteShareButton({ routeLabel, disabled }: RouteShareButtonProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => void shareRouteMapScreenshot(routeLabel)}
      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold disabled:opacity-40 dark:bg-white/10"
      aria-label="Share route map screenshot"
    >
      <Share2 className="h-4 w-4" />
      Share route
    </button>
  );
}
