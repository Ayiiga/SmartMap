"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Bookmark, Compass, MapPin, Sparkles, User } from "lucide-react";
import { nearbyPlaces, getPlaceById } from "@/content/smart-map/places";
import { PHASE1_NEARBY_CATEGORIES } from "@/lib/features/flags";
import {
  useAi40Enabled,
  useAiExpansionEnabled,
  useAdvancedNavigationEnabled,
  usePublicSafetyEnabled,
} from "@/lib/features/use-feature-flag";
import { DEFAULT_CENTER } from "@/lib/map/styles";
import { useMapStore } from "@/stores/map-store";
import { buildSafetyDashboard } from "@/lib/ai40/safety-dashboard";
import { SmartSafetyDashboard } from "@/components/ai40/smart-safety-dashboard";

export default function DashboardPage() {
  const userLocation = useMapStore((s) => s.userLocation) ?? DEFAULT_CENTER;
  const savedPlaceIds = useMapStore((s) => s.savedPlaceIds);
  const reports = useMapStore((s) => s.reports);
  const publicSafety = usePublicSafetyEnabled();
  const aiExpansion = useAiExpansionEnabled();
  const advancedNav = useAdvancedNavigationEnabled();
  const ai40 = useAi40Enabled();

  const nearby = nearbyPlaces(userLocation, "all", 12).filter((p) =>
    publicSafety ? true : (PHASE1_NEARBY_CATEGORIES as readonly string[]).includes(p.category),
  ).slice(0, 5);
  const saved = savedPlaceIds.map(getPlaceById).filter(Boolean);

  const safetyDashboard = useMemo(
    () =>
      ai40
        ? buildSafetyDashboard({
            from: userLocation,
            to: userLocation,
            reports: publicSafety ? reports : [],
          })
        : null,
    [ai40, userLocation, reports, publicSafety],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6">
      <header className="sm-fade-up">
        <p className="text-sm font-semibold uppercase tracking-wide text-sm-emerald">
          {ai40 ? "Smart Map AI 4.0 Dashboard" : "Smart Dashboard"}
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
          {ai40 ? "Travel intelligence hub" : "Your map hub"}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {ai40
            ? "Live safety scores, hazard forecasts, and intelligent route recommendations."
            : "Phase 1 essentials — nearby services, saved places, and account shortcuts."}
        </p>
      </header>

      {ai40 && safetyDashboard && (
        <div className="mt-6">
          <SmartSafetyDashboard dashboard={safetyDashboard} />
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Nearby", value: `${nearby.length}`, icon: Compass, tone: "text-sm-primary" },
          { label: "Saved / Favorites", value: `${savedPlaceIds.length}`, icon: Bookmark, tone: "text-sm-emerald" },
          {
            label: ai40 ? "AI 4.0" : "Profile",
            value: ai40 ? "Open" : "Open",
            icon: ai40 ? Sparkles : User,
            tone: "text-sm-safety",
            href: ai40 ? "/smart-safety" : "/profile",
          },
        ].map(({ label, value, icon: Icon, tone, href }) => {
          const body = (
            <div className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{label}</p>
                <Icon className={`h-5 w-5 ${tone}`} />
              </div>
              <p className="mt-2 font-display text-3xl font-extrabold">{value}</p>
            </div>
          );
          return href ? (
            <Link key={label} href={href}>
              {body}
            </Link>
          ) : (
            <div key={label}>{body}</div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-sm-border bg-white p-5 dark:border-white/10 dark:bg-sm-primary-deep">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <Compass className="h-5 w-5 text-sm-primary" />
            Nearby essentials
          </h2>
          <ul className="mt-4 space-y-3">
            {nearby.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <span className="font-semibold">{p.name}</span>
                <span className="text-slate-500">{p.distanceKm.toFixed(1)} km</span>
              </li>
            ))}
          </ul>
          <Link href="/search" className="mt-4 inline-block text-sm font-bold text-sm-primary">
            Browse all →
          </Link>
        </section>

        <section className="rounded-3xl border border-sm-border bg-white p-5 dark:border-white/10 dark:bg-sm-primary-deep">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <Bookmark className="h-5 w-5 text-sm-emerald" />
            Saved places
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {saved.length > 0 ? (
              saved.map((p) =>
                p ? (
                  <li key={p.id} className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 dark:bg-white/5">
                    <MapPin className="h-3.5 w-3.5 text-sm-primary" />
                    {p.name}
                  </li>
                ) : null,
              )
            ) : (
              <li className="text-slate-500">Save places from Search or the map to build favorites.</li>
            )}
          </ul>
          <Link href="/favorites" className="mt-4 inline-block text-sm font-bold text-sm-primary">
            Manage favorites →
          </Link>
        </section>
      </div>

      {(publicSafety || aiExpansion || advancedNav || ai40) && (
        <p className="mt-6 text-xs text-slate-500">
          Advanced modules enabled:
          {ai40 ? " AI 4.0 Predictive Safety" : ""}
          {publicSafety ? " Public Safety (Phase 2)" : ""}
          {aiExpansion ? " AI & Expansion (Phase 3)" : ""}
          {advancedNav ? " Advanced Navigation (Phase 7)" : ""}
          {ai40 ? (
            <>
              {" "}
              <Link href="/smart-safety" className="font-bold text-sm-primary">
                Open AI 4.0 →
              </Link>
            </>
          ) : advancedNav ? (
            <>
              {" "}
              <Link href="/advanced-navigation" className="font-bold text-sm-primary">
                Open →
              </Link>
            </>
          ) : null}
        </p>
      )}
    </div>
  );
}
