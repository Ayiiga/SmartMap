"use client";

import { Megaphone, Shield, Users } from "lucide-react";
import { FeatureGate } from "@/components/smart-map/feature-gate";
import { SAMPLE_ANNOUNCEMENTS, SAMPLE_GROUPS } from "@/content/smart-map/business-community";

function GroupsPageContent() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 pt-6 sm:px-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-sm-emerald">Community</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
          Local groups & announcements
        </h1>
      </header>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <Users className="h-5 w-5 text-sm-primary" />
          Groups
        </h2>
        <ul className="mt-3 space-y-3">
          {SAMPLE_GROUPS.map((g) => (
            <li
              key={g.id}
              className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sm-primary/10 text-sm-primary">
                  {g.type === "neighborhood_watch" ? (
                    <Shield className="h-5 w-5" />
                  ) : (
                    <Users className="h-5 w-5" />
                  )}
                </span>
                <div>
                  <h3 className="font-bold">{g.name}</h3>
                  <p className="text-sm text-slate-500">
                    {g.area} · {g.members} members · {g.type.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <Megaphone className="h-5 w-5 text-sm-safety" />
          Announcements & events
        </h2>
        <ul className="mt-3 space-y-3">
          {SAMPLE_ANNOUNCEMENTS.map((a) => (
            <li
              key={a.id}
              className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep"
            >
              <p className="text-xs font-semibold uppercase text-sm-emerald">{a.area}</p>
              <h3 className="mt-1 font-bold">{a.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{a.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function GroupsPage() {
  return (
    <FeatureGate
      flag="businessCommunityPhase5"
      title="Community Groups"
      phase="Phase 5"
      description="Neighborhood watch, volunteers, and community announcements are ready behind the Phase 5 flag."
    >
      <GroupsPageContent />
    </FeatureGate>
  );
}
