"use client";

import Link from "next/link";
import { Lock, Phone, Share2, Shield, Users } from "lucide-react";
import type { FeaturePhaseLabel } from "@/lib/features/flags";
import { hapticTap } from "@/lib/haptics";

const SAFETY_MINI_CARDS = [
  { icon: Shield, label: "SOS", desc: "One-tap emergency" },
  { icon: Users, label: "Contacts", desc: "Trusted numbers" },
  { icon: Share2, label: "Live Share", desc: "GPS to family" },
] as const;

export function FeatureComingSoon({
  title,
  phase,
  description,
}: {
  title: string;
  phase: FeaturePhaseLabel;
  description: string;
}) {
  const isSafety = title.toLowerCase().includes("safety");

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0A0F1E] px-4 py-16 text-center">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#1E293B] bg-[#141C2F]">
        <Shield className="h-9 w-9 text-[#60A5FA]" aria-hidden />
        <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#141C2F] border border-[#1E293B]">
          <Lock className="h-3.5 w-3.5 text-[#94A3B8]" aria-hidden />
        </span>
      </div>

      <p className="mt-6 rounded-full bg-[#0F2A1F] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#10B981]">
        {phase} · Coming soon
      </p>

      <h1 className="mt-3 font-display text-3xl font-extrabold text-[#F8FAFC]">
        {isSafety ? (
          <>
            Smart{" "}
            <span className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
              Safety
            </span>{" "}
            Center
          </>
        ) : (
          title
        )}
      </h1>

      <p className="mt-3 max-w-md text-sm text-[#94A3B8]">{description}</p>

      {isSafety && (
        <div className="mt-6 grid w-full max-w-sm grid-cols-3 gap-2">
          {SAFETY_MINI_CARDS.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="rounded-2xl border border-[#1E293B] bg-[#141C2F] px-2 py-3"
            >
              <Icon className="mx-auto h-5 w-5 text-[#60A5FA]" aria-hidden />
              <p className="mt-1.5 text-xs font-bold text-[#F8FAFC]">{label}</p>
              <p className="mt-0.5 text-[10px] text-[#64748B]">{desc}</p>
            </div>
          ))}
        </div>
      )}

      {isSafety && (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#64748B]">
          <Phone className="h-3.5 w-3.5" aria-hidden />
          Emergency numbers ready when Phase 2 launches
        </p>
      )}

      <p className="mt-2 text-xs text-[#475569]">
        This feature is implemented but disabled by feature flag until release approval.
      </p>

      <Link
        href="/"
        onClick={() => hapticTap()}
        className="mt-8 inline-flex h-12 w-full max-w-sm items-center justify-center rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#1E5EB8] px-6 text-sm font-bold text-[#F8FAFC] transition-opacity hover:opacity-90"
      >
        Back to Smart Map
      </Link>
    </div>
  );
}
