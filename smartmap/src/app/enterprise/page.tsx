"use client";

import Link from "next/link";
import { Building2, Globe2, HeartHandshake, LineChart } from "lucide-react";
import { FeatureGate } from "@/components/smart-map/feature-gate";

function EnterprisePageContent() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-sm-emerald">Enterprise Platform</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
          Government, NGO & disaster response
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Dashboards for agencies, NGOs, analytics, monitoring, backups, and disaster recovery planning.
        </p>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          {
            icon: Building2,
            title: "Government dashboards",
            body: "Country operations, verification queues, and public-service coverage.",
            href: "/countries",
          },
          {
            icon: HeartHandshake,
            title: "NGO management portal",
            body: "Coordinate safety volunteers, announcements, and field response zones.",
            href: "/groups",
          },
          {
            icon: LineChart,
            title: "Analytics & heat maps",
            body: "Incident density, predictive traffic signals, and hazard detection feeds.",
            href: "/command-center",
          },
          {
            icon: Globe2,
            title: "Multi-region readiness",
            body: "CDN, offline sync, monitoring, logging, and automatic backup postures.",
            href: "/countries",
          },
        ].map(({ icon: Icon, title, body, href }) => (
          <Link
            key={title}
            href={href}
            className="rounded-3xl border border-sm-border bg-white p-5 dark:border-white/10 dark:bg-sm-primary-deep"
          >
            <Icon className="h-6 w-6 text-sm-primary" />
            <h2 className="mt-3 font-display text-xl font-bold">{title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function EnterprisePage() {
  return (
    <FeatureGate
      flag="africaExpansionPhase6"
      title="Enterprise Platform"
      phase="Phase 6"
      description="Government, NGO, disaster response, and analytics platforms are ready behind the Phase 6 flag."
    >
      <EnterprisePageContent />
    </FeatureGate>
  );
}
