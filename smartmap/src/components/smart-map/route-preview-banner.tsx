"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Navigation2 } from "lucide-react";
import { resolveRoutePreviewSteps } from "@/content/smart-map/ghana-route-steps";
import { cn } from "@/lib/utils";

interface RoutePreviewBannerProps {
  steps: string[];
  fromLabel?: string;
  toLabel?: string;
  active: boolean;
  className?: string;
}

export function RoutePreviewBanner({
  steps,
  fromLabel,
  toLabel,
  active,
  className,
}: RoutePreviewBannerProps) {
  const previewSteps = resolveRoutePreviewSteps(steps, fromLabel, toLabel);
  const [stepIndex, setStepIndex] = useState(0);

  if (!active || previewSteps.length === 0) return null;

  const current = previewSteps[Math.min(stepIndex, previewSteps.length - 1)];

  return (
    <div
      className={cn(
        "pointer-events-auto absolute inset-x-0 top-0 z-30 border-b border-white/20 bg-white/97 shadow-lg backdrop-blur-xl dark:bg-[#0B1220]/97",
        className,
      )}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1A73E8]/10">
          <Navigation2 className="h-5 w-5 text-[#1A73E8]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Route preview · Step {stepIndex + 1} of {previewSteps.length}
          </p>
          <p className="truncate text-base font-bold text-slate-900 dark:text-white">{current}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white p-0.5 dark:border-white/10 dark:bg-white/5">
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="rounded-lg p-2 disabled:opacity-30"
            aria-label="Previous step"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.min(previewSteps.length - 1, i + 1))}
            disabled={stepIndex >= previewSteps.length - 1}
            className="rounded-lg p-2 disabled:opacity-30"
            aria-label="Next step"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
