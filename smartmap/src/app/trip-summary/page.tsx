"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FeatureGate } from "@/components/smart-map/feature-gate";
import { formatDuration, loadTripSummary } from "@/lib/navigation";
import type { TripSummaryData } from "@/lib/navigation/types";

function TripSummaryContent() {
  const [summary, setSummary] = useState<TripSummaryData | null>(null);

  useEffect(() => {
    setSummary(loadTripSummary());
  }, []);

  if (!summary) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-extrabold text-sm-primary dark:text-white">
          No trip summary yet
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Complete a Phase 7 navigation session to see distance, time, fuel, and safety alerts.
        </p>
        <Link
          href="/advanced-navigation"
          className="mt-6 inline-flex rounded-2xl bg-sm-primary px-5 py-3 text-sm font-bold text-white"
        >
          Open advanced navigation
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-6 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-sm-emerald">Trip summary</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
        Journey complete
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Completed {new Date(summary.completedAt).toLocaleString()} · Mode {summary.mode}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <dt className="text-xs font-semibold uppercase text-slate-500">Total distance</dt>
          <dd className="mt-1 text-2xl font-extrabold">{summary.totalDistanceKm.toFixed(1)} km</dd>
        </div>
        <div className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <dt className="text-xs font-semibold uppercase text-slate-500">Travel time</dt>
          <dd className="mt-1 text-2xl font-extrabold">{formatDuration(summary.totalDurationMin)}</dd>
        </div>
        <div className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <dt className="text-xs font-semibold uppercase text-slate-500">Average speed</dt>
          <dd className="mt-1 text-2xl font-extrabold">{summary.averageSpeedKmh} km/h</dd>
        </div>
        <div className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <dt className="text-xs font-semibold uppercase text-slate-500">Fuel estimate</dt>
          <dd className="mt-1 text-2xl font-extrabold">
            {summary.fuelLiters != null ? `${summary.fuelLiters} L` : "—"}
          </dd>
        </div>
      </dl>

      <section className="mt-6 rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
        <h2 className="font-bold">Route map (path points)</h2>
        <p className="mt-1 text-xs text-slate-500">{summary.polyline.length} corridor points cached</p>
        <ol className="mt-3 max-h-40 space-y-1 overflow-y-auto text-xs text-slate-600 dark:text-slate-300">
          {summary.polyline.map((p, i) => (
            <li key={`${p.lat}-${p.lng}-${i}`}>
              {i + 1}. {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-4 rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
        <h2 className="font-bold">Stops made</h2>
        {summary.stops.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No intermediate stops</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {summary.stops.map((s) => (
              <li key={s.id}>{s.label}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-4 rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
        <h2 className="font-bold">Safety alerts encountered</h2>
        {summary.warnings.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No alerts on this trip</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {summary.warnings.map((w) => (
              <li key={w.id} className="rounded-2xl bg-amber-50 px-3 py-2 dark:bg-amber-500/10">
                {w.label} · {w.distanceAlongKm} km
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6 flex gap-2">
        <Link
          href="/advanced-navigation"
          className="rounded-2xl bg-sm-primary px-5 py-3 text-sm font-bold text-white"
        >
          New route
        </Link>
        <Link
          href="/"
          className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold dark:bg-white/10"
        >
          Home
        </Link>
      </div>
    </div>
  );
}

export default function TripSummaryPage() {
  return (
    <FeatureGate
      flag="advancedNavigationPhase7"
      title="Trip Summary"
      phase="Phase 7"
      description="Post-navigation summaries unlock with the Phase 7 advanced navigation flag."
    >
      <TripSummaryContent />
    </FeatureGate>
  );
}
