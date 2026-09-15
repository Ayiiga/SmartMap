"use client";

import { Activity, Siren, TriangleAlert } from "lucide-react";
import { FeatureGate } from "@/components/smart-map/feature-gate";
import {
  SAMPLE_INCIDENTS,
  computeSafetyScore,
  optimizeRouteHint,
} from "@/content/smart-map/africa-enterprise";

function CommandCenterPageContent() {
  const score = computeSafetyScore(SAMPLE_INCIDENTS);
  const hint = optimizeRouteHint("Airport City", "Legon");

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-sm-danger">Emergency Command</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
          Incident monitoring
        </h1>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <p className="text-sm text-slate-500">City safety score</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-sm-emerald">{score}</p>
        </div>
        <div className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <p className="text-sm text-slate-500">Open incidents</p>
          <p className="mt-1 font-display text-3xl font-extrabold">
            {SAMPLE_INCIDENTS.filter((i) => i.status !== "resolved").length}
          </p>
        </div>
        <div className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <p className="text-sm text-slate-500">Heat map focus</p>
          <p className="mt-1 font-display text-lg font-bold">Spintex · Circle · Nima</p>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {SAMPLE_INCIDENTS.map((inc) => (
          <li
            key={inc.id}
            className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep"
          >
            <div className="flex items-start gap-3">
              {inc.severity === "high" || inc.severity === "critical" ? (
                <Siren className="h-5 w-5 text-sm-danger" />
              ) : (
                <TriangleAlert className="h-5 w-5 text-sm-safety" />
              )}
              <div>
                <h2 className="font-bold">{inc.title}</h2>
                <p className="text-sm text-slate-500">
                  {inc.severity} · {inc.status} · {inc.lat.toFixed(3)}, {inc.lng.toFixed(3)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <section className="mt-6 rounded-3xl bg-gradient-to-br from-sm-primary to-sm-emerald p-5 text-white">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <Activity className="h-5 w-5" />
          AI route optimization
        </h2>
        <p className="mt-2 text-sm text-white/90">{hint}</p>
      </section>
    </div>
  );
}

export default function CommandCenterPage() {
  return (
    <FeatureGate
      flag="africaExpansionPhase6"
      title="Emergency Command Center"
      phase="Phase 6"
      description="Incident monitoring, heat maps, and AI route optimization are ready behind the Phase 6 flag."
    >
      <CommandCenterPageContent />
    </FeatureGate>
  );
}
