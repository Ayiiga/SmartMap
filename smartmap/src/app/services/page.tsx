"use client";

import Link from "next/link";
import { Building2, Landmark, Phone } from "lucide-react";
import { FeatureGate } from "@/components/smart-map/feature-gate";
import { GOVERNMENT_SERVICES } from "@/content/smart-map/government-services";
import {
  FUEL_PRICES,
  NEARBY_PROMOTIONS,
  PARKING_SPOTS,
  recommendStops,
} from "@/content/smart-map/smart-services";
import { TOURISM_PLACES } from "@/content/smart-map/tourism";

function ServicesPageContent() {
  const recommendations = recommendStops("airport to city");

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6">
      <header className="sm-fade-up">
        <p className="text-sm font-semibold uppercase tracking-wide text-sm-emerald">Smart Ecosystem</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
          Public services & smart utilities
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Government offices, fuel/EV/parking insights, tourism, and smart recommendations for Ghana.
        </p>
      </header>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <Landmark className="h-5 w-5 text-sm-primary" />
          Government services
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {GOVERNMENT_SERVICES.map((s) => (
            <li
              key={s.id}
              className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep"
            >
              <p className="text-xs font-semibold uppercase text-sm-emerald">{s.agency}</p>
              <h3 className="mt-1 font-bold">{s.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{s.address}</p>
              {s.phone && (
                <a href={`tel:${s.phone}`} className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-sm-primary">
                  <Phone className="h-3.5 w-3.5" />
                  {s.phone}
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <h2 className="font-display text-lg font-bold">Fuel prices nearby</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {FUEL_PRICES.map((f) => (
              <li key={`${f.stationId}-${f.fuelType}`} className="flex justify-between gap-2">
                <span>
                  {f.stationName} · {f.fuelType}
                </span>
                <span className="font-bold">GHS {f.priceGhs.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <h2 className="font-display text-lg font-bold">Parking availability</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {PARKING_SPOTS.map((p) => (
              <li key={p.id}>
                <p className="font-semibold">{p.name}</p>
                <p className="text-slate-500">
                  {p.available}/{p.capacity} free · GHS {p.feeGhsPerHour}/hr
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <h2 className="font-display text-lg font-bold">Nearby promotions</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {NEARBY_PROMOTIONS.map((p) => (
              <li key={p.id}>
                <p className="font-semibold">{p.title}</p>
                <p className="text-slate-500">
                  {p.business} · {p.distanceKm.toFixed(1)} km
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <Building2 className="h-5 w-5 text-sm-emerald" />
          Tourist attractions & parks
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {TOURISM_PLACES.map((p) => (
            <li
              key={p.id}
              className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep"
            >
              <h3 className="font-bold">{p.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{p.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-3xl bg-gradient-to-br from-sm-primary to-sm-emerald p-5 text-white">
        <h2 className="font-display text-xl font-bold">Smart recommendations</h2>
        <ul className="mt-3 space-y-1 text-sm text-white/90">
          {recommendations.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/transport" className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-sm-primary">
            Public transport
          </Link>
          <Link href="/trips" className="rounded-2xl bg-white/15 px-4 py-2 text-sm font-bold">
            Trip planner
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <FeatureGate
      flag="smartServicesPhase4"
      title="Smart Public Services"
      phase="Phase 4"
      description="Government services, utilities, tourism, and smart recommendations are ready behind the Phase 4 flag."
    >
      <ServicesPageContent />
    </FeatureGate>
  );
}
