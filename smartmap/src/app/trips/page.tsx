"use client";

import { useState } from "react";
import { Clock3, Route, Star } from "lucide-react";
import { FeatureGate } from "@/components/smart-map/feature-gate";
import { SAMPLE_ROUTE_HISTORY, SAMPLE_TRIPS, type TripPlan } from "@/content/smart-map/trips";
import { sanitizeText } from "@/lib/security/validate";

function TripsPageContent() {
  const [trips, setTrips] = useState<TripPlan[]>(SAMPLE_TRIPS);
  const [name, setName] = useState("");
  const [stops, setStops] = useState("");

  function addTrip() {
    const cleanName = sanitizeText(name, 80);
    const stopList = stops
      .split(",")
      .map((s) => sanitizeText(s, 80))
      .filter(Boolean);
    if (!cleanName || stopList.length < 2) return;
    setTrips((prev) => [
      {
        id: crypto.randomUUID(),
        name: cleanName,
        stops: stopList,
        mode: "driving",
        createdAt: new Date().toISOString(),
        favorite: false,
      },
      ...prev,
    ]);
    setName("");
    setStops("");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 pt-6 sm:px-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-sm-emerald">Trip Planner</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
          Plan, save & review routes
        </h1>
      </header>

      <section className="mt-6 rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
        <h2 className="font-bold">Create a trip</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Trip name"
            className="rounded-2xl border border-sm-border bg-transparent px-4 py-3 outline-none dark:border-white/15"
          />
          <input
            value={stops}
            onChange={(e) => setStops(e.target.value)}
            placeholder="Stops separated by commas"
            className="rounded-2xl border border-sm-border bg-transparent px-4 py-3 outline-none dark:border-white/15"
          />
          <button
            type="button"
            onClick={addTrip}
            className="rounded-2xl bg-sm-primary px-4 py-3 text-sm font-bold text-white"
          >
            Save
          </button>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <Route className="h-5 w-5 text-sm-primary" />
          Your trips
        </h2>
        <ul className="mt-3 space-y-3">
          {trips.map((trip) => (
            <li
              key={trip.id}
              className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{trip.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{trip.stops.join(" → ")}</p>
                  <p className="mt-1 text-xs uppercase text-slate-400">{trip.mode}</p>
                </div>
                {trip.favorite && <Star className="h-4 w-4 fill-sm-safety text-sm-safety" />}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <Clock3 className="h-5 w-5 text-sm-emerald" />
          Route history
        </h2>
        <ul className="mt-3 space-y-2 text-sm">
          {SAMPLE_ROUTE_HISTORY.map((h) => (
            <li
              key={h.id}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 dark:bg-white/5"
            >
              <span>
                {h.from} → {h.to}
              </span>
              <span className="text-slate-500">
                {h.distanceKm} km · {h.durationMin} min
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function TripsPage() {
  return (
    <FeatureGate
      flag="smartServicesPhase4"
      title="Trip Planner"
      phase="Phase 4"
      description="Trip planning, favorite routes, and route history are ready behind the Phase 4 flag."
    >
      <TripsPageContent />
    </FeatureGate>
  );
}
