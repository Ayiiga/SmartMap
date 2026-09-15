"use client";

import { FeatureGate } from "@/components/smart-map/feature-gate";
import { ACCRA_WEATHER, weatherAdvice } from "@/content/smart-map/weather";
import { CloudRain, Droplets, SunMedium, Thermometer, Wind } from "lucide-react";

function WeatherPageContent() {
  const w = ACCRA_WEATHER;
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6">
      <header className="sm-fade-up">
        <p className="text-sm font-semibold uppercase tracking-wide text-sm-safety">Weather & Environment</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
          Accra live conditions
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{weatherAdvice(w)}</p>
      </header>

      <section className="mt-6 rounded-[2rem] bg-gradient-to-br from-sm-primary to-sm-emerald p-6 text-white shadow-xl">
        <p className="text-sm font-semibold opacity-90">{w.condition}</p>
        <p className="mt-2 font-display text-6xl font-extrabold">{w.tempC}°</p>
        <p className="mt-2 text-sm text-white/85">
          Flood risk: {w.floodRisk} · Heat alert: {w.heatAlert ? "Yes" : "No"}
        </p>
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[
          { label: "Rain chance", value: `${w.rainChance}%`, icon: CloudRain },
          { label: "Humidity", value: `${w.humidity}%`, icon: Droplets },
          { label: "Wind", value: `${w.windKph} km/h`, icon: Wind },
          { label: "UV index", value: `${w.uvIndex}`, icon: SunMedium },
          { label: "Air quality", value: `AQI ${w.aqi}`, icon: Thermometer },
          {
            label: "Flood warnings",
            value: w.floodRisk === "low" ? "None" : "Monitor underpasses",
            icon: CloudRain,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep"
          >
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Icon className="h-4 w-4 text-sm-primary" />
              {label}
            </div>
            <p className="mt-2 font-display text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WeatherPage() {
  return (
    <FeatureGate
      flag="publicSafetyPhase2"
      title="Weather & Environment Alerts"
      phase="Phase 2"
      description="Weather, flood, and environment alerts are ready behind the Phase 2 flag."
    >
      <WeatherPageContent />
    </FeatureGate>
  );
}
