"use client";

import { useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  FastForward,
  Leaf,
  Navigation,
  Plus,
  Route,
  ShieldAlert,
} from "lucide-react";
import { resolveRoutePreviewSteps } from "@/content/smart-map/ghana-route-steps";
import type { AdvancedRoutePlan } from "@/lib/navigation/types";
import type { TravelMode } from "@/types/smart-map";
import type { NavEndpoint } from "@/lib/geo/types";
import {
  formatDuration,
} from "@/lib/navigation/route-engine";
import {
  routeEcoLabel,
  routeHasTolls,
  routeSummaryDescription,
  routeSummaryHeadline,
  routeTollLabel,
} from "@/lib/navigation/route-detail-formatter";
import { cn } from "@/lib/utils";
import { NavigateVoiceControls } from "@/components/smart-map/navigate-voice-controls";
import { RouteShareButton } from "@/components/smart-map/route-share-button";

type SheetSnap = "peek" | "half" | "full";

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
  travelMode,
  onTravelModeChange,
  multiModeEta,
  safety,
  navigating,
  previewMode = false,
  onSwap,
  onPreview,
  onStartNavigation,
  modes,
}: NavigateBottomSheetProps) {
  const [snap, setSnap] = useState<SheetSnap>("half");

  if (!active || !origin || !dest) return null;

  const previewSteps = resolveRoutePreviewSteps(active.steps, origin.label, dest.label);
  const tolls = routeHasTolls(active);
  const eco = routeEcoLabel(active);

  const snapClass =
    snap === "peek"
      ? "max-h-[28vh]"
      : snap === "half"
        ? "max-h-[52vh]"
        : "max-h-[78vh]";

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 pb-[calc(4.5rem+env(safe-area-inset-bottom))]"
      aria-label="Route details"
    >
      <div
        className={cn(
          "pointer-events-auto mx-auto flex w-full max-w-xl flex-col rounded-t-[1.75rem] border border-white/30 bg-white/97 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0B1220]/97",
          snapClass,
        )}
      >
        <div className="flex shrink-0 items-center justify-center gap-3 border-b border-slate-200/80 px-4 py-2 dark:border-white/10">
          <button
            type="button"
            onClick={() => setSnap(snap === "full" ? "half" : snap === "half" ? "peek" : "half")}
            className="flex flex-1 items-center justify-center gap-1 text-xs font-semibold text-slate-500"
            aria-label="Adjust panel height"
          >
            {snap === "peek" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Drag map to zoom · pinch with two fingers
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-sm-emerald">Drive</p>
              <p className="truncate text-sm text-slate-600 dark:text-slate-300">
                {origin.label} → {dest.label}
              </p>
            </div>
            <button
              type="button"
              onClick={onSwap}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              aria-label="Swap endpoints"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-5 gap-1">
            {modes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onTravelModeChange(id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-bold",
                  travelMode === id
                    ? "bg-sm-primary text-white"
                    : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {multiModeEta ? formatDuration(multiModeEta[id].durationMin) : label}
              </button>
            ))}
          </div>

          <p className="mt-4 font-display text-3xl font-extrabold text-orange-600 dark:text-orange-400">
            {routeSummaryHeadline(active)}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {routeSummaryDescription(active)}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold",
                tolls ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800",
              )}
            >
              {routeTollLabel(active)}
            </span>
            {eco && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                <Leaf className="h-3.5 w-3.5" /> {eco}
              </span>
            )}
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold dark:bg-white/10">
              Safety {active.safetyScore}/100
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold dark:bg-white/10">
              ETA {new Date(active.etaIso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {routes.length > 1 && (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase text-slate-500">Route options</p>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {routes.map((route) => (
                  <button
                    key={route.id}
                    type="button"
                    onClick={() =>
                      onSelectPreference(route.preference as "fastest" | "shortest" | "safest")
                    }
                    className={cn(
                      "min-w-[8.5rem] shrink-0 rounded-2xl border px-3 py-2 text-left text-xs",
                      active.id === route.id
                        ? "border-sm-primary bg-sm-primary/10"
                        : "border-slate-200 dark:border-white/10",
                    )}
                  >
                    <p className="font-bold">{route.label}</p>
                    <p>{formatDuration(route.durationMin)}</p>
                    <p className="text-slate-500">{route.distanceKm.toFixed(1)} km</p>
                    <p className="text-[10px] text-slate-400">
                      {routeHasTolls(route) ? "Tolls" : "No tolls"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <p className="text-xs font-bold uppercase text-slate-500">Turn-by-turn preview</p>
            <ol className="mt-2 space-y-2">
              {previewSteps.map((step, index) => (
                <li
                  key={`${index}-${step}`}
                  className="flex gap-3 rounded-2xl bg-slate-50 px-3 py-2.5 text-sm dark:bg-white/5"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sm-primary/10 text-xs font-bold text-sm-primary">
                    {index + 1}
                  </span>
                  <span className="flex min-w-0 items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Route className="h-4 w-4 shrink-0 text-sm-primary" />
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {safety.length > 0 && (
            <div className="mt-4 space-y-1.5">
              <p className="inline-flex items-center gap-1 text-xs font-bold uppercase text-amber-700">
                <ShieldAlert className="h-3.5 w-3.5" /> Along your route
              </p>
              {safety.map((w) => (
                <p
                  key={w.id}
                  className="rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-100"
                >
                  {w.label} — {w.message}
                </p>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!active}
              onClick={onPreview}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0D9488] px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
            >
              <FastForward className="h-4 w-4" />
              Preview
            </button>
            <button
              type="button"
              disabled={!active}
              onClick={onStartNavigation}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl bg-sm-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
            >
              <Navigation className="h-4 w-4" />
              {navigating ? "Navigating…" : previewMode ? "Start" : "Navigate"}
            </button>
            <button
              type="button"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-[#1A73E8]/10 px-4 py-3 text-sm font-bold text-[#1A73E8]"
              aria-label="Add stops"
            >
              <Plus className="h-4 w-4" />
              Add stops
            </button>
            <RouteShareButton routeLabel={active.label} disabled={!active} />
          </div>
          <NavigateVoiceControls className="mt-3" />
        </div>
      </div>
    </div>
  );
}
