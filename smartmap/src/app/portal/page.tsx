"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, BarChart3, Megaphone, Store } from "lucide-react";
import { FeatureGate } from "@/components/smart-map/feature-gate";
import { SAMPLE_BUSINESSES } from "@/content/smart-map/business-community";

function PortalPageContent() {
  const [claimedId, setClaimedId] = useState<string | null>(null);
  const businesses = useMemo(
    () =>
      SAMPLE_BUSINESSES.map((b) =>
        claimedId === b.id ? { ...b, claimed: true } : b,
      ),
    [claimedId],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-sm-emerald">Business Portal</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
          Claim, verify & grow
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Listings, verification, premium placements, promotions, and customer insights.
        </p>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          { label: "Views", value: businesses.reduce((n, b) => n + b.views, 0), icon: BarChart3 },
          { label: "Calls", value: businesses.reduce((n, b) => n + b.calls, 0), icon: Megaphone },
          { label: "Directions", value: businesses.reduce((n, b) => n + b.directions, 0), icon: Store },
          {
            label: "Verified",
            value: businesses.filter((b) => b.verified).length,
            icon: BadgeCheck,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep"
          >
            <div className="flex items-center justify-between text-sm text-slate-500">
              {label}
              <Icon className="h-4 w-4 text-sm-primary" />
            </div>
            <p className="mt-2 font-display text-2xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>

      <ul className="mt-6 space-y-3">
        {businesses.map((b) => (
          <li
            key={b.id}
            className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold">{b.name}</h2>
                <p className="text-sm text-slate-500">{b.category}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                  {b.claimed && <span className="rounded-full bg-sm-primary/10 px-2 py-1 text-sm-primary">Claimed</span>}
                  {b.verified && <span className="rounded-full bg-sm-emerald/15 px-2 py-1 text-sm-emerald">Verified</span>}
                  {b.premium && <span className="rounded-full bg-sm-safety/20 px-2 py-1 text-amber-700">Premium</span>}
                  {b.sponsored && <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-white/10">Sponsored</span>}
                </div>
              </div>
              {!b.claimed ? (
                <button
                  type="button"
                  onClick={() => setClaimedId(b.id)}
                  className="rounded-2xl bg-sm-primary px-4 py-2 text-sm font-bold text-white"
                >
                  Claim listing
                </button>
              ) : (
                <p className="text-sm font-semibold text-slate-500">
                  ★ {b.rating.toFixed(1)} · {b.views} views
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PortalPage() {
  return (
    <FeatureGate
      flag="businessCommunityPhase5"
      title="Business Portal"
      phase="Phase 5"
      description="Claim listings, verification, premium placements, and analytics are ready behind the Phase 5 flag."
    >
      <PortalPageContent />
    </FeatureGate>
  );
}
