"use client";

import { Navigation } from "lucide-react";
import { resolveRoutePreviewSteps } from "@/content/smart-map/ghana-route-steps";
import type { AdvancedRoutePlan } from "@/lib/navigation/types";
import {
  routeSummaryDescription,
  routeSummaryHeadline,
} from "@/lib/navigation/route-detail-formatter";
import { cn } from "@/lib/utils";

interface SmartMapRouteSidebarProps {
  active: AdvancedRoutePlan | null;
  destLabel?: string;
  onStartNavigation: () => void;
  navigating?: boolean;
  className?: string;
}

export function SmartMapRouteSidebar({
  active,
  destLabel,
  onStartNavigation,
  navigating = false,
  className,
}: SmartMapRouteSidebarProps) {
  if (!active) return null;

  const steps = resolveRoutePreviewSteps(
    active.steps,
    active.from.label,
    active.to.label,
  );

  return (
    <aside
      className={cn(
        "pointer-events-auto w-full max-w-[300px] rounded-2xl border border-white/10 bg-[#0A0E23]/92 p-4 shadow-2xl backdrop-blur-xl",
        className,
      )}
    >
      <p className="text-xs font-semibold text-slate-400">
        To {destLabel ?? active.to.label}
      </p>
      <p className="mt-1 font-display text-xl font-extrabold text-white">
        via {active.to.label.split(",")[0]} Road
      </p>

      <div className="mt-3 rounded-xl bg-[#12182F]/80 px-3 py-2.5">
        <p className="text-lg font-extrabold text-[#60A5FA]">
          {routeSummaryHeadline(active)}
        </p>
        <p className="text-xs text-slate-400">{routeSummaryDescription(active)}</p>
      </div>

      <button
        type="button"
        onClick={onStartNavigation}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#3B82F6]/30"
      >
        <Navigation className="h-4 w-4" />
        {navigating ? "Navigating…" : "Start Navigation"}
      </button>

      <div className="mt-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Directions
        </p>
        <ol className="mt-2 space-y-2">
          {steps.slice(0, 6).map((step, i) => (
            <li key={i} className="flex gap-2 text-xs text-slate-300">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3B82F6]/20 text-[10px] font-bold text-[#60A5FA]">
                {i + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
