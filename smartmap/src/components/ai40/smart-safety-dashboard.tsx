"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Bot,
  CloudRain,
  Map,
  Shield,
  TrafficCone,
  Wind,
} from "lucide-react";
import type { SafetyDashboardSnapshot } from "@/lib/ai40/types";
import { PredictiveAlertBanner } from "@/components/ai40/predictive-alert-banner";
import { cn } from "@/lib/utils";

interface SmartSafetyDashboardProps {
  dashboard: SafetyDashboardSnapshot;
}

function RiskBadge({ level }: { level: string }) {
  const tones: Record<string, string> = {
    low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    moderate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    severe: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold capitalize", tones[level] ?? tones.moderate)}>
      {level}
    </span>
  );
}

export function SmartSafetyDashboard({ dashboard }: SmartSafetyDashboardProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Safety Score</p>
            <Shield className="h-4 w-4 text-sm-emerald" />
          </div>
          <p className="mt-1 font-display text-3xl font-extrabold text-sm-emerald">
            {dashboard.safetyScore}
          </p>
        </div>

        <div className="rounded-2xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Weather Risk</p>
            <CloudRain className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2">
            <RiskBadge level={dashboard.weatherRisk} />
          </div>
        </div>

        <div className="rounded-2xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Traffic Risk</p>
            <TrafficCone className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <RiskBadge level={dashboard.trafficRisk} />
          </div>
        </div>

        <div className="rounded-2xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Air Quality</p>
            <Wind className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-1 font-display text-3xl font-extrabold">{dashboard.airQuality}</p>
          <p className="text-xs text-slate-500">AQI index</p>
        </div>
      </div>

      <div className="rounded-2xl border border-sm-border bg-gradient-to-br from-sm-primary/5 to-sm-emerald/5 p-5 dark:border-white/10 dark:from-sm-primary/10 dark:to-sm-emerald/10">
        <div className="flex items-start gap-3">
          <Bot className="mt-0.5 h-5 w-5 text-sm-primary" />
          <div>
            <p className="font-display font-bold">AI Travel Summary</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{dashboard.aiSummary}</p>
            <p className="mt-2 text-sm font-semibold text-sm-primary">{dashboard.travelRecommendation}</p>
          </div>
        </div>
      </div>

      {dashboard.predictiveRisks.length > 0 && (
        <PredictiveAlertBanner risks={dashboard.predictiveRisks} />
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <div>
            <p className="text-2xl font-bold">{dashboard.activeHazards}</p>
            <p className="text-xs text-slate-500">Active hazards</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <Map className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-2xl font-bold">{dashboard.roadClosures}</p>
            <p className="text-xs text-slate-500">Road closures</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <Activity className="h-5 w-5 text-sm-primary" />
          <div>
            <p className="text-xs text-slate-500">Updated</p>
            <p className="text-sm font-semibold">
              {new Date(dashboard.updatedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/navigate"
          className="inline-flex items-center gap-2 rounded-xl bg-sm-primary px-4 py-2.5 text-sm font-bold text-white"
        >
          Plan intelligent route
        </Link>
        <Link
          href="/safety"
          className="inline-flex items-center gap-2 rounded-xl border border-sm-border px-4 py-2.5 text-sm font-bold dark:border-white/10"
        >
          Emergency features
        </Link>
      </div>

      <p className="text-xs text-slate-400">
        AI forecasts are estimates. Always follow official emergency alerts from government sources.
      </p>
    </div>
  );
}
