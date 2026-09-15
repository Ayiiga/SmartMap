"use client";

import { Clock, Fuel, Shield, TrafficCone, CloudRain, Route } from "lucide-react";
import type { Ai40RoutePlan } from "@/lib/ai40/types";
import { formatDuration } from "@/lib/ai40/route-options";
import { cn } from "@/lib/utils";

interface RouteCardProps {
  route: Ai40RoutePlan;
  selected?: boolean;
  onSelect?: () => void;
}

function ScoreBar({ label, value, icon: Icon, tone }: {
  label: string;
  value: number;
  icon: typeof Shield;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className={cn("h-3.5 w-3.5", tone)} />
      <span className="w-16 text-slate-500">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-white/10">
        <div
          className={cn("h-full rounded-full transition-all", tone.replace("text-", "bg-"))}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-right font-semibold">{value}</span>
    </div>
  );
}

export function RouteCard({ route, selected, onSelect }: RouteCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border p-4 text-left transition-all",
        selected
          ? "border-sm-primary bg-sm-primary/5 shadow-md ring-2 ring-sm-primary/30 dark:bg-sm-primary/10"
          : "border-sm-border bg-white hover:border-sm-primary/40 dark:border-white/10 dark:bg-sm-primary-deep",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-base font-bold">{route.label}</p>
          <p className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Route className="h-3 w-3" />
              {route.distanceKm.toFixed(1)} km
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(route.durationMin)}
            </span>
            {route.fuelLiters != null && route.fuelLiters > 0 && (
              <span className="inline-flex items-center gap-1">
                <Fuel className="h-3 w-3" />
                {route.fuelLiters} L
              </span>
            )}
          </p>
        </div>
        <div className="rounded-xl bg-sm-emerald/10 px-2.5 py-1 text-center">
          <p className="text-[10px] font-semibold uppercase text-sm-emerald">Safety</p>
          <p className="font-display text-lg font-extrabold text-sm-emerald">{route.scores.safety}</p>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <ScoreBar label="Traffic" value={route.scores.traffic} icon={TrafficCone} tone="text-amber-500" />
        <ScoreBar label="Weather" value={100 - route.scores.weatherRisk} icon={CloudRain} tone="text-sky-500" />
        <ScoreBar label="Road" value={route.scores.roadQuality} icon={Shield} tone="text-sm-primary" />
      </div>

      {route.warnings.length > 0 && (
        <p className="mt-2 truncate text-xs text-amber-600 dark:text-amber-400">
          ⚠ {route.warnings[0]}
        </p>
      )}
    </button>
  );
}
