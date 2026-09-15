"use client";

import Link from "next/link";
import { FeatureGate } from "@/components/smart-map/feature-gate";

function AdvertisePageContent() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-sm-primary dark:text-white">Advertise</h1>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
        Reach travelers and local customers with sponsored locations, category placements, and tourism
        promotions on Smart Map.
      </p>
      <Link href="/business" className="mt-5 inline-block font-bold text-sm-primary">
        Open Business Platform →
      </Link>
    </div>
  );
}

export default function AdvertisePage() {
  return (
    <FeatureGate
      flag="aiExpansionPhase3"
      title="Advertise on Smart Map"
      phase="Phase 3"
      description="Sponsored placements and tourism promotions are ready behind the Phase 3 flag."
    >
      <AdvertisePageContent />
    </FeatureGate>
  );
}
