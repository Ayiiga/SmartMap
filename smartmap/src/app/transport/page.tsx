"use client";

import { Bus, Plane, Ship, Train } from "lucide-react";
import { FeatureGate } from "@/components/smart-map/feature-gate";
import { TRANSPORT_HUBS } from "@/content/smart-map/transport";

const ICONS = {
  bus_terminal: Bus,
  taxi_rank: Bus,
  trotro: Bus,
  airport: Plane,
  railway: Train,
  ferry: Ship,
} as const;

function TransportPageContent() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 pt-6 sm:px-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-sm-emerald">Public Transport</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
          Terminals, ranks & stations
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Bus terminals, taxi ranks, tro-tro stations, airports, railway, and ferry hubs.
        </p>
      </header>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {TRANSPORT_HUBS.map((hub) => {
          const Icon = ICONS[hub.transportKind];
          return (
            <li
              key={hub.id}
              className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sm-primary/10 text-sm-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    {hub.transportKind.replace("_", " ")}
                  </p>
                  <h2 className="font-bold">{hub.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{hub.address}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function TransportPage() {
  return (
    <FeatureGate
      flag="smartServicesPhase4"
      title="Public Transport"
      phase="Phase 4"
      description="Bus, taxi, tro-tro, airport, rail, and ferry hubs are ready behind the Phase 4 flag."
    >
      <TransportPageContent />
    </FeatureGate>
  );
}
