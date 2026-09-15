"use client";

import Link from "next/link";
import { Lock, Shield } from "lucide-react";
import { BRAND } from "@/lib/brand";
import type { FeaturePhaseLabel } from "@/lib/features/flags";
import { hapticTap } from "@/lib/haptics";

export function FeatureComingSoon({
  title,
  phase,
  description,
}: {
  title: string;
  phase: FeaturePhaseLabel;
  description: string;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0A0F1E] px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1E293B] bg-[#141C2F]">
        <Shield className="h-8 w-8 text-[#60A5FA]" aria-hidden />
      </div>
      <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#60A5FA]">
        <Lock className="h-3.5 w-3.5" aria-hidden />
        {phase} · Coming soon
      </p>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-white">{title}</h1>
      <p className="mt-3 max-w-md text-sm text-[#94A3B8]">{description}</p>
      <p className="mt-2 text-xs text-[#94A3B8]/70">
        This feature is implemented but disabled by feature flag until release approval.
      </p>
      <Link
        href="/"
        onClick={() => hapticTap()}
        className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#1E5EB8] px-6 text-sm font-bold text-white transition-opacity hover:opacity-90"
      >
        Back to {BRAND.name}
      </Link>
    </div>
  );
}
