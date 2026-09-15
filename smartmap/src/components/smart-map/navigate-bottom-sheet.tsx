"use client";

import { useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  FastForward,
  Navigation,
  Route,
} from "lucide-react";
import { resolveRoutePreviewSteps } from "@/content/smart-map/ghana-route-steps";
import type { AdvancedRoutePlan } from "@/lib/navigation/types";
import type { TravelMode } from "@/types/smart-map";
import type { NavEndpoint } from "@/lib/geo/types";
import { formatDuration } from "@/lib/navigation/route-engine";
import { routeHasTolls, routeSummaryDescription, routeTollLabel } from "@/lib/navigation/route-detail-formatter";
import { cn } from "@/lib/utils";
import { RouteShareButton } from "@/components/smart-map/route-share-button";

type SheetSnap = "peek" | "half";

interface NavigateBottomSheetProps {
  origin: NavEndpoint | null;
  dest: NavEndpoint | null;
  routes: AdvancedRoutePlan[];
  active: AdvancedRoutePlan | null;
  onSelectPreference: (pref: "fastest" | "shortest" | "safest") => void;
  travelMode: TravelMode;
  onTravelModeChange: (mode: TravelMode) => void;
  multiModeEta: Record<TravelMode, AdvancedRoutePlan> | null;
  safety: Array<{ id: string; label: string; message: string }>;
  navigating: boolean;
  previewMode?: boolean;
  onSwap: () => void;
  onPreview: () => void;
  onStartNavigation: () => void;
  modes: { id: TravelMode; label: string; icon: typeof Navigation }[];
}

export function NavigateBottomSheet({
  origin,
  dest,
  routes,
  active,
  onSelectPreference,
  navigating,
  previewMode = false,
  onSwap,
  onPreview,
  onStartNavigation,
}: NavigateBottomSheetProps) {
  const [snap, setSnap] = useState<SheetSnap>("half");
  const [stepsOpen, setStepsOpen] = useState(false);

  if (!origin || !dest || !active) return null;

  const previewSteps = resolveRoutePreviewSteps(active.steps, origin.label, dest.label);
  const tolls = routeHasTolls(active);
  const maxHeight = snap === "peek" ? "28vh" : "40vh";

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 pb-[calc(4.5rem+env(safe-area-inset-bottom))]"
      aria-label="Route details"
    >
      <div
        className="pointer-events-auto mx-auto flex w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-[#1E293B] bg-[#141C2F]/97 shadow-2xl backdrop-blur-xl"
        style={{ maxHeight }}
      >
        <button
          type="button"
          onClick={() => setSnap(snap === "peek" ? "half" : "peek")}
          className="flex shrink-0 items-center justify-center gap-2 border-b border-[#1E293B] px-4 py-2"
          aria-label="Adjust panel height"
        >
          <div className="h-1 w-10 rounded-full bg-[#334155]" />
          {snap === "peek" ? (
            <ChevronUp className="h-4 w-4 text-[#64748B]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#64748B]" />
          )}
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm text-[#94A3B8]">
                {origin.label} → {dest.label}
              </p>
            </div>
            <button
              type="button"
              onClick={onSwap}
              className="rounded-full p-1 text-[#94A3B8] hover:bg-[#1E293B]"
              aria-label="Swap endpoints"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-3 font-display text-[32px] font-bold leading-tight text-[#FB923C]">
            {formatDuration(active.durationMin)} (
            {active.distanceKm < 1 ? active.distanceKm.toFixed(1) : active.distanceKm.toFixed(0)} km)
          </p>
          <p className="mt-1 text-sm text-[#94A3B8]">{routeSummaryDescription(active)}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold",
                tolls ? "bg-amber-500/15 text-amber-400" : "bg-[#0F2A1F] text-[#10B981]",
              )}
            >
              {routeTollLabel(active)}
            </span>
            <span className="rounded-full bg-[#1A253C] px-3 py-1 text-xs font-bold text-[#94A3B8]">
              Safety {active.safetyScore}/100
            </span>
            <span className="rounded-full bg-[#1A253C] px-3 py-1 text-xs font-bold text-[#F8FAFC]">
              ETA {new Date(active.etaIso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {routes.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {routes.map((route) => (
                <button
                  key={route.id}
                  type="button"
                  onClick={() =>
                    onSelectPreference(route.preference as "fastest" | "shortest" | "safest")
                  }
                  className={cn(
                    "min-w-[7rem] shrink-0 rounded-xl border px-3 py-2 text-left text-xs",
                    active.id === route.id
                      ? "border-[#3B82F6] bg-[#3B82F6]/10 text-[#F8FAFC]"
                      : "border-[#2A3A5C] text-[#94A3B8]",
                  )}
                >
                  <p className="font-bold">{route.label}</p>
                  <p>{formatDuration(route.durationMin)}</p>
                </button>
              ))}
            </div>
          )}

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setStepsOpen((v) => !v)}
              className="flex w-full items-center justify-between text-xs font-bold uppercase text-[#64748B]"
            >
              Turn-by-turn
              {stepsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {stepsOpen && (
              <ol className="mt-2 space-y-2">
                {previewSteps.map((step, index) => (
                  <li
                    key={`${index}-${step}`}
                    className="flex gap-3 rounded-xl bg-[#0A0F1E] px-3 py-2.5 text-sm text-[#F8FAFC]"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3B82F6]/20 text-xs font-bold text-[#60A5FA]">
                      {index + 1}
                    </span>
                    <span className="flex min-w-0 items-center gap-2">
                      <Route className="h-4 w-4 shrink-0 text-[#60A5FA]" />
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={!active}
              onClick={onPreview}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0D9488] px-4 text-sm font-bold text-white disabled:opacity-40"
            >
              <FastForward className="h-4 w-4" />
              Preview
            </button>
            <button
              type="button"
              disabled={!active}
              onClick={onStartNavigation}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[#3B82F6] px-4 text-sm font-bold text-white disabled:opacity-40"
            >
              <Navigation className="h-4 w-4" />
              {navigating ? "Navigating…" : previewMode ? "Start" : "Navigate"}
            </button>
            <RouteShareButton routeLabel={active.label} disabled={!active} />
          </div>
        </div>
      </div>
    </div>
  );
}
