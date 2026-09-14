"use client";

import Link from "next/link";
import { MapPin, RefreshCw, WifiOff } from "lucide-react";
import { hapticTap } from "@/lib/haptics";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0A0F1E] px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#141C2F] border border-[#1E293B]">
        <WifiOff className="h-10 w-10 text-[#60A5FA]" aria-hidden />
      </div>
      <h1 className="mt-6 font-display text-2xl font-extrabold text-white">
        You&apos;re offline
      </h1>
      <p className="mt-3 max-w-sm text-sm text-[#94A3B8]">
        Smart Map saved your last map view and nearby places. Reconnect to get live routing and
        worldwide search.
      </p>
      <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={() => {
            hapticTap();
            window.location.reload();
          }}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#1E5EB8] text-sm font-bold text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/"
          onClick={() => hapticTap()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#1E293B] bg-[#141C2F] text-sm font-bold text-white"
        >
          <MapPin className="h-4 w-4" />
          Open cached map
        </Link>
      </div>
    </div>
  );
}
