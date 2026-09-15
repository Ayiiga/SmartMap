"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, Settings, Shield } from "lucide-react";
import { FeatureGate } from "@/components/smart-map/feature-gate";
import { SmartSafetyDashboard } from "@/components/ai40/smart-safety-dashboard";
import { RouteCard } from "@/components/ai40/route-card";
import { PrivacyConsentSheet } from "@/components/ai40/privacy-consent-sheet";
import { useMapStore } from "@/stores/map-store";
import { DEFAULT_CENTER } from "@/lib/map/styles";
import { buildSafetyDashboard } from "@/lib/ai40/safety-dashboard";
import { planAi40Routes } from "@/lib/ai40/route-options";
import { hasConsent } from "@/lib/ai40/privacy";
import type { WeatherSnapshot } from "@/types/smart-map";

export default function SmartSafetyPage() {
  const userLocation = useMapStore((s) => s.userLocation) ?? DEFAULT_CENTER;
  const navDestination = useMapStore((s) => s.navDestination);
  const reports = useMapStore((s) => s.reports);
  const consents = useMapStore((s) => s.privacyConsents);
  const selectedRouteId = useMapStore((s) => s.selectedAi40RouteId);
  const setSelectedRouteId = useMapStore((s) => s.setSelectedAi40RouteId);
  const [weather, setWeather] = useState<WeatherSnapshot | undefined>();
  const [consentOpen, setConsentOpen] = useState(false);

  const destination = useMemo(
    () =>
      navDestination?.coordinates ?? {
        lat: userLocation.lat + 0.04,
        lng: userLocation.lng + 0.03,
      },
    [navDestination?.coordinates, userLocation.lat, userLocation.lng],
  );

  useEffect(() => {
    if (!hasConsent(consents, "weather_providers")) return;
    const params = new URLSearchParams({
      lat: String(userLocation.lat),
      lng: String(userLocation.lng),
    });
    void fetch(`/api/weather?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.weather) setWeather(data.weather);
      })
      .catch(() => undefined);
  }, [userLocation.lat, userLocation.lng, consents]);

  const dashboard = useMemo(
    () =>
      buildSafetyDashboard({
        from: userLocation,
        to: destination,
        weather,
        reports: hasConsent(consents, "community_reports") ? reports : [],
      }),
    [userLocation, destination, weather, reports, consents],
  );

  const routes = useMemo(
    () =>
      planAi40Routes({
        from: userLocation,
        to: destination,
        fromLabel: "Current location",
        toLabel: navDestination?.label ?? "Destination",
        preferences: [
          "fastest",
          "safest",
          "lowest_traffic",
          "lowest_fuel",
          "ev_optimized",
          "night_safe",
          "family_friendly",
        ],
      }),
    [userLocation, destination, navDestination?.label],
  );

  return (
    <FeatureGate
      flag="ai40PredictiveSafety"
      title="Smart Map AI 4.0"
      phase="AI 4.0"
      description="Predictive safety, intelligent route options, and privacy-first travel intelligence."
    >
      <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-sm-emerald">
              Smart Map AI 4.0
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
              Predictive Safety
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              AI-powered hazard detection, intelligent routes, and privacy-first travel intelligence.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConsentOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-sm-border px-3 py-2 text-sm font-semibold dark:border-white/10"
          >
            <Settings className="h-4 w-4" />
            Privacy
          </button>
        </header>

        {!hasConsent(consents, "weather_providers") && (
          <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-500/40 dark:bg-amber-950/30">
            <div className="flex items-center gap-2 font-bold">
              <Shield className="h-4 w-4" />
              Enable weather data for predictive safety
            </div>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              Grant weather provider access to unlock live hazard forecasts.
            </p>
            <button
              type="button"
              onClick={() => setConsentOpen(true)}
              className="mt-2 text-sm font-bold text-sm-primary underline"
            >
              Manage permissions
            </button>
          </div>
        )}

        <div className="mt-6">
          <SmartSafetyDashboard dashboard={dashboard} />
        </div>

        <section className="mt-8">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-sm-primary" />
            <h2 className="font-display text-xl font-bold">Intelligent route options</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Compare safety, traffic, weather risk, and road quality across route types.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {routes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                selected={selectedRouteId === route.id}
                onSelect={() => setSelectedRouteId(route.id)}
              />
            ))}
          </div>
        </section>
      </div>

      <PrivacyConsentSheet open={consentOpen} onClose={() => setConsentOpen(false)} />
    </FeatureGate>
  );
}
