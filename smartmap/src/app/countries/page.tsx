"use client";

import { FeatureGate } from "@/components/smart-map/feature-gate";
import { buildAfricaExpansionCatalog } from "@/content/smart-map/africa-enterprise";

function CountriesPageContent() {
  const countries = buildAfricaExpansionCatalog();
  const live = countries.filter((c) => c.status === "live").length;
  const pilot = countries.filter((c) => c.status === "pilot").length;
  const planned = countries.filter((c) => c.status === "planned").length;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-sm-emerald">Africa Expansion</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
          54-country readiness
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Emergency numbers, languages, public services, currencies, and regional map layers.
        </p>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ["Live", live],
          ["Pilot", pilot],
          ["Planned", planned],
        ].map(([label, value]) => (
          <div
            key={label as string}
            className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep"
          >
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 font-display text-3xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>

      <ul className="mt-6 max-h-[28rem] space-y-2 overflow-y-auto">
        {countries.map((c) => (
          <li
            key={c.code}
            className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-sm-border bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-sm-primary-deep"
          >
            <span className="font-semibold">
              {c.flag} {c.name} · {c.currency}
            </span>
            <span className="text-xs font-bold uppercase text-slate-500">{c.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CountriesPage() {
  return (
    <FeatureGate
      flag="africaExpansionPhase6"
      title="Multi-country Architecture"
      phase="Phase 6"
      description="Infrastructure for all 54 African countries is ready behind the Phase 6 flag."
    >
      <CountriesPageContent />
    </FeatureGate>
  );
}
