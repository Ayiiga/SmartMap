"use client";

import Link from "next/link";
import { Bookmark, Mail, Map, Shield, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMapStore } from "@/stores/map-store";
import { getPlaceById } from "@/content/smart-map/places";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { usePublicSafetyEnabled } from "@/lib/features/use-feature-flag";
import { hapticTap } from "@/lib/haptics";
import { Skeleton } from "@/components/ui/skeleton";

const BENEFITS = [
  { icon: Map, text: "Offline maps" },
  { icon: Shield, text: "Safety Center" },
  { icon: Bookmark, text: "Sync across devices" },
] as const;

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const savedPlaceIds = useMapStore((s) => s.savedPlaceIds);
  const emergencyContacts = useMapStore((s) => s.emergencyContacts);
  const bloodGroup = useMapStore((s) => s.bloodGroup);
  const womenSafetyMode = useMapStore((s) => s.womenSafetyMode);
  const publicSafety = usePublicSafetyEnabled();
  const saved = savedPlaceIds.map(getPlaceById).filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0F1E] px-4 pb-10 pt-8">
        <div className="mx-auto max-w-md space-y-4" aria-busy="true" aria-label="Loading profile">
          <Skeleton className="mx-auto h-12 w-12 rounded-full bg-[#1E293B]" />
          <Skeleton className="mx-auto h-8 w-48 bg-[#1E293B]" />
          <Skeleton className="h-12 w-full bg-[#1E293B]" />
          <Skeleton className="h-11 w-full bg-[#1E293B]" />
          <Skeleton className="h-11 w-full bg-[#1E293B]" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0F1E] px-4 pb-28 pt-10">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#141C2F] border border-[#1E293B]">
            <User className="h-7 w-7 text-[#60A5FA]" aria-hidden />
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-white">
            Your Smart Map profile
          </h1>
          <p className="mt-2 text-sm text-[#94A3B8]">
            Sign in to sync places, safety settings, and offline maps across your devices.
          </p>

          <ul className="mt-6 space-y-3 text-left">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-2xl border border-[#1E293B] bg-[#141C2F] px-4 py-3"
              >
                <Icon className="h-5 w-5 shrink-0 text-[#60A5FA]" aria-hidden />
                <span className="text-sm font-semibold text-white">{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-3">
            <GoogleSignInButton
              label="Continue with Google"
              className="[&_button]:sm-btn-primary [&_button]:border-0 [&_button]:bg-gradient-to-r [&_button]:from-[#3B82F6] [&_button]:to-[#1E5EB8] [&_button]:text-white"
            />
            <Link
              href="/login"
              onClick={() => hapticTap()}
              className="sm-btn-secondary w-full gap-2"
              aria-label="Continue with Apple"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continue with Apple
            </Link>
            <Link
              href="/login"
              onClick={() => hapticTap()}
              className="sm-btn-secondary w-full gap-2"
              aria-label="Continue with Email"
            >
              <Mail className="h-5 w-5" aria-hidden />
              Continue with Email
            </Link>
          </div>

          <Link
            href="/"
            onClick={() => hapticTap()}
            className="mt-5 inline-block text-sm font-bold text-[#60A5FA] transition-colors hover:text-white"
          >
            Continue as guest →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0A0F1E] px-4 pb-28 pt-6 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#60A5FA]">Profile</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-white">
          {user?.user_metadata?.full_name ?? user?.email ?? "Smart Map member"}
        </h1>
        <p className="mt-2 text-sm text-[#94A3B8]">
          Saved places, emergency contacts, and privacy-aware safety preferences.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <section className="rounded-3xl border border-[#1E293B] bg-[#141C2F] p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <Bookmark className="h-5 w-5 text-[#60A5FA]" aria-hidden />
              Saved places
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {saved.length > 0 ? (
                saved.map((p) =>
                  p ? (
                    <li key={p.id} className="rounded-2xl bg-[#0A0F1E] px-3 py-2 text-white">
                      {p.name}
                    </li>
                  ) : null,
                )
              ) : (
                <li className="text-[#94A3B8]">No saved places yet.</li>
              )}
            </ul>
          </section>

          <section className="rounded-3xl border border-[#1E293B] bg-[#141C2F] p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <Shield className="h-5 w-5 text-sm-danger" aria-hidden />
              Safety profile
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-[#94A3B8]">
              <li>Blood group: {bloodGroup || "Not set"}</li>
              <li>Emergency contacts: {emergencyContacts.length}</li>
              <li>Women Safety Mode: {womenSafetyMode ? "On" : "Off"}</li>
            </ul>
            {publicSafety ? (
              <Link
                href="/safety"
                onClick={() => hapticTap()}
                className="mt-4 inline-block text-sm font-bold text-[#60A5FA]"
              >
                Open Safety Center →
              </Link>
            ) : (
              <p className="mt-4 text-xs text-[#94A3B8]">Safety Center — coming in Phase 2</p>
            )}
          </section>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/settings"
            onClick={() => hapticTap()}
            className="sm-btn-primary px-4"
          >
            Privacy settings
          </Link>
          <Link
            href="/dashboard"
            onClick={() => hapticTap()}
            className="sm-btn-secondary px-4"
          >
            Open dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
