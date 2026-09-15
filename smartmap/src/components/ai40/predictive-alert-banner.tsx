"use client";

import { AlertTriangle, Bot, Shield } from "lucide-react";
import type { PredictiveRisk } from "@/lib/ai40/types";
import { actionLabel } from "@/lib/ai40/predictive-safety";
import { cn } from "@/lib/utils";

interface PredictiveAlertBannerProps {
  risks: PredictiveRisk[];
  className?: string;
}

export function PredictiveAlertBanner({ risks, className }: PredictiveAlertBannerProps) {
  if (risks.length === 0) return null;

  const top = risks[0];

  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        top.isOfficial
          ? "border-red-300 bg-red-50 dark:border-red-500/40 dark:bg-red-950/30"
          : "border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-950/30",
        className,
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {top.isOfficial ? (
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        ) : (
          <Bot className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-sm">{top.label}</p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                top.isOfficial
                  ? "bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                  : "bg-amber-200 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
              )}
            >
              {top.isOfficial ? "Official alert" : "AI forecast"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{top.description}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
            <span>{top.confidencePercent}% confidence</span>
            <span>~{top.minutesToImpact} min to impact</span>
            <span>{top.affectedAreaKm.toFixed(1)} km area</span>
          </div>
          <p className="mt-2 text-xs font-bold text-sm-primary">
            {actionLabel(top.recommendedAction)}
            {top.alternateRouteHint ? ` · ${top.alternateRouteHint}` : ""}
          </p>
        </div>
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
      </div>

      {risks.length > 1 && (
        <p className="mt-2 text-xs text-slate-500">
          +{risks.length - 1} more potential hazard{risks.length > 2 ? "s" : ""} in the next 30 minutes
        </p>
      )}
    </div>
  );
}
