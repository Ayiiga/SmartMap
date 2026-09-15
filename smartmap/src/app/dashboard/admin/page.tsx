"use client";

import { FeatureGate } from "@/components/smart-map/feature-gate";
import { AFRICA_COUNTRY_CODES, COUNTRIES } from "@/content/smart-map/countries";
import { PLACES } from "@/content/smart-map/places";
import { useMapStore } from "@/stores/map-store";

function AdminDashboardPageContent() {
  const reports = useMapStore((s) => s.reports);
  const verifiedPlaces = PLACES.filter((p) => p.verified).length;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-sm-primary">Admin Dashboard</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold">Operate Smart Map</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Manage users, places, reports, analytics, heat maps, notifications, countries, and verification requests.
        </p>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Places", PLACES.length],
          ["Verified", verifiedPlaces],
          ["Reports", reports.length],
          ["Countries ready", COUNTRIES.length + AFRICA_COUNTRY_CODES.length],
        ].map(([label, value]) => (
          <div
            key={label as string}
            className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep"
          >
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 font-display text-3xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-sm-border bg-white p-5 dark:border-white/10 dark:bg-sm-primary-deep">
          <h2 className="font-display text-xl font-bold">Verification queue</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {PLACES.filter((p) => !p.verified).slice(0, 6).map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 dark:bg-white/5">
                <span>{p.name}</span>
                <span className="font-semibold text-sm-safety">Review</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-sm-border bg-white p-5 dark:border-white/10 dark:bg-sm-primary-deep">
          <h2 className="font-display text-xl font-bold">Country management</h2>
          <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto text-sm">
            {COUNTRIES.filter((c) => c.code !== "GH-EXPAND").map((c) => (
              <li key={c.code} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 dark:bg-white/5">
                <span>
                  {c.flag} {c.name}
                </span>
                <span className="font-semibold text-sm-emerald">Live profile</span>
              </li>
            ))}
            {AFRICA_COUNTRY_CODES.slice(0, 12).map((c) => (
              <li key={c.code} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 dark:bg-white/5">
                <span>
                  {c.flag} {c.name}
                </span>
                <span className="text-slate-500">Expansion ready</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-sm-border bg-white p-5 dark:border-white/10 dark:bg-sm-primary-deep">
        <h2 className="font-display text-xl font-bold">Heat map insights</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Highest report density currently clusters around Circle, Spintex, and Nima corridors. Push flood and traffic notifications to users within 3 km of verified incidents.
        </p>
      </section>
    </div>
  );
}


export default function AdminDashboardPage() {
  return (
    <FeatureGate
      flag="aiExpansionPhase3"
      title="Admin Dashboard"
      phase="Phase 3"
      description="Admin analytics, country management, and verification queues are ready behind the Phase 3 flag."
    >
      <AdminDashboardPageContent />
    </FeatureGate>
  );
}
