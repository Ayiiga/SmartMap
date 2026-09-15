"use client";

import Link from "next/link";
import { BadgeCheck, BarChart3, Megaphone, Store } from "lucide-react";
import { FeatureGate } from "@/components/smart-map/feature-gate";

function BusinessPageContent() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 pt-6 sm:px-6">
      <header className="sm-fade-up">
        <p className="text-sm font-semibold uppercase tracking-wide text-sm-emerald">Business Platform</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
          Grow with Smart Map
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Claim your location, verify your listing, advertise to nearby travelers, manage reviews, and unlock
          analytics across Ghana and Africa.
        </p>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          {
            icon: Store,
            title: "Claim locations",
            body: "Take ownership of your pin, hours, photos, and contact details.",
          },
          {
            icon: BadgeCheck,
            title: "Business verification",
            body: "Earn a trusted badge so customers can rely on your listing.",
          },
          {
            icon: Megaphone,
            title: "Advertise & promotions",
            body: "Sponsored placements near search categories that matter.",
          },
          {
            icon: BarChart3,
            title: "Analytics",
            body: "See views, calls, directions, and peak discovery times.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <article
            key={title}
            className="rounded-3xl border border-sm-border bg-white p-5 dark:border-white/10 dark:bg-sm-primary-deep"
          >
            <Icon className="h-6 w-6 text-sm-primary" />
            <h2 className="mt-3 font-display text-xl font-bold">{title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{body}</p>
          </article>
        ))}
      </div>

      <section className="mt-6 rounded-[2rem] bg-gradient-to-br from-sm-primary to-sm-emerald p-6 text-white">
        <h2 className="font-display text-2xl font-extrabold">Monetization paths</h2>
        <ul className="mt-3 grid gap-2 text-sm text-white/90 sm:grid-cols-2">
          <li>• Premium membership</li>
          <li>• Sponsored locations</li>
          <li>• Government & NGO partnerships</li>
          <li>• Tourism promotion</li>
          <li>• Local advertising</li>
          <li>• API access</li>
        </ul>
        <Link
          href="/contact"
          className="mt-5 inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-bold text-sm-primary"
        >
          Talk to partnerships
        </Link>
      </section>
    </div>
  );
}

export default function BusinessPage() {
  return (
    <FeatureGate
      flag="aiExpansionPhase3"
      title="Business Platform"
      phase="Phase 3"
      description="Business listings, verification, and advertising are ready behind the Phase 3 flag."
    >
      <BusinessPageContent />
    </FeatureGate>
  );
}
